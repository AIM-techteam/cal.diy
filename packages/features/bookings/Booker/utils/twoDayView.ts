import type { SlotInfo, Slots } from "@calcom/features/calendars/lib/types";

export const TWO_DAY_VIEW_DAY_COUNT = 2;

// Days of availability fetched in one request. Must cover the longest stretch an advisor
// can go without slots, otherwise the view shows fewer than two days.
export const TWO_DAY_VIEW_LOOKAHEAD_DAYS = 30;

export type TwoDayViewDay = {
  date: string;
  /** Bookable times. */
  slots: SlotInfo[];
  /** Out-of-office marker to show for the day (redirect to a colleague, or a public note). */
  outOfOffice?: SlotInfo;
};

type EventWithMetadata = { metadata?: { bookerTwoDayView?: boolean } | null } | null | undefined;

export const isTwoDayViewEvent = (event: EventWithMetadata): boolean =>
  event?.metadata?.bookerTwoDayView === true;

/**
 * Whether the booker shows this slot at all. "Away" slots are out-of-office markers, not
 * bookable times; one is still shown when it redirects to another user or has a public note.
 * Shared with useNonEmptyScheduleDays so every layout agrees on which days are empty.
 */
export const isSlotShownInBooker = (slot: SlotInfo): boolean =>
  !(slot.away && !slot.toUser && !slot.showNotePublicly);

/**
 * Picks the first `count` dates (chronological) that the booker would show: days with at least
 * one bookable time or a visible out-of-office marker. Days with nothing to show are skipped.
 */
export const getTwoDayViewDays = (
  slots: Slots | undefined,
  count: number = TWO_DAY_VIEW_DAY_COUNT
): TwoDayViewDay[] => {
  if (!slots) return [];

  const days: TwoDayViewDay[] = [];
  const sortedDates = Object.keys(slots).sort();

  for (const date of sortedDates) {
    if (days.length >= count) break;
    const bookable = slots[date].filter((slot) => !slot.away);
    const outOfOffice = slots[date].find((slot) => slot.away && isSlotShownInBooker(slot));
    if (bookable.length === 0 && !outOfOffice) continue;
    days.push({ date, slots: bookable, ...(outOfOffice ? { outOfOffice } : {}) });
  }

  return days;
};
