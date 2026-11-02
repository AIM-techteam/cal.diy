"use client";

import dayjs from "@calcom/dayjs";
import { useBookerStoreContext } from "@calcom/features/bookings/Booker/BookerStoreProvider";
import { useBookerTime } from "@calcom/features/bookings/Booker/hooks/useBookerTime";
import { getTwoDayViewDays } from "@calcom/features/bookings/Booker/utils/twoDayView";
import type { Slots } from "@calcom/features/calendars/lib/types";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { TimeFormat } from "@calcom/lib/timeFormat";
import classNames from "@calcom/ui/classNames";
import { Button } from "@calcom/ui/components/button";
import { SkeletonText } from "@calcom/ui/components/skeleton";
import { useEffect, useMemo, useState } from "react";
import { shallow } from "zustand/shallow";
import { formatShortTimezoneLabel } from "../lib/timezone-map";
import { BookingTimezoneSelect } from "./BookingTimezoneSelect";

// Colors are the --td-* variables from ../lib/two-day-theme (light and dark).
const tileClassName =
  "rounded-xl border-2 border-(--td-line) bg-(--td-surface) text-(--td-ink) transition-colors hover:border-(--td-accent) focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--td-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-transparent";

type TwoDayPickerProps = {
  slots?: Slots;
  isLoading: boolean;
  onSelectTime: (time: string) => void;
  /** When the form can be skipped (all booking fields prefilled), a picked time shows a
   * confirm button that books it directly, like the month view does. */
  skipConfirmStep?: boolean;
  onConfirm?: (time: string) => void;
  isBooking?: boolean;
  /** Omit to hide the timezone "Change" link, e.g. when the event locks the timezone. */
  onChangeTimezone?: (iana: string) => void;
};

/**
 * The next two days that have slots, as two tiles, with the selected day's times split into
 * Morning and Afternoon. Empty days never show up, and there is no way to switch to another
 * layout or browse further days.
 */
export const TwoDayPicker = ({
  slots,
  isLoading,
  onSelectTime,
  onChangeTimezone,
  skipConfirmStep = false,
  onConfirm,
  isBooking = false,
}: TwoDayPickerProps) => {
  const { t, i18n } = useLocale();
  const { timezone, timeFormat } = useBookerTime();
  const [selectedDate, setSelectedDate] = useBookerStoreContext(
    (state) => [state.selectedDate, state.setSelectedDate],
    shallow
  );

  const [pendingTime, setPendingTime] = useState<string | null>(null);
  const [isTimezoneSelectOpen, setIsTimezoneSelectOpen] = useState(false);
  const days = useMemo(() => getTwoDayViewDays(slots), [slots]);
  const activeDay = days.find((day) => day.date === selectedDate) ?? days[0];

  // The booker only reaches the booking-form step once a date is selected, so keep the store
  // in sync with the visible tile. The month must not switch: the slots come from a fixed window.
  useEffect(() => {
    if (!activeDay || activeDay.date === selectedDate) return;
    setSelectedDate({ date: activeDay.date, omitUpdatingParams: true, preventMonthSwitching: true });
  }, [activeDay, selectedDate, setSelectedDate]);

  const today = dayjs().tz(timezone).format("YYYY-MM-DD");
  const tomorrow = dayjs().tz(timezone).add(1, "day").format("YYYY-MM-DD");

  // Date keys are calendar dates, so format them at noon UTC to avoid shifting a day.
  const formatDate = (date: string, options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(i18n.language, { ...options, timeZone: "UTC" }).format(
      new Date(`${date}T12:00:00Z`)
    );

  const dayTitle = (date: string) => {
    if (date === today) return t("today");
    if (date === tomorrow) return t("tomorrow");
    return formatDate(date, { weekday: "long" });
  };

  // As in the mockup: the weekday is only added under "Tomorrow", the one title that lacks it.
  const daySubtitle = (date: string) =>
    date === tomorrow
      ? formatDate(date, { weekday: "short", month: "short", day: "numeric" })
      : formatDate(date, { month: "short", day: "numeric" });

  const slotFormat = timeFormat === TimeFormat.TWELVE_HOUR ? "h:mm A" : timeFormat;
  const times = (activeDay?.slots ?? []).map((slot) => {
    const start = dayjs.utc(slot.time).tz(timezone);
    return { time: slot.time, label: start.format(slotFormat), isMorning: start.hour() < 12 };
  });
  const pendingTimeLabel = times.find((time) => time.time === pendingTime)?.label;
  const groups = [
    { key: "morning", title: t("morning"), times: times.filter((time) => time.isMorning) },
    { key: "afternoon", title: t("afternoon"), times: times.filter((time) => !time.isMorning) },
  ];

  const timezoneLine = (
    <>
      <p className="mt-2 mb-1 text-base text-(--td-mute)" data-testid="two-day-timezone">
        <span aria-hidden="true">🕓</span> {t("times_shown_in")}{" "}
        <b className="text-(--td-ink)">{formatShortTimezoneLabel(timezone)}</b>
        {onChangeTimezone && (
          <>
            {" "}
            <button
              type="button"
              className="font-bold text-(--td-accent) underline"
              aria-expanded={isTimezoneSelectOpen}
              onClick={() => setIsTimezoneSelectOpen(true)}
              data-testid="two-day-change-timezone">
              {t("change")}
            </button>
          </>
        )}
      </p>
      {onChangeTimezone && isTimezoneSelectOpen && (
        <BookingTimezoneSelect
          timezone={timezone}
          className="mt-[6px] mb-1"
          data-testid="two-day-timezone-select"
          onChange={(iana) => {
            setPendingTime(null);
            setIsTimezoneSelectOpen(false);
            onChangeTimezone(iana);
          }}
        />
      )}
    </>
  );

  if (isLoading && days.length === 0) {
    return (
      <div className="w-full" data-testid="two-day-picker-loading">
        <div className="grid grid-cols-2 gap-[10px]">
          <SkeletonText className="h-[70px] w-full rounded-xl" />
          <SkeletonText className="h-[70px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!activeDay) {
    return (
      <div className="w-full" data-testid="two-day-picker-empty">
        <p className="text-base text-(--td-mute)">{t("no_upcoming_availability")}</p>
        {timezoneLine}
      </div>
    );
  }

  return (
    <div className="w-full text-(--td-ink)" data-testid="two-day-picker">
      <div className="mb-2 grid grid-cols-2 gap-[10px]" role="group">
        {days.map((day) => {
          const isSelected = day.date === activeDay.date;
          return (
            <button
              key={day.date}
              type="button"
              aria-pressed={isSelected}
              data-testid="two-day-tile"
              onClick={() => {
                setPendingTime(null);
                setSelectedDate({ date: day.date, omitUpdatingParams: true, preventMonthSwitching: true });
              }}
              className={classNames(
                tileClassName,
                "px-1 py-[10px] text-center",
                isSelected && "border-(--td-accent)! bg-(--td-accent-soft)!"
              )}>
              <b className="block text-lg leading-[1.3]">{dayTitle(day.date)}</b>
              <small className="block text-[15px] text-(--td-mute)">{daySubtitle(day.date)}</small>
            </button>
          );
        })}
      </div>

      {timezoneLine}

      {groups.map((group) =>
        group.times.length === 0 ? null : (
          <div key={group.key} data-testid={`two-day-${group.key}`}>
            <h3 className="mt-4 mb-2 font-bold text-(--td-olive) text-sm uppercase tracking-[.05em]">
              {group.title}
            </h3>
            <div className="grid grid-cols-2 gap-[10px] md:grid-cols-3">
              {group.times.map((time) => (
                <button
                  key={time.time}
                  type="button"
                  data-testid="time"
                  data-time={time.time}
                  aria-pressed={skipConfirmStep ? time.time === pendingTime : undefined}
                  disabled={isBooking}
                  onClick={() => (skipConfirmStep ? setPendingTime(time.time) : onSelectTime(time.time))}
                  className={classNames(
                    tileClassName,
                    "px-[6px] py-[14px] font-semibold text-lg disabled:opacity-60",
                    time.time === pendingTime && "border-(--td-fill)! bg-(--td-fill)! text-white!"
                  )}>
                  {time.label}
                </button>
              ))}
            </div>
          </div>
        )
      )}

      {skipConfirmStep && pendingTimeLabel && pendingTime && (
        <div className="mt-5" data-testid="two-day-confirm">
          <Button
            className="w-full justify-center rounded-xl! border-0! bg-(--td-fill)! py-4! font-semibold! text-lg! text-white! hover:bg-(--td-fill-hover)!"
            loading={isBooking}
            onClick={() => {
              onSelectTime(pendingTime);
              onConfirm?.(pendingTime);
            }}>
            {t("confirm_date_at_time", {
              date: formatDate(activeDay.date, { weekday: "short", month: "short", day: "numeric" }),
              time: pendingTimeLabel,
            })}
          </Button>
        </div>
      )}
    </div>
  );
};
