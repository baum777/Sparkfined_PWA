/**
 * Oracle Database Tests
 * 
 * Unit tests for Dexie operations on Oracle reports.
 * 
 * Note: These tests require IndexedDB and are skipped in Node.js environments.
 * They should be run in a browser environment (e.g., via Playwright).
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  upsertOracleReport,
  getOracleReportByDate,
  getTodayReport,
  getLastOracleReport,
  getLast30DaysReports,
  markOracleReportAsRead,
  markOracleReportAsNotified,
  getAllOracleReports,
  clearAllOracleReports,
} from '../../src/lib/db-oracle';
import type { OracleReport } from '../../src/types/oracle';

// Check if IndexedDB is available (browser environment)
const hasIndexedDB = typeof indexedDB !== 'undefined';

describe('Oracle Database', () => {
  beforeEach(async () => {
    if (!hasIndexedDB) return;
    // Clear database before each test
    try {
      await clearAllOracleReports();
    } catch {
      // Ignore errors if DB not available
    }
  });

  afterEach(async () => {
    if (!hasIndexedDB) return;
    // Clean up after each test
    try {
      await clearAllOracleReports();
    } catch {
      // Ignore errors if DB not available
    }
  });

  describe('upsertOracleReport', () => {
    it.skipIf(!hasIndexedDB)('inserts a new report', async () => {
      const report: Omit<OracleReport, 'id'> = {
        date: '2025-12-04',
        score: 5,
        topTheme: 'Gaming',
        fullReport: 'Test report content',
        read: false,
        notified: false,
        timestamp: Date.now(),
        createdAt: Date.now(),
      };

      const id = await upsertOracleReport(report);
      expect(id).toBeGreaterThan(0);

      const saved = await getOracleReportByDate('2025-12-04');
      expect(saved).toBeDefined();
      expect(saved?.score).toBe(5);
      expect(saved?.topTheme).toBe('Gaming');
    });

    it.skipIf(!hasIndexedDB)('updates an existing report by date', async () => {
      const report: Omit<OracleReport, 'id'> = {
        date: '2025-12-04',
        score: 5,
        topTheme: 'Gaming',
        fullReport: 'Original report',
        read: false,
        notified: false,
        timestamp: Date.now(),
        createdAt: Date.now(),
      };

      await upsertOracleReport(report);

      // Update with new score
      const updated = {
        ...report,
        score: 6,
        fullReport: 'Updated report',
      };

      await upsertOracleReport(updated);

      const saved = await getOracleReportByDate('2025-12-04');
      expect(saved?.score).toBe(6);
      expect(saved?.fullReport).toBe('Updated report');
    });

    it.skipIf(!hasIndexedDB)('coerces score to valid range', async () => {
      const report: Omit<OracleReport, 'id'> = {
        date: '2025-12-04',
        score: 10, // Out of range
        topTheme: 'Gaming',
        fullReport: 'Test',
        read: false,
        notified: false,
        timestamp: Date.now(),
        createdAt: Date.now(),
      };

      await upsertOracleReport(report);
      const saved = await getOracleReportByDate('2025-12-04');
      expect(saved?.score).toBe(7); // Clamped to max
    });
  });

  describe('getOracleReportByDate', () => {
    it.skipIf(!hasIndexedDB)('returns report for given date', async () => {
      const report: Omit<OracleReport, 'id'> = {
        date: '2025-12-04',
        score: 5,
        topTheme: 'Gaming',
        fullReport: 'Test',
        read: false,
        notified: false,
        timestamp: Date.now(),
        createdAt: Date.now(),
      };

      await upsertOracleReport(report);
      const found = await getOracleReportByDate('2025-12-04');
      
      expect(found).toBeDefined();
      expect(found?.date).toBe('2025-12-04');
    });

    it.skipIf(!hasIndexedDB)('returns undefined for non-existent date', async () => {
      const found = await getOracleReportByDate('2999-01-01');
      expect(found).toBeUndefined();
    });
  });

  describe('getTodayReport', () => {
    it.skipIf(!hasIndexedDB)('returns today\'s report if it exists', async () => {
      const today = new Date().toISOString().split('T')[0];
      if (!today) throw new Error('Invalid date');
      
      const report: Omit<OracleReport, 'id'> = {
        date: today,
        score: 5,
        topTheme: 'Gaming',
        fullReport: 'Today\'s report',
        read: false,
        notified: false,
        timestamp: Date.now(),
        createdAt: Date.now(),
      };

      await upsertOracleReport(report);
      const found = await getTodayReport();
      
      expect(found).toBeDefined();
      expect(found?.date).toBe(today);
    });

    it.skipIf(!hasIndexedDB)('returns undefined if no report for today', async () => {
      const found = await getTodayReport();
      expect(found).toBeUndefined();
    });
  });

  describe('getLastOracleReport', () => {
    it.skipIf(!hasIndexedDB)('returns most recent report by timestamp', async () => {
      const now = Date.now();
      
      await upsertOracleReport({
        date: '2025-12-01',
        score: 4,
        topTheme: 'RWA',
        fullReport: 'Old',
        read: false,
        notified: false,
        timestamp: now - 3 * 24 * 60 * 60 * 1000,
        createdAt: now,
      });

      await upsertOracleReport({
        date: '2025-12-04',
        score: 6,
        topTheme: 'Gaming',
        fullReport: 'Recent',
        read: false,
        notified: false,
        timestamp: now,
        createdAt: now,
      });

      const last = await getLastOracleReport();
      expect(last?.date).toBe('2025-12-04');
    });
  });

  describe('getLast30DaysReports', () => {
    it.skipIf(!hasIndexedDB)('returns reports from last 30 days', async () => {
      const now = Date.now();
      const thirtyOneDaysAgo = now - 31 * 24 * 60 * 60 * 1000;
      const twentyDaysAgo = now - 20 * 24 * 60 * 60 * 1000;

      // Old report (should be excluded)
      await upsertOracleReport({
        date: '2025-11-01',
        score: 3,
        topTheme: 'RWA',
        fullReport: 'Old',
        read: false,
        notified: false,
        timestamp: thirtyOneDaysAgo,
        createdAt: now,
      });

      // Recent report (should be included)
      await upsertOracleReport({
        date: '2025-11-15',
        score: 5,
        topTheme: 'Gaming',
        fullReport: 'Recent',
        read: false,
        notified: false,
        timestamp: twentyDaysAgo,
        createdAt: now,
      });

      const reports = await getLast30DaysReports();
      expect(reports).toHaveLength(1);
      expect(reports[0]?.date).toBe('2025-11-15');
    });
  });

  describe('markOracleReportAsRead', () => {
    it.skipIf(!hasIndexedDB)('marks report as read', async () => {
      const report: Omit<OracleReport, 'id'> = {
        date: '2025-12-04',
        score: 5,
        topTheme: 'Gaming',
        fullReport: 'Test',
        read: false,
        notified: false,
        timestamp: Date.now(),
        createdAt: Date.now(),
      };

      await upsertOracleReport(report);
      await markOracleReportAsRead('2025-12-04');
      
      const updated = await getOracleReportByDate('2025-12-04');
      expect(updated?.read).toBe(true);
    });

    it.skipIf(!hasIndexedDB)('does nothing if report already read', async () => {
      const report: Omit<OracleReport, 'id'> = {
        date: '2025-12-04',
        score: 5,
        topTheme: 'Gaming',
        fullReport: 'Test',
        read: true,
        notified: false,
        timestamp: Date.now(),
        createdAt: Date.now(),
      };

      await upsertOracleReport(report);
      await markOracleReportAsRead('2025-12-04');
      
      const updated = await getOracleReportByDate('2025-12-04');
      expect(updated?.read).toBe(true);
    });
  });

  describe('markOracleReportAsNotified', () => {
    it.skipIf(!hasIndexedDB)('marks report as notified', async () => {
      const report: Omit<OracleReport, 'id'> = {
        date: '2025-12-04',
        score: 6,
        topTheme: 'Gaming',
        fullReport: 'Test',
        read: false,
        notified: false,
        timestamp: Date.now(),
        createdAt: Date.now(),
      };

      await upsertOracleReport(report);
      await markOracleReportAsNotified('2025-12-04');
      
      const updated = await getOracleReportByDate('2025-12-04');
      expect(updated?.notified).toBe(true);
    });
  });

  describe('getAllOracleReports', () => {
    it.skipIf(!hasIndexedDB)('returns all reports sorted by timestamp', async () => {
      const now = Date.now();

      await upsertOracleReport({
        date: '2025-12-01',
        score: 4,
        topTheme: 'RWA',
        fullReport: 'First',
        read: false,
        notified: false,
        timestamp: now - 3 * 24 * 60 * 60 * 1000,
        createdAt: now,
      });

      await upsertOracleReport({
        date: '2025-12-04',
        score: 6,
        topTheme: 'Gaming',
        fullReport: 'Second',
        read: false,
        notified: false,
        timestamp: now,
        createdAt: now,
      });

      const all = await getAllOracleReports();
      expect(all).toHaveLength(2);
      expect(all[0]?.date).toBe('2025-12-04'); // Most recent first
      expect(all[1]?.date).toBe('2025-12-01');
    });
  });
});
