// utils/detectPII.ts

// same regexes as sanitizer
const PHONE_REGEX =
  /\b(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)\d{3}[\s.-]?\d{3,4}\b/g;

const CREDITCARD_REGEX = /\b(?:\d[ -]?){13,19}\b/g;

const EMAIL_REGEX =
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

const SSN_REGEX = /\b\d{3}-\d{2}-\d{4}\b/g;

// CRYPTO that must NOT be treated as PII
const ETH_REGEX = /\b0x[a-fA-F0-9]{40}\b/g;
const SOL_REGEX = /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/g;
const BTC_REGEX = /\bbc1[a-zA-Z0-9]{25,59}\b/g;

export function detectPIITypes(input: string): string[] {
  const types = new Set<string>();

  if (EMAIL_REGEX.test(input)) types.add("email");

  // Do NOT classify crypto as phone
  if (
    PHONE_REGEX.test(input) &&
    !ETH_REGEX.test(input) &&
    !SOL_REGEX.test(input) &&
    !BTC_REGEX.test(input)
  ) {
    types.add("phone");
  }

  if (
    CREDITCARD_REGEX.test(input) &&
    !ETH_REGEX.test(input) &&
    !SOL_REGEX.test(input)
  ) {
    types.add("creditcard");
  }

  if (SSN_REGEX.test(input)) types.add("ssn");

  return [...types];
}
