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
