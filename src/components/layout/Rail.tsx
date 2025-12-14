import React from "react"
import { NavLink } from "react-router-dom"
import { cn } from "@/lib/ui/cn"

interface RailProps {
  isExpanded: boolean
  onToggleExpand: () => void
}

const items = [
  { to: "/dashboard", label: "Dashboard", icon: "▦" },
  { to: "/analysis", label: "Analysis", icon: "⟐" },
  { to: "/chart", label: "Chart", icon: "⌁" },
  { to: "/watchlist", label: "Watchlist", icon: "★" },
  { to: "/alerts", label: "Alerts", icon: "⚡" },
  { to: "/journal", label: "Journal", icon: "✎" },
]

export default function Rail({ isExpanded, onToggleExpand }: RailProps) {
  return (
    <nav className="sf-rail-inner" aria-label="Primary navigation" data-expanded={isExpanded}>
      <button
        type="button"
        className="sf-rail-toggle"
        aria-pressed={isExpanded}
        aria-label={isExpanded ? "Collapse navigation" : "Expand navigation"}
        onClick={onToggleExpand}
      >
        <span aria-hidden="true">{isExpanded ? "⇠" : "⇢"}</span>
        <span className="sf-rail-label">{isExpanded ? "Collapse" : "Expand"}</span>
      </button>

      <div className="sf-rail-items">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            aria-label={it.label}
            title={it.label}
            className={({ isActive }) =>
              cn("sf-rail-item", isActive && "sf-rail-item-active")
            }
          >
            <span className="sf-rail-icon" aria-hidden="true">{it.icon}</span>
            <span className="sf-rail-label">{it.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
