/**
 * OnceHub-style brand tokens for the public booking page.
 *
 * Single source of truth consumed in two places: the booking route-group layout
 * (apps/web/app/(booking-page-wrapper)/layout.tsx), which scopes the variables to
 * the page wrapper, and any Radix portal content (e.g. TimezoneModal), which
 * mounts at document.body OUTSIDE that wrapper and therefore must re-declare the
 * variables on its own root to resolve the same colors.
 */
export const BOOKING_BRAND_VARS = {
  "--cal-brand": "#FEA838",
  "--cal-brand-emphasis": "#E89828",
  "--cal-brand-text": "#ffffff",
} as const;
