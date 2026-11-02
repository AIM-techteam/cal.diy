"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import classNames from "@calcom/ui/classNames";
import { formatShortTimezoneLabel, SHORT_US_TIMEZONE_LABELS } from "../lib/timezone-map";

const SELECT_CHEVRON =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='14' height='9' viewBox='0 0 14 9'%3E%3Cpath d='M1 1l6 6 6-6' fill='none' stroke='%2346432f' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E";

type BookingTimezoneSelectProps = {
  timezone: string;
  onChange: (iana: string) => void;
  className?: string;
  /** Smaller text and padding, for tight spots like the booking-form summary. */
  compact?: boolean;
  "data-testid"?: string;
};

/**
 * Timezone dropdown styled as in the Funnel v3 mockup. It offers the seven US zones; a visitor
 * elsewhere keeps their own zone as the first option so the select still shows what the times
 * are in. Rendered only after a "Change" click, so it takes focus when it opens.
 */
export const BookingTimezoneSelect = ({
  timezone,
  onChange,
  className,
  compact = false,
  "data-testid": testId,
}: BookingTimezoneSelectProps) => {
  const { t } = useLocale();

  const options = Object.entries(SHORT_US_TIMEZONE_LABELS).map(([value, label]) => ({ value, label }));
  if (!SHORT_US_TIMEZONE_LABELS[timezone]) {
    options.unshift({ value: timezone, label: formatShortTimezoneLabel(timezone) });
  }

  return (
    <select
      // biome-ignore lint/a11y/noAutofocus: opened by the "Change" click, focus follows the user's action
      autoFocus
      aria-label={t("timezone")}
      value={timezone}
      onChange={(event) => onChange(event.target.value)}
      data-testid={testId}
      style={{ background: `#fff url("${SELECT_CHEVRON}") no-repeat right 18px center` }}
      className={classNames(
        "w-full appearance-none rounded-xl border-[1.5px] border-[#ddd8c8] bg-white pr-12 pl-4 text-[#2f2e24] focus:border-[#2f5a28] focus:outline-[3px] focus:outline-[rgba(47,90,40,.35)] focus:outline-offset-1 focus:outline-solid",
        compact ? "py-[10px] text-base" : "py-[14px] text-xl",
        className
      )}>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};
