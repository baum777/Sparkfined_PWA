import React from "react"
import { Outlet } from "react-router-dom"
import { cn } from "@/lib/ui/cn"
import Topbar from "./Topbar"
import Rail from "./Rail"
import ActionPanel from "./ActionPanel"

export default function AppShell() {
  const [isActionPanelOpen, setIsActionPanelOpen] = React.useState(() => {
    if (typeof window === "undefined") return true
    const stored = window.localStorage.getItem("sf.actionPanel.open")
    return stored ? stored === "true" : true
  })
  const toggleButtonRef = React.useRef<HTMLButtonElement>(null)

  React.useEffect(() => {
    if (typeof window === "undefined") return
    window.localStorage.setItem("sf.actionPanel.open", isActionPanelOpen ? "true" : "false")
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
      className={cn("sf-shell", !isActionPanelOpen && "sf-shell-action-closed")}
      data-action-panel-open={isActionPanelOpen}
    >
      <header className="sf-topbar">
        <Topbar
          onToggleActionPanel={handleToggleActionPanel}
          isActionPanelOpen={isActionPanelOpen}
          actionPanelToggleRef={toggleButtonRef}
        />
      </header>

      <aside className="sf-rail">
        <Rail />
      </aside>

      <main id="main-content" tabIndex={-1} className="sf-canvas">
        <Outlet />
      </main>

      {isActionPanelOpen ? (
        <aside className="sf-action hidden xl:flex" id="sf-action-panel">
          <ActionPanel onClose={handleCloseActionPanel} />
        </aside>
      ) : null}
    </div>
  )
}
