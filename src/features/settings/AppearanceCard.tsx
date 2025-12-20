import React from 'react'
import Button from '@/components/ui/Button'
import { useTheme } from '@/features/theme/useTheme'
import { THEME_STORAGE_KEY, type ThemeMode } from '@/features/theme/ThemeContext'
import { SETTINGS_STORAGE_KEY } from '@/state/settings'
import { isStorageAvailable } from '@/lib/safeStorage'
import SettingsCard from './SettingsCard'

const THEME_OPTIONS: { value: ThemeMode; label: string; helper: string }[] = [
  { value: 'light', label: 'Light', helper: 'Bright surfaces, crisp contrast' },
  { value: 'dark', label: 'Dark', helper: 'Dim surfaces for low light' },
  { value: 'system', label: 'System', helper: 'Follow your OS preference' },
]

export default function AppearanceCard() {
  const { theme: themeMode, resolvedTheme, setTheme } = useTheme()
  const [fontSize, setFontSize] = React.useState<'small' | 'medium' | 'large'>('medium')
  const [cacheStatus, setCacheStatus] = React.useState<string>('')

  const handleCacheClear = () => {
    const confirmed = window.confirm(
      'Clear cached preferences? Theme and layout settings will return to defaults.',
    )

    if (!confirmed) return

    if (!isStorageAvailable()) {
      setCacheStatus('Cache unavailable in this environment (storage disabled).')
      return
    }

    const clearedKeys: string[] = []
    ;[SETTINGS_STORAGE_KEY, THEME_STORAGE_KEY].forEach((key) => {
      localStorage.removeItem(key)
      clearedKeys.push(key)
    })

    setCacheStatus(
      clearedKeys.length > 0
        ? `Cleared ${clearedKeys.length} preference key(s). Reload to apply defaults.`
        : 'No cached preference keys detected.',
    )
    console.info('[Settings] Cache clear executed (stub). Keys removed:', clearedKeys)
  }

  return (
    <SettingsCard
      title="Appearance"
      subtitle="Switch themes, adjust reading comfort, and manage local cache."
      actions={
        <Button variant="ghost" size="sm" onClick={() => setTheme('system')}>
          Reset to system
        </Button>
      }
    >
      <div className="appearance-section">
        <div className="appearance-theme">
          <div className="appearance-copy">
            <p className="appearance-kicker">Theme</p>
            <p className="appearance-title">Light, dark, or follow your OS</p>
            <p className="appearance-description">
              Choose how Sparkfined should look. System follows your device preference automatically.
            </p>
          </div>
          <div className="appearance-theme-options" role="radiogroup" aria-label="Theme selection">
            {THEME_OPTIONS.map((option) => {
              const isActive = option.value === themeMode
              return (
                <button
                  key={option.value}
                  type="button"
                  role="radio"
                  aria-checked={isActive}
                  className="appearance-theme-button"
                  data-active={isActive}
                  onClick={() => setTheme(option.value)}
                >
                  <span className="appearance-theme-label">{option.label}</span>
                  <span className="appearance-theme-helper">{option.helper}</span>
                </button>
              )
            })}
          </div>
          {themeMode === 'system' ? (
            <p className="appearance-system-hint">Following system preference → {resolvedTheme} mode</p>
          ) : null}
        </div>

        <div className="appearance-grid">
          <label className="appearance-control" htmlFor="font-size-select">
            <div className="appearance-control__text">
              <span className="appearance-control__label">Font size</span>
              <span className="appearance-control__description">Tune reading comfort (stub)</span>
            </div>
            <select
              id="font-size-select"
              className="appearance-select"
              value={fontSize}
              onChange={(event) => setFontSize(event.target.value as 'small' | 'medium' | 'large')}
            >
              <option value="small">Compact</option>
              <option value="medium">Default</option>
              <option value="large">Comfortable</option>
            </select>
          </label>

          <div className="appearance-control">
            <div className="appearance-control__text">
              <span className="appearance-control__label">Local cache</span>
              <span className="appearance-control__description">Clear cached data if something looks stale.</span>
            </div>
            <Button variant="outline" size="sm" onClick={handleCacheClear}>
              Clear cache
            </Button>
            {cacheStatus ? <p className="appearance-cache-status">{cacheStatus}</p> : null}
          </div>
        </div>
      </div>
    </SettingsCard>
  )
}
