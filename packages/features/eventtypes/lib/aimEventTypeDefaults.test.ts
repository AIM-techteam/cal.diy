import { describe, expect, it } from "vitest";
import { withAimEventTypeDefaults } from "./aimEventTypeDefaults";

describe("withAimEventTypeDefaults", () => {
  it("turns on the two-day view and English when nothing is set", () => {
    const result = withAimEventTypeDefaults({ title: "Test" });
    expect(result).toEqual({ title: "Test", metadata: { bookerTwoDayView: true }, interfaceLanguage: "en" });
  });

  it("keeps the other metadata keys", () => {
    const result = withAimEventTypeDefaults({ metadata: { multipleDuration: [15, 30] } });
    expect(result.metadata).toEqual({ bookerTwoDayView: true, multipleDuration: [15, 30] });
  });

  it("keeps an explicit bookerTwoDayView=false", () => {
    const result = withAimEventTypeDefaults({ metadata: { bookerTwoDayView: false } });
    expect(result.metadata.bookerTwoDayView).toBe(false);
  });

  it("keeps an interface language that is already set", () => {
    expect(withAimEventTypeDefaults({ interfaceLanguage: "es" }).interfaceLanguage).toBe("es");
  });

  it("treats null or empty values as unset", () => {
    const result = withAimEventTypeDefaults({ metadata: null, interfaceLanguage: "" });
    expect(result.metadata).toEqual({ bookerTwoDayView: true });
    expect(result.interfaceLanguage).toBe("en");
  });
});
