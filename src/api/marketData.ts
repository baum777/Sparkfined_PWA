import type { ChartTimeframe } from "@/domain/chart"
import { fetchTokenCandles } from "@/lib/priceAdapter"

export type CandleDTO = {
  t: number
  o: number
  h: number
  l: number
  c: number
  v?: number
}

export type MarketSymbol = {
  symbol: string
  address?: string
  network?: string
}

export type CandleRequest = MarketSymbol & {
  timeframe: ChartTimeframe
  limit?: number
}

const DEFAULT_LIMIT = 160
const BASELINE_TIMESTAMP = 1_700_000_000

const TIMEFRAME_SECONDS: Partial<Record<ChartTimeframe, number>> = {
  "1m": 60,
  "5m": 300,
  "15m": 900,
  "1h": 3600,
  "4h": 14_400,
  "1d": 86_400,
  "1w": 604_800,
}

const hashSeed = (value: string) => {
  let hash = 2166136261
  for (let i = 0; i < value.length; i += 1) {
    hash ^= value.charCodeAt(i)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

const createRng = (seed: number) => {
  let state = seed >>> 0
  return () => {
    state = (Math.imul(1664525, state) + 1013904223) >>> 0
    return state / 2 ** 32
  }
}

const buildMockCandles = ({ symbol, timeframe, limit = DEFAULT_LIMIT }: CandleRequest): CandleDTO[] => {
  const normalizedSymbol = symbol.trim().toUpperCase()
  const seed = hashSeed(`${normalizedSymbol}:${timeframe}`)
  const rand = createRng(seed)
  const interval = TIMEFRAME_SECONDS[timeframe] ?? 3600
  const count = Math.max(40, limit)

  const basePrice = 40 + (seed % 120)
  let current = basePrice + rand() * 5

  return Array.from({ length: count }, (_, index) => {
    const drift = (rand() - 0.5) * 0.08
    const open = current
    const close = Math.max(0.01, open + open * drift)
    const high = Math.max(open, close) * (1 + rand() * 0.02)
    const low = Math.min(open, close) * (1 - rand() * 0.02)
    const volume = Math.round(800 + rand() * 900)
    current = close

    return {
      t: BASELINE_TIMESTAMP + index * interval,
      o: Number(open.toFixed(4)),
      h: Number(high.toFixed(4)),
      l: Number(low.toFixed(4)),
      c: Number(close.toFixed(4)),
      v: volume,
    }
  })
}

const mapCandles = (candles: { time: number; open: number; high: number; low: number; close: number; volume?: number }[]) =>
  candles.map((candle) => ({
    t: candle.time,
    o: candle.open,
    h: candle.high,
    l: candle.low,
    c: candle.close,
    v: candle.volume,
  }))

export const getCandles = async ({ symbol, timeframe, address, network = "solana", limit = DEFAULT_LIMIT }: CandleRequest) => {
  if (!address) {
    return buildMockCandles({ symbol, timeframe, limit })
  }

  try {
    const candles = await fetchTokenCandles(network, address, { limit })
    if (candles.length === 0) {
      return []
    }
    return mapCandles(candles)
  } catch (error) {
    console.warn("[marketData] falling back to mock candles", error)
    return buildMockCandles({ symbol, timeframe, limit })
  }
}

export default { getCandles }
