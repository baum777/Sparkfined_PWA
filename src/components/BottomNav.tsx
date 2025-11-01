import { NavLink } from 'react-router-dom'

interface NavItem {
  path: string
  label: string
  icon: string
}

const navItems: NavItem[] = [
  { path: '/', label: 'Analyze', icon: '📊' },
  { path: '/journal', label: 'Journal', icon: '📝' },
  { path: '/replay', label: 'Replay', icon: '⏮️' },
]

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800"
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-3 gap-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-3 px-2 rounded-lg transition-colors ${
                  isActive
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`
              }
            >
              <span className="text-2xl" role="img" aria-hidden="true">
                {item.icon}
              </span>
              <span className="text-xs font-medium">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </div>
    </nav>
  )
}
