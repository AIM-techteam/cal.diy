/**
 * Annuity Gator brand tokens for the public booking page.
 *
 * Single source of truth consumed in two places: the booking route-group layout
 * (apps/web/app/(booking-page-wrapper)/layout.tsx), which scopes the variables to
 * the page wrapper, and any Radix portal content (e.g. TimezoneModal), which
 * mounts at document.body OUTSIDE that wrapper and therefore must re-declare the
 * variables on its own root to resolve the same colors.
 *
 * Values point at --booking-brand-* (defined for light and dark in
 * packages/config/theme/tokens.css) because an inline style cannot express a
 * dark-mode variant on its own.
 */
export const BOOKING_BRAND_VARS = {
  "--cal-brand": "var(--booking-brand)",
  "--cal-brand-emphasis": "var(--booking-brand-emphasis)",
  "--cal-brand-text": "var(--booking-brand-text)",
} as const;
