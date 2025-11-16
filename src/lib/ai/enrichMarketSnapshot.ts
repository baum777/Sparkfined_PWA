/**
 * Market Snapshot Enrichment
 * Runs heuristics to populate MarketSnapshotPayload with pre-analysis
 * 
 * Beta v0.9: Central orchestrator for heuristic pre-analysis
 */

import type {
  MarketSnapshotPayload,
  OhlcCandle,
  MarketMeta,
  RangeStructure,
  KeyLevel,
  PriceZone,
  BiasReading,
  FlowVolumeSnapshot,
} from '@/types/ai';

import {
  computeRangeStructure,
  computeKeyLevels,
  computePriceZones,
  computeBias,
  computeFlowVolumeSnapshot,
  generatePlaybookEntries,
} from './heuristics';

/**
 * Options for enriching market snapshot
 */
export interface EnrichSnapshotOptions {
  /** Skip heuristic computation (use existing data) */
  skipHeuristics?: boolean;
  
  /** Previous 24h volume for delta calculation */
  previousVolume24hUsd?: number;
  
  /** Maximum number of key levels to compute */
  maxKeyLevels?: number;
}

/**
 * Enrich a market snapshot with heuristic pre-analysis
 * 
 * Takes raw market data and populates all heuristic fields:
 * - range_structure (L1)
 * - key_levels (L1)
 * - zones (L3)
 * - bias (L1)
 * - flow_volume (L2)
 * 
 * @param snapshot - Base market snapshot (meta + candles)
 * @param options - Enrichment options
 * @returns Enriched snapshot with all heuristics populated
 */
export function enrichMarketSnapshot(
  snapshot: Partial<MarketSnapshotPayload>,
  options: EnrichSnapshotOptions = {}
): MarketSnapshotPayload {
  const {
    skipHeuristics = false,
    previousVolume24hUsd,
    maxKeyLevels = 5,
  } = options;

  // Validate required fields
  if (!snapshot.meta) {
    throw new Error('MarketSnapshotPayload requires meta field');
  }
  
  if (!snapshot.candles || snapshot.candles.length === 0) {
    throw new Error('MarketSnapshotPayload requires non-empty candles array');
  }

  const candles = snapshot.candles;
  const meta = snapshot.meta;

  // If skipHeuristics, return as-is with defaults
  if (skipHeuristics) {
    return {
      meta,
      candles,
      indicators: snapshot.indicators,
      liquidity_usd: snapshot.liquidity_usd,
      market_cap_usd: snapshot.market_cap_usd,
      volume_24h_usd: snapshot.volume_24h_usd,
      range_structure: snapshot.range_structure,
      key_levels: snapshot.key_levels,
      zones: snapshot.zones,
      bias: snapshot.bias,
      flow_volume: snapshot.flow_volume,
      macro_tags: snapshot.macro_tags,
      indicator_status: snapshot.indicator_status,
      heuristics_source: snapshot.heuristics_source || 'local_engine',
    };
  }

  // Run heuristics pipeline
  
  // L1: Range structure
  const rangeStructure: RangeStructure = snapshot.range_structure || 
    computeRangeStructure(candles, 24);

  // L1: Key levels
  const keyLevels: KeyLevel[] = snapshot.key_levels || 
    computeKeyLevels(candles, rangeStructure, maxKeyLevels);

  // L3: Price zones (tactical)
  const zones: PriceZone[] = snapshot.zones || 
    computePriceZones(keyLevels, rangeStructure);

  // L1: Bias
  const bias: BiasReading = snapshot.bias || 
    computeBias(candles, rangeStructure);

  // L2: Flow/volume
  const flowVolume: FlowVolumeSnapshot = snapshot.flow_volume || 
    computeFlowVolumeSnapshot(
      candles,
      snapshot.volume_24h_usd,
      previousVolume24hUsd,
      meta.source
    );

  // Return enriched snapshot
  return {
    meta,
    candles,
    indicators: snapshot.indicators,
    liquidity_usd: snapshot.liquidity_usd,
    market_cap_usd: snapshot.market_cap_usd,
    volume_24h_usd: snapshot.volume_24h_usd,
    
    // Heuristic pre-analysis
    range_structure: rangeStructure,
    key_levels: keyLevels,
    zones: zones,
    bias: bias,
    flow_volume: flowVolume,
    macro_tags: snapshot.macro_tags || [],
    indicator_status: snapshot.indicator_status || [],
    
    heuristics_source: 'local_engine',
  };
}

/**
 * Generate playbook entries from enriched snapshot
 * 
 * Separate function to allow AI augmentation later
 * 
 * @param snapshot - Enriched market snapshot
 * @returns Array of playbook entries
 */
export function generatePlaybookFromSnapshot(
  snapshot: MarketSnapshotPayload
): string[] {
  if (!snapshot.range_structure || !snapshot.bias) {
    return [];
  }

  const lastCandle = snapshot.candles[snapshot.candles.length - 1];
  const currentPrice = lastCandle
    ? lastCandle.c
    : snapshot.range_structure.mid;

  return generatePlaybookEntries({
    keyLevels: snapshot.key_levels || [],
    zones: snapshot.zones || [],
    bias: snapshot.bias,
    range: snapshot.range_structure,
    currentPrice,
  });
}
