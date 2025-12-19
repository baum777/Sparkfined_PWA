import React from "react"
import ChartSidebar from "./ChartSidebar"
import ChartToolbar from "./ChartToolbar"
import ChartBottomPanel from "./ChartBottomPanel"
import ChartTopBar from "./ChartTopBar"
import "./chart.css"

export default function ChartLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false)
  const [isToolbarOpen, setIsToolbarOpen] = React.useState(false)

  return (
    <section className="sf-chart-layout" aria-label="Chart workspace">
      <ChartTopBar onOpenSidebar={() => setIsSidebarOpen(true)} onOpenToolbar={() => setIsToolbarOpen(true)} />

      <div className="sf-chart-body">
        <ChartSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        <main className="sf-chart-main">
          <div className="sf-chart-placeholder" role="status" aria-live="polite">
            <div>
              <p className="sf-chart-panel-heading">Chart canvas placeholder</p>
              <p className="sf-chart-placeholder__hint">Chart canvas placeholder (WP-051).</p>
            </div>
            <div className="sf-chart-placeholder__grid" aria-hidden="true" />
          </div>
        </main>

        <ChartToolbar isOpen={isToolbarOpen} onClose={() => setIsToolbarOpen(false)} />
      </div>

      <div className="sf-chart-bottom-wrapper">
        <ChartBottomPanel />
      </div>
    </section>
  )
}
