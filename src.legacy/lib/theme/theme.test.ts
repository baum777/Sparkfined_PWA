import { describe, expect, it, beforeEach } from 'vitest'
import {
  applyThemeAttributes,
  isThemeMode,
  persistThemePreference,
  readStoredTheme,
  resolveTheme,
  THEME_STORAGE_KEY,
} from './theme'

describe('theme helpers', () => {
  beforeEach(() => {
    localStorage.clear()
    document.documentElement.removeAttribute('data-theme')
    document.documentElement.classList.remove('dark')
    document.documentElement.style.colorScheme = ''
  })

  it('resolves theme modes including system preference', () => {
    expect(resolveTheme('dark', true)).toBe('dark')
    expect(resolveTheme('light', true)).toBe('light')
    expect(resolveTheme('system', true)).toBe('dark')
    expect(resolveTheme('system', false)).toBe('light')
  })

  it('applies theme attributes to the document root', () => {
    applyThemeAttributes('dark')
    expect(document.documentElement.dataset.theme).toBe('dark')
    expect(document.documentElement.classList.contains('dark')).toBe(true)
    expect(document.documentElement.style.colorScheme).toBe('dark')

    applyThemeAttributes('light')
    expect(document.documentElement.dataset.theme).toBe('light')
    expect(document.documentElement.classList.contains('dark')).toBe(false)
    expect(document.documentElement.style.colorScheme).toBe('light')
  })

  it('persists and reads stored theme preference', () => {
    persistThemePreference('light')
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('light')
    expect(readStoredTheme('dark')).toBe('light')

    localStorage.setItem(THEME_STORAGE_KEY, 'invalid')
    expect(readStoredTheme('dark')).toBe('dark')
  })

  it('validates theme modes correctly', () => {
    expect(isThemeMode('dark')).toBe(true)
    expect(isThemeMode('light')).toBe(true)
    expect(isThemeMode('system')).toBe(true)
    expect(isThemeMode('oled')).toBe(false)
    expect(isThemeMode(undefined)).toBe(false)
  })
})
