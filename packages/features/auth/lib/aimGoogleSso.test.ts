import { describe, expect, it } from "vitest";
import { getAimGoogleSsoConfig, isAimGoogleSsoEmailAllowed, parseAllowedDomains } from "./aimGoogleSso";

const BOTH_DOMAINS = ["advisorinternetmarketing.com", "annuitygator.com"];

describe("parseAllowedDomains", () => {
  it("trims, lowercases, strips a leading @ and dedupes", () => {
    expect(parseAllowedDomains(" AdvisorInternetMarketing.com,@annuitygator.com,annuitygator.com, ")).toEqual(
      BOTH_DOMAINS
    );
  });

  it("returns an empty list for missing or blank input", () => {
    expect(parseAllowedDomains(undefined)).toEqual([]);
    expect(parseAllowedDomains(" , ")).toEqual([]);
  });
});

describe("getAimGoogleSsoConfig", () => {
  const fullEnv = {
    GOOGLE_SSO_CLIENT_ID: "client-id",
    GOOGLE_SSO_CLIENT_SECRET: "client-secret",
    GOOGLE_SSO_ALLOWED_DOMAINS: "advisorinternetmarketing.com,annuitygator.com",
  };

  it("returns the config when id, secret and domains are set", () => {
    expect(getAimGoogleSsoConfig(fullEnv)).toEqual({
      clientId: "client-id",
      clientSecret: "client-secret",
      allowedDomains: BOTH_DOMAINS,
    });
  });

  it.each([
    ["client id", { ...fullEnv, GOOGLE_SSO_CLIENT_ID: "" }],
    ["client secret", { ...fullEnv, GOOGLE_SSO_CLIENT_SECRET: undefined }],
    ["allowed domains", { ...fullEnv, GOOGLE_SSO_ALLOWED_DOMAINS: " " }],
  ])("is disabled when the %s is missing", (_label, env) => {
    expect(getAimGoogleSsoConfig(env)).toBeNull();
  });
});

describe("isAimGoogleSsoEmailAllowed", () => {
  it("accepts both AIM and Annuity Gator mailboxes, any case", () => {
    expect(isAimGoogleSsoEmailAllowed("fernandogodinez@advisorinternetmarketing.com", BOTH_DOMAINS)).toBe(
      true
    );
    expect(isAimGoogleSsoEmailAllowed("Cynthia@AnnuityGator.com", BOTH_DOMAINS)).toBe(true);
  });

  it("rejects other domains, including look-alike subdomains and suffixes", () => {
    expect(isAimGoogleSsoEmailAllowed("someone@gmail.com", BOTH_DOMAINS)).toBe(false);
    expect(isAimGoogleSsoEmailAllowed("x@evil.annuitygator.com", BOTH_DOMAINS)).toBe(false);
    expect(isAimGoogleSsoEmailAllowed("x@annuitygator.com.evil.io", BOTH_DOMAINS)).toBe(false);
  });

  it("rejects missing or malformed emails", () => {
    expect(isAimGoogleSsoEmailAllowed(undefined, BOTH_DOMAINS)).toBe(false);
    expect(isAimGoogleSsoEmailAllowed("no-at-sign", BOTH_DOMAINS)).toBe(false);
    expect(isAimGoogleSsoEmailAllowed("@annuitygator.com", BOTH_DOMAINS)).toBe(false);
  });

  it("rejects everything when the allow-list is empty", () => {
    expect(isAimGoogleSsoEmailAllowed("cynthia@annuitygator.com", [])).toBe(false);
  });
});
