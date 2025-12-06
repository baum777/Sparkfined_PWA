/**
 * PII Sanitization Utility
 * 
 * Redacts sensitive personal information from text while preserving crypto addresses.
 * 
 * Sanitization order:
 * 1. Mask crypto addresses (ETH, SOL, BTC)
 * 2. Redact Email addresses
 * 3. Redact SSN (US Social Security Numbers)
 * 4. Redact Credit Card numbers
 * 5. Redact Phone numbers
 * 6. Restore crypto addresses
 * 
 * @module sanitizePII
 */

// =============================================================================
// CRYPTO ADDRESS PATTERNS (MUST NOT BE REDACTED)
// =============================================================================

const ETH_REGEX = /\b0x[a-fA-F0-9]{40}\b/g;
const SOL_REGEX = /\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/g;
const BTC_REGEX = /\bbc1[a-zA-Z0-9]{25,59}\b/g;

// =============================================================================
// PII PATTERNS
// =============================================================================

/**
 * Email addresses
 * Matches: user@example.com, user+tag@subdomain.example.com
 */
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

/**
 * US Social Security Numbers
 * Matches: 123-45-6789
 */
const SSN_REGEX = /\b\d{3}-\d{2}-\d{4}\b/g;

/**
 * Credit Card numbers (13-16 digits with optional separators)
 * Matches: 4242-4242-4242-4242, 4242 4242 4242 4242, 4242424242424242
 * Uses word boundaries to avoid matching longer number sequences
 */
const CREDITCARD_REGEX = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g;

/**
 * German mobile phone numbers
 * Matches: +49 176 12345678, 0176-12345678, 0176 1234567
 * Prefix +49 or 0, then mobile codes (15x, 16x, 17x)
 * Note: No leading \b to allow +49 prefix
 */
const GERMAN_PHONE_REGEX = /(?:\+49[\s\-]?)?(?:0?1[5-7][0-9])[\s\-]?\d{3,4}[\s\-]?\d{4,5}\b/g;

/**
 * US phone numbers (various formats)
 * Matches: (555) 123-4567, 555-123-4567, 5551234567
 * CRITICAL: Must NOT match credit cards
 * Note: Parentheses are optional via \(? and \)?
 */
const US_PHONE_REGEX = /\(?\d{3}\)?[\s\-]?\d{3}[\s\-]?\d{4}\b/g;

// =============================================================================
// CRYPTO MASKING (PROTECT BEFORE SANITIZATION)
// =============================================================================

const CRYPTO_MASK_PREFIX = "__CRYPTO_MASK_";

interface MaskResult {
  maskedText: string;
  map: string[];
}

/**
 * Temporarily masks crypto addresses to protect them from PII sanitization
 * 
 * @param text - Input text potentially containing crypto addresses
 * @returns Object with maskedText and map of original addresses
 */
function maskCrypto(text: string): MaskResult {
  const map: string[] = [];
  let maskedText = text;

  const patterns = [
    ETH_REGEX,  // Ethereum
    SOL_REGEX,  // Solana
    BTC_REGEX,  // Bitcoin
  ];

  patterns.forEach((pattern) => {
    maskedText = maskedText.replace(pattern, (match) => {
      const index = map.length;
      map.push(match);
      return `${CRYPTO_MASK_PREFIX}${index}__`;
    });
  });

  return { maskedText, map };
}

/**
 * Restores masked crypto addresses after PII sanitization
 * 
 * @param text - Text with crypto mask placeholders
 * @param map - Array of original crypto addresses
 * @returns Text with restored crypto addresses
 */
function restoreCrypto(text: string, map: string[]): string {
  return text.replace(
    new RegExp(`${CRYPTO_MASK_PREFIX}(\\d+)__`, "g"),
    (_match, index) => map[parseInt(index, 10)] ?? _match
  );
}

// =============================================================================
// MAIN SANITIZATION FUNCTION
// =============================================================================

/**
 * Sanitizes PII from input text while preserving crypto addresses
 * 
 * Process:
 * 1. Mask crypto addresses (temporary placeholders)
 * 2. Redact Email → SSN → Credit Cards → Phone numbers
 * 3. Restore crypto addresses (unchanged)
 * 
 * Idempotent: Running twice produces same result
 * 
 * @param input - Text to sanitize
 * @returns Sanitized text with PII redacted, crypto addresses preserved
 * 
 * @example
 * sanitizePII("Email: user@example.com Wallet: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb")
 * // Returns: "Email: [REDACTED-EMAIL] Wallet: 0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"
 */
export function sanitizePII(input: string): string {
  if (!input) return input;

  // Step 1: Mask crypto addresses
  const { maskedText, map } = maskCrypto(input);

  let sanitized = maskedText;

  // Step 2: Redact PII (order matters for determinism)
  
  // Email addresses
  sanitized = sanitized.replace(EMAIL_REGEX, "[REDACTED-EMAIL]");

  // SSN (US Social Security)
  sanitized = sanitized.replace(SSN_REGEX, "[REDACTED-SSN]");

  // Credit Card numbers
  sanitized = sanitized.replace(CREDITCARD_REGEX, "[REDACTED-CC]");

  // Phone numbers (German and US formats - must be last to avoid conflicts)
  sanitized = sanitized.replace(GERMAN_PHONE_REGEX, "[REDACTED-PHONE]");
  sanitized = sanitized.replace(US_PHONE_REGEX, "[REDACTED-PHONE]");

  // Step 3: Restore crypto addresses unchanged
  return restoreCrypto(sanitized, map);
}
