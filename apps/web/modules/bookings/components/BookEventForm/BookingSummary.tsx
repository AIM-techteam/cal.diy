"use client";

import dayjs from "@calcom/dayjs";
import { useBookerTime } from "@calcom/features/bookings/Booker/hooks/useBookerTime";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { formatTimezoneLabel } from "../../lib/timezone-map";

type BookingSummaryProps = {
  timeslot: string;
  duration: number;
  onChangeSelection: () => void;
  /** Omit to hide the timezone "(Change)" link, e.g. when the event locks the timezone. */
  onOpenTimezoneModal?: () => void;
  requiresConfirmation?: boolean;
};

/**
 * OnceHub-style two-column "Time" summary shown above the confirmation form: the
 * selected date/time and the effective timezone, each with its own "(Change)" link
 * so the booker can jump back without losing their place on the page.
 *
 * Also surfaces the "requires confirmation" notice here, since the OnceHub month view
 * never renders EventMeta (the sidebar that normally shows it) - see Booker.tsx's
 * isOnceHubMonthView.
 */
export const BookingSummary = ({
  timeslot,
  duration,
  onChangeSelection,
  onOpenTimezoneModal,
  requiresConfirmation,
}: BookingSummaryProps) => {
  const { t } = useLocale();
  const { timeFormat, timezone } = useBookerTime();

  const start = dayjs.utc(timeslot).tz(timezone);
  const end = start.add(duration, "minute");
  const dateLabel = start.format("ddd, MMM D, YYYY");
  const timeLabel = `${start.format(timeFormat)} - ${end.format(timeFormat)}`;

  return (
    <div
      className="mb-6 grid grid-cols-[2fr_3fr] gap-x-4 gap-y-1 text-sm text-[#1A1A1A] dark:text-[#ece9df]"
      data-testid="booking-summary">
      <span className="row-span-2 font-medium">{t("time")}</span>
      <span>
        {dateLabel}, {timeLabel}{" "}
        <button
          type="button"
          className="text-[#2563EB] hover:underline dark:text-[#7aa7ff]"
          onClick={onChangeSelection}
          data-testid="booking-summary-change-time">
          ({t("change")})
        </button>
      </span>
      <span>
        {formatTimezoneLabel(timezone)}{" "}
        {onOpenTimezoneModal && (
          <button
            type="button"
            className="text-[#2563EB] hover:underline dark:text-[#7aa7ff]"
            onClick={onOpenTimezoneModal}
            data-testid="booking-summary-change-timezone">
            ({t("change")})
          </button>
        )}
      </span>
      {requiresConfirmation && (
        <>
          <span />
          <span className="text-subtle" data-testid="booking-summary-requires-confirmation">
            {t("requires_confirmation")}
          </span>
        </>
      )}
    </div>
  );
};
