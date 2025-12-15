import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { DEFAULT_SETTINGS, SETTINGS_STORAGE_KEY, SettingsProvider, useSettings } from '@/state/settings'

describe('Settings quote currency', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <SettingsProvider>{children}</SettingsProvider>
  )

  it('defaults to USD when nothing is stored', () => {
    const { result } = renderHook(() => useSettings(), { wrapper })
    expect(result.current.settings.quoteCurrency).toBe('USD')
  })

  it('persists user selection', () => {
    const { result } = renderHook(() => useSettings(), { wrapper })

    act(() => {
      result.current.setSettings({ quoteCurrency: 'EUR' })
    })

    expect(result.current.settings.quoteCurrency).toBe('EUR')
    const stored = JSON.parse(localStorage.getItem(SETTINGS_STORAGE_KEY) || '{}')
    expect(stored.quoteCurrency).toBe('EUR')
  })

  it('falls back to default when stored value is missing', () => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ ...DEFAULT_SETTINGS, quoteCurrency: undefined }))
    const { result } = renderHook(() => useSettings(), { wrapper })

    expect(result.current.settings.quoteCurrency).toBe(DEFAULT_SETTINGS.quoteCurrency)
  })

  it('ignores invalid stored values and falls back to USD', () => {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ ...DEFAULT_SETTINGS, quoteCurrency: 'JPY' }))
    const { result } = renderHook(() => useSettings(), { wrapper })

    expect(result.current.settings.quoteCurrency).toBe(DEFAULT_SETTINGS.quoteCurrency)
  })
})
