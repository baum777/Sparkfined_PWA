/**
 * Local Ritual Store (MVP - localStorage)
 * Privacy-first offline storage for rituals and journal entries
 *
 * Migration path: localStorage → IndexedDB → Encrypted sync
 */

import { getJSON, setJSON } from '../safeStorage';
import { sha256Base64 } from '../hash';
import type {
  DailyRitual,
  PreTradeChecklist,
  TradeJournalEntry,
  MoodState,
} from '../../components/rituals/types';

const STORAGE_KEYS = {
  RITUALS: 'sparkfined:rituals',
  PRETRADE: 'sparkfined:pretrade',
  JOURNAL: 'sparkfined:journal',
} as const;

// ===== Daily Rituals =====

export function getTodaysRitual(): DailyRitual | null {
  const today = new Date().toISOString().split('T')[0]!;
  const rituals = getJSON<Record<string, DailyRitual>>(STORAGE_KEYS.RITUALS, {});
  return rituals[today] || null;
}

export async function saveDailyRitual(
  goal: string,
  mood: MoodState,
  completed: boolean = false
): Promise<DailyRitual> {
  const today = new Date().toISOString().split('T')[0]!;
  const goalHash = await sha256Base64(goal);

  const rituals = getJSON<Record<string, DailyRitual>>(STORAGE_KEYS.RITUALS, {});
  const existing = rituals[today];

  const ritual: DailyRitual = {
    date: today,
    goalHash,
    goal,
    mood,
    completed,
    streak: calculateStreak(rituals, today, completed),
    createdAt: existing?.createdAt || new Date().toISOString(),
    synced: false,
  };

  rituals[today] = ritual;
  setJSON(STORAGE_KEYS.RITUALS, rituals);

  return ritual;
}

export function markRitualComplete(date: string): DailyRitual | null {
  const rituals = getJSON<Record<string, DailyRitual>>(STORAGE_KEYS.RITUALS, {});
  const ritual = rituals[date];

  if (!ritual) return null;

  ritual.completed = true;
  ritual.streak = calculateStreak(rituals, date, true);
  rituals[date] = ritual;

  setJSON(STORAGE_KEYS.RITUALS, rituals);
  return ritual;
}

function calculateStreak(
  rituals: Record<string, DailyRitual>,
  currentDate: string,
  isCompleted: boolean
): number {
  if (!isCompleted) return 0;

  let streak = 1;
  let date = new Date(currentDate);

  // Count backwards to find consecutive completed days
  for (let i = 1; i < 365; i++) {
    date.setDate(date.getDate() - 1);
    const dateStr = date.toISOString().split('T')[0]!;
    const ritual = rituals[dateStr];

    if (!ritual || !ritual.completed) break;
    streak++;
  }

  return streak;
}

export function getRitualHistory(days: number = 30): DailyRitual[] {
  const rituals = getJSON<Record<string, DailyRitual>>(STORAGE_KEYS.RITUALS, {});
  return Object.values(rituals)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, days);
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

  const checklists = getJSON<Record<string, PreTradeChecklist>>(STORAGE_KEYS.PRETRADE, {});
  checklists[id] = checklist;
  setJSON(STORAGE_KEYS.PRETRADE, checklists);

  return checklist;
}

export function getPreTradeChecklist(id: string): PreTradeChecklist | null {
  const checklists = getJSON<Record<string, PreTradeChecklist>>(STORAGE_KEYS.PRETRADE, {});
  return checklists[id] || null;
}

export function getRecentPreTradeChecklists(limit: number = 10): PreTradeChecklist[] {
  const checklists = getJSON<Record<string, PreTradeChecklist>>(STORAGE_KEYS.PRETRADE, {});
  return Object.values(checklists)
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, limit);
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

  const journal = getJSON<Record<string, TradeJournalEntry>>(STORAGE_KEYS.JOURNAL, {});
  journal[id] = journalEntry;
  setJSON(STORAGE_KEYS.JOURNAL, journal);

  return journalEntry;
}

export function getJournalEntry(id: string): TradeJournalEntry | null {
  const journal = getJSON<Record<string, TradeJournalEntry>>(STORAGE_KEYS.JOURNAL, {});
  return journal[id] || null;
}

export function getJournalEntries(limit?: number): TradeJournalEntry[] {
  const journal = getJSON<Record<string, TradeJournalEntry>>(STORAGE_KEYS.JOURNAL, {});
  const entries = Object.values(journal).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  return limit ? entries.slice(0, limit) : entries;
}

export function updateJournalEntry(
  id: string,
  updates: Partial<TradeJournalEntry>
): TradeJournalEntry | null {
  const journal = getJSON<Record<string, TradeJournalEntry>>(STORAGE_KEYS.JOURNAL, {});
  const entry = journal[id];

  if (!entry) return null;

  const updated = { ...entry, ...updates, synced: false };
  journal[id] = updated;
  setJSON(STORAGE_KEYS.JOURNAL, journal);

  return updated;
}

// ===== Analytics (Privacy-Preserving) =====

export function getRitualStats(): {
  totalDays: number;
  completedDays: number;
  currentStreak: number;
  longestStreak: number;
  completionRate: number;
} {
  const rituals = getJSON<Record<string, DailyRitual>>(STORAGE_KEYS.RITUALS, {});
  const entries = Object.values(rituals);

  const totalDays = entries.length;
  const completedDays = entries.filter(r => r.completed).length;
  const currentStreak = getTodaysRitual()?.streak || 0;

  let longestStreak = 0;
  let tempStreak = 0;

  const sorted = entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  for (const ritual of sorted) {
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

// ===== Sync Status (Stub for future backend) =====

export function getUnsyncedCount(): {
  rituals: number;
  pretrade: number;
  journal: number;
} {
  const rituals = getJSON<Record<string, DailyRitual>>(STORAGE_KEYS.RITUALS, {});
  const pretrade = getJSON<Record<string, PreTradeChecklist>>(STORAGE_KEYS.PRETRADE, {});
  const journal = getJSON<Record<string, TradeJournalEntry>>(STORAGE_KEYS.JOURNAL, {});

  return {
    rituals: Object.values(rituals).filter(r => !r.synced).length,
    pretrade: Object.values(pretrade).filter(p => !p.synced).length,
    journal: Object.values(journal).filter(j => !j.synced).length,
  };
}

// ===== Clear Data (for testing) =====

export function clearAllRitualData(): void {
  if (import.meta.env.DEV) {
    localStorage.removeItem(STORAGE_KEYS.RITUALS);
    localStorage.removeItem(STORAGE_KEYS.PRETRADE);
    localStorage.removeItem(STORAGE_KEYS.JOURNAL);
    console.log('[RitualStore] All data cleared');
  }
}
