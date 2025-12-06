/**
 * P0 BLOCKER: API Contract Tests - /api/ideas
 *
 * Tests for Idea Packets CRUD API endpoint
 * - GET /api/ideas - List ideas
 * - POST /api/ideas - Create/Update idea
 * - POST /api/ideas (delete mode) - Delete idea
 *
 * Validates:
 * - Request/Response contracts
 * - Required field validation (address, tf)
 * - Idea linking (journal, rules)
 * - Timeline merging
 * - Error handling
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import handler from '../../api/ideas/index';

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
  const url = `https://example.com/api/ideas?userId=${userId}`;

  return new Request(url, {
    method,
    headers: {
      'content-type': 'application/json',
      'x-user-id': userId,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe('API Contract Tests - /api/ideas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/ideas - List Ideas', () => {
    it('should return empty list when no ideas exist', async () => {
      vi.mocked(kvSMembers).mockResolvedValue([]);

      const req = createRequest('GET');
      const res = await handler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual({ ok: true, ideas: [] });
    });

    it('should return all user ideas sorted by updatedAt descending', async () => {
      const mockIdeas = [
        {
          id: 'idea-1',
          userId: 'test-user',
          address: 'SOL',
          tf: '1h',
          title: 'Old Idea',
          thesis: 'Test',
          side: 'long',
          status: 'draft',
          createdAt: 1000,
          updatedAt: 1000,
          links: {},
          flags: {},
          outcome: {},
          timeline: [],
        },
        {
          id: 'idea-2',
          userId: 'test-user',
          address: 'BTC',
          tf: '4h',
          title: 'New Idea',
          thesis: 'Test',
          side: 'short',
          status: 'active',
          createdAt: 2000,
          updatedAt: 2000,
          links: {},
          flags: {},
          outcome: {},
          timeline: [],
        },
      ];

      vi.mocked(kvSMembers).mockResolvedValue(['idea-1', 'idea-2']);
      vi.mocked(kvGet)
        .mockResolvedValueOnce(mockIdeas[0])
        .mockResolvedValueOnce(mockIdeas[1]);

      const req = createRequest('GET');
      const res = await handler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.ideas).toHaveLength(2);
      // Should be sorted newest first
      expect(data.ideas[0]!.id).toBe('idea-2');
      expect(data.ideas[1]!.id).toBe('idea-1');
    });
  });

  describe('POST /api/ideas - Create Idea', () => {
    it('should create new idea with valid payload', async () => {
      const payload = {
        address: 'SOL',
        tf: '1h',
        title: 'SOL Breakout Setup',
        thesis: 'Bullish flag pattern on 4H',
        side: 'long',
        entry: 95.50,
        invalidation: 92.00,
        targets: [100, 105, 110],
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.idea).toBeDefined();
      expect(data.idea.id).toBeDefined();
      expect(data.idea.title).toBe('SOL Breakout Setup');
      expect(data.idea.entry).toBe(95.50);
      expect(data.idea.targets).toEqual([100, 105, 110]);

      expect(kvSet).toHaveBeenCalled();
      expect(kvSAdd).toHaveBeenCalled();
    });

    it('should generate UUID if no ID provided', async () => {
      const payload = {
        address: 'BTC',
        tf: '4h',
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.ok).toBe(true);
      expect(data.idea.id).toMatch(/^[a-f0-9-]{36}$/); // UUID pattern
    });

    it('should use provided ID if given', async () => {
      const payload = {
        id: 'custom-idea-123',
        address: 'ETH',
        tf: '1d',
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.ok).toBe(true);
      expect(data.idea.id).toBe('custom-idea-123');
    });

    it('should default side to "long" if not provided', async () => {
      const payload = {
        address: 'SOL',
        tf: '1h',
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.idea.side).toBe('long');
    });

    it('should default title to "Idea" if not provided', async () => {
      const payload = {
        address: 'BTC',
        tf: '4h',
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.idea.title).toBe('Idea');
    });

    it('should default thesis to empty string if not provided', async () => {
      const payload = {
        address: 'SOL',
        tf: '1h',
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.idea.thesis).toBe('');
    });

    it('should default status to "draft" if not provided', async () => {
      const payload = {
        address: 'ETH',
        tf: '1h',
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.idea.status).toBe('draft');
    });
  });

  describe('POST /api/ideas - Update Idea', () => {
    it('should merge updates with existing idea', async () => {
      const existingIdea = {
        id: 'existing-123',
        userId: 'test-user',
        address: 'SOL',
        tf: '1h',
        title: 'Original Title',
        thesis: 'Original Thesis',
        side: 'long',
        status: 'draft',
        createdAt: 1000,
        updatedAt: 1000,
        links: { journalId: 'journal-123' },
        flags: {},
        outcome: {},
        timeline: [],
      };

      vi.mocked(kvGet).mockResolvedValue(existingIdea);

      const payload = {
        id: 'existing-123',
        title: 'Updated Title',
        // Other fields should be preserved
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.idea.title).toBe('Updated Title');
      expect(data.idea.thesis).toBe('Original Thesis'); // Preserved
      expect(data.idea.address).toBe('SOL'); // Preserved
      expect(data.idea.links.journalId).toBe('journal-123'); // Preserved
    });

    it('should preserve createdAt but update updatedAt', async () => {
      const originalCreatedAt = Date.now() - 10000;

      const existingIdea = {
        id: 'existing-123',
        userId: 'test-user',
        address: 'SOL',
        tf: '1h',
        side: 'long',
        title: 'Test',
        thesis: '',
        status: 'draft',
        createdAt: originalCreatedAt,
        updatedAt: originalCreatedAt,
        links: {},
        flags: {},
        outcome: {},
        timeline: [],
      };

      vi.mocked(kvGet).mockResolvedValue(existingIdea);

      const payload = {
        id: 'existing-123',
        title: 'Updated',
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.idea.createdAt).toBe(originalCreatedAt);
      expect(data.idea.updatedAt).toBeGreaterThan(originalCreatedAt);
    });
  });

  describe('POST /api/ideas - Validation', () => {
    it('should return 400 if address is missing', async () => {
      // Ensure no previous idea exists
      vi.mocked(kvGet).mockResolvedValue(null);

      const payload = {
        // Missing address
        tf: '1h',
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.ok).toBe(false);
      expect(data.error).toContain('address & tf required');
    });

    it('should return 400 if tf is missing', async () => {
      // Ensure no previous idea exists
      vi.mocked(kvGet).mockResolvedValue(null);

      const payload = {
        address: 'SOL',
        // Missing tf
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.ok).toBe(false);
      expect(data.error).toContain('address & tf required');
    });

    it('should return 400 if both address and tf are missing', async () => {
      // Ensure no previous idea exists
      vi.mocked(kvGet).mockResolvedValue(null);

      const payload = {
        title: 'Test Idea',
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.ok).toBe(false);
    });
  });

  describe('POST /api/ideas - Links & Flags', () => {
    it('should support linking to journal entry', async () => {
      const payload = {
        address: 'SOL',
        tf: '1h',
        links: {
          journalId: 'journal-123',
        },
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.idea.links.journalId).toBe('journal-123');
    });

    it('should support linking to rule', async () => {
      const payload = {
        address: 'BTC',
        tf: '4h',
        links: {
          ruleId: 'rule-456',
        },
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.idea.links.ruleId).toBe('rule-456');
    });

    it('should support multiple links', async () => {
      const payload = {
        address: 'ETH',
        tf: '1h',
        links: {
          journalId: 'journal-123',
          ruleId: 'rule-456',
          chartId: 'chart-789',
        },
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.idea.links).toEqual({
        journalId: 'journal-123',
        ruleId: 'rule-456',
        chartId: 'chart-789',
      });
    });

    it('should support custom flags', async () => {
      const payload = {
        address: 'SOL',
        tf: '1h',
        flags: {
          aiGenerated: true,
          highConfidence: true,
        },
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.idea.flags.aiGenerated).toBe(true);
      expect(data.idea.flags.highConfidence).toBe(true);
    });
  });

  describe('POST /api/ideas - Targets & Numbers', () => {
    it('should parse entry as number', async () => {
      const payload = {
        address: 'SOL',
        tf: '1h',
        entry: '95.50',
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.idea.entry).toBe(95.50);
    });

    it('should parse invalidation as number', async () => {
      const payload = {
        address: 'BTC',
        tf: '4h',
        invalidation: '92000',
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.idea.invalidation).toBe(92000);
    });

    it('should parse targets array as numbers', async () => {
      const payload = {
        address: 'ETH',
        tf: '1h',
        targets: ['3000', '3200', '3500'],
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.idea.targets).toEqual([3000, 3200, 3500]);
    });

    it('should limit targets to 6 items', async () => {
      const payload = {
        address: 'SOL',
        tf: '1h',
        targets: [100, 105, 110, 115, 120, 125, 130, 135], // 8 targets
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.idea.targets).toHaveLength(6);
    });

    it('should set entry to undefined for invalid numbers', async () => {
      const payload = {
        address: 'SOL',
        tf: '1h',
        entry: 'not-a-number',
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.idea.entry).toBeUndefined();
    });
  });

  describe('POST /api/ideas - Timeline', () => {
    it('should merge timeline events', async () => {
      const existingIdea = {
        id: 'existing-123',
        userId: 'test-user',
        address: 'SOL',
        tf: '1h',
        side: 'long',
        title: 'Test',
        thesis: '',
        status: 'draft',
        createdAt: 1000,
        updatedAt: 1000,
        links: {},
        flags: {},
        outcome: {},
        timeline: [
          { ts: 1000, event: 'created' },
        ],
      };

      vi.mocked(kvGet).mockResolvedValue(existingIdea);

      const payload = {
        id: 'existing-123',
        timeline: [
          { ts: 2000, event: 'updated' },
        ],
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.idea.timeline).toHaveLength(2);
      expect(data.idea.timeline[0]!.event).toBe('created');
      expect(data.idea.timeline[1]!.event).toBe('updated');
    });

    it('should sort timeline by timestamp ascending', async () => {
      // Create idea with existing timeline first
      const existingIdea = {
        id: 'timeline-test',
        userId: 'test-user',
        address: 'SOL',
        tf: '1h',
        side: 'long',
        title: 'Test',
        thesis: '',
        status: 'draft',
        createdAt: 1000,
        updatedAt: 1000,
        links: {},
        flags: {},
        outcome: {},
        timeline: [],
      };

      vi.mocked(kvGet).mockResolvedValue(existingIdea);

      const payload = {
        id: 'timeline-test',
        timeline: [
          { ts: 3000, event: 'third' },
          { ts: 1000, event: 'first' },
          { ts: 2000, event: 'second' },
        ],
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.idea.timeline).toHaveLength(3);
      expect(data.idea.timeline[0]!.event).toBe('first');
      expect(data.idea.timeline[1]!.event).toBe('second');
      expect(data.idea.timeline[2]!.event).toBe('third');
    });

    it('should cap timeline to 1000 entries', async () => {
      const largeTimeline = Array.from({ length: 1500 }, (_, i) => ({
        ts: i,
        event: `event-${i}`,
      }));

      const payload = {
        address: 'SOL',
        tf: '1h',
        timeline: largeTimeline,
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(data.idea.timeline).toHaveLength(1000);
      // Should keep most recent 1000 (slice(-1000) keeps last 1000, so starts at index 500)
      expect(data.idea.timeline[0]!.ts).toBeGreaterThanOrEqual(500);
    });
  });

  describe('POST /api/ideas - Delete Idea', () => {
    it('should delete idea when delete flag provided', async () => {
      const payload = {
        delete: true,
        id: 'idea-to-delete',
      };

      const req = createRequest('POST', payload);
      const res = await handler(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.ok).toBe(true);
      expect(data.deleted).toBe('idea-to-delete');

      expect(kvDel).toHaveBeenCalledWith('idea:test-user:idea-to-delete');
    });

    it('should not create idea if delete flag is true', async () => {
      const payload = {
        delete: true,
        id: 'test-id',
        address: 'SOL',
        tf: '1h',
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

      expect(kvSMembers).toHaveBeenCalledWith('ideas:byUser:user-from-query');
    });

    it('should include userId in created idea', async () => {
      const payload = {
        address: 'SOL',
        tf: '1h',
      };

      const req = createRequest('POST', payload, 'specific-user');
      const res = await handler(req);
      const data = await res.json();

      expect(data.idea.userId).toBe('specific-user');
    });
  });
});
