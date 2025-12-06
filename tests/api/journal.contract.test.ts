/**
 * P0 BLOCKER: API Contract Tests - /api/journal
 *
 * Tests for Journal CRUD API endpoint
 * - GET /api/journal - List entries
 * - POST /api/journal - Create/Update entry with metric recomputation
 * - POST /api/journal (delete mode) - Delete entry
 *
 * Validates:
 * - Request/Response contracts
 * - Payload normalization
 * - Metric computation (PnL, R:R)
 * - Error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import handler from '../../api/journal/index';

// Mock @vercel/kv
vi.mock('../../src/lib/kv', () => ({
  kvGet: vi.fn(),
  kvSet: vi.fn(),
  kvDel: vi.fn(),
  kvSAdd: vi.fn(),
  kvSMembers: vi.fn(),
}));

import { kvGet, kvSet, kvDel, kvSAdd, kvSMembers } from '../../src/lib/kv';

// Helper: Create mock Request
function createRequest(method: string, body?: any, userId = 'test-user'): Request {
  const url = `https://example.com/api/journal?userId=${userId}`;

  return new Request(url, {
    method,
    headers: {
      'content-type': 'application/json',
      'x-user-id': userId,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe('API Contract Tests - /api/journal', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/journal - List Entries', () => {
    it('should return empty list when no entries exist', async () => {
      vi.mocked(kvSMembers).mockResolvedValue([]);

      const req = createRequest('GET');
      const res = await handler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual({ ok: true, notes: [] });
    });

    it('should return all user entries sorted by updatedAt descending', async () => {
      const mockEntries = [
        { id: 'entry-1', title: 'Old Entry', createdAt: 1000, updatedAt: 1000, body: '' },
        { id: 'entry-2', title: 'New Entry', createdAt: 2000, updatedAt: 2000, body: '' },
      ];

      vi.mocked(kvSMembers).mockResolvedValue(['entry-1', 'entry-2']);
      vi.mocked(kvGet)
        .mockResolvedValueOnce(mockEntries[0])
        .mockResolvedValueOnce(mockEntries[1]);

      const req = createRequest('GET');
      const res = await handler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.notes).toHaveLength(2);
      // Should be sorted newest first
      expect(data.notes[0].id).toBe('entry-2');
      expect(data.notes[1].id).toBe('entry-1');
    });

    it('should handle entries with legacy data (missing fields)', async () => {
      const legacyEntry = {
        id: 'legacy-1',
        title: 'Legacy Entry',
        createdAt: 1000,
        // Missing updatedAt, tags, status, etc.
      };

      vi.mocked(kvSMembers).mockResolvedValue(['legacy-1']);
      vi.mocked(kvGet).mockResolvedValue(legacyEntry);

      const req = createRequest('GET');
      const res = await handler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.notes[0]!.id).toBe('legacy-1');
      expect(data.notes[0]!.tags).toEqual([]); // Should default to empty array
    });
  });

  describe('POST /api/journal - Create Entry', () => {
    it('should create new entry with valid payload', async () => {
      const payload = {
        title: 'SOL Long Trade',
        body: 'Entry at $95.50, target $105',
        address: 'So11111111111111111111111111111111111111112',
        tags: ['breakout', 'trend'],
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.note).toBeDefined();
      expect(data.note.id).toBeDefined();
      expect(data.note.title).toBe('SOL Long Trade');
      expect(data.note.tags).toEqual(['breakout', 'trend']);

      expect(kvSet).toHaveBeenCalledWith(
        expect.stringContaining('journal:test-user:'),
        expect.objectContaining({ title: 'SOL Long Trade' })
      );
      expect(kvSAdd).toHaveBeenCalled();
    });

    it('should generate UUID if no ID provided', async () => {
      const payload = { title: 'Test Entry' };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.ok).toBe(true);
      expect(data.note.id).toMatch(/^[a-f0-9-]{36}$/); // UUID pattern
    });

    it('should use provided ID if given', async () => {
      const payload = {
        id: 'custom-id-123',
        title: 'Entry with custom ID',
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.ok).toBe(true);
      expect(data.note.id).toBe('custom-id-123');
    });

    it('should return 400 for invalid payload', async () => {
      const req = createRequest('POST', null);
      const res = await handler(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.ok).toBe(false);
      expect(data.error).toContain('Invalid payload');
    });

    it('should sanitize and limit tags (max 20 tags, 64 chars each)', async () => {
      const longTags = Array.from({ length: 30 }, (_, i) => `tag-${i}`);
      const payload = {
        title: 'Test',
        tags: longTags,
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.note.tags).toHaveLength(20); // Capped at 20
    });

    it('should normalize tag content (trim, limit length)', async () => {
      const payload = {
        title: 'Test',
        tags: [
          '  whitespace  ',
          'a'.repeat(100), // Too long
          123, // Number (should convert to string)
        ],
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.note.tags[0]).toBe('whitespace');
      expect(data.note.tags[1]).toHaveLength(64); // Capped
      expect(data.note.tags[2]).toBe('123');
    });
  });

  describe('POST /api/journal - Update Entry with Metrics', () => {
    it('should compute PnL when entryPrice and exitPrice provided', async () => {
      const payload = {
        id: 'trade-123',
        title: 'Trade',
        entryPrice: 95.50,
        exitPrice: 102.30,
        positionSize: 100,
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.note.pnl).toBeCloseTo(680); // (102.30 - 95.50) * 100
      expect(data.note.pnlPercent).toBeCloseTo(7.12, 1); // ~7.12%
    });

    it('should compute risk-reward ratio when stop and target provided', async () => {
      const payload = {
        title: 'Trade',
        entryPrice: 100,
        exitPrice: 115, // Need exit for full computation
        positionSize: 10, // Need position size
        stopLoss: 95,
        takeProfit: 115,
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.note.riskRewardRatio).toBeCloseTo(3); // (115-100) / (100-95) = 3
    });

    it('should handle numeric string parsing (e.g., European comma format)', async () => {
      const payload = {
        title: 'Trade',
        entryPrice: '95,50', // European decimal format (handled by toNumberValue)
        exitPrice: '102,30', // European decimal format
        positionSize: 10,
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.note.entryPrice).toBeCloseTo(95.50);
      expect(data.note.exitPrice).toBeCloseTo(102.30);
      expect(data.note.pnl).toBeCloseTo(68); // (102.30 - 95.50) * 10
    });

    it('should preserve manual PnL if computed value undefined', async () => {
      const payload = {
        title: 'Trade',
        pnl: 500, // Manual PnL
        // No entryPrice/exitPrice for computation
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.note.pnl).toBe(500);
    });

    it('should override manual PnL if computed value exists', async () => {
      const payload = {
        title: 'Trade',
        entryPrice: 100,
        exitPrice: 110,
        positionSize: 10,
        pnl: 999, // Should be overridden by computed value
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.note.pnl).toBeCloseTo(100); // (110 - 100) * 10
      expect(data.note.pnl).not.toBe(999);
    });
  });

  describe('POST /api/journal - Delete Entry', () => {
    it('should delete entry when delete flag provided', async () => {
      const payload = {
        delete: true,
        id: 'entry-to-delete',
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.deleted).toBe('entry-to-delete');

      expect(kvDel).toHaveBeenCalledWith('journal:test-user:entry-to-delete');
    });

    it('should not create entry if delete flag is true', async () => {
      const payload = {
        delete: true,
        id: 'test-id',
        title: 'This should not be created',
      };

      const req = createRequest('POST', payload);
      await handler(req);

      expect(kvSet).not.toHaveBeenCalled();
      expect(kvDel).toHaveBeenCalled();
    });
  });

  describe('Field Normalization', () => {
    it('should normalize status to valid TradeStatus', async () => {
      const payload = {
        title: 'Test',
        status: 'winner', // Valid status
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.note.status).toBe('winner');
    });

    it('should set status to undefined for invalid value', async () => {
      const payload = {
        title: 'Test',
        status: 'invalid-status',
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.note.status).toBeUndefined();
    });

    it('should normalize timeframe to valid Timeframe', async () => {
      const payload = {
        title: 'Test',
        tf: '1h', // Valid timeframe
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.note.tf).toBe('1h');
    });

    it('should set tf to undefined for invalid value', async () => {
      const payload = {
        title: 'Test',
        tf: '99h', // Invalid timeframe
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.note.tf).toBeUndefined();
    });
  });

  describe('Error Handling', () => {
    it('should return 405 for unsupported methods', async () => {
      const req = createRequest('PUT');
      const res = await handler(req);
      const data = await res.json();

      expect(res.status).toBe(405);
      expect(data.ok).toBe(false);
      expect(data.error).toContain('GET or POST only');
    });

    it('should handle KV errors gracefully', async () => {
      vi.mocked(kvSMembers).mockRejectedValue(new Error('KV connection failed'));

      const req = createRequest('GET');

      await expect(handler(req)).rejects.toThrow('KV connection failed');
    });

    it('should handle malformed JSON gracefully', async () => {
      const req = new Request('https://example.com/api/journal', {
        method: 'POST',
        body: 'not-valid-json{',
      });

      const res = await handler(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.ok).toBe(false);
    });
  });

  describe('User Isolation', () => {
    it('should use userId from query param', async () => {
      vi.mocked(kvSMembers).mockResolvedValue([]);

      const req = createRequest('GET', undefined, 'user-from-query');
      await handler(req);

      expect(kvSMembers).toHaveBeenCalledWith('journal:byUser:user-from-query');
    });

    it('should use userId from x-user-id header', async () => {
      vi.mocked(kvSMembers).mockResolvedValue([]);

      const req = new Request('https://example.com/api/journal', {
        method: 'GET',
        headers: {
          'x-user-id': 'user-from-header',
        },
      });

      await handler(req);

      expect(kvSMembers).toHaveBeenCalledWith('journal:byUser:user-from-header');
    });

    it('should default to "anon" if no userId provided', async () => {
      vi.mocked(kvSMembers).mockResolvedValue([]);

      const req = new Request('https://example.com/api/journal', {
        method: 'GET',
      });

      await handler(req);

      expect(kvSMembers).toHaveBeenCalledWith('journal:byUser:anon');
    });
  });

  describe('Timestamps', () => {
    it('should set createdAt and updatedAt on new entry', async () => {
      const payload = { title: 'Test' };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.note.createdAt).toBeDefined();
      expect(data.note.updatedAt).toBeDefined();
      expect(typeof data.note.createdAt).toBe('number');
      expect(typeof data.note.updatedAt).toBe('number');
    });

    it('should preserve createdAt but update updatedAt on update', async () => {
      const originalCreatedAt = Date.now() - 10000;

      const payload = {
        title: 'Updated Entry',
        createdAt: originalCreatedAt,
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.note.createdAt).toBe(originalCreatedAt);
      expect(data.note.updatedAt).toBeGreaterThan(originalCreatedAt);
    });
  });
});
