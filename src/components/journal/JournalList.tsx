import React from 'react';

export interface JournalListEntry {
  id: string;
  title: string;
  date: string;
  direction: 'long' | 'short';
  pnl?: string;
}

interface JournalListProps {
  entries: ReadonlyArray<JournalListEntry>;
  activeId?: string;
  onSelect: (id: string) => void;
}

export default function JournalList({ entries, activeId, onSelect }: JournalListProps) {
  if (!entries.length) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 bg-black/20 p-6 text-center text-sm text-zinc-400">
        No journal entries yet.
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
            onClick={() => onSelect(entry.id)}
            className={`w-full rounded-2xl border px-4 py-3 text-left transition ${
              isActive
                ? 'border-emerald-400/60 bg-emerald-400/10'
                : 'border-white/5 bg-black/30 hover:border-white/20 hover:bg-black/40'
            }`}
            role="listitem"
            aria-pressed={isActive}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-white">{entry.title}</p>
                <p className="text-xs text-zinc-400">{entry.date}</p>
              </div>
              <div className="text-right text-xs">
                <span
                  className={`inline-flex items-center rounded-full px-2 py-1 font-semibold ${
                    entry.direction === 'long'
                      ? 'bg-emerald-500/10 text-emerald-300'
                      : 'bg-rose-500/10 text-rose-300'
                  }`}
                >
                  {entry.direction.toUpperCase()}
                </span>
                {entry.pnl ? (
                  <p className="mt-1 font-mono text-sm text-zinc-300">{entry.pnl}</p>
                ) : null}
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
