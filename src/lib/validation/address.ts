/**
 * Alpha Issue 13: Security & Guardrails
 * Input validation for Solana addresses
 */

/**
 * Solana address validation regex
 * Base58 charset: [1-9A-HJ-NP-Za-km-z] (excludes 0, O, I, l)
 */
const SOLANA_BASE58_REGEX = /^[1-9A-HJ-NP-Za-km-z]+$/;

const MIN_SOLANA_ADDRESS_LENGTH = 32;
const MAX_SOLANA_ADDRESS_LENGTH = 44;

function isNormalizedSolanaAddress(address: string): boolean {
  if (!address) {
    return false;
  }

  if (address.startsWith('0x')) {
    return false;
  }

  if (
    address.length < MIN_SOLANA_ADDRESS_LENGTH ||
    address.length > MAX_SOLANA_ADDRESS_LENGTH
  ) {
    return false;
  }

  return SOLANA_BASE58_REGEX.test(address);
}

/**
 * Normalize Solana address input by collapsing whitespace and trimming
 */
export function normalizeSolanaAddress(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }

  const collapsedWhitespace = input.replace(/\s+/g, ' ');
  return collapsedWhitespace.trim();
}

/**
 * Validate Solana address format
 * @param address - Address to validate
 * @returns true if valid Base58 Solana address
 */
export function isSolanaAddress(address: string): boolean {
  return validateSolanaAddress(address);
}

export function validateSolanaAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }

  const normalized = normalizeSolanaAddress(address);
  if (!normalized) {
    return false;
  }

  return isNormalizedSolanaAddress(normalized);
}

/**
 * Sanitize address input
 * Removes whitespace and validates format
 * @param input - Raw address input
 * @returns Sanitized address or null if invalid
 */
export function sanitizeAddress(input: string): string | null {
  if (!input) return null;

  const normalized = normalizeSolanaAddress(input);

  if (!isNormalizedSolanaAddress(normalized)) {
    return null;
  }

  return normalized;
}

/**
 * Validate and throw on invalid address
 * @param address - Address to validate
 * @throws Error if invalid
 */
export function assertSolanaAddress(address: string): asserts address is string {
  if (!validateSolanaAddress(address)) {
    throw new Error(`Invalid Solana address: ${address}`);
  }
}

/**
 * Common well-known addresses for testing
 */
export const WELL_KNOWN_ADDRESSES = {
  SOL: 'So11111111111111111111111111111111111111112',
  USDC: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  USDT: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
} as const;
