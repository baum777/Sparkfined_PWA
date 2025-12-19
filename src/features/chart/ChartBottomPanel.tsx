import React from "react"
import { ChevronDown, ChevronUp } from "@/lib/icons"

const TABS = [
  { id: "pulse", label: "Grok Pulse" },
  { id: "notes", label: "Journal Notes" },
] as const

type TabId = (typeof TABS)[number]["id"]

export default function ChartBottomPanel() {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<TabId>("pulse")
  const panelId = React.useId()

  return (
    <section
      className="sf-chart-bottom-panel"
      aria-label="Chart bottom panel"
      data-collapsed={isCollapsed}
    >
      <div className="sf-chart-bottom-panel__header">
        <span className="sf-chart-panel-heading">Insight panel</span>
        <button
          type="button"
          className="sf-chart-icon-button sf-focus-ring"
          onClick={() => setIsCollapsed((prev) => !prev)}
          aria-expanded={!isCollapsed}
          aria-controls={panelId}
        >
          {isCollapsed ? <ChevronUp size={18} aria-hidden /> : <ChevronDown size={18} aria-hidden />}
          <span className="sr-only">{isCollapsed ? "Expand" : "Collapse"} bottom panel</span>
        </button>
      </div>

      <div className="sf-chart-bottom-panel__content" id={panelId}>
        <div className="sf-chart-bottom-panel__tabs" role="tablist" aria-label="Bottom panel tabs">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={activeTab === tab.id}
              className="sf-chart-bottom-panel__tab"
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="sf-chart-bottom-panel__body" role="tabpanel" aria-live="polite">
          {activeTab === "pulse"
            ? "Grok Pulse placeholder — sentiment deltas and signals land in WP-053."
            : "Journal Notes placeholder — inline notes will be wired in WP-053."}
        </div>
      </div>
    </section>
  )
}
