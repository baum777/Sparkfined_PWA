import React from 'react';
import type { JournalListEntry } from './JournalList';

interface JournalDetailPanelProps {
  entry?: JournalListEntry & { notes?: string };
}

export default function JournalDetailPanel({ entry }: JournalDetailPanelProps) {
  if (!entry) {
    return (
      <div className="flex min-h-[320px] items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/30 text-sm text-zinc-400">
        Select a journal entry to see details.
      </div>
    );
  }

  return (
    <div className="space-y-4 rounded-2xl border border-white/5 bg-black/30 p-6">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-semibold text-white">{entry.title}</h2>
          <span className="rounded-full border border-white/10 px-2 py-1 text-xs text-zinc-400">{entry.date}</span>
          <span
            className={`rounded-full px-2 py-1 text-xs font-semibold ${
              entry.direction === 'long' ? 'bg-emerald-500/10 text-emerald-300' : 'bg-rose-500/10 text-rose-300'
            }`}
          >
            {entry.direction.toUpperCase()}
          </span>
          {entry.pnl ? (
            <span className="rounded-full bg-white/5 px-2 py-1 text-xs font-mono text-zinc-100">{entry.pnl}</span>
          ) : null}
        </div>
        <p className="text-sm text-zinc-400">Notes</p>
      </div>

      <div className="rounded-xl border border-white/5 bg-black/40 p-4 text-sm text-zinc-300">
        {entry.notes ?? 'No notes yet — add reflections later.'}
      </div>
    </div>
  );
}
