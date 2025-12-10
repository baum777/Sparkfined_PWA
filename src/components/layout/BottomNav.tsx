import React from 'react'
import { NavLink } from 'react-router-dom'
import { Home, BarChart3, FileText, Settings, TrendingUp, Menu, Activity, type LucideIcon } from '@/lib/icons'
import { NavigationDrawer } from './NavigationDrawer'

interface NavItem {
  path: string
  label: string
  Icon: LucideIcon
}

const primaryNavItems: NavItem[] = [
  { path: '/dashboard', label: 'Board', Icon: Home },
  { path: '/analysis', label: 'Analyze', Icon: BarChart3 },
  { path: '/chart', label: 'Chart', Icon: TrendingUp },
  { path: '/signals', label: 'Signals', Icon: Activity },
  { path: '/journal', label: 'Journal', Icon: FileText },
  { path: '/settings', label: 'Settings', Icon: Settings },
]

export default function BottomNav() {
  const [isDrawerOpen, setIsDrawerOpen] = React.useState(false)

  // Map labels to tour step IDs and data-testid
  const getNavIds = (label: string) => {
    const idMap: Record<string, { tour: string; testid: string }> = {
      'Board': { tour: 'board-link', testid: 'nav-board' },
      'Analyze': { tour: 'analyze-link', testid: 'nav-analyze' },
      'Chart': { tour: 'chart-link', testid: 'nav-chart' },
      'Signals': { tour: 'signals-link', testid: 'nav-signals' },
      'Journal': { tour: 'journal-link', testid: 'nav-journal' },
      'Settings': { tour: 'settings-link', testid: 'nav-settings' },
    };
    return idMap[label] || { tour: '', testid: '' };
  };

  return (
    <>
      <nav
        id="main-navigation"
        className="fixed bottom-0 left-0 right-0 z-drawer border-t border-border/60 bg-surface/90 backdrop-blur-2xl lg:hidden"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="mx-auto max-w-7xl px-3 py-2">
          <div className="grid grid-cols-7 gap-1.5">
            {/* Primary Nav Items (6 tabs) */}
            {primaryNavItems.map(({ path, label, Icon }) => {
              const { tour, testid } = getNavIds(label)
              return (
                <NavLink
                  key={path}
                  to={path}
                  id={tour || undefined}
                  data-testid={testid}
                  className={({ isActive }) =>
                    [
                      'relative flex flex-col items-center justify-center gap-1 rounded-2xl border border-transparent px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary transition-all duration-150 ease-out motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
                      isActive
                        ? 'border-border/70 bg-brand/10 text-brand shadow-glow-brand'
                        : 'text-text-secondary hover:bg-interactive-hover hover:text-text-primary',
                    ].join(' ')
                  }
                >
                  {({ isActive }) => (
                    <>
                      <span
                        className={`pointer-events-none absolute inset-x-6 top-2 h-1 rounded-full bg-brand/70 transition-opacity duration-150 motion-reduce:transition-none ${
                          isActive ? 'opacity-100' : 'opacity-0'
                        }`}
                        aria-hidden="true"
                      />
                      <Icon
                        size={22}
                        strokeWidth={isActive ? 2.4 : 2}
                        className="transition-transform duration-150 motion-reduce:transition-none"
                      />
                      <span className="leading-none">{label}</span>
                    </>
                  )}
                </NavLink>
              )
            })}

            {/* Menu Button (More) */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              data-testid="nav-drawer-trigger"
              className="relative flex flex-col items-center justify-center gap-1 rounded-2xl border border-transparent px-2 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-tertiary transition-all duration-150 ease-out motion-reduce:transition-none hover:bg-interactive-hover hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus"
              aria-label="More navigation options"
            >
              <Menu
                size={22}
                strokeWidth={2}
                className="transition-transform duration-150 motion-reduce:transition-none"
              />
              <span className="leading-none">More</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Navigation Drawer */}
      <NavigationDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} />
    </>
  )
}
