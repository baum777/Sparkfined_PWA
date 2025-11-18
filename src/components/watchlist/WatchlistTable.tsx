import React from 'react';

export interface WatchlistTableRow {
  symbol: string;
  name: string;
  price: string;
  change24h: string;
  session: string;
}

interface WatchlistTableProps {
  rows: ReadonlyArray<WatchlistTableRow>;
}

export default function WatchlistTable({ rows }: WatchlistTableProps) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30">
      <div className="hidden grid-cols-[1.1fr_1.4fr_minmax(0,1fr)_minmax(0,1fr)_minmax(0,120px)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-zinc-500 sm:grid">
        <span>Symbol</span>
        <span>Name</span>
        <span>Price</span>
        <span>24h change</span>
        <span>Session</span>
      </div>
      <div className="divide-y divide-white/5">
        {rows.map((row) => (
          <div
            key={`${row.symbol}-${row.session}`}
            className="flex flex-col gap-4 px-4 py-4 text-sm text-zinc-200 transition hover:bg-white/5 sm:grid sm:grid-cols-[1.1fr_1.4fr_minmax(0,1fr)_minmax(0,1fr)_minmax(0,120px)] sm:items-center sm:gap-6 sm:px-6"
          >
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 sm:hidden">Symbol</p>
              <p className="text-base font-semibold text-white">{row.symbol}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 sm:hidden">Name</p>
              <p className="font-medium text-zinc-100">{row.name}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 sm:hidden">Price</p>
              <p className="text-lg font-semibold text-amber-200">{row.price}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 sm:hidden">24h change</p>
              <p className={`font-semibold ${getChangeAccent(row.change24h)}`}>{row.change24h}</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-zinc-500 sm:hidden">Session</p>
              <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-200">
                {row.session}
              </span>
            </div>
          </div>
        ))}
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

