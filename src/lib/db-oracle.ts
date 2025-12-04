import Dexie, { type Table } from 'dexie';
import type { OracleReport } from '@/types/oracle';

const DATABASE_NAME = 'sparkfined-oracle';

export class OracleDatabase extends Dexie {
  public reports!: Table<OracleReport, number>;

  constructor() {
    super(DATABASE_NAME);

    this.version(1).stores({
      reports: '++id, date, score, topTheme, read, notified, timestamp',
    });
  }
}

export const oracleDB = new OracleDatabase();

export async function upsertOracleReport(
  report: Omit<OracleReport, 'id'>
): Promise<number> {
  const existing = await oracleDB.reports.where('date').equals(report.date).first();

  if (existing?.id != null) {
    await oracleDB.reports.update(existing.id, {
      ...report,
      read: existing.read,
      notified: existing.notified,
    });
    return existing.id;
  }

  return oracleDB.reports.add(report);
}

export async function getOracleReportByDate(
  date: string
): Promise<OracleReport | undefined> {
  return oracleDB.reports.where('date').equals(date).first();
}

export async function getLastOracleReport(): Promise<OracleReport | undefined> {
  return oracleDB.reports.orderBy('date').reverse().first();
}

export async function getOracleReportsSince(
  date: string
): Promise<OracleReport[]> {
  return oracleDB.reports.where('date').aboveOrEqual(date).sortBy('date');
}

export async function markOracleReportAsRead(date: string): Promise<void> {
  const report = await oracleDB.reports.where('date').equals(date).first();
  if (report?.id != null && !report.read) {
    await oracleDB.reports.update(report.id, { read: true });
  }
}

export async function markOracleReportAsNotified(date: string): Promise<void> {
  const report = await oracleDB.reports.where('date').equals(date).first();
  if (report?.id != null && !report.notified) {
    await oracleDB.reports.update(report.id, { notified: true });
  }
}
