/**
 * Alpha Issue 13: Security & Guardrails
 * Tests for address validation
 */

import { describe, it, expect } from 'vitest';
import {
  isSolanaAddress,
  sanitizeAddress,
  assertSolanaAddress,
  WELL_KNOWN_ADDRESSES,
} from '@/lib/validation/address';

describe('Address Validation', () => {
  it('validates correct Solana addresses', () => {
    expect(isSolanaAddress(WELL_KNOWN_ADDRESSES.SOL)).toBe(true);
    expect(isSolanaAddress(WELL_KNOWN_ADDRESSES.USDC)).toBe(true);
    expect(isSolanaAddress(WELL_KNOWN_ADDRESSES.USDT)).toBe(true);
  });

  it('rejects invalid addresses', () => {
    expect(isSolanaAddress('0xdeadbeef')).toBe(false); // Ethereum style
    expect(isSolanaAddress('invalid')).toBe(false); // Too short
    expect(isSolanaAddress('')).toBe(false); // Empty
    expect(isSolanaAddress('So1111111111111111111111111111111111111111O')).toBe(false); // Contains 'O'
    expect(isSolanaAddress('So1111111111111111111111111111111111111111I')).toBe(false); // Contains 'I'
  });

  it('rejects addresses with invalid Base58 characters', () => {
    expect(isSolanaAddress('So111111111111111111111111111111111111111O')).toBe(false); // 'O' not in Base58
    expect(isSolanaAddress('So111111111111111111111111111111111111111I')).toBe(false); // 'I' not in Base58
    expect(isSolanaAddress('So111111111111111111111111111111111111111l')).toBe(false); // 'l' not in Base58 (excluded)
    expect(isSolanaAddress('So111111111111111111111111111111111111111m')).toBe(true); // 'm' is valid
  });

  it('sanitizes addresses by trimming whitespace', () => {
    const address = WELL_KNOWN_ADDRESSES.SOL;
    expect(sanitizeAddress(`  ${address}  `)).toBe(address);
    expect(sanitizeAddress(`\n${address}\t`)).toBe(address);
  });

  it('returns null for invalid input during sanitization', () => {
    expect(sanitizeAddress('invalid')).toBeNull();
    expect(sanitizeAddress('')).toBeNull();
    expect(sanitizeAddress('0xdeadbeef')).toBeNull();
  });

  it('throws on invalid address with assertSolanaAddress', () => {
    expect(() => assertSolanaAddress('invalid')).toThrow('Invalid Solana address');
    expect(() => assertSolanaAddress(WELL_KNOWN_ADDRESSES.SOL)).not.toThrow();
  });

  it('handles edge cases', () => {
    // @ts-expect-error Testing invalid input types
    expect(isSolanaAddress(null)).toBe(false);
    // @ts-expect-error Testing invalid input types
    expect(isSolanaAddress(undefined)).toBe(false);
    // @ts-expect-error Testing invalid input types
    expect(isSolanaAddress(123)).toBe(false);
  });
});
