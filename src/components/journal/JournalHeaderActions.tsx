import React from 'react';

interface JournalHeaderActionsProps {
  isLoading: boolean;
  isCreating: boolean;
  onNewEntry: () => void;
}

export function JournalHeaderActions({ isLoading, isCreating, onNewEntry }: JournalHeaderActionsProps) {
  return (
    <div className="flex flex-col items-end gap-3 text-right text-sm text-text-secondary sm:flex-row sm:items-center sm:gap-4">
      <div>
        <p className="text-text-secondary">Next review in 2 days</p>
        <p className="text-xs uppercase tracking-wide text-text-tertiary">Daily ritual: 06:30 UTC</p>
      </div>
      <button
        type="button"
        onClick={onNewEntry}
        disabled={isLoading || isCreating}
        className="rounded-full border border-border bg-surface px-4 py-2 text-xs font-semibold text-text-primary transition hover:border-brand hover:bg-interactive-hover hover:text-text-primary hover-scale focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-50"
        data-testid="journal-new-entry-button"
      >
        New entry
      </button>
    </div>
  );
}
