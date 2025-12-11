import React from 'react'
import { getItem, setItem } from '@/lib/safeStorage'

export type ThemeMode = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export interface ThemeContextValue {
  theme: ThemeMode
  resolvedTheme: ResolvedTheme
  setTheme: (next: ThemeMode) => void
}

export const THEME_STORAGE_KEY = 'sparkfined.theme.v1'

export const ThemeContext = React.createContext<ThemeContextValue | null>(null)

function getStoredTheme(): ThemeMode | null {
  const stored = getItem(THEME_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored
  }
  return null
}

function getInitialTheme(defaultTheme: ThemeMode): ThemeMode {
  return getStoredTheme() ?? defaultTheme
}

export interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: ThemeMode
}

export function ThemeProvider({ children, defaultTheme = 'dark' }: ThemeProviderProps) {
  const [theme, setThemeState] = React.useState<ThemeMode>(() => getInitialTheme(defaultTheme))
  const [prefersDark, setPrefersDark] = React.useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return true
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  })

  React.useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    const handleChange = (event: MediaQueryListEvent) => setPrefersDark(event.matches)

    setPrefersDark(mediaQuery.matches)
    mediaQuery.addEventListener?.('change', handleChange)
    return () => mediaQuery.removeEventListener?.('change', handleChange)
  }, [])

  const resolvedTheme: ResolvedTheme = React.useMemo(() => {
    if (theme === 'system') {
      return prefersDark ? 'dark' : 'light'
    }
    return theme
  }, [theme, prefersDark])

  React.useEffect(() => {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    root.classList.toggle('dark', resolvedTheme === 'dark')
    root.dataset.theme = resolvedTheme
  }, [resolvedTheme])

  React.useEffect(() => {
    setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const setTheme = React.useCallback((next: ThemeMode) => {
    setThemeState(next)
  }, [])

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      resolvedTheme,
      setTheme,
    }),
    [theme, resolvedTheme, setTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
