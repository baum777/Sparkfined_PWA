import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import JournalLayout from '@/components/journal/JournalLayout';
import JournalList from '@/components/journal/JournalList';
import JournalDetailPanel from '@/components/journal/JournalDetailPanel';
import { useJournalStore } from '@/store/journalStore';

export default function JournalPageV2() {
  const entries = useJournalStore((state) => state.entries);
  const activeId = useJournalStore((state) => state.activeId);
  const setActiveId = useJournalStore((state) => state.setActiveId);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    const entryFromUrl = searchParams.get('entry');
    const hasEntryInUrl = entryFromUrl && entries.some((entry) => entry.id === entryFromUrl);

    if (hasEntryInUrl && entryFromUrl !== activeId) {
      setActiveId(entryFromUrl);
      return;
    }

    if (!activeId && entries.length) {
      const firstEntryId = entries[0]?.id;
      if (firstEntryId) {
        setActiveId(firstEntryId);
      }
    }
  }, [activeId, entries, searchParams, setActiveId]);

  useEffect(() => {
    if (!activeId) {
      return;
    }

    const currentEntry = searchParams.get('entry');
    if (currentEntry === activeId) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams);
    nextParams.set('entry', activeId);
    setSearchParams(nextParams, { replace: true });
  }, [activeId, searchParams, setSearchParams]);

  const activeEntry = React.useMemo(() => entries.find((entry) => entry.id === activeId), [entries, activeId]);

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">Daily practice</p>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold">Journal</h1>
              <p className="text-sm text-zinc-400">
                {entries.length} recent entries · Focus on clarity, context, conviction
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
                <JournalList entries={entries} activeId={activeId} onSelect={setActiveId} />
              </div>
            </div>
          }
          detail={<JournalDetailPanel entry={activeEntry} />}
        />
      </div>
    </div>
  );
}
