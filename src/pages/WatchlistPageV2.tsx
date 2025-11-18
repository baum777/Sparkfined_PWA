import React from 'react';
import WatchlistLayout from '@/components/watchlist/WatchlistLayout';
import WatchlistTable from '@/components/watchlist/WatchlistTable';
import WatchlistDetailPanel from '@/components/watchlist/WatchlistDetailPanel';
import { useWatchlistStore } from '@/store/watchlistStore';
import type { WatchlistRow } from '@/store/watchlistStore';

type SessionFilter = 'all' | 'London' | 'NY' | 'Asia';
type SortMode = 'default' | 'top-movers';

export default function WatchlistPageV2() {
  const rows = useWatchlistStore((state) => state.rows);
  const [sessionFilter, setSessionFilter] = React.useState<SessionFilter>('all');
  const [sortMode, setSortMode] = React.useState<SortMode>('default');
  const [activeSymbol, setActiveSymbol] = React.useState<string | undefined>(undefined);
  const assetCount = rows.length;
  const headerDescription = `${assetCount} assets watched \u00b7 Quickly scan risk, momentum and context`;
  const visibleRows = React.useMemo(() => {
    const filteredRows =
      sessionFilter === 'all' ? rows : rows.filter((row) => row.session === sessionFilter);

    if (sortMode === 'default') {
      return filteredRows;
    }

    return [...filteredRows].sort((a, b) => getAbsChange(b) - getAbsChange(a));
  }, [rows, sessionFilter, sortMode]);
  const activeRow = React.useMemo(
    () => rows.find((row) => row.symbol === activeSymbol),
    [rows, activeSymbol]
  );

  return (
    <div className="min-h-screen bg-[#050505] text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <header className="mb-10 space-y-3">
          <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">Market radar</p>
          <div>
            <h1 className="text-4xl font-semibold text-white">Watchlist</h1>
            <p className="mt-2 text-sm text-zinc-400">{headerDescription}</p>
          </div>
        </header>

        <WatchlistLayout
          title="Watchlist"
          subtitle="Monitor key assets, spot shifts in market tone and keep your edge synced."
        >
          <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm">
                <div className="flex flex-wrap items-center gap-2">
                  {SESSION_FILTERS.map((filter) => {
                    const isActive = sessionFilter === filter;
                    return (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setSessionFilter(filter)}
                        className={`rounded-full border px-3 py-1 font-semibold transition ${
                          isActive
                            ? 'border-white/30 bg-white/10 text-white'
                            : 'border-white/10 text-white/60 hover:bg-white/5'
                        }`}
                      >
                        {filter === 'all' ? 'All' : filter}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setSortMode((prev) => (prev === 'default' ? 'top-movers' : 'default'))}
                  className="rounded-full border border-white/10 px-3 py-1 font-semibold text-white/80 transition hover:border-white/30 hover:text-white"
                >
                  Order: {sortMode === 'default' ? 'Default' : 'Top movers'}
                </button>
              </div>
              <WatchlistTable rows={visibleRows} activeSymbol={activeSymbol} onSelect={setActiveSymbol} />
            </div>
            <WatchlistDetailPanel row={activeRow} />
          </div>
        </WatchlistLayout>
      </div>
    </div>
  );
}

const SESSION_FILTERS: SessionFilter[] = ['all', 'London', 'NY', 'Asia'];

function getAbsChange(row: WatchlistRow) {
  return Math.abs(parseFloat(row.change24h));
}

