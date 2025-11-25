import { create } from 'zustand';
import { createEntry, queryEntries, updateEntryNotes } from '@/lib/JournalService';
import type { JournalEntry as PersistedJournalEntry } from '@/types/journal';
import type { SolanaMemeTrendEvent, TrendSentimentLabel } from '@/types/events';
import type { ChartCreationContext } from '@/domain/chart';

export type JournalDirection = 'long' | 'short';

export interface JournalEntry {
  id: string;
  title: string;
  date: string;
  direction: JournalDirection;
  pnl?: string;
  notes?: string;
  isAuto?: boolean;
  sourceUrl?: string;
  tags?: string[];
  sentimentLabel?: TrendSentimentLabel;
}

interface JournalState {
  entries: JournalEntry[];
  activeId?: string;
  isLoading: boolean;
  error: string | null;
  lastDraftFromChart?: ChartCreationContext;
  setEntries: (entries: JournalEntry[]) => void;
  setActiveId: (id?: string) => void;
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  addEntry: (entry: JournalEntry) => void;
  updateEntry: (entry: JournalEntry) => void;
  createDraftFromChart: (context: ChartCreationContext) => Promise<JournalEntry>;
  autoTagFromTrendEvent: (event: SolanaMemeTrendEvent) => Promise<void>;
}

const INITIAL_ENTRIES: JournalEntry[] = [
  {
    id: '1',
    title: 'BTC breakout retest',
    date: 'Mar 14 · 09:45 UTC',
    direction: 'long',
    pnl: '+3.4%',
    notes:
      'Scaled into reclaim after sweeping liquidity. Next time size down on second add; journaling the emotional trigger helped.',
  },
  {
    id: '2',
    title: 'SOL range scalp',
    date: 'Mar 13 · 22:10 UTC',
    direction: 'short',
    pnl: '-1.2%',
    notes:
      'Chased weakness into a level that was already tested. Need to respect time-of-day and broader context more aggressively.',
  },
  {
    id: '3',
    title: 'ETH swing planning',
    date: 'Mar 11 · 18:05 UTC',
    direction: 'long',
    notes: 'Built thesis around ETH merge narrative; waiting for funding reset before adding again.',
  },
  {
    id: '4',
    title: 'Bond volatility hedge',
    date: 'Mar 09 · 11:20 UTC',
    direction: 'short',
    pnl: '+0.8%',
  },
];

export const useJournalStore = create<JournalState>((set) => ({
  entries: [],
  activeId: undefined,
  isLoading: false,
  error: null,
  lastDraftFromChart: undefined,
  setEntries: (entries) => set(() => ({ entries })),
  setActiveId: (id) => set({ activeId: id }),
  setLoading: (value) => set({ isLoading: value }),
  setError: (message) => set({ error: message }),
  addEntry: (entry) =>
    set((state) => ({
      entries: [entry, ...state.entries],
    })),
  updateEntry: (nextEntry) =>
    set((state) => ({
      entries: state.entries.map((entry) => (entry.id === nextEntry.id ? nextEntry : entry)),
      })),
  createDraftFromChart: async (context) => {
    const title = `${context.symbol} · ${context.timeframe} journal`
    const notes = `Created from chart at ${new Date(context.time).toUTCString()} @ ${context.price}`
    const draft = await createQuickJournalEntry({ title, notes })
    set((state) => ({
      entries: [draft, ...state.entries],
      lastDraftFromChart: context,
    }))
    return draft
  },
    autoTagFromTrendEvent: async (event) => {
      try {
        const entry = await buildAutoJournalEntry(event);
        set((state) => ({
          entries: [entry, ...state.entries],
        }));
      } catch (error) {
        console.warn('[journalStore] failed to auto-tag from trend event', error);
      }
    },
}));

const monthFormatter = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  timeZone: 'UTC',
});

function formatEntryDate(timestamp?: number): string {
  if (!timestamp) {
    return '';
  }
  const date = new Date(timestamp);
  const month = monthFormatter.format(date);
  const day = date.getUTCDate();
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${month} ${day} · ${hours}:${minutes} UTC`;
}

function formatPnl(pnlPercent?: number, pnlAbsolute?: number): string | undefined {
  if (typeof pnlPercent === 'number') {
    const sign = pnlPercent > 0 ? '+' : '';
    return `${sign}${pnlPercent.toFixed(1)}%`;
  }
  if (typeof pnlAbsolute === 'number') {
    const sign = pnlAbsolute > 0 ? '+' : pnlAbsolute < 0 ? '-' : '';
    const formattedValue = Math.abs(pnlAbsolute).toLocaleString('en-US', {
      maximumFractionDigits: 2,
      minimumFractionDigits: Math.abs(pnlAbsolute) < 100 ? 2 : 0,
    });
    return `${sign}$${formattedValue}`;
  }
  return undefined;
}

function inferDirection(entry: PersistedJournalEntry): JournalDirection {
  const firstTransaction = entry.outcome?.transactions?.[0];
  if (firstTransaction) {
    return firstTransaction.type === 'sell' ? 'short' : 'long';
  }

  const thesis = entry.thesis?.toLowerCase() ?? '';
  if (thesis.includes('short')) {
    return 'short';
  }
  if (thesis.includes('long')) {
    return 'long';
  }

  if (entry.setup === 'breakdown') {
    return 'short';
  }

  return 'long';
}

function mapPersistedToJournalEntry(entry: PersistedJournalEntry): JournalEntry {
  const titleFromThesis = entry.thesis?.split('\n')[0]?.trim();
  const setupLabel = entry.setup ? entry.setup.charAt(0).toUpperCase() + entry.setup.slice(1) : '';
  const fallbackTitle = entry.ticker ? `${entry.ticker}${setupLabel ? ` · ${setupLabel}` : ''}` : 'Journal entry';

  return {
    id: entry.id,
    title: titleFromThesis && titleFromThesis.length > 0 ? titleFromThesis : fallbackTitle,
    date: formatEntryDate(entry.timestamp ?? entry.createdAt ?? entry.updatedAt),
    direction: inferDirection(entry),
    pnl: formatPnl(entry.outcome?.pnlPercent, entry.outcome?.pnl),
    notes: entry.thesis || (entry.customTags?.length ? entry.customTags.join(', ') : undefined),
    isAuto: false,
  };
}

/**
 * Load journal entries from IndexedDB (read-only).
 * If no entries exist yet, return the current in-memory defaults as a seed.
 */
export async function loadJournalEntries(): Promise<JournalEntry[]> {
  const persistedEntries = await queryEntries({
    status: 'all',
    sortBy: 'timestamp',
    sortOrder: 'desc',
  });

  if (!persistedEntries.length) {
    // Seed path: return a clone of the dummy data once when persistence is empty.
    return INITIAL_ENTRIES.map((entry) => ({ ...entry }));
  }

  return persistedEntries.map(mapPersistedToJournalEntry);
}

type QuickEntryInput = {
  title: string;
  notes: string;
};

function buildQuickEntryTicker(title: string): string {
  const fallback = 'MANUAL';
  if (!title.trim()) {
    return fallback;
  }
  const sanitized = title.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  return sanitized.length ? sanitized.slice(0, 12) : fallback;
}

/**
 * Create a minimal journal entry via Dexie and map it to the V2 UI shape.
 */
export async function createQuickJournalEntry(input: QuickEntryInput): Promise<JournalEntry> {
  const now = Date.now();
  const title = input.title.trim();
  const notes = input.notes.trim();
  const thesisSections = [title, notes].filter(Boolean);
  const thesis = thesisSections.join('\n\n') || undefined;

  const persisted = await createEntry({
    ticker: buildQuickEntryTicker(title),
    address: 'manual-entry',
    setup: 'custom',
    emotion: 'custom',
    status: 'active',
    timestamp: now,
    thesis,
  });

  return mapPersistedToJournalEntry(persisted);
}

async function buildAutoJournalEntry(event: SolanaMemeTrendEvent): Promise<JournalEntry> {
  const title = `[Auto] ${event.token.symbol} trend`;
  const notesSections = [
    event.sparkfined.narrative,
    event.sparkfined.journalContextTags?.length
      ? `Context: ${event.sparkfined.journalContextTags.join(', ')}`
      : undefined,
    event.sentiment?.label ? `Sentiment: ${event.sentiment.label}` : undefined,
  ].filter(Boolean);

  const notes = notesSections.join('\n\n') || event.tweet.fullText.slice(0, 240);

  const quickEntry = await createQuickJournalEntry({
    title,
    notes,
  });

  return {
    ...quickEntry,
    isAuto: true,
    sourceUrl: event.source.tweetUrl,
    tags: event.sparkfined.journalContextTags,
    sentimentLabel: event.sentiment?.label,
  };
}

/**
 * Update notes for an existing journal entry (persisted + store shape).
 */
export async function updateJournalEntryNotes(id: string, notes: string): Promise<JournalEntry> {
  const persisted = await updateEntryNotes(id, notes);
  return mapPersistedToJournalEntry(persisted);
}
