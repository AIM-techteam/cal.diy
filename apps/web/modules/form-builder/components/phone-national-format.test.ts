import { describe, expect, it } from "vitest";
import {
  applyNumberEdit,
  caretPositionForDigitIndex,
  formatNationalDigits,
  limitNationalDigits,
} from "./phone-national-format";

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

describe("applyNumberEdit", () => {
  const previousDigits = "6022439000";
  // Displayed before each edit: "(602) 243 9000"

  it("keeps the caret after the same digit when a digit is typed mid-number", () => {
    // Caret after "(602) 2", user types 7 -> "(602) 2743 9000" with caret at index 8.
    expect(
      applyNumberEdit({ dialCode: "1", previousDigits: "602243900", typed: "(602) 2743 900", caret: 8 })
    ).toEqual({
      digits: "6022743900",
      caretDigitIndex: 5,
    });
  });

  it("Backspace over a separator deletes the digit before it", () => {
    // Caret right after "(602)", Backspace removes ")".
    expect(
      applyNumberEdit({
        dialCode: "1",
        previousDigits,
        typed: "(602 243 9000",
        caret: 4,
        inputType: "deleteContentBackward",
      })
    ).toEqual({ digits: "602439000", caretDigitIndex: 2 });
  });

  it("Delete over a separator deletes the digit after it", () => {
    // Caret right after "(602)", Delete removes the space.
    expect(
      applyNumberEdit({
        dialCode: "1",
        previousDigits,
        typed: "(602)243 9000",
        caret: 5,
        inputType: "deleteContentForward",
      })
    ).toEqual({ digits: "602439000", caretDigitIndex: 3 });
  });

  it("Delete on a digit removes that digit and keeps the caret in place", () => {
    // Caret after "(602) 2", Delete removes the 4.
    expect(
      applyNumberEdit({
        dialCode: "1",
        previousDigits,
        typed: "(602) 23 9000",
        caret: 7,
        inputType: "deleteContentForward",
      })
    ).toEqual({ digits: "602239000", caretDigitIndex: 4 });
  });

  it("clamps the caret when a pasted leading 1 is dropped", () => {
    expect(applyNumberEdit({ dialCode: "1", previousDigits: "", typed: "16022439000", caret: 11 })).toEqual({
      digits: "6022439000",
      caretDigitIndex: 10,
    });
  });
});

describe("caretPositionForDigitIndex", () => {
  it("places the caret right after the Nth digit of the formatted number", () => {
    expect(caretPositionForDigitIndex("(602) 243 9000", 0)).toBe(1);
    expect(caretPositionForDigitIndex("(602) 243 9000", 3)).toBe(4);
    expect(caretPositionForDigitIndex("(602) 243 9000", 5)).toBe(8);
    expect(caretPositionForDigitIndex("(602) 243 9000", 10)).toBe(14);
  });

  it("returns the end of the text when the index is past the last digit", () => {
    expect(caretPositionForDigitIndex("(602)", 7)).toBe(5);
    expect(caretPositionForDigitIndex("", 0)).toBe(0);
  });
});
