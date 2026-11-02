"use client";

import { useBookerStoreContext } from "@calcom/features/bookings/Booker/BookerStoreProvider";
import { useBookerTime } from "@calcom/features/bookings/Booker/hooks/useBookerTime";
import type { BookerEvent } from "@calcom/features/bookings/types";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { formatTimezoneLabel } from "../lib/timezone-map";

type BookingHeaderProps = {
  event?: Pick<BookerEvent, "length" | "lockTimeZoneToggleOnBookingPage"> | null;
  onOpenTimezoneModal: () => void;
  /** Shown as a "Change selection" link top-right, next to the h1, when a timeslot is
   * already picked (i.e. the booker is on the confirmation-form step). Omit to hide it. */
  onChangeSelection?: () => void;
  /** Drops the timezone line, for views that show the timezone themselves (two-day view). */
  hideTimezone?: boolean;
};

/**
 * OnceHub-style plain-text header shown above the calendar for the web (non-platform)
 * month view, replacing the meta sidebar's title/duration/timezone block.
 *
 * On the confirmation-form step (signalled by onChangeSelection being provided - it's
 * only ever passed once a timeslot is picked), the title/duration/notice/timezone lines
 * are dropped entirely - they already showed on the calendar step, and the timezone is
 * repeated in BookingSummary's "(Change)" row instead. Only the "Change selection" link
 * remains, top-right, so the confirmation step starts directly with it.
 */
export const BookingHeader = ({
  event,
  onOpenTimezoneModal,
  onChangeSelection,
  hideTimezone = false,
}: BookingHeaderProps) => {
  const { t } = useLocale();
  const { timezone } = useBookerTime();
  const selectedDuration = useBookerStoreContext((state) => state.selectedDuration);

  if (onChangeSelection) {
    return (
      <div
        // Match the form section's horizontal inset (`p-6 -ml-px`, see Booker.tsx book-event-form
        // BookerSection) so the title's left edge lines up exactly with the field labels below.
        className="-ml-px flex w-full items-center justify-between px-6"
        data-testid="booking-header">
        <h1 className="text-2xl font-bold text-[#333333]">{t("provide_information")}</h1>
        <button
          type="button"
          className="text-sm text-[#2563EB] hover:underline"
          onClick={onChangeSelection}
          data-testid="booking-header-change-selection">
          {t("change_selection")} ▾
        </button>
      </div>
    );
  }

  return (
    <div className="w-full text-left" data-testid="booking-header">
      <h1 className="text-2xl font-bold text-[#333333]">{t("pick_a_date_and_time")}</h1>
      <p className="mt-2 text-sm text-[#333333]">
        <strong>{t("duration")}:</strong> {t("minute", { count: selectedDuration || event?.length })}
      </p>
      <p className="mt-1 text-sm text-[#333333]">{t("virtual_meeting_details_notice")}</p>
      {!hideTimezone && (
        <p className="mt-1 text-sm text-[#333333]">
          <strong>{t("your_time_zone")}:</strong> {formatTimezoneLabel(timezone)}{" "}
          {!event?.lockTimeZoneToggleOnBookingPage && (
            <button
              type="button"
              className="text-[#6B7280] underline hover:text-[var(--cal-brand)]"
              onClick={onOpenTimezoneModal}
              data-testid="booking-header-change-timezone">
              ({t("change")})
            </button>
          )}
        </p>
      )}
    </div>
  );
};
