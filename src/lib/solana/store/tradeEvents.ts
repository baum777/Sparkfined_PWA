import Dexie, { type Table } from 'dexie'

export type TradeEventSide = 'BUY' | 'SELL'
export type TradeEventSource = 'moralis' | 'helius'

export interface TradeEventRecord {
  id?: number
  txHash: string
  walletId: number | null
  walletAddress: string
  timestamp: number
  side: TradeEventSide
  source: TradeEventSource
  consumed: boolean
  amount: number | null
  price: number | null
  baseSymbol: string | null
  quoteSymbol: string | null
  baseMint: string | null
  quoteMint: string | null
}

export type NewTradeEvent = Omit<TradeEventRecord, 'id' | 'consumed'> & { consumed?: boolean }

export class TradeEventsDB extends Dexie {
  trade_events!: Table<TradeEventRecord, number>

  constructor(name = 'sparkfined-trade-events') {
    super(name)

    this.version(1).stores({
      trade_events: '++id, &[txHash], side, consumed, [side+consumed], walletId, timestamp',
    })
  }
}

export const tradeEventsDB = new TradeEventsDB()

function normalizeTradeEventPayload(event: NewTradeEvent): TradeEventRecord {
  return {
    ...event,
    consumed: event.consumed ?? false,
    amount: event.amount ?? null,
    price: event.price ?? null,
    baseSymbol: event.baseSymbol ?? null,
    quoteSymbol: event.quoteSymbol ?? null,
    baseMint: event.baseMint ?? null,
    quoteMint: event.quoteMint ?? null,
  }
}

export async function saveTradeEvents(
  events: NewTradeEvent[],
  db: TradeEventsDB = tradeEventsDB,
): Promise<TradeEventRecord[]> {
  if (!events.length) return [] as TradeEventRecord[]

  const normalized = events.map(normalizeTradeEventPayload)
  const created: TradeEventRecord[] = []

  for (const event of normalized) {
    try {
      const id = await db.trade_events.add(event)
      created.push({ ...event, id })
    } catch (error) {
      if (error instanceof Dexie.ConstraintError) {
        continue
      }

      throw error
    }
  }

  return created
}

export async function listUnconsumedBuyEvents(
  limit = 50,
  db: TradeEventsDB = tradeEventsDB,
): Promise<TradeEventRecord[]> {
  return db.trade_events
    .orderBy('timestamp')
    .reverse()
    .filter((event: TradeEventRecord) => event.side === 'BUY' && event.consumed === false)
    .limit(limit)
    .toArray()
}

export async function countUnconsumedBuyEvents(db: TradeEventsDB = tradeEventsDB): Promise<number> {
  return db.trade_events.filter((event) => event.side === 'BUY' && event.consumed === false).count()
}

export async function markEventConsumed(id: number, db: TradeEventsDB = tradeEventsDB): Promise<void> {
  await db.trade_events.update(id, { consumed: true })
}
