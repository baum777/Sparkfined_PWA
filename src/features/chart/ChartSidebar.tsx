import React from "react"
import BottomSheet from "@/shared/components/BottomSheet"

export interface ChartSidebarProps {
  isOpen: boolean
  onClose: () => void
}

function ChartSidebarContent() {
  return (
    <div className="sf-chart-panel-list">
      <div>
        <p className="sf-chart-panel-heading">Markets</p>
        <p className="sf-chart-panel-subtext">Primary pair + recent symbols.</p>
      </div>
      <ul className="sf-chart-panel-list" aria-label="Market shortcuts">
        <li>SOL/USDC · Primary</li>
        <li>BTC/USDC · Watchlist</li>
        <li>ETH/USDC · Watchlist</li>
      </ul>
      <div>
        <p className="sf-chart-panel-heading">Sessions</p>
        <p className="sf-chart-panel-subtext">Replay states and snapshots (WP-054).</p>
      </div>
      <ul className="sf-chart-panel-list" aria-label="Chart sessions">
        <li>Latest replay · 2h ago</li>
        <li>Saved layout · Not configured</li>
      </ul>
    </div>
  )
}

export default function ChartSidebar({ isOpen, onClose }: ChartSidebarProps) {
  return (
    <>
      <aside className="sf-chart-sidebar" aria-label="Chart sidebar">
        <ChartSidebarContent />
      </aside>

      <BottomSheet
        isOpen={isOpen}
        onClose={onClose}
        title="Chart sidebar"
        subtitle="Markets, sessions, and quick access"
      >
        <ChartSidebarContent />
      </BottomSheet>
    </>
  )
}
