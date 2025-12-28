/**
 * PII Sanitization for AI Prompts
 * 
 * Removes or masks personally identifiable information from user inputs
 * before sending to AI providers.
 * 
 * Patterns detected:
 * - Phone numbers (international, US, German formats)
 * - Email addresses
 * - Credit card numbers (optional, conservative)
 * - Social security numbers (optional, conservative)
 */

// Phone number patterns (international, US, German, etc.)
const PHONE_PATTERNS = [
  // International: +49 176 12345678, +1-555-123-4567
  /\+?\d{1,3}[-.\s]?\(?\d{1,4}\)?[-.\s]?\d{1,4}[-.\s]?\d{1,9}/g,
  // German: 0176-12345678, 0176 12345678, (0176) 12345678
  /\(?\d{4,5}\)?[-.\s]?\d{3,8}/g,
  // US: (555) 123-4567, 555-123-4567
  /\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g,
];

// Email pattern (RFC 5322 simplified)
const EMAIL_PATTERN = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;

// Credit card pattern (optional, conservative - 13-19 digits with spaces/dashes)
const CREDIT_CARD_PATTERN = /\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{1,7}\b/g;

// Social Security Number (US: XXX-XX-XXXX)
const SSN_PATTERN = /\b\d{3}-\d{2}-\d{4}\b/g;

export interface SanitizationOptions {
  redactPhones?: boolean;
  redactEmails?: boolean;
  redactCreditCards?: boolean;
  redactSSN?: boolean;
  customPatterns?: Array<{ pattern: RegExp; replacement: string }>;
}

export interface SanitizationResult {
  sanitized: string;
  hadPII: boolean;
  redactedCount: number;
}

const DEFAULT_OPTIONS: SanitizationOptions = {
  redactPhones: true,
  redactEmails: true,
  redactCreditCards: false, // Conservative: off by default
  redactSSN: false, // Conservative: off by default
};

/**
 * Sanitize text by removing/masking PII
 */
export function sanitizeText(
  text: string,
  options: SanitizationOptions = {}
): SanitizationResult {
  if (!text || typeof text !== 'string') {
    return { sanitized: text || '', hadPII: false, redactedCount: 0 };
  }

  const opts = { ...DEFAULT_OPTIONS, ...options };
  let result = text;
  let redactedCount = 0;

  // Redact phone numbers
  if (opts.redactPhones) {
    for (const pattern of PHONE_PATTERNS) {
      const matches = result.match(pattern);
      if (matches) {
        redactedCount += matches.length;
        result = result.replace(pattern, '[REDACTED-PHONE]');
      }
    }
  }

  // Redact emails
  if (opts.redactEmails) {
    const matches = result.match(EMAIL_PATTERN);
    if (matches) {
      redactedCount += matches.length;
      result = result.replace(EMAIL_PATTERN, '[REDACTED-EMAIL]');
    }
  }

  // Redact credit cards (optional)
  if (opts.redactCreditCards) {
    const matches = result.match(CREDIT_CARD_PATTERN);
    if (matches) {
      redactedCount += matches.length;
      result = result.replace(CREDIT_CARD_PATTERN, '[REDACTED-CC]');
    }
  }

  // Redact SSN (optional)
  if (opts.redactSSN) {
    const matches = result.match(SSN_PATTERN);
    if (matches) {
      redactedCount += matches.length;
      result = result.replace(SSN_PATTERN, '[REDACTED-SSN]');
    }
  }

  // Custom patterns
  if (opts.customPatterns) {
    for (const { pattern, replacement } of opts.customPatterns) {
      const matches = result.match(pattern);
      if (matches) {
        redactedCount += matches.length;
        result = result.replace(pattern, replacement);
      }
    }
  }

  return {
    sanitized: result,
    hadPII: redactedCount > 0,
    redactedCount,
  };
}

/**
 * Sanitize prompt object (system + user)
 */
export function sanitizePrompt(prompt: {
  system?: string;
  user?: string;
}): { system?: string; user?: string; hadPII: boolean } {
  const systemResult = prompt.system
    ? sanitizeText(prompt.system)
    : { sanitized: '', hadPII: false, redactedCount: 0 };

  const userResult = prompt.user
    ? sanitizeText(prompt.user)
    : { sanitized: '', hadPII: false, redactedCount: 0 };

  return {
    system: prompt.system ? systemResult.sanitized : undefined,
    user: prompt.user ? userResult.sanitized : undefined,
    hadPII: systemResult.hadPII || userResult.hadPII,
  };
}
