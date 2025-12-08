import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AdvancedChart from '@/components/chart/AdvancedChart'
import ChartHeaderActions from '@/components/chart/ChartHeaderActions'
import DashboardShell from '@/components/dashboard/DashboardShell'
import Button from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardFooter, CardHeader } from '@/components/ui/Card'
import StateView from '@/components/ui/StateView'
import { DEFAULT_TIMEFRAME, TIMEFRAME_ORDER, type ChartTimeframe, type IndicatorPresetId } from '@/domain/chart'
import useOhlcData from '@/hooks/useOhlcData'
import { useIndicators } from '@/hooks/useIndicators'
import { useOnlineStatus } from '@/hooks/useOnlineStatus'
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
  const isDefaultAsset = !searchParams.get('symbol') && !searchParams.get('address')

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
  const isOnline = useOnlineStatus()

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
    const lastCandle = candles[candles.length - 1]
    const pulseAnnotations: PulseDeltaEvent[] = lastCandle
      ? [
          {
            address: asset.address,
            symbol: asset.symbol,
            previousScore: 45,
            newScore: 55,
            delta: 10,
            ts: lastCandle.t,
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

  const handleCreateAlertDraft = () => {
    createAlertDraft({ ...creationContext, timeframe })
  }

  const handleSaveJournal = () => {
    void createJournalDraft(creationContext)
  }

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
      actions={
        <ChartHeaderActions
          onCreateAlert={handleCreateAlertDraft}
          onSaveJournal={handleSaveJournal}
          onOpenReplay={handleOpenReplay}
        />
      }
    >
      <Card variant="glass" className="space-y-6 rounded-3xl" data-testid="chart-page">
        {!hasSeenIntro && <ChartIntroBanner onDismiss={dismissIntro} />}
        {!isOnline && (
          <StateView
            type="offline"
            description="You're offline. Showing last cached chart data."
            compact
          />
        )}
        {isDefaultAsset && (
          <div className="card-bordered rounded-lg border-info/40 bg-info/10 p-3 text-sm">
            <p className="text-info">
              <strong>No symbol provided.</strong> Showing default chart (SOL/USDT). Select a token from the{' '}
              <button
                onClick={() => navigate('/watchlist-v2')}
                className="underline hover:text-info/80"
              >
                Watchlist
              </button>{' '}
              to view other charts.
            </p>
          </div>
        )}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold text-text-primary">Advanced chart</h2>
            <p className="mt-2 text-sm text-text-secondary">
              Lightweight chart backed by cached OHLC snapshots for offline resilience.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {timeframeButtons.map((item) => (
              <Button
                key={item.value}
                size="sm"
                variant={timeframe === item.value ? 'primary' : 'ghost'}
                className="rounded-full px-4"
                onClick={() => handleTimeframeChange(item.value)}
                title={`Switch to ${item.label} candles`}
              >
                {item.label}
              </Button>
            ))}
            <Button
              variant="outline"
              size="sm"
              className="rounded-full px-4"
              onClick={() => refresh()}
              disabled={status === 'loading'}
              data-testid="button-refresh-chart"
              title="Refetch candles"
            >
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full px-4"
              onClick={handleOpenReplay}
              data-testid="button-open-replay"
              title="Open replay with current asset/timeframe"
            >
              Open replay
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3" data-testid="indicator-toolbar">
          <span className="text-xs uppercase tracking-wide text-text-secondary">Indicators</span>
          {indicatorButtons.map((button) => {
            const isActive = overlays.some((item) => JSON.stringify(item) === JSON.stringify(button.overlay))
            return (
              <Button
                key={button.key}
                size="sm"
                variant={isActive ? 'secondary' : 'ghost'}
                className="rounded-full px-4 text-xs"
                onClick={() => {
                  toggleOverlay(asset.address, button.overlay)
                  track('chart.indicator_toggled', {
                    indicator: button.overlay,
                    active: !isActive,
                    address: asset.address,
                    timeframe,
                  })
                }}
                data-testid={`indicator-toggle-${button.key}`}
                title={
                  button.overlay.type === 'bb'
                    ? 'BB 20/2 – volatility bands for squeezes and breakouts'
                    : `${button.label} – smoothing to contextualize moves`
                }
              >
                {button.label}
              </Button>
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
              <Button
                key={preset.id}
                size="sm"
                variant={indicatorConfig.preset === preset.id ? 'secondary' : 'ghost'}
                className="rounded-full px-3 text-[11px]"
                onClick={() => handlePreset(preset.id)}
                data-testid={`indicator-preset-${preset.id}`}
                title={`Apply ${preset.label} indicator mix`}
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-3" data-testid="chart-next-actions">
          <div className="card-glass rounded-2xl border border-border/60 p-4 lg:col-span-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-text-tertiary">Next best actions</p>
                <p className="text-sm text-text-secondary">Stay close to the current view context.</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button size="sm" variant="primary" onClick={handleCreateAlertDraft} data-testid="chart-nba-alert">
                  Create alert at level
                </Button>
                <Button size="sm" variant="secondary" onClick={handleSaveJournal} data-testid="chart-nba-journal">
                  Save view to journal
                </Button>
                <Button size="sm" variant="ghost" onClick={handleOpenReplay} data-testid="chart-nba-replay">
                  Open replay here
                </Button>
              </div>
            </div>
          </div>
          <div className="card-bordered rounded-2xl border border-border/60 bg-surface/70 p-4 text-sm text-text-secondary">
            <p className="text-xs uppercase tracking-[0.3em] text-text-tertiary">Focus hint</p>
            <p className="mt-2 leading-relaxed">Keep one chart visible; toggle overlays only when needed.</p>
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
          <div className="rounded-2xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger">
            {error || 'Failed to load chart data.'}
          </div>
        )}

        {status === 'stale' && (
          <div className="rounded-2xl border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-warn">
            Showing cached candles because the network request failed.
          </div>
        )}

        {status === 'no-data' && (
          <div className="rounded-2xl border border-subtle bg-surface-subtle px-4 py-3 text-sm text-text-secondary">
            No candles available yet for {asset.symbol} on {timeframe}. Try another timeframe.
          </div>
        )}
      </Card>
    </DashboardShell>
  )
}

function ChartIntroBanner({ onDismiss }: { onDismiss: () => void }) {
  return (
    <Card variant="muted" className="p-4" data-testid="chart-intro-banner">
      <CardHeader className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-text-tertiary">Chart workspace tips</p>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-text-secondary">
            <li>Toggle indicators in the toolbar to switch between scalper/swing presets.</li>
            <li>Open Replay to scrub past price action and CT signals, then hop back live.</li>
            <li>Create journal notes or alerts directly from the latest candle.</li>
          </ul>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="rounded-full px-3 text-xs font-semibold"
          onClick={onDismiss}
          data-testid="button-dismiss-chart-intro"
          title="Hide intro tips"
        >
          Dismiss
        </Button>
      </CardHeader>
      <CardFooter className="flex flex-wrap items-center gap-2 text-[11px] text-text-tertiary">
        <Badge variant="outline" className="bg-surface px-2 py-1">
          📓 Journal markers
        </Badge>
        <Badge variant="outline" className="bg-surface px-2 py-1">
          ⚠️ Price alerts
        </Badge>
        <Badge variant="outline" className="bg-surface px-2 py-1">
          ✨ Signals from Grok/Pulse
        </Badge>
      </CardFooter>
    </Card>
  )
}

function ChartLegend() {
  return (
    <div className="flex flex-wrap items-center gap-2" data-testid="chart-legend">
      <Badge variant="outline" className="bg-surface-subtle px-3 py-1">
        ⚡ Signals
      </Badge>
      <Badge variant="outline" className="bg-surface-subtle px-3 py-1">
        ⚠️ Alerts
      </Badge>
      <Badge variant="outline" className="bg-surface-subtle px-3 py-1">
        📝 Journal
      </Badge>
      <Badge variant="outline" className="bg-surface-subtle px-3 py-1">
        Replay + Go Live in toolbar
      </Badge>
    </div>
  )
}
