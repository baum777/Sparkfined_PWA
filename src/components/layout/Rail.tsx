import React from "react"
import { NavLink, useLocation } from "react-router-dom"
import { cn } from "@/lib/ui/cn"
import { NAV_ITEMS, isNavItemActive } from "@/config/navigation"

interface RailProps {
  isExpanded: boolean
  onToggleExpand: () => void
}

export default function Rail({ isExpanded, onToggleExpand }: RailProps) {
  const { pathname } = useLocation()

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
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            aria-label={item.label}
            title={item.label}
            data-testid={item.testId}
            aria-current={isNavItemActive(pathname, item) ? "page" : undefined}
            className={({ isActive }) => {
              const active = isActive || isNavItemActive(pathname, item)
              return cn("sf-rail-item", active && "sf-rail-item-active")
            }}
          >
            <span className="sf-rail-icon" aria-hidden="true">
              <item.Icon size={18} />
            </span>
            <span className="sf-rail-label">{item.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
