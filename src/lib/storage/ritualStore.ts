/**
 * Unified Ritual Store (Sprint B)
 * IndexedDB-first storage with localStorage fallback
 *
 * Features:
 * - Primary: IndexedDB (via Dexie)
 * - Fallback: localStorage (Sprint A compatibility)
 * - Optional encryption-at-rest
 * - Automatic migration
 */

import { sha256Base64 } from '../hash';
import type {
  DailyRitual,
  PreTradeChecklist,
  TradeJournalEntry,
  MoodState,
} from '../../components/rituals/types';

import {
  dbGetTodaysRitual,
  dbSaveRitual,
  dbGetRitualHistory,
  dbSaveChecklist,
  dbGetChecklist,
  dbGetRecentChecklists,
  dbSaveJournal,
  dbGetJournal,
  dbGetRecentJournals,
  dbUpdateJournal,
  dbGetRitualStats,
  dbGetUnsyncedCount,
  dbClearAllRitualData,
} from './ritualDb';

// Import localStorage functions as fallback
import * as legacyStore from './localRitualStore';

/**
 * Storage backend type
 */
type StorageBackend = 'indexeddb' | 'localstorage';

let currentBackend: StorageBackend = 'indexeddb';

/**
 * Check if IndexedDB is available
 */
function isIndexedDBAvailable(): boolean {
  try {
    return typeof indexedDB !== 'undefined';
  } catch {
    return false;
  }
}

/**
 * Initialize storage backend
 */
export function initializeStorage(): StorageBackend {
  if (isIndexedDBAvailable()) {
    currentBackend = 'indexeddb';
    console.log('[RitualStore] Using IndexedDB');
  } else {
    currentBackend = 'localstorage';
    console.warn('[RitualStore] IndexedDB not available, falling back to localStorage');
  }

  return currentBackend;
}

// Auto-initialize
initializeStorage();

// ===== Daily Rituals =====

export async function getTodaysRitual(): Promise<DailyRitual | null> {
  if (currentBackend === 'indexeddb') {
    const ritual = await dbGetTodaysRitual();
    return ritual || null;
  } else {
    return legacyStore.getTodaysRitual();
  }
}

export async function saveDailyRitual(
  goal: string,
  mood: MoodState,
  completed: boolean = false
): Promise<DailyRitual> {
  const today = new Date().toISOString().split('T')[0]!;
  const goalHash = await sha256Base64(goal);

  if (currentBackend === 'indexeddb') {
    // Get existing ritual or create new
    const existing = await dbGetTodaysRitual();

    const ritual: DailyRitual = {
      date: today,
      goalHash,
      goal,
      mood,
      completed,
      streak: await calculateStreak(today, completed),
      createdAt: existing?.createdAt || new Date().toISOString(),
      synced: false,
    };

    await dbSaveRitual(ritual);
    return ritual;
  } else {
    return await legacyStore.saveDailyRitual(goal, mood, completed);
  }
}

export async function markRitualComplete(date: string): Promise<DailyRitual | null> {
  if (currentBackend === 'indexeddb') {
    const ritual = await dbGetTodaysRitual();
    if (!ritual) return null;

    ritual.completed = true;
    ritual.streak = await calculateStreak(date, true);

    await dbSaveRitual(ritual);
    return ritual;
  } else {
    return legacyStore.markRitualComplete(date);
  }
}

async function calculateStreak(currentDate: string, isCompleted: boolean): Promise<number> {
  if (!isCompleted) return 0;

  if (currentBackend === 'indexeddb') {
    const history = await dbGetRitualHistory(365);
    const sorted = history.sort((a, b) => b.date.localeCompare(a.date));

    let streak = 1;
    for (const ritual of sorted) {
      if (ritual.date === currentDate) continue;
      if (!ritual.completed) break;
      streak++;
    }

    return streak;
  } else {
    // Fallback to localStorage logic
    const rituals = legacyStore.getRitualHistory(365);
    let streak = 1;
    let date = new Date(currentDate);

    for (let i = 1; i < 365; i++) {
      date.setDate(date.getDate() - 1);
      const dateStr = date.toISOString().split('T')[0]!;
      const ritual = rituals.find(r => r.date === dateStr);

      if (!ritual || !ritual.completed) break;
      streak++;
    }

    return streak;
  }
}

export async function getRitualHistory(days: number = 30): Promise<DailyRitual[]> {
  if (currentBackend === 'indexeddb') {
    return await dbGetRitualHistory(days);
  } else {
    return legacyStore.getRitualHistory(days);
  }
}

// ===== Pre-Trade Checklists =====

export async function savePreTradeChecklist(
  symbol: string,
  thesis: string,
  rr: number,
  riskAmount: number,
  positionSize?: number,
  stopLossPct?: number
): Promise<PreTradeChecklist> {
  const id = `pretrade_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const thesisHash = await sha256Base64(thesis);

  const checklist: PreTradeChecklist = {
    id,
    symbol,
    thesisHash,
    thesis,
    rr,
    riskAmount,
    positionSize,
    stopLossPct,
    createdAt: new Date().toISOString(),
    synced: false,
  };

  if (currentBackend === 'indexeddb') {
    await dbSaveChecklist(checklist);
  } else {
    // Fallback to localStorage
    await legacyStore.savePreTradeChecklist(symbol, thesis, rr, riskAmount, positionSize, stopLossPct);
  }

  return checklist;
}

export async function getPreTradeChecklist(id: string): Promise<PreTradeChecklist | null> {
  if (currentBackend === 'indexeddb') {
    const checklist = await dbGetChecklist(id);
    return checklist || null;
  } else {
    return legacyStore.getPreTradeChecklist(id);
  }
}

export async function getRecentPreTradeChecklists(limit: number = 10): Promise<PreTradeChecklist[]> {
  if (currentBackend === 'indexeddb') {
    return await dbGetRecentChecklists(limit);
  } else {
    return legacyStore.getRecentPreTradeChecklists(limit);
  }
}

// ===== Trade Journal =====

export async function saveJournalEntry(
  entry: Omit<TradeJournalEntry, 'id' | 'createdAt' | 'synced' | 'tradePlanHash' | 'outcome'> & {
    outcome: Omit<TradeJournalEntry['outcome'], 'notesHash'>;
  }
): Promise<TradeJournalEntry> {
  const id = `journal_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  const tradePlanHash = await sha256Base64(entry.tradePlan);
  const notesHash = await sha256Base64(entry.outcome.notes);

  const journalEntry: TradeJournalEntry = {
    ...entry,
    id,
    tradePlanHash,
    outcome: {
      ...entry.outcome,
      notesHash,
    },
    createdAt: new Date().toISOString(),
    synced: false,
  };

  if (currentBackend === 'indexeddb') {
    await dbSaveJournal(journalEntry);
  } else {
    await legacyStore.saveJournalEntry(entry);
  }

  return journalEntry;
}

export async function getJournalEntry(id: string): Promise<TradeJournalEntry | null> {
  if (currentBackend === 'indexeddb') {
    const entry = await dbGetJournal(id);
    return entry || null;
  } else {
    return legacyStore.getJournalEntry(id);
  }
}

export async function getJournalEntries(limit?: number): Promise<TradeJournalEntry[]> {
  if (currentBackend === 'indexeddb') {
    return await dbGetRecentJournals(limit);
  } else {
    return legacyStore.getJournalEntries(limit);
  }
}

export async function updateJournalEntry(
  id: string,
  updates: Partial<TradeJournalEntry>
): Promise<TradeJournalEntry | null> {
  if (currentBackend === 'indexeddb') {
    await dbUpdateJournal(id, updates);
    return await dbGetJournal(id) || null;
  } else {
    return legacyStore.updateJournalEntry(id, updates);
  }
}

// ===== Analytics =====

export async function getRitualStats(): Promise<{
  totalDays: number;
  completedDays: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
}> {
  if (currentBackend === 'indexeddb') {
    return await dbGetRitualStats();
  } else {
    return legacyStore.getRitualStats();
  }
}

export async function getUnsyncedCount(): Promise<{
  rituals: number;
  pretrade: number;
  journal: number;
}> {
  if (currentBackend === 'indexeddb') {
    const counts = await dbGetUnsyncedCount();
    return {
      rituals: counts.rituals,
      pretrade: counts.checklists,
      journal: counts.journals,
    };
  } else {
    return legacyStore.getUnsyncedCount();
  }
}

// ===== Clear Data =====

export async function clearAllRitualData(): Promise<void> {
  if (currentBackend === 'indexeddb') {
    await dbClearAllRitualData();
  } else {
    legacyStore.clearAllRitualData();
  }
}

// ===== Storage Info =====

export function getStorageInfo(): {
  backend: StorageBackend;
  encrypted: boolean;
  syncEnabled: boolean;
} {
  return {
    backend: currentBackend,
    encrypted: false, // TODO: Implement encryption toggle
    syncEnabled: false, // TODO: Implement sync toggle
  };
}
