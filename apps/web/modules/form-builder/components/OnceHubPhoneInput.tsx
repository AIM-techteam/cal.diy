"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { ChevronDownIcon } from "@coss/ui/icons";
import type { CountryCode } from "libphonenumber-js";
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString } from "libphonenumber-js";
import { useEffect, useMemo, useState } from "react";
import { TWO_DAY_INPUT_CLASS, useBookingFormStyle } from "./BookingFormStyleContext";

type OnceHubPhoneInputProps = {
  name?: string;
  value?: string;
  placeholder?: string;
  readOnly?: boolean;
  onChange: (value: string) => void;
};

const FALLBACK_COUNTRY: CountryCode = "US";

function detectDefaultCountry(): CountryCode {
  // Runs during the Next.js server render pass for this client component, where
  // `navigator` is undefined - guard so an SSR'd booking form doesn't crash.
  if (typeof navigator === "undefined") return FALLBACK_COUNTRY;
  const region = new Intl.Locale(navigator.language).region as CountryCode | undefined;
  return region && getCountries().includes(region) ? region : FALLBACK_COUNTRY;
}

function countryFromValue(value: string | undefined): CountryCode | undefined {
  if (!value) return undefined;
  return parsePhoneNumberFromString(value)?.country;
}

/**
 * OnceHub-style split phone field: a country select rendered as "Name (+code)" text
 * and a separate national-number input, both underlined. Covers every country known
 * to libphonenumber-js; names are localized via Intl.DisplayNames. The emitted value
 * is always E.164 (+<dial><digits>), matching what the booking response schema
 * validates with isValidPhoneNumber.
 */
export const OnceHubPhoneInput = ({
  name,
  value,
  placeholder,
  readOnly,
  onChange,
}: OnceHubPhoneInputProps) => {
  const { t, i18n } = useLocale();
  const formStyle = useBookingFormStyle();
  const [country, setCountry] = useState<CountryCode>(
    () => countryFromValue(value) ?? detectDefaultCountry()
  );

  // Parse the incoming value once per change instead of on every render (and instead of
  // parsing separately for the country and the national number below).
  const parsed = useMemo(() => (value ? parsePhoneNumberFromString(value) : undefined), [value]);
  const parsedCountry = parsed?.country;

  // Adopt the country of externally-set values (prefill, reschedule, location-phone sync)
  // so the visible selection never diverges from what will actually be submitted. Only
  // adopt it when the value belongs to a *different dial code*: libphonenumber resolves a
  // "+1..." number to a single country, so comparing by country alone would snap a manual
  // pick among same-dial-code countries (US/CA, KZ/RU, ...) straight back.
  useEffect(() => {
    if (parsedCountry && getCountryCallingCode(parsedCountry) !== getCountryCallingCode(country)) {
      setCountry(parsedCountry);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [parsedCountry]);

  const countries = useMemo(() => {
    const displayNames = new Intl.DisplayNames([i18n.language], { type: "region" });
    return getCountries()
      .map((code) => ({
        code,
        label: `${displayNames.of(code) ?? code} (+${getCountryCallingCode(code)})`,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, i18n.language));
  }, [i18n.language]);

  const dialCode = getCountryCallingCode(country);
  // Prefer libphonenumber's own national-number split so a value whose country code
  // doesn't match the (possibly lagging) `country` state still shows the right digits
  // instead of leaking the foreign dial code. Falls back to a prefix strip while the
  // number is still too partial for libphonenumber to parse.
  const nationalDigits = parsed?.nationalNumber
    ? parsed.nationalNumber
    : value?.startsWith(`+${dialCode}`)
      ? value.slice(dialCode.length + 1)
      : (value ?? "").replace(/\D/g, "");

  const emit = (nextCountry: CountryCode, digits: string) => {
    const cleaned = digits.replace(/\D/g, "");
    if (!cleaned) {
      onChange("");
      return;
    }
    const candidate = `+${getCountryCallingCode(nextCountry)}${cleaned}`;
    // Canonicalize to E.164 once the number parses so the stored value matches the
    // digits we display (parsed.nationalNumber) and never carries a national trunk
    // prefix - e.g. GB "07911123456" is stored as "+447911123456", not "+4407911123456".
    onChange(parsePhoneNumberFromString(candidate)?.number ?? candidate);
  };

  if (formStyle === "two-day") {
    return (
      <div className="flex gap-[10px]">
        <div className="relative w-[32%] shrink-0">
          {/* The full "Country (+code)" names only fit in the open list; the closed select
              shows "US +1" through this overlay, with the select's own text transparent. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-(--td-ink) text-lg">
            {country} +{dialCode}
          </span>
          <select
            aria-label={t("country")}
            className={`${TWO_DAY_INPUT_CLASS} appearance-none pr-9 text-transparent! [&>option]:text-(--td-ink) [&>option]:bg-(--td-surface)`}
            value={country}
            disabled={readOnly}
            onChange={(e) => {
              const next = e.target.value as CountryCode;
              setCountry(next);
              emit(next, nationalDigits);
            }}>
            {countries.map((c) => (
              <option key={c.code} value={c.code}>
                {c.label}
              </option>
            ))}
          </select>
          <ChevronDownIcon className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-(--td-olive)" />
        </div>
        <input
          id={name}
          name={name}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          className={TWO_DAY_INPUT_CLASS}
          placeholder={placeholder || "(555) 555-5555"}
          readOnly={readOnly}
          value={nationalDigits}
          onChange={(e) => emit(country, e.target.value)}
        />
      </div>
    );
  }

  return (
    <div className="flex items-end gap-4">
      <div className="relative w-2/5 shrink-0">
        <select
          aria-label={t("country")}
          className="w-full appearance-none border-0 border-b border-[#D1D5DB] bg-transparent py-1.5 pr-6 text-sm text-[#1A1A1A] dark:border-[#3f3c33] dark:text-[#ece9df] dark:[&>option]:bg-[#1c1b17] focus:border-[var(--cal-brand)] focus:outline-none disabled:opacity-60"
          value={country}
          disabled={readOnly}
          onChange={(e) => {
            const next = e.target.value as CountryCode;
            setCountry(next);
            emit(next, nationalDigits);
          }}>
          {countries.map((c) => (
            <option key={c.code} value={c.code}>
              {c.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon className="pointer-events-none absolute right-1 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280] dark:text-[#b3af9e]" />
      </div>
      <input
        id={name}
        name={name}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        className="w-full border-0 border-b border-[#D1D5DB] bg-transparent py-1.5 text-sm text-[#1A1A1A] placeholder:text-[#9CA3AF] dark:border-[#3f3c33] dark:text-[#ece9df] dark:placeholder:text-[#7d7a6c] focus:border-[var(--cal-brand)] focus:outline-none disabled:opacity-60"
        placeholder={placeholder}
        readOnly={readOnly}
        value={nationalDigits}
        onChange={(e) => emit(country, e.target.value)}
      />
    </div>
  );
};
