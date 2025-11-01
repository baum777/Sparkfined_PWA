/**
 * Alpha Issue 13: Security & Guardrails
 * Input validation for Solana addresses
 */

/**
 * Solana address validation regex
 * Base58 charset: [1-9A-HJ-NP-Za-km-z] (excludes 0, O, I, l)
 * Length: 32-44 characters (typically 43-44)
 */
const SOLANA_ADDRESS_REGEX = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/;

/**
 * Validate Solana address format
 * @param address - Address to validate
 * @returns true if valid Base58 Solana address
 */
export function isSolanaAddress(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }

  return SOLANA_ADDRESS_REGEX.test(address);
}

/**
 * Sanitize address input
 * Removes whitespace and validates format
 * @param input - Raw address input
 * @returns Sanitized address or null if invalid
 */
export function sanitizeAddress(input: string): string | null {
  if (!input) return null;

  const trimmed = input.trim();

  if (!isSolanaAddress(trimmed)) {
    return null;
  }

  return trimmed;
}

/**
 * Validate and throw on invalid address
 * @param address - Address to validate
 * @throws Error if invalid
 */
export function assertSolanaAddress(address: string): asserts address is string {
  if (!isSolanaAddress(address)) {
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
