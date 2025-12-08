import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import JournalLayout from '@/components/journal/JournalLayout';
import JournalList from '@/components/journal/JournalList';
import JournalDetailPanel from '@/components/journal/JournalDetailPanel';
import JournalNewEntryDialog from '@/components/journal/JournalNewEntryDialog';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { JournalJourneyBanner } from '@/components/journal/JournalJourneyBanner';
import { JournalHeaderActions } from '@/components/journal/JournalHeaderActions';
import { computeUserJourneySnapshotFromEntries } from '@/lib/journal/journey-snapshot';
import { createQuickJournalEntry, loadJournalEntries, useJournalStore } from '@/store/journalStore';
import { JournalInsightsPanel } from '@/components/journal/JournalInsightsPanel';
import { Search } from '@/lib/icons';

type DirectionFilter = 'all' | 'long' | 'short';

export default function JournalPageV2() {
  const entries = useJournalStore((state) => state.entries);
  const isLoading = useJournalStore((state) => state.isLoading);
  const error = useJournalStore((state) => state.error);
  const activeId = useJournalStore((state) => state.activeId);
  const setEntries = useJournalStore((state) => state.setEntries);
  const setActiveId = useJournalStore((state) => state.setActiveId);
  const setLoading = useJournalStore((state) => state.setLoading);
  const setError = useJournalStore((state) => state.setError);
  const addEntry = useJournalStore((state) => state.addEntry);
  const location = useLocation();
  const [, setSearchParams] = useSearchParams();
  const [directionFilter, setDirectionFilter] = useState<DirectionFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [createErrorMessage, setCreateErrorMessage] = useState<string | null>(null);
  const [cacheWarning, setCacheWarning] = useState<string | null>(null);
  const entryFromUrl = useMemo(() => {
    if (!location.search) {
      return null;
    }
    const params = new URLSearchParams(location.search);
    return params.get('entry');
  }, [location.search]);

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
        setCacheWarning(null);
      } catch (err) {
        console.warn('[Journal V2] Failed to load entries from persistence', err);
        if (isCurrent) {
          setError('Unable to load journal entries; showing empty state.');
          setCacheWarning('Local journal cache is currently unavailable. Live data may be limited.');
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
    // loadJournalEntries is a stable import, setters are stable from zustand
  }, []);

  // Keep URL state in sync with the active entry while preventing re-render loops.
  useEffect(() => {
    if (!entries.length) {
      return;
    }

    if (entryFromUrl && entries.some((entry) => entry.id === entryFromUrl)) {
      if (entryFromUrl !== activeId) {
        setActiveId(entryFromUrl);
      }
      return;
    }

    const fallbackEntry = entries[0];
    if (fallbackEntry && (!activeId || !entries.some((entry) => entry.id === activeId))) {
      if (fallbackEntry.id !== activeId) {
        setActiveId(fallbackEntry.id);
      }
    }
  }, [entries, entryFromUrl, activeId, setActiveId]);

  const directionFilteredEntries = useMemo(() => {
    if (directionFilter === 'all') {
      return entries;
    }
    return entries.filter((entry) => entry.direction === directionFilter);
  }, [directionFilter, entries]);

  const normalizedQuery = searchQuery.trim().toLowerCase();

  const filteredEntries = useMemo(() => {
    if (!normalizedQuery) {
      return directionFilteredEntries;
    }
    return directionFilteredEntries.filter((entry) => {
      const haystacks = [entry.title, entry.notes ?? ''];
      return haystacks.some((value) => value.toLowerCase().includes(normalizedQuery));
    });
  }, [directionFilteredEntries, normalizedQuery]);

  const directionCounts = useMemo(() => {
    return {
      all: entries.length,
      long: entries.filter((entry) => entry.direction === 'long').length,
      short: entries.filter((entry) => entry.direction === 'short').length,
    };
  }, [entries]);

  const journeySources = useMemo(
    () =>
      entries.map((entry) => ({
        journeyMeta: entry.journeyMeta,
      })),
    [entries],
  );

  const hasJourneyMeta = useMemo(
    () => journeySources.some((source) => Boolean(source.journeyMeta)),
    [journeySources],
  );

  const journeySnapshot = useMemo(
    () => computeUserJourneySnapshotFromEntries(journeySources),
    [journeySources],
  );

  const handleSelectEntry = useCallback(
    (id: string) => {
      setActiveId(id);
      setSearchParams((prev) => {
        const nextParams = new URLSearchParams(prev);
        nextParams.set('entry', id);
        return nextParams;
      }, { replace: true });
    },
    [setActiveId, setSearchParams],
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

  const listEmptyState = useMemo(
    () =>
      filteredEntries.length === 0 && entries.length
        ? {
            title: 'No entries match your filters',
            description: 'Adjust the direction filter or clear your search to see your saved trades again.',
            actionLabel: 'Clear filters',
            onAction: () => {
              setDirectionFilter('all');
              setSearchQuery('');
            },
          }
        : undefined,
    [entries.length, filteredEntries.length, setDirectionFilter, setSearchQuery],
  );

  const hasFiltersApplied = directionFilter !== 'all' || Boolean(normalizedQuery);

  const handleCreateEntry = useCallback(
    async ({ title, notes }: { title: string; notes: string }) => {
      setIsCreating(true);
      setCreateErrorMessage(null);
      try {
        const newEntry = await createQuickJournalEntry({ title, notes });
        addEntry(newEntry);
        setActiveId(newEntry.id);
        setSearchParams((prev) => {
          const nextParams = new URLSearchParams(prev);
          nextParams.set('entry', newEntry.id);
          return nextParams;
        }, { replace: true });
        setIsNewDialogOpen(false);
      } catch (createError) {
        console.warn('[Journal V2] Failed to create entry', createError);
        setCreateErrorMessage('Unable to create entry. Please try again.');
      } finally {
        setIsCreating(false);
      }
    },
    [addEntry, setActiveId, setSearchParams],
  );

  const headerDescription = `${entries.length} recent entries · Quick filters and inline edits to stay in flow`;

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
      <div
        className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 text-text-primary md:px-6 lg:py-8"
        data-testid="journal-page"
      >
        <section className="space-y-3">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-text-tertiary">Daily practice</p>
            <p className="text-base text-text-primary">Your trading log as a guided ritual to build discipline, not FOMO.</p>
            <p className="text-sm text-text-secondary">
              Select any entry to review, refine your notes, and track your growth over time.
            </p>
          </div>
          <div className="space-y-1 text-xs">
            {isLoading && <p className="text-text-tertiary">Loading your journal…</p>}
            {!isLoading && error && (
              <p className="font-medium text-warn">
                Could not load entries right now. Please reload or try again later.
              </p>
            )}
            {!isLoading && cacheWarning && (
              <p className="text-text-secondary" data-testid="journal-cache-warning">
                {cacheWarning}
              </p>
            )}
          </div>
        </section>

        {hasJourneyMeta && journeySnapshot && (
          <section>
            <JournalJourneyBanner snapshot={journeySnapshot} />
          </section>
        )}

        <section>
          <JournalInsightsPanel entries={entries} />
        </section>

        <section>
          <JournalLayout
            list={
              <div className="flex h-full flex-col space-y-3">
                <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs uppercase tracking-wider text-text-tertiary">Entries</p>
                    <p className="text-xs text-text-secondary">
                      Showing {filteredEntries.length} of {entries.length} saved logs
                    </p>
                  </div>
                  <p className="text-xs text-text-tertiary">Filter by direction or search through notes.</p>
                </div>
                <div className="flex h-full flex-col rounded-2xl border border-border bg-surface/80 backdrop-blur">
                  <div className="flex flex-col gap-2 border-b border-border px-3 py-2 md:flex-row md:items-center md:justify-between">
                    <div className="flex flex-wrap items-center gap-2">
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
                      {hasFiltersApplied ? (
                        <button
                          type="button"
                          onClick={() => {
                            setDirectionFilter('all');
                            setSearchQuery('');
                          }}
                          className="rounded-full border border-border-subtle px-3 py-1 text-xs font-medium text-text-secondary transition hover:border-border-hover hover:bg-interactive-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
                          data-testid="journal-clear-filters"
                        >
                          Reset
                        </button>
                      ) : null}
                    </div>
                    <label className="flex w-full items-center gap-2 rounded-full border border-border bg-surface px-3 py-2 text-sm text-text-primary shadow-inner transition focus-within:border-border-hover focus-within:ring-2 focus-within:ring-border-focus md:w-auto md:min-w-[260px]">
                      <Search size={16} className="text-text-tertiary" aria-hidden />
                      <input
                        type="search"
                        value={searchQuery}
                        onChange={(event) => setSearchQuery(event.target.value)}
                        placeholder="Search by title or notes"
                        className="w-full bg-transparent text-sm outline-none placeholder:text-text-secondary"
                        data-testid="journal-search-input"
                      />
                    </label>
                  </div>
                  <div className="flex-1 overflow-y-auto p-2">
                    {isLoading ? (
                      <div className="space-y-2">
                        {Array.from({ length: 3 }).map((_, idx) => (
                          <div key={idx} className="h-16 animate-pulse rounded-2xl bg-surface" />
                        ))}
                      </div>
                    ) : (
                      <JournalList
                        entries={filteredEntries}
                        activeId={activeId}
                        onSelect={handleSelectEntry}
                        onNewEntry={() => setIsNewDialogOpen(true)}
                        emptyState={listEmptyState}
                      />
                    )}
                  </div>
                </div>
              </div>
            }
            detail={<JournalDetailPanel entry={activeEntry} />}
          />
        </section>
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
