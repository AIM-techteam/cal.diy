"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import classNames from "@calcom/ui/classNames";
import { Icon } from "@calcom/ui/components/icon";
import { formatShortTimezoneLabel, SHORT_US_TIMEZONE_LABELS } from "../lib/timezone-map";

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
    <div className={classNames("relative", className)}>
      <select
        // biome-ignore lint/a11y/noAutofocus: opened by the "Change" click, focus follows the user's action
        autoFocus
        aria-label={t("timezone")}
        value={timezone}
        onChange={(event) => onChange(event.target.value)}
        data-testid={testId}
        className={classNames(
          "w-full appearance-none rounded-xl border-[1.5px] border-(--td-line) bg-(--td-surface) pr-12 pl-4 text-(--td-ink) focus:border-(--td-accent) focus:outline-[3px] focus:outline-(--td-focus) focus:outline-offset-1 focus:outline-solid",
          compact ? "py-[10px] text-base" : "py-[14px] text-xl"
        )}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <Icon
        name="chevron-down"
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 right-[18px] h-5 w-5 -translate-y-1/2 text-(--td-olive)"
      />
    </div>
  );
};
