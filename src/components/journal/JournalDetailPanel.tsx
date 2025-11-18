import React from 'react';
import type { JournalEntry } from '@/store/journalStore';

type JournalDetailPanelProps = {
  entry?: JournalEntry;
};

export default function JournalDetailPanel({ entry }: JournalDetailPanelProps) {
  // Read-only view; edit/create flows kommen in einem späteren Loop.

  if (!entry) {
    return (
      <div className="flex h-full items-center justify-center px-4 text-sm text-muted-foreground">
        Select a journal entry on the left to see full details and notes here.
      </div>
    );
  }

  const isNegativePnl =
    typeof entry.pnl === 'string' && entry.pnl.trim().startsWith('-');

  const pnlColorClass = entry.pnl
    ? isNegativePnl
      ? 'text-red-600'
      : 'text-emerald-600'
    : 'text-muted-foreground';

  const directionLabel = entry.direction.toUpperCase();

  const directionBadgeClass =
    entry.direction === 'long'
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-red-100 text-red-700';

  return (
    <div className="flex h-full flex-col p-4">
      {/* Header: title, direction badge, date */}
      <div className="flex flex-col gap-2 border-b pb-3">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-semibold leading-tight">{entry.title}</h2>
          <span
            className={[
              'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
              directionBadgeClass,
            ].join(' ')}
          >
            {directionLabel}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">{entry.date}</div>
      </div>

      {/* PnL row */}
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          PnL
        </span>
        <span className={['text-sm font-semibold', pnlColorClass].join(' ')}>
          {entry.pnl ?? 'N/A'}
        </span>
      </div>

      {/* Notes */}
      <div className="mt-4 flex-1 border-t pt-4">
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Notes
        </div>
        {entry.notes ? (
          <div className="max-h-64 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed">
            {entry.notes}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">
            No notes for this entry yet.
          </div>
        )}
      </div>
    </div>
  );
}
