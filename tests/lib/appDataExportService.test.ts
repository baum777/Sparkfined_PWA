import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  downloadAllAppData,
  exportAlertsToJSON,
  exportAllAppData,
  exportSettingsToJSON,
  exportWatchlistToJSON,
} from '@/lib/export/appDataExportService'
import * as journalExportService from '@/lib/export/journalExportService'
import { SETTINGS_STORAGE_KEY, DEFAULT_SETTINGS } from '@/state/settings'
import { THEME_STORAGE_KEY } from '@/lib/theme/theme-provider'
import { useAlertsStore } from '@/store/alertsStore'
import { useWatchlistStore } from '@/store/watchlistStore'

const originalURL = global.URL
const defaultAlerts = useAlertsStore.getState().alerts
const defaultWatchlistState = useWatchlistStore.getState()

beforeEach(() => {
  Object.defineProperty(global, 'URL', {
    writable: true,
    value: {
      ...originalURL,
      createObjectURL: vi.fn(() => 'blob:app-data'),
      revokeObjectURL: vi.fn(),
    },
  })
})

afterEach(() => {
  useAlertsStore.setState({ alerts: [...defaultAlerts] })
  useWatchlistStore.setState({
    rows: [...defaultWatchlistState.rows],
    isLoading: defaultWatchlistState.isLoading,
    error: defaultWatchlistState.error,
    trends: { ...defaultWatchlistState.trends },
  })
  localStorage.clear()
  Object.defineProperty(global, 'URL', { writable: true, value: originalURL })
  vi.restoreAllMocks()
})

describe('appDataExportService', () => {
  it('exports alerts snapshot', async () => {
    const sample = {
      id: 'alert-1',
      symbol: 'BTC',
      type: 'price-above' as const,
      condition: 'Above 50k',
      threshold: 50000,
      timeframe: '1h',
      status: 'armed' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    useAlertsStore.setState({ alerts: [sample] })

    const bundle = await exportAlertsToJSON()

    expect(bundle.version).toBe('1.0.0')
    expect(bundle.alerts).toHaveLength(1)
    expect(bundle.alerts[0]?.id).toBe('alert-1')
  })

  it('exports persisted settings and theme', async () => {
    localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ ...DEFAULT_SETTINGS, snapDefault: false, replaySpeed: 4 }),
    )
    localStorage.setItem(THEME_STORAGE_KEY, 'light')

    const bundle = await exportSettingsToJSON()

    expect(bundle.settings.snapDefault).toBe(false)
    expect(bundle.settings.replaySpeed).toBe(4)
    expect(bundle.settings.theme).toBe('light')
  })

  it('exports watchlist rows and trends', async () => {
    useWatchlistStore.setState({
      rows: [
        { symbol: 'SOL', name: 'Solana', price: '$100', change24h: '+5%', session: 'NY', address: 'addr' },
      ],
      isLoading: false,
      error: null,
      trends: {
        SOL: {
          symbol: 'SOL',
          lastUpdated: new Date().toISOString(),
          sentimentLabel: 'bullish',
          hypeLevel: 'mania',
          trendingScore: 10,
          alertRelevance: 5,
          lastEventId: 'evt',
          lastTweetUrl: 'https://example.com',
          lastSnippet: 'snippet',
          callToAction: 'monitor',
        },
      },
    })

    const bundle = await exportWatchlistToJSON()

    expect(bundle.rows[0]?.symbol).toBe('SOL')
    expect(bundle.trends.SOL?.lastEventId).toBe('evt')
  })

  it('aggregates all app data with journal export', async () => {
    vi.spyOn(journalExportService, 'exportJournalToJSON').mockResolvedValue({
      version: '1.0.0',
      exportedAt: '2024-01-01T00:00:00.000Z',
      entries: [],
    })

    const bundle = await exportAllAppData()

    expect(bundle.version).toBe('1.0.0')
    expect(bundle.journal.entries).toEqual([])
    expect(bundle.alerts.version).toBe('1.0.0')
    expect(bundle.settings.version).toBe('1.0.0')
    expect(bundle.watchlist.version).toBe('1.0.0')
  })

  it('downloads aggregated app data', async () => {
    vi.spyOn(journalExportService, 'exportJournalToJSON').mockResolvedValue({
      version: '1.0.0',
      exportedAt: '2024-01-01T00:00:00.000Z',
      entries: [],
    })

    const click = vi.fn()
    const anchor = { click, set href(value: string) {}, set download(value: string) {} }
    vi.spyOn(document, 'createElement').mockReturnValue(anchor as unknown as HTMLAnchorElement)
    const createObjectURL = vi.spyOn(globalThis.URL, 'createObjectURL').mockReturnValue('blob:app-data')
    const revokeObjectURL = vi.spyOn(globalThis.URL, 'revokeObjectURL')

    await downloadAllAppData('app-data.json')

    expect(createObjectURL).toHaveBeenCalled()
    expect(click).toHaveBeenCalled()
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:app-data')
  })
})
