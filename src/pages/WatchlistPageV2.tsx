import React from 'react';
import WatchlistLayout from '@/components/watchlist/WatchlistLayout';
import WatchlistTable from '@/components/watchlist/WatchlistTable';
import { useWatchlistStore } from '@/store/watchlistStore';

export default function WatchlistPageV2() {
  const rows = useWatchlistStore((state) => state.rows);
  const assetCount = rows.length;
  const headerDescription = `${assetCount} assets watched \u00b7 Quickly scan risk, momentum and context`;

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
          <WatchlistTable rows={rows} />
        </WatchlistLayout>
      </div>
    </div>
  );
}

