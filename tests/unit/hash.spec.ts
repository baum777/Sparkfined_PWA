/**
 * Unit Tests: Hash Utility
 */

import { describe, it, expect } from 'vitest';
import { fnv32, userBucket, isUserInSample, stableHash } from '@/lib/analytics/hash';

describe('Hash Utility', () => {
  describe('fnv32', () => {
    it('should return consistent hash for same input', () => {
      const input = 'user-abc-123';
      const hash1 = fnv32(input);
      const hash2 = fnv32(input);

      expect(hash1).toBe(hash2);
      expect(typeof hash1).toBe('number');
    });

    it('should return different hashes for different inputs', () => {
      const hash1 = fnv32('user-abc');
      const hash2 = fnv32('user-xyz');

      expect(hash1).not.toBe(hash2);
    });

    it('should return unsigned 32-bit integer', () => {
      const hash = fnv32('test');

      expect(hash).toBeGreaterThanOrEqual(0);
      expect(hash).toBeLessThanOrEqual(0xFFFFFFFF);
    });
  });

  describe('userBucket', () => {
    it('should return bucket number between 0-9999', () => {
      const bucket = userBucket('user-123');

      expect(bucket).toBeGreaterThanOrEqual(0);
      expect(bucket).toBeLessThanOrEqual(9999);
    });

    it('should be deterministic', () => {
      const userId = 'user-abc-456';
      const bucket1 = userBucket(userId);
      const bucket2 = userBucket(userId);

      expect(bucket1).toBe(bucket2);
    });

    it('should distribute users across buckets', () => {
      const buckets = new Set<number>();

      // Generate 1000 user buckets
      for (let i = 0; i < 1000; i++) {
        const bucket = userBucket(`user-${i}`);
        buckets.add(bucket);
      }

      // Should have reasonable distribution (at least 500 unique buckets)
      expect(buckets.size).toBeGreaterThan(500);
    });
  });

  describe('isUserInSample', () => {
    it('should return false for 0% sample', () => {
      const result = isUserInSample('user-123', 0);
      expect(result).toBe(false);
    });

    it('should return true for 100% sample', () => {
      const result = isUserInSample('user-123', 100);
      expect(result).toBe(true);
    });

    it('should be deterministic for same user and percentage', () => {
      const userId = 'user-abc';
      const result1 = isUserInSample(userId, 10);
      const result2 = isUserInSample(userId, 10);

      expect(result1).toBe(result2);
    });

    it('should sample approximately correct percentage', () => {
      const samplePct = 10; // 10%
      let inSample = 0;
      const total = 10000;

      for (let i = 0; i < total; i++) {
        if (isUserInSample(`user-${i}`, samplePct)) {
          inSample++;
        }
      }

      const actualPct = (inSample / total) * 100;

      // Allow 1% margin of error
      expect(actualPct).toBeGreaterThan(samplePct - 1);
      expect(actualPct).toBeLessThan(samplePct + 1);
    });
  });

  describe('stableHash', () => {
    it('should return hex string', () => {
      const hash = stableHash('test-input');

      expect(typeof hash).toBe('string');
      expect(hash).toMatch(/^[0-9a-f]{8}$/);
    });

    it('should be deterministic', () => {
      const input = 'session-123';
      const hash1 = stableHash(input);
      const hash2 = stableHash(input);

      expect(hash1).toBe(hash2);
    });
  });
});
