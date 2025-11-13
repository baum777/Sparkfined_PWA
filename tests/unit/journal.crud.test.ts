/**
 * Alpha Issue 9: Journal v2
 * Tests for journal CRUD operations
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createEntry,
  deleteEntry,
  queryEntries,
  exportEntries,
  closeEntry,
} from '@/lib/JournalService';
import { initDB } from '@/lib/db';
import type { JournalEntry } from '@/types/journal';

describe('Journal Service', () => {
  let testEntryIds: string[] = [];

  beforeEach(() => {
    testEntryIds = [];
  });

  afterEach(async () => {
    // Clean up test entries
    for (const id of testEntryIds) {
      try {
        await deleteEntry(id);
      } catch (error) {
        // Ignore errors if entry was already deleted
      }
    }
  });

  it('saves entry within 60ms budget', async () => {
    const start = performance.now();

    const entry = await createEntry({
      ticker: 'SOL',
      address: 'So11111111111111111111111111111111111111112',
      setup: 'breakout',
      emotion: 'confident',
      status: 'active',
      timestamp: Date.now(),
    });

    const duration = performance.now() - start;

    testEntryIds.push(entry.id);

    expect(duration).toBeLessThan(60);
    expect(entry.id).toBeTruthy();
    expect(entry.ticker).toBe('SOL');
    expect(entry.createdAt).toBeTruthy();
    expect(entry.updatedAt).toBeTruthy();
  });

  it('filters entries by outcome (W/L)', async () => {
    // Create test entries with different outcomes
    const winnerEntry = await createEntry({
      ticker: 'SOL',
      address: 'So11111111111111111111111111111111111111112',
      setup: 'breakout',
      emotion: 'confident',
      status: 'temp',
      timestamp: Date.now(),
    });
    testEntryIds.push(winnerEntry.id);

    // Close with positive PnL (winner)
    await closeEntry(winnerEntry.id, {
      pnl: 100,
      pnlPercent: 50,
      transactions: [
        {
          type: 'buy',
          timestamp: Date.now() - 3600000,
          price: 100,
          amount: 2,
          mcap: 1000000,
          txHash: 'test-buy-hash',
        },
        {
          type: 'sell',
          timestamp: Date.now(),
          price: 150,
          amount: 2,
          mcap: 1500000,
          txHash: 'test-sell-hash',
        },
      ],
      closedAt: Date.now(),
    });

    const loserEntry = await createEntry({
      ticker: 'BONK',
      address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
      setup: 'breakdown',
      emotion: 'fear',
      status: 'temp',
      timestamp: Date.now(),
    });
    testEntryIds.push(loserEntry.id);

    // Close with negative PnL (loser)
    await closeEntry(loserEntry.id, {
      pnl: -50,
      pnlPercent: -25,
      transactions: [
        {
          type: 'buy',
          timestamp: Date.now() - 1800000,
          price: 100,
          amount: 2,
          mcap: 1000000,
          txHash: 'test-buy-hash-2',
        },
        {
          type: 'sell',
          timestamp: Date.now(),
          price: 75,
          amount: 2,
          mcap: 750000,
          txHash: 'test-sell-hash-2',
        },
      ],
      closedAt: Date.now(),
    });

    // Test winner filter
    const winners = await queryEntries({ outcome: 'win' });
    expect(winners.some((e) => e.id === winnerEntry.id)).toBe(true);
    expect(winners.some((e) => e.id === loserEntry.id)).toBe(false);

    // Test loser filter
    const losers = await queryEntries({ outcome: 'loss' });
    expect(losers.some((e) => e.id === loserEntry.id)).toBe(true);
    expect(losers.some((e) => e.id === winnerEntry.id)).toBe(false);
  });

  it('exports to CSV with correct fields', async () => {
    // Create test entry
    const entry = await createEntry({
      ticker: 'SOL',
      address: 'So11111111111111111111111111111111111111112',
      setup: 'support',
      emotion: 'disciplined',
      status: 'temp',
      timestamp: Date.now(),
    });
    testEntryIds.push(entry.id);

    // Close entry
    await closeEntry(entry.id, {
      pnl: 75,
      pnlPercent: 37.5,
      transactions: [
        {
          type: 'buy',
          timestamp: Date.now() - 7200000,
          price: 100,
          amount: 2,
          mcap: 1000000,
          txHash: 'test-buy-hash-3',
        },
        {
          type: 'sell',
          timestamp: Date.now(),
          price: 137.5,
          amount: 2,
          mcap: 1375000,
          txHash: 'test-sell-hash-3',
        },
      ],
      closedAt: Date.now(),
    });

    // Export to CSV
    const csv = await exportEntries('csv', [entry]);

    // Verify CSV structure
    expect(csv).toContain('ID');
    expect(csv).toContain('Ticker');
    expect(csv).toContain('Address');
    expect(csv).toContain('Setup');
    expect(csv).toContain('Emotion');
    expect(csv).toContain('Status');
    expect(csv).toContain('PnL');
    expect(csv).toContain('Created At');
    expect(csv).toContain('Closed At');

    // Verify data
    expect(csv).toContain('SOL');
    expect(csv).toContain('support');
    expect(csv).toContain('disciplined');
    expect(csv).toContain('75'); // PnL
  });

  it('deletes entry successfully', async () => {
    // Create test entry
    const entry = await createEntry({
      ticker: 'TEST',
      address: 'Test1111111111111111111111111111111111111',
      setup: 'range',
      emotion: 'uncertain',
      status: 'temp',
      timestamp: Date.now(),
    });

    // Verify it exists
    const entriesBefore = await queryEntries({ status: 'all' });
    expect(entriesBefore.some((e) => e.id === entry.id)).toBe(true);

    // Delete it
    await deleteEntry(entry.id);

    // Verify it's gone
    const entriesAfter = await queryEntries({ status: 'all' });
    expect(entriesAfter.some((e) => e.id === entry.id)).toBe(false);
  });

  // Note: Grid rendering test moved to component tests
  // (UI performance tests should be in src/components/__tests__)
});
