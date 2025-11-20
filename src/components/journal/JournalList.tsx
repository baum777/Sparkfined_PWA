import React from 'react';
import { useSearchParams } from 'react-router-dom';
import type { JournalEntry } from '@/store/journalStore';

export type JournalListEntry = JournalEntry;

interface JournalListProps {
  entries: ReadonlyArray<JournalListEntry>;
  activeId?: string;
  onSelect: (id: string) => void;
}

export default function JournalList({ entries, activeId, onSelect }: JournalListProps) {
  const [, setSearchParams] = useSearchParams();

  const handleSelect = (id: string) => {
    onSelect(id);
    setSearchParams((prev) => {
      const nextParams = new URLSearchParams(prev);
      nextParams.set('entry', id);
      return nextParams;
    });
  };

  if (!entries.length) {
    return (
      <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-border-moderate bg-surface-subtle px-6 py-10 text-center">
        <p className="text-base font-medium text-text-primary">No journal entries yet.</p>
        <p className="mt-2 max-w-sm text-sm text-text-secondary">
          Your trades and notes will appear here once you create them.
        </p>
        <p className="mt-4 text-xs uppercase tracking-wide text-text-tertiary">
          Create your first entry from the trade flow.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2" role="list">
      {entries.map((entry) => {
        const isActive = entry.id === activeId;
        return (
          <button
            key={entry.id}
            type="button"
            onClick={() => handleSelect(entry.id)}
            className={`group relative w-full rounded-xl border pr-5 pl-8 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus ${
              isActive
                ? 'border-sentiment-bull-border bg-interactive-active shadow-[inset_0_0_0_1px_rgba(16,185,129,0.35)]'
                : 'border-border-subtle bg-surface-subtle hover:border-border-hover hover:bg-interactive-hover focus-visible:border-border-moderate'
            }`}
            role="listitem"
            aria-pressed={isActive}
          >
            <span
              className={`absolute inset-y-3 left-3 w-1 rounded-full transition ${
                isActive ? 'bg-sentiment-bull' : 'bg-transparent group-hover:bg-interactive-hover'
              }`}
              aria-hidden="true"
            />
              <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-text-primary sm:text-base">{entry.title}</p>
                    {entry.isAuto ? (
                      <span className="inline-flex items-center rounded-full bg-sentiment-bull-bg px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sentiment-bull">
                        Auto
                      </span>
                    ) : null}
                  </div>
                  <p className="text-xs text-text-secondary">{entry.date}</p>
                </div>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide ${
                    entry.direction === 'long'
                      ? 'bg-sentiment-bull-bg text-sentiment-bull'
                      : 'bg-sentiment-bear-bg text-sentiment-bear'
                  }`}
                >
                  {entry.direction.toUpperCase()}
                </span>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-text-secondary">
                <span>{entry.date}</span>
                {entry.pnl ? <span className="font-mono text-sm text-text-primary">{entry.pnl}</span> : null}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
