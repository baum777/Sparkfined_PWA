// utils/sanitizePII.ts

// --- Crypto Address Protection --------------------------------------------
const CRYPTO_MASK_PREFIX = "__CRYPTO_MASK_";

// Extract crypto addresses but DO NOT treat them as PII
function maskCrypto(text: string): { maskedText: string; map: string[] } {
  const map: string[] = [];

  const patterns = [
    /\b0x[a-fA-F0-9]{40}\b/g,                           // ETH
    /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/g,                 // SOL
    /\bbc1[a-zA-Z0-9]{25,59}\b/g,                       // BTC
  ];

  let maskedText = text;

  patterns.forEach((pattern) => {
    maskedText = maskedText.replace(pattern, (match) => {
      const index = map.length;
      map.push(match);
      return `${CRYPTO_MASK_PREFIX}${index}__`;
    });
  });

  return { maskedText, map };
}

function restoreCrypto(text: string, map: string[]): string {
  return text.replace(
    new RegExp(`${CRYPTO_MASK_PREFIX}(\\d+)__`, "g"),
    (_m, index) => map[index] ?? _m
  );
}

// --- PII Sanitization Main Function ---------------------------------------

export function sanitizePII(input: string): string {
  if (!input) return input;

  // 1. Mask crypto addresses first
  const { maskedText, map } = maskCrypto(input);

  let sanitized = maskedText;

  // --- PII Redaction Patterns ---------------------------------------------

  // Email
  sanitized = sanitized.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    "[REDACTED-EMAIL]"
  );

  // SSN
  sanitized = sanitized.replace(/\b\d{3}-\d{2}-\d{4}\b/g, "[REDACTED-SSN]");

  // Credit Card
  sanitized = sanitized.replace(
    /\b(?:\d[ -]*?){13,19}\b/g,
    "[REDACTED-CC]"
  );

  // Phone (fixed regex)
  sanitized = sanitized.replace(
    /\b(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)\d{3}[\s.-]?\d{3,4}\b/g,
    "[REDACTED-PHONE]"
  );

  // 3. Restore crypto addresses unchanged
  return restoreCrypto(sanitized, map);
}
