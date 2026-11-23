import { describe, expect, it } from "vitest";
import { formatNationalDigits, limitNationalDigits } from "./phone-national-format";

describe("limitNationalDigits", () => {
  it("caps NANP numbers (dial code 1) at 10 digits", () => {
    expect(limitNationalDigits("1", "60224390001234")).toBe("6022439000");
  });

  it("drops a pasted leading country-code 1 before capping", () => {
    expect(limitNationalDigits("1", "16022439000")).toBe("6022439000");
    expect(formatNationalDigits("1", "+1 (602) 243-9000")).toBe("(602) 243 9000");
  });

  it("leaves numbers of other dial codes untouched", () => {
    expect(limitNationalDigits("44", "791112345678")).toBe("791112345678");
  });
});

describe("formatNationalDigits", () => {
  it("formats a full NANP number as (XXX) XXX XXXX", () => {
    expect(formatNationalDigits("1", "6022439000")).toBe("(602) 243 9000");
  });

  it("formats partial NANP input progressively", () => {
    expect(formatNationalDigits("1", "")).toBe("");
    expect(formatNationalDigits("1", "60")).toBe("(60");
    expect(formatNationalDigits("1", "602")).toBe("(602)");
    expect(formatNationalDigits("1", "6022")).toBe("(602) 2");
    expect(formatNationalDigits("1", "602243")).toBe("(602) 243");
    expect(formatNationalDigits("1", "6022439")).toBe("(602) 243 9");
  });

  it("returns raw digits for other dial codes", () => {
    expect(formatNationalDigits("44", "7911123456")).toBe("7911123456");
  });
});
