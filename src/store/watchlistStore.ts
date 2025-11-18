import { create } from 'zustand';
import type { WatchlistQuote } from '@/features/market/watchlistData';

export type WatchlistRow = {
  symbol: string;
  name: string;
  price: string;
  change24h: string;
  session: string;
};

interface WatchlistState {
  rows: WatchlistRow[];
  isLoading: boolean;
  error: string | null;
  setRows: (rows: WatchlistRow[]) => void;
  setLoading: (value: boolean) => void;
  setError: (message: string | null) => void;
  hydrateFromQuotes: (quotes: WatchlistQuote[]) => void;
}

const INITIAL_ROWS: WatchlistRow[] = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', price: '$43,280', change24h: '+2.4%', session: 'London' },
  { symbol: 'ETHUSDT', name: 'Ethereum', price: '$2,320', change24h: '+1.1%', session: 'NY' },
  { symbol: 'SOLUSDT', name: 'Solana', price: '$98.42', change24h: '-0.8%', session: 'Asia' },
  { symbol: 'OPUSDT', name: 'Optimism', price: '$3.12', change24h: '+5.6%', session: 'London' },
  { symbol: 'LINKUSDT', name: 'Chainlink', price: '$19.44', change24h: '-1.5%', session: 'NY' },
  { symbol: 'ARBUSDT', name: 'Arbitrum', price: '$1.98', change24h: '+0.4%', session: 'NY' },
  { symbol: 'TIAUSDT', name: 'Celestia', price: '$13.55', change24h: '+4.9%', session: 'Asia' },
];

const USD_INTEGER_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

const USD_STANDARD_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const USD_LOW_FORMATTER = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 4,
  maximumFractionDigits: 4,
});

export const useWatchlistStore = create<WatchlistState>((set) => ({
  rows: INITIAL_ROWS,
  isLoading: false,
  error: null,
  setRows: (rows) => set({ rows }),
  setLoading: (value) => set({ isLoading: value }),
  setError: (message) => set({ error: message }),
  hydrateFromQuotes: (quotes) =>
    set((state) => {
      if (!quotes.length) {
        return state;
      }

      const quoteMap = new Map(quotes.map((quote) => [quote.symbol.toUpperCase(), quote]));
      const rows = state.rows.map((row) => {
        const quote = quoteMap.get(row.symbol.toUpperCase());
        if (!quote) {
          // Fallback: preserve the last known mock value if a provider misses the symbol.
          return row;
        }

        return {
          ...row,
          price: formatPrice(quote.price),
          change24h: formatChange(quote.change24hPct),
        };
      });

      return { rows };
    }),
}));

function formatPrice(value: number): string {
  if (!Number.isFinite(value) || value <= 0) {
    return '—';
  }

  if (value >= 1000) {
    return USD_INTEGER_FORMATTER.format(value);
  }

  if (value >= 1) {
    return USD_STANDARD_FORMATTER.format(value);
  }

  return USD_LOW_FORMATTER.format(value);
}

function formatChange(value: number): string {
  if (!Number.isFinite(value)) {
    return '+0.0%';
  }

  const fixed = value.toFixed(1);
  return `${value >= 0 ? '+' : ''}${fixed}%`;
}

