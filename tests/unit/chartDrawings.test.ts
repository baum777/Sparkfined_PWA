import type { ChartDrawingRecord, ChartTimeframe } from '@/domain/chart'
import { clearDrawings, deleteDrawing, listDrawings, saveDrawing } from '@/db/chartDrawings'
import { boardDB } from '@/lib/db-board'

vi.mock('@/lib/db-board', () => {
  const store = new Map<string, ChartDrawingRecord>()

  const collectionFor = (symbol: string, timeframe: ChartTimeframe) => {
    const items = Array.from(store.values()).filter(
      (item) => item.symbol === symbol && item.timeframe === timeframe
    )

    return {
      async toArray() {
        return items
      },
      async delete() {
        let deleted = 0
        for (const item of items) {
          if (item.id && store.has(item.id)) {
            store.delete(item.id)
            deleted += 1
          }
        }
        return deleted
      },
    }
  }

  const chart_drawings = {
    async put(record: ChartDrawingRecord) {
      if (!record.id) throw new Error('record.id is required for put')
      store.set(record.id, { ...record })
      return record.id
    },
    where(_index: string) {
      return {
        equals(values: [string, ChartTimeframe]) {
          const [symbol, timeframe] = values
          return collectionFor(symbol, timeframe)
        },
      }
    },
    async delete(id: string) {
      store.delete(id)
    },
    async clear() {
      store.clear()
    },
  }

  return { boardDB: { chart_drawings } }
})

const timeframe: ChartTimeframe = '1h'

describe('chartDrawings Dexie helpers', () => {
  beforeEach(async () => {
    await boardDB.chart_drawings.clear()
  })

  it('saves drawings with generated defaults and lists them by symbol/timeframe', async () => {
    const saved = await saveDrawing({
      symbol: 'SOL',
      timeframe,
      type: 'HLINE',
      points: [{ t: 1_700_000_000, p: 120 }],
    })

    expect(saved.id).toBeDefined()
    expect(saved.origin).toBe('manual')
    expect(saved.createdAt).toBeGreaterThan(0)

    const result = await listDrawings('SOL', timeframe)
    expect(result).toHaveLength(1)
    const firstResult = result[0]
    expect(firstResult?.points[0]?.p).toBe(120)
  })

  it('filters, clears, and deletes drawings by composite key', async () => {
    const first = await saveDrawing({
      id: 'box-1',
      symbol: 'SOL',
      timeframe,
      type: 'BOX',
      points: [
        { t: 1_700_000_000, p: 100 },
        { t: 1_700_100_000, p: 110 },
      ],
    })
    await saveDrawing({
      id: 'other-timeframe',
      symbol: 'SOL',
      timeframe: '4h',
      type: 'LINE',
      points: [
        { t: 1_700_000_000, p: 90 },
        { t: 1_700_100_000, p: 95 },
      ],
    })

    if (!first.id) throw new Error('expected drawing id to be set')

    await deleteDrawing(first.id)
    const remaining = await listDrawings('SOL', '4h')
    expect(remaining).toHaveLength(1)
    expect(remaining[0]?.id).toBe('other-timeframe')

    const cleared = await clearDrawings('SOL', '4h')
    expect(cleared).toBe(1)
    expect(await listDrawings('SOL', '4h')).toHaveLength(0)
  })
})
