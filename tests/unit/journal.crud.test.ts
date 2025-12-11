/**
 * P0 BLOCKER: Journal CRUD Tests
 * Tests for journal CRUD operations with IndexedDB persistence
 *
 * Coverage:
 * - Create entry → persists to IndexedDB
 * - Read entry → retrieves from IndexedDB
 * - Update entry → persists changes
 * - Delete entry → removes from IndexedDB
 * - Edge cases (validation, concurrent updates, large data)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createEntry,
  getEntry,
  updateEntry,
  updateEntryNotes,
  deleteEntry,
  queryEntries,
  getEntriesByStatus,
  markAsActive,
  closeEntry,
  exportEntries,
  importJournalEntries,
  addScreenshotToEntry,
  createJournalEntryFromChart,
} from '@/lib/JournalService';
import { initDB, resetDbInstance } from '@/lib/db';
import type { JournalEntry, JournalImportPayload, TradeOutcome } from '@/types/journal';
import { createQuickJournalEntry } from '@/store/journalStore';

// Helper: Clear journal_entries store before each test
async function clearJournalStore(): Promise<void> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['journal_entries'], 'readwrite');
    const store = transaction.objectStore('journal_entries');
    const request = store.clear();

    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Helper: Count entries in store
async function countEntries(): Promise<number> {
  const db = await initDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(['journal_entries'], 'readonly');
    const store = transaction.objectStore('journal_entries');
    const request = store.count();

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function seedLegacyV4Database(): Promise<void> {
  resetDbInstance();

  await new Promise<void>((resolve, reject) => {
    const deleteRequest = indexedDB.deleteDatabase('sparkfined-ta-pwa');
    deleteRequest.onsuccess = () => resolve();
    deleteRequest.onerror = () => reject(deleteRequest.error);
  });

  await new Promise<void>((resolve, reject) => {
    const request = indexedDB.open('sparkfined-ta-pwa', 4);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (db.objectStoreNames.contains('journal_entries')) {
        db.deleteObjectStore('journal_entries');
      }
      const store = db.createObjectStore('journal_entries', { keyPath: 'id' });
      store.add({ id: 'legacy-1', title: 'Legacy Migration Entry', createdAt: 1_700_000_000_000 });
    };

    request.onsuccess = () => {
      request.result.close();
      resolve();
    };

    request.onerror = () => reject(request.error);
  });
}

describe('Journal CRUD Operations', () => {
  beforeEach(async () => {
    await clearJournalStore();
  });

  afterEach(async () => {
    // Cleanup: reset IndexedDB between tests
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('Create Entry', () => {
    it('should create journal entry and persist to IndexedDB', async () => {
      const newEntry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'> = {
        ticker: 'SOL',
        address: 'So11111111111111111111111111111111111111112',
        setup: 'breakout',
        emotion: 'confident',
        status: 'temp',
        timestamp: Date.now(),
        thesis: 'Bullish breakout above resistance',
      };

      const created = await createEntry(newEntry);

      // Should generate ID
      expect(created.id).toBeTruthy();
      expect(typeof created.id).toBe('string');

      // Should set timestamps
      expect(created.createdAt).toBeTruthy();
      expect(created.updatedAt).toBeTruthy();
      expect(created.createdAt).toBe(created.updatedAt);

      // Should preserve input data
      expect(created.ticker).toBe('SOL');
      expect(created.address).toBe('So11111111111111111111111111111111111111112');
      expect(created.setup).toBe('breakout');
      expect(created.emotion).toBe('confident');
      expect(created.status).toBe('temp');
      expect(created.thesis).toBe('Bullish breakout above resistance');

      // Should persist to IndexedDB
      const retrieved = await getEntry(created.id);
      expect(retrieved).toBeTruthy();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.ticker).toBe('SOL');
    });

    it('should create entry with minimal required fields', async () => {
      const minimalEntry: Omit<JournalEntry, 'id' | 'createdAt' | 'updatedAt'> = {
        ticker: 'BTC',
        address: 'manual',
        setup: 'custom',
        emotion: 'custom',
        status: 'active',
        timestamp: Date.now(),
      };

      const created = await createEntry(minimalEntry);

      expect(created.id).toBeTruthy();
      expect(created.ticker).toBe('BTC');
      expect(created.thesis).toBeUndefined();
      expect(created.outcome).toBeUndefined();
    });

    it('should increment entry count in store', async () => {
      const countBefore = await countEntries();
      expect(countBefore).toBe(0);

      await createEntry({
        ticker: 'ETH',
        address: 'manual',
        setup: 'custom',
        emotion: 'custom',
        status: 'temp',
        timestamp: Date.now(),
      });

      const countAfter = await countEntries();
      expect(countAfter).toBe(1);
    });
  });

  describe('Read Entry', () => {
    it('should retrieve entry by ID', async () => {
      const created = await createEntry({
        ticker: 'BONK',
        address: 'bonk-address',
        setup: 'breakout',
        emotion: 'fomo',
        status: 'temp',
        timestamp: Date.now(),
        thesis: 'Meme season',
      });

      const retrieved = await getEntry(created.id);

      expect(retrieved).toBeTruthy();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.ticker).toBe('BONK');
      expect(retrieved?.thesis).toBe('Meme season');
    });

    it('should return undefined for non-existent ID', async () => {
      const retrieved = await getEntry('non-existent-id-12345');
      expect(retrieved).toBeUndefined();
    });
  });

  describe('Update Entry', () => {
    it('should update entry notes and persist changes', async () => {
      const created = await createEntry({
        ticker: 'SOL',
        address: 'sol-address',
        setup: 'custom',
        emotion: 'custom',
        status: 'temp',
        timestamp: Date.now(),
        thesis: 'Initial thesis',
      });

      // Small delay to ensure updatedAt differs
      await new Promise(resolve => setTimeout(resolve, 5));

      const updated = await updateEntry(created.id, {
        thesis: 'Updated thesis with more details',
      });

      expect(updated).toBeTruthy();
      expect(updated?.thesis).toBe('Updated thesis with more details');
      expect(updated?.updatedAt).toBeGreaterThanOrEqual(created.updatedAt);

      // Verify persistence
      const retrieved = await getEntry(created.id);
      expect(retrieved?.thesis).toBe('Updated thesis with more details');
    });

    it('should update multiple fields', async () => {
      const created = await createEntry({
        ticker: 'ETH',
        address: 'eth-address',
        setup: 'custom',
        emotion: 'custom',
        status: 'temp',
        timestamp: Date.now(),
      });

      const updated = await updateEntry(created.id, {
        setup: 'breakout',
        emotion: 'confident',
        thesis: 'Strong breakout signal',
      });

      expect(updated?.setup).toBe('breakout');
      expect(updated?.emotion).toBe('confident');
      expect(updated?.thesis).toBe('Strong breakout signal');
    });

    it('should return undefined when updating non-existent entry', async () => {
      const updated = await updateEntry('non-existent-id', {
        thesis: 'Should not work',
      });

      expect(updated).toBeUndefined();
    });

    it('should update notes via updateEntryNotes helper', async () => {
      const created = await createEntry({
        ticker: 'BTC',
        address: 'btc-address',
        setup: 'custom',
        emotion: 'custom',
        status: 'active',
        timestamp: Date.now(),
      });

      const updated = await updateEntryNotes(created.id, 'New notes via helper');

      expect(updated.thesis).toBe('New notes via helper');
    });

    it('should throw error when updateEntryNotes targets non-existent entry', async () => {
      await expect(
        updateEntryNotes('non-existent-id', 'Should fail')
      ).rejects.toThrow('Journal entry non-existent-id not found');
    });
  });

  describe('Delete Entry', () => {
    it('should delete entry from IndexedDB', async () => {
      const created = await createEntry({
        ticker: 'DOGE',
        address: 'doge-address',
        setup: 'custom',
        emotion: 'custom',
        status: 'temp',
        timestamp: Date.now(),
      });

      await deleteEntry(created.id);

      const retrieved = await getEntry(created.id);
      expect(retrieved).toBeUndefined();
    });

    it('should decrement entry count', async () => {
      const created = await createEntry({
        ticker: 'ADA',
        address: 'ada-address',
        setup: 'custom',
        emotion: 'custom',
        status: 'temp',
        timestamp: Date.now(),
      });

      const countBefore = await countEntries();
      expect(countBefore).toBe(1);

      await deleteEntry(created.id);

      const countAfter = await countEntries();
      expect(countAfter).toBe(0);
    });

    it('should not throw error when deleting non-existent entry', async () => {
      // Should silently succeed (idempotent)
      await expect(deleteEntry('non-existent-id')).resolves.toBeUndefined();
    });
  });

  describe('Query Entries', () => {
    beforeEach(async () => {
      // Seed test data
      await createEntry({
        ticker: 'SOL',
        address: 'sol-1',
        setup: 'breakout',
        emotion: 'confident',
        status: 'active',
        timestamp: Date.now() - 3000,
        thesis: 'Long setup',
      });

      await createEntry({
        ticker: 'BTC',
        address: 'btc-1',
        setup: 'breakdown',
        emotion: 'fear',
        status: 'closed',
        timestamp: Date.now() - 2000,
        outcome: {
          pnl: 150,
          pnlPercent: 5.2,
          closedAt: Date.now(),
          winRate: 100,
          transactions: [],
        },
      });

      await createEntry({
        ticker: 'ETH',
        address: 'eth-1',
        setup: 'custom',
        emotion: 'custom',
        status: 'temp',
        timestamp: Date.now() - 1000,
      });
    });

    it('should return all entries by default', async () => {
      const entries = await queryEntries();
      expect(entries).toHaveLength(3);
    });

    it('should filter by status', async () => {
      const activeEntries = await queryEntries({ status: 'active' });
      expect(activeEntries).toHaveLength(1);
      expect(activeEntries[0]!.status).toBe('active');

      const closedEntries = await queryEntries({ status: 'closed' });
      expect(closedEntries).toHaveLength(1);
      expect(closedEntries[0]!.status).toBe('closed');
    });

    it('should filter by setup', async () => {
      const breakoutEntries = await queryEntries({ setup: 'breakout' });
      expect(breakoutEntries).toHaveLength(1);
      expect(breakoutEntries[0]!.setup).toBe('breakout');
    });

    it('should filter by emotion', async () => {
      const confidentEntries = await queryEntries({ emotion: 'confident' });
      expect(confidentEntries).toHaveLength(1);
      expect(confidentEntries[0]!.emotion).toBe('confident');
    });

    it('should sort by timestamp descending by default', async () => {
      const entries = await queryEntries({ sortBy: 'timestamp', sortOrder: 'desc' });
      expect(entries[0]!.ticker).toBe('ETH'); // Most recent
      expect(entries[2]!.ticker).toBe('SOL'); // Oldest
    });

    it('should sort by timestamp ascending', async () => {
      const entries = await queryEntries({ sortBy: 'timestamp', sortOrder: 'asc' });
      expect(entries[0]!.ticker).toBe('SOL'); // Oldest
      expect(entries[2]!.ticker).toBe('ETH'); // Most recent
    });

    it('should search in ticker and thesis', async () => {
      const results = await queryEntries({ search: 'Long' });
      expect(results).toHaveLength(1);
      expect(results[0]!.ticker).toBe('SOL');
    });

    it('should paginate results', async () => {
      const firstPage = await queryEntries({ limit: 2, offset: 0 });
      expect(firstPage).toHaveLength(2);

      const secondPage = await queryEntries({ limit: 2, offset: 2 });
      expect(secondPage).toHaveLength(1);
    });
  });

  describe('Status-based Queries', () => {
    beforeEach(async () => {
      await createEntry({
        ticker: 'TOKEN1',
        address: 'addr1',
        setup: 'custom',
        emotion: 'custom',
        status: 'temp',
        timestamp: Date.now(),
      });

      await createEntry({
        ticker: 'TOKEN2',
        address: 'addr2',
        setup: 'custom',
        emotion: 'custom',
        status: 'active',
        timestamp: Date.now(),
      });

      await createEntry({
        ticker: 'TOKEN3',
        address: 'addr3',
        setup: 'custom',
        emotion: 'custom',
        status: 'closed',
        timestamp: Date.now(),
        outcome: {
          pnl: 100,
          pnlPercent: 3,
          closedAt: Date.now(),
          winRate: 100,
          transactions: [],
        },
      });
    });

    it('should get entries by status', async () => {
      const tempEntries = await getEntriesByStatus('temp');
      expect(tempEntries).toHaveLength(1);
      expect(tempEntries[0]!.status).toBe('temp');

      const activeEntries = await getEntriesByStatus('active');
      expect(activeEntries).toHaveLength(1);
      expect(activeEntries[0]!.status).toBe('active');

      const closedEntries = await getEntriesByStatus('closed');
      expect(closedEntries).toHaveLength(1);
      expect(closedEntries[0]!.status).toBe('closed');
    });
  });

  describe('Entry Status Transitions', () => {
    it('should mark temp entry as active', async () => {
      const tempEntry = await createEntry({
        ticker: 'SOL',
        address: 'sol-address',
        setup: 'custom',
        emotion: 'custom',
        status: 'temp',
        timestamp: Date.now(),
      });

      const activated = await markAsActive(tempEntry.id);

      expect(activated).toBeTruthy();
      expect(activated?.status).toBe('active');
      expect(activated?.markedActiveAt).toBeTruthy();
    });

    it('should close active entry with outcome', async () => {
      const activeEntry = await createEntry({
        ticker: 'BTC',
        address: 'btc-address',
        setup: 'breakout',
        emotion: 'confident',
        status: 'active',
        timestamp: Date.now() - 60000,
      });

      const outcome: TradeOutcome = {
        pnl: 250.50,
        pnlPercent: 8.5,
        closedAt: Date.now(),
        winRate: 100,
        transactions: [],
      };

      const closed = await closeEntry(activeEntry.id, outcome);

      expect(closed).toBeTruthy();
      expect(closed?.status).toBe('closed');
      expect(closed?.outcome?.pnl).toBe(250.50);
      expect(closed?.outcome?.pnlPercent).toBe(8.5);
      expect(closed?.outcome?.closedAt).toBeTruthy();
    });
  });

  describe('Export Entries', () => {
    beforeEach(async () => {
      await createEntry({
        ticker: 'SOL',
        address: 'sol-address',
        setup: 'breakout',
        emotion: 'confident',
        status: 'closed',
        timestamp: Date.now() - 2000,
        thesis: 'Strong breakout',
        outcome: {
          pnl: 150,
          pnlPercent: 5.2,
          closedAt: Date.now(),
          winRate: 100,
          transactions: [],
        },
      });

      await createEntry({
        ticker: 'ETH',
        address: 'eth-address',
        setup: 'custom',
        emotion: 'custom',
        status: 'active',
        timestamp: Date.now() - 1000,
      });
    });

    it('should export to JSON format', async () => {
      const jsonExport = await exportEntries('json');
      const parsed = JSON.parse(jsonExport);

      expect(parsed).toHaveProperty('version');
      expect(parsed).toHaveProperty('exportedAt');
      expect(parsed).toHaveProperty('entries');
      expect(parsed).toHaveProperty('stats');
      expect(parsed.entries).toHaveLength(2);
    });

    it('should export to CSV format', async () => {
      const csvExport = await exportEntries('csv');

      expect(csvExport).toContain('ID,Ticker,Address');
      expect(csvExport).toContain('SOL');
      expect(csvExport).toContain('ETH');
      expect(csvExport).toContain('150'); // PnL
    });

    it('should export to Markdown format', async () => {
      const mdExport = await exportEntries('md');

      expect(mdExport).toContain('# Journal Export');
      expect(mdExport).toContain('## Stats');
      expect(mdExport).toContain('## Entries');
      expect(mdExport).toContain('SOL');
      expect(mdExport).toContain('Strong breakout');
    });

    it('should throw error for unsupported format', async () => {
      await expect(
        // @ts-expect-error - Testing invalid format
        exportEntries('xml')
      ).rejects.toThrow('Unsupported format');
    });
  });

  describe('Import & Migration', () => {
    it('imports entries and merges with existing ones without creating duplicate IDs', async () => {
      const existing = await createEntry({
        ticker: 'SOL',
        address: 'existing',
        setup: 'breakout',
        emotion: 'confident',
        status: 'active',
        timestamp: Date.now(),
        thesis: 'Existing thesis',
      });

      const payload: JournalImportPayload = {
        version: 5,
        entries: [
          { ...existing, thesis: 'Merged thesis' },
          {
            id: 'import-1',
            ticker: 'NEW',
            address: 'new-address',
            setup: 'custom',
            emotion: 'custom',
            status: 'active',
            timestamp: Date.now(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      };

      const result = await importJournalEntries(payload, 'merge');

      expect(result.imported).toBe(1);
      expect(result.updated).toBe(1);
      expect(result.skipped).toBe(0);

      const entries = await queryEntries();
      const merged = entries.find((entry) => entry.id === existing.id);
      const imported = entries.find((entry) => entry.id === 'import-1');

      expect(merged?.thesis).toBe('Merged thesis');
      expect(imported).toBeTruthy();
    });

    it('skips payload duplicates when replacing the store', async () => {
      const payload: JournalImportPayload = {
        version: 5,
        entries: [
          {
            id: 'dupe-1',
            ticker: 'DUP',
            address: 'dup-address',
            setup: 'custom',
            emotion: 'custom',
            status: 'active',
            timestamp: Date.now(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
          {
            id: 'dupe-1',
            ticker: 'DUP',
            address: 'dup-address',
            setup: 'custom',
            emotion: 'custom',
            status: 'active',
            timestamp: Date.now(),
            createdAt: Date.now(),
            updatedAt: Date.now(),
          },
        ],
      };

      const result = await importJournalEntries(payload, 'replace');

      expect(result.imported).toBe(1);
      expect(result.updated).toBe(0);
      expect(result.skipped).toBe(1);

      const entries = await queryEntries();
      expect(entries).toHaveLength(1);
    });

    it(
      'migrates legacy v4 journal entries to v5 schema on DB upgrade',
      async () => {
        await seedLegacyV4Database();

        await initDB();

        const entries = await queryEntries();
        const migrated = entries.find((entry) => entry.id === 'legacy-1');

        expect(migrated).toBeTruthy();
        expect(migrated?.setup).toBe('custom');
        expect(migrated?.emotion).toBe('custom');
        expect(migrated?.status).toBe('active');
        expect(migrated?.timestamp).toBeTruthy();
      },
      10000,
    );
  });

  describe('Edge Cases', () => {
    it('rejects creating journal with empty title', async () => {
      await expect(
        createQuickJournalEntry({
          title: '',
          notes: 'Should fail',
        }),
      ).rejects.toThrow('Journal title is required');
    });

    it('rejects creating journal with whitespace-only title', async () => {
      await expect(
        createQuickJournalEntry({
          title: '   ',
          notes: 'Should fail',
        }),
      ).rejects.toThrow('Journal title is required');
    });

    it('should handle large notes (>10KB text)', async () => {
      const largeNotes = 'A'.repeat(15000); // 15KB of text

      const created = await createEntry({
        ticker: 'LARGE',
        address: 'large-address',
        setup: 'custom',
        emotion: 'custom',
        status: 'active',
        timestamp: Date.now(),
        thesis: largeNotes,
      });

      expect(created.thesis).toHaveLength(15000);

      const retrieved = await getEntry(created.id);
      expect(retrieved?.thesis).toHaveLength(15000);
    });

    it('should handle concurrent updates correctly', async () => {
      const entry = await createEntry({
        ticker: 'CONCURRENT',
        address: 'concurrent-address',
        setup: 'custom',
        emotion: 'custom',
        status: 'temp',
        timestamp: Date.now(),
        thesis: 'Original',
      });

      // Simulate concurrent updates
      const [update1, update2] = await Promise.all([
        updateEntry(entry.id, { thesis: 'Update 1' }),
        updateEntry(entry.id, { setup: 'breakout' }),
      ]);

      // Last update wins (IndexedDB behavior)
      expect(update1?.thesis).toBeTruthy();
      expect(update2?.setup).toBe('breakout');

      const final = await getEntry(entry.id);
      expect(final?.setup).toBe('breakout');
    });

    it('should handle special characters in thesis', async () => {
      const specialChars = 'Test with "quotes", \'apostrophes\', <tags>, & ampersands';

      const created = await createEntry({
        ticker: 'SPECIAL',
        address: 'special-address',
        setup: 'custom',
        emotion: 'custom',
        status: 'active',
        timestamp: Date.now(),
        thesis: specialChars,
      });

      const retrieved = await getEntry(created.id);
      expect(retrieved?.thesis).toBe(specialChars);
    });

    it('should handle entries without optional fields', async () => {
      const minimal = await createEntry({
        ticker: 'MINIMAL',
        address: 'minimal-address',
        setup: 'custom',
        emotion: 'custom',
        status: 'temp',
        timestamp: Date.now(),
        // No thesis, outcome, etc.
      });

      expect(minimal.thesis).toBeUndefined();
      expect(minimal.outcome).toBeUndefined();
      expect(minimal.grokContext).toBeUndefined();
      expect(minimal.chartSnapshot).toBeUndefined();
    });
  });

  describe('Screenshots', () => {
    it('adds screenshot metadata to an existing entry', async () => {
      const capturedAtIso = '2025-01-02T03:04:05.000Z';

      const entry = await createEntry({
        ticker: 'SHOT',
        address: 'shot-address',
        setup: 'custom',
        emotion: 'custom',
        status: 'active',
        timestamp: Date.now(),
      });

      await addScreenshotToEntry(entry.id, 'data:image/png;base64,abc123', capturedAtIso);

      const updated = await getEntry(entry.id);
      expect(updated?.screenshot).toBe('data:image/png;base64,abc123');
      expect(updated?.screenshotCapturedAt).toBe(capturedAtIso);
    });

    it('creates a chart entry with screenshot context', async () => {
      const capturedAt = new Date('2025-01-05T00:00:00.000Z').getTime();
      vi.spyOn(Date, 'now').mockReturnValue(capturedAt);

      const created = await createJournalEntryFromChart({
        title: 'Chart save',
        note: 'Captured after breakout',
        screenshotDataURL: 'data:image/jpeg;base64,chart',
        symbol: 'eth',
        timeframe: '1h',
      });

      expect(created.ticker).toBe('ETH');
      expect(created.status).toBe('active');
      expect(created.screenshot).toBe('data:image/jpeg;base64,chart');
      expect(created.screenshotCapturedAt).toBe('2025-01-05T00:00:00.000Z');
      expect(created.customTags).toEqual(['timeframe:1h']);
      expect(created.thesis).toContain('Chart save');

      const persisted = await getEntry(created.id);
      expect(persisted?.screenshot).toBe('data:image/jpeg;base64,chart');
      expect(persisted?.screenshotCapturedAt).toBe('2025-01-05T00:00:00.000Z');
    });

    it('persists screenshot fields through Dexie v6 schema', async () => {
      const created = await createEntry({
        ticker: 'DEXIE',
        address: 'dexie-address',
        setup: 'custom',
        emotion: 'custom',
        status: 'active',
        timestamp: Date.now(),
        screenshot: 'data:image/png;base64,dexie',
        screenshotCapturedAt: '2025-02-01T10:00:00.000Z',
      });

      const fetched = await getEntry(created.id);
      expect(fetched?.screenshot).toBe('data:image/png;base64,dexie');
      expect(fetched?.screenshotCapturedAt).toBe('2025-02-01T10:00:00.000Z');
    });
  });

  describe('Performance', () => {
    it('should create entry within 100ms budget', async () => {
      const start = performance.now();

      await createEntry({
        ticker: 'PERF',
        address: 'perf-address',
        setup: 'custom',
        emotion: 'custom',
        status: 'temp',
        timestamp: Date.now(),
      });

      const duration = performance.now() - start;
      expect(duration).toBeLessThan(100);
    });

    it('should query 100 entries within 200ms', async () => {
      // Seed 100 entries
      const createPromises = Array.from({ length: 100 }, (_, i) =>
        createEntry({
          ticker: `TOKEN${i}`,
          address: `address-${i}`,
          setup: 'custom',
          emotion: 'custom',
          status: 'active',
          timestamp: Date.now() - i * 1000,
        })
      );

      await Promise.all(createPromises);

      const start = performance.now();
      const entries = await queryEntries();
      const duration = performance.now() - start;

      expect(entries).toHaveLength(100);
      expect(duration).toBeLessThan(200);
    });
  });
});
