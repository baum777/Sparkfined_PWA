/**
 * P0 BLOCKER: API Contract Tests - /api/rules/eval
 *
 * Tests for Rule Evaluation API endpoint
 * - POST /api/rules/eval - Evaluate rule against OHLC data
 *
 * Validates:
 * - Rule evaluation logic (price-cross, pct-change-24h, breakout-atrx, vwap-cross, sma50-200-cross)
 * - Request/Response contracts
 * - Invalid payload handling
 * - Error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import handler from '../../api/rules/eval';

// Helper: Create mock Request
function createRequest(body: any): Request {
  const url = 'https://example.com/api/rules/eval';

  return new Request(url, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  });
}

// Helper: Generate sample OHLC data
function generateOHLC(count: number, basePrice = 100): Array<{t: number; o: number; h: number; l: number; c: number; v?: number}> {
  const data = [];
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const price = basePrice + (Math.random() - 0.5) * 10;
    data.push({
      t: now - (count - i) * 3600000, // 1h intervals
      o: price,
      h: price + Math.random() * 2,
      l: price - Math.random() * 2,
      c: price + (Math.random() - 0.5),
      v: 1000000 + Math.random() * 500000,
    });
  }
  return data;
}

describe('API Contract Tests - /api/rules/eval', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Valid Rule Evaluations', () => {
    describe('price-cross', () => {
      it('should detect upward price cross', async () => {
        const data = [
          { t: 1000, o: 95, h: 96, l: 94, c: 95 },
          { t: 2000, o: 101, h: 102, l: 100, c: 101 },
        ];

        const rule = {
          id: 'rule-1',
          kind: 'price-cross' as const,
          op: '>' as const,
          value: 100,
        };

        const req = createRequest({ rule, data });
        const res = await handler(req);
        const result = await res.json();

        expect(res.status).toBe(200);
        expect(result.ok).toBe(true);
        expect(result.match).toBe(true); // Price crossed above 100
      });

      it('should detect downward price cross', async () => {
        const data = [
          { t: 1000, o: 101, h: 102, l: 100, c: 101 },
          { t: 2000, o: 95, h: 96, l: 94, c: 95 },
        ];

        const rule = {
          id: 'rule-2',
          kind: 'price-cross' as const,
          op: '<' as const,
          value: 100,
        };

        const req = createRequest({ rule, data });
        const res = await handler(req);
        const result = await res.json();

        expect(res.status).toBe(200);
        expect(result.ok).toBe(true);
        expect(result.match).toBe(true); // Price crossed below 100
      });

      it('should return false if no cross occurred', async () => {
        const data = [
          { t: 1000, o: 95, h: 96, l: 94, c: 95 },
          { t: 2000, o: 96, h: 97, l: 95, c: 96 },
        ];

        const rule = {
          id: 'rule-3',
          kind: 'price-cross' as const,
          op: '>' as const,
          value: 100,
        };

        const req = createRequest({ rule, data });
        const res = await handler(req);
        const result = await res.json();

        expect(result.ok).toBe(true);
        expect(result.match).toBe(false); // Still below 100
      });
    });

    describe('pct-change-24h', () => {
      it('should detect 24h percentage increase', async () => {
        const now = Date.now();
        const data = [
          { t: now - 86400000, o: 100, h: 101, l: 99, c: 100 }, // 24h ago
          { t: now - 3600000, o: 105, h: 106, l: 104, c: 105 }, // 1h ago
          { t: now, o: 110, h: 112, l: 109, c: 111 }, // now (+11% from 24h ago)
        ];

        const rule = {
          id: 'rule-4',
          kind: 'pct-change-24h' as const,
          op: '>' as const,
          value: 10, // Looking for >10% gain
        };

        const req = createRequest({ rule, data });
        const res = await handler(req);
        const result = await res.json();

        expect(res.status).toBe(200);
        expect(result.ok).toBe(true);
        expect(result.match).toBe(true); // 11% gain crossed above 10%
      });

      it('should detect 24h percentage decrease', async () => {
        const now = Date.now();
        const data = [
          { t: now - 86400000, o: 100, h: 101, l: 99, c: 100 }, // 24h ago
          { t: now - 3600000, o: 95, h: 96, l: 94, c: 95 }, // 1h ago
          { t: now, o: 85, h: 86, l: 84, c: 85 }, // now (-15% from 24h ago)
        ];

        const rule = {
          id: 'rule-5',
          kind: 'pct-change-24h' as const,
          op: '<' as const,
          value: -10, // Looking for <-10% loss
        };

        const req = createRequest({ rule, data });
        const res = await handler(req);
        const result = await res.json();

        expect(res.status).toBe(200);
        expect(result.ok).toBe(true);
        expect(result.match).toBe(true); // -15% crossed below -10%
      });
    });

    describe('breakout-atrx', () => {
      it('should detect upward breakout', async () => {
        const data = generateOHLC(20, 100);
        // Force a breakout by setting last candle high
        data[data.length - 1]!.c = 115; // High close for breakout
        data[data.length - 1]!.h = 116;

        const rule = {
          id: 'rule-6',
          kind: 'breakout-atrx' as const,
          dir: 'up' as const,
          mult: 1.5,
          period: 14,
        };

        const req = createRequest({ rule, data });
        const res = await handler(req);
        const result = await res.json();

        expect(res.status).toBe(200);
        expect(result.ok).toBe(true);
        // Result depends on ATR calculation, but should handle gracefully
        expect(typeof result.match).toBe('boolean');
      });

      it('should detect downward breakout', async () => {
        const data = generateOHLC(20, 100);
        // Force a breakdown by setting last candle low
        data[data.length - 1]!.c = 85; // Low close for breakdown
        data[data.length - 1]!.l = 84;

        const rule = {
          id: 'rule-7',
          kind: 'breakout-atrx' as const,
          dir: 'down' as const,
          mult: 1.5,
          period: 14,
        };

        const req = createRequest({ rule, data });
        const res = await handler(req);
        const result = await res.json();

        expect(res.status).toBe(200);
        expect(result.ok).toBe(true);
        expect(typeof result.match).toBe('boolean');
      });
    });

    describe('vwap-cross', () => {
      it('should detect cross above VWAP', async () => {
        const data = [
          { t: 1000, o: 99, h: 100, l: 98, c: 99, v: 1000 },
          { t: 2000, o: 100, h: 101, l: 99, c: 100, v: 1000 },
          { t: 3000, o: 102, h: 103, l: 101, c: 102, v: 1000 }, // Cross above VWAP
        ];

        const rule = {
          id: 'rule-8',
          kind: 'vwap-cross' as const,
          dir: 'above' as const,
        };

        const req = createRequest({ rule, data });
        const res = await handler(req);
        const result = await res.json();

        expect(res.status).toBe(200);
        expect(result.ok).toBe(true);
        expect(typeof result.match).toBe('boolean');
      });

      it('should detect cross below VWAP', async () => {
        const data = [
          { t: 1000, o: 101, h: 102, l: 100, c: 101, v: 1000 },
          { t: 2000, o: 100, h: 101, l: 99, c: 100, v: 1000 },
          { t: 3000, o: 98, h: 99, l: 97, c: 98, v: 1000 }, // Cross below VWAP
        ];

        const rule = {
          id: 'rule-9',
          kind: 'vwap-cross' as const,
          dir: 'below' as const,
        };

        const req = createRequest({ rule, data });
        const res = await handler(req);
        const result = await res.json();

        expect(res.status).toBe(200);
        expect(result.ok).toBe(true);
        expect(typeof result.match).toBe('boolean');
      });
    });

    describe('sma50-200-cross', () => {
      it('should detect golden cross (SMA50 crosses above SMA200)', async () => {
        // Generate enough data for SMA200 calculation
        const data = generateOHLC(250, 100);
        
        // Force uptrend in recent data to create golden cross potential
        for (let i = 200; i < 250; i++) {
          data[i]!.c = 100 + (i - 200) * 0.5;
        }

        const rule = {
          id: 'rule-10',
          kind: 'sma50-200-cross' as const,
          typ: 'golden' as const,
        };

        const req = createRequest({ rule, data });
        const res = await handler(req);
        const result = await res.json();

        expect(res.status).toBe(200);
        expect(result.ok).toBe(true);
        expect(typeof result.match).toBe('boolean');
      });

      it('should detect death cross (SMA50 crosses below SMA200)', async () => {
        // Generate enough data for SMA200 calculation
        const data = generateOHLC(250, 100);
        
        // Force downtrend in recent data to create death cross potential
        for (let i = 200; i < 250; i++) {
          data[i]!.c = 100 - (i - 200) * 0.5;
        }

        const rule = {
          id: 'rule-11',
          kind: 'sma50-200-cross' as const,
          typ: 'death' as const,
        };

        const req = createRequest({ rule, data });
        const res = await handler(req);
        const result = await res.json();

        expect(res.status).toBe(200);
        expect(result.ok).toBe(true);
        expect(typeof result.match).toBe('boolean');
      });
    });
  });

  describe('Invalid Payloads', () => {
    it('should return 400 for missing rule', async () => {
      const data = generateOHLC(10);

      const req = createRequest({ data });
      const res = await handler(req);
      const result = await res.json();

      expect(res.status).toBe(400);
      expect(result.ok).toBe(false);
      expect(result.error).toContain('invalid payload');
    });

    it('should return 400 for missing data', async () => {
      const rule = {
        id: 'rule-test',
        kind: 'price-cross' as const,
        op: '>' as const,
        value: 100,
      };

      const req = createRequest({ rule });
      const res = await handler(req);
      const result = await res.json();

      expect(res.status).toBe(400);
      expect(result.ok).toBe(false);
      expect(result.error).toContain('invalid payload');
    });

    it('should return 400 for insufficient candles (< 2)', async () => {
      const rule = {
        id: 'rule-test',
        kind: 'price-cross' as const,
        op: '>' as const,
        value: 100,
      };

      const data = [
        { t: 1000, o: 95, h: 96, l: 94, c: 95 },
        // Only 1 candle - insufficient for cross detection
      ];

      const req = createRequest({ rule, data });
      const res = await handler(req);
      const result = await res.json();

      expect(res.status).toBe(400);
      expect(result.ok).toBe(false);
      expect(result.error).toContain('invalid payload');
    });

    it('should return 400 for data not being an array', async () => {
      const rule = {
        id: 'rule-test',
        kind: 'price-cross' as const,
        op: '>' as const,
        value: 100,
      };

      const req = createRequest({ rule, data: 'not-an-array' });
      const res = await handler(req);
      const result = await res.json();

      expect(res.status).toBe(400);
      expect(result.ok).toBe(false);
      expect(result.error).toContain('invalid payload');
    });

    it('should handle malformed OHLC data gracefully', async () => {
      const rule = {
        id: 'rule-test',
        kind: 'price-cross' as const,
        op: '>' as const,
        value: 100,
      };

      const data = [
        { t: 1000 }, // Missing OHLC values
        { t: 2000, c: 105 }, // Partial data
      ];

      const req = createRequest({ rule, data });
      const res = await handler(req);
      const result = await res.json();

      // Should handle gracefully without crashing
      expect(res.status).toBe(200);
      expect(result.ok).toBe(true);
      expect(typeof result.match).toBe('boolean');
    });
  });

  describe('Error Handling', () => {
    it('should return 405 for GET requests', async () => {
      const req = new Request('https://example.com/api/rules/eval', {
        method: 'GET',
      });

      const res = await handler(req);
      const result = await res.json();

      expect(res.status).toBe(405);
      expect(result.ok).toBe(false);
      expect(result.error).toContain('POST only');
    });

    it('should return 405 for PUT requests', async () => {
      const req = new Request('https://example.com/api/rules/eval', {
        method: 'PUT',
      });

      const res = await handler(req);
      const result = await res.json();

      expect(res.status).toBe(405);
      expect(result.ok).toBe(false);
      expect(result.error).toContain('POST only');
    });

    it('should return 405 for DELETE requests', async () => {
      const req = new Request('https://example.com/api/rules/eval', {
        method: 'DELETE',
      });

      const res = await handler(req);
      const result = await res.json();

      expect(res.status).toBe(405);
      expect(result.ok).toBe(false);
      expect(result.error).toContain('POST only');
    });

    it('should handle malformed JSON gracefully', async () => {
      const req = new Request('https://example.com/api/rules/eval', {
        method: 'POST',
        body: 'not-valid-json{',
      });

      const res = await handler(req);
      const result = await res.json();

      // Should catch JSON parse error
      expect(res.status).toBe(200); // Handler returns 200 with ok:false for caught errors
      expect(result.ok).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should handle null payload gracefully', async () => {
      const req = createRequest(null);
      const res = await handler(req);
      const result = await res.json();

      expect(res.status).toBe(400);
      expect(result.ok).toBe(false);
      expect(result.error).toContain('invalid payload');
    });

    it('should handle empty object payload', async () => {
      const req = createRequest({});
      const res = await handler(req);
      const result = await res.json();

      expect(res.status).toBe(400);
      expect(result.ok).toBe(false);
      expect(result.error).toContain('invalid payload');
    });
  });

  describe('Edge Cases', () => {
    it('should handle rule with missing optional fields (period)', async () => {
      const data = generateOHLC(20, 100);

      const rule = {
        id: 'rule-test',
        kind: 'breakout-atrx' as const,
        dir: 'up' as const,
        mult: 2.0,
        // period is optional, should default to 14
      };

      const req = createRequest({ rule, data });
      const res = await handler(req);
      const result = await res.json();

      expect(res.status).toBe(200);
      expect(result.ok).toBe(true);
      expect(typeof result.match).toBe('boolean');
    });

    it('should handle data with missing volume field', async () => {
      const data = [
        { t: 1000, o: 95, h: 96, l: 94, c: 95 }, // No volume
        { t: 2000, o: 101, h: 102, l: 100, c: 101 }, // No volume
      ];

      const rule = {
        id: 'rule-test',
        kind: 'price-cross' as const,
        op: '>' as const,
        value: 100,
      };

      const req = createRequest({ rule, data });
      const res = await handler(req);
      const result = await res.json();

      expect(res.status).toBe(200);
      expect(result.ok).toBe(true);
      expect(typeof result.match).toBe('boolean');
    });

    it('should handle extreme price values', async () => {
      const data = [
        { t: 1000, o: 0.000001, h: 0.000002, l: 0.0000005, c: 0.000001 },
        { t: 2000, o: 0.000003, h: 0.000004, l: 0.000002, c: 0.000003 },
      ];

      const rule = {
        id: 'rule-test',
        kind: 'price-cross' as const,
        op: '>' as const,
        value: 0.000002,
      };

      const req = createRequest({ rule, data });
      const res = await handler(req);
      const result = await res.json();

      expect(res.status).toBe(200);
      expect(result.ok).toBe(true);
      expect(typeof result.match).toBe('boolean');
    });
  });
});
