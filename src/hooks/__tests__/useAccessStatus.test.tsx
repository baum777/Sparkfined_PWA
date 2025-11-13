/**
 * Tests for useAccessStatus Hook & AccessProvider
 *
 * Tests:
 * - Provider context availability
 * - Wallet connection/disconnection
 * - Access status checking
 * - Error handling
 * - LocalStorage caching
 * - Auto-refresh
 * - Timeout handling
 */

import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { AccessProvider, useAccessStatus } from '../../store/AccessProvider';
import React from 'react';

describe('useAccessStatus', () => {
  let fetchMock: ReturnType<typeof vi.fn>;
  let localStorageMock: Record<string, string> = {};

  beforeEach(() => {
    // Mock fetch
    fetchMock = vi.fn();
    global.fetch = fetchMock;

    // Mock localStorage
    localStorageMock = {};
    global.localStorage = {
      getItem: vi.fn((key) => localStorageMock[key] || null),
      setItem: vi.fn((key, value) => {
        localStorageMock[key] = value;
      }),
      removeItem: vi.fn((key) => {
        delete localStorageMock[key];
      }),
      clear: vi.fn(() => {
        localStorageMock = {};
      }),
      length: 0,
      key: vi.fn(),
    } as Storage;

    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <AccessProvider>{children}</AccessProvider>
  );

  it('throws error when used outside AccessProvider', () => {
    // Suppress console.error for this test
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useAccessStatus());
    }).toThrow('useAccessStatus must be used within AccessProvider');

    consoleError.mockRestore();
  });

  it('provides initial state when rendered', () => {
    const { result } = renderHook(() => useAccessStatus(), { wrapper });

    expect(result.current.status).toBe('none');
    expect(result.current.details).toBe(null);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBe(null);
    expect(result.current.walletConnected).toBe(false);
    expect(result.current.walletAddress).toBe(null);
  });

  it('connects wallet and checks status', async () => {
    const mockResponse = {
      status: 'alpha',
      details: {
        rank: 42,
        nftMint: 'NFT123',
        tokenBalance: 1000,
        note: 'Test user',
      },
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useAccessStatus(), { wrapper });

    await act(async () => {
      await result.current.connectWallet();
    });

    await waitFor(() => {
      expect(result.current.walletConnected).toBe(true);
    });

    expect(result.current.walletAddress).toBeTruthy();
    expect(result.current.status).toBe('alpha');
    expect(result.current.details?.rank).toBe(42);
    expect(result.current.details?.nftMint).toBe('NFT123');
    expect(result.current.details?.hasNFT).toBe(true);
  });

  it('disconnects wallet and clears state', async () => {
    const mockResponse = {
      status: 'alpha',
      details: {
        rank: 1,
        nftMint: 'NFT123',
        tokenBalance: 1000,
      },
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useAccessStatus(), { wrapper });

    // Connect wallet
    await act(async () => {
      await result.current.connectWallet();
    });

    await waitFor(() => {
      expect(result.current.walletConnected).toBe(true);
    });

    // Disconnect wallet
    act(() => {
      result.current.disconnectWallet();
    });

    expect(result.current.walletConnected).toBe(false);
    expect(result.current.walletAddress).toBe(null);
    expect(result.current.status).toBe('none');
    expect(result.current.details).toBe(null);
    expect(localStorage.removeItem).toHaveBeenCalledWith('sparkfiend_access_status');
  });

  it('handles 404 response gracefully', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 404,
      statusText: 'Not Found',
    });

    const { result } = renderHook(() => useAccessStatus(), { wrapper });

    await act(async () => {
      await result.current.checkStatus('test-wallet');
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.status).toBe('none');
    expect(result.current.details).toBe(null);
    expect(result.current.error).toBe(null);
  });

  it('handles HTTP error responses', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'Internal Server Error',
    });

    const { result } = renderHook(() => useAccessStatus(), { wrapper });

    await act(async () => {
      await result.current.checkStatus('test-wallet');
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toContain('HTTP 500');
  });

  it('handles network errors', async () => {
    fetchMock.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useAccessStatus(), { wrapper });

    await act(async () => {
      await result.current.checkStatus('test-wallet');
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBe('Network error');
  });

  it('handles request timeout', async () => {
    const abortError = new Error('Aborted');
    abortError.name = 'AbortError';

    fetchMock.mockRejectedValueOnce(abortError);

    const { result } = renderHook(() => useAccessStatus(), { wrapper });

    await act(async () => {
      await result.current.checkStatus('test-wallet');
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toContain('timeout');
  });

  it('saves status to localStorage after successful check', async () => {
    const mockResponse = {
      status: 'alpha',
      details: {
        rank: 1,
        nftMint: 'NFT123',
        tokenBalance: 1000,
      },
    };

    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useAccessStatus(), { wrapper });

    await act(async () => {
      await result.current.checkStatus('test-wallet');
    });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(localStorage.setItem).toHaveBeenCalledWith(
      'sparkfiend_access_status',
      expect.stringContaining('alpha')
    );
  });

  it('loads cached status from localStorage on mount', () => {
    const cachedData = {
      status: 'alpha',
      details: {
        status: 'alpha',
        rank: 42,
        nftMint: 'NFT123',
        tokenBalance: 1000,
        hasNFT: true,
        meetsHoldRequirement: true,
        note: null,
      },
      timestamp: Date.now() - 1000, // 1 second ago
    };

    localStorageMock['sparkfiend_access_status'] = JSON.stringify(cachedData);

    const { result } = renderHook(() => useAccessStatus(), { wrapper });

    expect(result.current.status).toBe('alpha');
    expect(result.current.details?.rank).toBe(42);
  });

  it('ignores stale cache beyond grace period', () => {
    const staleData = {
      status: 'alpha',
      details: { rank: 42 },
      timestamp: Date.now() - 25 * 60 * 60 * 1000, // 25 hours ago (beyond grace period)
    };

    localStorageMock['sparkfiend_access_status'] = JSON.stringify(staleData);

    const { result } = renderHook(() => useAccessStatus(), { wrapper });

    expect(result.current.status).toBe('none');
    expect(localStorage.removeItem).toHaveBeenCalledWith('sparkfiend_access_status');
  });

  it('handles corrupted localStorage data', () => {
    localStorageMock['sparkfiend_access_status'] = 'invalid-json{';

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useAccessStatus(), { wrapper });

    expect(result.current.status).toBe('none');
    expect(localStorage.removeItem).toHaveBeenCalledWith('sparkfiend_access_status');

    consoleError.mockRestore();
  });

  it('refreshes status for connected wallet', async () => {
    const mockResponse1 = {
      status: 'alpha',
      details: { rank: 1, tokenBalance: 1000 },
    };

    const mockResponse2 = {
      status: 'alpha',
      details: { rank: 2, tokenBalance: 2000 },
    };

    fetchMock
      .mockResolvedValueOnce({ ok: true, json: async () => mockResponse1 })
      .mockResolvedValueOnce({ ok: true, json: async () => mockResponse2 });

    const { result } = renderHook(() => useAccessStatus(), { wrapper });

    // Connect wallet
    await act(async () => {
      await result.current.connectWallet();
    });

    await waitFor(() => {
      expect(result.current.details?.rank).toBe(1);
    });

    // Refresh
    await act(async () => {
      await result.current.refresh();
    });

    await waitFor(() => {
      expect(result.current.details?.rank).toBe(2);
    });

    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('warns when refreshing without connected wallet', async () => {
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const { result } = renderHook(() => useAccessStatus(), { wrapper });

    await act(async () => {
      await result.current.refresh();
    });

    expect(consoleWarn).toHaveBeenCalledWith('No wallet connected, cannot refresh');

    consoleWarn.mockRestore();
  });

  it('auto-refreshes every 5 minutes when wallet connected', async () => {
    const mockResponse = {
      status: 'alpha',
      details: { rank: 1, tokenBalance: 1000 },
    };

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useAccessStatus(), { wrapper });

    // Connect wallet
    await act(async () => {
      await result.current.connectWallet();
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    // Advance time by 5 minutes
    act(() => {
      vi.advanceTimersByTime(5 * 60 * 1000);
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });
  });

  it('clears auto-refresh interval when wallet disconnected', async () => {
    const mockResponse = {
      status: 'alpha',
      details: { rank: 1, tokenBalance: 1000 },
    };

    fetchMock.mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const { result } = renderHook(() => useAccessStatus(), { wrapper });

    // Connect wallet
    await act(async () => {
      await result.current.connectWallet();
    });

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    // Disconnect
    act(() => {
      result.current.disconnectWallet();
    });

    // Advance time - should NOT trigger refresh
    act(() => {
      vi.advanceTimersByTime(10 * 60 * 1000);
    });

    // Still only 1 call (from connect)
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });
});
