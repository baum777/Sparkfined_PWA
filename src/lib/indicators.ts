import type { ChartIndicatorOverlay, ComputedIndicator, IndicatorSeriesPoint, OhlcCandle } from '@/domain/chart'
import type { UTCTimestamp } from 'lightweight-charts'

function toPoint(timeMs: number, value: number): IndicatorSeriesPoint {
  return { time: Math.floor(timeMs / 1000) as UTCTimestamp, value }
}

export function computeSma(candles: OhlcCandle[], period: number): IndicatorSeriesPoint[] {
  if (period <= 0) return []
  const values: IndicatorSeriesPoint[] = []

  for (let i = 0; i < candles.length; i += 1) {
    if (i + 1 < period) continue
    const slice = candles.slice(i + 1 - period, i + 1)
    const avg = slice.reduce((sum, candle) => sum + candle.c, 0) / period
    const currentCandle = candles[i]
    if (!currentCandle) continue
    values.push(toPoint(currentCandle.t, avg))
  }

  return values
}

export function computeEma(candles: OhlcCandle[], period: number): IndicatorSeriesPoint[] {
  if (period <= 0 || candles.length === 0) return []

  const multiplier = 2 / (period + 1)
  const ema: IndicatorSeriesPoint[] = []
  let prevEma: number | undefined

  candles.forEach((candle, index) => {
    const close = candle.c
    if (index === 0) {
      prevEma = close
    } else if (prevEma !== undefined) {
      prevEma = (close - prevEma) * multiplier + prevEma
    }

    if (index + 1 >= period && prevEma !== undefined) {
      ema.push(toPoint(candle.t, prevEma))
    }
  })

  return ema
}

export function computeBollingerBands(
  candles: OhlcCandle[],
  period: number,
  deviation: number
): { basis: IndicatorSeriesPoint[]; upper: IndicatorSeriesPoint[]; lower: IndicatorSeriesPoint[] } {
  if (period <= 0) {
    return { basis: [], upper: [], lower: [] }
  }

  const basis = computeSma(candles, period)
  const upper: IndicatorSeriesPoint[] = []
  const lower: IndicatorSeriesPoint[] = []

  for (let i = period - 1; i < candles.length; i += 1) {
    const slice = candles.slice(i + 1 - period, i + 1)
    const mean = basis[i - (period - 1)]?.value
    if (typeof mean !== 'number') continue

    const variance =
      slice.reduce((sum, candle) => sum + (candle.c - mean) ** 2, 0) / (period > 1 ? period - 1 : 1)
    const stdDev = Math.sqrt(variance)
    const offset = stdDev * deviation
    const currentCandle = candles[i]
    if (!currentCandle) continue
    const time = currentCandle.t

    upper.push(toPoint(time, mean + offset))
    lower.push(toPoint(time, mean - offset))
  }

  return { basis, upper, lower }
}

export function computeIndicators(candles: OhlcCandle[], overlays: ChartIndicatorOverlay[]): ComputedIndicator[] {
  if (!overlays || overlays.length === 0) return []

  return overlays.flatMap<ComputedIndicator>((overlay, index) => {
    if (overlay.type === 'sma') {
      return [
        {
          id: `sma-${overlay.period}-${index}`,
          type: 'line',
          config: overlay,
          points: computeSma(candles, overlay.period),
          color: '#8b5cf6',
        },
      ]
    }

    if (overlay.type === 'ema') {
      return [
        {
          id: `ema-${overlay.period}-${index}`,
          type: 'line',
          config: overlay,
          points: computeEma(candles, overlay.period),
          color: '#22d3ee',
        },
      ]
    }

    if (overlay.type === 'bb') {
      const bands = computeBollingerBands(candles, overlay.period, overlay.deviation)
      return [
        {
          id: `bb-${overlay.period}-${overlay.deviation}-${index}`,
          type: 'bb',
          config: overlay,
          basis: bands.basis,
          upper: bands.upper,
          lower: bands.lower,
          color: '#fbbf24',
        },
      ]
    }

    return []
  })
}

export function buildIndicators(
  candles: OhlcCandle[],
  overlays?: ChartIndicatorOverlay[]
): ComputedIndicator[] {
  if (!overlays || overlays.length === 0) return []
  return computeIndicators(candles, overlays)
}
