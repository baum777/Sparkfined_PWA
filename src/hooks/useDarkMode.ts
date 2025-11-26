import { useCallback } from 'react'
import { useTheme, type ThemeMode } from '@/lib/theme/useTheme'

export function useDarkMode() {
  const { resolvedTheme, setTheme } = useTheme()

  const updateTheme = useCallback(
    (next: boolean | ThemeMode) => {
      if (typeof next === 'string') {
        setTheme(next)
        return
      }
      setTheme(next ? 'dark' : 'light')
    },
    [setTheme]
  )

  return [resolvedTheme === 'dark', updateTheme] as const
}
