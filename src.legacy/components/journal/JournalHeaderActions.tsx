import React from 'react';
import Button from '@/components/ui/Button';

interface JournalHeaderActionsProps {
  isLoading: boolean;
  isCreating: boolean;
  onNewEntry: () => void;
}

export function JournalHeaderActions({ isLoading, isCreating, onNewEntry }: JournalHeaderActionsProps) {
  return (
    <div className="flex flex-col items-end gap-3 text-right text-sm text-text-secondary sm:flex-row sm:items-center sm:gap-4">
      <div className="space-y-1 text-left sm:text-right">
        <p className="text-sm text-text-secondary">Keep your streak alive with a quick log.</p>
        <p className="text-xs uppercase tracking-wide text-text-tertiary">Daily ritual: add context before the session</p>
      </div>
      <Button
        variant="primary"
        size="sm"
        onClick={onNewEntry}
        disabled={isLoading || isCreating}
        data-testid="journal-new-entry-button"
        className="rounded-full shadow-glow-brand"
      >
        Log new entry
      </Button>
    </div>
  );
}
