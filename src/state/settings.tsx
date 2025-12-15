import React from 'react'
import { getJSON, setJSON } from '@/lib/safeStorage'
import type { QuoteCurrency } from '@/types/currency'

export type Settings = {
  snapDefault: boolean
  replaySpeed: 1 | 2 | 4 | 8 | 10
  showHud: boolean
  showTimeline: boolean
  showMinimap: boolean
  defaultBalance?: number
  defaultPlaybookId?: string
  quoteCurrency: QuoteCurrency
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
}

type StoredSettings = Settings & { theme?: string }

function read(): Settings {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { theme: _legacyTheme, ...settings } = getJSON<StoredSettings>(
    SETTINGS_STORAGE_KEY,
    DEFAULT_SETTINGS,
  )
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    quoteCurrency: settings.quoteCurrency ?? DEFAULT_SETTINGS.quoteCurrency,
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
