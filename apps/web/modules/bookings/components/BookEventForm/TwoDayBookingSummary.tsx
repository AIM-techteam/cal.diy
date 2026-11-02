"use client";

import dayjs from "@calcom/dayjs";
import { useBookerTime } from "@calcom/features/bookings/Booker/hooks/useBookerTime";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { TimeFormat } from "@calcom/lib/timeFormat";
import { useState } from "react";
import { formatShortTimezoneLabel } from "../../lib/timezone-map";
import { BookingTimezoneSelect } from "../BookingTimezoneSelect";

type TwoDayBookingSummaryProps = {
  timeslot: string;
  duration: number;
  onChangeSelection: () => void;
  /** Omit when the event locks the timezone. */
  onChangeTimezone?: (iana: string) => void;
  requiresConfirmation?: boolean;
};

/**
 * The picked time as a card, styled like the Funnel v3 mockup's booked card (calendar badge
 * with month and day, then weekday and time), with links to change the time or timezone.
 */
export const TwoDayBookingSummary = ({
  timeslot,
  duration,
  onChangeSelection,
  onChangeTimezone,
  requiresConfirmation,
}: TwoDayBookingSummaryProps) => {
  const { t } = useLocale();
  const { timezone, timeFormat } = useBookerTime();
  const [isTimezoneSelectOpen, setIsTimezoneSelectOpen] = useState(false);

  const slotFormat = timeFormat === TimeFormat.TWELVE_HOUR ? "h:mm A" : timeFormat;
  const start = dayjs.utc(timeslot).tz(timezone);
  const end = start.add(duration, "minute");

  return (
    <div className="mb-6" data-testid="booking-summary">
      <div className="flex items-center gap-[14px] rounded-[14px] border border-(--td-line) bg-(--td-surface) p-4">
        <div
          className="w-[62px] flex-none overflow-hidden rounded-[10px] border border-(--td-line) text-center"
          aria-hidden="true">
          <span className="block bg-(--td-fill) px-[2px] py-[2px] font-bold text-[13px] text-white uppercase">
            {start.format("MMM")}
          </span>
          <b className="block py-[2px] text-[26px] text-(--td-ink)">{start.format("D")}</b>
        </div>
        <div className="min-w-0 text-(--td-ink)">
          <strong className="block text-lg">
            {start.format("dddd")}, {start.format("MMM D")}
          </strong>
          <span className="block text-base">
            {start.format(slotFormat)} – {end.format(slotFormat)}
          </span>
          <span className="block text-(--td-mute) text-[15px]">
            {formatShortTimezoneLabel(timezone)}
            {onChangeTimezone && (
              <>
                {" · "}
                <button
                  type="button"
                  className="font-bold text-(--td-accent) underline"
                  aria-expanded={isTimezoneSelectOpen}
                  onClick={() => setIsTimezoneSelectOpen(true)}
                  data-testid="booking-summary-change-timezone">
                  {t("change")}
                </button>
              </>
            )}
          </span>
        </div>
      </div>
      {onChangeTimezone && isTimezoneSelectOpen && (
        <BookingTimezoneSelect
          timezone={timezone}
          compact
          className="mt-2"
          data-testid="booking-summary-timezone-select"
          onChange={(iana) => {
            setIsTimezoneSelectOpen(false);
            onChangeTimezone(iana);
          }}
        />
      )}
      <button
        type="button"
        className="mt-2 font-bold text-(--td-accent) underline"
        onClick={onChangeSelection}
        data-testid="booking-summary-change-time">
        {t("pick_another_time")}
      </button>
      {requiresConfirmation && (
        <p className="mt-2 text-(--td-mute) text-sm" data-testid="booking-summary-requires-confirmation">
          {t("requires_confirmation")}
        </p>
      )}
    </div>
  );
};
