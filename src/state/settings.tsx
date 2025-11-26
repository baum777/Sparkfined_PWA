import React from 'react'
import { getJSON, setJSON } from '@/lib/safeStorage'

export type Settings = {
  snapDefault: boolean
  replaySpeed: 1 | 2 | 4 | 8 | 10
  showHud: boolean
  showTimeline: boolean
  showMinimap: boolean
  defaultBalance?: number
  defaultPlaybookId?: string
}

const KEY = 'sparkfined.settings.v1'
const DEFAULTS: Settings = {
  snapDefault: true,
  replaySpeed: 2,
  showHud: true,
  showTimeline: true,
  showMinimap: true,
  defaultBalance: 1000,
  defaultPlaybookId: 'bal-15',
}

type StoredSettings = Settings & { theme?: string }

function read(): Settings {
  const { theme: _legacyTheme, ...settings } = getJSON<StoredSettings>(KEY, DEFAULTS)
  return settings
}
function write(s: Settings) {
  setJSON(KEY, s)
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
