import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import WatchlistPage from '@/pages/WatchlistPage';
import { useWatchlistStore } from '@/store/watchlistStore';
import type { WatchlistQuote } from '@/features/market/watchlistData';
import { fetchWatchlistQuotes } from '@/features/market/watchlistData';

vi.mock('@/features/market/watchlistData', () => ({
  fetchWatchlistQuotes: vi.fn(async () => [] as WatchlistQuote[]),
}));

const baseState = useWatchlistStore.getState();
const initialState = {
  ...baseState,
  rows: baseState.rows.map((row) => ({ ...row })),
  trends: {},
  isLoading: false,
  error: null,
};

const resetWatchlistState = () => {
  useWatchlistStore.setState(initialState, true);
};

describe('WatchlistPage', () => {
  beforeEach(() => {
    resetWatchlistState();
    vi.clearAllMocks();
  });

  it('hydrates quotes only once per watchlist composition', async () => {
    render(
      <React.StrictMode>
        <MemoryRouter initialEntries={['/watchlist']}>
          <WatchlistPage />
        </MemoryRouter>
      </React.StrictMode>
    );

    await screen.findByTestId('watchlist-page');
    await waitFor(() => expect(fetchWatchlistQuotes).toHaveBeenCalledTimes(1));
  });
});
