import React, { Suspense } from "react"
import Button from "@/components/ui/Button"
import { getRecentJournalEntries } from "@/api/journalEntries"
import type { ChartTimeframe } from "@/domain/chart"
import useOhlcData from "@/hooks/useOhlcData"
import type { ChartMarker } from "./markers"
import { mapJournalEntriesToMarkers, mapMarkersToAnnotations } from "./markers"

const AdvancedChart = React.lazy(() => import("@/components/chart/AdvancedChart"))

const DEFAULT_ASSET = {
  symbol: "SOL/USDC",
  address: "So11111111111111111111111111111111111111112",
  network: "solana",
}

export type ChartCanvasProps = {
  symbol: string
  timeframe: ChartTimeframe
  markers: ChartMarker[]
  address?: string
  network?: string
  onCrosshair?: (payload: { time?: number; price?: number }) => void
  onViewport?: (payload: { from?: number; to?: number; scale?: number }) => void
}

const resolvePlaceholderMessage = (status: string | undefined, error?: string) => {
  if (status === "error") return error ?? "Chart unavailable"
  if (status === "no-data") return "No data available for this timeframe yet."
  return "Loading chart…"
}

function ChartCanvasPlaceholder({ message }: { message: string }) {
  return (
    <div className="sf-chart-placeholder" role="status" aria-live="polite">
      <div>
        <p className="sf-chart-panel-heading">Chart canvas</p>
        <p className="sf-chart-placeholder__hint">{message}</p>
      </div>
      <div className="sf-chart-placeholder__grid" aria-hidden="true" />
    </div>
  )
}

export default function ChartCanvas(props: ChartCanvasProps) {
  const resolvedSymbol = props.symbol || DEFAULT_ASSET.symbol
  const resolvedAddress = props.address || DEFAULT_ASSET.address
  const resolvedNetwork = props.network || DEFAULT_ASSET.network
  const [journalMarkers, setJournalMarkers] = React.useState<ChartMarker[]>([])

  const { candles, status, error, source, lastUpdatedAt, viewState, refresh } = useOhlcData({
    address: resolvedAddress,
    symbol: resolvedSymbol,
    timeframe: props.timeframe,
    network: resolvedNetwork,
  })

  React.useEffect(() => {
    let active = true

    const loadMarkers = async () => {
      const entries = await getRecentJournalEntries(8)
      const filtered = entries.filter(
        (entry) => !entry.symbol || entry.symbol.toUpperCase() === resolvedSymbol.toUpperCase()
      )
      const nextMarkers = mapJournalEntriesToMarkers(filtered)
      if (active) {
        setJournalMarkers(nextMarkers)
      }
    }

    loadMarkers()

    return () => {
      active = false
    }
  }, [resolvedSymbol])

  const mergedMarkers = props.markers.length > 0 ? props.markers : journalMarkers
  const annotations = React.useMemo(() => mapMarkersToAnnotations(mergedMarkers), [mergedMarkers])
  const shouldShowRetry = (status === "error" || status === "no-data") && candles.length === 0
  const statusMessage =
    status === "error"
      ? error ?? "Failed to load chart data."
      : "No candles yet for this asset/timeframe."

  return (
    <div className="sf-chart-canvas" data-testid="chart-canvas" aria-label="Chart canvas">
      <Suspense fallback={<ChartCanvasPlaceholder message={resolvePlaceholderMessage(status, error)} />}>
        <AdvancedChart
          candles={candles}
          status={status}
          source={source}
          viewState={viewState}
          error={error}
          lastUpdatedAt={lastUpdatedAt}
          symbol={resolvedSymbol}
          timeframe={props.timeframe}
          annotations={annotations}
        />
      </Suspense>

      {shouldShowRetry && (
        <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-3 text-sm text-slate-300">
          <span>{statusMessage}</span>
          <Button variant="ghost" size="sm" onClick={refresh} aria-label="Retry loading chart data">
            Retry
          </Button>
        </div>
      )}
    </div>
  )
}
