import { describe, expect, it } from "vitest";
import { getTwoDayViewDays, isTwoDayViewEvent } from "./twoDayView";

const slot = (time: string, away = false) => ({ time, ...(away ? { away: true } : {}) });

describe("getTwoDayViewDays", () => {
  it("returns an empty list when slots are not loaded", () => {
    expect(getTwoDayViewDays(undefined)).toEqual([]);
  });

  it("returns the first two days with slots, in chronological order", () => {
    const days = getTwoDayViewDays({
      "2026-11-05": [slot("2026-11-05T15:00:00Z")],
      "2026-11-03": [slot("2026-11-03T15:00:00Z"), slot("2026-11-03T16:00:00Z")],
      "2026-11-04": [slot("2026-11-04T15:00:00Z")],
    });

    expect(days.map((day) => day.date)).toEqual(["2026-11-03", "2026-11-04"]);
    expect(days[0].slots).toHaveLength(2);
  });

  it("skips days without slots", () => {
    const days = getTwoDayViewDays({
      "2026-11-03": [],
      "2026-11-04": [],
      "2026-11-05": [slot("2026-11-05T15:00:00Z")],
      "2026-11-06": [slot("2026-11-06T15:00:00Z")],
    });

    expect(days.map((day) => day.date)).toEqual(["2026-11-05", "2026-11-06"]);
  });

  it("drops away slots and skips days that only have away slots", () => {
    const days = getTwoDayViewDays({
      "2026-11-03": [slot("2026-11-03T15:00:00Z", true)],
      "2026-11-04": [slot("2026-11-04T15:00:00Z", true), slot("2026-11-04T16:00:00Z")],
      "2026-11-05": [slot("2026-11-05T15:00:00Z")],
    });

    expect(days.map((day) => day.date)).toEqual(["2026-11-04", "2026-11-05"]);
    expect(days[0].slots).toEqual([slot("2026-11-04T16:00:00Z")]);
  });

  it("returns fewer days when not enough have slots", () => {
    expect(getTwoDayViewDays({ "2026-11-03": [slot("2026-11-03T15:00:00Z")] })).toHaveLength(1);
  });

  it("honours a custom count", () => {
    const days = getTwoDayViewDays(
      {
        "2026-11-03": [slot("2026-11-03T15:00:00Z")],
        "2026-11-04": [slot("2026-11-04T15:00:00Z")],
      },
      1
    );
    expect(days.map((day) => day.date)).toEqual(["2026-11-03"]);
  });
});

describe("isTwoDayViewEvent", () => {
  it("is true only when the metadata flag is set", () => {
    expect(isTwoDayViewEvent({ metadata: { bookerTwoDayView: true } })).toBe(true);
    expect(isTwoDayViewEvent({ metadata: { bookerTwoDayView: false } })).toBe(false);
    expect(isTwoDayViewEvent({ metadata: {} })).toBe(false);
    expect(isTwoDayViewEvent({ metadata: null })).toBe(false);
    expect(isTwoDayViewEvent(null)).toBe(false);
  });
});
