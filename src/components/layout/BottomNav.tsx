import { NavLink } from 'react-router-dom'
import { ChartBarIcon, BookOpenIcon, PlayIcon } from '@heroicons/react/24/outline'

const navItems = [
  { path: '/', label: 'Analyze', icon: ChartBarIcon },
  { path: '/journal', label: 'Journal', icon: BookOpenIcon },
  { path: '/replay', label: 'Replay', icon: PlayIcon },
]

export default function BottomNav() {
  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-bg-elevated/90 backdrop-blur-md border-t border-border shadow-card-elevated"
      role="navigation"
      aria-label="Bottom navigation"
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-around">
          {navItems.map(({ path, label, icon: Icon }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center py-3 px-4 min-w-[80px] transition-all duration-180 ease-soft-out group ${
                  isActive 
                    ? 'text-accent' 
                    : 'text-text-tertiary hover:text-text-primary'
                }`
              }
              aria-label={label}
            >
              {({ isActive }) => (
                <>
                  {/* Monoline Icon with neon glow on active */}
                  <div className={`relative transition-all duration-180 ${isActive ? 'glow-accent' : ''}`}>
                    <Icon className="w-6 h-6 mb-1" aria-hidden="true" strokeWidth={1.5} />
                    
                    {/* Active indicator: subtle top accent line */}
                    {isActive && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-accent rounded-full glow-accent" />
                    )}
                  </div>
                  
                  <span className="text-xs font-sans font-medium tracking-wide">
                    {label}
                  </span>
                  
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 bg-accent/5 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-180" />
                </>
              )}
            </NavLink>
          ))}
        </div>
      </div>
      {/* Safe area padding for iOS */}
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  )
}
