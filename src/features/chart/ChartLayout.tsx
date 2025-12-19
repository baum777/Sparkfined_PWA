import React from "react"
import { useSearchParams } from "react-router-dom"
import type { ChartTimeframe } from "@/domain/chart"
import { DEFAULT_TIMEFRAME } from "@/domain/chart"
import ChartBottomPanel from "./ChartBottomPanel"
import ChartCanvas from "./ChartCanvas"
import ChartSidebar from "./ChartSidebar"
import ChartToolbar from "./ChartToolbar"
import ChartTopBar from "./ChartTopBar"
import "./chart.css"

const DEFAULT_ASSET = {
  symbol: "SOLUSDT",
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
  const [searchParams, setSearchParams] = useSearchParams()
  const [timeframe, setTimeframe] = React.useState<ChartTimeframe>(resolveTimeframe(searchParams.get("timeframe")))
  const emptyMarkers = React.useMemo(() => [], [])

  const asset = React.useMemo(
    () => resolveAsset(searchParams.get("symbol"), searchParams.get("address"), searchParams.get("network")),
    [searchParams]
  )

  React.useEffect(() => {
    const nextTimeframe = resolveTimeframe(searchParams.get("timeframe"))
    setTimeframe((prev) => (prev === nextTimeframe ? prev : nextTimeframe))
  }, [searchParams])

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
