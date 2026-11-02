import { describe, expect, it } from "vitest";
import { formatShortTimezoneLabel } from "./timezone-map";

describe("formatShortTimezoneLabel", () => {
  it("uses the mockup labels for US zones", () => {
    expect(formatShortTimezoneLabel("America/New_York")).toBe("Eastern Time");
    expect(formatShortTimezoneLabel("America/Chicago")).toBe("Central Time");
    expect(formatShortTimezoneLabel("America/Phoenix")).toBe("Arizona Time");
    expect(formatShortTimezoneLabel("Pacific/Honolulu")).toBe("Hawaii Time");
  });

  it("falls back to the generic English name for other zones", () => {
    expect(formatShortTimezoneLabel("America/Detroit")).toBe("Eastern Time");
  });

  it("returns the input for an unknown zone", () => {
    expect(formatShortTimezoneLabel("Not/AZone")).toBe("Not/AZone");
  });
});
