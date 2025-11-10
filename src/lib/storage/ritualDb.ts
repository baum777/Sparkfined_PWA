/**
 * Ritual Database (IndexedDB via Dexie)
 * Persistent storage for daily rituals, pre-trade checklists, and journal entries
 *
 * Migration from localStorage → IndexedDB for better performance and structure
 */

import Dexie, { Table } from 'dexie';
import type {
  DailyRitual,
  PreTradeChecklist,
  TradeJournalEntry,
} from '../../components/rituals/types';

/**
 * Ritual Database Schema
 */
export class RitualDatabase extends Dexie {
  // Tables
  rituals!: Table<DailyRitual, string>; // Primary key: date (YYYY-MM-DD)
  checklists!: Table<PreTradeChecklist, string>; // Primary key: id
  journals!: Table<TradeJournalEntry, string>; // Primary key: id

  constructor() {
    super('sparkfined-rituals');

    // Schema version 1
    this.version(1).stores({
      // Daily rituals indexed by date
      rituals: 'date, completed, createdAt, synced',

      // Pre-trade checklists indexed by id and creation time
      checklists: 'id, symbol, createdAt, synced',

      // Journal entries indexed by id, symbol, and creation time
      journals: 'id, symbol, createdAt, synced, outcome.pnl',
    });
  }
}

// Singleton instance
export const ritualDb = new RitualDatabase();

/**
 * Typed API for Ritual Database Operations
 */

// ===== Daily Rituals =====

export async function dbGetTodaysRitual(): Promise<DailyRitual | undefined> {
  const today = new Date().toISOString().split('T')[0]!;
  return await ritualDb.rituals.get(today);
}

export async function dbSaveRitual(ritual: DailyRitual): Promise<string> {
  await ritualDb.rituals.put(ritual);
  return ritual.date;
}

export async function dbGetRitualHistory(days: number = 30): Promise<DailyRitual[]> {
  return await ritualDb.rituals
    .orderBy('date')
    .reverse()
    .limit(days)
    .toArray();
}

export async function dbGetRitualsByDateRange(
  startDate: string,
  endDate: string
): Promise<DailyRitual[]> {
  return await ritualDb.rituals
    .where('date')
    .between(startDate, endDate, true, true)
    .toArray();
}

// ===== Pre-Trade Checklists =====

export async function dbSaveChecklist(checklist: PreTradeChecklist): Promise<string> {
  await ritualDb.checklists.put(checklist);
  return checklist.id;
}

export async function dbGetChecklist(id: string): Promise<PreTradeChecklist | undefined> {
  return await ritualDb.checklists.get(id);
}

export async function dbGetRecentChecklists(limit: number = 10): Promise<PreTradeChecklist[]> {
  return await ritualDb.checklists
    .orderBy('createdAt')
    .reverse()
    .limit(limit)
    .toArray();
}

export async function dbGetChecklistsBySymbol(symbol: string): Promise<PreTradeChecklist[]> {
  return await ritualDb.checklists.where('symbol').equals(symbol).toArray();
}

// ===== Trade Journal Entries =====

export async function dbSaveJournal(entry: TradeJournalEntry): Promise<string> {
  await ritualDb.journals.put(entry);
  return entry.id;
}

export async function dbGetJournal(id: string): Promise<TradeJournalEntry | undefined> {
  return await ritualDb.journals.get(id);
}

export async function dbGetRecentJournals(limit?: number): Promise<TradeJournalEntry[]> {
  const query = ritualDb.journals.orderBy('createdAt').reverse();
  return limit ? await query.limit(limit).toArray() : await query.toArray();
}

export async function dbUpdateJournal(
  id: string,
  updates: Partial<TradeJournalEntry>
): Promise<number> {
  return await ritualDb.journals.update(id, updates);
}

export async function dbGetJournalsBySymbol(symbol: string): Promise<TradeJournalEntry[]> {
  return await ritualDb.journals.where('symbol').equals(symbol).toArray();
}

export async function dbGetJournalsByDateRange(
  startDate: string,
  endDate: string
): Promise<TradeJournalEntry[]> {
  return await ritualDb.journals
    .where('createdAt')
    .between(startDate, endDate, true, true)
    .toArray();
}

// ===== Analytics & Stats =====

export async function dbGetRitualStats(): Promise<{
  totalDays: number;
  completedDays: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
}> {
  const allRituals = await ritualDb.rituals.toArray();

  const totalDays = allRituals.length;
  const completedDays = allRituals.filter(r => r.completed).length;

  // Calculate current streak
  const today = await dbGetTodaysRitual();
  let currentStreak = 0;

  if (today?.completed) {
    const sorted = allRituals.sort((a, b) => b.date.localeCompare(a.date));
    for (const ritual of sorted) {
      if (!ritual.completed) break;
      currentStreak++;
    }
  }

  // Calculate longest streak
  let longestStreak = 0;
  let tempStreak = 0;

  const sortedByDate = allRituals.sort((a, b) => a.date.localeCompare(b.date));

  for (const ritual of sortedByDate) {
    if (ritual.completed) {
      tempStreak++;
      longestStreak = Math.max(longestStreak, tempStreak);
    } else {
      tempStreak = 0;
    }
  }

  return {
    totalDays,
    completedDays,
    currentStreak,
    longestStreak,
    completionRate: totalDays > 0 ? completedDays / totalDays : 0,
  };
}

export async function dbGetUnsyncedCount(): Promise<{
  rituals: number;
  checklists: number;
  journals: number;
}> {
  const [rituals, checklists, journals] = await Promise.all([
    ritualDb.rituals.where('synced').equals(0).count(),
    ritualDb.checklists.where('synced').equals(0).count(),
    ritualDb.journals.where('synced').equals(0).count(),
  ]);

  return { rituals, checklists, journals };
}

// ===== Bulk Operations =====

export async function dbBulkSaveRituals(rituals: DailyRitual[]): Promise<string[]> {
  await ritualDb.rituals.bulkPut(rituals);
  return rituals.map(r => r.date);
}

export async function dbBulkSaveChecklists(checklists: PreTradeChecklist[]): Promise<string[]> {
  await ritualDb.checklists.bulkPut(checklists);
  return checklists.map(c => c.id);
}

export async function dbBulkSaveJournals(journals: TradeJournalEntry[]): Promise<string[]> {
  await ritualDb.journals.bulkPut(journals);
  return journals.map(j => j.id);
}

// ===== Sync Management =====

export async function dbMarkAsSynced(
  type: 'ritual' | 'checklist' | 'journal',
  id: string
): Promise<number> {
  switch (type) {
    case 'ritual':
      return await ritualDb.rituals.update(id, { synced: true });
    case 'checklist':
      return await ritualDb.checklists.update(id, { synced: true });
    case 'journal':
      return await ritualDb.journals.update(id, { synced: true });
  }
}

export async function dbGetUnsyncedItems(): Promise<{
  rituals: DailyRitual[];
  checklists: PreTradeChecklist[];
  journals: TradeJournalEntry[];
}> {
  const [rituals, checklists, journals] = await Promise.all([
    ritualDb.rituals.where('synced').equals(0).toArray(),
    ritualDb.checklists.where('synced').equals(0).toArray(),
    ritualDb.journals.where('synced').equals(0).toArray(),
  ]);

  return { rituals, checklists, journals };
}

// ===== Clear Data (Dev/Testing) =====

export async function dbClearAllRitualData(): Promise<void> {
  if (import.meta.env.DEV) {
    await Promise.all([
      ritualDb.rituals.clear(),
      ritualDb.checklists.clear(),
      ritualDb.journals.clear(),
    ]);
    console.log('[RitualDB] All data cleared');
  }
}

// ===== Export for Backup =====

export async function dbExportAllData(): Promise<{
  rituals: DailyRitual[];
  checklists: PreTradeChecklist[];
  journals: TradeJournalEntry[];
  exportedAt: string;
}> {
  const [rituals, checklists, journals] = await Promise.all([
    ritualDb.rituals.toArray(),
    ritualDb.checklists.toArray(),
    ritualDb.journals.toArray(),
  ]);

  return {
    rituals,
    checklists,
    journals,
    exportedAt: new Date().toISOString(),
  };
}
