/**
 * Oracle Database Layer (Dexie)
 * 
 * IndexedDB tables for Oracle-specific data:
 * 1. Reports — Daily oracle reports with score, theme, and full report text
 * 
 * Uses Dexie for type-safe queries and better DX.
 * Separate database from `sparkfined-ta-pwa` and `sparkfined-board` for clean isolation.
 */

import Dexie, { type Table } from 'dexie';
import type { OracleReport, OracleTheme } from '@/types/oracle';
import { coerceOracleTheme, coerceOracleScore } from '@/types/oracle';

// ===== Dexie Database =====

export class OracleDatabase extends Dexie {
  reports!: Table<OracleReport, number>;

  constructor() {
    super('sparkfined-oracle');

    this.version(1).stores({
      reports: '++id, date, score, topTheme, read, notified, timestamp',
    });
  }
}

// Singleton instance
export const oracleDB = new OracleDatabase();

// ===== Oracle Report Operations =====

/**
 * Upsert an Oracle report (update if exists for date, otherwise insert)
 */
export async function upsertOracleReport(
  report: Omit<OracleReport, 'id'>
): Promise<number> {
  const existing = await oracleDB.reports
    .where('date')
    .equals(report.date)
    .first();

  const now = Date.now();
  
  // Validate and coerce values
  const sanitizedReport = {
    ...report,
    score: coerceOracleScore(report.score),
    topTheme: coerceOracleTheme(report.topTheme as string),
    createdAt: report.createdAt || now,
  };

  if (existing) {
    // Update existing report
    await oracleDB.reports.update(existing.id!, {
      score: sanitizedReport.score,
      topTheme: sanitizedReport.topTheme,
      fullReport: sanitizedReport.fullReport,
      timestamp: sanitizedReport.timestamp,
      // Don't reset read/notified flags on update
    });
    return existing.id!;
  }

  // Insert new report
  return await oracleDB.reports.add(sanitizedReport);
}

/**
 * Get an Oracle report by date (YYYY-MM-DD)
 */
export async function getOracleReportByDate(
  date: string
): Promise<OracleReport | undefined> {
  return await oracleDB.reports
    .where('date')
    .equals(date)
    .first();
}

/**
 * Get today's Oracle report
 */
export async function getTodayReport(): Promise<OracleReport | undefined> {
  const today = new Date().toISOString().split('T')[0];
  return await getOracleReportByDate(today);
}

/**
 * Get the most recent Oracle report (by timestamp)
 */
export async function getLastOracleReport(): Promise<OracleReport | undefined> {
  return await oracleDB.reports
    .orderBy('timestamp')
    .reverse()
    .first();
}

/**
 * Get Oracle reports since a specific date (inclusive)
 */
export async function getOracleReportsSince(
  date: string
): Promise<OracleReport[]> {
  return await oracleDB.reports
    .where('date')
    .aboveOrEqual(date)
    .toArray();
}

/**
 * Get last N days of Oracle reports
 */
export async function getLast30DaysReports(): Promise<OracleReport[]> {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return await oracleDB.reports
    .where('timestamp')
    .aboveOrEqual(thirtyDaysAgo)
    .reverse()
    .sortBy('timestamp');
}

/**
 * Mark an Oracle report as read (triggers XP grant)
 */
export async function markOracleReportAsRead(date: string): Promise<void> {
  const report = await oracleDB.reports.where('date').equals(date).first();
  if (report && !report.read) {
    await oracleDB.reports.update(report.id!, { read: true });
  }
}

/**
 * Mark an Oracle report as notified (prevents duplicate notifications)
 */
export async function markOracleReportAsNotified(date: string): Promise<void> {
  const report = await oracleDB.reports.where('date').equals(date).first();
  if (report && !report.notified) {
    await oracleDB.reports.update(report.id!, { notified: true });
  }
}

/**
 * Get all Oracle reports (for analytics/export)
 */
export async function getAllOracleReports(): Promise<OracleReport[]> {
  return await oracleDB.reports
    .orderBy('timestamp')
    .reverse()
    .toArray();
}

/**
 * Get Oracle reports filtered by theme
 */
export async function getOracleReportsByTheme(
  theme: OracleTheme
): Promise<OracleReport[]> {
  return await oracleDB.reports
    .where('topTheme')
    .equals(theme)
    .reverse()
    .sortBy('timestamp');
}

/**
 * Get Oracle reports filtered by score range
 */
export async function getOracleReportsByScoreRange(
  minScore: number,
  maxScore: number
): Promise<OracleReport[]> {
  return await oracleDB.reports
    .where('score')
    .between(minScore, maxScore, true, true)
    .reverse()
    .sortBy('timestamp');
}

/**
 * Delete an Oracle report by date
 */
export async function deleteOracleReport(date: string): Promise<void> {
  const report = await oracleDB.reports.where('date').equals(date).first();
  if (report?.id) {
    await oracleDB.reports.delete(report.id);
  }
}

/**
 * Clear all Oracle reports (use with caution)
 */
export async function clearAllOracleReports(): Promise<void> {
  await oracleDB.reports.clear();
}

/**
 * Export Oracle reports as JSON
 */
export async function exportOracleReportsJSON(): Promise<string> {
  const reports = await getAllOracleReports();
  return JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      version: 1,
      count: reports.length,
      reports,
    },
    null,
    2
  );
}

/**
 * Get unread Oracle reports
 */
export async function getUnreadOracleReports(): Promise<OracleReport[]> {
  return await oracleDB.reports
    .where('read')
    .equals(0) // Dexie treats boolean as 0/1
    .reverse()
    .sortBy('timestamp');
}

/**
 * Get Oracle reports that haven't been notified
 */
export async function getUnnotifiedOracleReports(): Promise<OracleReport[]> {
  return await oracleDB.reports
    .where('notified')
    .equals(0) // Dexie treats boolean as 0/1
    .reverse()
    .sortBy('timestamp');
}

// Re-export types for convenience
export type { OracleReport, OracleTheme };
