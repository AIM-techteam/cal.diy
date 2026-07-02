"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import classNames from "@calcom/ui/classNames";
import { Icon } from "@calcom/ui/components/icon";
import { Tooltip } from "@calcom/ui/components/tooltip";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useEffect, useMemo, useState } from "react";
import { getCountries, getGmtOffsetLabel, getRegionsForCountry, lookupTimezone } from "../lib/timezone-map";

/**
 * Synthetic "country" value used when the detected/current timezone isn't in our curated
 * TIMEZONE_MAP (which covers ~27 zones, not the full IANA database). Without this, the
 * booker's country wouldn't appear in the dropdown and Continue would stay disabled forever.
 */
const DETECTED_FALLBACK_COUNTRY = "__detected__";

type TimezoneSelectFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  disabled?: boolean;
  showDetectedIcon?: boolean;
};

const TimezoneSelectField = ({
  label,
  value,
  onChange,
  options,
  disabled,
  showDetectedIcon,
}: TimezoneSelectFieldProps) => {
  const { t } = useLocale();

  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5">
        <label className="font-medium text-[#6B7280] text-xs">{label}</label>
        {showDetectedIcon && value && (
          <Tooltip content={t("detected_from_your_browser")}>
            <span className="inline-flex">
              <Icon name="globe" className="h-3.5 w-3.5 text-[#6B7280]" />
            </span>
          </Tooltip>
        )}
      </div>
      <div className="relative">
        <select
          aria-label={label}
          value={value}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
          className={classNames(
            "w-full appearance-none truncate border-0 border-[#E5E7EB] border-b-2 bg-transparent py-2 pr-8 text-[#1A1A1A] text-sm focus:border-[var(--cal-brand)] focus:outline-none",
            disabled && "cursor-not-allowed opacity-50"
          )}>
          <option value="" disabled>
            {label}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <Icon
          name="chevron-down"
          className="pointer-events-none absolute top-1/2 right-1 h-4 w-4 -translate-y-1/2 text-[#6B7280]"
        />
      </div>
    </div>
  );
};

export type TimezoneModalProps = {
  open: boolean;
  /** Currently effective timezone, used to pre-fill the selects when reopening. */
  currentTimezone?: string | null;
  onConfirm: (iana: string) => void;
  /** Called when the user dismisses the modal without explicitly confirming (Escape key,
   * clicking outside). The booking flow should proceed with whatever timezone was already
   * effective rather than leaving the overlay stuck open. */
  onDismiss?: () => void;
};

export const TimezoneModal = ({ open, currentTimezone, onConfirm, onDismiss }: TimezoneModalProps) => {
  const { t } = useLocale();
  const countries = useMemo(() => getCountries(), []);

  const [country, setCountry] = useState("");
  const [iana, setIana] = useState("");
  const [isAutoDetected, setIsAutoDetected] = useState(false);
  // Populated when the detected/current zone falls outside TIMEZONE_MAP, so we can still
  // offer a selectable (and Continue-enabling) entry for it.
  const [detectedFallback, setDetectedFallback] = useState<{ iana: string; label: string } | null>(null);

  useEffect(() => {
    // Only run once per mount, and only when nothing is selected yet, so
    // reopening the modal keeps whatever the booker already picked.
    if (!open || iana) return;

    if (currentTimezone) {
      const currentMatch = lookupTimezone(currentTimezone);
      if (currentMatch) {
        setCountry(currentMatch.country);
        setIana(currentTimezone);
        setIsAutoDetected(false);
        return;
      }
      setDetectedFallback({
        iana: currentTimezone,
        label: `${currentTimezone} (${getGmtOffsetLabel(currentTimezone)})`,
      });
      setCountry(DETECTED_FALLBACK_COUNTRY);
      setIana(currentTimezone);
      setIsAutoDetected(false);
      return;
    }

    let detectedZone: string | undefined;
    try {
      detectedZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    } catch {
      detectedZone = undefined;
    }
    if (!detectedZone) return;

    const detectedMatch = lookupTimezone(detectedZone);
    if (detectedMatch) {
      setCountry(detectedMatch.country);
      setIana(detectedZone);
      setIsAutoDetected(true);
      return;
    }

    setDetectedFallback({
      iana: detectedZone,
      label: `${detectedZone} (${getGmtOffsetLabel(detectedZone)})`,
    });
    setCountry(DETECTED_FALLBACK_COUNTRY);
    setIana(detectedZone);
    setIsAutoDetected(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentTimezone, iana]);

  const countryOptions = useMemo(() => {
    const base = countries.map((value) => ({ value, label: value }));
    return detectedFallback
      ? [...base, { value: DETECTED_FALLBACK_COUNTRY, label: detectedFallback.label }]
      : base;
  }, [countries, detectedFallback]);

  const regions = useMemo(() => {
    if (country === DETECTED_FALLBACK_COUNTRY && detectedFallback) {
      return [{ iana: detectedFallback.iana, region: detectedFallback.label }];
    }
    return country ? getRegionsForCountry(country) : [];
  }, [country, detectedFallback]);

  const handleCountryChange = (nextCountry: string) => {
    setCountry(nextCountry);
    setIsAutoDetected(false);
    if (nextCountry === DETECTED_FALLBACK_COUNTRY && detectedFallback) {
      setIana(detectedFallback.iana);
      return;
    }
    setIana(getRegionsForCountry(nextCountry)[0]?.iana ?? "");
  };

  const handleRegionChange = (nextIana: string) => {
    setIana(nextIana);
    setIsAutoDetected(false);
  };

  return (
    <DialogPrimitive.Root
      open={open}
      onOpenChange={(nextOpen) => {
        // Radix calls this on Escape/outside-click dismissal (and would on programmatic
        // close, but we don't use that path - the parent flips `open` itself once it
        // decides on a timezone). Treat dismissal as "keep the current timezone" instead
        // of leaving the overlay stuck with no way out.
        if (!nextOpen) {
          onDismiss?.();
        }
      }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fadeIn fixed inset-0 z-50 bg-black/45" />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          className="fadeIn fixed top-1/2 left-1/2 z-50 w-[calc(100vw-2rem)] max-w-[480px] -translate-x-1/2 -translate-y-1/2 rounded bg-white p-8 shadow-xl focus-visible:outline-none">
          <DialogPrimitive.Title className="font-bold text-[#1A1A1A] text-xl">
            {t("your_time_zone")}
          </DialogPrimitive.Title>
          <p className="mt-1 text-[#6B7280] text-sm">
            {t("all_times_will_be_displayed_according_to_your_time_zone")}
          </p>

          <div className="mt-6 flex flex-col gap-5">
            <TimezoneSelectField
              label={t("country")}
              value={country}
              onChange={handleCountryChange}
              options={countryOptions}
              showDetectedIcon={isAutoDetected}
            />
            <TimezoneSelectField
              label={t("region")}
              value={iana}
              onChange={handleRegionChange}
              options={regions.map((r) => ({ value: r.iana, label: r.region }))}
              disabled={!country}
              showDetectedIcon={isAutoDetected}
            />
          </div>

          <div className="mt-8 flex justify-end">
            <button
              type="button"
              disabled={!iana}
              onClick={() => iana && onConfirm(iana)}
              className="rounded-md bg-[var(--cal-brand)] px-6 py-2.5 font-semibold text-sm text-white transition-colors hover:bg-[var(--cal-brand-emphasis)] disabled:cursor-not-allowed disabled:opacity-50">
              {t("continue")}
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
};
