import React from "react"
import { NavLink, useLocation } from "react-router-dom"
import { cn } from "@/lib/ui/cn"
import {
  NAV_ITEMS,
  SETTINGS_NAV_ITEM,
  isNavItemActive,
  type NavigationItem,
} from "@/config/navigation"
import "./sidebar.css"

interface SidebarLinkProps {
  item: NavigationItem
  isActive: boolean
}

function SidebarLink({ item, isActive }: SidebarLinkProps) {
  return (
    <NavLink
      key={item.path}
      to={item.path}
      id={item.tourId || undefined}
      data-testid={item.testId}
      aria-label={item.label}
      aria-current={isActive ? "page" : undefined}
      title={item.label}
      className={({ isActive: navActive }) =>
        cn("sf-sidebar__link", (navActive || isActive) && "sf-sidebar__link--active")
      }
    >
      {({ isActive: navActive }) => {
        const active = navActive || isActive
        return (
          <>
            <span className="sf-sidebar__icon" aria-hidden="true">
              <item.Icon size={22} strokeWidth={active ? 2.4 : 2} />
            </span>
            <span className="sf-sidebar__tooltip" role="tooltip">
              {item.label}
            </span>
          </>
        )
      }}
    </NavLink>
  )
}

export default function Sidebar() {
  const { pathname } = useLocation()

  return (
    <nav className="sf-sidebar-rail" aria-label="Primary navigation">
      <div className="sf-sidebar__inner">
        <div className="sf-sidebar__stack">
          {NAV_ITEMS.map((item) => (
            <SidebarLink key={item.path} item={item} isActive={isNavItemActive(pathname, item)} />
          ))}
        </div>

        <div className="sf-sidebar__settings" aria-label="Settings">
          <SidebarLink
            item={SETTINGS_NAV_ITEM}
            isActive={isNavItemActive(pathname, SETTINGS_NAV_ITEM)}
          />
        </div>
      </div>
    </nav>
  )
}
