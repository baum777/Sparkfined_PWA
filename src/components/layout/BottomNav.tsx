import { NavLink } from 'react-router-dom'
import { Home, BarChart3, FileText, Settings, type LucideIcon } from '@/lib/icons'

interface NavItem {
  path: string
  label: string
  Icon: LucideIcon
}

const navItems: NavItem[] = [
  { path: '/dashboard-v2', label: 'Board', Icon: Home },
  { path: '/analysis-v2', label: 'Analyze', Icon: BarChart3 },
  { path: '/journal-v2', label: 'Journal', Icon: FileText },
  { path: '/settings-v2', label: 'Settings', Icon: Settings },
]

export default function BottomNav() {
  // Map labels to tour step IDs
  const getTourId = (label: string) => {
    const idMap: Record<string, string> = {
      'Board': 'board-link',
      'Analyze': 'analyze-link',
      'Journal': 'journal-link',
      'Settings': 'settings-link',
    };
    return idMap[label] || '';
  };

  return (
    <nav
      id="main-navigation"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-border/70 bg-surface/95 backdrop-blur-md supports-[backdrop-filter]:bg-surface/75 lg:hidden"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="mx-auto max-w-7xl px-3 py-1.5">
        <div className="grid grid-cols-4 gap-1.5">
          {navItems.map(({ path, label, Icon }) => (
            <NavLink
              key={path}
              to={path}
              id={getTourId(label)}
              className={({ isActive }) =>
                [
                  'relative flex flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-medium tracking-tight transition-all duration-150 ease-out motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
                  isActive
                    ? 'text-brand'
                    : 'text-text-secondary hover:text-text-primary active:text-text-primary/80',
                ].join(' ')
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`pointer-events-none absolute inset-x-6 top-1 h-1 rounded-full bg-brand/70 transition-opacity duration-150 motion-reduce:transition-none ${
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
          ))}
        </div>
      </div>
    </nav>
  )
}
