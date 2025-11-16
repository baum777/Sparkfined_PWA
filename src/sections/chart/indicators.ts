import type { OhlcPoint } from "./CandlesCanvas";

export function sma(points: OhlcPoint[], period: number): Array<number | undefined> {
  const out: Array<number | undefined> = new Array(points.length).fill(undefined);
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (!p) continue;
    sum += p.c;
    if (i >= period) {
      const old = points[i - period];
      if (old) sum -= old.c;
    }
    if (i >= period - 1) out[i] = sum / period;
  }
  return out;
}

export function ema(points: OhlcPoint[], period: number): Array<number | undefined> {
  const out: Array<number | undefined> = new Array(points.length).fill(undefined);
  if (period <= 1 || points.length === 0) return out;
  const k = 2 / (period + 1);
  // seed: SMA of first period
  let seed = 0;
  for (let i = 0; i < Math.min(period, points.length); i++) {
    const p = points[i];
    if (p) seed += p.c;
  }
  if (points.length >= period) {
    let prev = seed / period;
    for (let i = period - 1; i < points.length; i++) {
      const point = points[i];
      if (!point) continue;
      const cur = i === (period - 1) ? prev : (point.c - prev) * k + prev;
      out[i] = cur;
      prev = cur;
    }
  }
  return out;
}

export function vwap(points: OhlcPoint[]): Array<number | undefined> {
  // VWAP uses typical price * volume cumulative / cumulative volume
  const out: Array<number | undefined> = new Array(points.length).fill(undefined);
  let cumPV = 0;
  let cumV = 0;
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (!p) continue;
    const vol = typeof p.v === "number" && p.v > 0 ? p.v : 1; // fallback if volume missing
    const typical = (p.h + p.l + p.c) / 3;
    cumPV += typical * vol;
    cumV += vol;
    out[i] = cumV > 0 ? cumPV / cumV : undefined;
  }
  return out;
}

/**
 * MACD (Moving Average Convergence Divergence)
 * Returns { macd, signal, histogram } arrays
 * 
 * @param points - OHLC data points
 * @param fastPeriod - Fast EMA period (default: 12)
 * @param slowPeriod - Slow EMA period (default: 26)
 * @param signalPeriod - Signal line EMA period (default: 9)
 */
export interface MacdResult {
  macd: Array<number | undefined>;
  signal: Array<number | undefined>;
  histogram: Array<number | undefined>;
}

export function macd(
  points: OhlcPoint[],
  fastPeriod = 12,
  slowPeriod = 26,
  signalPeriod = 9
): MacdResult {
  const closes = points.map(p => p.c);
  
  // Calculate fast and slow EMAs
  const fastEma = emaFromValues(closes, fastPeriod);
  const slowEma = emaFromValues(closes, slowPeriod);
  
  // MACD Line = Fast EMA - Slow EMA
  const macdLine: Array<number | undefined> = new Array(points.length).fill(undefined);
  for (let i = 0; i < points.length; i++) {
    if (fastEma[i] !== undefined && slowEma[i] !== undefined) {
      macdLine[i] = fastEma[i]! - slowEma[i]!;
    }
  }
  
  // Signal Line = EMA of MACD Line
  const signalLine = emaFromValues(
    macdLine.map(v => v ?? 0), 
    signalPeriod
  );
  
  // Histogram = MACD Line - Signal Line
  const histogram: Array<number | undefined> = new Array(points.length).fill(undefined);
  for (let i = 0; i < points.length; i++) {
    if (macdLine[i] !== undefined && signalLine[i] !== undefined) {
      histogram[i] = macdLine[i]! - signalLine[i]!;
    }
  }
  
  return {
    macd: macdLine,
    signal: signalLine,
    histogram
  };
}

/**
 * Helper: Calculate EMA from array of values (not OhlcPoints)
 */
function emaFromValues(values: number[], period: number): Array<number | undefined> {
  const out: Array<number | undefined> = new Array(values.length).fill(undefined);
  if (period <= 1 || values.length === 0) return out;
  
  const k = 2 / (period + 1);
  
  // Seed with SMA of first period
  let seed = 0;
  let validCount = 0;
  for (let i = 0; i < Math.min(period, values.length); i++) {
    const val = values[i];
    if (val !== undefined && !isNaN(val)) {
      seed += val;
      validCount++;
    }
  }
  
  if (validCount === 0) return out;
  
  let prev = seed / validCount;
  for (let i = period - 1; i < values.length; i++) {
    const val = values[i];
    if (val === undefined || isNaN(val)) continue;
    
    const cur = i === (period - 1) ? prev : (val - prev) * k + prev;
    out[i] = cur;
    prev = cur;
  }
  
  return out;
}

/**
 * Get MACD signal (-1: bearish, 0: neutral, +1: bullish)
 * Based on MACD line crossing signal line
 */
export function macdSignal(macdData: MacdResult): number {
  const len = macdData.macd.length;
  if (len < 2) return 0;
  
  const currentMacd = macdData.macd[len - 1];
  const currentSignal = macdData.signal[len - 1];
  const prevMacd = macdData.macd[len - 2];
  const prevSignal = macdData.signal[len - 2];
  
  if (currentMacd === undefined || currentSignal === undefined) return 0;
  if (prevMacd === undefined || prevSignal === undefined) return 0;
  
  // Bullish crossover: MACD crosses above signal
  if (prevMacd <= prevSignal && currentMacd > currentSignal) return 1;
  
  // Bearish crossover: MACD crosses below signal
  if (prevMacd >= prevSignal && currentMacd < currentSignal) return -1;
  
  // No crossover, check current position
  if (currentMacd > currentSignal) return 1;
  if (currentMacd < currentSignal) return -1;
  
  return 0;
}
