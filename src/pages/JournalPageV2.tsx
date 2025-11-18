import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import JournalLayout from '@/components/journal/JournalLayout';
import JournalList from '@/components/journal/JournalList';
import JournalDetailPanel from '@/components/journal/JournalDetailPanel';
import { useJournalStore } from '@/store/journalStore';

type DirectionFilter = 'all' | 'long' | 'short';

export default function JournalPageV2() {
  const entries = useJournalStore((state) => state.entries);
  const activeId = useJournalStore((state) => state.activeId);
  const setActiveId = useJournalStore((state) => state.setActiveId);
  const [searchParams, setSearchParams] = useSearchParams();
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>('all');

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

  const filteredEntries = useMemo(() => {
    if (directionFilter === 'all') {
      return entries;
    }
    return entries.filter((entry) => entry.direction === directionFilter);
  }, [directionFilter, entries]);

  const directionCounts = useMemo(() => {
    return {
      all: entries.length,
      long: entries.filter((entry) => entry.direction === 'long').length,
      short: entries.filter((entry) => entry.direction === 'short').length,
    };
  }, [entries]);

  const handleSelectEntry = useCallback(
    (id: string) => {
      setActiveId(id);
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set('entry', id);
      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setActiveId, setSearchParams],
  );

  const activeEntry = useMemo(() => entries.find((entry) => entry.id === activeId), [entries, activeId]);

  const directionFilters: Array<{ label: string; value: DirectionFilter }> = useMemo(
    () => [
      { label: `All (${directionCounts.all})`, value: 'all' },
      { label: directionCounts.long ? `Long · ${directionCounts.long}` : 'Long', value: 'long' },
      { label: directionCounts.short ? `Short · ${directionCounts.short}` : 'Short', value: 'short' },
    ],
    [directionCounts.all, directionCounts.long, directionCounts.short],
  );

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
              <div className="flex h-full flex-col space-y-3">
                <p className="text-xs uppercase tracking-wider text-zinc-500">Entries</p>
                <div className="flex h-full flex-col rounded-2xl border border-white/5 bg-black/20 backdrop-blur">
                  <div className="flex items-center gap-2 border-b border-white/5 px-3 py-2">
                    {directionFilters.map((filter) => {
                      const isActive = directionFilter === filter.value;
                      return (
                        <button
                          key={filter.value}
                          type="button"
                          onClick={() => setDirectionFilter(filter.value)}
                          className={`rounded-full border px-3 py-1 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 ${
                            isActive
                              ? 'border-white/30 bg-white/10 text-white'
                              : 'border-white/10 text-white/60 hover:bg-white/5'
                          }`}
                        >
                          {filter.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="flex-1 overflow-y-auto p-2">
                    <JournalList entries={filteredEntries} activeId={activeId} onSelect={handleSelectEntry} />
                  </div>
                </div>
              </div>
            }
            detail={<JournalDetailPanel entry={activeEntry} />}
          />
        </div>
      </div>
    );
}
