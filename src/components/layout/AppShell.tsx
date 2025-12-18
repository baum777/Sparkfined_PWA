import React from "react"
import { Outlet } from "react-router-dom"
import { cn } from "@/lib/ui/cn"
import Topbar from "./Topbar"
import Rail from "./Rail"
import ActionPanel from "./ActionPanel"
import BottomNavBar from "@/features/shell/BottomNavBar"

const ACTION_PANEL_STORAGE_KEY = "sf.actionPanel.open"

export default function AppShell() {
  const [isActionPanelOpen, setIsActionPanelOpen] = React.useState(() => {
    if (typeof window === "undefined") return false
    const stored = window.localStorage.getItem(ACTION_PANEL_STORAGE_KEY)
    return stored ? stored === "true" : false
  })
  const [isRailExpanded, setIsRailExpanded] = React.useState(false)
  const toggleButtonRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem(
      ACTION_PANEL_STORAGE_KEY,
      isActionPanelOpen ? "true" : "false",
    )
  }, [isActionPanelOpen])

  const handleCloseActionPanel = React.useCallback(() => {
    setIsActionPanelOpen(false)
    toggleButtonRef.current?.focus()
  }, [])

  const handleToggleActionPanel = React.useCallback(() => {
    setIsActionPanelOpen((prev) => !prev)
  }, [])

  const handleToggleRail = React.useCallback(() => {
    setIsRailExpanded((prev) => !prev)
  }, [])

  return (
    <div
      className={cn(
        "sf-shell",
        !isActionPanelOpen && "sf-shell-action-closed",
        isRailExpanded && "sf-shell-rail-expanded",
      )}
      data-action-panel-open={isActionPanelOpen}
      data-rail-expanded={isRailExpanded}
    >
      <header className="sf-topbar">
        <Topbar
          onToggleActionPanel={handleToggleActionPanel}
          isActionPanelOpen={isActionPanelOpen}
          actionPanelToggleRef={toggleButtonRef}
        />
      </header>

      <aside className="sf-rail" data-expanded={isRailExpanded}>
        <Rail isExpanded={isRailExpanded} onToggleExpand={handleToggleRail} />
      </aside>

      <main id="main-content" tabIndex={-1} className={cn("sf-canvas")}>
        <Outlet />
      </main>

      {isActionPanelOpen ? (
        <aside className="sf-action hidden xl:flex" id="sf-action-panel">
          <ActionPanel onClose={handleCloseActionPanel} />
        </aside>
      ) : null}

      <BottomNavBar />
    </div>
  )
}
