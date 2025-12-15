import type { ChartTimeframe, IndicatorSettingsRecord } from '@/domain/chart'
import { loadIndicatorSettings, saveIndicatorSettings } from '@/db/indicatorSettings'
import {
  createDefaultIndicatorSettings,
  indicatorSettingsToOverlays,
  toggleIndicatorEnabled,
} from '@/lib/indicatorSettings'
import { boardDB } from '@/lib/db-board'

vi.mock('@/lib/db-board', () => {
  const store = new Map<number, IndicatorSettingsRecord & { id: number }>()
  let idCounter = 1

  const indicatorSettings = {
    async add(record: IndicatorSettingsRecord): Promise<number> {
      const id = idCounter++
      store.set(id, { ...record, id })
      return id
    },
    async update(id: number, updates: Partial<IndicatorSettingsRecord>): Promise<number> {
      const current = store.get(id)
      if (!current) return 0

      store.set(id, { ...current, ...updates })
      return 1
    },
    where(_query: string) {
      return {
        equals(values: [string, ChartTimeframe]) {
          const [symbol, timeframe] = values
          const match = Array.from(store.values()).find(
            (record) => record.symbol === symbol && record.timeframe === timeframe
          )
          return { first: async () => match }
        },
      }
    },
    async clear() {
      store.clear()
      idCounter = 1
    },
  }

  return { boardDB: { indicatorSettings } }
})

const timeframe: ChartTimeframe = '1h'

describe('indicatorSettings Dexie helpers', () => {
  beforeEach(async () => {
    await boardDB.indicatorSettings.clear()
  })

  it('creates defaults when no settings exist', async () => {
    const settings = await loadIndicatorSettings('SOL', timeframe)

    expect(settings.symbol).toBe('SOL')
    expect(settings.timeframe).toBe(timeframe)
    expect(settings.enabled.sma).toBe(false)
    expect(settings.params.bb?.period).toBeGreaterThan(0)
    expect(settings.id).toBeDefined()
  })

  it('persists toggle changes and returns overlays for enabled indicators', async () => {
    const base = createDefaultIndicatorSettings('SOL', timeframe)
    const toggled = toggleIndicatorEnabled(base, 'bb', true)
    const saved = await saveIndicatorSettings(toggled)

    expect(saved.enabled.bb).toBe(true)

    const overlays = indicatorSettingsToOverlays(saved)
    expect(overlays.some((overlay) => overlay.type === 'bb')).toBe(true)
    expect(overlays.find((overlay) => overlay.type === 'bb')?.period).toBe(saved.params.bb?.period)
  })
})
