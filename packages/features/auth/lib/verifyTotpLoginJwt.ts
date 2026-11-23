import process from "node:process";
import { WEBSITE_URL } from "@calcom/lib/constants";
import { jwtVerify } from "jose";

/**
 * Verifies the short-lived token that the OAuth signIn callback puts in `/auth/login?totp=<jwt>`
 * (see `loginWithTotp` + `signJwt.ts`) when a user with 2FA signs in with Google/SAML/Azure AD.
 *
 * Why this exists (AIM): the credentials authorize step always checks a password, so after an
 * OAuth sign-in the second step could never succeed (no password is sent, and accounts converted
 * from CAL still have a hash). The signed token is the proof that the OAuth step already
 * authenticated this email; with it, authorize skips the password and still requires the TOTP
 * or backup code. It is signed with CALENDSO_ENCRYPTION_KEY and expires after 2 minutes.
 *
 * Returns the token's email (lowercased), or null for any invalid, expired or foreign token.
 */
export const verifyTotpLoginJwt = async (token: string | null | undefined): Promise<string | null> => {
  if (!token || !process.env.CALENDSO_ENCRYPTION_KEY) return null;
  try {
    const secret = new TextEncoder().encode(process.env.CALENDSO_ENCRYPTION_KEY);
    const { payload } = await jwtVerify(token, secret, {
      issuer: WEBSITE_URL,
      audience: `${WEBSITE_URL}/auth/login`,
      algorithms: ["HS256"],
    });
    const email = typeof payload.email === "string" ? payload.email : null;
    if (!email || payload.sub !== email) return null;
    return email.toLowerCase();
  } catch {
    return null;
  }
};
