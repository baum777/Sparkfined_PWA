import { getItem, setItem } from '@/lib/safeStorage'
import type { ThemeMode } from '@/state/settings'

export type ResolvedTheme = 'light' | 'dark'

export const THEME_STORAGE_KEY = 'sparkfined.theme.v1'

export const isThemeMode = (value: unknown): value is ThemeMode =>
  value === 'light' || value === 'dark' || value === 'system'

export const resolveTheme = (theme: ThemeMode, prefersDark: boolean): ResolvedTheme => {
  if (theme === 'system') {
    return prefersDark ? 'dark' : 'light'
  }

  return theme === 'light' ? 'light' : 'dark'
}

export const applyThemeAttributes = (resolvedTheme: ResolvedTheme) => {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  root.dataset.theme = resolvedTheme
  root.classList.toggle('dark', resolvedTheme === 'dark')
  root.style.colorScheme = resolvedTheme
}

export const readStoredTheme = (defaultTheme: ThemeMode): ThemeMode => {
  const stored = getItem(THEME_STORAGE_KEY)
  return isThemeMode(stored) ? stored : defaultTheme
}

export const persistThemePreference = (theme: ThemeMode): boolean => setItem(THEME_STORAGE_KEY, theme)
