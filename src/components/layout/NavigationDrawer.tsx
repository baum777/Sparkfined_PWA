/**
 * Navigation Drawer (Mobile Secondary Navigation)
 *
 * Features:
 * - Slide-out drawer from right side (mobile only)
 * - Secondary navigation items (Alerts, Watchlist, Oracle, Lessons, Signals)
 * - Smooth animation (200ms)
 * - Close on backdrop click or item click
 * - Accessibility: aria-dialog, focus management, escape key handling
 */

import React from 'react'
import { NavLink } from 'react-router-dom'
import { Bell, Sparkles, BookOpen, Zap, X, TrendingUp, Clock, type LucideIcon } from '@/lib/icons'

interface DrawerNavItem {
  path: string
  label: string
  Icon: LucideIcon
}

interface NavigationDrawerProps {
  isOpen: boolean
  onClose: () => void
}

const drawerItems: DrawerNavItem[] = [
  { path: '/chart-v2', label: 'Chart', Icon: TrendingUp },
  { path: '/alerts-v2', label: 'Alerts', Icon: Bell },
  { path: '/replay', label: 'Replay', Icon: Clock },
  { path: '/oracle', label: 'Oracle', Icon: Sparkles },
  { path: '/signals', label: 'Signals', Icon: Zap },
  { path: '/lessons', label: 'Playbook', Icon: BookOpen },
]

const getTestId = (label: string) => {
  const testIdMap: Record<string, string> = {
    'Alerts': 'nav-alerts',
    'Chart': 'nav-chart',
    'Replay': 'nav-replay',
    'Oracle': 'nav-oracle',
    'Playbook': 'nav-lessons',
    'Signals': 'nav-signals',
  }
  return testIdMap[label] || ''
}

export function NavigationDrawer({ isOpen, onClose }: NavigationDrawerProps) {
  const drawerRef = React.useRef<HTMLDivElement>(null)

  // Handle escape key
  React.useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 transition-opacity duration-200 lg:hidden"
          onClick={handleBackdropClick}
          aria-hidden="true"
        />
      )}

      {/* Drawer */}
      <div
        ref={drawerRef}
        role="dialog"
        aria-modal="true"
        aria-label="Secondary navigation"
        className={`fixed right-0 top-0 z-50 h-screen w-full max-w-xs flex-col border-l border-border bg-surface glass-subtle transition-transform duration-200 ease-out motion-reduce:transition-none lg:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <h2 className="text-sm font-semibold text-text-primary">More Options</h2>
          <button
            type="button"
            onClick={onClose}
            data-testid="nav-drawer-close"
            className="flex items-center justify-center rounded-lg p-2 text-text-secondary hover:bg-interactive-hover hover:text-text-primary transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
            aria-label="Close navigation drawer"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {/* Drawer Items */}
        <nav className="flex-1 overflow-y-auto">
          <div className="space-y-1 px-2 py-3">
            {drawerItems.map(({ path, label, Icon }) => (
              <NavLink
                key={path}
                to={path}
                onClick={onClose}
                data-testid={getTestId(label)}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-all duration-150 ease-out motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
                    isActive
                      ? 'bg-brand/10 text-brand'
                      : 'text-text-secondary hover:text-text-primary hover:bg-interactive-hover',
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={20}
                      strokeWidth={isActive ? 2.4 : 2}
                      className="transition-transform duration-150"
                    />
                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>

          {/* Divider */}
          <div className="my-2 border-t border-border/50" />

          {/* Context-dependent items (disabled/future) */}
          <div className="space-y-1 px-2 py-3">
            <div className="px-4 py-2 text-[11px] font-semibold uppercase tracking-widest text-text-tertiary">
              Context
            </div>
            <div
              data-testid="nav-replay-disabled"
              className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-text-quaternary cursor-not-allowed opacity-50"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-surface-secondary">
                ▶️
              </span>
              <span>Replay*</span>
            </div>
            <div
              data-testid="nav-notifications-disabled"
              className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-text-quaternary cursor-not-allowed opacity-50"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-surface-secondary">
                🔔
              </span>
              <span>Notifications*</span>
            </div>
            <div className="px-4 py-2 text-[9px] text-text-quaternary">
              *Available via feature context
            </div>
          </div>
        </nav>

        {/* Drawer Footer */}
        <div className="border-t border-border/50 px-4 py-3">
          <div className="text-[11px] text-text-tertiary text-center">
            More features coming soon
          </div>
        </div>
      </div>
    </>
  )
}
