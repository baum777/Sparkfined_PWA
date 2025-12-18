import React from 'react'
import { getJSON, setJSON } from '@/lib/safeStorage'
import { isQuoteCurrency, type QuoteCurrency } from '@/types/currency'

export type ThemeMode = 'light' | 'dark' | 'system'

export type Settings = {
  snapDefault: boolean
  replaySpeed: 1 | 2 | 4 | 8 | 10
  showHud: boolean
  showTimeline: boolean
  showMinimap: boolean
  defaultBalance?: number
  defaultPlaybookId?: string
  quoteCurrency: QuoteCurrency
  themeMode: ThemeMode
}

export const SETTINGS_STORAGE_KEY = 'sparkfined.settings.v1'
export const DEFAULT_SETTINGS: Settings = {
  snapDefault: true,
  replaySpeed: 2,
  showHud: true,
  showTimeline: true,
  showMinimap: true,
  defaultBalance: 1000,
  defaultPlaybookId: 'bal-15',
  quoteCurrency: 'USD',
  themeMode: 'dark',
}

type StoredSettings = Settings & { theme?: string; themeMode?: ThemeMode }

const isThemeMode = (value: unknown): value is ThemeMode =>
  value === 'light' || value === 'dark' || value === 'system'

function read(): Settings {
  const { theme: legacyTheme, themeMode, ...settings } = getJSON<StoredSettings>(
    SETTINGS_STORAGE_KEY,
    DEFAULT_SETTINGS,
  )

  const resolvedTheme: ThemeMode = isThemeMode(themeMode)
    ? themeMode
    : isThemeMode(legacyTheme)
      ? legacyTheme
      : DEFAULT_SETTINGS.themeMode

  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    themeMode: resolvedTheme,
    quoteCurrency: isQuoteCurrency(settings.quoteCurrency)
      ? settings.quoteCurrency
      : DEFAULT_SETTINGS.quoteCurrency,
  }
}
function write(s: Settings) {
  setJSON(SETTINGS_STORAGE_KEY, s)
}

type Ctx = { settings: Settings; setSettings: (next: Partial<Settings>) => void }
const SettingsCtx = React.createContext<Ctx | null>(null)

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setState] = React.useState<Settings>(read)

  React.useEffect(() => {
    write(settings)
  }, [settings])

  const setSettings = (next: Partial<Settings>) => setState((s) => ({ ...s, ...next }))

  return <SettingsCtx.Provider value={{ settings, setSettings }}>{children}</SettingsCtx.Provider>
}

export function useSettings(): Ctx {
  const ctx = React.useContext(SettingsCtx)
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider')
  return ctx
}
