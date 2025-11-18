import React from 'react';
import type { WatchlistRow } from '@/store/watchlistStore';

interface WatchlistDetailPanelProps {
  row?: WatchlistRow;
}

export default function WatchlistDetailPanel({ row }: WatchlistDetailPanelProps) {
  if (!row) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-black/20 px-6 py-10 text-center">
        <p className="text-sm text-zinc-400">Select an asset on the left to see more context here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 rounded-2xl border border-white/10 bg-black/30 p-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-semibold text-white">{row.symbol}</h2>
        <p className="text-sm text-zinc-400">{row.name}</p>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">Price</p>
          <p className="mt-1 text-lg font-semibold text-amber-200">{row.price}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-zinc-500">24h change</p>
          <p className={`mt-1 text-lg font-semibold ${getChangeAccent(row.change24h)}`}>
            {row.change24h}
          </p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs uppercase tracking-[0.3em] text-zinc-500">Session</p>
        <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-200">
          {row.session}
        </span>
      </div>

      <div className="space-y-4 border-t border-white/5 pt-6">
        <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-4 text-center">
          <p className="text-xs text-zinc-400">Mini chart coming soon.</p>
        </div>
        <div className="rounded-xl border border-dashed border-white/10 bg-black/20 p-4 text-center">
          <p className="text-xs text-zinc-400">Links to Analysis and Journal will appear here.</p>
        </div>
      </div>
    </div>
  );
}

function getChangeAccent(change: string) {
  const trimmed = change.trim();

  if (trimmed.startsWith('-')) {
    return 'text-rose-300';
  }

  if (trimmed.startsWith('+')) {
    return 'text-emerald-300';
  }

  return 'text-zinc-200';
}
