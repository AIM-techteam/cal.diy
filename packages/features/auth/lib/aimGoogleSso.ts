/**
 * AIM: second Google sign-in button backed by the shared AIM + Annuity Gator login client.
 *
 * Why a second provider instead of reusing "google":
 * - The stock "google" provider uses GOOGLE_API_CREDENTIALS, the "Calendars" OAuth app. That app is
 *   Internal to the annuitygator.com Workspace (it asks calendar scopes, which an External app could
 *   only do after Google verification), so Google rejects every @advisorinternetmarketing.com account
 *   with "Access blocked: ... can only be used within its organization".
 * - AIM already has one login-only client that accepts both Workspace tenants: the Hub's
 *   (LDS GOOGLE_SSO_*, Infisical AIM_GOOGLE_SSO_*). Erandi's rule is one shared client for every
 *   sign-in that needs both domains, so cal reuses it under the same env names instead of creating
 *   another OAuth client.
 *
 * The provider only signs people in. It asks no calendar scopes, so it never installs Google Calendar
 * credentials (that path in the jwt callback is keyed on provider === "google") and an AIM staff
 * account signed in this way can never become a booking host by accident.
 *
 * Domain filtering is server-side, like the Hub, because Google's `hd` parameter accepts only one
 * Workspace domain. Existing-account-only is enforced separately by the AIM_ALLOW_GOOGLE_SIGNUP gate
 * in the signIn callback, which applies to this provider too.
 */

import process from "node:process";
export const AIM_GOOGLE_SSO_PROVIDER_ID = "google-aim";

type AimGoogleSsoEnv = Record<string, string | undefined>;

export type AimGoogleSsoConfig = {
  clientId: string;
  clientSecret: string;
  allowedDomains: string[];
};

export const parseAllowedDomains = (raw: string | undefined): string[] => {
  if (!raw) return [];
  const domains = raw
    .split(",")
    .map((domain) => domain.trim().toLowerCase().replace(/^@/, ""))
    .filter((domain) => domain.length > 0);
  return Array.from(new Set(domains));
};

/**
 * Returns null unless the client id, secret AND at least one allowed domain are set. An empty domain
 * list disables the button entirely rather than letting any Google account through, so a deploy that
 * lands before the env vars degrades to password-only login.
 */
export const getAimGoogleSsoConfig = (env: AimGoogleSsoEnv = process.env): AimGoogleSsoConfig | null => {
  const clientId = env.GOOGLE_SSO_CLIENT_ID?.trim();
  const clientSecret = env.GOOGLE_SSO_CLIENT_SECRET?.trim();
  const allowedDomains = parseAllowedDomains(env.GOOGLE_SSO_ALLOWED_DOMAINS);
  if (!clientId || !clientSecret || allowedDomains.length === 0) return null;
  return { clientId, clientSecret, allowedDomains };
};

export const isAimGoogleSsoEmailAllowed = (email: string | null | undefined, allowedDomains: string[]) => {
  if (!email) return false;
  const atIndex = email.lastIndexOf("@");
  if (atIndex < 1) return false;
  const domain = email
    .slice(atIndex + 1)
    .trim()
    .toLowerCase();
  return allowedDomains.includes(domain);
};
