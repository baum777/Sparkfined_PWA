import { renderHook, waitFor } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import type { BoardChartSnapshot } from '@/domain/chart'
import { useOhlcData } from '@/hooks/useOhlcData'
import {
  getChartSnapshot,
  putChartSnapshot,
  isSnapshotFresh,
  pruneOldChartSnapshots,
} from '@/db/chartSnapshots'
import { getCandles } from '@/api/marketData'

vi.mock('@/db/chartSnapshots', () => ({
  getChartSnapshot: vi.fn(),
  putChartSnapshot: vi.fn(),
  isSnapshotFresh: vi.fn(),
  pruneOldChartSnapshots: vi.fn(),
}))

vi.mock('@/api/marketData', () => ({
  getCandles: vi.fn(),
}))

const mockSnapshot = (overrides?: Partial<BoardChartSnapshot>): BoardChartSnapshot => ({
  id: 1,
  address: 'addr',
  symbol: 'SYM',
  timeframe: '15m',
  ohlc: [
    { t: 1, o: 1, h: 2, l: 0.5, c: 1.5, v: 10 },
    { t: 2, o: 1.5, h: 2.5, l: 1, c: 2, v: 12 },
  ],
  viewState: {
    timeframe: '15m',
    indicators: {},
    visual: { showVolume: true, showGrid: false, candleStyle: 'candle' },
  },
  metadata: {
    createdAt: Date.now() - 1000,
    lastFetchedAt: Date.now() - 1000,
    fetchedFrom: 'cache',
    candleCount: 2,
  },
  ...overrides,
})

describe('useOhlcData', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns cached snapshot when fresh without fetching network', async () => {
    const snapshot = mockSnapshot()
    vi.mocked(getChartSnapshot).mockResolvedValueOnce(snapshot)
    vi.mocked(isSnapshotFresh).mockReturnValue(true)

    const { result } = renderHook(() =>
      useOhlcData({ address: 'addr', symbol: 'SYM', timeframe: '15m', network: 'solana' })
    )

    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(result.current.source).toBe('cache')
    expect(result.current.hasData).toBe(true)
    expect(getCandles).not.toHaveBeenCalled()
  })

  it('fetches network when no snapshot and stores it', async () => {
    vi.mocked(getChartSnapshot).mockResolvedValueOnce(undefined)
    vi.mocked(isSnapshotFresh).mockReturnValue(false)
    vi.mocked(getCandles).mockResolvedValueOnce([
      { t: 1, o: 1, h: 2, l: 0.5, c: 1.5, v: 10 },
    ])

    const { result } = renderHook(() =>
      useOhlcData({ address: 'addr', symbol: 'SYM', timeframe: '15m', network: 'solana' })
    )

    await waitFor(() => expect(result.current.status).toBe('success'))
    expect(result.current.source).toBe('network')
    expect(vi.mocked(putChartSnapshot)).toHaveBeenCalled()
    expect(vi.mocked(pruneOldChartSnapshots)).toHaveBeenCalled()
  })

  it('marks no-data when fetch succeeds with empty payload', async () => {
    vi.mocked(getChartSnapshot).mockResolvedValueOnce(undefined)
    vi.mocked(isSnapshotFresh).mockReturnValue(false)
    vi.mocked(getCandles).mockResolvedValueOnce([])

    const { result } = renderHook(() =>
      useOhlcData({ address: 'addr', symbol: 'SYM', timeframe: '15m', network: 'solana' })
    )

    await waitFor(() => expect(result.current.status).toBe('no-data'))
    expect(result.current.hasData).toBe(false)
    expect(result.current.source).toBe('network')
  })

  it('falls back to stale snapshot on network error', async () => {
    const snapshot = mockSnapshot({ metadata: { ...mockSnapshot().metadata, lastFetchedAt: Date.now() - 10_000 } })
    vi.mocked(getChartSnapshot).mockResolvedValueOnce(snapshot)
    vi.mocked(isSnapshotFresh).mockReturnValue(false)
    vi.mocked(getCandles).mockRejectedValueOnce(new Error('network down'))

    const { result } = renderHook(() =>
      useOhlcData({ address: 'addr', symbol: 'SYM', timeframe: '15m', network: 'solana' })
    )

    await waitFor(() => expect(result.current.status).toBe('stale'))
    expect(result.current.candles).toEqual(snapshot.ohlc)
    expect(result.current.hasData).toBe(true)
  })

  it('surfaces no-data from stale snapshot when network fails and snapshot empty', async () => {
    const snapshot = mockSnapshot({ ohlc: [], metadata: { ...mockSnapshot().metadata, lastFetchedAt: Date.now() - 10_000 } })
    vi.mocked(getChartSnapshot).mockResolvedValueOnce(snapshot)
    vi.mocked(isSnapshotFresh).mockReturnValue(false)
    vi.mocked(getCandles).mockRejectedValueOnce(new Error('network down'))

    const { result } = renderHook(() =>
      useOhlcData({ address: 'addr', symbol: 'SYM', timeframe: '15m', network: 'solana' })
    )

    await waitFor(() => expect(result.current.status).toBe('no-data'))
    expect(result.current.candles).toEqual([])
    expect(result.current.hasData).toBe(false)
  })
})
