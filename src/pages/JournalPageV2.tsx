import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import JournalLayout from '@/components/journal/JournalLayout';
import JournalList from '@/components/journal/JournalList';
import JournalDetailPanel from '@/components/journal/JournalDetailPanel';
import JournalNewEntryDialog from '@/components/journal/JournalNewEntryDialog';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { JournalHeaderActions } from '@/components/journal/JournalHeaderActions';
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
  const entryIdFromUrl = useMemo(() => searchParams.get('entry') ?? undefined, [searchParams]);

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
    const hasEntryInUrl = entryIdFromUrl ? entries.some((entry) => entry.id === entryIdFromUrl) : false;

    if (entryIdFromUrl) {
      if (hasEntryInUrl && entryIdFromUrl !== activeId) {
        setActiveId(entryIdFromUrl);
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
  }, [activeId, entries, entryIdFromUrl, setActiveId]);

  useEffect(() => {
    if (!activeId) {
      if (entryIdFromUrl) {
        setSearchParams((prev) => {
          const nextParams = new URLSearchParams(prev);
          nextParams.delete('entry');
          return nextParams;
        }, { replace: true });
      }
      return;
    }

    if (entryIdFromUrl === activeId) {
      return;
    }

    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);
      nextParams.set('entry', activeId);
      return nextParams;
    }, { replace: true });
  }, [activeId, entryIdFromUrl, setSearchParams]);

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

  const headerDescription = `${entries.length} recent entries · Focus on clarity, context, conviction`;

  return (
    <DashboardShell
      title="Journal"
      description={headerDescription}
      actions={
        <JournalHeaderActions
          isLoading={isLoading}
          isCreating={isCreating}
          onNewEntry={() => setIsNewDialogOpen(true)}
        />
      }
    >
      <div className="space-y-6 text-text-primary" data-testid="journal-page">
        <div className="space-y-2 text-sm text-text-tertiary">
          <p className="text-xs uppercase tracking-[0.3em] text-text-tertiary">Daily practice</p>
          <p>Select any entry to review and edit notes inline.</p>
          {isLoading && <p className="text-xs text-text-tertiary">Loading entries…</p>}
          {!isLoading && error && <p className="text-xs text-warn">{error}</p>}
        </div>

        <JournalLayout
          list={
            <div className="flex h-full flex-col space-y-3">
              <p className="text-xs uppercase tracking-wider text-text-tertiary">Entries</p>
              <div className="flex h-full flex-col rounded-2xl border border-border bg-surface/80 backdrop-blur">
                <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                  {directionFilters.map((filter) => {
                    const isActive = directionFilter === filter.value;
                    return (
                      <button
                        key={filter.value}
                        type="button"
                        onClick={() => setDirectionFilter(filter.value)}
                        className={`rounded-full border px-3 py-1 text-xs font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
                          isActive
                            ? 'border-brand bg-surface-hover text-text-primary'
                            : 'border-border text-text-secondary hover:bg-surface-hover'
                        }`}
                        data-testid={`journal-filter-${filter.value}`}
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
                        <div key={idx} className="h-16 animate-pulse rounded-2xl bg-surface" />
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
    </DashboardShell>
  );
}
