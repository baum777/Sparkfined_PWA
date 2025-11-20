import React from 'react';
import type { WatchlistRow, WatchlistTrendSnapshot } from '@/store/watchlistStore';

interface WatchlistTableProps {
  rows: ReadonlyArray<WatchlistRow>;
  activeSymbol?: string;
  trends?: Record<string, WatchlistTrendSnapshot>;
  onSelect?: (symbol: string) => void;
}

export default function WatchlistTable({ rows, activeSymbol, trends, onSelect }: WatchlistTableProps) {
  return (
    <div className="rounded-2xl border border-border-moderate bg-surface">
      <div className="hidden grid-cols-[1.1fr_1.4fr_minmax(0,1fr)_minmax(0,1fr)_minmax(0,120px)] px-6 py-3 text-xs font-semibold uppercase tracking-[0.3em] text-text-tertiary sm:grid">
        <span>Symbol</span>
        <span>Name</span>
        <span>Price</span>
        <span>24h change</span>
        <span>Session</span>
      </div>
      <div className="divide-y divide-border-subtle">
        {rows.map((row) => {
          const isActive = activeSymbol === row.symbol;
          const hasTrend = Boolean(trends?.[row.symbol]);
          return (
            <div
              key={`${row.symbol}-${row.session}`}
              onClick={() => onSelect?.(row.symbol)}
              className={`flex flex-col gap-4 px-4 py-4 text-sm text-text-secondary transition sm:grid sm:grid-cols-[1.1fr_1.4fr_minmax(0,1fr)_minmax(0,1fr)_minmax(0,120px)] sm:items-center sm:gap-6 sm:px-6 ${
                isActive
                  ? 'cursor-pointer border-l-4 border-sentiment-bull-border bg-interactive-active'
                  : 'cursor-pointer hover:bg-interactive-hover'
              }`}
            >
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-text-tertiary sm:hidden">Symbol</p>
                <div className="flex items-center gap-2">
                  <p className="text-base font-semibold text-text-primary">{row.symbol}</p>
                  {hasTrend ? <span className="h-2 w-2 rounded-full bg-sentiment-bull" aria-label="Trend present" /> : null}
                </div>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-text-tertiary sm:hidden">Name</p>
                <p className="font-medium text-text-primary">{row.name}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-text-tertiary sm:hidden">Price</p>
                <p className="text-lg font-semibold text-amber-200">{row.price}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-text-tertiary sm:hidden">24h change</p>
                <p className={`font-semibold ${getChangeAccent(row.change24h)}`}>{row.change24h}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-text-tertiary sm:hidden">Session</p>
                <span className="inline-flex items-center rounded-full border border-border-moderate bg-surface-skeleton px-3 py-1 text-xs font-semibold uppercase tracking-wide text-text-primary">
                  {row.session}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getChangeAccent(change: string) {
  const trimmed = change.trim();

  if (trimmed.startsWith('-')) {
    return 'text-sentiment-bear';
  }

  if (trimmed.startsWith('+')) {
    return 'text-sentiment-bull';
  }

  return 'text-text-secondary';
}

