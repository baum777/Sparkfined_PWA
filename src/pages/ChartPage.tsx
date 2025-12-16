import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import AdvancedChart from '@/components/chart/AdvancedChart'
import ChartHeaderActions from '@/components/chart/ChartHeaderActions'
import DashboardShell from '@/components/dashboard/DashboardShell'
import Button from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Card, CardFooter, CardHeader } from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import StateView from '@/components/ui/StateView'
import { SkeletonChartCard } from '@/components/ui/Skeleton'
import {
  DEFAULT_TIMEFRAME,
  TIMEFRAME_ORDER,
  type ChartIndicatorOverlay,
  type ChartDrawingRecord,
  type ChartTimeframe,
  type IndicatorId,
  type IndicatorPresetId,
} from '@/domain/chart'
import useOhlcData from '@/hooks/useOhlcData'
import { useIndicators } from '@/hooks/useIndicators'
import { useIndicatorSettings } from '@/hooks/useIndicatorSettings'
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
import { useChartInteractionMode } from '@/hooks/useChartInteractionMode'
import { useChartDrawings } from '@/hooks/useChartDrawings'

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

export default function ChartPage() {
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
  const {
    drawings,
    isLoading: drawingsLoading,
    selectedId: selectedDrawingId,
    selectDrawing,
    createDrawing,
    updateDrawing,
    deleteSelected,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useChartDrawings(asset.symbol, timeframe)
  const {
    mode: interactionMode,
    setSelect: enableSelection,
    setView: disableSelection,
    setCreateLine,
    setCreateBox,
    setCreateFib,
    setCreateChannel,
  } = useChartInteractionMode()
  const isOnline = useOnlineStatus()

  const {
    settings: indicatorSettings,
    overlays,
    toggleIndicator,
    applyPreset,
    isLoading: indicatorSettingsLoading,
    updateParamsFor,
  } = useIndicatorSettings(asset.symbol, timeframe)
  const indicators = useIndicators(candles, overlays)
  const hasSeenIntro = useChartUiStore((state) => state.hasSeenIntro)
  const dismissIntro = useChartUiStore((state) => state.dismissIntro)
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

  const indicatorButtons = useMemo(() => {
    const smaParam = indicatorSettings.params.sma?.period ?? 20
    const emaParam = indicatorSettings.params.ema?.period ?? 50
    const bbPeriod = indicatorSettings.params.bb?.period ?? 20
    const bbDev = indicatorSettings.params.bb?.deviation ?? 2

    return [
      { key: 'sma' as IndicatorId, label: `SMA ${smaParam}` },
      { key: 'ema' as IndicatorId, label: `EMA ${emaParam}` },
      { key: 'bb' as IndicatorId, label: `BB ${bbPeriod}/${bbDev}` },
    ]
  }, [indicatorSettings.params.sma?.period, indicatorSettings.params.ema?.period, indicatorSettings.params.bb?.period, indicatorSettings.params.bb?.deviation])

  const handlePreset = (preset: IndicatorPresetId) => {
    void applyPreset(preset)
    track('chart.indicator_preset_selected', { presetId: preset, address: asset.address, timeframe })
  }

  const handleParamChange = (indicatorId: IndicatorId, key: string, value: number) => {
    if (!Number.isFinite(value) || value <= 0) return
    void updateParamsFor(indicatorId, { [key]: value })
    track('chart.indicator_param_changed', {
      indicator: indicatorId,
      key,
      value,
      address: asset.address,
      timeframe,
    })
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

  const handleCreateDrawing = useCallback(
    async (draft: ChartDrawingRecord) => {
      await createDrawing({ ...draft, symbol: asset.symbol, timeframe })
      enableSelection()
    },
    [asset.symbol, createDrawing, enableSelection, timeframe]
  )

  const handleUpdateDrawing = useCallback(
    async (drawing: ChartDrawingRecord) => {
      await updateDrawing({ ...drawing, symbol: asset.symbol, timeframe })
    },
    [asset.symbol, timeframe, updateDrawing]
  )

  const handleCancelDraft = useCallback(() => {
    disableSelection()
    selectDrawing(null)
  }, [disableSelection, selectDrawing])

  const handleUndo = useCallback(() => {
    void undo()
  }, [undo])

  const handleRedo = useCallback(() => {
    void redo()
  }, [redo])

  useEffect(() => {
    if (!signalTrackedRef.current && annotations.some((item) => item.kind === 'signal')) {
      track('chart.pulse_signal_viewed_in_chart', { address: asset.address, timeframe })
      signalTrackedRef.current = true
    }
  }, [annotations, asset.address, timeframe, track])

  useEffect(() => {
    if (interactionMode === 'view') {
      selectDrawing(null)
    }
  }, [interactionMode, selectDrawing])

  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      const isMeta = event.metaKey || event.ctrlKey
      const key = event.key.toLowerCase()

      if (key === 'delete' && selectedDrawingId) {
        event.preventDefault()
        void deleteSelected()
      }

      if (key === 'z' && isMeta) {
        event.preventDefault()
        if (event.shiftKey) {
          handleRedo()
        } else {
          handleUndo()
        }
      }

      if (key === 'escape') {
        disableSelection()
        selectDrawing(null)
      }
    }

    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  }, [deleteSelected, disableSelection, handleRedo, handleUndo, selectedDrawingId, selectDrawing])

  const headerMeta = `${asset.symbol} · ${timeframe.toUpperCase()} · ${
    source === 'network' ? 'Live feed' : 'Cached snapshot'
  }`
  const showChartSkeleton = status === 'loading' && !hasData

  return (
    <DashboardShell
      title="Chart"
      description="Trade-ready chart workspace with indicators, replay, drawings and exports."
      meta={headerMeta}
      actions={
        <ChartHeaderActions
          timeframe={timeframe}
          supportedTimeframes={SUPPORTED_TIMEFRAMES}
          onTimeframeChange={handleTimeframeChange}
          onRefresh={refresh}
          onOpenReplay={handleOpenReplay}
          isRefreshing={status === 'loading'}
        />
      }
    >
      <div className="space-y-6" data-testid="chart-page">
        {!hasSeenIntro && <ChartIntroBanner onDismiss={dismissIntro} />}
        {!isOnline && (
          <div className="rounded-3xl border border-border/70 bg-surface/80">
            <StateView type="offline" description="You're offline. Showing last cached chart data." compact />
          </div>
        )}
        {isDefaultAsset && (
          <div className="rounded-3xl border border-info/40 bg-info/10 px-4 py-3 text-sm text-info">
            <strong>No symbol provided.</strong> Showing default chart (SOL/USDT). Select a token from the{' '}
            <button onClick={() => navigate('/watchlist')} className="underline hover:text-info/80">
              Watchlist
            </button>{' '}
            to view other charts.
          </div>
        )}

        <section
          className="rounded-3xl border border-border/70 bg-surface/90 p-3 shadow-card-subtle backdrop-blur-lg sm:p-4"
          data-testid="indicator-toolbar"
        >
          {/* Primary toolbar row - always visible */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            {/* Indicators */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-text-tertiary">Indicators</span>
              {indicatorButtons.map((button) => {
                const isActive = indicatorSettings.enabled?.[button.key] ?? false
                let indicatorPayload: ChartIndicatorOverlay
                if (button.key === 'sma') {
                  indicatorPayload = { type: 'sma', period: indicatorSettings.params.sma?.period ?? 20 }
                } else if (button.key === 'ema') {
                  indicatorPayload = { type: 'ema', period: indicatorSettings.params.ema?.period ?? 50 }
                } else {
                  indicatorPayload = {
                    type: 'bb',
                    period: indicatorSettings.params.bb?.period ?? 20,
                    deviation: indicatorSettings.params.bb?.deviation ?? 2,
                  }
                }
                return (
                  <Button
                    key={button.key}
                    size="sm"
                    variant={isActive ? 'secondary' : 'ghost'}
                    className="rounded-full px-3 text-[11px] focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
                    disabled={indicatorSettingsLoading}
                    onClick={() => {
                      void toggleIndicator(button.key)
                      track('chart.indicator_toggled', {
                        indicator: indicatorPayload,
                        active: !isActive,
                        address: asset.address,
                        timeframe,
                      })
                    }}
                    data-testid={`indicator-toggle-${button.key}`}
                    title={`${button.label} – smoothing to contextualize moves`}
                  >
                    {button.label}
                  </Button>
                )
              })}
            </div>

            {/* Presets */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-text-tertiary">Preset</span>
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
                  variant={indicatorSettings.preset === preset.id ? 'secondary' : 'ghost'}
                  className="rounded-full px-3 text-[11px] focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1"
                  onClick={() => handlePreset(preset.id)}
                  data-testid={`indicator-preset-${preset.id}`}
                  title={`Apply ${preset.label} indicator mix`}
                >
                  {preset.label}
                </Button>
              ))}
            </div>

            {/* Drawings - Logical grouping */}
            <div className="flex flex-wrap items-center gap-2 text-xs" data-testid="drawing-mode-toggle">
              <span className="text-[10px] font-semibold uppercase tracking-[0.25em] text-text-tertiary">Drawings</span>
              
              {/* Mode buttons */}
              <div className="flex items-center gap-1 rounded-full border border-border/50 bg-surface-subtle/50 p-0.5">
                <Button
                  size="sm"
                  variant={interactionMode === 'view' ? 'secondary' : 'ghost'}
                  className="rounded-full px-2.5 text-[11px] focus-visible:ring-2 focus-visible:ring-brand"
                  onClick={() => {
                    disableSelection()
                    selectDrawing(null)
                  }}
                >
                  View
                </Button>
                <Button
                  size="sm"
                  variant={interactionMode === 'select' ? 'secondary' : 'ghost'}
                  className="rounded-full px-2.5 text-[11px] focus-visible:ring-2 focus-visible:ring-brand"
                  onClick={enableSelection}
                >
                  Select
                </Button>
              </div>

              {/* Drawing tools */}
              <div className="flex items-center gap-1">
                {[
                  { mode: 'create-line' as const, label: 'Line', action: setCreateLine },
                  { mode: 'create-box' as const, label: 'Box', action: setCreateBox },
                  { mode: 'create-fib' as const, label: 'Fib', action: setCreateFib },
                  { mode: 'create-channel' as const, label: 'Channel', action: setCreateChannel },
                ].map((tool) => (
                  <Button
                    key={tool.mode}
                    size="sm"
                    variant={interactionMode === tool.mode ? 'secondary' : 'ghost'}
                    className="rounded-full px-2.5 text-[11px] focus-visible:ring-2 focus-visible:ring-brand"
                    onClick={() => {
                      selectDrawing(null)
                      tool.action()
                    }}
                    disabled={drawingsLoading}
                    data-testid={`drawing-${tool.mode}`}
                  >
                    {tool.label}
                  </Button>
                ))}
              </div>

              {/* History & Delete */}
              <div className="flex items-center gap-1 border-l border-border/50 pl-2">
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full px-2.5 text-[11px] focus-visible:ring-2 focus-visible:ring-brand"
                  onClick={handleUndo}
                  disabled={!canUndo}
                  data-testid="drawing-undo"
                  title="Undo (Ctrl+Z)"
                >
                  Undo
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="rounded-full px-2.5 text-[11px] focus-visible:ring-2 focus-visible:ring-brand"
                  onClick={handleRedo}
                  disabled={!canRedo}
                  data-testid="drawing-redo"
                  title="Redo (Ctrl+Shift+Z)"
                >
                  Redo
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  className="rounded-full px-2.5 text-[11px] focus-visible:ring-2 focus-visible:ring-rose-400"
                  onClick={() => void deleteSelected()}
                  disabled={!selectedDrawingId}
                  data-testid="drawing-delete"
                  title="Delete selected (Del)"
                >
                  Delete
                </Button>
              </div>
            </div>
          </div>

          {/* Collapsible parameters section */}
          <details className="mt-3 group">
            <summary className="cursor-pointer select-none text-[10px] font-semibold uppercase tracking-[0.25em] text-text-tertiary hover:text-text-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded">
              <span className="inline-flex items-center gap-1">
                Parameters
                <svg className="h-3 w-3 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </span>
            </summary>
            <div className="mt-2 grid gap-3 sm:grid-cols-4">
              <label className="space-y-1">
                <span className="text-[11px] text-text-tertiary">SMA Length</span>
                <Input
                  type="number"
                  min={1}
                  value={indicatorSettings.params.sma?.period ?? 20}
                  onChange={(event) => handleParamChange('sma', 'period', Number(event.target.value))}
                  disabled={indicatorSettingsLoading}
                  className="h-8 text-sm"
                />
              </label>
              <label className="space-y-1">
                <span className="text-[11px] text-text-tertiary">EMA Length</span>
                <Input
                  type="number"
                  min={1}
                  value={indicatorSettings.params.ema?.period ?? 50}
                  onChange={(event) => handleParamChange('ema', 'period', Number(event.target.value))}
                  disabled={indicatorSettingsLoading}
                  className="h-8 text-sm"
                />
              </label>
              <label className="space-y-1">
                <span className="text-[11px] text-text-tertiary">BB Length</span>
                <Input
                  type="number"
                  min={1}
                  value={indicatorSettings.params.bb?.period ?? 20}
                  onChange={(event) => handleParamChange('bb', 'period', Number(event.target.value))}
                  disabled={indicatorSettingsLoading}
                  className="h-8 text-sm"
                />
              </label>
              <label className="space-y-1">
                <span className="text-[11px] text-text-tertiary">BB StdDev</span>
                <Input
                  type="number"
                  min={0.1}
                  step={0.1}
                  value={indicatorSettings.params.bb?.deviation ?? 2}
                  onChange={(event) => handleParamChange('bb', 'deviation', Number(event.target.value))}
                  disabled={indicatorSettingsLoading}
                  className="h-8 text-sm"
                />
              </label>
            </div>
          </details>
        </section>

        {showChartSkeleton ? (
          <Card variant="glass" className="rounded-3xl p-4 sm:p-6">
            <SkeletonChartCard />
          </Card>
        ) : (
          <Card variant="glass" className="space-y-6 rounded-3xl p-4 sm:p-6">
            <AdvancedChart
              candles={candles}
              status={status}
              source={source}
              viewState={viewState}
              error={error}
              lastUpdatedAt={lastUpdatedAt}
              indicators={indicators}
              annotations={annotations}
              drawings={drawings}
              drawingsInteractive={interactionMode !== 'view'}
              drawingMode={interactionMode}
              selectedDrawingId={selectedDrawingId}
              onCreateDrawing={handleCreateDrawing}
              onUpdateDrawing={handleUpdateDrawing}
              onCancelDrawingDraft={handleCancelDraft}
              onSelectDrawing={selectDrawing}
              symbol={asset.symbol}
              timeframe={timeframe}
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
          </Card>
        )}

        {status === 'error' && !hasData && (
          <ChartErrorBanner error={error} onRetry={refresh} onOpenSettings={() => navigate('/settings')} />
        )}

        {status === 'stale' && (
          <div className="rounded-2xl border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-warn">
            Showing cached candles because the network request failed.
          </div>
        )}

        {status === 'no-data' && (
          <div className="rounded-2xl border border-border/60 bg-surface-subtle px-4 py-3 text-sm text-text-secondary">
            No candles available yet for {asset.symbol} on {timeframe}. Try another timeframe.
          </div>
        )}
      </div>
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

interface ChartErrorBannerProps {
  error?: string
  onRetry: () => void
  onOpenSettings: () => void
}

function ChartErrorBanner({ error, onRetry, onOpenSettings }: ChartErrorBannerProps) {
  const [showDetails, setShowDetails] = React.useState(false)

  // Detect if error looks like HTML or non-JSON response
  const isHtmlError = error?.includes('<!DOCTYPE') || error?.includes('<html') || error?.includes('Unexpected token')
  const isParssingError = error?.includes('JSON') || error?.includes('parse') || error?.includes('SyntaxError')
  const isNetworkError = error?.includes('fetch') || error?.includes('network') || error?.includes('timeout')

  const friendlyTitle = isHtmlError || isParssingError
    ? 'Data feed unavailable'
    : isNetworkError
      ? 'Connection issue'
      : 'Unable to load chart'

  const friendlyDescription = isHtmlError || isParssingError
    ? 'The data provider returned an unexpected response. This is usually temporary.'
    : isNetworkError
      ? 'Check your internet connection and try again.'
      : 'There was a problem loading chart data. Please try again.'

  return (
    <div
      className="rounded-2xl border border-rose-400/40 bg-rose-500/10 p-4 shadow-card-subtle"
      role="alert"
      data-testid="chart-error-banner"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-semibold text-rose-100">{friendlyTitle}</p>
          <p className="text-xs text-rose-200/80">{friendlyDescription}</p>
        </div>
        <div className="flex flex-shrink-0 items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onRetry}
            className="text-rose-100 hover:bg-rose-500/20"
            data-testid="chart-error-retry"
          >
            Retry
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onOpenSettings}
            className="text-rose-100 hover:bg-rose-500/20"
            data-testid="chart-error-settings"
          >
            Settings
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-rose-200/60 underline hover:text-rose-200"
          >
            {showDetails ? 'Hide details' : 'Show details'}
          </button>
          {showDetails && (
            <pre className="mt-2 max-h-32 overflow-auto rounded-lg bg-black/30 p-2 text-xs text-rose-200/80">
              {error.length > 500 ? `${error.slice(0, 500)}...` : error}
            </pre>
          )}
        </div>
      )}
    </div>
  )
}
