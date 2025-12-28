import React from "react"
import { useSearchParams } from "react-router-dom"
import { ChevronDown, ChevronUp } from "@/lib/icons"
import GrokPulseCard from "./GrokPulseCard"
import InlineJournalNotes from "./InlineJournalNotes"

const TABS = [
  { id: "pulse", label: "Grok Pulse" },
  { id: "notes", label: "Journal Notes" },
] as const

type TabId = (typeof TABS)[number]["id"]

export default function ChartBottomPanel() {
  const [isCollapsed, setIsCollapsed] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<TabId>("pulse")
  const panelId = React.useId()
  const [searchParams] = useSearchParams()
  const symbol = searchParams.get("symbol")
  const timeframe = searchParams.get("timeframe")

  const tabsId = `${panelId}-tabs`

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

      <div
        className="sf-chart-bottom-panel__content"
        id={panelId}
        hidden={isCollapsed}
        aria-hidden={isCollapsed}
      >
        <div className="sf-chart-bottom-panel__tabs" role="tablist" aria-label="Bottom panel tabs" id={tabsId}>
          {TABS.map((tab) => {
            const tabButtonId = `${panelId}-tab-${tab.id}`
            const tabPanelId = `${panelId}-panel-${tab.id}`

            return (
              <button
                key={tab.id}
                type="button"
                id={tabButtonId}
                role="tab"
                aria-selected={activeTab === tab.id}
                aria-controls={tabPanelId}
                className="sf-chart-bottom-panel__tab"
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            )
          })}
        </div>

        <div className="sf-chart-bottom-panel__panels" aria-live="polite">
          {TABS.map((tab) => {
            const tabButtonId = `${panelId}-tab-${tab.id}`
            const tabPanelId = `${panelId}-panel-${tab.id}`
            const isActive = activeTab === tab.id

            return (
              <div
                key={tab.id}
                id={tabPanelId}
                role="tabpanel"
                aria-labelledby={tabButtonId}
                className="sf-chart-bottom-panel__panel"
                hidden={!isActive}
              >
                {isActive && tab.id === "pulse" ? <GrokPulseCard symbol={symbol} timeframe={timeframe} /> : null}
                {isActive && tab.id === "notes" ? <InlineJournalNotes symbol={symbol} timeframe={timeframe} /> : null}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
