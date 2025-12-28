import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type {
  BoardChartSnapshot,
  ChartFetchStatus,
  ChartIndicatorOverlay,
  ChartMode,
  ChartTimeframe,
  ChartViewState,
  OhlcCandle,
} from '@/domain/chart'
import { getChartSnapshot, isSnapshotFresh, pruneOldChartSnapshots, putChartSnapshot } from '@/db/chartSnapshots'
import type { CandleDTO } from '@/api/marketData'
import { getCandles } from '@/api/marketData'

export type ChartDataSource = 'cache' | 'network'

type UseOhlcDataParams = {
  address: string
  symbol: string
  timeframe: ChartTimeframe
  network?: string
  freshnessMs?: number
}

type UseOhlcDataState = {
  candles: OhlcCandle[]
  status: ChartFetchStatus
  source: ChartDataSource
  error?: string
  lastUpdatedAt?: number
  viewState: ChartViewState
  hasData: boolean
  indicators?: ChartIndicatorOverlay[]
}

const DEFAULT_VISUAL = {
  showVolume: true,
  showGrid: false,
  candleStyle: 'candle' as const,
}

function createDefaultViewState(timeframe: ChartTimeframe, mode: ChartMode = 'live'): ChartViewState {
  return {
    timeframe,
    mode,
    playbackSpeed: 1,
    indicators: {},
    visual: { ...DEFAULT_VISUAL },
  }
}

function mapCandles(raw: CandleDTO[]): OhlcCandle[] {
  return raw.map((candle) => ({
    t: candle.t * 1000,
    o: candle.o,
    h: candle.h,
    l: candle.l,
    c: candle.c,
    v: candle.v,
  }))
}

export function useOhlcData({
  address,
  symbol,
  timeframe,
  network = 'solana',
  freshnessMs = 5 * 60 * 1000,
}: UseOhlcDataParams) {
  const [state, setState] = useState<UseOhlcDataState>(() => ({
    candles: [],
    status: 'idle',
    source: 'network',
    viewState: createDefaultViewState(timeframe),
    hasData: false,
    indicators: [],
  }))
  const viewStateRef = useRef<ChartViewState>(state.viewState)
  const staleSnapshotRef = useRef<BoardChartSnapshot | undefined>(undefined)

  const loadSnapshot = useCallback(async () => {
    if (!address) return undefined

    const snapshot = await getChartSnapshot(address, timeframe)
    if (!snapshot) return undefined

    const fresh = isSnapshotFresh(snapshot, freshnessMs)
    const snapshotStatus: ChartFetchStatus = snapshot.ohlc.length === 0 ? 'no-data' : fresh ? 'success' : 'loading'
    const snapshotViewState = snapshot.viewState ?? createDefaultViewState(timeframe)

    if (fresh) {
      viewStateRef.current = snapshotViewState
      setState({
        candles: snapshot.ohlc,
        status: snapshotStatus,
        source: 'cache',
        lastUpdatedAt: snapshot.metadata.lastFetchedAt,
        error: undefined,
        viewState: snapshotViewState,
        hasData: snapshot.ohlc.length > 0,
        indicators: [],
      })
    } else {
      staleSnapshotRef.current = snapshot
      viewStateRef.current = snapshotViewState
      setState((prev) => ({
        ...prev,
        candles: snapshot.ohlc,
        source: 'cache',
        status: snapshotStatus,
        viewState: snapshotViewState,
        lastUpdatedAt: snapshot.metadata.lastFetchedAt,
        hasData: snapshot.ohlc.length > 0,
      }))
    }

    return snapshot
  }, [address, timeframe, freshnessMs])

  const fetchAndPersist = useCallback(async () => {
    if (!address) return

    setState((prev) => ({ ...prev, status: 'loading', error: undefined }))

    try {
      const candles = await getCandles({ address, symbol, timeframe, network })
      const mapped = mapCandles(candles)
      const snapshot: Omit<BoardChartSnapshot, 'id'> = {
        address,
        symbol,
        timeframe,
        ohlc: mapped,
        viewState: viewStateRef.current ?? createDefaultViewState(timeframe),
        metadata: {
          createdAt: Date.now(),
          lastFetchedAt: Date.now(),
          fetchedFrom: 'dexpaprika',
          candleCount: mapped.length,
        },
      }

      await putChartSnapshot(snapshot)
      await pruneOldChartSnapshots()

      const nextStatus: ChartFetchStatus = mapped.length === 0 ? 'no-data' : 'success'
      setState({
        candles: mapped,
        status: nextStatus,
        source: 'network',
        error: undefined,
        lastUpdatedAt: snapshot.metadata.lastFetchedAt,
        viewState: snapshot.viewState,
        hasData: mapped.length > 0,
        indicators: [],
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch OHLC data'
      const fallback = staleSnapshotRef.current

      if (fallback) {
        const fallbackStatus: ChartFetchStatus = fallback.ohlc.length === 0 ? 'no-data' : 'stale'
        viewStateRef.current = fallback.viewState ?? createDefaultViewState(timeframe)
        setState({
          candles: fallback.ohlc,
          status: fallbackStatus,
          source: 'cache',
          error: message,
          lastUpdatedAt: fallback.metadata.lastFetchedAt,
          viewState: viewStateRef.current,
          hasData: fallback.ohlc.length > 0,
          indicators: [],
        })
        return
      }

      setState((prev) => ({
        ...prev,
        status: 'error',
        error: message,
        hasData: prev.candles.length > 0,
      }))
    }
  }, [address, network, symbol, timeframe])

  useEffect(() => {
    const nextViewState = createDefaultViewState(timeframe)
    viewStateRef.current = nextViewState
    setState((prev) => ({
      ...prev,
      status: 'loading',
      error: undefined,
      source: prev.source ?? 'network',
      viewState: nextViewState,
      hasData: prev.candles.length > 0,
    }))

    loadSnapshot().then((snapshot) => {
      if (!snapshot || !isSnapshotFresh(snapshot, freshnessMs)) {
        fetchAndPersist()
      }
    })
  }, [address, timeframe, loadSnapshot, fetchAndPersist, freshnessMs])

  const refresh = useCallback(() => fetchAndPersist(), [fetchAndPersist])

  return useMemo(
    () => ({
      ...state,
      refresh,
    }),
    [state, refresh]
  )
}

export default useOhlcData
