import React from 'react';
import WatchlistLayout from '@/components/watchlist/WatchlistLayout';
import WatchlistTable, { WatchlistTableRow } from '@/components/watchlist/WatchlistTable';

const mockWatchlistRows: WatchlistTableRow[] = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', price: '$43,280', change24h: '+2.4%', session: 'London' },
  { symbol: 'ETHUSDT', name: 'Ethereum', price: '$2,320', change24h: '+1.1%', session: 'NY' },
  { symbol: 'SOLUSDT', name: 'Solana', price: '$98.42', change24h: '-0.8%', session: 'Asia' },
  { symbol: 'OPUSDT', name: 'Optimism', price: '$3.12', change24h: '+5.6%', session: 'London' },
  { symbol: 'LINKUSDT', name: 'Chainlink', price: '$19.44', change24h: '-1.5%', session: 'NY' },
  { symbol: 'ARBUSDT', name: 'Arbitrum', price: '$1.98', change24h: '+0.4%', session: 'NY' },
  { symbol: 'TIAUSDT', name: 'Celestia', price: '$13.55', change24h: '+4.9%', session: 'Asia' },
] as const;

export default function WatchlistPageV2() {
  const assetCount = mockWatchlistRows.length;
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
          <WatchlistTable rows={mockWatchlistRows} />
        </WatchlistLayout>
      </div>
    </div>
  );
}

