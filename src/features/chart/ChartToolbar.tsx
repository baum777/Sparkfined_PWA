import React from "react"
import RightSheet from "@/components/ui/RightSheet"

export interface ChartToolbarProps {
  isOpen: boolean
  onClose: () => void
}

function ChartToolbarContent() {
  return (
    <div className="sf-chart-panel-list">
      <div>
        <p className="sf-chart-panel-heading">Indicators</p>
        <p className="sf-chart-panel-subtext">Moving averages, RSI, volume (WP-052).</p>
      </div>
      <ul className="sf-chart-panel-list" aria-label="Indicator presets">
        <li>Default trend stack</li>
        <li>Momentum snapshot</li>
        <li>Volume profile</li>
      </ul>
      <div>
        <p className="sf-chart-panel-heading">Draw tools</p>
        <p className="sf-chart-panel-subtext">Lines, boxes, fibs (WP-052).</p>
      </div>
      <ul className="sf-chart-panel-list" aria-label="Drawing tools">
        <li>Trend line</li>
        <li>Channel</li>
        <li>Fib retracement</li>
      </ul>
      <div>
        <p className="sf-chart-panel-heading">Alerts</p>
        <p className="sf-chart-panel-subtext">Create + manage triggers (WP-076).</p>
      </div>
      <ul className="sf-chart-panel-list" aria-label="Alert shortcuts">
        <li>New alert (stub)</li>
        <li>Active alerts (stub)</li>
      </ul>
    </div>
  )
}

export default function ChartToolbar({ isOpen, onClose }: ChartToolbarProps) {
  return (
    <>
      <aside className="sf-chart-toolbar" aria-label="Chart tools">
        <ChartToolbarContent />
      </aside>

      <RightSheet
        isOpen={isOpen}
        onClose={onClose}
        title="Chart tools"
        subtitle="Indicators, drawings, and alert shortcuts"
        width="sm"
      >
        <ChartToolbarContent />
      </RightSheet>
    </>
  )
}
