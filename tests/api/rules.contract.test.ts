/**
 * P0 BLOCKER: API Contract Tests - /api/rules
 *
 * Tests for Alert Rules CRUD API endpoint
 * - GET /api/rules - List rules
 * - POST /api/rules - Create/Update rule
 * - POST /api/rules (delete mode) - Delete rule
 *
 * Validates:
 * - Request/Response contracts
 * - Required field validation (address, tf, rule)
 * - Rule structure
 * - Error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import handler from '../../api/rules/index';

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
  const url = `https://example.com/api/rules?userId=${userId}`;

  return new Request(url, {
    method,
    headers: {
      'content-type': 'application/json',
      'x-user-id': userId,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe('API Contract Tests - /api/rules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/rules - List Rules', () => {
    it('should return empty list when no rules exist', async () => {
      vi.mocked(kvSMembers).mockResolvedValue([]);

      const req = createRequest('GET');
      const res = await handler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual({ ok: true, rules: [] });
    });

    it('should return all user rules', async () => {
      const mockRules = [
        {
          id: 'rule-1',
          userId: 'test-user',
          address: 'SOL',
          tf: '1h',
          rule: 'price > 100',
          active: true,
          createdAt: 1000,
          updatedAt: 1000,
        },
        {
          id: 'rule-2',
          userId: 'test-user',
          address: 'BTC',
          tf: '4h',
          rule: 'volume > 1000000',
          active: false,
          createdAt: 2000,
          updatedAt: 2000,
        },
      ];

      vi.mocked(kvSMembers).mockResolvedValue(['rule-1', 'rule-2']);
      vi.mocked(kvGet)
        .mockResolvedValueOnce(mockRules[0])
        .mockResolvedValueOnce(mockRules[1]);

      const req = createRequest('GET');
      const res = await handler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.rules).toHaveLength(2);
      expect(data.rules[0]!.id).toBe('rule-1');
      expect(data.rules[1]!.id).toBe('rule-2');
    });
  });

  describe('POST /api/rules - Create Rule', () => {
    it('should create new rule with valid payload', async () => {
      const payload = {
        address: 'SOL',
        tf: '1h',
        rule: 'price > 100',
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.id).toBeDefined();
      expect(data.rule).toBeDefined();
      expect(data.rule.address).toBe('SOL');
      expect(data.rule.tf).toBe('1h');
      expect(data.rule.rule).toBe('price > 100');
      expect(data.rule.active).toBe(true); // Default true

      expect(kvSet).toHaveBeenCalledWith(
        expect.stringContaining('rule:test-user:'),
        expect.objectContaining({ address: 'SOL', tf: '1h' })
      );
      expect(kvSAdd).toHaveBeenCalled();
    });

    it('should generate UUID if no ID provided', async () => {
      const payload = {
        address: 'BTC',
        tf: '4h',
        rule: 'volume spike',
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.ok).toBe(true);
      expect(data.id).toMatch(/^[a-f0-9-]{36}$/); // UUID pattern
    });

    it('should use provided ID if given', async () => {
      const payload = {
        id: 'custom-rule-123',
        address: 'ETH',
        tf: '1d',
        rule: 'price cross MA',
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.ok).toBe(true);
      expect(data.id).toBe('custom-rule-123');
    });

    it('should allow setting active to false', async () => {
      const payload = {
        address: 'SOL',
        tf: '1h',
        rule: 'test rule',
        active: false,
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.rule.active).toBe(false);
    });

    it('should set timestamps on creation', async () => {
      const payload = {
        address: 'BTC',
        tf: '1h',
        rule: 'test',
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.rule.createdAt).toBeDefined();
      expect(data.rule.updatedAt).toBeDefined();
      expect(typeof data.rule.createdAt).toBe('number');
      expect(typeof data.rule.updatedAt).toBe('number');
    });

    it('should preserve createdAt but update updatedAt on update', async () => {
      const originalCreatedAt = Date.now() - 10000;

      const payload = {
        id: 'existing-rule',
        address: 'SOL',
        tf: '1h',
        rule: 'updated rule',
        createdAt: originalCreatedAt,
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.rule.createdAt).toBe(originalCreatedAt);
      expect(data.rule.updatedAt).toBeGreaterThan(originalCreatedAt);
    });
  });

  describe('POST /api/rules - Validation', () => {
    it('should return 400 if address is missing', async () => {
      const payload = {
        // Missing address
        tf: '1h',
        rule: 'price > 100',
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.ok).toBe(false);
      expect(data.error).toContain('address, tf, rule required');
    });

    it('should return 400 if tf is missing', async () => {
      const payload = {
        address: 'SOL',
        // Missing tf
        rule: 'price > 100',
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.ok).toBe(false);
      expect(data.error).toContain('address, tf, rule required');
    });

    it('should return 400 if rule is missing', async () => {
      const payload = {
        address: 'BTC',
        tf: '4h',
        // Missing rule
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.ok).toBe(false);
      expect(data.error).toContain('address, tf, rule required');
    });

    it('should return 400 if all required fields are missing', async () => {
      const payload = {
        active: true,
        // No address, tf, or rule
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.ok).toBe(false);
    });
  });

  describe('POST /api/rules - Delete Rule', () => {
    it('should delete rule when delete flag provided', async () => {
      const payload = {
        delete: true,
        id: 'rule-to-delete',
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.deleted).toBe('rule-to-delete');

      expect(kvDel).toHaveBeenCalledWith('rule:test-user:rule-to-delete');
    });

    it('should not create rule if delete flag is true', async () => {
      const payload = {
        delete: true,
        id: 'test-id',
        address: 'SOL',
        tf: '1h',
        rule: 'Should not be created',
      };

      const req = createRequest('POST', payload);
      await handler(req);

      expect(kvSet).not.toHaveBeenCalled();
      expect(kvDel).toHaveBeenCalled();
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
  });

  describe('User Isolation', () => {
    it('should use userId from query param', async () => {
      vi.mocked(kvSMembers).mockResolvedValue([]);

      const req = createRequest('GET', undefined, 'user-from-query');
      await handler(req);

      expect(kvSMembers).toHaveBeenCalledWith('rules:byUser:user-from-query');
    });

    it('should use userId from x-user-id header', async () => {
      vi.mocked(kvSMembers).mockResolvedValue([]);

      const req = new Request('https://example.com/api/rules', {
        method: 'GET',
        headers: {
          'x-user-id': 'user-from-header',
        },
      });

      await handler(req);

      expect(kvSMembers).toHaveBeenCalledWith('rules:byUser:user-from-header');
    });

    it('should default to "anon" if no userId provided', async () => {
      vi.mocked(kvSMembers).mockResolvedValue([]);

      const req = new Request('https://example.com/api/rules', {
        method: 'GET',
      });

      await handler(req);

      expect(kvSMembers).toHaveBeenCalledWith('rules:byUser:anon');
    });

    it('should include userId in created rule', async () => {
      const payload = {
        address: 'SOL',
        tf: '1h',
        rule: 'test',
      };

      const req = createRequest('POST', payload, 'specific-user');
      const res = await handler(req);
      const data = await res.json();

      expect(data.rule.userId).toBe('specific-user');
    });
  });
});
