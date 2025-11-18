import React from 'react';
import JournalLayout from '@/components/journal/JournalLayout';
import JournalList, { JournalListEntry } from '@/components/journal/JournalList';
import JournalDetailPanel from '@/components/journal/JournalDetailPanel';

const MOCK_ENTRIES: JournalListEntry[] = [
  {
    id: '1',
    title: 'BTC breakout retest',
    date: 'Mar 14 · 09:45 UTC',
    direction: 'long',
    pnl: '+3.4%',
  },
  {
    id: '2',
    title: 'SOL range scalp',
    date: 'Mar 13 · 22:10 UTC',
    direction: 'short',
    pnl: '-1.2%',
  },
  {
    id: '3',
    title: 'ETH swing planning',
    date: 'Mar 11 · 18:05 UTC',
    direction: 'long',
  },
  {
    id: '4',
    title: 'Bond volatility hedge',
    date: 'Mar 09 · 11:20 UTC',
    direction: 'short',
    pnl: '+0.8%',
  },
];

const NOTES: Record<string, string> = {
  '1': 'Scaled into reclaim after sweeping liquidity. Next time size down on second add; journaling the emotional trigger helped.',
  '2': 'Chased weakness into a level that was already tested. Need to respect time-of-day and broader context more aggressively.',
  '3': 'Built thesis around ETH merge narrative; waiting for funding reset before adding again.',
};

export default function JournalPageV2() {
  const [activeId, setActiveId] = React.useState<string | undefined>(MOCK_ENTRIES[0]?.id);
  const activeEntry = React.useMemo(
    () => MOCK_ENTRIES.find((entry) => entry.id === activeId),
    [activeId]
  );
  const entryWithNotes = activeEntry
    ? { ...activeEntry, notes: NOTES[activeEntry.id] }
    : undefined;

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">Daily practice</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Journal</h1>
              <p className="text-sm text-zinc-400">
                {MOCK_ENTRIES.length} recent entries · Focus on clarity, context, conviction
              </p>
            </div>
            <div className="text-right text-sm text-zinc-400">
              <p>Next review in 2 days</p>
              <p className="text-xs uppercase tracking-wide">Daily ritual: 06:30 UTC</p>
            </div>
          </div>
        </header>

        <JournalLayout
          list={
            <div className="space-y-4">
              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-500 mb-3">Entries</p>
                <JournalList entries={MOCK_ENTRIES} activeId={activeId} onSelect={setActiveId} />
              </div>
            </div>
          }
          detail={<JournalDetailPanel entry={entryWithNotes} />}
        />
      </div>
    </div>
  );
}
