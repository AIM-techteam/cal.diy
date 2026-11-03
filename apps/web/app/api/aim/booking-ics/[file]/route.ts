/**
 * AIM: one booking as an iCalendar file, at /api/aim/booking-ics/<booking uid>.ics
 *
 * WHY THIS EXISTS: Keap's reminder emails have "Add to Apple Calendar" and "Mobile and other
 * calendars" buttons, and those need a URL that returns a .ics file. Stock cal.diy has none:
 * the booking page builds its iCal download in the visitor's browser as a data: URI
 * (packages/features/bookings/lib/getCalendarLinks.ts), which an email cannot link to. Until
 * 2026-11-03 LDS served the file from its own domain; Erandi did not want prospects handed an
 * LDS address, so cal serves it (LDS writes this URL into Keap fields 82/84).
 *
 * PUBLIC BY NECESSITY: the prospect opens it from an email with no session. It is addressed by
 * the booking uid, the same unguessable id that already opens the public booking page
 * /booking/<uid>, and it returns less than that page does (no attendee details).
 *
 * Behaviour, mirroring LDS AppointmentIcsController so the switch changes nothing for a lead:
 * - UID = the FIRST uid of the reschedule chain, so importing the file again after a reschedule
 *   updates the existing calendar entry instead of adding a second one.
 * - A link to a booking that was later rescheduled follows the chain forward and serves the
 *   newest booking: an email sent before the reschedule still adds the right time.
 * - A cancelled booking is served with METHOD:CANCEL, which tells the client to remove it.
 * - Title "Annuity Evaluation with <advisor>" for the main event type, cal's title otherwise.
 */
import prisma from "@calcom/prisma";
import { BookingStatus } from "@calcom/prisma/enums";
import type { Params } from "app/_types";
import { defaultResponderForAppDir } from "app/api/defaultResponderForAppDir";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const MAIN_EVENT_SLUG = "annuity-evaluation";
// A reschedule chain longer than this is not a real prospect; stop instead of looping.
const MAX_CHAIN = 20;
const UID_PATTERN = /^[A-Za-z0-9_-]{1,64}$/;

const bookingSelect = {
  uid: true,
  title: true,
  startTime: true,
  endTime: true,
  status: true,
  rescheduled: true,
  fromReschedule: true,
  location: true,
  metadata: true,
  user: { select: { name: true } },
  eventType: { select: { slug: true } },
} as const;

type IcsBooking = NonNullable<Awaited<ReturnType<typeof findByUid>>>;

function findByUid(uid: string) {
  return prisma.booking.findUnique({ where: { uid }, select: bookingSelect });
}

function notFound() {
  return new NextResponse("Not found", { status: 404, headers: { "Cache-Control": "no-store" } });
}

/** RFC 5545 §3.3.11: escape backslash, semicolon, comma; a newline becomes a literal \n. */
function escapeText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

function icsDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

/** The joinable meeting link: cal stores it in metadata.videoCallUrl; `location` may be an app id. */
function meetingUrl(booking: IcsBooking): string {
  const metadata = (booking.metadata ?? {}) as Record<string, unknown>;
  const candidates = [metadata.videoCallUrl, booking.location];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && /^https?:\/\//.test(candidate)) return candidate;
  }
  return "";
}

async function getHandler(_req: NextRequest, { params }: { params: Promise<Params> }) {
  const raw = (await params).file;
  const file = Array.isArray(raw) ? raw[0] : raw;
  const uid = typeof file === "string" ? file.replace(/\.ics$/, "") : "";
  if (!UID_PATTERN.test(uid)) return notFound();

  let booking = await findByUid(uid);
  if (!booking) return notFound();

  // Walk back to the first booking of the chain for a stable UID.
  let rootUid = booking.uid;
  let previous = booking.fromReschedule;
  for (let i = 0; previous && i < MAX_CHAIN; i++) {
    rootUid = previous;
    const prior = await prisma.booking.findUnique({ where: { uid: previous }, select: { fromReschedule: true } });
    previous = prior?.fromReschedule ?? null;
  }

  // Walk forward when this booking was moved: the newest booking holds the real time.
  for (let i = 0; booking.rescheduled && i < MAX_CHAIN; i++) {
    const next = await prisma.booking.findFirst({
      where: { fromReschedule: booking.uid },
      orderBy: { createdAt: "desc" },
      select: bookingSelect,
    });
    if (!next) break;
    booking = next;
  }

  const cancelled = booking.status === BookingStatus.CANCELLED || booking.status === BookingStatus.REJECTED;
  const advisor = booking.user?.name?.trim();
  const summary =
    booking.eventType?.slug === MAIN_EVENT_SLUG && advisor ? `Annuity Evaluation with ${advisor}` : booking.title;
  const url = meetingUrl(booking);

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Annuity Gator//cal.annuitygator.com//EN",
    "CALSCALE:GREGORIAN",
    `METHOD:${cancelled ? "CANCEL" : "PUBLISH"}`,
    "BEGIN:VEVENT",
    `UID:${escapeText(rootUid)}`,
    `DTSTAMP:${icsDate(new Date())}`,
    `DTSTART:${icsDate(booking.startTime)}`,
    `DTEND:${icsDate(booking.endTime)}`,
    `SUMMARY:${escapeText(summary)}`,
    `DESCRIPTION:${escapeText(url)}`,
    `LOCATION:${escapeText(url)}`,
    `STATUS:${cancelled ? "CANCELLED" : "CONFIRMED"}`,
    `SEQUENCE:${cancelled ? 1 : 0}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  // RFC 5545 requires CRLF line endings; some clients reject bare \n.
  return new NextResponse(`${lines.join("\r\n")}\r\n`, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'attachment; filename="annuity-evaluation.ics"',
      // A reschedule or cancel changes the answer; never serve a cached copy.
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

export const GET = defaultResponderForAppDir(getHandler);
