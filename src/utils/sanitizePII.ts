// utils/sanitizePII.ts

// --- 1. PROTECT CRYPTO ADDRESSES BEFORE ANYTHING ELSE ------------------------

const ETH_REGEX = /\b0x[a-fA-F0-9]{40}\b/g;  
const SOL_REGEX = /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/g; 
const BTC_REGEX = /\bbc1[a-zA-Z0-9]{25,59}\b/g;

function protectCrypto(text: string) {
  const protected: string[] = [];

  const protect = (regex: RegExp) => {
    text = text.replace(regex, (m) => {
      protected.push(m);
      return `__CRYPTO_${protected.length - 1}__`;
    });
  };

  protect(ETH_REGEX);
  protect(SOL_REGEX);
  protect(BTC_REGEX);

  return { text, protected };
}

function restoreCrypto(text: string, protectedArr: string[]) {
  protectedArr.forEach((value, idx) => {
    text = text.replace(`__CRYPTO_${idx}__`, value);
  });
  return text;
}

// --- 2. FIXED PHONE REGEX ----------------------------------------------------
// Must NOT match:
// - credit cards
// - crypto addresses
// - long numbers like timestamps
// - 10–16 digit sequences without separators
//
// Must match:
// - German formats like 0176-12345678
// - +49 176 12345678
// - (555) 123-4567
// - 555-123-4567

const PHONE_REGEX =
  /\b(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)\d{3}[\s.-]?\d{3,4}\b/g;

// --- 3. CREDIT CARD REGEX ----------------------------------------------------
// Matches 13–19 digit credit cards with optional spaces/dashes

const CREDITCARD_REGEX = /\b(?:\d[ -]?){13,19}\b/g;

// --- 4. EMAIL & SSN ----------------------------------------------------------

const EMAIL_REGEX =
  /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

const SSN_REGEX = /\b\d{3}-\d{2}-\d{4}\b/g;

// --- 5. SANITIZER ------------------------------------------------------------

export function sanitizePII(input: string): string {
  if (!input) return input;

  // Step 1 — protect crypto
  const { text: protectedText, protected: cryptoStore } = protectCrypto(input);

  let out = protectedText;

  // Order matters!
  out = out.replace(EMAIL_REGEX, "[REDACTED-EMAIL]");
  out = out.replace(SSN_REGEX, "[REDACTED-SSN]");
  out = out.replace(CREDITCARD_REGEX, "[REDACTED-CC]");
  out = out.replace(PHONE_REGEX, "[REDACTED-PHONE]");

  // Step 4 — restore crypto
  out = restoreCrypto(out, cryptoStore);

  return out;
}
