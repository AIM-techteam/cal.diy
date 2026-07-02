import type { Dayjs } from "@calcom/dayjs";
import dayjs from "@calcom/dayjs";
import { useSlotsViewOnSmallScreen } from "@calcom/embed-core/embed-iframe";
import { useBookerStoreContext } from "@calcom/features/bookings/Booker/BookerStoreProvider";
import type { DatePickerClassNames } from "@calcom/features/bookings/Booker/types";
import type { Slots } from "@calcom/features/bookings/types";
import { DatePicker as DatePickerComponent } from "@calcom/features/calendars/components/DatePicker";
import { weekdayToWeekIndex } from "@calcom/lib/dayjs";
import { useLocale } from "@calcom/lib/hooks/useLocale";
import type { User } from "@calcom/prisma/client";
import type { PeriodData } from "@calcom/types/Event";
import { useNonEmptyScheduleDays } from "@calcom/web/modules/schedules/hooks/useNonEmptyScheduleDays";
import { shallow } from "zustand/shallow";

const formatMonthName = (date: Dayjs, locale: string) =>
  new Intl.DateTimeFormat(locale, { month: "long" }).format(date.toDate());

/**
 * OnceHub-style "< previous month" / "next month >" text links, shown below the day grid.
 * Mirrors the prev-arrow's own disabled guard (`!browsingDate.isAfter(dayjs())`) so a
 * non-navigable previous month simply doesn't render a link, instead of a disabled one.
 */
const OnceHubMonthFooter = ({
  browsingDate,
  locale,
  onMonthChange,
}: {
  browsingDate: Dayjs;
  locale: string;
  onMonthChange: (date: Dayjs) => void;
}) => {
  const canGoToPreviousMonth = browsingDate.isAfter(dayjs());
  const previousMonthLabel = formatMonthName(browsingDate.subtract(1, "month"), locale);
  const nextMonthLabel = formatMonthName(browsingDate.add(1, "month"), locale);

  return (
    <div className="mt-4 flex items-center justify-between text-sm">
      {canGoToPreviousMonth ? (
        <button
          type="button"
          className="text-[#6B7280] hover:text-[#F5A623]"
          onClick={() => onMonthChange(browsingDate.subtract(1, "month"))}
          data-testid="oncehub-previous-month">
          {"< "}
          {previousMonthLabel}
        </button>
      ) : (
        <span />
      )}
      <button
        type="button"
        className="text-[#6B7280] hover:text-[#F5A623]"
        onClick={() => onMonthChange(browsingDate.add(1, "month"))}
        data-testid="oncehub-next-month">
        {nextMonthLabel}
        {" >"}
      </button>
    </div>
  );
};

const useMoveToNextMonthOnNoAvailability = ({
  browsingDate,
  nonEmptyScheduleDays,
  onMonthChange,
  isLoading,
}: {
  browsingDate: Dayjs;
  nonEmptyScheduleDays: string[];
  isLoading: boolean;
  onMonthChange: (date: Dayjs) => void;
}) => {
  if (isLoading) {
    return {
      moveToNextMonthOnNoAvailability: () => {
        /* return noop until ready */
      },
    };
  }

  const nonEmptyScheduleDaysInBrowsingMonth = nonEmptyScheduleDays.filter((date) =>
    dayjs(date).isSame(browsingDate, "month")
  );

  const moveToNextMonthOnNoAvailability = () => {
    const currentMonth = dayjs().startOf("month").format("YYYY-MM");
    const browsingMonth = browsingDate.format("YYYY-MM");
    // Not meeting the criteria to move to next month
    // Has to be currentMonth and it must have all days unbookable
    if (currentMonth != browsingMonth || nonEmptyScheduleDaysInBrowsingMonth.length) {
      return;
    }
    onMonthChange(browsingDate.add(1, "month"));
  };
  return {
    moveToNextMonthOnNoAvailability,
  };
};

export const DatePicker = ({
  event,
  slots = {},
  isLoading,
  classNames,
  scrollToTimeSlots,
  showNoAvailabilityDialog,
  onDateChange,
  oncehubStyle = false,
}: {
  event: {
    data?: {
      subsetOfUsers: Pick<User, "weekStart">[];
      periodType?: PeriodData["periodType"];
      periodStartDate?: PeriodData["periodStartDate"];
      periodEndDate?: PeriodData["periodEndDate"];
      periodDays?: PeriodData["periodDays"];
      periodCountCalendarDays?: PeriodData["periodCountCalendarDays"];
    } | null;
  };
  slots?: Slots;
  isLoading?: boolean;
  classNames?: DatePickerClassNames;
  scrollToTimeSlots?: () => void;
  showNoAvailabilityDialog?: boolean;
  onDateChange?: () => void;
  /** OnceHub-style bold/gray day styling + prev/next month footer links. Web month view only. */
  oncehubStyle?: boolean;
}) => {
  const { i18n } = useLocale();
  const [month, selectedDate, layout] = useBookerStoreContext(
    (state) => [state.month, state.selectedDate, state.layout],
    shallow
  );

  const [setSelectedDate, setMonth, setDayCount] = useBookerStoreContext(
    (state) => [state.setSelectedDate, state.setMonth, state.setDayCount],
    shallow
  );

  const slotsViewOnSmallScreen = useSlotsViewOnSmallScreen();

  const onMonthChange = (date: Dayjs) => {
    setMonth(date.format("YYYY-MM"));
    if (!slotsViewOnSmallScreen) {
      setSelectedDate({ date: date.format("YYYY-MM-DD") });
    }
    setDayCount(null); // Whenever the month is changed, we nullify getting X days
  };

  const nonEmptyScheduleDays = useNonEmptyScheduleDays(slots);
  const browsingDate = month ? dayjs(month) : dayjs().startOf("month");

  const { moveToNextMonthOnNoAvailability } = useMoveToNextMonthOnNoAvailability({
    browsingDate,
    nonEmptyScheduleDays,
    onMonthChange,
    isLoading: isLoading ?? true,
  });
  moveToNextMonthOnNoAvailability();

  // Determine if this is a compact sidebar view based on layout
  const isCompact = layout !== "month_view" && layout !== "mobile";

  const periodData: PeriodData = {
    ...{
      periodType: "UNLIMITED",
      periodStartDate: null,
      periodEndDate: null,
      periodDays: null,
      periodCountCalendarDays: false,
    },
    ...(event?.data && {
      periodType: event.data.periodType,
      periodStartDate: event.data.periodStartDate,
      periodEndDate: event.data.periodEndDate,
      periodDays: event.data.periodDays,
      periodCountCalendarDays: event.data.periodCountCalendarDays,
    }),
  };
  return (
    <DatePickerComponent
      customClassNames={{
        datePickerTitle: classNames?.datePickerTitle,
        datePickerDays: classNames?.datePickerDays,
        datePickersDates: classNames?.datePickerDate,
        // Available days bold; disabled days gray, normal weight. Reuses the existing
        // dayActive/dayDisabled override slots, only opted into for the OnceHub month view.
        datePickerDatesActive: oncehubStyle
          ? "font-semibold text-emphasis bg-emphasis"
          : classNames?.datePickerDatesActive,
        datePickerDatesDisabled: oncehubStyle ? "font-normal text-[#9CA3AF]" : undefined,
        datePickerToggle: classNames?.datePickerToggle,
      }}
      className={classNames?.datePickerContainer}
      oncehubStyle={oncehubStyle}
      footer={
        oncehubStyle ? (
          <OnceHubMonthFooter
            browsingDate={browsingDate}
            locale={i18n.language}
            onMonthChange={onMonthChange}
          />
        ) : undefined
      }
      isLoading={isLoading}
      onChange={(date: Dayjs | null, omitUpdatingParams?: boolean) => {
        const newDate = date === null ? null : date.format("YYYY-MM-DD");
        const previousDate = selectedDate;
        const dateChanged = newDate !== previousDate;

        setSelectedDate({
          date: date === null ? null : date.format("YYYY-MM-DD"),
          omitUpdatingParams,
          preventMonthSwitching: !isCompact, // Prevent month switching when in monthly view
        });

        if (dateChanged) {
          onDateChange?.();
        }
      }}
      onMonthChange={onMonthChange}
      includedDates={nonEmptyScheduleDays}
      locale={i18n.language}
      browsingDate={month ? dayjs(month) : undefined}
      selected={dayjs(selectedDate)}
      weekStart={weekdayToWeekIndex(event?.data?.subsetOfUsers?.[0]?.weekStart)}
      slots={slots}
      scrollToTimeSlots={scrollToTimeSlots}
      periodData={periodData}
      isCompact={isCompact}
      showNoAvailabilityDialog={showNoAvailabilityDialog}
    />
  );
};
