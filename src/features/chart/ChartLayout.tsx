import React from "react"
import { useSearchParams } from "react-router-dom"
import type { ChartTimeframe } from "@/domain/chart"
import { DEFAULT_TIMEFRAME } from "@/domain/chart"
import ChartBottomPanel from "./ChartBottomPanel"
import ChartCanvas from "./ChartCanvas"
import ChartSidebar from "./ChartSidebar"
import ChartToolbar from "./ChartToolbar"
import ChartTopBar from "./ChartTopBar"
import MobileChartControls from "./MobileChartControls"
import "./chart.css"

const DEFAULT_ASSET = {
  symbol: "SOL/USDC",
  address: "So11111111111111111111111111111111111111112",
  network: "solana",
}

const SUPPORTED_TIMEFRAMES: ChartTimeframe[] = ["15m", "1h", "4h", "1d"]

const resolveTimeframe = (candidate?: string | null): ChartTimeframe => {
  const maybe = candidate as ChartTimeframe | undefined
  if (maybe && SUPPORTED_TIMEFRAMES.includes(maybe)) return maybe
  return DEFAULT_TIMEFRAME
}

const resolveAsset = (symbol?: string | null, address?: string | null, network?: string | null) => {
  if (address) {
    return {
      address,
      network: network || DEFAULT_ASSET.network,
      symbol: symbol || DEFAULT_ASSET.symbol,
    }
  }
  if (symbol) {
    return {
      address: DEFAULT_ASSET.address,
      network: network || DEFAULT_ASSET.network,
      symbol: symbol.toUpperCase(),
    }
  }
  return DEFAULT_ASSET
}

export default function ChartLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)
  const [isToolbarOpen, setIsToolbarOpen] = React.useState(false)
  const [isMobile, setIsMobile] = React.useState(() => {
    if (typeof window === "undefined") return false
    return window.matchMedia("(max-width: 767px)").matches
  })
  const [searchParams, setSearchParams] = useSearchParams()
  const resolveSelection = React.useCallback(
    (params: URLSearchParams) => ({
      timeframe: resolveTimeframe(params.get("timeframe")),
      asset: resolveAsset(params.get("symbol"), params.get("address"), params.get("network")),
    }),
    []
  )
  const [timeframe, setTimeframe] = React.useState<ChartTimeframe>(
    resolveSelection(searchParams).timeframe
  )
  const emptyMarkers = React.useMemo(() => [], [])

  const asset = React.useMemo(() => resolveSelection(searchParams).asset, [resolveSelection, searchParams])

  React.useEffect(() => {
    const nextTimeframe = resolveSelection(searchParams).timeframe
    setTimeframe((prev) => (prev === nextTimeframe ? prev : nextTimeframe))
  }, [resolveSelection, searchParams])

  React.useEffect(() => {
    if (typeof window === "undefined") return undefined
    const mediaQuery = window.matchMedia("(max-width: 767px)")
    const handleChange = (event: MediaQueryListEvent) => {
      setIsMobile(event.matches)
    }

    setIsMobile(mediaQuery.matches)

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", handleChange)
      return () => mediaQuery.removeEventListener("change", handleChange)
    }

    mediaQuery.addListener(handleChange)
    return () => mediaQuery.removeListener(handleChange)
  }, [])

  React.useEffect(() => {
    const { timeframe: nextTimeframe, asset: nextAsset } = resolveSelection(searchParams)
    const shouldUpdate =
      !searchParams.get("timeframe") ||
      !searchParams.get("symbol") ||
      !searchParams.get("address") ||
      !searchParams.get("network")

    if (!shouldUpdate) return

    const nextParams = new URLSearchParams(searchParams)
    if (!searchParams.get("timeframe")) nextParams.set("timeframe", nextTimeframe)
    if (!searchParams.get("symbol")) nextParams.set("symbol", nextAsset.symbol)
    if (!searchParams.get("address")) nextParams.set("address", nextAsset.address)
    if (!searchParams.get("network")) nextParams.set("network", nextAsset.network)
    setSearchParams(nextParams, { replace: true })
  }, [resolveSelection, searchParams, setSearchParams])

  const handleTimeframeChange = React.useCallback(
    (next: ChartTimeframe) => {
      setTimeframe(next)
      const nextParams = new URLSearchParams(searchParams)
      nextParams.set("timeframe", next)
      nextParams.set("address", asset.address)
      nextParams.set("symbol", asset.symbol)
      nextParams.set("network", asset.network)
      setSearchParams(nextParams)
    },
    [asset.address, asset.network, asset.symbol, searchParams, setSearchParams]
  )

  return (
    <section className="sf-chart-layout" aria-label="Chart workspace">
      <ChartTopBar
        timeframe={timeframe}
        symbolLabel={asset.symbol}
        onTimeframeChange={handleTimeframeChange}
        onOpenSidebar={() => setIsSidebarOpen(true)}
        onOpenToolbar={() => setIsToolbarOpen(true)}
      />

      {isMobile ? (
        <MobileChartControls
          onOpenSidebar={() => setIsSidebarOpen(true)}
          onOpenToolbar={() => setIsToolbarOpen(true)}
        />
      ) : null}

      <div className="sf-chart-body">
        <ChartSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="sf-chart-main">
          <ChartCanvas
            symbol={asset.symbol}
            address={asset.address}
            network={asset.network}
            timeframe={timeframe}
            markers={emptyMarkers}
          />
        </main>

        <ChartToolbar isOpen={isToolbarOpen} onClose={() => setIsToolbarOpen(false)} />
      </div>

      <div className="sf-chart-bottom-wrapper">
        <ChartBottomPanel />
      </div>
    </section>
  )
}
