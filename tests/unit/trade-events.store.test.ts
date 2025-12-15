import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import {
  TradeEventsDB,
  countUnconsumedBuyEvents,
  listUnconsumedBuyEvents,
  markEventConsumed,
  saveTradeEvents,
} from '@/lib/solana/store/tradeEvents'

const createDb = () => new TradeEventsDB(`trade-events-${Date.now()}-${Math.random()}`)

const baseEvent = {
  walletId: 1,
  walletAddress: 'wallet-address',
  side: 'BUY' as const,
  source: 'moralis' as const,
  amount: 1,
  price: 0.5,
  baseSymbol: 'SOL',
  quoteSymbol: 'USDC',
  baseMint: null,
  quoteMint: null,
}

describe('trade events store', () => {
  let db: TradeEventsDB

  beforeEach(() => {
    db = createDb()
  })

  afterEach(async () => {
    await db.delete()
  })

  it('dedupes events by txHash when saving', async () => {
    const [first] = await saveTradeEvents(
      [
        {
          ...baseEvent,
          txHash: 'tx-1',
          timestamp: 1_700_000_000_000,
        },
      ],
      db,
    )

    if (!first) {
      throw new Error('Trade event was not persisted')
    }

    const second = await saveTradeEvents(
      [
        {
          ...baseEvent,
          txHash: 'tx-1',
          timestamp: 1_700_000_000_100,
        },
      ],
      db,
    )

    expect(first.id).toBeDefined()
    expect(second).toHaveLength(0)
    expect(await db.trade_events.count()).toBe(1)
  })

  it('lists and counts unconsumed BUY events only', async () => {
    await saveTradeEvents(
      [
        { ...baseEvent, txHash: 'tx-1', timestamp: 1_700_000_000_000 },
        { ...baseEvent, txHash: 'tx-2', side: 'SELL', timestamp: 1_700_000_100_000 },
        { ...baseEvent, txHash: 'tx-3', timestamp: 1_700_000_200_000 },
        { ...baseEvent, txHash: 'tx-4', timestamp: 1_700_000_300_000, consumed: true },
      ],
      db,
    )

    const events = await listUnconsumedBuyEvents(2, db)

    expect(events.map(({ txHash }) => txHash)).toEqual(['tx-3', 'tx-1'])
    expect(await countUnconsumedBuyEvents(db)).toBe(2)
  })

  it('marks an event as consumed', async () => {
    const [event] = await saveTradeEvents(
      [
        {
          ...baseEvent,
          txHash: 'tx-consume',
          timestamp: 1_700_000_400_000,
        },
      ],
      db,
    )

    if (!event) {
      throw new Error('Trade event was not persisted')
    }

    await markEventConsumed(event.id!, db)

    expect(await countUnconsumedBuyEvents(db)).toBe(0)
  })
})
