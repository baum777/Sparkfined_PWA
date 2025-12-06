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
const PHONE_REGEX = /\b(?:\+?\d{1,3}[\s.-]?)?(?:\(?\d{2,4}\)?[\s.-]?)\d{3}[\s.-]?\d{3,4}\b/g;

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
 */
function hasCryptoAddresses(text: string): boolean {
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

  const types = new Set<string>();

  // Reset regex indices for fresh test
  EMAIL_REGEX.lastIndex = 0;
  SSN_REGEX.lastIndex = 0;
  CREDITCARD_REGEX.lastIndex = 0;
  PHONE_REGEX.lastIndex = 0;
  ETH_REGEX.lastIndex = 0;
  SOL_REGEX.lastIndex = 0;
  BTC_REGEX.lastIndex = 0;

  // Email detection (always safe, no crypto conflicts)
  if (EMAIL_REGEX.test(input)) {
    types.add("email");
  }

  // SSN detection (always safe, no crypto conflicts)
  SSN_REGEX.lastIndex = 0;
  if (SSN_REGEX.test(input)) {
    types.add("ssn");
  }

  // Credit card detection (must exclude crypto addresses)
  CREDITCARD_REGEX.lastIndex = 0;
  if (CREDITCARD_REGEX.test(input)) {
    // Check if this might be a crypto address
    ETH_REGEX.lastIndex = 0;
    SOL_REGEX.lastIndex = 0;
    if (!hasCryptoAddresses(input)) {
      types.add("creditcard");
    }
  }

  // Phone detection (must exclude crypto addresses)
  PHONE_REGEX.lastIndex = 0;
  if (PHONE_REGEX.test(input)) {
    // Reset crypto regex indices
    ETH_REGEX.lastIndex = 0;
    SOL_REGEX.lastIndex = 0;
    BTC_REGEX.lastIndex = 0;
    
    // Only add if no crypto addresses present
    if (!hasCryptoAddresses(input)) {
      types.add("phone");
    }
  }

  return Array.from(types);
}
