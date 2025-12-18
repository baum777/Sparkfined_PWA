import React from 'react'
import { getItem, setItem } from '@/lib/safeStorage'
import { DEFAULT_SETTINGS, useSettings, type ThemeMode } from '@/state/settings'
export type { ThemeMode } from '@/state/settings'

export type ResolvedTheme = 'light' | 'dark'

export interface ThemeContextValue {
  theme: ThemeMode
  resolvedTheme: ResolvedTheme
  setTheme: (next: ThemeMode) => void
}

export const THEME_STORAGE_KEY = 'sparkfined.theme.v1'

export const ThemeContext = React.createContext<ThemeContextValue | null>(null)

const isThemeMode = (value: unknown): value is ThemeMode =>
  value === 'light' || value === 'dark' || value === 'system'

const applyTheme = (resolvedTheme: ResolvedTheme) => {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  root.dataset.theme = resolvedTheme
  root.classList.toggle('dark', resolvedTheme === 'dark')
  root.style.colorScheme = resolvedTheme
}

const useSystemPreference = () => {
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

  return prefersDark
}

export interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: ThemeMode
}

export function ThemeProvider({ children, defaultTheme = DEFAULT_SETTINGS.themeMode }: ThemeProviderProps) {
  const { settings, setSettings } = useSettings()
  const prefersDark = useSystemPreference()

  const theme = settings.themeMode ?? defaultTheme

  React.useEffect(() => {
    const legacyTheme = getItem(THEME_STORAGE_KEY)

    if (isThemeMode(legacyTheme) && theme === DEFAULT_SETTINGS.themeMode && legacyTheme !== theme) {
      setSettings({ themeMode: legacyTheme })
    }
  }, [setSettings, theme])

  const resolvedTheme: ResolvedTheme = React.useMemo(() => {
    if (theme === 'system') {
      return prefersDark ? 'dark' : 'light'
    }

    return theme === 'light' ? 'light' : 'dark'
  }, [prefersDark, theme])

  React.useEffect(() => {
    applyTheme(resolvedTheme)
  }, [resolvedTheme])

  React.useEffect(() => {
    setItem(THEME_STORAGE_KEY, theme)
  }, [theme])

  const setTheme = React.useCallback(
    (next: ThemeMode) => {
      if (!isThemeMode(next)) return
      setSettings({ themeMode: next })
    },
    [setSettings]
  )

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
