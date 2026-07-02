"use client";

import { useLocale } from "@calcom/lib/hooks/useLocale";
import { ChevronDownIcon } from "@coss/ui/icons";
import type { CountryCode } from "libphonenumber-js";
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString } from "libphonenumber-js";
import { useEffect, useMemo, useState } from "react";

type OnceHubPhoneInputProps = {
  name?: string;
  value?: string;
  placeholder?: string;
  readOnly?: boolean;
  onChange: (value: string) => void;
};

const FALLBACK_COUNTRY: CountryCode = "US";

function detectDefaultCountry(): CountryCode {
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
  const [country, setCountry] = useState<CountryCode>(
    () => countryFromValue(value) ?? detectDefaultCountry()
  );

  // Adopt the country of externally-set values (prefill, reschedule, location-phone sync)
  // so the visible selection never diverges from what will actually be submitted.
  const parsedCountry = countryFromValue(value);
  useEffect(() => {
    if (parsedCountry && parsedCountry !== country) setCountry(parsedCountry);
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
  const nationalDigits = value?.startsWith(`+${dialCode}`)
    ? value.slice(dialCode.length + 1)
    : (value ?? "").replace(/\D/g, "");

  const emit = (nextCountry: CountryCode, digits: string) => {
    const cleaned = digits.replace(/\D/g, "");
    onChange(cleaned ? `+${getCountryCallingCode(nextCountry)}${cleaned}` : "");
  };

  return (
    <div className="flex items-end gap-4">
      <div className="relative w-2/5 shrink-0">
        <select
          aria-label={t("country")}
          className="w-full appearance-none border-0 border-b border-[#D1D5DB] bg-transparent py-1.5 pr-6 text-sm text-[#1A1A1A] focus:border-[var(--cal-brand)] focus:outline-none disabled:opacity-60"
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
        <ChevronDownIcon className="pointer-events-none absolute right-1 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6B7280]" />
      </div>
      <input
        id={name}
        name={name}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        className="w-full border-0 border-b border-[#D1D5DB] bg-transparent py-1.5 text-sm text-[#1A1A1A] placeholder:text-[#9CA3AF] focus:border-[var(--cal-brand)] focus:outline-none disabled:opacity-60"
        placeholder={placeholder}
        readOnly={readOnly}
        value={nationalDigits}
        onChange={(e) => emit(country, e.target.value)}
      />
    </div>
  );
};
