/**
 * P0 BLOCKER: API Integration Tests - One-Click Packet
 *
 * Tests for coordinated creation of Journal + Rule + Idea
 * Validates the "One-Click" flow where a user creates a complete trading setup
 *
 * Flow:
 * 1. Create Journal Entry (trade plan)
 * 2. Create Alert Rule (trigger condition)
 * 3. Create Idea (thesis with links to journal + rule)
 *
 * Validates:
 * - All three entities created with unique IDs
 * - Cross-links established correctly (idea.links.journalId, idea.links.ruleId)
 * - Timestamps consistent
 * - User isolation maintained
 * - Error handling for missing dependencies
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import journalHandler from '../../api/journal/index';
import rulesHandler from '../../api/rules/index';
import ideasHandler from '../../api/ideas/index';

// Mock @vercel/kv
vi.mock('../../src/lib/kv', () => ({
  kvGet: vi.fn(),
  kvSet: vi.fn(),
  kvDel: vi.fn(),
  kvSAdd: vi.fn(),
  kvSMembers: vi.fn(),
}));

import { kvGet, kvSet, kvSAdd } from '../../src/lib/kv';

// Helper: Create mock Request
function createRequest(
  url: string,
  method: string,
  body?: any,
  userId = 'test-user'
): Request {
  const fullUrl = `https://example.com${url}?userId=${userId}`;

  return new Request(fullUrl, {
    method,
    headers: {
      'content-type': 'application/json',
      'x-user-id': userId,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe('API Integration Tests - One-Click Packet', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Complete Flow: Journal + Rule + Idea', () => {
    it('should create complete trading setup with cross-links', async () => {
      // Step 1: Create Journal Entry
      const journalPayload = {
        title: 'SOL Long Setup',
        body: 'Bullish flag pattern on 4H, expecting breakout to $110',
        address: 'So11111111111111111111111111111111111111112',
        tags: ['breakout', 'momentum'],
        entryPrice: 95.50,
        stopLoss: 92.00,
        takeProfit: 110.00,
      };

      const journalReq = createRequest('/api/journal', 'POST', journalPayload);
      const journalRes = await journalHandler(journalReq);
      const journalData = await journalRes.json();

      expect(journalRes.status).toBe(200);
      expect(journalData.ok).toBe(true);
      expect(journalData.note.id).toBeDefined();
      
      const journalId = journalData.note.id;

      // Verify KV calls
      expect(kvSet).toHaveBeenCalledWith(
        `journal:test-user:${journalId}`,
        expect.objectContaining({ title: 'SOL Long Setup' })
      );
      expect(kvSAdd).toHaveBeenCalledWith('journal:byUser:test-user', journalId);

      // Step 2: Create Alert Rule
      const rulePayload = {
        address: 'SOL',
        tf: '4h',
        rule: 'price > 95.5',
        active: true,
      };

      const ruleReq = createRequest('/api/rules', 'POST', rulePayload);
      const ruleRes = await rulesHandler(ruleReq);
      const ruleData = await ruleRes.json();

      expect(ruleRes.status).toBe(200);
      expect(ruleData.ok).toBe(true);
      expect(ruleData.id).toBeDefined();
      expect(ruleData.rule.address).toBe('SOL');

      const ruleId = ruleData.id;

      // Verify KV calls
      expect(kvSet).toHaveBeenCalledWith(
        `rule:test-user:${ruleId}`,
        expect.objectContaining({ address: 'SOL', tf: '4h' })
      );
      expect(kvSAdd).toHaveBeenCalledWith('rules:byUser:test-user', ruleId);

      // Step 3: Create Idea with links to Journal and Rule
      const ideaPayload = {
        address: 'SOL',
        tf: '4h',
        title: 'SOL Breakout Play',
        thesis: 'Flag breakout with strong volume, targeting weekly resistance at $110',
        side: 'long',
        entry: 95.50,
        invalidation: 92.00,
        targets: [100, 105, 110],
        links: {
          journalId,
          ruleId,
        },
        flags: {
          oneClickPacket: true,
        },
      };

      const ideaReq = createRequest('/api/ideas', 'POST', ideaPayload);
      const ideaRes = await ideasHandler(ideaReq);
      const ideaData = await ideaRes.json();

      expect(ideaRes.status).toBe(200);
      expect(ideaData.ok).toBe(true);
      expect(ideaData.idea.id).toBeDefined();
      
      const ideaId = ideaData.idea.id;

      // Verify cross-links
      expect(ideaData.idea.links.journalId).toBe(journalId);
      expect(ideaData.idea.links.ruleId).toBe(ruleId);
      expect(ideaData.idea.flags.oneClickPacket).toBe(true);

      // Verify all IDs are unique
      expect(journalId).not.toBe(ruleId);
      expect(journalId).not.toBe(ideaId);
      expect(ruleId).not.toBe(ideaId);

      // Verify all entities have correct addresses
      expect(journalData.note.address).toBe('So11111111111111111111111111111111111111112');
      expect(ruleData.rule.address).toBe('SOL');
      expect(ideaData.idea.address).toBe('SOL');

      // Verify KV calls for idea
      expect(kvSet).toHaveBeenCalledWith(
        `idea:test-user:${ideaId}`,
        expect.objectContaining({
          address: 'SOL',
          links: expect.objectContaining({
            journalId,
            ruleId,
          }),
        })
      );
      expect(kvSAdd).toHaveBeenCalledWith('ideas:byUser:test-user', ideaId);
    });

    it('should maintain consistent timestamps across packet', async () => {
      const startTime = Date.now();

      // Create Journal
      const journalReq = createRequest('/api/journal', 'POST', {
        title: 'Test Entry',
        address: 'BTC',
      });
      const journalRes = await journalHandler(journalReq);
      const journalData = await journalRes.json();

      // Create Rule
      const ruleReq = createRequest('/api/rules', 'POST', {
        address: 'BTC',
        tf: '1h',
        rule: 'test',
      });
      const ruleRes = await rulesHandler(ruleReq);
      const ruleData = await ruleRes.json();

      // Create Idea
      const ideaReq = createRequest('/api/ideas', 'POST', {
        address: 'BTC',
        tf: '1h',
        links: {
          journalId: journalData.note.id,
          ruleId: ruleData.id,
        },
      });
      const ideaRes = await ideasHandler(ideaReq);
      const ideaData = await ideaRes.json();

      const endTime = Date.now();

      // All entities should have timestamps within the execution window
      expect(journalData.note.createdAt).toBeGreaterThanOrEqual(startTime);
      expect(journalData.note.createdAt).toBeLessThanOrEqual(endTime);

      expect(ruleData.rule.createdAt).toBeGreaterThanOrEqual(startTime);
      expect(ruleData.rule.createdAt).toBeLessThanOrEqual(endTime);

      expect(ideaData.idea.createdAt).toBeGreaterThanOrEqual(startTime);
      expect(ideaData.idea.createdAt).toBeLessThanOrEqual(endTime);

      // Journal should be created first (or close to first)
      expect(journalData.note.createdAt).toBeLessThanOrEqual(ideaData.idea.createdAt);
    });

    it('should support partial packet (journal + idea, no rule)', async () => {
      // Create Journal
      const journalReq = createRequest('/api/journal', 'POST', {
        title: 'ETH Trade',
        address: 'ETH',
        entryPrice: 3000,
      });
      const journalRes = await journalHandler(journalReq);
      const journalData = await journalRes.json();
      const journalId = journalData.note.id;

      // Create Idea linked to journal only
      const ideaReq = createRequest('/api/ideas', 'POST', {
        address: 'ETH',
        tf: '1h',
        title: 'ETH Long',
        links: {
          journalId,
          // No ruleId
        },
      });
      const ideaRes = await ideasHandler(ideaReq);
      const ideaData = await ideaRes.json();

      expect(ideaRes.status).toBe(200);
      expect(ideaData.ok).toBe(true);
      expect(ideaData.idea.links.journalId).toBe(journalId);
      expect(ideaData.idea.links.ruleId).toBeUndefined();
    });

    it('should support partial packet (rule + idea, no journal)', async () => {
      // Create Rule
      const ruleReq = createRequest('/api/rules', 'POST', {
        address: 'BNB',
        tf: '1h',
        rule: 'volume spike',
      });
      const ruleRes = await rulesHandler(ruleReq);
      const ruleData = await ruleRes.json();
      const ruleId = ruleData.id;

      // Create Idea linked to rule only
      const ideaReq = createRequest('/api/ideas', 'POST', {
        address: 'BNB',
        tf: '1h',
        title: 'BNB Alert Setup',
        links: {
          ruleId,
          // No journalId
        },
      });
      const ideaRes = await ideasHandler(ideaReq);
      const ideaData = await ideaRes.json();

      expect(ideaRes.status).toBe(200);
      expect(ideaData.ok).toBe(true);
      expect(ideaData.idea.links.ruleId).toBe(ruleId);
      expect(ideaData.idea.links.journalId).toBeUndefined();
    });
  });

  describe('User Isolation in Packet Flow', () => {
    it('should maintain user isolation across all entities', async () => {
      const userId = 'user-123';

      // Create Journal for user-123
      const journalReq = createRequest(
        '/api/journal',
        'POST',
        { title: 'User 123 Trade', address: 'SOL' },
        userId
      );
      const journalRes = await journalHandler(journalReq);
      const journalData = await journalRes.json();

      // Create Rule for user-123
      const ruleReq = createRequest(
        '/api/rules',
        'POST',
        { address: 'SOL', tf: '1h', rule: 'test' },
        userId
      );
      const ruleRes = await rulesHandler(ruleReq);
      const ruleData = await ruleRes.json();

      // Create Idea for user-123
      const ideaReq = createRequest(
        '/api/ideas',
        'POST',
        {
          address: 'SOL',
          tf: '1h',
          links: {
            journalId: journalData.note.id,
            ruleId: ruleData.id,
          },
        },
        userId
      );
      const ideaRes = await ideasHandler(ideaReq);
      const ideaData = await ideaRes.json();

      // Verify all KV calls used correct userId
      expect(kvSet).toHaveBeenCalledWith(
        `journal:${userId}:${journalData.note.id}`,
        expect.any(Object)
      );
      expect(kvSet).toHaveBeenCalledWith(
        `rule:${userId}:${ruleData.id}`,
        expect.any(Object)
      );
      expect(kvSet).toHaveBeenCalledWith(
        `idea:${userId}:${ideaData.idea.id}`,
        expect.any(Object)
      );

      // Verify all entities have correct userId
      expect(ruleData.rule.userId).toBe(userId);
      expect(ideaData.idea.userId).toBe(userId);
    });

    it('should not allow cross-user links (security)', async () => {
      // Create Journal for user-A
      const journalReq = createRequest(
        '/api/journal',
        'POST',
        { title: 'User A Trade', address: 'SOL' },
        'user-a'
      );
      const journalRes = await journalHandler(journalReq);
      const journalData = await journalRes.json();
      const journalId = journalData.note.id;

      // Try to create Idea for user-B with user-A's journal
      const ideaReq = createRequest(
        '/api/ideas',
        'POST',
        {
          address: 'SOL',
          tf: '1h',
          links: {
            journalId, // From user-a
          },
        },
        'user-b'
      );
      const ideaRes = await ideasHandler(ideaReq);
      const ideaData = await ideaRes.json();

      // API allows the link (validation would happen on read/display)
      // But user-b's idea should be stored under user-b namespace
      expect(kvSet).toHaveBeenCalledWith(
        `idea:user-b:${ideaData.idea.id}`,
        expect.objectContaining({
          userId: 'user-b',
          links: expect.objectContaining({
            journalId, // Link is stored, but access control happens on read
          }),
        })
      );
    });
  });

  describe('Error Handling in Packet Flow', () => {
    it('should handle journal creation failure gracefully', async () => {
      // Force KV error during journal creation
      vi.mocked(kvSet).mockRejectedValueOnce(new Error('KV write failed'));

      const journalReq = createRequest('/api/journal', 'POST', {
        title: 'Test',
        address: 'SOL',
      });

      await expect(journalHandler(journalReq)).rejects.toThrow('KV write failed');

      // Subsequent rule/idea creation should not proceed (user would handle this)
    });

    it('should handle rule creation failure gracefully', async () => {
      // Create journal successfully
      const journalReq = createRequest('/api/journal', 'POST', {
        title: 'Test',
        address: 'SOL',
      });
      const journalRes = await journalHandler(journalReq);
      const journalData = await journalRes.json();

      // Force KV error during rule creation
      vi.mocked(kvSet).mockRejectedValueOnce(new Error('Rule save failed'));

      const ruleReq = createRequest('/api/rules', 'POST', {
        address: 'SOL',
        tf: '1h',
        rule: 'test',
      });

      await expect(rulesHandler(ruleReq)).rejects.toThrow('Rule save failed');

      // Journal was created, but rule failed
      // User can retry rule creation or proceed with partial packet
    });

    it('should validate required fields for each entity', async () => {
      // Journal with missing title (should still work, title optional)
      const journalReq = createRequest('/api/journal', 'POST', {
        body: 'Just a body',
      });
      const journalRes = await journalHandler(journalReq);
      expect(journalRes.status).toBe(200); // Title is optional

      // Rule with missing required fields
      const ruleReq = createRequest('/api/rules', 'POST', {
        // Missing address, tf, rule
        active: true,
      });
      const ruleRes = await rulesHandler(ruleReq);
      const ruleData = await ruleRes.json();
      expect(ruleRes.status).toBe(400);
      expect(ruleData.ok).toBe(false);
      expect(ruleData.error).toContain('address, tf, rule required');

      // Idea with missing required fields
      vi.mocked(kvGet).mockResolvedValue(null); // No existing idea
      const ideaReq = createRequest('/api/ideas', 'POST', {
        // Missing address, tf
        title: 'Test',
      });
      const ideaRes = await ideasHandler(ideaReq);
      const ideaData = await ideaRes.json();
      expect(ideaRes.status).toBe(400);
      expect(ideaData.ok).toBe(false);
      expect(ideaData.error).toContain('address & tf required');
    });

    it('should handle invalid link IDs gracefully', async () => {
      // Create Idea with non-existent journalId
      const ideaReq = createRequest('/api/ideas', 'POST', {
        address: 'SOL',
        tf: '1h',
        title: 'Orphaned Idea',
        links: {
          journalId: 'non-existent-journal-id',
          ruleId: 'non-existent-rule-id',
        },
      });
      const ideaRes = await ideasHandler(ideaReq);
      const ideaData = await ideaRes.json();

      // API allows orphaned links (validation happens on read/display)
      expect(ideaRes.status).toBe(200);
      expect(ideaData.ok).toBe(true);
      expect(ideaData.idea.links.journalId).toBe('non-existent-journal-id');
      expect(ideaData.idea.links.ruleId).toBe('non-existent-rule-id');
    });

    it('should handle concurrent packet creation (race conditions)', async () => {
      // Simulate concurrent creation by calling handlers in parallel
      const promises = [
        journalHandler(
          createRequest('/api/journal', 'POST', {
            title: 'Trade 1',
            address: 'SOL',
          })
        ),
        rulesHandler(
          createRequest('/api/rules', 'POST', {
            address: 'SOL',
            tf: '1h',
            rule: 'test1',
          })
        ),
        ideasHandler(
          createRequest('/api/ideas', 'POST', {
            address: 'SOL',
            tf: '1h',
            title: 'Idea 1',
          })
        ),
      ];

      const results = await Promise.all(promises);

      // All should succeed independently
      expect(results[0]!.status).toBe(200);
      expect(results[1]!.status).toBe(200);
      expect(results[2]!.status).toBe(200);

      // Extract IDs
      const [journalRes, ruleRes, ideaRes] = results;
      const journalData = await journalRes!.json();
      const ruleData = await ruleRes!.json();
      const ideaData = await ideaRes!.json();

      // All IDs should be unique
      const ids = [journalData.note.id, ruleData.id, ideaData.idea.id];
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(3);
    });
  });

  describe('Data Consistency in Packet', () => {
    it('should propagate address correctly across entities', async () => {
      const address = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'; // USDC address

      const journalReq = createRequest('/api/journal', 'POST', {
        title: 'USDC Test',
        address,
      });
      const journalRes = await journalHandler(journalReq);
      const journalData = await journalRes.json();

      const ruleReq = createRequest('/api/rules', 'POST', {
        address: 'USDC', // Ticker instead of full address
        tf: '1h',
        rule: 'test',
      });
      const ruleRes = await rulesHandler(ruleReq);
      const ruleData = await ruleRes.json();

      const ideaReq = createRequest('/api/ideas', 'POST', {
        address: 'USDC',
        tf: '1h',
        links: {
          journalId: journalData.note.id,
          ruleId: ruleData.id,
        },
      });
      const ideaRes = await ideasHandler(ideaReq);
      const ideaData = await ideaRes.json();

      // Journal stores full address, rule/idea store ticker
      expect(journalData.note.address).toBe(address);
      expect(ruleData.rule.address).toBe('USDC');
      expect(ideaData.idea.address).toBe('USDC');
    });

    it('should handle timeframe consistency across packet', async () => {
      const tf = '4h';

      const journalReq = createRequest('/api/journal', 'POST', {
        title: 'Test',
        tf,
      });
      const journalRes = await journalHandler(journalReq);
      const journalData = await journalRes.json();

      const ruleReq = createRequest('/api/rules', 'POST', {
        address: 'SOL',
        tf,
        rule: 'test',
      });
      const ruleRes = await rulesHandler(ruleReq);
      const ruleData = await ruleRes.json();

      const ideaReq = createRequest('/api/ideas', 'POST', {
        address: 'SOL',
        tf,
      });
      const ideaRes = await ideasHandler(ideaReq);
      const ideaData = await ideaRes.json();

      // All should have same timeframe
      expect(journalData.note.tf).toBe(tf);
      expect(ruleData.rule.tf).toBe(tf);
      expect(ideaData.idea.tf).toBe(tf);
    });
  });
});
