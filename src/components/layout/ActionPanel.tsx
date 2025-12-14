import React from "react"
import { Link, useLocation } from "react-router-dom"
import Button from "@/components/ui/Button"

interface ActionPanelProps {
  onClose: () => void
}

function DashboardInspector() {
  return (
    <div className="sf-subpanel" aria-label="Dashboard inspector">
      <div className="sf-subpanel-title">Dashboard focus</div>
      <div className="sf-chips" aria-label="Dashboard ranges">
        {["Today", "7D", "30D"].map((x) => (
          <button key={x} type="button" className="sf-chip">{x}</button>
        ))}
      </div>
      <div className="sf-divider" />
      <div className="space-y-2 text-sm text-[rgb(var(--text-1)/0.9)]">
        <div className="sf-mini-row">
          <span className="sf-mini-label">Status</span>
          <span className="sf-field-meta">Live widgets · OK</span>
        </div>
        <div className="sf-mini-row">
          <span className="sf-mini-label">Filters</span>
          <Button variant="ghost" size="sm">Scope</Button>
        </div>
        <div className="sf-mini-row">
          <span className="sf-mini-label">Telemetry</span>
          <span className="sf-field-meta">No incidents</span>
        </div>
      </div>
    </div>
  )
}

function JournalInspector() {
  return (
    <div className="sf-subpanel" aria-label="Journal inspector">
      <div className="sf-subpanel-title">Journal tools</div>
      <div className="flex flex-wrap gap-2">
        <Button variant="secondary" size="sm">New entry</Button>
        <Button variant="ghost" size="sm">Templates</Button>
        <Button variant="ghost" size="sm">Tag library</Button>
      </div>
      <div className="sf-divider" />
      <div className="space-y-2 text-sm text-[rgb(var(--text-1)/0.9)]">
        <div className="sf-mini-row">
          <span className="sf-mini-label">Drafts</span>
          <span className="sf-field-meta">2 pending</span>
        </div>
        <div className="sf-field-row">
          <div className="sf-field-label">Quick tags</div>
          <div className="sf-field-meta">Add to next entry</div>
        </div>
        <div className="sf-chips" aria-label="Journal quick tags">
          {["A+ setup", "Review", "Mindset"].map((chip) => (
            <button key={chip} type="button" className="sf-chip">{chip}</button>
          ))}
        </div>
      </div>
    </div>
  )
}

function DefaultInspector() {
  return (
    <div className="sf-subpanel" aria-label="Inspector overview">
      <div className="sf-subpanel-title">Empty state</div>
      <p className="text-sm leading-relaxed text-[rgb(var(--text-2)/0.9)]">
        Open the panel to jump between dashboards, charting, or your journal. Shortcuts and quick links keep navigation tight while
        leaving the main canvas unobstructed.
      </p>
    </div>
  )
}

function ShortcutSection() {
  return (
    <div className="sf-subpanel" aria-label="Shortcuts and help">
      <div className="sf-subpanel-title">Shortcuts</div>
      <ul className="space-y-2 text-sm text-[rgb(var(--text-1)/0.9)]">
        <li className="sf-mini-row"><span className="sf-mini-label">Search</span><span className="sf-kbd">⌘K</span></li>
        <li className="sf-mini-row"><span className="sf-mini-label">Jump to journal</span><span className="sf-kbd">J</span></li>
        <li className="sf-mini-row"><span className="sf-mini-label">Toggle panel</span><span className="sf-kbd">P</span></li>
      </ul>
    </div>
  )
}

function RecentSection() {
  return (
    <div className="sf-subpanel" aria-label="Recent activity">
      <div className="sf-subpanel-title">Recent</div>
      <div className="space-y-2 text-sm text-[rgb(var(--text-1)/0.85)]">
        <div className="sf-mini-row">
          <span className="sf-mini-label">Last note</span>
          <span className="sf-field-meta">Journal · 2h ago</span>
        </div>
        <div className="sf-mini-row">
          <span className="sf-mini-label">Replay</span>
          <span className="sf-field-meta">Dashboard · SOL/USDC</span>
        </div>
        <div className="sf-mini-row">
          <span className="sf-mini-label">Alerts</span>
          <span className="sf-field-meta">Muted until tomorrow</span>
        </div>
      </div>
    </div>
  )
}

function QuickLinksSection() {
  return (
    <div className="sf-subpanel" aria-label="Quick navigation">
      <div className="sf-subpanel-title">Quick links</div>
      <div className="sf-chips" aria-label="Primary quick links">
        <Link to="/dashboard" className="sf-chip">Dashboard</Link>
        <Link to="/journal" className="sf-chip">Journal</Link>
        <Link to="/chart" className="sf-chip">Chart</Link>
      </div>
    </div>
  )
}

export default function ActionPanel({ onClose }: ActionPanelProps) {
  const location = useLocation()
  const pathname = location.pathname
  const context = React.useMemo(() => {
    if (pathname.startsWith("/dashboard")) return <DashboardInspector />
    if (pathname.startsWith("/journal")) return <JournalInspector />
    return <DefaultInspector />
  }, [pathname])

  return (
    <div className="sf-action-inner">
      <div className="sf-panel">
        <div className="sf-panel-header sf-panel-header-with-actions">
          <div className="sf-panel-title">Inspector</div>
          <div className="sf-panel-actions">
            <button
              type="button"
              className="sf-panel-close"
              aria-label="Close panel"
              onClick={onClose}
            >
              ✕
            </button>
          </div>
          <div className="sf-panel-dna" />
        </div>

        <div className="sf-panel-body space-y-4">
          {context}
          <QuickLinksSection />
          <ShortcutSection />
          <RecentSection />
        </div>
      </div>
    </div>
  )
}
