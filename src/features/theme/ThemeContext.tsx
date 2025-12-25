import React from 'react'
import {
  applyThemeAttributes,
  isThemeMode,
  persistThemePreference,
  readStoredTheme,
  resolveTheme,
  type ResolvedTheme,
} from '@/lib/theme/theme'
import { DEFAULT_SETTINGS, useSettings, type ThemeMode } from '@/state/settings'
export type { ThemeMode } from '@/state/settings'
export type { ResolvedTheme }

export interface ThemeContextValue {
  theme: ThemeMode
  resolvedTheme: ResolvedTheme
  setTheme: (next: ThemeMode) => void
}

export const ThemeContext = React.createContext<ThemeContextValue | null>(null)

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
    const legacyTheme = readStoredTheme(defaultTheme)

    if (isThemeMode(legacyTheme) && theme === DEFAULT_SETTINGS.themeMode && legacyTheme !== theme) {
      setSettings({ themeMode: legacyTheme })
    }
  }, [defaultTheme, setSettings, theme])

  const resolvedTheme: ResolvedTheme = React.useMemo(
    () => resolveTheme(theme, prefersDark),
    [prefersDark, theme],
  )

  React.useEffect(() => {
    applyThemeAttributes(resolvedTheme)
  }, [resolvedTheme])

  React.useEffect(() => {
    persistThemePreference(theme)
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
