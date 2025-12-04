import React, { useEffect, useMemo, useRef } from 'react'
import type {
  CandlestickData,
  CandlestickSeriesOptions,
  HistogramData,
  IChartApi,
  ISeriesApi,
  UTCTimestamp,
  SeriesMarkerShape,
  SeriesMarker,
  Time,
  CrosshairMode as CrosshairModeType,
} from 'lightweight-charts'
import type {
  ChartAnnotation,
  ChartFetchStatus,
  ComputedIndicator,
  ChartViewState,
  OhlcCandle,
} from '@/domain/chart'
import type { ChartDataSource } from '@/hooks/useOhlcData'

export type AdvancedChartProps = {
  candles: OhlcCandle[]
  status: ChartFetchStatus
  source: ChartDataSource
  viewState: ChartViewState
  onViewStateChange?: (next: ChartViewState) => void
  error?: string
  replayLabel?: string
  lastUpdatedAt?: number
  indicators?: ComputedIndicator[]
  annotations?: ChartAnnotation[]
  onAnnotationClick?: (annotation: ChartAnnotation) => void
  onCreateJournalAtPoint?: (payload: { price: number; time: number }) => void
  onCreateAlertAtPoint?: (payload: { price: number; time: number }) => void
  testId?: string
}

// Chart options (crosshair mode will be set dynamically after chart lib loads)
const getChartOptions = (crosshairMode: CrosshairModeType) => ({
  layout: {
    background: { color: '#0b1221' },
    textColor: '#d3d8e8',
  },
  grid: {
    vertLines: { color: '#1c2435' },
    horzLines: { color: '#1c2435' },
  },
  crosshair: {
    mode: crosshairMode,
  },
  rightPriceScale: {
    borderColor: '#293247',
  },
  timeScale: {
    borderColor: '#293247',
  },
})

const toUtcTimestamp = (ms: number): UTCTimestamp => Math.floor(ms / 1000) as UTCTimestamp

function toSeriesData(
  candles: OhlcCandle[]
): { candleData: CandlestickData[]; volumeData: HistogramData[] } {
  const limited = candles.length > 2000 ? candles.slice(-2000) : candles
  const candleData: CandlestickData[] = limited.map((candle) => ({
    time: toUtcTimestamp(candle.t),
    open: candle.o,
    high: candle.h,
    low: candle.l,
    close: candle.c,
  }))

  const volumeData: HistogramData[] = limited.map((candle) => ({
    time: toUtcTimestamp(candle.t),
    value: candle.v ?? 0,
    color: candle.c >= candle.o ? '#42f5b3' : '#ef476f',
  }))

  return { candleData, volumeData }
}

export default function AdvancedChart({
  candles,
  status,
  source,
  viewState,
  onViewStateChange,
  error,
  replayLabel,
  lastUpdatedAt,
  indicators,
  annotations,
  onAnnotationClick,
  onCreateJournalAtPoint,
  onCreateAlertAtPoint,
  testId,
}: AdvancedChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const candleSeriesRef = useRef<ISeriesApi<'Candlestick'> | null>(null)
  const volumeSeriesRef = useRef<ISeriesApi<'Histogram'> | null>(null)
  const indicatorSeriesRef = useRef<Record<string, ISeriesApi<'Line'>[]>>({})

  const { candleData, volumeData } = useMemo(() => toSeriesData(candles), [candles])
  const lastCandle = useMemo(() => candles[candles.length - 1], [candles])
  const overlayMeta = useMemo(
    () => ({ indicatorCount: indicators?.length ?? 0, annotationCount: annotations?.length ?? 0 }),
    [annotations, indicators]
  )

  // CRITICAL: Dynamic import of lightweight-charts library
  // Loads chart library on-demand (only when chart component mounts)
  useEffect(() => {
    if (!containerRef.current) return

    let disposed = false
    let chart: IChartApi | null = null

    ;(async () => {
      try {
        // Dynamic import: Load lightweight-charts only when needed
        const { createChart, CrosshairMode } = await import('lightweight-charts')

        if (disposed || !containerRef.current) return

        const chartHeight = Math.max(280, Math.min(500, Math.round(window.innerHeight * 0.55)))
        chart = createChart(containerRef.current, {
          width: containerRef.current.clientWidth,
          height: chartHeight,
          ...getChartOptions(CrosshairMode.Normal),
        })

        const candleSeries = chart.addCandlestickSeries({
          upColor: '#42f5b3',
          downColor: '#ef476f',
          borderDownColor: '#ef476f',
          borderUpColor: '#42f5b3',
          wickDownColor: '#ef476f',
          wickUpColor: '#42f5b3',
        } as CandlestickSeriesOptions)

        const volumeSeries = chart.addHistogramSeries({
          priceFormat: { type: 'volume' },
          priceScaleId: 'volume',
          color: '#293247',
          base: 0,
        })

        // Apply scale margins via priceScale API
        volumeSeries.priceScale().applyOptions({
          scaleMargins: { top: 0.8, bottom: 0 },
        })

        candleSeriesRef.current = candleSeries
        volumeSeriesRef.current = volumeSeries
        chartRef.current = chart

        const handleResize = () => {
          if (containerRef.current && chart) {
            chart.applyOptions({
              width: containerRef.current.clientWidth,
              height: Math.max(260, Math.min(520, containerRef.current.clientHeight || chartHeight)),
            })
          }
        }

        const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleResize) : undefined
        if (containerRef.current) {
          resizeObserver?.observe(containerRef.current)
        }
        window.addEventListener('resize', handleResize)

        // Cleanup function stored for return
        return () => {
          window.removeEventListener('resize', handleResize)
          resizeObserver?.disconnect()
          if (chart) {
            chart.remove()
          }
        }
      } catch (err) {
        console.error('[AdvancedChart] Failed to load chart library:', err)
      }
    })().then((cleanup) => {
      if (!disposed && cleanup) {
        // Store cleanup for later disposal
        return cleanup
      }
    })

    return () => {
      disposed = true
      if (chart) {
        chart.remove()
      }
      chartRef.current = null
      candleSeriesRef.current = null
      volumeSeriesRef.current = null
    }
  }, [])

  useEffect(() => {
    if (!candleSeriesRef.current || !volumeSeriesRef.current) return

    candleSeriesRef.current.setData(candleData)
    volumeSeriesRef.current.setData(volumeData)
  }, [candleData, volumeData])

  useEffect(() => {
    if (!onViewStateChange) return
    onViewStateChange(viewState)
  }, [viewState, onViewStateChange])

  useEffect(() => {
    const chart = chartRef.current
    if (!chart) return

    Object.values(indicatorSeriesRef.current).forEach((seriesList) => {
      seriesList.forEach((series) => {
        // removeSeries is available at runtime; guard for mock compatibility with optional chaining
        chart.removeSeries?.(series)
      })
    })
    indicatorSeriesRef.current = {}

    indicators?.forEach((indicator) => {
      if (indicator.type === 'bb') {
        const basis = chart.addLineSeries({ color: indicator.color ?? '#fbbf24', lineWidth: 2 })
        const upper = chart.addLineSeries({ color: '#f59e0b', lineWidth: 1 })
        const lower = chart.addLineSeries({ color: '#f59e0b', lineWidth: 1 })
        basis.setData(indicator.basis)
        upper.setData(indicator.upper)
        lower.setData(indicator.lower)
        indicatorSeriesRef.current[indicator.id] = [basis, upper, lower]
        return
      }

      const line = chart.addLineSeries({ color: indicator.color ?? '#22d3ee', lineWidth: 2 })
      line.setData(indicator.points)
      indicatorSeriesRef.current[indicator.id] = [line]
    })
  }, [indicators])

  useEffect(() => {
    if (!candleSeriesRef.current) return
    const markers: SeriesMarker<Time>[] = (annotations ?? []).map((annotation) => {
      const shape: SeriesMarkerShape = 
        annotation.kind === 'alert' ? 'arrowDown' 
        : annotation.kind === 'signal' ? 'arrowUp' 
        : 'circle'
      
      return {
        time: toUtcTimestamp(annotation.candleTime),
        position: 'aboveBar' as const,
        color: annotation.kind === 'alert' ? '#f43f5e' : annotation.kind === 'signal' ? '#c084fc' : '#22d3ee',
        shape,
        text: annotation.label,
      }
    })
    candleSeriesRef.current.setMarkers?.(markers)
  }, [annotations])

  return (
    <div className="flex flex-col gap-3" data-testid={testId ?? 'advanced-chart'}>
      <div className="flex items-center justify-between text-xs text-fog">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-smoke-light px-2 py-1 text-[11px] uppercase tracking-wide text-mist">{viewState.timeframe}</span>
          {replayLabel && <span className="rounded-full bg-indigo-900/40 px-2 py-1 text-[11px] text-indigo-200">{replayLabel}</span>}
          {source === 'cache' && <span className="rounded-full bg-gold/40 px-2 py-1 text-[11px] text-gold">Cached</span>}
        {status === 'stale' && <span className="rounded-full bg-orange-900/40 px-2 py-1 text-[11px] text-orange-200">Stale</span>}
        {status === 'no-data' && (
          <span className="rounded-full bg-smoke-light px-2 py-1 text-[11px] text-fog" data-testid="badge-no-data">
            No data
          </span>
        )}
        {overlayMeta.indicatorCount + overlayMeta.annotationCount > 0 && (
          <span className="rounded-full bg-smoke-light/70 px-2 py-1 text-[11px] text-mist">
            {overlayMeta.indicatorCount} indicators · {overlayMeta.annotationCount} notes
          </span>
        )}
        </div>
        {lastUpdatedAt && (
          <span className="text-ash">Updated {new Date(lastUpdatedAt).toLocaleTimeString()}</span>
        )}
      </div>

      <div className="relative rounded-2xl border border-smoke-light bg-void/70 p-2">
        {status !== 'error' && (
          <div
            ref={containerRef}
            className="h-[320px] w-full min-h-[260px] rounded-xl bg-void md:h-[420px]"
            aria-label="advanced-chart"
          />
        )}

        {(onCreateJournalAtPoint || onCreateAlertAtPoint) && lastCandle && (
          <div className="absolute left-3 top-3 flex flex-wrap gap-2" data-testid="chart-create-actions">
            {onCreateJournalAtPoint && (
              <button
                type="button"
                className="rounded-full bg-smoke/70 px-3 py-1 text-[11px] text-mist hover:bg-smoke-light"
                onClick={() =>
                  onCreateJournalAtPoint({
                    price: lastCandle.c,
                    time: lastCandle.t,
                  })
                }
                data-testid="button-create-journal-from-chart"
                title="Create a journal note at the latest candle context"
              >
                + Journal
              </button>
            )}
            {onCreateAlertAtPoint && (
              <button
                type="button"
                className="rounded-full bg-indigo-900/70 px-3 py-1 text-[11px] text-indigo-100 hover:bg-indigo-800"
                onClick={() =>
                  onCreateAlertAtPoint({
                    price: lastCandle.c,
                    time: lastCandle.t,
                  })
                }
                data-testid="button-create-alert-from-chart"
                title="Create an alert using the latest candle price"
              >
                + Alert
              </button>
            )}
          </div>
        )}

        {status === 'loading' && candles.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-void/60 text-sm text-fog">
            Loading candles…
          </div>
        )}

        {status === 'no-data' && candles.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-void/60 text-sm text-fog">
            No candles yet for this asset/timeframe.
          </div>
        )}

        {status === 'error' && candles.length === 0 && (
          <div className="flex h-[320px] items-center justify-center rounded-2xl bg-blood/40 text-sm text-blood md:h-[420px]">
            {error || 'Failed to load chart'}
          </div>
        )}

        {status === 'stale' && candles.length > 0 && (
          <div className="absolute right-3 top-3 rounded-full bg-orange-900/70 px-3 py-1 text-xs text-orange-100">Showing cached data</div>
        )}

        {status === 'loading' && candles.length > 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-start justify-end p-3">
            <span className="rounded-full bg-smoke/80 px-3 py-1 text-[11px] text-fog">Refreshing…</span>
          </div>
        )}

        {status === 'error' && candles.length > 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-start justify-end p-3">
            <span className="rounded-full bg-blood/80 px-3 py-1 text-[11px] text-blood">{error || 'Fetch error'}</span>
          </div>
        )}

        {status === 'no-data' && candles.length > 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-start justify-end p-3">
            <span className="rounded-full bg-smoke/80 px-3 py-1 text-[11px] text-mist">Awaiting data</span>
          </div>
        )}

        {/* TODO: Render indicators and annotations when available */}
      </div>

      {annotations && annotations.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-fog">
          {annotations.slice(0, 6).map((annotation) => (
            <button
              key={annotation.id}
              type="button"
              onClick={() => onAnnotationClick?.(annotation)}
              className="rounded-full border border-smoke-light bg-smoke/70 px-2 py-1 text-[11px] text-mist transition hover:border-indigo-500 hover:text-indigo-200"
              data-testid={`annotation-pill-${annotation.kind}`}
              title={`${annotation.kind === 'signal' ? 'Pulse signal' : annotation.kind === 'alert' ? 'Price alert' : 'Journal entry'} · ${annotation.label}`}
            >
              {annotation.kind === 'alert' ? '⚠️' : annotation.kind === 'signal' ? '✨' : '📝'} {annotation.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
