import { IdentityProvider } from "@calcom/prisma/enums";

/**
 * Maps NextAuth provider names to IdentityProvider enum values.
 * Includes aliases (e.g., "saml-idp" -> SAML).
 */
export const NEXTAUTH_TO_IDENTITY_PROVIDER: Record<string, IdentityProvider> = {
  "azure-ad": IdentityProvider.AZUREAD,
  google: IdentityProvider.GOOGLE,
  // AIM: login-only Google provider on the shared AIM + AG client (see aimGoogleSso.ts). Same Google
  // identity (`sub` is per Google account, not per OAuth client), so it maps to the same user row.
  "google-aim": IdentityProvider.GOOGLE,
  saml: IdentityProvider.SAML,
  "saml-idp": IdentityProvider.SAML,
  cal: IdentityProvider.CAL,
};

/**
 * Get IdentityProvider enum from NextAuth provider name.
 * Returns null for unknown providers so callers can reject the login gracefully.
 */
export const getIdentityProvider = (nextAuthProvider: string): IdentityProvider | null => {
  return NEXTAUTH_TO_IDENTITY_PROVIDER[nextAuthProvider] ?? null;
};
