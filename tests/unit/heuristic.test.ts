/**
 * Alpha Issue 6: Heuristic Fallback
 * Tests for deterministic local analysis
 */

import { describe, it, expect } from 'vitest';
import { heuristic } from '@/lib/analysis/heuristic';
import type { TokenSnapshot } from '@/types/data';

describe('Heuristic Analysis', () => {
  const mockSnapshot: TokenSnapshot = {
    address: 'So11111111111111111111111111111111111111112',
    symbol: 'SOL',
    name: 'Solana',
    price: 1.0,
    high24: 1.1,
    low24: 0.9,
    volume24: 1000000,
    liquidity: 500000,
    timestamp: Date.now(),
    provider: 'dexpaprika',
  };

  it('produces consistent levels', () => {
    const result = heuristic(mockSnapshot);
    expect(result.stop_loss).toBeCloseTo(0.95, 2);
    expect(result.take_profit[0]).toBeCloseTo(1.05, 2);
  });

  it('generates S/R levels within ±3.5% range', () => {
    const result = heuristic(mockSnapshot);
    result.sr_levels.forEach(level => {
      const deviation = Math.abs((level.price - mockSnapshot.price) / mockSnapshot.price);
      expect(deviation).toBeLessThanOrEqual(0.035);
    });
  });

  it('completes within 300ms', () => {
    const start = performance.now();
    heuristic(mockSnapshot);
    const duration = performance.now() - start;
    expect(duration).toBeLessThan(300);
  });

  it('returns deterministic results', () => {
    const result1 = heuristic(mockSnapshot);
    const result2 = heuristic(mockSnapshot);
    expect(result1.stop_loss).toBe(result2.stop_loss);
    expect(result1.take_profit).toEqual(result2.take_profit);
  });
});
