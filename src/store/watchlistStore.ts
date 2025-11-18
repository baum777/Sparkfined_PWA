import { create } from 'zustand';

export type WatchlistRow = {
  symbol: string;
  name: string;
  price: string;
  change24h: string;
  session: string;
};

interface WatchlistState {
  rows: WatchlistRow[];
  setRows: (rows: WatchlistRow[]) => void;
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

export const useWatchlistStore = create<WatchlistState>((set) => ({
  rows: INITIAL_ROWS,
  setRows: (rows) => set({ rows }),
}));

