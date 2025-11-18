import { create } from 'zustand';

export type JournalDirection = 'long' | 'short';

export interface JournalEntry {
  id: string;
  title: string;
  date: string;
  direction: JournalDirection;
  pnl?: string;
  notes?: string;
}

interface JournalState {
  entries: JournalEntry[];
  activeId?: string;
  setEntries: (entries: JournalEntry[]) => void;
  setActiveId: (id: string) => void;
}

const INITIAL_ENTRIES: JournalEntry[] = [
  {
    id: '1',
    title: 'BTC breakout retest',
    date: 'Mar 14 · 09:45 UTC',
    direction: 'long',
    pnl: '+3.4%',
    notes: 'Scaled into reclaim after sweeping liquidity. Next time size down on second add; journaling the emotional trigger helped.',
  },
  {
    id: '2',
    title: 'SOL range scalp',
    date: 'Mar 13 · 22:10 UTC',
    direction: 'short',
    pnl: '-1.2%',
    notes: 'Chased weakness into a level that was already tested. Need to respect time-of-day and broader context more aggressively.',
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
  entries: INITIAL_ENTRIES,
  activeId: INITIAL_ENTRIES[0]?.id,
  setEntries: (entries) => set(() => ({ entries })),
  setActiveId: (id) => set({ activeId: id }),
}));
