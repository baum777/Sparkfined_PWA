import { useCallback } from 'react'
import { useTheme, type ThemeMode } from '@/lib/theme/useTheme'

export function useDarkMode() {
  const { resolvedTheme, setTheme } = useTheme()

  const isThemeMode = (value: string): value is ThemeMode =>
    value === 'dark' || value === 'light' || value === 'system'

  const updateTheme = useCallback(
    (next: boolean | ThemeMode) => {
      if (typeof next === 'string') {
        if (isThemeMode(next)) {
          setTheme(next)
        }
        return
      }
      setTheme(next ? 'dark' : 'light')
    },
    [setTheme]
  )

  return [resolvedTheme === 'dark', updateTheme] as const
}
