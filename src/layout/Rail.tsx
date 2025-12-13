import React from "react"
import { NavLink } from "react-router-dom"
import { cn } from "@/lib/ui/cn"

const items = [
  { to: "/dashboard", label: "Dashboard", icon: "▦" },
  { to: "/scanner", label: "Scanner", icon: "⌁" },
  { to: "/chart", label: "Chart", icon: "⟐" },
  { to: "/trades", label: "Trades", icon: "⇄" },
  { to: "/journal", label: "Journal", icon: "✎" },
]

export default function Rail() {
  return (
    <nav className="sf-rail-inner" aria-label="Primary navigation">
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          className={({ isActive }) =>
            cn("sf-rail-item", isActive && "sf-rail-item-active")
          }
        >
          <span className="sf-rail-icon" aria-hidden="true">{it.icon}</span>
          <span className="sf-rail-label">{it.label}</span>
        </NavLink>
      ))}
    </nav>
  )
}
