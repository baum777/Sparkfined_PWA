import { describe, test, expect } from 'vitest'
import { sma, ema, vwap, macd, macdSignal, type MacdResult } from '../indicators'
import type { OhlcPoint } from '../CandlesCanvas'

describe('Technical Indicators', () => {
  // Sample OHLC data for testing
  const sampleData: OhlcPoint[] = [
    { t: 1000, o: 100, h: 105, l: 95, c: 102, v: 1000 },
    { t: 2000, o: 102, h: 108, l: 100, c: 106, v: 1200 },
    { t: 3000, o: 106, h: 110, l: 104, c: 108, v: 1100 },
    { t: 4000, o: 108, h: 112, l: 106, c: 110, v: 1300 },
    { t: 5000, o: 110, h: 115, l: 108, c: 113, v: 1400 },
    { t: 6000, o: 113, h: 118, l: 111, c: 115, v: 1500 },
    { t: 7000, o: 115, h: 120, l: 113, c: 117, v: 1600 },
    { t: 8000, o: 117, h: 122, l: 115, c: 119, v: 1700 },
    { t: 9000, o: 119, h: 124, l: 117, c: 121, v: 1800 },
    { t: 10000, o: 121, h: 126, l: 119, c: 123, v: 1900 },
    { t: 11000, o: 123, h: 128, l: 121, c: 125, v: 2000 },
    { t: 12000, o: 125, h: 130, l: 123, c: 127, v: 2100 },
    { t: 13000, o: 127, h: 132, l: 125, c: 129, v: 2200 },
    { t: 14000, o: 129, h: 134, l: 127, c: 131, v: 2300 },
    { t: 15000, o: 131, h: 136, l: 129, c: 133, v: 2400 },
    { t: 16000, o: 133, h: 138, l: 131, c: 135, v: 2500 },
    { t: 17000, o: 135, h: 140, l: 133, c: 137, v: 2600 },
    { t: 18000, o: 137, h: 142, l: 135, c: 139, v: 2700 },
    { t: 19000, o: 139, h: 144, l: 137, c: 141, v: 2800 },
    { t: 20000, o: 141, h: 146, l: 139, c: 143, v: 2900 },
    { t: 21000, o: 143, h: 148, l: 141, c: 145, v: 3000 },
    { t: 22000, o: 145, h: 150, l: 143, c: 147, v: 3100 },
    { t: 23000, o: 147, h: 152, l: 145, c: 149, v: 3200 },
    { t: 24000, o: 149, h: 154, l: 147, c: 151, v: 3300 },
    { t: 25000, o: 151, h: 156, l: 149, c: 153, v: 3400 },
    { t: 26000, o: 153, h: 158, l: 151, c: 155, v: 3500 },
    { t: 27000, o: 155, h: 160, l: 153, c: 157, v: 3600 },
    { t: 28000, o: 157, h: 162, l: 155, c: 159, v: 3700 },
    { t: 29000, o: 159, h: 164, l: 157, c: 161, v: 3800 },
    { t: 30000, o: 161, h: 166, l: 159, c: 163, v: 3900 },
  ]

  describe('SMA (Simple Moving Average)', () => {
    test('should calculate SMA correctly', () => {
      const result = sma(sampleData, 5)
      
      // First 4 values should be undefined (need 5 periods)
      expect(result[0]).toBeUndefined()
      expect(result[1]).toBeUndefined()
      expect(result[2]).toBeUndefined()
      expect(result[3]).toBeUndefined()
      
      // 5th value should be average of first 5 closes
      // (102 + 106 + 108 + 110 + 113) / 5 = 107.8
      expect(result[4]).toBeCloseTo(107.8, 1)
    })

    test('should handle empty array', () => {
      const result = sma([], 5)
      expect(result).toEqual([])
    })
  })

  describe('EMA (Exponential Moving Average)', () => {
    test('should calculate EMA correctly', () => {
      const result = ema(sampleData, 5)
      
      // First 4 values should be undefined
      expect(result[0]).toBeUndefined()
      expect(result[1]).toBeUndefined()
      expect(result[2]).toBeUndefined()
      expect(result[3]).toBeUndefined()
      
      // 5th value should exist (seeded with SMA)
      expect(result[4]).toBeDefined()
      expect(result[4]).toBeGreaterThan(100)
    })

    test('should handle period of 1', () => {
      const result = ema(sampleData, 1)
      // All values should be undefined for period 1
      expect(result.every(v => v === undefined)).toBe(true)
    })
  })

  describe('VWAP (Volume Weighted Average Price)', () => {
    test('should calculate VWAP correctly', () => {
      const result = vwap(sampleData)
      
      // First value should be calculated
      expect(result[0]).toBeDefined()
      
      // VWAP should increase with uptrend
      const lastVwap = result[result.length - 1]
      expect(lastVwap).toBeDefined()
      expect(lastVwap).toBeGreaterThan(100)
    })

    test('should handle missing volume', () => {
      const dataWithoutVolume: OhlcPoint[] = [
        { t: 1000, o: 100, h: 105, l: 95, c: 102 },
        { t: 2000, o: 102, h: 108, l: 100, c: 106 },
      ]
      
      const result = vwap(dataWithoutVolume)
      
      // Should still work with fallback volume of 1
      expect(result[0]).toBeDefined()
      expect(result[1]).toBeDefined()
    })
  })

  describe('MACD (Moving Average Convergence Divergence)', () => {
    test('should calculate MACD with default periods (12, 26, 9)', () => {
      const result = macd(sampleData)
      
      expect(result).toHaveProperty('macd')
      expect(result).toHaveProperty('signal')
      expect(result).toHaveProperty('histogram')
      
      expect(result.macd).toHaveLength(sampleData.length)
      expect(result.signal).toHaveLength(sampleData.length)
      expect(result.histogram).toHaveLength(sampleData.length)
    })

    test('should have undefined values for early periods', () => {
      const result = macd(sampleData, 12, 26, 9)
      
      // First 25 values should be undefined (slow period - 1)
      expect(result.macd[24]).toBeUndefined()
      
      // After slow period, MACD should be defined
      expect(result.macd[25]).toBeDefined()
    })

    test('should calculate histogram correctly', () => {
      const result = macd(sampleData, 5, 10, 3)
      
      // Find first defined histogram value
      const firstDefinedIdx = result.histogram.findIndex(v => v !== undefined)
      expect(firstDefinedIdx).toBeGreaterThan(-1)
      
      // Histogram should equal MACD - Signal
      const idx = result.histogram.length - 1
      if (result.macd[idx] !== undefined && result.signal[idx] !== undefined && result.histogram[idx] !== undefined) {
        const expectedHistogram = result.macd[idx]! - result.signal[idx]!
        expect(result.histogram[idx]).toBeCloseTo(expectedHistogram, 6)
      }
    })

    test('should work with custom periods', () => {
      const result = macd(sampleData, 8, 17, 9)
      
      expect(result.macd).toHaveLength(sampleData.length)
      expect(result.signal).toHaveLength(sampleData.length)
      expect(result.histogram).toHaveLength(sampleData.length)
    })

    test('MACD should be positive in uptrend', () => {
      // In a strong uptrend, fast EMA > slow EMA, so MACD should be positive
      const result = macd(sampleData, 5, 10, 3)
      const lastMacd = result.macd[result.macd.length - 1]
      
      expect(lastMacd).toBeDefined()
      expect(lastMacd).toBeGreaterThan(0)
    })

    test('should handle empty array', () => {
      const result = macd([])
      
      expect(result.macd).toEqual([])
      expect(result.signal).toEqual([])
      expect(result.histogram).toEqual([])
    })
  })

  describe('MACD Signal Detection', () => {
    test('should return bullish signal when MACD > Signal', () => {
      const macdData: MacdResult = {
        macd: [undefined, undefined, 0.5, 1.0, 1.5],
        signal: [undefined, undefined, 0.3, 0.7, 1.0],
        histogram: [undefined, undefined, 0.2, 0.3, 0.5],
      }
      
      const signal = macdSignal(macdData)
      expect(signal).toBe(1) // Bullish
    })

    test('should return bearish signal when MACD < Signal', () => {
      const macdData: MacdResult = {
        macd: [undefined, undefined, 1.5, 1.0, 0.5],
        signal: [undefined, undefined, 1.0, 1.2, 1.3],
        histogram: [undefined, undefined, 0.5, -0.2, -0.8],
      }
      
      const signal = macdSignal(macdData)
      expect(signal).toBe(-1) // Bearish
    })

    test('should detect bullish crossover', () => {
      const macdData: MacdResult = {
        macd: [undefined, undefined, -0.5, -0.1, 0.2],
        signal: [undefined, undefined, 0.5, 0.3, 0.1],
        histogram: [undefined, undefined, -1.0, -0.4, 0.1],
      }
      
      const signal = macdSignal(macdData)
      expect(signal).toBe(1) // Bullish crossover
    })

    test('should detect bearish crossover', () => {
      const macdData: MacdResult = {
        macd: [undefined, undefined, 0.5, 0.1, -0.2],
        signal: [undefined, undefined, -0.5, -0.3, -0.1],
        histogram: [undefined, undefined, 1.0, 0.4, -0.1],
      }
      
      const signal = macdSignal(macdData)
      expect(signal).toBe(-1) // Bearish crossover
    })

    test('should return neutral for insufficient data', () => {
      const macdData: MacdResult = {
        macd: [undefined],
        signal: [undefined],
        histogram: [undefined],
      }
      
      const signal = macdSignal(macdData)
      expect(signal).toBe(0) // Neutral
    })

    test('should handle undefined values gracefully', () => {
      const macdData: MacdResult = {
        macd: [undefined, undefined, 0.5],
        signal: [undefined, undefined, undefined],
        histogram: [undefined, undefined, undefined],
      }
      
      const signal = macdSignal(macdData)
      expect(signal).toBe(0) // Neutral (missing signal value)
    })
  })
})
