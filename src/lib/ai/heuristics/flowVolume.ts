/**
 * Flow & Volume Heuristics
 * Pure functions for computing volume metrics and flow analysis
 * 
 * Beta v0.9: Core heuristics for Advanced Insight L2 (Flow)
 */

import type {
  FlowVolumeSnapshot,
  OhlcCandle,
} from '@/types/ai';

/**
 * Compute 24h volume snapshot with delta analysis
 * 
 * @param candles - OHLC candles with volume
 * @param volume24hUsd - Total 24h volume in USD (from external API)
 * @param previousVolume24hUsd - Previous 24h volume for delta calculation
 * @param source - Data source identifier
 * @returns Flow/volume snapshot
 */
export function computeFlowVolumeSnapshot(
  candles: OhlcCandle[],
  volume24hUsd?: number,
  previousVolume24hUsd?: number,
  source: string = 'DexScreener'
): FlowVolumeSnapshot {
  // Calculate delta if both current and previous are available
  let deltaPct: number | undefined;
  if (volume24hUsd && previousVolume24hUsd && previousVolume24hUsd > 0) {
    deltaPct = ((volume24hUsd - previousVolume24hUsd) / previousVolume24hUsd) * 100;
  }

  // If no external volume provided, sum from candles
  const computedVolume = volume24hUsd || sumVolumeFromCandles(candles);

  return {
    vol_24h_usd: computedVolume,
    vol_24h_delta_pct: deltaPct,
    source,
  };
}

/**
 * Sum volume from candle data
 * 
 * @param candles - OHLC candles with volume
 * @returns Total volume (raw units, not USD)
 */
function sumVolumeFromCandles(candles: OhlcCandle[]): number {
  return candles.reduce((sum, candle) => sum + (candle.v || 0), 0);
}

/**
 * Analyze volume profile to detect accumulation/distribution
 * 
 * Returns qualitative assessment:
 * - 'accumulation': Volume increasing on up moves
 * - 'distribution': Volume increasing on down moves
 * - 'neutral': No clear pattern
 * 
 * @param candles - OHLC candles with volume
 * @returns Volume profile assessment
 */
export function analyzeVolumeProfile(
  candles: OhlcCandle[]
): 'accumulation' | 'distribution' | 'neutral' {
  if (candles.length < 5) {
    return 'neutral';
  }

  let upVolumeSum = 0;
  let downVolumeSum = 0;

  for (let i = 1; i < candles.length; i++) {
    const prev = candles[i - 1];
    const curr = candles[i];
    const volume = curr.v || 0;

    if (curr.c > prev.c) {
      upVolumeSum += volume;
    } else if (curr.c < prev.c) {
      downVolumeSum += volume;
    }
  }

  const totalVolume = upVolumeSum + downVolumeSum;
  if (totalVolume === 0) return 'neutral';

  const upRatio = upVolumeSum / totalVolume;

  if (upRatio > 0.6) return 'accumulation';
  if (upRatio < 0.4) return 'distribution';
  return 'neutral';
}

/**
 * Detect volume spikes (> 2x average)
 * 
 * @param candles - OHLC candles with volume
 * @param threshold - Spike threshold multiplier (default: 2.0)
 * @returns Array of spike indices
 */
export function detectVolumeSpikes(
  candles: OhlcCandle[],
  threshold: number = 2.0
): number[] {
  if (candles.length < 10) return [];

  const volumes = candles.map(c => c.v || 0);
  const avgVolume = volumes.reduce((sum, v) => sum + v, 0) / volumes.length;

  const spikes: number[] = [];
  volumes.forEach((vol, idx) => {
    if (vol > avgVolume * threshold) {
      spikes.push(idx);
    }
  });

  return spikes;
}
