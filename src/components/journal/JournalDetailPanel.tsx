import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { JournalEntry } from '@/store/journalStore';
import { updateJournalEntryNotes, useJournalStore } from '@/store/journalStore';

type JournalDetailPanelProps = {
  entry?: JournalEntry;
};

export default function JournalDetailPanel({ entry }: JournalDetailPanelProps) {
  const updateEntry = useJournalStore((state) => state.updateEntry);
  const removeEntry = useJournalStore((state) => state.removeEntry);
  const [isEditing, setIsEditing] = useState(false);
  const [draftNotes, setDraftNotes] = useState(entry?.notes ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    setDraftNotes(entry?.notes ?? '');
    setIsEditing(false);
    setErrorMessage(null);
    setIsSaving(false);
  }, [entry?.id, entry?.notes]);

  const isNegativePnl = useMemo(
    () => typeof entry?.pnl === 'string' && entry.pnl.trim().startsWith('-'),
    [entry?.pnl],
  );

  const pnlColorClass = entry?.pnl
    ? isNegativePnl
      ? 'text-sentiment-bear'
      : 'text-sentiment-bull'
    : 'text-text-tertiary';

  const directionLabel = entry ? entry.direction.toUpperCase() : '';

  const directionBadgeClass =
    entry && entry.direction === 'long'
      ? 'bg-sentiment-bull-bg text-sentiment-bull'
      : 'bg-sentiment-bear-bg text-sentiment-bear';

  const handleStartEdit = useCallback(() => {
    if (!entry) {
      return;
    }
    setDraftNotes(entry.notes ?? '');
    setErrorMessage(null);
    setIsEditing(true);
  }, [entry]);

  const handleCancelEdit = useCallback(() => {
    setDraftNotes(entry?.notes ?? '');
    setErrorMessage(null);
    setIsEditing(false);
  }, [entry?.notes]);

  const handleSaveNotes = useCallback(async () => {
    if (!entry) {
      return;
    }
    const trimmed = draftNotes.trim();
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const updated = await updateJournalEntryNotes(entry.id, trimmed);
      updateEntry(updated);
      setIsEditing(false);
    } catch (err) {
      console.warn('[Journal V2] Failed to update notes', err);
      setErrorMessage('Could not save notes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [draftNotes, entry, updateEntry]);

  const handleDelete = useCallback(async () => {
    if (!entry) {
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to delete "${entry.title}"? This action cannot be undone.`,
    );
    if (!confirmed) {
      return;
    }
    setIsDeleting(true);
    setErrorMessage(null);
    try {
      await removeEntry(entry.id);
    } catch (err) {
      console.warn('[Journal V2] Failed to delete entry', err);
      setErrorMessage('Could not delete entry. Please try again.');
      setIsDeleting(false);
    }
  }, [entry, removeEntry]);

  if (!entry) {
    return (
      <div
        className="flex h-full items-center justify-center px-4 text-sm text-text-secondary"
        data-testid="journal-detail-empty"
      >
        Select a journal entry on the left to see full details and notes here.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-4 text-text-primary" data-testid="journal-detail-panel">
      {/* Header: title, direction badge, date */}
      <div className="flex flex-col gap-2 border-b border-border-subtle pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold leading-tight" data-testid="journal-detail-title">
              {entry.title}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-text-secondary">
              <span>{entry.date}</span>
              {entry.isAuto ? (
                <span className="inline-flex items-center rounded-full bg-sentiment-bull-bg px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sentiment-bull">
                  Auto
                </span>
              ) : null}
              {entry.sentimentLabel ? (
                <span className="inline-flex items-center rounded-full border border-border-subtle bg-surface-skeleton px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-text-primary">
                  {entry.sentimentLabel}
                </span>
              ) : null}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className={[
                'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                directionBadgeClass,
              ].join(' ')}
            >
              {directionLabel}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleDelete}
                disabled={!entry || isSaving || isDeleting}
                className="rounded-full border border-status-armed-border bg-status-armed-bg px-3 py-1 text-xs font-medium text-status-armed-text transition hover:border-status-armed-text hover:bg-status-armed-text/10 disabled:opacity-40"
                data-testid="journal-delete-button"
              >
                {isDeleting ? 'Deleting…' : 'Delete'}
              </button>
              <button
                type="button"
                onClick={handleStartEdit}
                disabled={!entry || isSaving || isDeleting}
                className="rounded-full border border-border-subtle bg-interactive-hover px-3 py-1 text-xs font-medium text-text-primary transition hover:border-border-hover hover:bg-interactive-active disabled:opacity-40"
                data-testid="journal-edit-notes-button"
              >
                Edit notes
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* PnL row */}
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-xs font-medium uppercase tracking-wide text-text-tertiary">PnL</span>
        <span className={['text-sm font-semibold', pnlColorClass].join(' ')}>{entry.pnl ?? 'N/A'}</span>
      </div>

      {/* Notes */}
      <div className="mt-4 flex-1 border-t border-border-subtle pt-4">
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-text-tertiary">Notes</div>
        {isEditing ? (
          <>
            <textarea
              value={draftNotes}
              onChange={(event) => setDraftNotes(event.target.value)}
              rows={6}
              className="w-full rounded-xl border border-border-moderate bg-surface-elevated p-3 text-sm text-text-primary shadow-inner outline-none transition focus:border-border-hover focus:ring-2 focus:ring-border-focus"
              disabled={isSaving}
              data-testid="journal-detail-notes-input"
            />
            {(errorMessage || draftNotes.trim().length === 0) && (
              <p className="mt-2 text-sm text-status-armed-text">
                {errorMessage ?? 'Notes are currently empty. Add some context before saving.'}
              </p>
            )}
            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="rounded-full border border-border-subtle px-4 py-2 text-sm text-text-secondary transition hover:border-border-hover hover:bg-interactive-hover disabled:opacity-40"
                data-testid="journal-detail-cancel-edit"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={isSaving}
                className="rounded-full border border-sentiment-bull-border bg-sentiment-bull-bg px-4 py-2 text-sm font-medium text-sentiment-bull transition hover:bg-interactive-active disabled:opacity-40"
                data-testid="journal-detail-save-notes"
              >
                {isSaving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </>
        ) : entry.notes ? (
          <div
            className="max-h-64 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed"
            data-testid="journal-notes-content"
          >
            {entry.notes}
          </div>
        ) : (
          <div className="text-sm text-text-secondary">No notes for this entry yet.</div>
        )}
        {entry.sourceUrl ? (
            <a
              href={entry.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-3 inline-flex items-center gap-2 text-xs font-semibold text-sentiment-bull underline decoration-sentiment-bull/70 decoration-dotted underline-offset-4"
            >
              View source tweet
              <span aria-hidden="true">↗</span>
          </a>
        ) : null}
      </div>
    </div>
  );
}
