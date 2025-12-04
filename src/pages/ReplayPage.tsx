import React from "react"
import { useParams, useNavigate, useSearchParams } from "react-router-dom"
import ReplayPlayer from "@/components/ReplayPlayer"
import PatternDashboard from "@/components/PatternDashboard"
import type { ReplaySession, JournalEntry, ReplayBookmark, SetupTag, EmotionTag } from "@/types/journal"
import { getSession, addBookmark, deleteBookmark } from "@/lib/ReplayService"
import { calculatePatternStats, queryEntries } from "@/lib/JournalService"
import AdvancedChart from "@/components/chart/AdvancedChart"
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

const SYMBOL_TO_ASSET: Record<string, { address: string; network: string; symbol: string }> = {
  SOLUSDT: DEFAULT_ASSET,
}

function resolveTimeframe(candidate?: string | null): ChartTimeframe {
  const maybe = candidate as ChartTimeframe | undefined
  if (maybe && ["15m", "1h", "4h", "1d"].includes(maybe)) return maybe
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

    const interval = setInterval(() => {
      setCurrentFrame((prev) => {
        const next = prev + 1
        if (next >= candles.length) {
          setIsPlaying(false)
          return candles.length - 1
        }
        return next
      })
    }, 1000 / speed) // Adjust speed

    return () => clearInterval(interval)
  }, [isPlaying, speed, candles])

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
    navigate(`/journal-v2?entry=${entryId}`)
  }

  // Toggle view mode
  const toggleViewMode = () => {
    setViewMode((prev) => (prev === "player" ? "dashboard" : "player"))
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 text-4xl">⏳</div>
          <p className="text-sm text-ash">Loading replay...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-void-lighter p-4" data-testid="replay-page">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-mist">
              {viewMode === "player" ? "🎬 Replay Player" : "📊 Pattern Dashboard"}
            </h1>
            <p className="text-sm text-ash">
              {viewMode === "player"
                ? "Playback and analyze your trades frame-by-frame"
                : "Discover patterns and insights from your trading history"}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* View Toggle */}
            <button
              onClick={toggleViewMode}
              className="rounded-lg border border-smoke-light bg-smoke/80 px-4 py-2 text-sm font-medium text-fog transition-colors hover:text-mist"
            >
              {viewMode === "player" ? "📊 Dashboard" : "🎬 Player"}
            </button>

            {/* Back Button */}
            <button
              onClick={() => navigate("/journal-v2")}
              className="rounded-lg border border-smoke-light bg-smoke/80 px-4 py-2 text-sm font-medium text-fog transition-colors hover:text-mist"
            >
              ← Journal
            </button>
          </div>
        </div>

        {viewMode === "player" && (
          <div
            className="mb-4 rounded-xl border border-smoke-light bg-smoke/70 px-4 py-3 text-sm text-fog"
            data-testid="replay-mode-banner"
          >
            You’re in replay mode — scrub historical candles, jump to annotations and signals, then hit “Go live” to return to the
            latest price action.
          </div>
        )}

        {/* Player View */}
        {viewMode === "player" && (
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm text-fog">
            {(["15m", "1h", "4h", "1d"] as ChartTimeframe[]).map((tf) => (
              <button
                key={tf}
                onClick={() => handleTimeframeChange(tf)}
                className={`rounded-full px-3 py-1 ${
                  timeframe === tf
                    ? "bg-spark text-white"
                    : "border border-smoke-light bg-smoke/80 text-fog"
                }`}
              >
                {tf}
              </button>
            ))}
            <button
              onClick={() => refresh()}
              className="rounded-full border border-smoke-light bg-smoke/80 px-3 py-1 text-fog"
              disabled={status === "loading"}
            >
              Refresh data
            </button>
            <button
              onClick={handleGoLive}
              className="rounded-full border border-spark bg-spark/40 px-3 py-1 text-spark"
              disabled={!candles.length}
              data-testid="button-go-live"
              title="Jump to the latest candle"
            >
              Go live
            </button>
            {status === "stale" && <span className="text-gold">Using cached data</span>}
            {status === "no-data" && <span className="text-fog">No candles yet</span>}
            {status === "error" && <span className="text-blood">{error}</span>}
            <span className="rounded-full border border-smoke-light px-2 py-0.5 text-xs uppercase text-fog">{mode}</span>
          </div>
        )}

        {/* Player View */}
        {viewMode === "player" && session && (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            {/* Chart Area (2/3 width on large screens) */}
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-smoke-light bg-smoke/60 p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-mist">
                    📈 Chart View
                  </h3>
                  <button
                    onClick={handleOpenChart}
                    className="rounded-lg border border-spark/50 bg-spark/10 px-3 py-1 text-xs font-medium text-spark transition-colors hover:bg-spark/20"
                    title="Open this asset in the live chart"
                  >
                    Open in Chart →
                  </button>
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
                  <div className="mt-3 text-xs text-ash">
                    Frame {currentFrame + 1} / {candles.length}
                  </div>
                )}
                {candles.length === 0 && status === "no-data" && (
                  <div className="mt-3 text-xs text-ash">No replay frames yet for this timeframe.</div>
                )}
              </div>
            </div>

            {/* Player Controls (1/3 width on large screens) */}
            <div className="lg:col-span-1">
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
          </div>
        )}

        {/* Player View - No Session */}
        {viewMode === "player" && !session && (
          <div className="rounded-xl border border-smoke-light bg-smoke/60 p-8 text-center">
            <div className="mb-4 text-6xl">🎬</div>
            <h2 className="mb-2 text-xl font-bold text-mist">
              No Replay Session Selected
            </h2>
            <p className="mb-6 text-sm text-ash">
              Select a journal entry and create a replay session, or browse patterns in the dashboard.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setViewMode("dashboard")}
                className="rounded-lg border border-spark/50 bg-spark/10 px-4 py-2 text-sm font-medium text-spark transition-colors hover:bg-spark/20"
              >
                📊 View Dashboard
              </button>
              <button
                onClick={() => navigate("/journal-v2")}
                className="rounded-lg border border-smoke-light bg-smoke/80 px-4 py-2 text-sm font-medium text-fog transition-colors hover:text-mist"
              >
                ← Back to Journal
              </button>
            </div>
          </div>
        )}

        {/* Dashboard View */}
        {viewMode === "dashboard" && (
          <div>
            {patternStats ? (
              <PatternDashboard
                stats={patternStats}
                entries={entries}
                onFilterByPattern={handleFilterByPattern}
                onViewEntry={handleViewEntry}
              />
            ) : (
              <div className="rounded-xl border border-smoke-light bg-smoke/60 p-8 text-center">
                <div className="mb-4 text-6xl">📊</div>
                <h2 className="mb-2 text-xl font-bold text-mist">
                  No Data Yet
                </h2>
                <p className="text-sm text-ash">
                  Close some trades in your journal to see pattern analysis.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
