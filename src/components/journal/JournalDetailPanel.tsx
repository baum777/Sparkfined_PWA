import React, { useCallback, useEffect, useMemo, useState } from 'react';
import type { JournalEntry } from '@/store/journalStore';
import { updateJournalEntryNotes, useJournalStore } from '@/store/journalStore';

type JournalDetailPanelProps = {
  entry?: JournalEntry;
};

export default function JournalDetailPanel({ entry }: JournalDetailPanelProps) {
  const updateEntry = useJournalStore((state) => state.updateEntry);
  const [isEditing, setIsEditing] = useState(false);
  const [draftNotes, setDraftNotes] = useState(entry?.notes ?? '');
  const [isSaving, setIsSaving] = useState(false);
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
      ? 'text-red-600'
      : 'text-emerald-600'
    : 'text-muted-foreground';

  const directionLabel = entry ? entry.direction.toUpperCase() : '';

  const directionBadgeClass =
    entry && entry.direction === 'long'
      ? 'bg-emerald-100 text-emerald-700'
      : 'bg-red-100 text-red-700';

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

  if (!entry) {
    return (
      <div className="flex h-full items-center justify-center px-4 text-sm text-muted-foreground">
        Select a journal entry on the left to see full details and notes here.
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col p-4">
      {/* Header: title, direction badge, date */}
      <div className="flex flex-col gap-2 border-b pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold leading-tight">{entry.title}</h2>
            <div className="text-xs text-muted-foreground">{entry.date}</div>
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
            <button
              type="button"
              onClick={handleStartEdit}
              disabled={!entry || isSaving}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white transition hover:bg-white/10 disabled:opacity-40"
            >
              Edit notes
            </button>
          </div>
        </div>
      </div>

      {/* PnL row */}
      <div className="mt-3 flex items-center justify-between text-sm">
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">PnL</span>
        <span className={['text-sm font-semibold', pnlColorClass].join(' ')}>{entry.pnl ?? 'N/A'}</span>
      </div>

      {/* Notes */}
      <div className="mt-4 flex-1 border-t pt-4">
        <div className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">Notes</div>
        {isEditing ? (
          <>
            <textarea
              value={draftNotes}
              onChange={(event) => setDraftNotes(event.target.value)}
              rows={6}
              className="w-full rounded-xl border border-white/10 bg-black/40 p-3 text-sm text-zinc-100 shadow-inner outline-none transition focus:border-emerald-400/70 focus:ring-2 focus:ring-emerald-400/30"
              disabled={isSaving}
            />
            {(errorMessage || draftNotes.trim().length === 0) && (
              <p className="mt-2 text-sm text-amber-300">
                {errorMessage ?? 'Notes are currently empty. Add some context before saving.'}
              </p>
            )}
            <div className="mt-4 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/5 disabled:opacity-40"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveNotes}
                disabled={isSaving}
                className="rounded-full border border-emerald-400/60 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-200 transition hover:bg-emerald-500/20 disabled:opacity-40"
              >
                {isSaving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </>
        ) : entry.notes ? (
          <div className="max-h-64 overflow-y-auto whitespace-pre-wrap text-sm leading-relaxed">
            {entry.notes}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No notes for this entry yet.</div>
        )}
      </div>
    </div>
  );
}
