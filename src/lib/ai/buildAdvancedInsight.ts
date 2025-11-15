/**
 * Advanced Insight Builder
 * Pure function that transforms MarketSnapshotPayload → AdvancedInsightCard
 * 
 * Beta v0.9: Core builder for Advanced Insight feature
 * Maps heuristic pre-analysis and AI output into structured EditableField format
 */

import type {
  MarketSnapshotPayload,
  AdvancedInsightCard,
  AdvancedInsightSections,
  RangeStructure,
  KeyLevel,
  PriceZone,
  BiasReading,
  FlowVolumeSnapshot,
  MacroTag,
  FeatureAccessMeta,
  EditableField,
  AnalysisLayerId,
} from '@/types/ai';

/**
 * Build options for Advanced Insight generation
 */
export interface BuildAdvancedInsightOptions {
  /** Access meta for token-gating */
  access?: FeatureAccessMeta;
  
  /** Active analysis layers (L1-L5) */
  activeLayers?: AnalysisLayerId[];
  
  /** Playbook entries from AI or heuristics */
  playbookEntries?: string[];
}

/**
 * Build an AdvancedInsightCard from a MarketSnapshotPayload
 * 
 * This is a pure function that maps pre-computed heuristics from the snapshot
 * into the EditableField structure expected by the frontend store.
 * 
 * @param snapshot - Market snapshot with pre-computed heuristics
 * @param options - Build options (access, layers, playbook)
 * @returns Complete AdvancedInsightCard ready for frontend ingestion
 */
export function buildAdvancedInsightFromSnapshot(
  snapshot: MarketSnapshotPayload,
  options: BuildAdvancedInsightOptions = {}
): AdvancedInsightCard {
  const {
    access,
    activeLayers = ['L1_STRUCTURE', 'L2_FLOW', 'L3_TACTICAL'],
    playbookEntries = [],
  } = options;

  // Build sections from snapshot data
  const sections: AdvancedInsightSections = {
    market_structure: {
      range: createEditableField(
        snapshot.range_structure || createFallbackRange(snapshot)
      ),
      key_levels: createEditableField(
        snapshot.key_levels || []
      ),
      zones: createEditableField(
        snapshot.zones || []
      ),
      bias: createEditableField(
        snapshot.bias || createFallbackBias(snapshot)
      ),
    },
    flow_volume: {
      flow: createEditableField(
        snapshot.flow_volume || createFallbackFlowVolume(snapshot)
      ),
    },
    playbook: {
      entries: createEditableField(playbookEntries),
    },
    macro: {
      tags: createEditableField(
        snapshot.macro_tags || []
      ),
    },
  };

  return {
    sections,
    source_payload: snapshot,
    active_layers: activeLayers,
  };
}

/**
 * Create an EditableField with auto_value and no override
 */
function createEditableField<T>(autoValue: T): EditableField<T> {
  return {
    auto_value: autoValue,
    user_value: undefined,
    is_overridden: false,
  };
}

/**
 * Fallback range structure from candles if not pre-computed
 */
function createFallbackRange(snapshot: MarketSnapshotPayload): RangeStructure {
  const candles = snapshot.candles || [];
  
  if (candles.length === 0) {
    return {
      window_hours: 24,
      low: 0,
      high: 0,
      mid: 0,
    };
  }

  // Calculate 24h range from candles
  const high = Math.max(...candles.map(c => c.h));
  const low = Math.min(...candles.map(c => c.l));
  const mid = (high + low) / 2;

  return {
    window_hours: 24,
    low,
    high,
    mid,
  };
}

/**
 * Fallback bias reading from price position if not pre-computed
 */
function createFallbackBias(snapshot: MarketSnapshotPayload): BiasReading {
  const candles = snapshot.candles || [];
  
  if (candles.length === 0) {
    return {
      bias: 'neutral',
      reason: 'No candle data available for bias calculation',
      above_midrange: false,
      higher_lows: false,
      lower_highs: false,
    };
  }

  // Simple bias: last close vs mid-range
  const lastClose = candles[candles.length - 1]?.c || 0;
  const high = Math.max(...candles.map(c => c.h));
  const low = Math.min(...candles.map(c => c.l));
  const mid = (high + low) / 2;
  
  const aboveMid = lastClose > mid;
  const deltaFromMid = ((lastClose - mid) / mid) * 100;
  
  let bias: BiasReading['bias'];
  let reason: string;
  
  if (Math.abs(deltaFromMid) < 1) {
    bias = 'neutral';
    reason = `Price near midrange (${deltaFromMid.toFixed(2)}% from mid)`;
  } else if (aboveMid) {
    bias = 'bullish';
    reason = `Price above midrange (+${deltaFromMid.toFixed(2)}%)`;
  } else {
    bias = 'bearish';
    reason = `Price below midrange (${deltaFromMid.toFixed(2)}%)`;
  }

  // Simple higher lows / lower highs detection (last 3 candles)
  const recent = candles.slice(-3);
  const higherLows = recent.length >= 2 && 
    recent[1].l > recent[0].l && 
    recent[2]?.l > recent[1].l;
  const lowerHighs = recent.length >= 2 && 
    recent[1].h < recent[0].h && 
    recent[2]?.h < recent[1].h;

  return {
    bias,
    reason,
    above_midrange: aboveMid,
    higher_lows: higherLows,
    lower_highs: lowerHighs,
  };
}

/**
 * Fallback flow/volume snapshot if not pre-computed
 */
function createFallbackFlowVolume(snapshot: MarketSnapshotPayload): FlowVolumeSnapshot {
  return {
    vol_24h_usd: snapshot.volume_24h_usd,
    vol_24h_delta_pct: undefined,
    source: snapshot.meta.source || 'Unknown',
  };
}

/**
 * Generate default access meta for unlocked access
 */
export function createDefaultAccessMeta(isUnlocked: boolean = false): FeatureAccessMeta {
  return {
    feature: 'advanced_deep_dive',
    tier: isUnlocked ? 'basic' : 'advanced_locked',
    is_unlocked: isUnlocked,
    token_lock_id: isUnlocked ? undefined : 'pending-nft-check',
    reason: isUnlocked 
      ? undefined 
      : 'Beta: Advanced Insight requires NFT-based access. Manual approval available.',
  };
}
