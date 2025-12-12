import type { OHLCSeries } from '@/lib/types/ohlc'
import type { Signal, SignalRule } from '@/lib/signalDb'

export interface BreakoutParams {
  lookbackPeriods: number
  breakoutMultiplier?: number
}

const defaultBreakoutParams: BreakoutParams = {
  lookbackPeriods: 20,
  breakoutMultiplier: 1,
}

const resolveBreakoutParams = (rule: SignalRule): BreakoutParams => {
  const params = rule.params
  const lookback = typeof params.lookbackPeriods === 'number'
    ? params.lookbackPeriods
    : defaultBreakoutParams.lookbackPeriods
  const breakoutMultiplier = typeof params.breakoutMultiplier === 'number'
    ? params.breakoutMultiplier
    : defaultBreakoutParams.breakoutMultiplier

  return { lookbackPeriods: lookback, breakoutMultiplier }
}

const createSignalId = (prefix: string) => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}

export function detectBreakout(series: OHLCSeries, rule: SignalRule): Signal | null {
  const params = resolveBreakoutParams(rule)
  const { points } = series
  if (points.length <= params.lookbackPeriods) {
    return null
  }

  const last = points.at(-1)
  if (!last) {
    return null
  }
  const lookbackSlice = points.slice(-1 - params.lookbackPeriods, -1)

  const highestHigh = Math.max(...lookbackSlice.map((point) => point.high))
  const lowestLow = Math.min(...lookbackSlice.map((point) => point.low))
  const breakoutMultiplier = params.breakoutMultiplier ?? 1

  const triggeredAt = new Date(last.timestamp).toISOString()

  if (last.close > highestHigh * breakoutMultiplier) {
    return {
      id: createSignalId('sig'),
      symbol: series.symbol,
      ruleId: rule.id,
      type: 'breakout',
      triggeredAt,
      meta: {
        direction: 'bullish',
        price: last.close,
        timeframe: series.timeframe,
        lookbackPeriods: params.lookbackPeriods,
        breakoutMultiplier,
        highestHigh,
      },
    }
  }

  if (last.close < lowestLow / breakoutMultiplier) {
    return {
      id: createSignalId('sig'),
      symbol: series.symbol,
      ruleId: rule.id,
      type: 'breakout',
      triggeredAt,
      meta: {
        direction: 'bearish',
        price: last.close,
        timeframe: series.timeframe,
        lookbackPeriods: params.lookbackPeriods,
        breakoutMultiplier,
        lowestLow,
      },
    }
  }

  return null
}
