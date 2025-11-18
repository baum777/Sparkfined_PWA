import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/dashboard-v2', label: 'Dashboard' },
  { to: '/analysis-v2', label: 'Analysis' },
  { to: '/journal-v2', label: 'Journal' },
]

export default function AppHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-white/5 bg-slate-950/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-500 to-teal-400 shadow-lg shadow-emerald-500/20">
            <span className="text-lg font-semibold text-white">S</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold uppercase tracking-[0.12em] text-emerald-200/90">Sparkfined</div>
            <div className="text-base font-semibold text-white">Command Center</div>
          </div>
        </div>

        <nav className="flex flex-wrap gap-2" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'rounded-full px-4 py-2 text-sm font-medium transition-colors duration-150',
                  isActive
                    ? 'bg-white/10 text-white shadow-[0_0_0_1px_rgba(255,255,255,0.06)]'
                    : 'text-zinc-300 hover:bg-white/5 hover:text-white',
                ].join(' ')
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
