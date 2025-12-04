import { beforeEach, describe, expect, it } from 'vitest';
import {
  getLastOracleReport,
  getOracleReportByDate,
  getOracleReportsSince,
  markOracleReportAsNotified,
  markOracleReportAsRead,
  oracleDB,
  upsertOracleReport,
} from '@/lib/db-oracle';
import type { OracleReport } from '@/types/oracle';

function buildReport(overrides?: Partial<OracleReport>): Omit<OracleReport, 'id'> {
  return {
    date: overrides?.date ?? '2025-12-04',
    score: overrides?.score ?? 4,
    topTheme: overrides?.topTheme ?? 'Gaming',
    fullReport: overrides?.fullReport ?? 'sample oracle payload',
    read: overrides?.read ?? false,
    notified: overrides?.notified ?? false,
    timestamp: overrides?.timestamp ?? Date.now(),
  };
}

describe('oracle Dexie helpers', () => {
  beforeEach(async () => {
    await oracleDB.reports.clear();
  });

  it('upserts reports by date', async () => {
    const base = buildReport({ date: '2025-12-01', score: 3 });
    const id = await upsertOracleReport(base);
    expect(typeof id).toBe('number');

    await upsertOracleReport({ ...base, score: 6 });
    const stored = await getOracleReportByDate(base.date);
    expect(stored?.score).toBe(6);
  });

  it('queries by date and chronological ranges', async () => {
    await upsertOracleReport(buildReport({ date: '2025-11-30', score: 2 }));
    await upsertOracleReport(buildReport({ date: '2025-12-01', score: 3 }));
    await upsertOracleReport(buildReport({ date: '2025-12-02', score: 4 }));

    const decFirst = await getOracleReportByDate('2025-12-01');
    expect(decFirst?.score).toBe(3);

    const recent = await getOracleReportsSince('2025-12-01');
    expect(recent.map((r) => r.date)).toEqual(['2025-12-01', '2025-12-02']);

    const latest = await getLastOracleReport();
    expect(latest?.date).toBe('2025-12-02');
  });

  it('marks reports as read and notified', async () => {
    await upsertOracleReport(buildReport({ date: '2025-12-03', read: false, notified: false }));

    await markOracleReportAsRead('2025-12-03');
    let stored = await getOracleReportByDate('2025-12-03');
    expect(stored?.read).toBe(true);

    await markOracleReportAsNotified('2025-12-03');
    stored = await getOracleReportByDate('2025-12-03');
    expect(stored?.notified).toBe(true);
  });
});
