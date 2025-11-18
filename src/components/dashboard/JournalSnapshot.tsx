import React from 'react';
import Button from '@/components/ui/Button';

interface JournalEntry {
  id: string;
  title: string;
  date: string;
  direction: 'long' | 'short';
}

interface JournalSnapshotProps {
  entries: JournalEntry[];
}

const directionStyles: Record<JournalEntry['direction'], string> = {
  long: 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30',
  short: 'bg-rose-500/15 text-rose-300 border border-rose-500/30',
};

export default function JournalSnapshot({ entries }: JournalSnapshotProps) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/30 p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-base font-semibold text-white">Recent journal entries</h3>
      </div>
      <div className="space-y-3">
        {entries.map((entry) => (
          <div key={entry.id} className="rounded-lg border border-white/5 bg-white/5 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-white">{entry.title}</p>
                <p className="text-xs text-zinc-400">{entry.date}</p>
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${directionStyles[entry.direction]}`}>
                {entry.direction === 'long' ? 'Long' : 'Short'}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-5">
        <Button variant="ghost" size="sm" className="text-blue-300 hover:text-blue-200" onClick={() => { /* TODO: wire navigation to journal */ }}>
          Open journal
        </Button>
      </div>
    </div>
  );
}
