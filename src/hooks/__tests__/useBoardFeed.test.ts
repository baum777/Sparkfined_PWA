/**
 * Tests for useBoardFeed Hook
 *
 * Tests:
 * - Initial data fetch
 * - Loading/Error states
 * - Pagination (load more)
 * - Type filtering
 * - Manual refresh
 * - Auto-refresh interval
 * - Request cancellation
 * - Cleanup on unmount
 */

import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import useBoardFeed from '../useBoardFeed';

describe('useBoardFeed', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    fetchMock = vi.fn();
    global.fetch = fetchMock;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('fetches feed on mount and sets loading state correctly', async () => {
    const mockData = {
      ok: true,
      data: [
        {
          id: '1',
          type: 'alert',
          text: 'Price alert triggered',
          timestamp: Date.now(),
          unread: true,
        },
        {
          id: '2',
          type: 'journal',
          text: 'New journal entry',
          timestamp: Date.now() - 1000,
          unread: false,
        },
      ],
      total: 50,
      limit: 20,
      offset: 0,
      timestamp: Date.now(),
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useBoardFeed());

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBe(null);

    // Wait for fetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify data was loaded
    expect(result.current.data).toEqual(mockData.data);
    expect(result.current.hasMore).toBe(true); // 2 loaded, 50 total
    expect(result.current.lastUpdated).toBe(mockData.timestamp);
    expect(result.current.error).toBe(null);
  });

  it('handles fetch errors gracefully', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useBoardFeed());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBe('Network error');
  });

  it('handles HTTP error responses', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const { result } = renderHook(() => useBoardFeed());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toContain('HTTP 500');
  });

  it('supports pagination with loadMore', async () => {
    const mockPage1 = {
      ok: true,
      data: [
        { id: '1', type: 'alert', text: 'Event 1', timestamp: Date.now(), unread: true },
        { id: '2', type: 'alert', text: 'Event 2', timestamp: Date.now(), unread: true },
      ],
      total: 4,
      limit: 2,
      offset: 0,
      timestamp: Date.now(),
    };

    const mockPage2 = {
      ok: true,
      data: [
        { id: '3', type: 'alert', text: 'Event 3', timestamp: Date.now(), unread: true },
        { id: '4', type: 'alert', text: 'Event 4', timestamp: Date.now(), unread: true },
      ],
      total: 4,
      limit: 2,
      offset: 2,
      timestamp: Date.now(),
    };

    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => mockPage1 })
      .mockResolvedValueOnce({ ok: true, json: async () => mockPage2 });

    const { result } = renderHook(() => useBoardFeed({ limit: 2, autoRefresh: false }));

    // Wait for initial fetch
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toHaveLength(2);
    expect(result.current.hasMore).toBe(true);

    // Load more
    await result.current.loadMore();

    await waitFor(() => {
      expect(result.current.data).toHaveLength(4);
    });

    expect(result.current.hasMore).toBe(false); // All loaded
    expect(result.current.data.map((e) => e.id)).toEqual(['1', '2', '3', '4']);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('does not load more when hasMore is false', async () => {
    const mockData = {
      ok: true,
      data: [{ id: '1', type: 'alert', text: 'Event 1', timestamp: Date.now(), unread: true }],
      total: 1,
      limit: 20,
      offset: 0,
      timestamp: Date.now(),
    };

    fetchMock.mockResolvedValue({ ok: true, json: async () => mockData });

    const { result } = renderHook(() => useBoardFeed({ autoRefresh: false }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.hasMore).toBe(false);

    // Try to load more
    await result.current.loadMore();

    // Should still be only 1 fetch call
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('filters by type', async () => {
    const mockData = {
      ok: true,
      data: [{ id: '1', type: 'alerts', text: 'Alert', timestamp: Date.now(), unread: true }],
      total: 1,
      limit: 20,
      offset: 0,
      timestamp: Date.now(),
    };

    fetchMock.mockResolvedValue({ ok: true, json: async () => mockData });

    renderHook(() => useBoardFeed({ type: 'alerts', autoRefresh: false }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalled();
    });

    // Verify URL includes type parameter
    const callArgs = fetchMock.mock.calls[0];
    expect(callArgs[0]).toContain('type=alerts');
  });

  it('supports manual refresh', async () => {
    const mockData1 = {
      ok: true,
      data: [{ id: '1', type: 'alert', text: 'Event 1', timestamp: 1000, unread: true }],
      total: 1,
      limit: 20,
      offset: 0,
      timestamp: 1000,
    };

    const mockData2 = {
      ok: true,
      data: [{ id: '2', type: 'alert', text: 'Event 2', timestamp: 2000, unread: true }],
      total: 1,
      limit: 20,
      offset: 0,
      timestamp: 2000,
    };

    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => mockData1 })
      .mockResolvedValueOnce({ ok: true, json: async () => mockData2 });

    const { result } = renderHook(() => useBoardFeed({ autoRefresh: false }));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data[0].id).toBe('1');

    // Manual refresh
    await result.current.refresh();

    await waitFor(() => {
      expect(result.current.data[0].id).toBe('2');
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('auto-refreshes at specified interval', async () => {
    const mockData = {
      ok: true,
      data: [{ id: '1', type: 'alert', text: 'Event', timestamp: Date.now(), unread: true }],
      total: 1,
      limit: 20,
      offset: 0,
      timestamp: Date.now(),
    };

    fetchMock.mockResolvedValue({ ok: true, json: async () => mockData });

    renderHook(() => useBoardFeed({ autoRefresh: true, refreshInterval: 5000 }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    // Advance by 5 seconds
    vi.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    // Advance by another 5 seconds
    vi.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });
  });

  it('does not fetch when enabled is false', async () => {
    const mockData = {
      ok: true,
      data: [{ id: '1', type: 'alert', text: 'Event', timestamp: Date.now(), unread: true }],
      total: 1,
      limit: 20,
      offset: 0,
      timestamp: Date.now(),
    };

    fetchMock.mockResolvedValue({ ok: true, json: async () => mockData });

    const { result } = renderHook(() => useBoardFeed({ enabled: false }));

    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toEqual([]);
  });

  it('clears interval on unmount', async () => {
    const mockData = {
      ok: true,
      data: [{ id: '1', type: 'alert', text: 'Event', timestamp: Date.now(), unread: true }],
      total: 1,
      limit: 20,
      offset: 0,
      timestamp: Date.now(),
    };

    fetchMock.mockResolvedValue({ ok: true, json: async () => mockData });

    const { unmount } = renderHook(() =>
      useBoardFeed({ autoRefresh: true, refreshInterval: 5000 })
    );

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    unmount();

    // Advance timers - should NOT trigger fetch
    vi.advanceTimersByTime(10000);

    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
