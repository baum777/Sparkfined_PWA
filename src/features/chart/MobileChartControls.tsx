import React from "react"
import { Activity, Filter, Menu } from "@/lib/icons"

export interface MobileChartControlsProps {
  onOpenSidebar: () => void
  onOpenToolbar: () => void
  onOpenReplay?: () => void
}

export default function MobileChartControls({
  onOpenSidebar,
  onOpenToolbar,
  onOpenReplay,
}: MobileChartControlsProps) {
  const hasReplay = Boolean(onOpenReplay)

  return (
    <div className="sf-chart-mobile-controls" role="group" aria-label="Chart quick actions">
      <button
        type="button"
        className="sf-chart-mobile-controls__button sf-focus-ring"
        onClick={onOpenSidebar}
        aria-label="Open chart sidebar"
      >
        <Menu size={18} aria-hidden="true" />
        <span className="sf-chart-mobile-controls__label">Sidebar</span>
      </button>
      <button
        type="button"
        className="sf-chart-mobile-controls__button sf-focus-ring"
        onClick={onOpenToolbar}
        aria-label="Open chart tools"
      >
        <Filter size={18} aria-hidden="true" />
        <span className="sf-chart-mobile-controls__label">Tools</span>
      </button>
      {hasReplay ? (
        <button
          type="button"
          className="sf-chart-mobile-controls__button sf-focus-ring"
          onClick={onOpenReplay}
          aria-label="Open replay controls"
        >
          <Activity size={18} aria-hidden="true" />
          <span className="sf-chart-mobile-controls__label">Replay</span>
        </button>
      ) : null}
    </div>
  )
}
