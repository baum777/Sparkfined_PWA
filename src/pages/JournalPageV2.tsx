import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import JournalLayout from '@/components/journal/JournalLayout';
import JournalList from '@/components/journal/JournalList';
import JournalDetailPanel from '@/components/journal/JournalDetailPanel';
import JournalNewEntryDialog from '@/components/journal/JournalNewEntryDialog';
import { createQuickJournalEntry, loadJournalEntries, useJournalStore } from '@/store/journalStore';

type DirectionFilter = 'all' | 'long' | 'short';

export default function JournalPageV2() {
  const { entries, isLoading, error, activeId, setEntries, setActiveId, setLoading, setError, addEntry } =
    useJournalStore((state) => ({
      entries: state.entries,
      isLoading: state.isLoading,
      error: state.error,
      activeId: state.activeId,
      setEntries: state.setEntries,
      setActiveId: state.setActiveId,
      setLoading: state.setLoading,
      setError: state.setError,
      addEntry: state.addEntry,
    }));
  const [searchParams, setSearchParams] = useSearchParams();
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>('all');
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;

    const runLoad = async () => {
      setLoading(true);
      setError(null);
      try {
        const loaded = await loadJournalEntries();
        if (!isCurrent) {
          return;
        }
        setEntries(loaded);
      } catch (err) {
        console.warn('[Journal V2] Failed to load entries from persistence', err);
        if (isCurrent) {
          setError('Unable to load journal entries; showing empty state.');
        }
      } finally {
        if (isCurrent) {
          setLoading(false);
        }
      }
    };

    void runLoad();

    return () => {
      isCurrent = false;
    };
  }, [setEntries, setError, setLoading, loadJournalEntries]);

  useEffect(() => {
    const entryFromUrl = searchParams.get('entry');
    const hasEntryInUrl = entryFromUrl ? entries.some((entry) => entry.id === entryFromUrl) : false;

    if (entryFromUrl) {
      if (hasEntryInUrl && entryFromUrl !== activeId) {
        setActiveId(entryFromUrl);
      } else if (!hasEntryInUrl && activeId) {
        setActiveId(undefined);
      }
      return;
    }

    const activeExistsInEntries = activeId ? entries.some((entry) => entry.id === activeId) : false;
    if (!activeExistsInEntries && entries.length) {
      const firstEntryId = entries[0]?.id;
      if (firstEntryId && firstEntryId !== activeId) {
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

  const handleCreateEntry = useCallback(
    async ({ title, notes }: { title: string; notes: string }) => {
      setIsCreating(true);
      setCreateErrorMessage(null);
      try {
        const newEntry = await createQuickJournalEntry({ title, notes });
        addEntry(newEntry);
        setActiveId(newEntry.id);
        const nextParams = new URLSearchParams(searchParams);
        nextParams.set('entry', newEntry.id);
        setSearchParams(nextParams, { replace: true });
        setIsNewDialogOpen(false);
      } catch (createError) {
        console.warn('[Journal V2] Failed to create entry', createError);
        setCreateErrorMessage('Unable to create entry. Please try again.');
      } finally {
        setIsCreating(false);
      }
    },
    [addEntry, searchParams, setActiveId, setSearchParams],
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
              <p className="text-xs text-zinc-500">Select any entry to review and edit notes inline.</p>
              {isLoading && <p className="text-xs text-zinc-500">Loading entries…</p>}
              {!isLoading && error && <p className="text-xs text-amber-300">{error}</p>}
            </div>
            <div className="flex flex-col items-end gap-3 text-right text-sm text-zinc-400 sm:flex-row sm:items-center">
              <div>
                <p>Next review in 2 days</p>
                <p className="text-xs uppercase tracking-wide">Daily ritual: 06:30 UTC</p>
              </div>
              <button
                type="button"
                onClick={() => setIsNewDialogOpen(true)}
                disabled={isLoading || isCreating}
                className="rounded-full border border-white/20 bg-white/5 px-4 py-2 text-xs font-medium text-white transition hover:bg-white/10 disabled:opacity-40"
              >
                New entry
              </button>
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
                          isActive ? 'border-white/30 bg-white/10 text-white' : 'border-white/10 text-white/60 hover:bg-white/5'
                        }`}
                      >
                        {filter.label}
                      </button>
                    );
                  })}
                </div>
                <div className="flex-1 overflow-y-auto p-2">
                  {isLoading ? (
                    <div className="space-y-2">
                      {Array.from({ length: 3 }).map((_, idx) => (
                        <div key={idx} className="h-16 animate-pulse rounded-2xl bg-white/5" />
                      ))}
                    </div>
                  ) : (
                    <JournalList entries={filteredEntries} activeId={activeId} onSelect={handleSelectEntry} />
                  )}
                </div>
              </div>
            </div>
          }
          detail={<JournalDetailPanel entry={activeEntry} />}
        />
      </div>
      <JournalNewEntryDialog
        isOpen={isNewDialogOpen}
        onClose={() => {
          if (!isCreating) {
            setIsNewDialogOpen(false);
            setCreateErrorMessage(null);
          }
        }}
        onCreate={handleCreateEntry}
        isSubmitting={isCreating}
        errorMessage={createErrorMessage}
      />
    </div>
  );
}
