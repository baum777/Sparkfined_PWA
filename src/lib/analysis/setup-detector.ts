/**
 * ICT/SMC Setup Detection Engine
 *
 * Detects trading setups:
 * - Fair Value Gap (FVG)
 * - Order Blocks
 * - Liquidity Sweeps
 * - Breaker Blocks
 * - BOS/CHOCH
 * - Premium/Discount Arrays
 */

import type {
  SetupDetectionResult,
  ICTSetupType,
  FVGDetails,
  OrderblockDetails,
  LiquidityDetails,
} from '@/types/wallet-tracking';
import type { OhlcPoint } from '@/types/journal';

// ============================================================================
// MAIN DETECTION FUNCTION
// ============================================================================

/**
 * Detect ICT/SMC setups around a specific timestamp
 *
 * @param tokenAddress - Token contract address
 * @param timestamp - Timestamp to analyze around (usually trade entry time)
 * @param timeframe - Chart timeframe to analyze (default: '5m')
 * @param lookback - Number of candles to look back (default: 50)
 */
export async function detectSetup(
  tokenAddress: string,
  timestamp: number,
  timeframe = '5m',
  lookback = 50,
): Promise<SetupDetectionResult> {
  try {
    // 1. Fetch OHLC data around timestamp
    const ohlcData = await fetchOhlcData(tokenAddress, timestamp, timeframe, lookback);

    if (!ohlcData || ohlcData.length < 3) {
      return {
        detected: false,
        setups: [],
        confidence: 0,
        context: 'Insufficient data for setup detection',
      };
    }

    // 2. Detect setups
    const detectedSetups: ICTSetupType[] = [];
    let context = '';
    let fvgDetails: FVGDetails | undefined;
    let orderblockDetails: OrderblockDetails | undefined;
    let liquidityDetails: LiquidityDetails | undefined;

    // FVG Detection
    const fvg = detectFVG(ohlcData);
    if (fvg) {
      detectedSetups.push('fvg');
      fvgDetails = fvg;
      context += `${fvg.type === 'bullish' ? 'Bullish' : 'Bearish'} FVG detected (${fvg.size.toFixed(2)}% gap). `;
    }

    // Order Block Detection
    const ob = detectOrderBlock(ohlcData);
    if (ob) {
      detectedSetups.push('orderblock');
      orderblockDetails = ob;
      context += `${ob.type === 'bullish' ? 'Bullish' : 'Bearish'} Order Block identified. `;
    }

    // Liquidity Sweep Detection
    const liq = detectLiquiditySweep(ohlcData);
    if (liq) {
      detectedSetups.push('liquidity-sweep');
      liquidityDetails = liq;
      context += `${liq.type === 'buy-side' ? 'Buy-side' : 'Sell-side'} liquidity sweep. `;
    }

    // BOS/CHOCH Detection
    const structure = detectStructureBreak(ohlcData);
    if (structure === 'bos') {
      detectedSetups.push('bos');
      context += 'Break of Structure (BOS) detected. ';
    } else if (structure === 'choch') {
      detectedSetups.push('choch');
      context += 'Change of Character (CHOCH) detected. ';
    }

    // Calculate confidence
    const confidence = calculateConfidence(detectedSetups, ohlcData);

    return {
      detected: detectedSetups.length > 0,
      setups: detectedSetups,
      confidence,
      context: context.trim() || 'No clear setup detected',
      fvgDetails,
      orderblockDetails,
      liquidityDetails,
    };
  } catch (error) {
    console.error('[SetupDetector] Error detecting setup:', error);
    return {
      detected: false,
      setups: [],
      confidence: 0,
      context: 'Error during setup detection',
    };
  }
}

// ============================================================================
// FVG DETECTION
// ============================================================================

/**
 * Detect Fair Value Gap (FVG)
 *
 * FVG = 3-candle pattern where:
 * - Bullish FVG: Candle 3 low > Candle 1 high (gap between them)
 * - Bearish FVG: Candle 3 high < Candle 1 low
 */
function detectFVG(ohlc: OhlcPoint[]): FVGDetails | null {
  if (ohlc.length < 3) return null;

  // Check last 3 candles
  for (let i = ohlc.length - 1; i >= 2; i--) {
    const candle1 = ohlc[i - 2];
    const candle2 = ohlc[i - 1];
    const candle3 = ohlc[i];

    // Bullish FVG
    if (candle3.l > candle1.h) {
      const gapSize = candle3.l - candle1.h;
      const gapPercent = (gapSize / candle1.h) * 100;

      return {
        type: 'bullish',
        startPrice: candle1.h,
        endPrice: candle3.l,
        size: gapPercent,
        timeframe: '5m', // TODO: Pass from parent
      };
    }

    // Bearish FVG
    if (candle3.h < candle1.l) {
      const gapSize = candle1.l - candle3.h;
      const gapPercent = (gapSize / candle1.l) * 100;

      return {
        type: 'bearish',
        startPrice: candle3.h,
        endPrice: candle1.l,
        size: gapPercent,
        timeframe: '5m',
      };
    }
  }

  return null;
}

// ============================================================================
// ORDER BLOCK DETECTION
// ============================================================================

/**
 * Detect Order Block
 *
 * Order Block = Last bearish/bullish candle before strong move
 * - Bullish OB: Last red candle before strong upward move
 * - Bearish OB: Last green candle before strong downward move
 */
function detectOrderBlock(ohlc: OhlcPoint[]): OrderblockDetails | null {
  if (ohlc.length < 5) return null;

  // Look for strong moves (> 3% in 1-2 candles)
  for (let i = ohlc.length - 1; i >= 3; i--) {
    const currentCandle = ohlc[i];
    const prevCandle = ohlc[i - 1];
    const prev2Candle = ohlc[i - 2];

    const movePercent = Math.abs((currentCandle.c - prev2Candle.c) / prev2Candle.c) * 100;

    if (movePercent < 3) continue;

    // Bullish move -> look for bearish OB
    if (currentCandle.c > prev2Candle.c) {
      // Find last bearish candle before move
      for (let j = i - 1; j >= 0; j--) {
        const candle = ohlc[j];
        if (candle.c < candle.o) {
          return {
            type: 'bullish',
            highPrice: candle.h,
            lowPrice: candle.l,
            volume: candle.v || 0,
            timeframe: '5m',
            mitigated: false,
          };
        }
      }
    }

    // Bearish move -> look for bullish OB
    if (currentCandle.c < prev2Candle.c) {
      for (let j = i - 1; j >= 0; j--) {
        const candle = ohlc[j];
        if (candle.c > candle.o) {
          return {
            type: 'bearish',
            highPrice: candle.h,
            lowPrice: candle.l,
            volume: candle.v || 0,
            timeframe: '5m',
            mitigated: false,
          };
        }
      }
    }
  }

  return null;
}

// ============================================================================
// LIQUIDITY SWEEP DETECTION
// ============================================================================

/**
 * Detect Liquidity Sweep
 *
 * Liquidity Sweep = Price breaks a key level (high/low) and quickly reverses
 * - Buy-side sweep: Breaks recent high, then reverses down
 * - Sell-side sweep: Breaks recent low, then reverses up
 */
function detectLiquiditySweep(ohlc: OhlcPoint[]): LiquidityDetails | null {
  if (ohlc.length < 10) return null;

  const recent = ohlc.slice(-10);
  const lastCandle = recent[recent.length - 1];

  // Find recent high/low (excluding last candle)
  const recentHigh = Math.max(...recent.slice(0, -1).map((c) => c.h));
  const recentLow = Math.min(...recent.slice(0, -1).map((c) => c.l));

  // Buy-side sweep (broke high, now reversing down)
  if (lastCandle.h > recentHigh && lastCandle.c < lastCandle.o) {
    return {
      type: 'buy-side',
      level: recentHigh,
      swept: true,
      sweptAt: lastCandle.t,
    };
  }

  // Sell-side sweep (broke low, now reversing up)
  if (lastCandle.l < recentLow && lastCandle.c > lastCandle.o) {
    return {
      type: 'sell-side',
      level: recentLow,
      swept: true,
      sweptAt: lastCandle.t,
    };
  }

  return null;
}

// ============================================================================
// STRUCTURE BREAK (BOS/CHOCH)
// ============================================================================

/**
 * Detect Break of Structure (BOS) or Change of Character (CHOCH)
 *
 * BOS = Break of recent high/low in direction of trend
 * CHOCH = Break of recent high/low against trend
 */
function detectStructureBreak(ohlc: OhlcPoint[]): 'bos' | 'choch' | null {
  if (ohlc.length < 20) return null;

  // Simple trend detection (20-candle SMA)
  const closes = ohlc.map((c) => c.c);
  const sma20 = closes.slice(-20).reduce((sum, c) => sum + c, 0) / 20;
  const currentPrice = ohlc[ohlc.length - 1].c;

  const isUptrend = currentPrice > sma20;

  // Recent swing high/low
  const recent = ohlc.slice(-20);
  const recentHigh = Math.max(...recent.slice(0, -1).map((c) => c.h));
  const recentLow = Math.min(...recent.slice(0, -1).map((c) => c.l));

  const lastCandle = ohlc[ohlc.length - 1];

  // Break of high
  if (lastCandle.h > recentHigh) {
    return isUptrend ? 'bos' : 'choch';
  }

  // Break of low
  if (lastCandle.l < recentLow) {
    return isUptrend ? 'choch' : 'bos';
  }

  return null;
}

// ============================================================================
// CONFIDENCE CALCULATION
// ============================================================================

/**
 * Calculate confidence score (0-1)
 *
 * Higher confidence if:
 * - Multiple setups detected (confluence)
 * - Strong price action
 * - High volume
 */
function calculateConfidence(setups: ICTSetupType[], ohlc: OhlcPoint[]): number {
  let confidence = 0;

  // Base confidence from setup count
  confidence += Math.min(setups.length * 0.25, 0.75);

  // Volume confirmation (if available)
  if (ohlc.length >= 2) {
    const lastCandle = ohlc[ohlc.length - 1];
    const prevCandle = ohlc[ohlc.length - 2];

    if (lastCandle.v && prevCandle.v && lastCandle.v > prevCandle.v * 1.5) {
      confidence += 0.15;
    }
  }

  // Price action strength
  if (ohlc.length >= 1) {
    const lastCandle = ohlc[ohlc.length - 1];
    const bodyPercent = Math.abs(lastCandle.c - lastCandle.o) / lastCandle.o * 100;

    if (bodyPercent > 2) {
      confidence += 0.10;
    }
  }

  return Math.min(confidence, 1.0);
}

// ============================================================================
// OHLC DATA FETCHING
// ============================================================================

/**
 * Fetch OHLC data for setup detection
 *
 * TODO: Implement actual data fetching via:
 * - Birdeye API
 * - DexScreener API
 * - Your own OHLC endpoint
 */
async function fetchOhlcData(
  tokenAddress: string,
  timestamp: number,
  timeframe: string,
  lookback: number,
): Promise<OhlcPoint[] | null> {
  try {
    console.warn('[SetupDetector] fetchOhlcData not yet implemented, returning mock data');

    // TODO: Implement actual OHLC fetching
    // Example API call:
    // const response = await fetch(`/api/ohlc?address=${tokenAddress}&timeframe=${timeframe}&limit=${lookback}&end=${timestamp}`);
    // const data = await response.json();
    // return data.ohlc;

    return null;
  } catch (error) {
    console.error('[SetupDetector] Error fetching OHLC data:', error);
    return null;
  }
}
