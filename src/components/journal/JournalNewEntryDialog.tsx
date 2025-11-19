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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur"
      role="dialog"
      aria-modal="true"
      onClick={handleOverlayClick}
    >
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">New journal entry</h2>
            <p className="text-sm text-zinc-400">Capture the idea quickly – you can refine it later.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full border border-white/20 px-3 py-1 text-xs text-white/70 transition hover:bg-white/10 disabled:opacity-40"
          >
            Close
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <label className="space-y-1 text-sm text-zinc-200">
            <span className="text-xs uppercase tracking-wide text-zinc-500">Title</span>
            <input
              type="text"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Setup / reason"
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/20 disabled:opacity-60"
              disabled={isSubmitting}
              autoFocus
            />
          </label>

          <label className="space-y-1 text-sm text-zinc-200">
            <span className="text-xs uppercase tracking-wide text-zinc-500">Notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Context, plan, risk..."
              rows={5}
              className="w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-sm text-white outline-none transition focus:border-white/30 focus:ring-2 focus:ring-white/20 disabled:opacity-60"
              disabled={isSubmitting}
            />
          </label>

          {(localError || errorMessage) && (
            <p className="text-sm text-amber-300">{localError ?? errorMessage}</p>
          )}
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 transition hover:bg-white/5 disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20 disabled:opacity-40"
          >
            {isSubmitting ? 'Saving…' : 'Save entry'}
          </button>
        </div>
      </form>
    </div>
  );
}
