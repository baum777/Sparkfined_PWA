import React, { useEffect, useState } from 'react';

interface JournalNewEntryDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (payload: { title: string; notes: string }) => Promise<void> | void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}

export default function JournalNewEntryDialog({
  isOpen,
  onClose,
  onCreate,
  isSubmitting = false,
  errorMessage,
}: JournalNewEntryDialogProps) {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setNotes('');
      setLocalError(null);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !isSubmitting) {
      onClose();
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    if (!trimmedTitle) {
      setLocalError('Please add a title.');
      return;
    }
    setLocalError(null);
    await onCreate({ title: trimmedTitle, notes });
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-bg-overlay/70 backdrop-blur"
      role="dialog"
      aria-modal="true"
      onClick={handleOverlayClick}
      data-testid="journal-new-entry-dialog"
    >
      <div className="flex min-h-full items-center justify-center p-4 py-8">
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-md rounded-2xl border border-border-moderate bg-surface-elevated p-6 text-text-primary shadow-2xl"
          data-testid="journal-new-entry-form"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-xl font-semibold text-text-primary">New journal entry</h2>
              <p className="text-sm text-text-secondary">Save a clear title and one key note to revisit later.</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-full border border-border-moderate px-3 py-1 text-xs text-text-secondary transition hover:border-border-hover hover:bg-interactive-hover disabled:opacity-40"
              data-testid="journal-close-entry-button"
            >
              Close
            </button>
          </div>

          <div className="mt-5 space-y-4">
            <label className="space-y-1 text-sm text-text-primary">
              <span className="text-xs uppercase tracking-wide text-text-tertiary">Title</span>
              <input
                type="text"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Setup / reason"
                className="w-full rounded-xl border border-border-moderate bg-surface-subtle px-3 py-2 text-sm text-text-primary outline-none transition focus:border-border-hover focus:ring-2 focus:ring-border-focus disabled:opacity-60"
                disabled={isSubmitting}
                autoFocus
                data-testid="journal-new-entry-title"
              />
              <span className="block text-xs text-text-tertiary">Make the title specific enough to skim later.</span>
            </label>

            <label className="space-y-1 text-sm text-text-primary">
              <span className="text-xs uppercase tracking-wide text-text-tertiary">Notes</span>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                placeholder="Context, plan, risk..."
                rows={5}
                className="w-full rounded-xl border border-border-moderate bg-surface-subtle px-3 py-2 text-sm text-text-primary outline-none transition focus:border-border-hover focus:ring-2 focus:ring-border-focus disabled:opacity-60"
                disabled={isSubmitting}
                data-testid="journal-new-entry-notes"
              />
              <span className="block text-xs text-text-tertiary">Optional: one takeaway or risk to remember.</span>
            </label>

            {(localError || errorMessage) && (
              <p className="text-sm text-status-armed-text" data-testid="journal-new-entry-error">
                {localError ?? errorMessage}
              </p>
            )}
          </div>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-full border border-border-subtle px-4 py-2 text-sm text-text-secondary transition hover:border-border-hover hover:bg-interactive-hover disabled:opacity-40"
              data-testid="journal-cancel-entry-button"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full border border-brand bg-interactive-active px-4 py-2 text-sm font-medium text-text-primary transition hover:bg-sentiment-bull-bg disabled:opacity-40"
              data-testid="journal-save-entry-button"
            >
              {isSubmitting ? 'Saving…' : 'Save & open entry'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
