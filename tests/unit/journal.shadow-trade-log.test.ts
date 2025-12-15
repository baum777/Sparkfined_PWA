import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createShadowTradeLogFromPipeline } from '@/features/journal-v2/services/shadowTradeLog'
import { TradeLogsDB } from '@/lib/solana/store/tradeLogs'

const createDb = () => new TradeLogsDB(`shadow-trades-${Date.now()}-${Math.random()}`)

describe('shadow trade log service', () => {
  let db: TradeLogsDB

  beforeEach(() => {
    db = createDb()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('persists pipeline output as a shadow trade log', async () => {
    const record = await createShadowTradeLogFromPipeline(
      {
        journalEntryId: 1,
        action: 'BUY',
        quoteCurrency: 'USD',
        generatedAt: 1_700_000_000_000,
        signalPrice: 120.5,
      },
      db,
    )

    expect(record.id).toBeDefined()
    const stored = await db.trade_logs.get(record.id!)
    expect(stored?.status).toBe('shadow')
    expect(stored?.origin).toBe('pipeline')
    expect(stored?.signalPrice).toBe(120.5)
    expect(stored?.quoteCurrency).toBe('USD')
  })

  it('is idempotent per journal entry id', async () => {
    const first = await createShadowTradeLogFromPipeline(
      {
        journalEntryId: 42,
        action: 'SELL',
        quoteCurrency: 'USD',
        generatedAt: Date.now(),
        signalPrice: null,
      },
      db,
    )

    const second = await createShadowTradeLogFromPipeline(
      {
        journalEntryId: 42,
        action: 'SELL',
        quoteCurrency: 'USD',
        generatedAt: Date.now(),
        signalPrice: null,
      },
      db,
    )

    expect(first.id).toBe(second.id)
    expect(await db.trade_logs.count()).toBe(1)
  })
})
