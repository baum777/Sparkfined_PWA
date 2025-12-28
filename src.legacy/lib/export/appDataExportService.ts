import { getItem, getJSON } from '../safeStorage'
import { exportJournalToJSON } from './journalExportService'
import type {
  AlertsExportBundle,
  AppDataExportBundle,
  SettingsExportBundle,
  WatchlistExportBundle,
} from './exportTypes'
import { SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS } from '@/state/settings'
import type { ThemeMode } from '@/lib/theme/useTheme'
import type { Alert } from '@/store/alertsStore'
import { useAlertsStore } from '@/store/alertsStore'
import { useWatchlistStore } from '@/store/watchlistStore'
import { THEME_STORAGE_KEY } from '@/lib/theme/theme-provider'

export const APP_DATA_EXPORT_VERSION = '1.0.0'
const SHARED_BUNDLE_VERSION = '1.0.0'

function readTheme(): ThemeMode | undefined {
  const stored = getItem(THEME_STORAGE_KEY)
  if (stored === 'light' || stored === 'dark' || stored === 'system') {
    return stored
  }
  return undefined
}

export async function exportAlertsToJSON(): Promise<AlertsExportBundle> {
  const alerts = useAlertsStore.getState().alerts
  const normalized: Alert[] = alerts.map((alert) => ({ ...alert }))
  return {
    version: SHARED_BUNDLE_VERSION,
    alerts: normalized,
  }
}

export async function exportSettingsToJSON(): Promise<SettingsExportBundle> {
  const settings = getJSON(SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS)
  const theme = readTheme()
  return {
    version: SHARED_BUNDLE_VERSION,
    settings: theme ? { ...settings, theme } : settings,
  }
}

export async function exportWatchlistToJSON(): Promise<WatchlistExportBundle> {
  const { rows, trends } = useWatchlistStore.getState()
  return {
    version: SHARED_BUNDLE_VERSION,
    rows: rows.map((row) => ({ ...row })),
    trends: { ...trends },
  }
}

export async function exportAllAppData(): Promise<AppDataExportBundle> {
  const [journal, alerts, settings, watchlist] = await Promise.all([
    exportJournalToJSON(),
    exportAlertsToJSON(),
    exportSettingsToJSON(),
    exportWatchlistToJSON(),
  ])

  return {
    version: APP_DATA_EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    journal,
    alerts,
    settings,
    watchlist,
  }
}

export async function downloadAllAppData(
  fileName = 'sparkfined-app-data-export.json',
): Promise<void> {
  const bundle = await exportAllAppData()
  const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: 'application/json' })

  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.click()
  URL.revokeObjectURL(url)
}
