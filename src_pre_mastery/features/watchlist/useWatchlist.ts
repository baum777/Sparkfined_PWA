import { useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { WatchlistItem, TrendDirection } from './types';

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

export function useWatchlist() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<WatchlistItem[]>(MOCK_WATCHLIST);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Sync selected from URL on mount only (empty deps = no loops)
  // One-way read: URL → state on initial load; state → URL on user selection
  useEffect(() => {
    const urlSelected = searchParams.get('selected');
    if (urlSelected) {
      const found = items.find((item) => item.symbol === urlSelected);
      if (found) {
        setSelectedId(found.id);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Intentionally empty: read URL once on mount to avoid loops

  // Update URL when selection changes
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
