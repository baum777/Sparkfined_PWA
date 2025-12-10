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
import {
  Bell,
  BookmarkPlus,
  Sparkles,
  Activity,
  RefreshCw,
  GraduationCap,
  Star,
  X,
  type LucideIcon,
} from '@/lib/icons'

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
  { path: '/watchlist', label: 'Watchlist', Icon: BookmarkPlus },
  { path: '/alerts', label: 'Alerts', Icon: Bell },
  { path: '/signals', label: 'Signals', Icon: Activity },
  { path: '/oracle', label: 'Oracle', Icon: Sparkles },
  { path: '/replay', label: 'Replay', Icon: RefreshCw },
  { path: '/lessons', label: 'Learning', Icon: GraduationCap },
  { path: '/icons', label: 'Showcase', Icon: Star },
]

const getTestId = (label: string) => {
  const testIdMap: Record<string, string> = {
    Alerts: 'nav-alerts',
    Signals: 'nav-signals',
    Watchlist: 'nav-watchlist',
    Oracle: 'nav-oracle',
    Replay: 'nav-replay',
    Learning: 'nav-lessons',
    Showcase: 'nav-showcase',
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
          className="fixed inset-0 z-drawer bg-bg-overlay/60 backdrop-blur-sm transition-opacity duration-300 lg:hidden"
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
        className={`fixed right-0 top-0 z-toast flex h-screen w-full max-w-xs flex-col border-l border-border/60 bg-surface/95 backdrop-blur-2xl transition-transform duration-300 ease-out motion-reduce:transition-none lg:hidden ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-border/80 px-4 py-4">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-text-tertiary">Navigation</p>
            <h2 className="text-base font-semibold text-text-primary">More Modes</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            data-testid="nav-drawer-close"
            className="flex items-center justify-center rounded-xl border border-transparent p-2 text-text-secondary transition-all duration-150 hover:border-border/70 hover:bg-interactive-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
            aria-label="Close navigation drawer"
          >
            <X size={20} strokeWidth={2} />
          </button>
        </div>

        {/* Drawer Items */}
        <nav className="flex-1 overflow-y-auto px-2 py-4">
          <div className="space-y-1.5">
            {drawerItems.map(({ path, label, Icon }) => (
              <NavLink
                key={path}
                to={path}
                onClick={onClose}
                data-testid={getTestId(label)}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold transition-all duration-150 ease-out motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
                    isActive
                      ? 'border-border bg-brand/10 text-brand shadow-glow-brand'
                      : 'border-transparent text-text-secondary hover:border-border/60 hover:bg-interactive-hover hover:text-text-primary',
                  ].join(' ')
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      size={20}
                      strokeWidth={isActive ? 2.4 : 2}
                      className="text-current transition-transform duration-150"
                    />
                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>

        {/* Drawer Footer */}
        <div className="border-t border-border/60 px-4 py-4 text-center text-[11px] uppercase tracking-[0.25em] text-text-tertiary">
          Adaptive Intelligence • Surface Library
        </div>
      </div>
    </>
  )
}
