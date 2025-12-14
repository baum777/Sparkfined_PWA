import React from "react"
import { Link } from "react-router-dom"

interface TopbarProps {
  onToggleActionPanel: () => void
  isActionPanelOpen: boolean
  actionPanelToggleRef: React.RefObject<HTMLButtonElement>
}

export default function Topbar({
  onToggleActionPanel,
  isActionPanelOpen,
  actionPanelToggleRef,
}: TopbarProps) {
  return (
    <div className="sf-topbar-inner">
      <div className="sf-topbar-left">
        <div className="sf-brand" aria-label="Sparkfined brand">
          <span className="sf-brand-dot" />
          <span className="sf-brand-text">Sparkfined</span>
        </div>

        <button className="sf-search" type="button" aria-label="Global search">
          <span className="sf-search-placeholder">Search…</span>
          <span className="sf-kbd">⌘K</span>
        </button>

        <button
          ref={actionPanelToggleRef}
          type="button"
          className="btn btn-ghost btn-sm"
          aria-label="Toggle panel"
          aria-expanded={isActionPanelOpen}
          aria-controls="sf-action-panel"
          onClick={onToggleActionPanel}
        >
          Panel
        </button>
      </div>

      <div className="sf-topbar-center" aria-label="Selected pair">
        <div className="sf-pair">
          <span className="sf-pair-symbol">SOL/USDC</span>
          <span className="sf-pair-meta">• 1m</span>
        </div>
      </div>

      <div className="sf-topbar-right">
        <Link className="btn btn-ghost btn-sm" aria-label="Alerts" to="/alerts">
          🔔
        </Link>
        <Link className="btn btn-ghost btn-sm" aria-label="Settings" to="/settings">
          ⚙︎
        </Link>
      </div>
    </div>
  )
}
