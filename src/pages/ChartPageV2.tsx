import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AdvancedChart from '@/components/chart/AdvancedChart'
import ChartHeaderActions from '@/components/chart/ChartHeaderActions'
import { DEFAULT_TIMEFRAME, TIMEFRAME_ORDER, type ChartTimeframe, type IndicatorPresetId } from '@/domain/chart'
import useOhlcData from '@/hooks/useOhlcData'
import DashboardShell from '@/components/dashboard/DashboardShell'
import { useIndicators } from '@/hooks/useIndicators'
import { useAlertsStore } from '@/store/alertsStore'
import { useJournalStore } from '@/store/journalStore'
import { useChartUiStore } from '@/store/chartUiStore'
import {
  mapAlertToAnnotation,
  mapJournalEntryToAnnotation,
  mapPulseEventToAnnotation,
  mergeAnnotations,
} from '@/lib/annotations'
import { buildReplayUrl } from '@/lib/chartLinks'
import { useChartTelemetry } from '@/lib/chartTelemetry'
import type { PulseDeltaEvent } from '@/lib/grokPulse/types'

const DEFAULT_ASSET = {
  symbol: 'SOLUSDT',
  address: 'So11111111111111111111111111111111111111112',
  network: 'solana',
}

const SUPPORTED_TIMEFRAMES: ChartTimeframe[] = ['15m', '1h', '4h', '1d']

const SYMBOL_TO_ASSET: Record<string, { address: string; network: string; symbol: string }> = {
  SOLUSDT: DEFAULT_ASSET,
}

function resolveTimeframe(candidate?: string | null): ChartTimeframe {
  const maybe = candidate as ChartTimeframe | undefined
  if (maybe && TIMEFRAME_ORDER.includes(maybe)) return maybe
  return DEFAULT_TIMEFRAME
}

function resolveAsset(symbol?: string | null, address?: string | null, network?: string | null) {
  if (address) {
    return {
      address,
      network: network || DEFAULT_ASSET.network,
      symbol: symbol || DEFAULT_ASSET.symbol,
    }
  }

  if (symbol) {
    const normalized = symbol.toUpperCase()
    if (SYMBOL_TO_ASSET[normalized]) return SYMBOL_TO_ASSET[normalized]
  }

  return DEFAULT_ASSET
}

export default function ChartPageV2() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const [timeframe, setTimeframe] = useState<ChartTimeframe>(resolveTimeframe(searchParams.get('timeframe')))
  const signalTrackedRef = useRef(false)

  const asset = useMemo(
    () => resolveAsset(searchParams.get('symbol'), searchParams.get('address'), searchParams.get('network')),
    [searchParams]
  )

  useEffect(() => {
    const nextTimeframe = resolveTimeframe(searchParams.get('timeframe'))
    setTimeframe((prev) => (prev === nextTimeframe ? prev : nextTimeframe))
  }, [searchParams])

  const { candles, status, error, refresh, source, lastUpdatedAt, viewState, hasData } = useOhlcData({
    address: asset.address,
    symbol: asset.symbol,
    timeframe,
    network: asset.network,
  })

  const indicatorConfig = useChartUiStore((state) => state.getConfigFor(asset.address))
  const hasSeenIntro = useChartUiStore((state) => state.hasSeenIntro)
  const dismissIntro = useChartUiStore((state) => state.dismissIntro)
  const toggleOverlay = useChartUiStore((state) => state.toggleOverlay)
  const applyPreset = useChartUiStore((state) => state.applyPreset)
  const overlays = indicatorConfig.overlays
  const indicators = useIndicators(candles, overlays)
  const alerts = useAlertsStore((state) => state.alerts)
  const createAlertDraft = useAlertsStore((state) => state.createDraftFromChart)
  const journalEntries = useJournalStore((state) => state.entries)
  const createJournalDraft = useJournalStore((state) => state.createDraftFromChart)
  const { track } = useChartTelemetry()
  const annotations = useMemo(() => {
    const alertAnnotations = alerts
      .filter((alert) => alert.symbol?.toUpperCase() === asset.symbol.toUpperCase())
      .map(mapAlertToAnnotation)
    const journalAnnotations = journalEntries.map(mapJournalEntryToAnnotation)
    const pulseAnnotations: PulseDeltaEvent[] = candles.length
      ? [
          {
            address: asset.address,
            symbol: asset.symbol,
            previousScore: 45,
            newScore: 55,
            delta: 10,
            ts: candles[candles.length - 1].t,
          },
        ]
      : []
    return mergeAnnotations(
      journalAnnotations,
      alertAnnotations,
      pulseAnnotations.map(mapPulseEventToAnnotation)
    )
  }, [alerts, asset.address, asset.symbol, candles, journalEntries])

  useEffect(() => {
    track('chart.view_opened', { address: asset.address, timeframe, mode: 'chart' })
  }, [asset.address, timeframe, track])

  const handleTimeframeChange = (next: ChartTimeframe) => {
    setTimeframe(next)
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set('timeframe', next)
    nextParams.set('symbol', asset.symbol)
    nextParams.set('address', asset.address)
    nextParams.set('network', asset.network)
    setSearchParams(nextParams)
  }

  const handleOpenReplay = () => {
    const to = Date.now()
    const from = to - 12 * 60 * 60 * 1000
    const url = buildReplayUrl(asset.address, timeframe, from, to, {
      symbol: asset.symbol,
      network: asset.network,
    })
    track('chart.replay_started', { address: asset.address, timeframe })
    navigate(url)
  }

  const timeframeButtons = useMemo(
    () =>
      TIMEFRAME_ORDER.filter((tf) => SUPPORTED_TIMEFRAMES.includes(tf)).map((tf) => ({
        value: tf,
        label: tf,
      })),
    []
  )

  const indicatorButtons: Array<{ key: string; label: string; overlay: Parameters<typeof toggleOverlay>[1] }> = useMemo(
    () => [
      { key: 'sma-20', label: 'SMA 20', overlay: { type: 'sma', period: 20 } as const },
      { key: 'ema-50', label: 'EMA 50', overlay: { type: 'ema', period: 50 } as const },
      { key: 'bb-20', label: 'BB 20/2', overlay: { type: 'bb', period: 20, deviation: 2 } as const },
    ],
    []
  )

  const handlePreset = (preset: IndicatorPresetId) => {
    applyPreset(asset.address, preset)
    track('chart.indicator_preset_selected', { presetId: preset, address: asset.address, timeframe })
  }

  const creationContext = useMemo(() => {
    const lastCandle = candles[candles.length - 1]
    return {
      address: asset.address,
      symbol: asset.symbol,
      price: lastCandle?.c ?? 0,
      time: lastCandle?.t ?? Date.now(),
      timeframe,
    }
  }, [asset.address, asset.symbol, candles, timeframe])

  useEffect(() => {
    if (!signalTrackedRef.current && annotations.some((item) => item.kind === 'signal')) {
      track('chart.pulse_signal_viewed_in_chart', { address: asset.address, timeframe })
      signalTrackedRef.current = true
    }
  }, [annotations, asset.address, timeframe, track])

  return (
    <DashboardShell
      title="Chart"
      description="Trade-ready chart workspace with indicators, replay, drawings and exports."
      actions={<ChartHeaderActions />}
    >
      <div className="space-y-6 rounded-3xl border border-border-subtle bg-surface p-6" data-testid="chart-page">
        {!hasSeenIntro && (
          <ChartIntroBanner onDismiss={dismissIntro} />
        )}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Advanced chart</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Lightweight chart backed by cached OHLC snapshots for offline resilience.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {timeframeButtons.map((item) => (
              <button
                key={item.value}
                onClick={() => handleTimeframeChange(item.value)}
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  timeframe === item.value
                    ? 'bg-primary text-surface'
                    : 'bg-surface-subtle text-text-secondary hover:text-text-primary'
                }`}
                title={`Switch to ${item.label} candles`}
              >
                {item.label}
              </button>
            ))}
            <button
              onClick={() => refresh()}
              className="rounded-full bg-surface-subtle px-3 py-1 text-sm text-text-secondary hover:text-text-primary"
              disabled={status === 'loading'}
              data-testid="button-refresh-chart"
              title="Refetch candles"
            >
              Refresh
            </button>
            <button
              onClick={handleOpenReplay}
              className="rounded-full bg-surface-subtle px-3 py-1 text-sm text-text-secondary hover:text-text-primary"
              data-testid="button-open-replay"
              title="Open replay with current asset/timeframe"
            >
              Open replay
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3" data-testid="indicator-toolbar">
          <span className="text-xs uppercase tracking-wide text-text-secondary">Indicators</span>
          {indicatorButtons.map((button) => {
            const isActive = overlays.some((item) => JSON.stringify(item) === JSON.stringify(button.overlay))
            return (
              <button
                key={button.key}
                onClick={() => {
                  toggleOverlay(asset.address, button.overlay)
                  track('chart.indicator_toggled', {
                    indicator: button.overlay,
                    active: !isActive,
                    address: asset.address,
                    timeframe,
                  })
                }}
                className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                  isActive ? 'bg-primary text-surface' : 'bg-surface-subtle text-text-secondary'
                }`}
                data-testid={`indicator-toggle-${button.key}`}
                title={
                  button.overlay.type === 'bb'
                    ? 'BB 20/2 – volatility bands for squeezes and breakouts'
                    : `${button.label} – smoothing to contextualize moves`
                }
              >
                {button.label}
              </button>
            )
          })}
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            Preset:
            {(
              [
                { id: 'scalper', label: 'Scalper' },
                { id: 'swing', label: 'Swing' },
                { id: 'position', label: 'Position' },
              ] satisfies Array<{ id: IndicatorPresetId; label: string }>
              ).map((preset) => (
              <button
                key={preset.id}
                onClick={() => handlePreset(preset.id)}
                className={`rounded-full px-2 py-1 text-[11px] transition ${
                  indicatorConfig.preset === preset.id
                    ? 'bg-surface-strong text-text-primary'
                    : 'bg-surface-subtle text-text-secondary'
                }`}
                data-testid={`indicator-preset-${preset.id}`}
                title={`Apply ${preset.label} indicator mix`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        <AdvancedChart
          candles={candles}
          status={status}
          source={source}
          viewState={viewState}
          error={error}
          lastUpdatedAt={lastUpdatedAt}
          indicators={indicators}
          annotations={annotations}
          testId="chart-workspace"
          onCreateJournalAtPoint={() => {
            void createJournalDraft(creationContext)
            track('chart.journal_created_from_chart', { address: asset.address, timeframe })
          }}
          onCreateAlertAtPoint={() => {
            createAlertDraft({ ...creationContext, timeframe })
            track('chart.alert_created_from_chart', { address: asset.address, timeframe })
          }}
          onAnnotationClick={(annotation) => {
            track('chart.annotation_jump', { address: asset.address, timeframe, kind: annotation.kind })
            setSearchParams((current) => {
              const next = new URLSearchParams(current)
              next.set('timeframe', timeframe)
              next.set('address', asset.address)
              next.set('network', asset.network)
              next.set('focus', String(annotation.candleTime))
              return next
            })
          }}
        />

        <ChartLegend />

        {status === 'error' && !hasData && (
          <div className="rounded-2xl border border-red-900/50 bg-red-950/40 px-4 py-3 text-sm text-red-200">
            {error || 'Failed to load chart data.'}
          </div>
        )}

        {status === 'stale' && (
          <div className="rounded-2xl border border-amber-900/50 bg-amber-950/40 px-4 py-3 text-sm text-amber-100">
            Showing cached candles because the network request failed.
          </div>
        )}

        {status === 'no-data' && (
          <div className="rounded-2xl border border-slate-800 bg-surface-subtle px-4 py-3 text-sm text-text-secondary">
            No candles available yet for {asset.symbol} on {timeframe}. Try another timeframe.
          </div>
        )}
      </div>
    </DashboardShell>
  )
}

function ChartIntroBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <div
      className="flex flex-col gap-3 rounded-2xl border border-border-moderate bg-surface-subtle p-4 text-sm text-text-secondary"
      data-testid="chart-intro-banner"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-text-tertiary">Chart workspace tips</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-text-secondary">
            <li>Toggle indicators in the toolbar to switch between scalper/swing presets.</li>
            <li>Open Replay to scrub past price action and CT signals, then hop back live.</li>
            <li>Create journal notes or alerts directly from the latest candle.</li>
          </ul>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="rounded-full bg-surface px-3 py-1 text-xs font-semibold text-text-secondary hover:text-text-primary"
          data-testid="button-dismiss-chart-intro"
          title="Hide intro tips"
        >
          Dismiss
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-[11px] text-text-tertiary">
        <span className="rounded-full bg-surface px-2 py-1">📓 Journal markers</span>
        <span className="rounded-full bg-surface px-2 py-1">⚠️ Price alerts</span>
        <span className="rounded-full bg-surface px-2 py-1">✨ Signals from Grok/Pulse</span>
      </div>
    </div>
  )
}

function ChartLegend() {
  return (
    <div
      className="flex flex-wrap items-center gap-3 text-[11px] text-text-secondary"
      data-testid="chart-legend"
    >
      <span className="rounded-full bg-surface-subtle px-2 py-1">⚡ Signals</span>
      <span className="rounded-full bg-surface-subtle px-2 py-1">⚠️ Alerts</span>
      <span className="rounded-full bg-surface-subtle px-2 py-1">📝 Journal</span>
      <span className="rounded-full bg-surface-subtle px-2 py-1">Replay + Go Live in toolbar</span>
    </div>
  )
}
