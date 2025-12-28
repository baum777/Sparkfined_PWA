import React from "react"
import { Outlet } from "react-router-dom"
import BottomNavBar from "@/features/shell/BottomNavBar"
import Sidebar from "@/features/shell/Sidebar"
import TopBar from "@/features/shell/TopBar"
import { cn } from "@/lib/ui/cn"
import ActionPanel from "./ActionPanel"

const ACTION_PANEL_STORAGE_KEY = "sf.actionPanel.open"

export default function AppShell() {
  const [isActionPanelOpen, setIsActionPanelOpen] = React.useState(() => {
    if (typeof window === "undefined") return false
    const stored = window.localStorage.getItem(ACTION_PANEL_STORAGE_KEY)
    return stored ? stored === "true" : false
  })
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

  return (
    <div
      className={cn(
        "sf-shell",
        !isActionPanelOpen && "sf-shell-action-closed",
      )}
      data-action-panel-open={isActionPanelOpen}
    >
      <aside className="sf-rail sf-rail--sidebar">
        <Sidebar />
      </aside>

      <header className="sf-topbar">
        <TopBar
          onToggleActionPanel={handleToggleActionPanel}
          isActionPanelOpen={isActionPanelOpen}
          actionPanelToggleRef={toggleButtonRef}
        />
      </header>

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
