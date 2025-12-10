import React from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import ReplayPlayer from "@/components/ReplayPlayer"
import DashboardShell from "@/components/dashboard/DashboardShell"
import PatternDashboard from "@/components/PatternDashboard"
import type { ReplaySession, JournalEntry, ReplayBookmark, SetupTag, EmotionTag } from "@/types/journal"
import { getSession, addBookmark, deleteBookmark } from "@/lib/ReplayService"
import { calculatePatternStats, queryEntries } from "@/lib/JournalService"
import { OhlcReplayEngine } from "@/lib/replay/ohlcReplayEngine"
import AdvancedChart from "@/components/chart/AdvancedChart"
import Button from "@/components/ui/Button"
import StateView from "@/components/ui/StateView"
import { FilterPills } from "@/components/layout/FilterPills"
import { DEFAULT_TIMEFRAME, type ChartAnnotation, type ChartMode, type ChartTimeframe } from "@/domain/chart"
import useOhlcData from "@/hooks/useOhlcData"
import { useIndicators } from "@/hooks/useIndicators"
import { useAlertsStore } from "@/store/alertsStore"
import { useJournalStore } from "@/store/journalStore"
import { useChartUiStore } from "@/store/chartUiStore"
import { mapAlertToAnnotation, mapJournalEntryToAnnotation, mergeAnnotations } from "@/lib/annotations"
import { buildChartUrl } from "@/lib/chartLinks"
import { useChartTelemetry } from "@/lib/chartTelemetry"

type ViewMode = "player" | "dashboard"

const DEFAULT_ASSET = {
  symbol: "SOLUSDT",
  address: "So11111111111111111111111111111111111111112",
  network: "solana",
}

const SUPPORTED_TIMEFRAMES: ChartTimeframe[] = ["15m", "1h", "4h", "1d"]

const SYMBOL_TO_ASSET: Record<string, { address: string; network: string; symbol: string }> = {
  SOLUSDT: DEFAULT_ASSET,
}

function resolveTimeframe(candidate?: string | null): ChartTimeframe {
  const maybe = candidate as ChartTimeframe | undefined
  if (maybe && SUPPORTED_TIMEFRAMES.includes(maybe)) return maybe
  return DEFAULT_TIMEFRAME
}

function resolveAsset(symbol?: string | null, address?: string | null, network?: string | null) {
  if (address) {
    return { address, network: network || DEFAULT_ASSET.network, symbol: symbol || DEFAULT_ASSET.symbol }
  }
  if (symbol) {
    const normalized = symbol.toUpperCase()
    if (SYMBOL_TO_ASSET[normalized]) return SYMBOL_TO_ASSET[normalized]
  }
  return DEFAULT_ASSET
}

export default function ReplayPage() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()

  // State
  const [viewMode, setViewMode] = React.useState<ViewMode>(sessionId ? "player" : "dashboard")
  const [session, setSession] = React.useState<ReplaySession | null>(null)
  const [currentFrame, setCurrentFrame] = React.useState(0)
  const [isPlaying, setIsPlaying] = React.useState(false)
  const [speed, setSpeed] = React.useState(1)
  const [loading, setLoading] = React.useState(false)
  const [timeframe, setTimeframe] = React.useState<ChartTimeframe>(resolveTimeframe(searchParams.get("timeframe")))
  const [mode, setMode] = React.useState<ChartMode>("replay")
  const engineRef = React.useRef<OhlcReplayEngine | null>(null)

  const asset = React.useMemo(
    () => resolveAsset(searchParams.get("symbol"), searchParams.get("address"), searchParams.get("network")),
    [searchParams]
  )

  const indicatorConfig = useChartUiStore((state) => state.getConfigFor(asset.address))
  const overlays = indicatorConfig.overlays
  const { track } = useChartTelemetry()

  // Dashboard state
  const [entries, setEntries] = React.useState<JournalEntry[]>([])
  const [patternStats, setPatternStats] = React.useState<any>(null)

  const { candles, status, error, source, lastUpdatedAt, viewState, refresh } = useOhlcData({
    address: asset.address,
    symbol: asset.symbol,
    timeframe,
    network: asset.network,
  })
  const indicators = useIndicators(candles, overlays)
  const alerts = useAlertsStore((state) => state.alerts)
  const createAlertDraft = useAlertsStore((state) => state.createDraftFromChart)
  const journalEntries = useJournalStore((state) => state.entries)
  const createJournalDraft = useJournalStore((state) => state.createDraftFromChart)
  const annotations = React.useMemo(() => {
    const alertAnnotations = alerts
      .filter((alert) => alert.symbol?.toUpperCase() === asset.symbol.toUpperCase())
      .map(mapAlertToAnnotation)
    const journalAnnotations = journalEntries.map(mapJournalEntryToAnnotation)
    return mergeAnnotations(journalAnnotations, alertAnnotations)
  }, [alerts, asset.symbol, journalEntries])
  const hasFrames = candles.length > 0

  const replayViewState = React.useMemo(
    () => ({ ...viewState, mode, currentIndex: currentFrame, playbackSpeed: speed }),
    [currentFrame, mode, speed, viewState]
  )

  React.useEffect(() => {
    const nextTimeframe = resolveTimeframe(searchParams.get("timeframe"))
    setTimeframe((prev) => (prev === nextTimeframe ? prev : nextTimeframe))
  }, [searchParams])

  React.useEffect(() => {
    track('chart.view_opened', { address: asset.address, timeframe, mode: 'replay' })
  }, [asset.address, timeframe, track])

  React.useEffect(() => {
    if (!hasFrames) {
      setIsPlaying(false)
      setCurrentFrame(0)
    } else if (currentFrame >= candles.length) {
      setCurrentFrame(0)
    }
  }, [candles.length, currentFrame, hasFrames])

  React.useEffect(() => {
    if (!candles.length) {
      engineRef.current?.stop()
      setIsPlaying(false)
      setCurrentFrame(0)
      return undefined
    }

    engineRef.current = new OhlcReplayEngine({
      candles,
      speedMs: speedToMs(speed),
      fromIndex: Math.min(currentFrame, candles.length - 1),
      onTick: ({ index }) => setCurrentFrame(index),
      onComplete: () => setIsPlaying(false),
    })

    return () => {
      engineRef.current?.stop()
    }
  }, [candles, speed, currentFrame])

  React.useEffect(() => {
    if (engineRef.current && engineRef.current.status === "playing") {
      engineRef.current.setSpeed(speedToMs(speed))
    }
  }, [speed])

  // Load session if sessionId provided
  React.useEffect(() => {
    if (sessionId) {
      loadSession(sessionId)
    }
  }, [sessionId])

  // Load dashboard data
  React.useEffect(() => {
    if (viewMode === "dashboard") {
      loadDashboardData()
    }
  }, [viewMode])

  // Playback loop
  React.useEffect(() => {
    if (!isPlaying || candles.length === 0) return

    engineRef.current?.seek(currentFrame)
    const started = engineRef.current?.start()
    if (!started) {
      setIsPlaying(false)
      return undefined
    }

    return () => {
      engineRef.current?.pause()
    }
  }, [isPlaying, currentFrame])

  // Load session
  const loadSession = async (id: string) => {
    setLoading(true)
    try {
      const loaded = await getSession(id)
      if (loaded) {
        setSession(loaded)
        setCurrentFrame(0)
      } else {
        console.error("Session not found:", id)
        // Fallback to dashboard
        setViewMode("dashboard")
      }
    } catch (error) {
      console.error("Error loading session:", error)
    } finally {
      setLoading(false)
  }
}

function speedToMs(speed: number): number {
  const safeSpeed = Math.max(speed, 0.25)
  return 1000 / safeSpeed
}

  // Load dashboard data
  const loadDashboardData = async () => {
    setLoading(true)
    try {
      const allEntries = await queryEntries({ status: "all" })
      setEntries(allEntries)

      const stats = await calculatePatternStats(allEntries)
      setPatternStats(stats)
    } catch (error) {
      console.error("Error loading dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  // Playback controls
  const handlePlay = () => {
    if (!hasFrames) return
    setIsPlaying(true)
    track('chart.replay_started', { address: asset.address, timeframe })
  }
  const handlePause = () => {
    setIsPlaying(false)
    track('chart.replay_stopped', { address: asset.address, timeframe })
  }
  const handleSeek = (frame: number) => {
    if (!hasFrames) return
    setCurrentFrame(frame)
    engineRef.current?.seek(frame)
    setIsPlaying(false)
  }
  const handleSpeedChange = (newSpeed: number) => setSpeed(newSpeed)
  const handleOpenChart = () => {
    const url = buildChartUrl(asset.address, timeframe, { to: Date.now() })
    navigate(url)
  }
  const handleTimeframeChange = (next: ChartTimeframe) => {
    setTimeframe(next)
    const nextParams = new URLSearchParams(searchParams)
    nextParams.set("timeframe", next)
    nextParams.set("symbol", asset.symbol)
    nextParams.set("address", asset.address)
    nextParams.set("network", asset.network)
    setSearchParams(nextParams)
  }

  const handleGoLive = () => {
    if (!candles.length) return
    setMode("live")
    setCurrentFrame(Math.max(0, candles.length - 1))
    setIsPlaying(false)
    track('chart.replay_go_live', { address: asset.address, timeframe })
  }

  const handleJumpToAnnotation = (annotation: ChartAnnotation) => {
    const targetIndex = candles.findIndex((candle) => candle.t >= annotation.candleTime)
    if (targetIndex >= 0) {
      setMode("replay")
      setCurrentFrame(targetIndex)
      setIsPlaying(false)
      track('chart.annotation_jump', { address: asset.address, timeframe, kind: annotation.kind })
    }
  }

  // Bookmark controls
  const handleAddBookmark = async (bookmark: Omit<ReplayBookmark, "id">) => {
    if (!session) return

    const updated = await addBookmark(session.id, bookmark)
    if (updated) {
      setSession(updated)
    }
  }

  const handleDeleteBookmark = async (bookmarkId: string) => {
    if (!session) return

    const updated = await deleteBookmark(session.id, bookmarkId)
    if (updated) {
      setSession(updated)
    }
  }

  const handleJumpToBookmark = (frame: number) => {
    setCurrentFrame(frame)
    setIsPlaying(false)
  }

  // Dashboard controls
  const handleFilterByPattern = (setup?: SetupTag, emotion?: EmotionTag) => {
    // Filter entries
    const filtered = entries.filter((e) => {
      if (setup && e.setup !== setup) return false
      if (emotion && e.emotion !== emotion) return false
      return true
    })

    // Update stats with filtered entries
    calculatePatternStats(filtered).then(setPatternStats)
  }

  const handleViewEntry = (entryId: string) => {
    navigate(`/journal?entry=${entryId}`)
  }

  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "player" ? "dashboard" : "player"))
  }

  const isHydrating = loading && viewMode === "player" && !session

  return (
    <div data-testid="replay-page">
      <DashboardShell
        title="Replay"
        description="Historical playback and pattern analytics to stress-test your execution."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="ghost" size="sm" onClick={toggleViewMode}>
              {viewMode === "player" ? "View dashboard" : "View player"}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => navigate('/journal')}>
              Journal
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          {viewMode === "player" ? (
            <>
              <div
                className="rounded-3xl border border-border/70 bg-surface/90 px-4 py-3 text-sm text-text-secondary shadow-card-subtle backdrop-blur-lg"
                data-testid="replay-mode-banner"
              >
                You’re in replay mode — scrub historical candles, jump to annotations and signals, then hit “Go live” to return to live
                price action.
              </div>

              <section className="space-y-4 rounded-3xl border border-border/70 bg-surface/90 p-4 shadow-card-subtle backdrop-blur-lg sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <FilterPills options={SUPPORTED_TIMEFRAMES} active={timeframe} onChange={handleTimeframeChange} />
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={() => refresh()} disabled={status === "loading"}>
                      Refresh data
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleGoLive}
                      disabled={!candles.length}
                      data-testid="button-go-live"
                      title="Jump to the latest candle"
                    >
                      Go live
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleOpenChart}>
                      Open live chart
                    </Button>
                    <span className="rounded-full border border-border/70 px-2 py-0.5 text-xs uppercase text-text-tertiary">{mode}</span>
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs text-text-secondary">
                  {status === "stale" && <span className="text-warn">Using cached data</span>}
                  {status === "no-data" && <span>No candles yet</span>}
                  {status === "error" && <span className="text-danger">{error}</span>}
                </div>
              </section>

              {isHydrating ? (
                <div className="rounded-3xl border border-border/70 bg-surface/90 shadow-card-subtle">
                  <StateView type="loading" description="Loading replay session…" />
                </div>
              ) : session ? (
                <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
                  <div className="space-y-3 rounded-3xl border border-border/70 bg-surface/90 p-4 shadow-card-subtle backdrop-blur-lg sm:p-6">
                    <div className="flex items-center justify-between gap-3 text-sm text-text-secondary">
                      <h3 className="text-base font-semibold text-text-primary">Chart View</h3>
                      <Button variant="ghost" size="sm" onClick={handleOpenChart}>
                        Open live chart
                      </Button>
                    </div>

                    <AdvancedChart
                      candles={candles}
                      status={status}
                      source={source}
                      viewState={replayViewState}
                      error={error}
                      replayLabel={`Replay: ${session.name ?? session.id}`}
                      lastUpdatedAt={lastUpdatedAt}
                      indicators={indicators}
                      annotations={annotations}
                      onCreateJournalAtPoint={() => {
                        void createJournalDraft({
                          address: asset.address,
                          symbol: asset.symbol,
                          price: candles[candles.length - 1]?.c ?? 0,
                          time: candles[candles.length - 1]?.t ?? Date.now(),
                          timeframe,
                        })
                        track('chart.journal_created_from_chart', { address: asset.address, timeframe })
                      }}
                      onCreateAlertAtPoint={() => {
                        createAlertDraft({
                          address: asset.address,
                          symbol: asset.symbol,
                          price: candles[candles.length - 1]?.c ?? 0,
                          time: candles[candles.length - 1]?.t ?? Date.now(),
                          timeframe,
                        })
                        track('chart.alert_created_from_chart', { address: asset.address, timeframe })
                      }}
                      onAnnotationClick={(annotation) => handleJumpToAnnotation(annotation)}
                    />

                    {candles.length > 0 && (
                      <p className="text-xs text-text-secondary">
                        Frame {currentFrame + 1} / {candles.length}
                      </p>
                    )}
                    {candles.length === 0 && status === "no-data" && (
                      <p className="text-xs text-text-secondary">No replay frames yet for this timeframe.</p>
                    )}
                  </div>

                  <ReplayPlayer
                    session={session}
                    currentFrame={currentFrame}
                    totalFrames={candles.length}
                    isPlaying={hasFrames && isPlaying}
                    speed={speed}
                    onPlay={handlePlay}
                    onPause={handlePause}
                    onSeek={handleSeek}
                    onSpeedChange={handleSpeedChange}
                    onAddBookmark={handleAddBookmark}
                    onDeleteBookmark={handleDeleteBookmark}
                    onJumpToBookmark={handleJumpToBookmark}
                  />
                </div>
              ) : (
                <div className="rounded-3xl border border-border/70 bg-surface/90 p-8 text-center shadow-card-subtle">
                  <StateView
                    type="empty"
                    title="No replay session selected"
                    description="Create a replay from your journal or open the dashboard to explore patterns."
                    actionLabel="View dashboard"
                    onAction={() => setViewMode("dashboard")}
                  />
                </div>
              )}
            </>
          ) : (
            <section className="rounded-3xl border border-border/70 bg-surface/90 p-4 shadow-card-subtle backdrop-blur-lg sm:p-6">
              {patternStats ? (
                <PatternDashboard
                  stats={patternStats}
                  entries={entries}
                  onFilterByPattern={handleFilterByPattern}
                  onViewEntry={handleViewEntry}
                />
              ) : (
                <StateView
                  type="empty"
                  title="No data yet"
                  description="Close some trades in your journal to see pattern analysis."
                  compact={false}
                />
              )}
            </section>
          )}
        </div>
      </DashboardShell>
    </div>
  )
}
