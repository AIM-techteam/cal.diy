"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import classNames from "@calcom/ui/classNames";
import { Icon } from "@calcom/ui/components/icon";
import type { ReactNode } from "react";
import { useState } from "react";
import { formatShortTimezoneLabel, SHORT_US_TIMEZONE_LABELS } from "../lib/timezone-map";

type BookingTimezoneSelectProps = {
  timezone: string;
  onChange: (iana: string) => void;
  onClose: () => void;
  className?: string;
  /** Smaller text and padding, for tight spots like the booking-form summary. */
  compact?: boolean;
  "data-testid"?: string;
};

/**
 * Timezone dropdown styled as in the Funnel v3 mockup. It offers the seven US zones; a visitor
 * elsewhere keeps their own zone as the first option so the select still shows what the times
 * are in. Rendered only after a "Change" click, so it takes focus when it opens, and closes
 * when it loses focus or on Escape, so picking the zone already selected also closes it.
 */
const BookingTimezoneSelect = ({
  timezone,
  onChange,
  onClose,
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
        onChange={(event) => {
          onChange(event.target.value);
          onClose();
        }}
        onBlur={onClose}
        onKeyDown={(event) => {
          if (event.key === "Escape") onClose();
        }}
        data-testid={testId}
        className={classNames(
          "w-full appearance-none rounded-xl border-(--td-line) border-[1.5px] bg-(--td-surface) pr-12 pl-4 text-(--td-ink) focus:border-(--td-accent) focus:outline-(--td-focus) focus:outline-[3px] focus:outline-solid focus:outline-offset-1",
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

type UseTimezoneChangeOptions = {
  timezone: string;
  /** Omit to render nothing, e.g. when the event locks the timezone or inside an embed. */
  onChangeTimezone?: (iana: string) => void;
  /** Called after a zone is picked, e.g. to clear a pending time. */
  onPicked?: () => void;
  compact?: boolean;
  selectClassName?: string;
  triggerTestId: string;
  selectTestId: string;
};

/**
 * The "Change" link and the timezone select it opens, as two pieces so each view can place them
 * in its own layout (the link inline with the zone name, the select below). The link toggles
 * the select.
 */
export const useTimezoneChange = ({
  timezone,
  onChangeTimezone,
  onPicked,
  compact,
  selectClassName,
  triggerTestId,
  selectTestId,
}: UseTimezoneChangeOptions): { trigger: ReactNode; select: ReactNode } => {
  const { t } = useLocale();
  const [isOpen, setIsOpen] = useState(false);

  if (!onChangeTimezone) return { trigger: null, select: null };

  const trigger = (
    <button
      type="button"
      className="font-bold text-(--td-accent) underline"
      aria-expanded={isOpen}
      // Keep the select's blur from closing it before this click toggles it.
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => setIsOpen((open) => !open)}
      data-testid={triggerTestId}>
      {t("change")}
    </button>
  );

  const select = isOpen ? (
    <BookingTimezoneSelect
      timezone={timezone}
      compact={compact}
      className={selectClassName}
      data-testid={selectTestId}
      onClose={() => setIsOpen(false)}
      onChange={(iana) => {
        onPicked?.();
        onChangeTimezone(iana);
      }}
    />
  ) : null;

  return { trigger, select };
};
