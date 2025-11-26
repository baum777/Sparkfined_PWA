import React, { useEffect, useMemo, useRef } from 'react'
import type {
  CandlestickData,
  CandlestickSeriesOptions,
  HistogramData,
  HistogramSeriesOptions,
  IChartApi,
  ISeriesApi,
  UTCTimestamp,
} from 'lightweight-charts'
import { createChart, CrosshairMode } from 'lightweight-charts'
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

const chartOptions = {
  layout: {
    background: { color: '#0b1221' },
    textColor: '#d3d8e8',
  },
  grid: {
    vertLines: { color: '#1c2435' },
    horzLines: { color: '#1c2435' },
  },
  crosshair: {
    mode: CrosshairMode.Normal,
  },
  rightPriceScale: {
    borderColor: '#293247',
  },
  timeScale: {
    borderColor: '#293247',
  },
}

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

  useEffect(() => {
    if (!containerRef.current) return

    const chartHeight = Math.max(280, Math.min(500, Math.round(window.innerHeight * 0.55)))
    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
      height: chartHeight,
      ...chartOptions,
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
      if (containerRef.current) {
        chart.applyOptions({
          width: containerRef.current.clientWidth,
          height: Math.max(260, Math.min(520, containerRef.current.clientHeight || chartHeight)),
        })
      }
    }

    const resizeObserver = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(handleResize) : undefined
    resizeObserver?.observe(containerRef.current)
    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      resizeObserver?.disconnect()
      chart.remove()
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
    const markers = (annotations ?? []).map((annotation) => ({
      id: annotation.id,
      time: toUtcTimestamp(annotation.candleTime),
      position: 'aboveBar' as const,
      color: annotation.kind === 'alert' ? '#f43f5e' : annotation.kind === 'signal' ? '#c084fc' : '#22d3ee',
      shape: annotation.kind === 'alert' ? 'arrowDown' : annotation.kind === 'signal' ? 'arrowUp' : 'circle',
      text: annotation.label,
    }))
    candleSeriesRef.current.setMarkers?.(markers)
  }, [annotations])

  return (
    <div className="flex flex-col gap-3" data-testid={testId ?? 'advanced-chart'}>
      <div className="flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-800 px-2 py-1 text-[11px] uppercase tracking-wide text-slate-200">{viewState.timeframe}</span>
          {replayLabel && <span className="rounded-full bg-indigo-900/40 px-2 py-1 text-[11px] text-indigo-200">{replayLabel}</span>}
          {source === 'cache' && <span className="rounded-full bg-amber-900/40 px-2 py-1 text-[11px] text-amber-200">Cached</span>}
        {status === 'stale' && <span className="rounded-full bg-orange-900/40 px-2 py-1 text-[11px] text-orange-200">Stale</span>}
        {status === 'no-data' && (
          <span className="rounded-full bg-slate-800 px-2 py-1 text-[11px] text-slate-300" data-testid="badge-no-data">
            No data
          </span>
        )}
        {overlayMeta.indicatorCount + overlayMeta.annotationCount > 0 && (
          <span className="rounded-full bg-slate-800/70 px-2 py-1 text-[11px] text-slate-200">
            {overlayMeta.indicatorCount} indicators · {overlayMeta.annotationCount} notes
          </span>
        )}
        </div>
        {lastUpdatedAt && (
          <span className="text-slate-500">Updated {new Date(lastUpdatedAt).toLocaleTimeString()}</span>
        )}
      </div>

      <div className="relative rounded-2xl border border-slate-800 bg-slate-950/70 p-2">
        {status !== 'error' && (
          <div
            ref={containerRef}
            className="h-[320px] w-full min-h-[260px] rounded-xl bg-slate-950 md:h-[420px]"
            aria-label="advanced-chart"
          />
        )}

        {(onCreateJournalAtPoint || onCreateAlertAtPoint) && lastCandle && (
          <div className="absolute left-3 top-3 flex flex-wrap gap-2" data-testid="chart-create-actions">
            {onCreateJournalAtPoint && (
              <button
                type="button"
                className="rounded-full bg-slate-900/70 px-3 py-1 text-[11px] text-slate-200 hover:bg-slate-800"
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
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-950/60 text-sm text-slate-400">
            Loading candles…
          </div>
        )}

        {status === 'no-data' && candles.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-slate-950/60 text-sm text-slate-400">
            No candles yet for this asset/timeframe.
          </div>
        )}

        {status === 'error' && candles.length === 0 && (
          <div className="flex h-[320px] items-center justify-center rounded-2xl bg-rose-950/40 text-sm text-rose-200 md:h-[420px]">
            {error || 'Failed to load chart'}
          </div>
        )}

        {status === 'stale' && candles.length > 0 && (
          <div className="absolute right-3 top-3 rounded-full bg-orange-900/70 px-3 py-1 text-xs text-orange-100">Showing cached data</div>
        )}

        {status === 'loading' && candles.length > 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-start justify-end p-3">
            <span className="rounded-full bg-slate-900/80 px-3 py-1 text-[11px] text-slate-300">Refreshing…</span>
          </div>
        )}

        {status === 'error' && candles.length > 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-start justify-end p-3">
            <span className="rounded-full bg-rose-900/80 px-3 py-1 text-[11px] text-rose-100">{error || 'Fetch error'}</span>
          </div>
        )}

        {status === 'no-data' && candles.length > 0 && (
          <div className="pointer-events-none absolute inset-0 flex items-start justify-end p-3">
            <span className="rounded-full bg-slate-900/80 px-3 py-1 text-[11px] text-slate-200">Awaiting data</span>
          </div>
        )}

        {/* TODO: Render indicators and annotations when available */}
      </div>

      {annotations && annotations.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-300">
          {annotations.slice(0, 6).map((annotation) => (
            <button
              key={annotation.id}
              type="button"
              onClick={() => onAnnotationClick?.(annotation)}
              className="rounded-full border border-slate-800 bg-slate-900/70 px-2 py-1 text-[11px] text-slate-100 transition hover:border-indigo-500 hover:text-indigo-200"
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
