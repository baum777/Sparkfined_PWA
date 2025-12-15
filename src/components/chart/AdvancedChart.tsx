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
import { getChartColors } from '@/lib/chartColors'
import { IndicatorSeriesManager } from '@/lib/chart/indicatorSeriesManager'

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
const getChartOptions = (crosshairMode: CrosshairModeType) => {
  const colors = getChartColors()
  
  return {
    layout: {
      background: { color: colors.background },
      textColor: colors.textColor,
    },
    grid: {
      vertLines: { color: colors.gridColor },
      horzLines: { color: colors.gridColor },
    },
    crosshair: {
      mode: crosshairMode,
    },
    rightPriceScale: {
      borderColor: colors.border,
    },
    timeScale: {
      borderColor: colors.border,
    },
  }
}

const toUtcTimestamp = (ms: number): UTCTimestamp => Math.floor(ms / 1000) as UTCTimestamp

function toSeriesData(
  candles: OhlcCandle[]
): { candleData: CandlestickData[]; volumeData: HistogramData[] } {
  const colors = getChartColors()
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
    color: candle.c >= candle.o ? colors.bullColor : colors.bearColor,
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
  const indicatorManagerRef = useRef<IndicatorSeriesManager | null>(null)

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
        // Get chart colors from design tokens
        const colors = getChartColors()
        
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
          upColor: colors.bullColor,
          downColor: colors.bearColor,
          borderDownColor: colors.bearColor,
          borderUpColor: colors.bullColor,
          wickDownColor: colors.bearColor,
          wickUpColor: colors.bullColor,
        } as CandlestickSeriesOptions)

        const volumeSeries = chart.addHistogramSeries({
          priceFormat: { type: 'volume' },
          priceScaleId: 'volume',
          color: colors.border,
          base: 0,
        })

        // Apply scale margins via priceScale API
        volumeSeries.priceScale().applyOptions({
          scaleMargins: { top: 0.8, bottom: 0 },
        })

        candleSeriesRef.current = candleSeries
        volumeSeriesRef.current = volumeSeries
        chartRef.current = chart
        indicatorManagerRef.current = new IndicatorSeriesManager(chart)

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
      indicatorManagerRef.current?.removeAll()
      indicatorManagerRef.current = null
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
    if (!indicators) return
    indicatorManagerRef.current?.apply(indicators)
  }, [indicators])

  useEffect(() => {
    if (!candleSeriesRef.current) return
    
    // Get chart colors from design tokens
    const colors = getChartColors()
    
    const markers: SeriesMarker<Time>[] = (annotations ?? []).map((annotation) => {
      const shape: SeriesMarkerShape = 
        annotation.kind === 'alert' ? 'arrowDown' 
        : annotation.kind === 'signal' ? 'arrowUp' 
        : 'circle'
      
      return {
        time: toUtcTimestamp(annotation.candleTime),
        position: 'aboveBar' as const,
        color: annotation.kind === 'alert' ? colors.danger : annotation.kind === 'signal' ? colors.accent : colors.info,
        shape,
        text: annotation.label,
      }
    })
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
