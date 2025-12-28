import React from "react"
import RightSheet from "@/components/ui/RightSheet"
import { chartToolbarSections, type ChartToolbarSectionId } from "./toolbar-sections"

export interface ChartToolbarProps {
  isOpen: boolean
  onClose: () => void
}

const DEFAULT_OPEN_SECTIONS: ChartToolbarSectionId[] = []

function ChartToolbarContent() {
  const [openSections, setOpenSections] = React.useState<ChartToolbarSectionId[]>(DEFAULT_OPEN_SECTIONS)

  const toggleSection = React.useCallback((sectionId: ChartToolbarSectionId) => {
    setOpenSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    )
  }, [])

  return (
    <div className="sf-chart-toolbar__sections">
      {chartToolbarSections.map((section) => {
        const isExpanded = openSections.includes(section.id)
        const panelId = `sf-chart-toolbar-panel-${section.id}`
        const triggerId = `sf-chart-toolbar-trigger-${section.id}`

        return (
          <div key={section.id} className="sf-chart-toolbar__section">
            <button
              type="button"
              className="sf-chart-toolbar__trigger sf-focus-ring"
              onClick={() => toggleSection(section.id)}
              aria-expanded={isExpanded}
              aria-controls={panelId}
              id={triggerId}
              aria-label={`${section.label} tools`}
            >
              <span className="sf-chart-toolbar__trigger-icon">{section.icon}</span>
              <span className="sf-chart-toolbar__trigger-text">
                <span className="sf-chart-panel-heading">{section.label}</span>
                <span className="sf-chart-panel-subtext">{section.description}</span>
              </span>
              <span className="sf-chart-toolbar__chevron" aria-hidden="true">
                <svg viewBox="0 0 20 20">
                  <path
                    d="M5 7.5L10 12.5L15 7.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    fill="none"
                  />
                </svg>
              </span>
            </button>
            <div
              id={panelId}
              role="region"
              aria-labelledby={triggerId}
              className="sf-chart-toolbar__panel"
              data-state={isExpanded ? "open" : "closed"}
            >
              <div className="sf-chart-toolbar__panel-inner">{section.render({ isExpanded })}</div>
            </div>
          </div>
        )
      })}
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
