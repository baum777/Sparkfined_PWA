import { describe, expect, it } from 'vitest'
import { computeSma, computeEma, computeBollingerBands, buildIndicators } from '@/lib/indicators'
import type { OhlcCandle } from '@/domain/chart'

const candles: OhlcCandle[] = [
  { t: 1_000, o: 1, h: 2, l: 0.5, c: 1, v: 10 },
  { t: 2_000, o: 1, h: 2, l: 0.5, c: 2, v: 10 },
  { t: 3_000, o: 2, h: 3, l: 1.5, c: 3, v: 10 },
  { t: 4_000, o: 3, h: 4, l: 2.5, c: 4, v: 10 },
]

describe('indicator calculations', () => {
  it('computes SMA over closing prices', () => {
    const points = computeSma(candles, 2)
    expect(points.map((p) => p.value)).toEqual([1.5, 2.5, 3.5])
    // time is now UTCTimestamp (seconds since epoch)
    expect(points[0]!.time).toBe(2)
  })

  it('computes EMA smoothing correctly', () => {
    const points = computeEma(candles, 2)
    const rounded = points.map((p) => Number(p.value.toFixed(2)))
    expect(rounded).toEqual([1.5, 2.5, 3.5])
  })

  it('computes bollinger bands with deviation applied', () => {
    const { basis, upper, lower } = computeBollingerBands(candles, 3, 2)
    expect(basis.length).toBe(2)
    expect(upper.length).toBe(2)
    expect(lower.length).toBe(2)
    expect(Number(upper[0]!.value.toFixed(4))).toBeGreaterThan(Number(basis[0]!.value.toFixed(4)))
    expect(Number(lower[0]!.value.toFixed(4))).toBeLessThan(Number(basis[0]!.value.toFixed(4)))
  })

  it('buildIndicators maps overlays into computed indicator payloads', () => {
    const result = buildIndicators(candles, [
      { type: 'sma', period: 2 },
      { type: 'ema', period: 3 },
      { type: 'bb', period: 3, deviation: 2 },
    ])

    expect(result.some((indicator) => indicator.type === 'line')).toBe(true)
    expect(result.some((indicator) => indicator.type === 'bb')).toBe(true)
  })
})
