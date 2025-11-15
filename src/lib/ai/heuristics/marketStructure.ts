/**
 * Market Structure Heuristics
 * Pure functions for computing range, key levels, price zones, and bias
 * 
 * Beta v0.9: Core heuristics for Advanced Insight L1 (Structure)
 */

import type {
  RangeStructure,
  KeyLevel,
  PriceZone,
  BiasReading,
  OhlcCandle,
  LevelType,
} from '@/types/ai';

/**
 * Compute 24h range structure from candles
 * 
 * @param candles - OHLC candles
 * @param windowHours - Time window in hours (default: 24)
 * @returns Range structure with high, low, mid
 */
export function computeRangeStructure(
  candles: OhlcCandle[],
  windowHours: number = 24
): RangeStructure {
  if (candles.length === 0) {
    return {
      window_hours: windowHours,
      low: 0,
      high: 0,
      mid: 0,
    };
  }

  const high = Math.max(...candles.map(c => c.h));
  const low = Math.min(...candles.map(c => c.l));
  const mid = (high + low) / 2;

  return {
    window_hours: windowHours,
    low,
    high,
    mid,
  };
}

/**
 * Identify key support/resistance levels from candles
 * 
 * Algorithm:
 * 1. Find swing highs/lows (local extrema)
 * 2. Cluster nearby levels (within 0.5% tolerance)
 * 3. Rank by touch count and recency
 * 4. Add round number levels if relevant
 * 
 * @param candles - OHLC candles
 * @param range - Pre-computed range structure
 * @param maxLevels - Maximum number of levels to return (default: 5)
 * @returns Array of key levels
 */
export function computeKeyLevels(
  candles: OhlcCandle[],
  range: RangeStructure,
  maxLevels: number = 5
): KeyLevel[] {
  if (candles.length < 3) {
    return [];
  }

  const levels: KeyLevel[] = [];
  const tolerance = range.high * 0.005; // 0.5% clustering tolerance

  // 1. Find swing highs and lows
  const swingHighs = findSwingHighs(candles);
  const swingLows = findSwingLows(candles);

  // 2. Process swing lows as support
  for (const low of swingLows) {
    const existingLevel = levels.find(l => Math.abs(l.price - low.price) < tolerance);
    if (existingLevel) {
      // Strengthen existing level
      if (!existingLevel.type.includes('support')) {
        existingLevel.type.push('support');
      }
    } else {
      levels.push({
        price: low.price,
        type: ['support'],
        label: `Support ~${low.price.toFixed(2)}`,
        strength: low.touches > 2 ? 'strong' : low.touches > 1 ? 'medium' : 'weak',
      });
    }
  }

  // 3. Process swing highs as resistance
  for (const high of swingHighs) {
    const existingLevel = levels.find(l => Math.abs(l.price - high.price) < tolerance);
    if (existingLevel) {
      // Strengthen existing level
      if (!existingLevel.type.includes('resistance')) {
        existingLevel.type.push('resistance');
      }
    } else {
      levels.push({
        price: high.price,
        type: ['resistance'],
        label: `Resistance ~${high.price.toFixed(2)}`,
        strength: high.touches > 2 ? 'strong' : high.touches > 1 ? 'medium' : 'weak',
      });
    }
  }

  // 4. Add round number levels if in range
  const roundLevels = findRoundNumbersInRange(range);
  for (const roundPrice of roundLevels) {
    const existingLevel = levels.find(l => Math.abs(l.price - roundPrice) < tolerance);
    if (existingLevel) {
      if (!existingLevel.type.includes('round_number')) {
        existingLevel.type.push('round_number');
      }
    } else {
      levels.push({
        price: roundPrice,
        type: ['round_number'],
        label: `Round ${roundPrice}`,
        strength: 'weak',
      });
    }
  }

  // 5. Sort by strength and proximity to current price
  const lastClose = candles[candles.length - 1]?.c || range.mid;
  levels.sort((a, b) => {
    // Priority: strong > medium > weak
    const strengthScore = { strong: 3, medium: 2, weak: 1 };
    const scoreA = strengthScore[a.strength || 'weak'];
    const scoreB = strengthScore[b.strength || 'weak'];
    
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }
    
    // Secondary: proximity to current price
    return Math.abs(a.price - lastClose) - Math.abs(b.price - lastClose);
  });

  return levels.slice(0, maxLevels);
}

/**
 * Find swing highs in candle data
 */
function findSwingHighs(candles: OhlcCandle[]): Array<{ price: number; touches: number }> {
  const swings: Array<{ price: number; touches: number }> = [];
  
  for (let i = 1; i < candles.length - 1; i++) {
    const prev = candles[i - 1];
    const curr = candles[i];
    const next = candles[i + 1];
    
    // Swing high: current high > both neighbors
    if (curr.h > prev.h && curr.h > next.h) {
      swings.push({ price: curr.h, touches: 1 });
    }
  }
  
  return swings;
}

/**
 * Find swing lows in candle data
 */
function findSwingLows(candles: OhlcCandle[]): Array<{ price: number; touches: number }> {
  const swings: Array<{ price: number; touches: number }> = [];
  
  for (let i = 1; i < candles.length - 1; i++) {
    const prev = candles[i - 1];
    const curr = candles[i];
    const next = candles[i + 1];
    
    // Swing low: current low < both neighbors
    if (curr.l < prev.l && curr.l < next.l) {
      swings.push({ price: curr.l, touches: 1 });
    }
  }
  
  return swings;
}

/**
 * Find psychologically significant round numbers in range
 */
function findRoundNumbersInRange(range: RangeStructure): number[] {
  const roundNumbers: number[] = [];
  const { low, high } = range;
  
  // Determine magnitude (e.g., 42.5 → 10, 450 → 100, 4500 → 1000)
  const magnitude = Math.pow(10, Math.floor(Math.log10(high)));
  const step = magnitude / (high > 100 ? 2 : 10); // Finer steps for smaller prices
  
  let current = Math.floor(low / step) * step;
  while (current <= high) {
    if (current >= low && current <= high) {
      roundNumbers.push(current);
    }
    current += step;
  }
  
  return roundNumbers;
}

/**
 * Compute tactical price zones from key levels
 * 
 * Generates entry, stop loss, and target zones based on S/R levels
 * 
 * @param keyLevels - Pre-computed key levels
 * @param range - Pre-computed range structure
 * @returns Array of tactical price zones
 */
export function computePriceZones(
  keyLevels: KeyLevel[],
  range: RangeStructure
): PriceZone[] {
  const zones: PriceZone[] = [];
  const defaultOffset = 0.02; // 2% default offset

  // Find strongest support and resistance
  const supports = keyLevels.filter(l => l.type.includes('support'));
  const resistances = keyLevels.filter(l => l.type.includes('resistance'));
  
  // Add support zone (entry/reentry)
  if (supports.length > 0) {
    const strongestSupport = supports[0];
    zones.push({
      label: 'support',
      from: strongestSupport.price * (1 - defaultOffset),
      to: strongestSupport.price * (1 + defaultOffset),
      source_level: strongestSupport.price,
      offset_type: 'percent',
      offset_value: defaultOffset,
      is_default: true,
    });
    
    // Stop loss below support
    zones.push({
      label: 'stop_loss',
      from: strongestSupport.price * (1 - defaultOffset * 2),
      to: strongestSupport.price * (1 - defaultOffset),
      source_level: strongestSupport.price,
      offset_type: 'percent',
      offset_value: defaultOffset * 2,
      is_default: true,
    });
  }
  
  // Add resistance zones (targets)
  if (resistances.length > 0) {
    const firstResistance = resistances[0];
    zones.push({
      label: 'target_tp1',
      from: firstResistance.price * (1 - defaultOffset),
      to: firstResistance.price * (1 + defaultOffset),
      source_level: firstResistance.price,
      offset_type: 'percent',
      offset_value: defaultOffset,
      is_default: true,
    });
    
    if (resistances.length > 1) {
      const secondResistance = resistances[1];
      zones.push({
        label: 'target_tp2',
        from: secondResistance.price * (1 - defaultOffset),
        to: secondResistance.price * (1 + defaultOffset),
        source_level: secondResistance.price,
        offset_type: 'percent',
        offset_value: defaultOffset,
        is_default: true,
      });
    }
  }
  
  // Add reentry zone (mid-range if available)
  if (zones.length > 0) {
    zones.push({
      label: 'reentry',
      from: range.mid * (1 - defaultOffset / 2),
      to: range.mid * (1 + defaultOffset / 2),
      source_level: range.mid,
      offset_type: 'percent',
      offset_value: defaultOffset / 2,
      is_default: true,
    });
  }
  
  return zones;
}

/**
 * Compute market bias from price action and structure
 * 
 * @param candles - OHLC candles
 * @param range - Pre-computed range structure
 * @returns Bias reading with reason
 */
export function computeBias(
  candles: OhlcCandle[],
  range: RangeStructure
): BiasReading {
  if (candles.length < 3) {
    return {
      bias: 'neutral',
      reason: 'Insufficient data for bias calculation',
      above_midrange: false,
      higher_lows: false,
      lower_highs: false,
    };
  }

  const lastClose = candles[candles.length - 1]?.c || 0;
  const aboveMid = lastClose > range.mid;
  
  // Check for higher lows pattern (bullish)
  const recentLows = candles.slice(-5).map(c => c.l);
  const higherLows = isAscending(recentLows);
  
  // Check for lower highs pattern (bearish)
  const recentHighs = candles.slice(-5).map(c => c.h);
  const lowerHighs = isDescending(recentHighs);
  
  // Determine bias
  let bias: BiasReading['bias'];
  let reason: string;
  
  const percentFromMid = ((lastClose - range.mid) / range.mid) * 100;
  
  if (higherLows && aboveMid) {
    bias = 'bullish';
    reason = `Higher lows forming, price above midrange (+${percentFromMid.toFixed(1)}%)`;
  } else if (lowerHighs && !aboveMid) {
    bias = 'bearish';
    reason = `Lower highs forming, price below midrange (${percentFromMid.toFixed(1)}%)`;
  } else if (aboveMid && percentFromMid > 2) {
    bias = 'bullish';
    reason = `Price well above midrange (+${percentFromMid.toFixed(1)}%)`;
  } else if (!aboveMid && percentFromMid < -2) {
    bias = 'bearish';
    reason = `Price well below midrange (${percentFromMid.toFixed(1)}%)`;
  } else {
    bias = 'neutral';
    reason = `Price near midrange (${percentFromMid.toFixed(1)}%), no clear pattern`;
  }
  
  return {
    bias,
    reason,
    above_midrange: aboveMid,
    higher_lows: higherLows,
    lower_highs: lowerHighs,
  };
}

/**
 * Check if array values are generally ascending
 */
function isAscending(values: number[]): boolean {
  if (values.length < 3) return false;
  
  let upCount = 0;
  for (let i = 1; i < values.length; i++) {
    if (values[i] > values[i - 1]) upCount++;
  }
  
  return upCount >= values.length * 0.6; // 60% threshold
}

/**
 * Check if array values are generally descending
 */
function isDescending(values: number[]): boolean {
  if (values.length < 3) return false;
  
  let downCount = 0;
  for (let i = 1; i < values.length; i++) {
    if (values[i] < values[i - 1]) downCount++;
  }
  
  return downCount >= values.length * 0.6; // 60% threshold
}
