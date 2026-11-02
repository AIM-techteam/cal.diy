import type { Dayjs } from "@calcom/dayjs";
import dayjs from "@calcom/dayjs";
import { useBookerStoreContext } from "@calcom/features/bookings/Booker/BookerStoreProvider";
import { getQueryParam } from "@calcom/features/bookings/Booker/utils/query-param";
import { TimeFormatToggle } from "@calcom/features/bookings/components/TimeFormatToggle";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import { nameOfDay } from "@calcom/lib/weekday";
import { BookerLayouts } from "@calcom/prisma/zod-utils";
import classNames from "@calcom/ui/classNames";
import { shallow } from "zustand/shallow";

type AvailableTimesHeaderProps = {
  date: Dayjs;
  showTimeFormatToggle?: boolean;
  availableMonth?: string | undefined;
  customClassNames?: {
    availableTimeSlotsHeaderContainer?: string;
    availableTimeSlotsTitle?: string;
    availableTimeSlotsTimeFormatToggle?: string;
  };
  /** OnceHub-style "Available starting times for <bold date>" header. Web month view only. */
  oncehubStyle?: boolean;
};

export const AvailableTimesHeader = ({
  date,
  showTimeFormatToggle = true,
  availableMonth,
  customClassNames,
  oncehubStyle = false,
}: AvailableTimesHeaderProps) => {
  const { t, i18n } = useLocale();
  const [layout] = useBookerStoreContext((state) => [state.layout], shallow);
  const isColumnView = layout === BookerLayouts.COLUMN_VIEW;
  const isMonthView = layout === BookerLayouts.MONTH_VIEW;
  const isToday = dayjs().isSame(date, "day");

  if (oncehubStyle) {
    const dateLabel = date.format("ddd, MMM D, YYYY");
    // "before" is the lead-in text ("Available starting times for"); "after" is whatever
    // (if anything) the translation puts after the date placeholder. Split on the date
    // itself so the date can be put on its own bold line regardless of locale word order.
    const fullText = t("available_starting_times_for", { date: dateLabel });
    const [before, after] = fullText.split(dateLabel);
    return (
      <header
        className={classNames(
          "mb-3 flex w-full flex-row items-center justify-center",
          customClassNames?.availableTimeSlotsHeaderContainer
        )}>
        <p className="w-full text-center text-sm leading-[1.4] text-[#333333]">
          {before}
          <br />
          <strong>{dateLabel}</strong>
          {after}
        </p>
      </header>
    );
  }

  return (
    <header
      className={classNames(
        `dark:bg-cal-muted dark:before:bg-cal-muted mb-3 flex w-full flex-row items-center font-medium`,
        "bg-default before:bg-default",
        customClassNames?.availableTimeSlotsHeaderContainer
      )}>
      <span
        className={classNames(
          isColumnView && "w-full text-center",
          isColumnView ? "text-subtle text-xs uppercase" : "text-emphasis font-semibold"
        )}>
        <span
          className={classNames(
            isToday && !customClassNames?.availableTimeSlotsTitle && "!text-default",
            customClassNames?.availableTimeSlotsTitle
          )}>
          {nameOfDay(i18n.language, Number(date.format("d")), "short")}
        </span>
        <span
          className={classNames(
            isColumnView && isToday && "bg-brand-default text-brand ml-2",
            "inline-flex items-center justify-center rounded-3xl px-1 pt-0.5 font-medium",
            isMonthView
              ? `text-default text-sm ${customClassNames?.availableTimeSlotsTitle}`
              : `text-xs ${customClassNames?.availableTimeSlotsTitle}`
          )}>
          {date.format("DD")}
          {availableMonth && `, ${availableMonth}`}
        </span>
      </span>

      {/* AIM: in the OnceHub-style AM/PM variant (?amPm=1) the 12h/24h toggle is
          meaningless (slots are already split AM|PM and forced to 12h), so hide it. */}
      {showTimeFormatToggle && getQueryParam("amPm") !== "1" && (
        <div className="ml-auto rtl:mr-auto">
          <TimeFormatToggle customClassName={customClassNames?.availableTimeSlotsTimeFormatToggle} />
        </div>
      )}
    </header>
  );
};
