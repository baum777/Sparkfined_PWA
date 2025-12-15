import { describe, expect, it } from 'vitest'
import type { OhlcCandle } from '@/domain/chart'
import { computeBollingerBands, computeEma, computeSma } from '@/lib/indicators'

const sampleCandles: OhlcCandle[] = [
  { t: 1000, o: 10, h: 10, l: 10, c: 10 },
  { t: 2000, o: 11, h: 11, l: 11, c: 11 },
  { t: 3000, o: 12, h: 12, l: 12, c: 12 },
  { t: 4000, o: 13, h: 13, l: 13, c: 13 },
  { t: 5000, o: 14, h: 14, l: 14, c: 14 },
]

const shortCandles: OhlcCandle[] = [
  { t: 1000, o: 1, h: 1, l: 1, c: 1 },
  { t: 2000, o: 2, h: 2, l: 2, c: 2 },
]

describe('indicator computations', () => {
  it('computes SMA with correct windowing', () => {
    const result = computeSma(sampleCandles, 3)
    expect(result.map((point) => point.time)).toEqual([3, 4, 5])
    expect(result.map((point) => point.value)).toEqual([11, 12, 13])
  })

  it('computes EMA seeded by SMA', () => {
    const result = computeEma(sampleCandles, 3)
    expect(result.map((point) => point.time)).toEqual([3, 4, 5])
    expect(result.map((point) => point.value)).toEqual([11, 12, 13])
  })

  it('computes Bollinger Bands with mid/upper/lower values', () => {
    const bands = computeBollingerBands(sampleCandles, 3, 2)

    expect(bands.basis.map((point) => point.time)).toEqual([3, 4, 5])
    expect(bands.basis.map((point) => point.value)).toEqual([11, 12, 13])

    expect(bands.upper.map((point) => point.value)).toEqual([13, 14, 15])
    expect(bands.lower.map((point) => point.value)).toEqual([9, 10, 11])
  })

  it('returns empty arrays when there are not enough candles', () => {
    expect(computeSma(shortCandles, 3)).toEqual([])
    expect(computeEma(shortCandles, 3)).toEqual([])

    const bands = computeBollingerBands(shortCandles, 3, 2)
    expect(bands.basis).toEqual([])
    expect(bands.upper).toEqual([])
    expect(bands.lower).toEqual([])
  })
})
