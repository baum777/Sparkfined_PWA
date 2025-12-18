import React from "react"
import { Link, useLocation } from "react-router-dom"
import { NAV_ITEMS, SETTINGS_NAV_ITEM, isNavItemActive } from "@/config/navigation"
import { cn } from "@/lib/ui/cn"
import { useTheme } from "@/features/theme/useTheme"
import { useAlertsStore } from "@/store/alertsStore"
import { Moon, Sun } from "@/lib/icons"
import "./top-bar.css"

interface TopBarProps {
  onToggleActionPanel: () => void
  isActionPanelOpen: boolean
  actionPanelToggleRef: React.RefObject<HTMLButtonElement>
}

export default function TopBar({
  onToggleActionPanel,
  isActionPanelOpen,
  actionPanelToggleRef,
}: TopBarProps) {
  const { pathname } = useLocation()
  const { resolvedTheme, setTheme } = useTheme()
  const alertsCount = useAlertsStore(
    (state) => state.alerts.filter((alert) => alert.status === "triggered").length,
  )
  const alertsNavItem = React.useMemo(
    () => NAV_ITEMS.find((item) => item.label === "Alerts"),
    [],
  )

  const title = React.useMemo(() => {
    const match =
      NAV_ITEMS.find((item) => isNavItemActive(pathname, item)) ??
      (isNavItemActive(pathname, SETTINGS_NAV_ITEM) ? SETTINGS_NAV_ITEM : null)

    return match?.label ?? "Sparkfined"
  }, [pathname])

  const handleThemeToggle = React.useCallback(() => {
    const next = resolvedTheme === "dark" ? "light" : "dark"
    setTheme(next)
  }, [resolvedTheme, setTheme])

  const AlertsIcon = React.useMemo(() => alertsNavItem?.Icon, [alertsNavItem])
  const SettingsIcon = React.useMemo(() => SETTINGS_NAV_ITEM.Icon, [])

  return (
    <div className="sf-topbar-inner">
      <div className="sf-topbar-left">
        <div className="sf-topbar-title" aria-label="Current page">
          <span className="sf-topbar-title-text">{title}</span>
        </div>

        <button
          ref={actionPanelToggleRef}
          type="button"
          className={cn(
            "sf-icon-button sf-icon-button--ghost sf-topbar-panel-toggle",
            isActionPanelOpen && "sf-icon-button--active",
          )}
          aria-label="Toggle action panel"
          aria-pressed={isActionPanelOpen}
          aria-controls="sf-action-panel"
          aria-expanded={isActionPanelOpen ? "true" : "false"}
          onClick={onToggleActionPanel}
        >
          <span className="sf-icon-button-label">Panel</span>
        </button>
      </div>

      <div className="sf-topbar-right">
        <div className="sf-topbar-actions sf-topbar-actions--desktop">
          <Link
            className="sf-icon-button"
            aria-label="Alerts"
            to={alertsNavItem?.path ?? "/alerts"}
          >
            {AlertsIcon ? <AlertsIcon size={20} aria-hidden /> : <span aria-hidden>🔔</span>}
            {alertsCount > 0 ? (
              <span className="sf-icon-button__badge" aria-label={`${alertsCount} triggered alerts`}>
                {alertsCount}
              </span>
            ) : null}
          </Link>

          <Link
            className="sf-icon-button"
            aria-label={SETTINGS_NAV_ITEM.label}
            to={SETTINGS_NAV_ITEM.path}
          >
            {SettingsIcon ? (
              <SettingsIcon size={20} aria-hidden />
            ) : (
              <span aria-hidden>⚙︎</span>
            )}
          </Link>

          <button
            type="button"
            className="sf-icon-button"
            aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`}
            onClick={handleThemeToggle}
          >
            {resolvedTheme === "dark" ? <Sun size={20} aria-hidden /> : <Moon size={20} aria-hidden />}
          </button>
        </div>

        <div className="sf-topbar-actions sf-topbar-actions--mobile">
          <Link
            className="sf-icon-button"
            aria-label={SETTINGS_NAV_ITEM.label}
            to={SETTINGS_NAV_ITEM.path}
          >
            {SettingsIcon ? (
              <SettingsIcon size={20} aria-hidden />
            ) : (
              <span aria-hidden>⚙︎</span>
            )}
          </Link>

          <button
            type="button"
            className="sf-icon-button"
            aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} theme`}
            onClick={handleThemeToggle}
          >
            {resolvedTheme === "dark" ? <Sun size={20} aria-hidden /> : <Moon size={20} aria-hidden />}
          </button>
        </div>
      </div>
    </div>
  )
}
