// Nearly every Annuity Gator booker dials from the NANP region (+1), where a national number is
// always exactly 10 digits. Without a cap the field accepted extra digits that only failed later in
// isValidPhoneNumber, and the bare digit run was hard to proof-read, so +1 numbers are capped and
// shown as "(602) 243 9000". Other dial codes keep their raw digits: their lengths vary too much to
// cap safely here.
const NANP_DIAL_CODE = "1";
const NANP_NATIONAL_LENGTH = 10;

export function limitNationalDigits(dialCode: string, digits: string): string {
  const cleaned = digits.replace(/\D/g, "");
  if (dialCode !== NANP_DIAL_CODE) return cleaned;
  // A pasted "1 602 243 9000" carries the country code as a leading 1. NANP area codes never start
  // with 1, so drop it instead of letting the cap cut off the last real digit.
  const national =
    cleaned.length > NANP_NATIONAL_LENGTH && cleaned.startsWith("1") ? cleaned.slice(1) : cleaned;
  return national.slice(0, NANP_NATIONAL_LENGTH);
}

export function formatNationalDigits(dialCode: string, digits: string): string {
  const cleaned = limitNationalDigits(dialCode, digits);
  if (dialCode !== NANP_DIAL_CODE || !cleaned) return cleaned;

  const area = cleaned.slice(0, 3);
  const exchange = cleaned.slice(3, 6);
  const line = cleaned.slice(6);
  if (cleaned.length < 3) return `(${area}`;
  if (!exchange) return `(${area})`;
  if (!line) return `(${area}) ${exchange}`;
  return `(${area}) ${exchange} ${line}`;
}

const countDigits = (text: string): number => text.replace(/\D/g, "").length;

type NumberEdit = {
  dialCode: string;
  previousDigits: string;
  typed: string;
  caret: number;
  inputType?: string;
};

// The field re-renders a formatted value after every keystroke, so the browser's own caret and
// delete behaviour no longer line up with what was typed. Every edit is therefore reduced to digits
// plus "how many digits sit before the caret", which survives reformatting.
export function applyNumberEdit({ dialCode, previousDigits, typed, caret, inputType }: NumberEdit): {
  digits: string;
  caretDigitIndex: number;
} {
  const previous = limitNationalDigits(dialCode, previousDigits);
  let digits = typed.replace(/\D/g, "");
  let caretDigitIndex = countDigits(typed.slice(0, caret));

  // Backspace or Delete on "(", ")" or a space leaves the digits unchanged, so the re-render would
  // put the character straight back and the key would look dead. Delete the neighbouring digit in
  // the direction the key points instead.
  const deletedSeparator =
    typed.length < formatNationalDigits(dialCode, previous).length && digits === previous;
  if (deletedSeparator && inputType === "deleteContentForward") {
    digits = digits.slice(0, caretDigitIndex) + digits.slice(caretDigitIndex + 1);
  } else if (deletedSeparator && caretDigitIndex > 0) {
    digits = digits.slice(0, caretDigitIndex - 1) + digits.slice(caretDigitIndex);
    caretDigitIndex -= 1;
  }

  const limited = limitNationalDigits(dialCode, digits);
  return { digits: limited, caretDigitIndex: Math.min(caretDigitIndex, limited.length) };
}

export function caretPositionForDigitIndex(formatted: string, digitIndex: number): number {
  if (digitIndex <= 0) {
    const firstDigit = formatted.search(/\d/);
    return firstDigit === -1 ? formatted.length : firstDigit;
  }
  let seen = 0;
  for (let position = 0; position < formatted.length; position++) {
    if (/\d/.test(formatted[position])) seen++;
    if (seen === digitIndex) return position + 1;
  }
  return formatted.length;
}
