import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { notifyContextChange } from "@/lib/handbook/handbookContext";
import type { WatchlistItem } from './types';

const STORAGE_KEY = "sparkfined_watchlist";

const MOCK_WATCHLIST: WatchlistItem[] = [
  {
    id: '1',
    symbol: 'BTC',
    name: 'Bitcoin',
    trend: 'bullish',
    relevance: 85,
    addedAt: new Date('2024-01-15'),
  },
  {
    id: '2',
    symbol: 'ETH',
    name: 'Ethereum',
    trend: 'neutral',
    relevance: 72,
    addedAt: new Date('2024-01-18'),
  },
  {
    id: '3',
    symbol: 'SOL',
    name: 'Solana',
    trend: 'bearish',
    addedAt: new Date('2024-01-20'),
  },
];

// Load initial data from localStorage or use mock
function loadWatchlist(): WatchlistItem[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      // Convert date strings back to Date objects
      return parsed.map((item: WatchlistItem) => ({
        ...item,
        addedAt: new Date(item.addedAt),
      }));
    }
  } catch {
    // Ignore parse errors
  }
  // Return mock and persist it
  saveWatchlist(MOCK_WATCHLIST);
  return MOCK_WATCHLIST;
}

function saveWatchlist(items: WatchlistItem[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    notifyContextChange();
  } catch {
    // Ignore storage errors
  }
}

export function useWatchlist() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<WatchlistItem[]>(() => loadWatchlist());
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Persist whenever items change
  useEffect(() => {
    saveWatchlist(items);
  }, [items]);

  // Sync selected from URL on mount only
  useEffect(() => {
    const urlSelected = searchParams.get('selected');
    if (urlSelected) {
      const found = items.find((item) => item.symbol === urlSelected);
      if (found) {
        setSelectedId(found.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selectItem = useCallback(
    (id: string | null) => {
      setSelectedId(id);
      const item = id ? items.find((i) => i.id === id) : null;
      if (item) {
        setSearchParams({ selected: item.symbol }, { replace: true });
      } else {
        setSearchParams({}, { replace: true });
      }
    },
    [items, setSearchParams]
  );

  const addItem = useCallback((symbol: string, name?: string) => {
    const newItem: WatchlistItem = {
      id: crypto.randomUUID(),
      symbol: symbol.toUpperCase(),
      name: name || symbol.toUpperCase(),
      addedAt: new Date(),
    };
    setItems((prev) => [...prev, newItem]);
  }, []);

  const removeItem = useCallback(
    (id: string) => {
      setItems((prev) => prev.filter((item) => item.id !== id));
      if (selectedId === id) {
        selectItem(null);
      }
    },
    [selectedId, selectItem]
  );

  const selectedItem = selectedId ? items.find((i) => i.id === selectedId) : null;

  return {
    items,
    selectedId,
    selectedItem,
    selectItem,
    addItem,
    removeItem,
  };
}
