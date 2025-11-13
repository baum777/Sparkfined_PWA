/**
 * Tests for useBoardKPIs Hook
 *
 * Tests:
 * - Initial data fetch
 * - Loading/Error states
 * - Manual refresh
 * - Auto-refresh interval
 * - Request cancellation
 * - Cleanup on unmount
 */

import { renderHook, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import useBoardKPIs from '../useBoardKPIs';

describe('useBoardKPIs', () => {
  let fetchMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    // Mock fetch
    fetchMock = vi.fn();
    global.fetch = fetchMock;
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('fetches KPIs on mount and sets loading state correctly', async () => {
    const mockData = {
      ok: true,
      data: [
        { id: '1', label: 'Active Alerts', value: 5, type: 'count', icon: 'alert' },
        { id: '2', label: 'Win Rate', value: '67.5%', type: 'numeric', icon: 'chart' },
      ],
      timestamp: Date.now(),
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useBoardKPIs());

    // Initially loading
    expect(result.current.loading).toBe(true);
    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe(null);

    // Wait for fetch to complete
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    // Verify data was loaded
    expect(result.current.data).toEqual(mockData.data);
    expect(result.current.lastUpdated).toBe(mockData.timestamp);
    expect(result.current.error).toBe(null);
    expect(fetchMock).toHaveBeenCalledWith('/api/board/kpis', expect.any(Object));
  });

  it('handles fetch errors gracefully', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useBoardKPIs());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toBe(null);
    expect(result.current.error).toBe('Network error');
  });

  it('handles HTTP error responses', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const { result } = renderHook(() => useBoardKPIs());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toContain('HTTP 500');
  });

  it('handles API error responses (ok: false)', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: false, data: [] }),
    });

    const { result } = renderHook(() => useBoardKPIs());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Failed to fetch KPIs');
  });

  it('supports manual refresh', async () => {
    const mockData1 = {
      ok: true,
      data: [{ id: '1', label: 'Test', value: 1, type: 'count' }],
      timestamp: 1000,
    };

    const mockData2 = {
      ok: true,
      data: [{ id: '1', label: 'Test', value: 2, type: 'count' }],
      timestamp: 2000,
    };

    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => mockData1 })
      .mockResolvedValueOnce({ ok: true, json: async () => mockData2 });

    const { result } = renderHook(() => useBoardKPIs({ autoRefresh: false }));

    // Wait for initial fetch
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.data).toEqual(mockData1.data);
    expect(result.current.lastUpdated).toBe(1000);

    // Manual refresh
    await result.current.refresh();

    await waitFor(() => {
      expect(result.current.data).toEqual(mockData2.data);
    });

    expect(result.current.lastUpdated).toBe(2000);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('auto-refreshes at specified interval', async () => {
    const mockData = {
      ok: true,
      data: [{ id: '1', label: 'Test', value: 1, type: 'count' }],
      timestamp: Date.now(),
    };

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    renderHook(() => useBoardKPIs({ autoRefresh: true, refreshInterval: 5000 }));

    // Wait for initial fetch
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    // Advance timers by 5 seconds
    vi.advanceTimersByTime(5000);

    // Should have fetched again
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    // Advance timers by another 5 seconds
    vi.advanceTimersByTime(5000);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(3);
    });
  });

  it('does not auto-refresh when autoRefresh is false', async () => {
    const mockData = {
      ok: true,
      data: [{ id: '1', label: 'Test', value: 1, type: 'count' }],
      timestamp: Date.now(),
    };

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    renderHook(() => useBoardKPIs({ autoRefresh: false }));

    // Wait for initial fetch
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    // Advance timers by 30 seconds
    vi.advanceTimersByTime(30000);

    // Should NOT have fetched again
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('does not fetch when enabled is false', async () => {
    const mockData = {
      ok: true,
      data: [{ id: '1', label: 'Test', value: 1, type: 'count' }],
      timestamp: Date.now(),
    };

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const { result } = renderHook(() => useBoardKPIs({ enabled: false }));

    // Should not fetch
    expect(fetchMock).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(true); // Stays in initial state
    expect(result.current.data).toBe(null);
  });

  it('cancels pending requests when unmounted', async () => {
    const abortController = new AbortController();
    const abortSpy = vi.spyOn(abortController, 'abort');

    // Mock AbortController
    global.AbortController = vi.fn(() => abortController) as any;

    fetchMock.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ ok: true, json: async () => ({}) }), 1000);
        })
    );

    const { unmount } = renderHook(() => useBoardKPIs());

    // Unmount before fetch completes
    unmount();

    expect(abortSpy).toHaveBeenCalled();
  });

  it('clears interval on unmount', async () => {
    const mockData = {
      ok: true,
      data: [{ id: '1', label: 'Test', value: 1, type: 'count' }],
      timestamp: Date.now(),
    };

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => mockData,
    });

    const { unmount } = renderHook(() =>
      useBoardKPIs({ autoRefresh: true, refreshInterval: 5000 })
    );

    // Wait for initial fetch
    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    // Unmount
    unmount();

    // Advance timers - should NOT trigger fetch
    vi.advanceTimersByTime(10000);

    // Should still be only 1 call (from initial fetch)
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
