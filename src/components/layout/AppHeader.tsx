import React from 'react'
import { NavLink } from 'react-router-dom'

const navItems = [
  { to: '/dashboard-v2', label: 'Dashboard' },
  { to: '/watchlist-v2', label: 'Watchlist' },
  { to: '/analysis-v2', label: 'Analysis' },
  { to: '/journal-v2', label: 'Journal' },
  { to: '/alerts-v2', label: 'Alerts' },
]

export default function AppHeader() {
  const [isHidden, setIsHidden] = React.useState(false)
  const [isElevated, setIsElevated] = React.useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = React.useState(false)

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = (event: MediaQueryListEvent) => setPrefersReducedMotion(event.matches)
    setPrefersReducedMotion(media.matches)
    media.addEventListener?.('change', handleChange)
    return () => media.removeEventListener?.('change', handleChange)
  }, [])

  React.useEffect(() => {
    if (typeof window === 'undefined') return
    let lastScroll = window.scrollY
    let rafId: number | null = null

    const updateFromScroll = (current: number) => {
      setIsElevated(current > 8)
      if (!prefersReducedMotion) {
        const goingDown = current > lastScroll
        const distance = Math.abs(current - lastScroll)
        if (distance > 12) {
          setIsHidden(goingDown && current > 120)
        }
      } else {
        setIsHidden(false)
      }
      lastScroll = current
      rafId = null
    }

    const handleScroll = () => {
      const current = window.scrollY
      if (rafId !== null) return
      rafId = window.requestAnimationFrame(() => updateFromScroll(current))
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    updateFromScroll(window.scrollY)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId)
      }
    }
  }, [prefersReducedMotion])

  const headerClasses = [
    'sticky top-0 z-40 border-b transition-all duration-200 ease-out motion-reduce:transition-none',
    'glass-subtle', // Design System glass effect
    isElevated ? 'border-border elevation-medium' : 'border-transparent',
    isHidden ? 'motion-safe:-translate-y-full' : 'motion-safe:translate-y-0',
  ].join(' ')

  return (
    <header className={headerClasses}>
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:py-4">
        <div className="flex items-center gap-3">
          <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-brand-hover border-glow-brand">
            <span className="text-lg font-semibold text-white">S</span>
          </div>
          <div className="leading-tight">
            <div className="text-sm font-semibold uppercase tracking-[0.12em] text-brand/90">Sparkfined</div>
            <div className="text-base font-semibold text-text-primary">Command Center</div>
          </div>
        </div>

        <nav className="flex flex-wrap gap-2" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                [
                  'rounded-full px-4 py-2 text-sm font-medium transition-all duration-150 motion-reduce:transition-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
                  isActive
                    ? 'bg-brand/10 text-brand border border-brand/20 hover-glow' // Design System classes
                    : 'text-text-secondary hover:bg-interactive-hover hover:text-text-primary',
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
