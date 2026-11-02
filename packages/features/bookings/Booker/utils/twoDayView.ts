import type { SlotInfo, Slots } from "@calcom/features/calendars/lib/types";

export const TWO_DAY_VIEW_DAY_COUNT = 2;

// Days of availability fetched in one request. Must cover the longest stretch an advisor
// can go without slots, otherwise the view shows fewer than two days.
export const TWO_DAY_VIEW_LOOKAHEAD_DAYS = 30;

export type TwoDayViewDay = {
  date: string;
  slots: SlotInfo[];
};

type EventWithMetadata = { metadata?: { bookerTwoDayView?: boolean } | null } | null | undefined;

export const isTwoDayViewEvent = (event: EventWithMetadata): boolean =>
  event?.metadata?.bookerTwoDayView === true;

/**
 * Picks the first `count` dates (in key order, i.e. chronological) that have at least one
 * bookable slot. "Away" slots are out-of-office markers, not bookable times, so they are
 * dropped and a day holding only those is skipped.
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
    if (bookable.length === 0) continue;
    days.push({ date, slots: bookable });
  }

  return days;
};
