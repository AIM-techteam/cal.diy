// @vitest-environment node
// jose needs Node's own Uint8Array; under jsdom it throws "payload must be an instance of Uint8Array".
import { WEBSITE_URL } from "@calcom/lib/constants";
import { SignJWT } from "jose";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import signJwt from "./signJwt";
import { verifyTotpLoginJwt } from "./verifyTotpLoginJwt";

const KEY = "k".repeat(32);
const EMAIL = "Erandi@AdvisorInternetMarketing.com";

const sign = (
  payload: Record<string, unknown>,
  options: { key?: string; subject?: string; expiresAt?: number } = {}
) =>
  new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(options.subject ?? (payload.email as string))
    .setIssuedAt()
    .setIssuer(WEBSITE_URL)
    .setAudience(`${WEBSITE_URL}/auth/login`)
    .setExpirationTime(options.expiresAt ?? "2m")
    .sign(new TextEncoder().encode(options.key ?? KEY));

describe("verifyTotpLoginJwt", () => {
  beforeEach(() => {
    vi.stubEnv("CALENDSO_ENCRYPTION_KEY", KEY);
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("accepts a token minted by signJwt (the real producer) and returns the lowercased email", async () => {
    expect(await verifyTotpLoginJwt(await signJwt({ email: EMAIL }))).toBe(EMAIL.toLowerCase());
  });

  it("rejects a token signed with another key", async () => {
    expect(await verifyTotpLoginJwt(await sign({ email: EMAIL }, { key: "x".repeat(32) }))).toBeNull();
  });

  it("rejects an expired token", async () => {
    expect(
      await verifyTotpLoginJwt(
        await sign({ email: EMAIL }, { expiresAt: Math.floor(Date.now() / 1000) - 60 })
      )
    ).toBeNull();
  });

  it("rejects a token whose subject does not match its email", async () => {
    expect(await verifyTotpLoginJwt(await sign({ email: EMAIL }, { subject: "other@x.com" }))).toBeNull();
  });

  it("rejects a token without an email", async () => {
    expect(await verifyTotpLoginJwt(await sign({}, { subject: EMAIL }))).toBeNull();
  });

  it("rejects garbage, empty input and a missing encryption key", async () => {
    expect(await verifyTotpLoginJwt("not-a-jwt")).toBeNull();
    expect(await verifyTotpLoginJwt(undefined)).toBeNull();
    const token = await signJwt({ email: EMAIL });
    vi.stubEnv("CALENDSO_ENCRYPTION_KEY", "");
    expect(await verifyTotpLoginJwt(token)).toBeNull();
  });
});
