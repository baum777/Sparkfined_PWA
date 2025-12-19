import React from "react"
import Button from "@/components/ui/Button"
import type { ChartTimeframe } from "@/domain/chart"
import { Activity, Download, Filter, Menu, RefreshCw } from "@/lib/icons"

const SUPPORTED_TIMEFRAMES: ChartTimeframe[] = ["15m", "1h", "4h", "1d"]

export interface ChartTopBarProps {
  timeframe: ChartTimeframe
  symbolLabel?: string
  onTimeframeChange: (next: ChartTimeframe) => void
  onOpenSidebar?: () => void
  onOpenToolbar?: () => void
}

export default function ChartTopBar({
  timeframe,
  symbolLabel,
  onTimeframeChange,
  onOpenSidebar,
  onOpenToolbar,
}: ChartTopBarProps) {
  const title = symbolLabel ? `${symbolLabel} · ${timeframe}` : `SOL/USDC · ${timeframe}`

  return (
    <header className="sf-chart-topbar" role="banner">
      <div className="sf-chart-topbar__inner">
        <div className="sf-chart-topbar__left">
          <div className="sf-chart-topbar__mobile-actions">
            <button
              type="button"
              className="sf-chart-icon-button sf-focus-ring"
              onClick={onOpenSidebar}
              aria-label="Open chart sidebar"
            >
              <Menu size={18} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="sf-chart-icon-button sf-focus-ring"
              onClick={onOpenToolbar}
              aria-label="Open chart tools"
            >
              <Filter size={18} aria-hidden="true" />
            </button>
          </div>
          <div className="sf-chart-topbar__meta">
            <span className="sf-chart-topbar__title">{title}</span>
            <span className="sf-chart-topbar__subtitle">Chart foundation (WP-050)</span>
          </div>
        </div>

        <div className="sf-chart-topbar__right">
          <div className="sf-chart-timeframe-toggle" role="group" aria-label="Chart timeframe">
            {SUPPORTED_TIMEFRAMES.map((option) => (
              <button
                key={option}
                type="button"
                className="sf-chart-timeframe-button"
                aria-pressed={timeframe === option}
                onClick={() => onTimeframeChange(option)}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<RefreshCw size={16} aria-hidden />}
              aria-label="Refresh chart"
            >
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Activity size={16} aria-hidden />}
              aria-label="Replay chart"
            >
              Replay
            </Button>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Download size={16} aria-hidden />}
              aria-label="Export chart"
            >
              Export
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}
