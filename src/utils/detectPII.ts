/**
 * PII Detection Utility
 * 
 * Detects types of PII present in text without redacting.
 * Used for validation and telemetry.
 * 
 * CRITICAL: Must NOT detect crypto addresses as PII
 * 
 * @module detectPII
 */

// =============================================================================
// PII PATTERNS (Same as sanitizePII.ts)
// =============================================================================

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const SSN_REGEX = /\b\d{3}-\d{2}-\d{4}\b/g;
const CREDITCARD_REGEX = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g;

// German mobile phone numbers (same as sanitizePII.ts)
const GERMAN_MOBILE_INTL_REGEX =
  /\+49[\s\-]?1[5-7][0-9][\s\-]?\d{3,4}[\s\-]?\d{4,5}\b/g;

const GERMAN_MOBILE_LOCAL_REGEX =
  /\b0?1[5-7][0-9][\s\-]?\d{3,4}[\s\-]?\d{4,5}\b/g;

// US phone numbers (separator required)
// Supports: (555) 123-4567, 555-123-4567, 555-1234
// Lookahead enforces at least one format character
const US_PHONE_REGEX =
  /(?:\+1[\s\-]?)?(?=.*[()\s-])(?:\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4}|\d{3}[\s\-]\d{4})\b/g;

// =============================================================================
// CRYPTO ADDRESS PATTERNS (Must NOT be classified as PII)
// =============================================================================

const ETH_REGEX = /\b0x[a-fA-F0-9]{40}\b/g;
const SOL_REGEX = /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/g;
const BTC_REGEX = /\bbc1[a-zA-Z0-9]{25,59}\b/g;

// =============================================================================
// HELPER: Check if text contains crypto addresses
// =============================================================================

/**
 * Checks if text contains any crypto addresses
 * Used to prevent false positives in PII detection
 * 
 * Resets regex state before testing to ensure consistent results
 */
function hasCryptoAddresses(text: string): boolean {
  // Reset regex state before testing
  ETH_REGEX.lastIndex = 0;
  SOL_REGEX.lastIndex = 0;
  BTC_REGEX.lastIndex = 0;
  
  return (
    ETH_REGEX.test(text) ||
    SOL_REGEX.test(text) ||
    BTC_REGEX.test(text)
  );
}

// =============================================================================
// MAIN DETECTION FUNCTION
// =============================================================================

/**
 * Detects types of PII present in text
 * 
 * Returns array of detected PII types:
 * - "email": Email addresses found
 * - "phone": Phone numbers found (excluding crypto addresses)
 * - "creditcard": Credit card numbers found (excluding crypto addresses)
 * - "ssn": US Social Security Numbers found
 * 
 * @param input - Text to analyze
 * @returns Array of detected PII types (empty if none found)
 * 
 * @example
 * detectPIITypes("Email: user@example.com Phone: 555-123-4567")
 * // Returns: ["email", "phone"]
 * 
 * @example
 * detectPIITypes("Wallet: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb")
 * // Returns: [] (crypto addresses are not PII)
 */
export function detectPIITypes(input: string): string[] {
  if (!input) return [];

  const types: string[] = [];

  // Reset regex indices for fresh test
  EMAIL_REGEX.lastIndex = 0;
  SSN_REGEX.lastIndex = 0;
  CREDITCARD_REGEX.lastIndex = 0;
  GERMAN_MOBILE_INTL_REGEX.lastIndex = 0;
  GERMAN_MOBILE_LOCAL_REGEX.lastIndex = 0;
  US_PHONE_REGEX.lastIndex = 0;
  ETH_REGEX.lastIndex = 0;
  SOL_REGEX.lastIndex = 0;
  BTC_REGEX.lastIndex = 0;

  const hasEmail = EMAIL_REGEX.test(input);
  EMAIL_REGEX.lastIndex = 0;
  
  const hasSSN = SSN_REGEX.test(input);
  SSN_REGEX.lastIndex = 0;
  
  const hasCreditCard = CREDITCARD_REGEX.test(input) && !hasCryptoAddresses(input);
  CREDITCARD_REGEX.lastIndex = 0;
  
  const hasPhone = !hasCryptoAddresses(input) && (
    GERMAN_MOBILE_INTL_REGEX.test(input) ||
    GERMAN_MOBILE_LOCAL_REGEX.test(input) ||
    US_PHONE_REGEX.test(input)
  );

  if (hasEmail) types.push("email");
  if (hasSSN) types.push("ssn");

  if (hasCreditCard) {
    types.push("creditcard");
  }

  // Wenn sowohl Kreditkarte als auch Phone-Muster matchen,
  // soll NUR "creditcard" reported werden (Tests 5.8 / PII_TEST_CASES).
  if (hasPhone && !hasCreditCard) {
    types.push("phone");
  }

  return types;
}
