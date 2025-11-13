/**
 * Tests for ReplayService
 *
 * Tests:
 * - CRUD operations (create, update, get, delete sessions)
 * - Bookmarks (add, remove)
 * - OHLC data caching
 * - Pattern library (success patterns)
 * - Scrubber math helpers
 * - Analytics
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  createSession,
  updateSession,
  getSession,
  getAllSessions,
  deleteSession,
  getSessionsByJournalEntry,
  addBookmark,
  removeBookmark,
  cacheOhlcData,
  getCachedOhlc,
  getSuccessPatterns,
  calculateScrubJump,
  interpolateGhostCursor,
  calculateZoom,
  getReplayStats,
} from '../ReplayService';
import { createEntry, closeEntry } from '../JournalService';
import type { OhlcPoint } from '@/types/journal';

describe('ReplayService', () => {
  let testSessionIds: string[] = [];
  let testEntryIds: string[] = [];

  beforeEach(() => {
    testSessionIds = [];
    testEntryIds = [];
  });

  afterEach(async () => {
    // Clean up test sessions
    for (const id of testSessionIds) {
      try {
        await deleteSession(id);
      } catch (error) {
        // Ignore errors
      }
    }

    // Clean up test journal entries
    const { deleteEntry } = await import('../JournalService');
    for (const id of testEntryIds) {
      try {
        await deleteEntry(id);
      } catch (error) {
        // Ignore errors
      }
    }
  });

  describe('CRUD Operations', () => {
    it('creates a replay session with auto-generated fields', async () => {
      const session = await createSession({
        name: 'Test Replay',
      });

      testSessionIds.push(session.id);

      expect(session.id).toBeTruthy();
      expect(session.name).toBe('Test Replay');
      expect(session.createdAt).toBeTruthy();
      expect(session.createdAt).toBeLessThanOrEqual(Date.now());
    });

    it('creates a session linked to journal entry', async () => {
      const journalEntry = await createEntry({
        ticker: 'SOL',
        address: 'So11111111111111111111111111111111111111112',
        setup: 'breakout',
        emotion: 'confident',
        status: 'active',
        timestamp: Date.now(),
      });
      testEntryIds.push(journalEntry.id);

      const session = await createSession({
        name: 'SOL Breakout Replay',
        journalEntryId: journalEntry.id,
      });
      testSessionIds.push(session.id);

      expect(session.journalEntryId).toBe(journalEntry.id);
    });

    it('retrieves a session by ID', async () => {
      const created = await createSession({
        name: 'Find Me',
      });
      testSessionIds.push(created.id);

      const retrieved = await getSession(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
      expect(retrieved?.name).toBe('Find Me');
    });

    it('returns undefined for non-existent session', async () => {
      const session = await getSession('non-existent-id');
      expect(session).toBeUndefined();
    });

    it('updates an existing session', async () => {
      const session = await createSession({
        name: 'Original Name',
      });
      testSessionIds.push(session.id);

      const updated = await updateSession(session.id, {
        name: 'Updated Name',
      });

      expect(updated).toBeDefined();
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.id).toBe(session.id);
      expect(updated?.createdAt).toBe(session.createdAt);
    });

    it('returns undefined when updating non-existent session', async () => {
      const result = await updateSession('non-existent', { name: 'Test' });
      expect(result).toBeUndefined();
    });

    it('deletes a session successfully', async () => {
      const session = await createSession({ name: 'Delete Me' });

      // Verify it exists
      const beforeDelete = await getSession(session.id);
      expect(beforeDelete).toBeDefined();

      // Delete it
      await deleteSession(session.id);

      // Verify it's gone
      const afterDelete = await getSession(session.id);
      expect(afterDelete).toBeUndefined();
    });

    it('retrieves all sessions sorted by createdAt desc', async () => {
      const session1 = await createSession({ name: 'First' });
      testSessionIds.push(session1.id);

      // Wait 10ms to ensure different timestamps
      await new Promise((resolve) => setTimeout(resolve, 10));

      const session2 = await createSession({ name: 'Second' });
      testSessionIds.push(session2.id);

      const allSessions = await getAllSessions();

      // Find our test sessions
      const testSessions = allSessions.filter((s) => testSessionIds.includes(s.id));

      expect(testSessions.length).toBe(2);
      // Most recent should be first
      expect(testSessions[0].name).toBe('Second');
      expect(testSessions[1].name).toBe('First');
    });

    it('retrieves sessions by journal entry ID', async () => {
      const journalEntry = await createEntry({
        ticker: 'SOL',
        address: 'So11111111111111111111111111111111111111112',
        setup: 'breakout',
        emotion: 'confident',
        status: 'active',
        timestamp: Date.now(),
      });
      testEntryIds.push(journalEntry.id);

      const session1 = await createSession({
        name: 'Replay 1',
        journalEntryId: journalEntry.id,
      });
      testSessionIds.push(session1.id);

      const session2 = await createSession({
        name: 'Replay 2',
        journalEntryId: journalEntry.id,
      });
      testSessionIds.push(session2.id);

      const linkedSessions = await getSessionsByJournalEntry(journalEntry.id);

      expect(linkedSessions.length).toBe(2);
      expect(linkedSessions.map((s) => s.id)).toContain(session1.id);
      expect(linkedSessions.map((s) => s.id)).toContain(session2.id);
    });
  });

  describe('Bookmarks', () => {
    it('adds a bookmark to a session', async () => {
      const session = await createSession({ name: 'Test' });
      testSessionIds.push(session.id);

      const updated = await addBookmark(session.id, {
        frame: 42,
        timestamp: Date.now(),
        note: 'Important moment',
      });

      expect(updated).toBeDefined();
      expect(updated?.bookmarks).toHaveLength(1);
      expect(updated?.bookmarks?.[0].frame).toBe(42);
      expect(updated?.bookmarks?.[0].note).toBe('Important moment');
      expect(updated?.bookmarks?.[0].id).toBeTruthy();
    });

    it('adds multiple bookmarks to a session', async () => {
      const session = await createSession({ name: 'Test' });
      testSessionIds.push(session.id);

      await addBookmark(session.id, {
        frame: 10,
        timestamp: Date.now(),
        note: 'First',
      });

      await addBookmark(session.id, {
        frame: 20,
        timestamp: Date.now(),
        note: 'Second',
      });

      const updated = await getSession(session.id);

      expect(updated?.bookmarks).toHaveLength(2);
      expect(updated?.bookmarks?.[0].note).toBe('First');
      expect(updated?.bookmarks?.[1].note).toBe('Second');
    });

    it('removes a bookmark from a session', async () => {
      const session = await createSession({ name: 'Test' });
      testSessionIds.push(session.id);

      const withBookmark = await addBookmark(session.id, {
        frame: 42,
        timestamp: Date.now(),
        note: 'Remove me',
      });

      const bookmarkId = withBookmark?.bookmarks?.[0]?.id;
      expect(bookmarkId).toBeTruthy();

      const updated = await removeBookmark(session.id, bookmarkId!);

      expect(updated?.bookmarks).toHaveLength(0);
    });

    it('returns undefined when adding bookmark to non-existent session', async () => {
      const result = await addBookmark('non-existent', {
        frame: 0,
        timestamp: Date.now(),
      });

      expect(result).toBeUndefined();
    });

    it('returns undefined when removing bookmark from non-existent session', async () => {
      const result = await removeBookmark('non-existent', 'bookmark-id');
      expect(result).toBeUndefined();
    });
  });

  describe('OHLC Caching', () => {
    it('caches OHLC data for a session', async () => {
      const session = await createSession({ name: 'Test' });
      testSessionIds.push(session.id);

      const ohlcData: OhlcPoint[] = [
        { t: 1000, o: 100, h: 110, l: 95, c: 105, v: 1000 },
        { t: 2000, o: 105, h: 115, l: 100, c: 110, v: 1200 },
        { t: 3000, o: 110, h: 120, l: 105, c: 115, v: 1500 },
      ];

      const updated = await cacheOhlcData(session.id, ohlcData);

      expect(updated?.ohlcCache).toEqual(ohlcData);
      expect(updated?.ohlcCache).toHaveLength(3);
    });

    it('retrieves cached OHLC data', async () => {
      const session = await createSession({ name: 'Test' });
      testSessionIds.push(session.id);

      const ohlcData: OhlcPoint[] = [
        { t: 1000, o: 100, h: 110, l: 95, c: 105 },
      ];

      await cacheOhlcData(session.id, ohlcData);

      const cached = await getCachedOhlc(session.id);

      expect(cached).toEqual(ohlcData);
    });

    it('returns undefined for session without cached OHLC', async () => {
      const session = await createSession({ name: 'Test' });
      testSessionIds.push(session.id);

      const cached = await getCachedOhlc(session.id);

      expect(cached).toBeUndefined();
    });

    it('returns undefined for non-existent session', async () => {
      const cached = await getCachedOhlc('non-existent');
      expect(cached).toBeUndefined();
    });
  });

  describe('Pattern Library', () => {
    it('retrieves success patterns with positive PnL', async () => {
      // Create winning journal entry
      const winnerEntry = await createEntry({
        ticker: 'SOL',
        address: 'So11111111111111111111111111111111111111112',
        setup: 'breakout',
        emotion: 'confident',
        status: 'temp',
        timestamp: Date.now(),
      });
      testEntryIds.push(winnerEntry.id);

      await closeEntry(winnerEntry.id, {
        pnl: 100,
        pnlPercent: 50,
        transactions: [],
        closedAt: Date.now(),
      });

      // Create replay session linked to winner
      const session = await createSession({
        name: 'Winner Replay',
        journalEntryId: winnerEntry.id,
      });
      testSessionIds.push(session.id);

      // Get success patterns
      const patterns = await getSuccessPatterns(10);

      const ourPattern = patterns.find((p) => p.session.id === session.id);

      expect(ourPattern).toBeDefined();
      expect(ourPattern?.pnl).toBe(100);
      expect(ourPattern?.pnlPercent).toBe(50);
      expect(ourPattern?.journalEntry?.id).toBe(winnerEntry.id);
    });

    it('filters patterns by minimum PnL percentage', async () => {
      // Create entry with 5% gain
      const smallWinEntry = await createEntry({
        ticker: 'BONK',
        address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        setup: 'support',
        emotion: 'disciplined',
        status: 'temp',
        timestamp: Date.now(),
      });
      testEntryIds.push(smallWinEntry.id);

      await closeEntry(smallWinEntry.id, {
        pnl: 5,
        pnlPercent: 5,
        transactions: [],
        closedAt: Date.now(),
      });

      const session = await createSession({
        name: 'Small Win',
        journalEntryId: smallWinEntry.id,
      });
      testSessionIds.push(session.id);

      // Request patterns with 10% minimum
      const patterns = await getSuccessPatterns(10);

      // Should not include 5% gain
      const ourPattern = patterns.find((p) => p.session.id === session.id);
      expect(ourPattern).toBeUndefined();

      // Request patterns with 5% minimum
      const patternsLowMin = await getSuccessPatterns(5);
      const ourPatternLowMin = patternsLowMin.find((p) => p.session.id === session.id);
      expect(ourPatternLowMin).toBeDefined();
    });

    it('excludes sessions without journal entries', async () => {
      const session = await createSession({
        name: 'No Journal Link',
      });
      testSessionIds.push(session.id);

      const patterns = await getSuccessPatterns();

      expect(patterns.find((p) => p.session.id === session.id)).toBeUndefined();
    });

    it('sorts patterns by PnL percentage descending', async () => {
      // Create multiple winning entries
      const entry1 = await createEntry({
        ticker: 'SOL',
        address: 'So11111111111111111111111111111111111111112',
        setup: 'breakout',
        emotion: 'confident',
        status: 'temp',
        timestamp: Date.now(),
      });
      testEntryIds.push(entry1.id);

      await closeEntry(entry1.id, {
        pnl: 50,
        pnlPercent: 25,
        transactions: [],
        closedAt: Date.now(),
      });

      const entry2 = await createEntry({
        ticker: 'BONK',
        address: 'DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263',
        setup: 'momentum',
        emotion: 'excited',
        status: 'temp',
        timestamp: Date.now(),
      });
      testEntryIds.push(entry2.id);

      await closeEntry(entry2.id, {
        pnl: 100,
        pnlPercent: 50,
        transactions: [],
        closedAt: Date.now(),
      });

      const session1 = await createSession({
        name: 'Session 1',
        journalEntryId: entry1.id,
      });
      testSessionIds.push(session1.id);

      const session2 = await createSession({
        name: 'Session 2',
        journalEntryId: entry2.id,
      });
      testSessionIds.push(session2.id);

      const patterns = await getSuccessPatterns();

      const ourPatterns = patterns.filter((p) =>
        [session1.id, session2.id].includes(p.session.id)
      );

      expect(ourPatterns).toHaveLength(2);
      // Higher PnL% should be first
      expect(ourPatterns[0].pnlPercent).toBeGreaterThan(ourPatterns[1].pnlPercent);
    });
  });

  describe('Scrubber Math Helpers', () => {
    describe('calculateScrubJump', () => {
      it('jumps forward 5 seconds for right arrow', () => {
        expect(calculateScrubJump(10, 'right')).toBe(15);
      });

      it('jumps backward 5 seconds for left arrow', () => {
        expect(calculateScrubJump(10, 'left')).toBe(5);
      });

      it('jumps forward 20 seconds for shift-right', () => {
        expect(calculateScrubJump(10, 'shift-right')).toBe(30);
      });

      it('jumps backward 20 seconds for shift-left', () => {
        expect(calculateScrubJump(30, 'shift-left')).toBe(10);
      });

      it('clamps to 0 when going negative', () => {
        expect(calculateScrubJump(3, 'left')).toBe(0);
        expect(calculateScrubJump(10, 'shift-left')).toBe(0);
      });
    });

    describe('interpolateGhostCursor', () => {
      it('returns null for empty keyframes', () => {
        expect(interpolateGhostCursor(10, [])).toBeNull();
      });

      it('returns first keyframe if time is before first', () => {
        const keyframes = [
          { time: 10, x: 100, y: 200 },
          { time: 20, x: 200, y: 300 },
        ];

        const result = interpolateGhostCursor(5, keyframes);

        expect(result).toEqual({ x: 100, y: 200 });
      });

      it('returns last keyframe if time is after last', () => {
        const keyframes = [
          { time: 10, x: 100, y: 200 },
          { time: 20, x: 200, y: 300 },
        ];

        const result = interpolateGhostCursor(30, keyframes);

        expect(result).toEqual({ x: 200, y: 300 });
      });

      it('interpolates between keyframes', () => {
        const keyframes = [
          { time: 10, x: 100, y: 200 },
          { time: 20, x: 200, y: 400 },
        ];

        // Exactly halfway
        const result = interpolateGhostCursor(15, keyframes);

        expect(result).toEqual({ x: 150, y: 300 });
      });

      it('handles exact keyframe times', () => {
        const keyframes = [
          { time: 10, x: 100, y: 200 },
          { time: 20, x: 200, y: 300 },
        ];

        const result = interpolateGhostCursor(10, keyframes);

        expect(result).toEqual({ x: 100, y: 200 });
      });
    });

    describe('calculateZoom', () => {
      it('increases zoom with positive delta', () => {
        expect(calculateZoom(1.0, 100)).toBeGreaterThan(1.0);
      });

      it('decreases zoom with negative delta', () => {
        expect(calculateZoom(1.0, -100)).toBeLessThan(1.0);
      });

      it('clamps zoom to minimum 0.5', () => {
        expect(calculateZoom(0.5, -1000)).toBe(0.5);
      });

      it('clamps zoom to maximum 3.0', () => {
        expect(calculateZoom(3.0, 1000)).toBe(3.0);
      });

      it('returns value within bounds', () => {
        const result = calculateZoom(1.0, 500);
        expect(result).toBeGreaterThanOrEqual(0.5);
        expect(result).toBeLessThanOrEqual(3.0);
      });
    });
  });

  describe('Analytics', () => {
    it('calculates replay stats', async () => {
      const session1 = await createSession({ name: 'Session 1' });
      testSessionIds.push(session1.id);

      await addBookmark(session1.id, {
        frame: 10,
        timestamp: Date.now(),
      });

      await addBookmark(session1.id, {
        frame: 20,
        timestamp: Date.now(),
      });

      const journalEntry = await createEntry({
        ticker: 'SOL',
        address: 'So11111111111111111111111111111111111111112',
        setup: 'breakout',
        emotion: 'confident',
        status: 'active',
        timestamp: Date.now(),
      });
      testEntryIds.push(journalEntry.id);

      const session2 = await createSession({
        name: 'Session 2',
        journalEntryId: journalEntry.id,
      });
      testSessionIds.push(session2.id);

      const stats = await getReplayStats();

      expect(stats.totalSessions).toBeGreaterThanOrEqual(2);
      expect(stats.totalBookmarks).toBeGreaterThanOrEqual(2);
      expect(stats.linkedToJournal).toBeGreaterThanOrEqual(1);
    });
  });
});
