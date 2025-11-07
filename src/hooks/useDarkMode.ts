import { useState, useEffect } from 'react'
import { getJSON, setJSON } from '@/lib/safeStorage'

export function useDarkMode() {
  const [darkMode, setDarkMode] = useState(() => {
    return getJSON('darkMode', false)
  })

  useEffect(() => {
    setJSON('darkMode', darkMode)
    if (typeof document !== 'undefined') {
      if (darkMode) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }, [darkMode])

  return [darkMode, setDarkMode] as const
}
