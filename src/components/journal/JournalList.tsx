import React from 'react';
import { useSearchParams } from 'react-router-dom';
import type { JournalEntry } from '@/store/journalStore';
import { BookOpen } from '@/lib/icons';

export type JournalListEntry = JournalEntry;

type JournalListEmptyState = {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
};

interface JournalListProps {
  entries: ReadonlyArray<JournalListEntry>;
  activeId?: string;
  onSelect: (id: string) => void;
  onNewEntry?: () => void;
  emptyState?: JournalListEmptyState;
}

export default function JournalList({ entries, activeId, onSelect, onNewEntry, emptyState }: JournalListProps) {
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
    if (emptyState) {
      return (
        <div
          className="card-bordered flex min-h-[320px] flex-col items-center justify-center rounded-2xl border-dashed px-6 py-12 text-center"
          data-testid="journal-empty-state"
        >
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-surface">
            <BookOpen size={24} className="text-text-secondary" />
          </div>
          <h3 className="text-base font-semibold text-text-primary">{emptyState.title}</h3>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-text-secondary">{emptyState.description}</p>
          {emptyState.onAction && emptyState.actionLabel ? (
            <button
              type="button"
              onClick={emptyState.onAction}
              className="mt-4 rounded-full border border-border-subtle bg-interactive-hover px-4 py-2 text-sm font-medium text-text-primary transition hover:border-border-hover hover:bg-interactive-active focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
              data-testid="journal-empty-reset"
            >
              {emptyState.actionLabel}
            </button>
          ) : null}
        </div>
      );
    }

    return (
      <div
        className="card-bordered flex min-h-[320px] flex-col items-center justify-center rounded-2xl border-dashed px-6 py-12 text-center"
        data-testid="journal-empty-state"
      >
        {/* Icon */}
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sentiment-bull-bg/20">
          <BookOpen size={32} className="text-sentiment-bull" />
        </div>

        {/* Heading */}
        <h3 className="text-lg font-semibold text-text-primary">Start Your Trading Journal</h3>

        {/* Description */}
        <p className="mt-2 max-w-sm text-sm leading-relaxed text-text-secondary">
          Document your trades, track your reasoning, and build consistent habits.
          Every entry helps you spot patterns and improve over time.
        </p>

        {/* Tips */}
        <div className="mt-6 space-y-2 text-left">
          <p className="text-xs font-semibold uppercase tracking-wide text-text-tertiary">What to journal:</p>
          <ul className="space-y-1.5 text-sm text-text-secondary">
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-sentiment-bull">•</span>
              <span>Entry setup and thesis</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-sentiment-bull">•</span>
              <span>Risk management decisions</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-sentiment-bull">•</span>
              <span>Emotions and mental state</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="mt-0.5 text-sentiment-bull">•</span>
              <span>Post-trade lessons learned</span>
            </li>
          </ul>
        </div>

        {/* CTA */}
        {onNewEntry && (
          <button
            type="button"
            onClick={onNewEntry}
            className="mt-6 rounded-full border-glow-success bg-sentiment-bull-bg px-5 py-2.5 text-sm font-medium text-sentiment-bull transition hover:bg-sentiment-bull-bg/80 hover-scale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sentiment-bull"
            data-testid="journal-empty-cta"
          >
            Create Your First Entry
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2" role="list" data-testid="journal-entry-list">
      {entries.map((entry) => {
        const isActive = entry.id === activeId;
        return (
          <button
            key={entry.id}
            type="button"
            onClick={() => handleSelect(entry.id)}
            className={`group relative w-full rounded-xl border pr-5 pl-8 py-4 text-left transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus ${
              isActive
                ? 'border-glow-success bg-brand/5'
                : 'border-border bg-surface-subtle hover:border-border-hover hover:bg-interactive-hover hover-lift focus-visible:border-border-moderate'
            }`}
            role="listitem"
            aria-pressed={isActive}
            data-testid="journal-list-item"
            data-entry-id={entry.id}
            data-direction={entry.direction}
            data-active={String(isActive)}
          >
            <span
              className={`absolute inset-y-3 left-3 w-1 rounded-full transition ${
                isActive ? 'bg-sentiment-bull' : 'bg-transparent group-hover:bg-interactive-hover'
              }`}
              aria-hidden="true"
            />
            <div className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
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
                <div className="flex flex-col items-end gap-2 text-right">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold tracking-wide ${
                      entry.direction === 'long'
                        ? 'bg-sentiment-bull-bg text-sentiment-bull'
                        : 'bg-sentiment-bear-bg text-sentiment-bear'
                    }`}
                  >
                    {entry.direction.toUpperCase()}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {entry.pnl ? <span className="font-mono text-sm text-text-primary">{entry.pnl}</span> : 'No PnL logged'}
                  </span>
                </div>
              </div>
              <p className="line-clamp-2 text-sm text-text-secondary">
                {entry.notes?.trim() ? entry.notes : 'No notes yet — open the entry to add context.'}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
