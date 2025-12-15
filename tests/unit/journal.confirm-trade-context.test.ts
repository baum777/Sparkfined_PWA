import 'fake-indexeddb/auto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { confirmTradeFromContext, FALLBACK_WINDOW_MS } from '@/features/journal-v2/services/confirmTradeFromContext'
import { TradeEventsDB, saveTradeEvents } from '@/lib/solana/store/tradeEvents'
import { TradeLogsDB } from '@/lib/solana/store/tradeLogs'

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

const createDbs = () => ({
  tradeEventsDb: new TradeEventsDB(`trade-events-${Date.now()}-${Math.random()}`),
  tradeLogsDb: new TradeLogsDB(`trade-logs-${Date.now()}-${Math.random()}`),
})

describe('confirmTradeFromContext', () => {
  let tradeEventsDb: TradeEventsDB
  let tradeLogsDb: TradeLogsDB

  beforeEach(() => {
    const dbs = createDbs()
    tradeEventsDb = dbs.tradeEventsDb
    tradeLogsDb = dbs.tradeLogsDb
  })

  afterEach(async () => {
    await tradeEventsDb.delete()
    await tradeLogsDb.delete()
  })

  it('updates an existing log when txHash matches and avoids new inserts', async () => {
    const timestamp = 1_700_000_000_000
    const [event] = await saveTradeEvents(
      [
        {
          ...baseEvent,
          txHash: 'tx-match',
          timestamp,
        },
      ],
      tradeEventsDb,
    )

    if (!event?.id) throw new Error('expected trade event id')

    const shadowId = await tradeLogsDb.trade_logs.add({
      action: 'BUY',
      origin: 'pipeline',
      status: 'shadow',
      generatedAt: timestamp - 1_000,
      quoteCurrency: 'USD',
      signalPrice: null,
      fillPrice: null,
      txHash: 'tx-match',
      walletId: null,
      confirmedAt: null,
    })

    const updated = await confirmTradeFromContext({
      context: {
        eventId: event.id,
        txHash: 'tx-match',
        walletId: 12,
        timestamp,
        side: 'BUY',
        amount: 1,
        price: 0.5,
        baseSymbol: 'SOL',
        quoteSymbol: 'USDC',
        quoteCurrency: 'USD',
      },
      journalEntryId: 99,
      tradeEventsDb,
      tradeLogsDb,
    })

    expect(updated.id).toBe(shadowId)
    expect(updated.status).toBe('confirmed')
    expect(updated.journalEntryId).toBe(99)
    expect(updated.fillPrice).toBe(0.5)
    expect(await tradeLogsDb.trade_logs.count()).toBe(1)

    const storedEvent = await tradeEventsDb.trade_events.get(event.id)
    expect(storedEvent?.consumed).toBe(true)
  })

  it('falls back to nearby shadow logs when txHash is new', async () => {
    const timestamp = 1_700_000_100_000
    const [event] = await saveTradeEvents(
      [
        {
          ...baseEvent,
          txHash: 'tx-fallback',
          timestamp,
        },
      ],
      tradeEventsDb,
    )

    if (!event?.id) throw new Error('expected trade event id')

    const nearbyShadowId = await tradeLogsDb.trade_logs.add({
      action: 'BUY',
      origin: 'pipeline',
      status: 'shadow',
      generatedAt: timestamp - FALLBACK_WINDOW_MS + 2_000,
      quoteCurrency: 'USD',
      signalPrice: null,
      fillPrice: null,
      txHash: null,
      walletId: null,
      confirmedAt: null,
    })

    const confirmed = await confirmTradeFromContext({
      context: {
        eventId: event.id,
        txHash: 'tx-fallback',
        walletId: 2,
        timestamp,
        side: 'BUY',
        amount: 2,
        price: 0.75,
        baseSymbol: 'SOL',
        quoteSymbol: 'USDC',
        quoteCurrency: 'USD',
      },
      tradeEventsDb,
      tradeLogsDb,
    })

    expect(confirmed.id).toBe(nearbyShadowId)
    expect(confirmed.status).toBe('confirmed')
    expect(confirmed.txHash).toBe('tx-fallback')
    expect(await tradeLogsDb.trade_logs.count()).toBe(1)
    expect((await tradeEventsDb.trade_events.get(event.id))?.consumed).toBe(true)
  })

  it('creates a new confirmed log when no match is found', async () => {
    const timestamp = 1_700_000_200_000
    const [event] = await saveTradeEvents(
      [
        {
          ...baseEvent,
          txHash: 'tx-new',
          timestamp,
        },
      ],
      tradeEventsDb,
    )

    if (!event?.id) throw new Error('expected trade event id')

    const created = await confirmTradeFromContext({
      context: {
        eventId: event.id,
        txHash: 'tx-new',
        walletId: 3,
        timestamp,
        side: 'BUY',
        amount: null,
        price: 0.9,
        baseSymbol: 'SOL',
        quoteSymbol: 'USDC',
        quoteCurrency: 'USD',
      },
      tradeEventsDb,
      tradeLogsDb,
    })

    expect(created.status).toBe('confirmed')
    expect(created.origin).toBe('onchain')
    expect(created.journalEntryId).toBeUndefined()
    expect(await tradeLogsDb.trade_logs.count()).toBe(1)
    expect((await tradeEventsDb.trade_events.get(event.id))?.consumed).toBe(true)
  })
})
