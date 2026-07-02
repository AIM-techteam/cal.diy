/**
 * Static IANA timezone -> country/region lookup for the OnceHub-style timezone
 * picker on the public booking page. Deliberately not exhaustive: this is a
 * curated shortlist (not the full IANA database) covering the regions we
 * expect most bookers to be in.
 */

export type TimezoneEntry = {
  country: string;
  region: string;
};

export type TimezoneRegionOption = {
  iana: string;
  region: string;
};

export const TIMEZONE_MAP: Record<string, TimezoneEntry> = {
  // Mexico
  "America/Mexico_City": {
    country: "Mexico",
    region: "South, central and eastern (Mexico City, Guadalajara, Puebla)",
  },
  "America/Cancun": {
    country: "Mexico",
    region: "Eastern (Cancún, Chetumal)",
  },
  "America/Tijuana": {
    country: "Mexico",
    region: "Northwest (Tijuana, Mexicali)",
  },
  "America/Hermosillo": {
    country: "Mexico",
    region: "Pacific - no DST (Hermosillo)",
  },
  "America/Chihuahua": {
    country: "Mexico",
    region: "Pacific (Chihuahua, Mazatlán)",
  },

  // United States
  "America/New_York": {
    country: "United States",
    region: "Eastern Time (New York, Atlanta, Boston)",
  },
  "America/Chicago": {
    country: "United States",
    region: "Central Time (Chicago, Dallas, Houston)",
  },
  "America/Denver": {
    country: "United States",
    region: "Mountain Time (Denver, Salt Lake City)",
  },
  "America/Phoenix": {
    country: "United States",
    region: "Mountain Time - no DST (Phoenix)",
  },
  "America/Los_Angeles": {
    country: "United States",
    region: "Pacific Time (Los Angeles, Seattle, San Francisco)",
  },
  "America/Anchorage": {
    country: "United States",
    region: "Alaska Time (Anchorage)",
  },
  "Pacific/Honolulu": {
    country: "United States",
    region: "Hawaii-Aleutian Time (Honolulu)",
  },

  // Canada
  "America/Toronto": {
    country: "Canada",
    region: "Eastern Time (Toronto, Ottawa, Montréal)",
  },
  "America/Vancouver": {
    country: "Canada",
    region: "Pacific Time (Vancouver, Victoria)",
  },
  "America/Edmonton": {
    country: "Canada",
    region: "Mountain Time (Edmonton, Calgary)",
  },
  "America/Winnipeg": {
    country: "Canada",
    region: "Central Time (Winnipeg)",
  },
  "America/Halifax": {
    country: "Canada",
    region: "Atlantic Time (Halifax)",
  },

  // Latin America
  "America/Argentina/Buenos_Aires": {
    country: "Argentina",
    region: "Argentina Time (Buenos Aires, Córdoba)",
  },
  "America/Bogota": {
    country: "Colombia",
    region: "Colombia Time (Bogotá, Medellín)",
  },
  "America/Lima": {
    country: "Peru",
    region: "Peru Time (Lima)",
  },
  "America/Santiago": {
    country: "Chile",
    region: "Chile Time (Santiago)",
  },
  "America/Sao_Paulo": {
    country: "Brazil",
    region: "Brasília Time (São Paulo, Rio de Janeiro)",
  },

  // Europe
  "Europe/London": {
    country: "United Kingdom",
    region: "Greenwich Mean Time (London, Edinburgh)",
  },
  "Europe/Madrid": {
    country: "Spain",
    region: "Central European Time (Madrid, Barcelona)",
  },
  "Europe/Berlin": {
    country: "Germany",
    region: "Central European Time (Berlin, Paris, Rome)",
  },
};

export const getCountries = (): string[] => {
  const countries = new Set<string>();
  for (const entry of Object.values(TIMEZONE_MAP)) {
    countries.add(entry.country);
  }
  return Array.from(countries).sort((a, b) => a.localeCompare(b));
};

export const getRegionsForCountry = (country: string): TimezoneRegionOption[] => {
  return Object.entries(TIMEZONE_MAP)
    .filter(([, entry]) => entry.country === country)
    .map(([iana, entry]) => ({ iana, region: entry.region }))
    .sort((a, b) => a.region.localeCompare(b.region));
};

export const lookupTimezone = (iana: string): TimezoneEntry | undefined => {
  return TIMEZONE_MAP[iana];
};

/**
 * Normalizes the "shortOffset" timeZoneName Intl gives us (e.g. "GMT-6", "GMT+5:30", "GMT")
 * into the "GMT-6:00" / "GMT+5:30" form used by the OnceHub-style timezone label.
 */
const normalizeGmtOffset = (rawOffset: string): string => {
  const match = rawOffset.match(/^GMT([+-]\d{1,2})(?::(\d{2}))?$/);
  if (!match) {
    // Intl reports exact UTC as plain "GMT" with no sign.
    return rawOffset === "GMT" ? "GMT+0:00" : rawOffset;
  }
  const [, hours, minutes] = match;
  return `GMT${hours}:${minutes ?? "00"}`;
};

export const getGmtOffsetLabel = (iana: string): string => {
  try {
    const parts = new Intl.DateTimeFormat("en", {
      timeZone: iana,
      timeZoneName: "shortOffset",
    }).formatToParts(new Date());
    const offsetPart = parts.find((part) => part.type === "timeZoneName")?.value;
    return offsetPart ? normalizeGmtOffset(offsetPart) : "GMT+0:00";
  } catch {
    // Invalid/unknown IANA name - Intl throws a RangeError.
    return "";
  }
};

/**
 * Human-readable "{country}; {region} (GMT offset)" label for the effective timezone,
 * e.g. "United States; Mountain Time (Denver, Salt Lake City) (GMT-6:00)".
 * Falls back to the raw IANA name when it isn't in TIMEZONE_MAP.
 */
export const formatTimezoneLabel = (iana: string): string => {
  const offsetLabel = getGmtOffsetLabel(iana);
  const match = lookupTimezone(iana);
  if (!match) {
    return offsetLabel ? `${iana} (${offsetLabel})` : iana;
  }
  return offsetLabel
    ? `${match.country}; ${match.region} (${offsetLabel})`
    : `${match.country}; ${match.region}`;
};
