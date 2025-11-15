/**
 * Advanced Insight Builder
 * Pure, deterministic function: MarketSnapshotPayload → AdvancedInsightCard
 * 
 * Beta v0.9: Strictly typed, no `any`, simple heuristic playbook
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
  EditableField,
  AnalysisLayerId,
} from '@/types/ai';

/**
 * Build options for Advanced Insight generation
 */
export interface BuildAdvancedInsightOptions {
  /** Active analysis layers (default: L1, L2, L3) */
  readonly activeLayers?: ReadonlyArray<AnalysisLayerId>;
  
  /** Simple heuristic playbook entries (default: empty) */
  readonly playbookEntries?: ReadonlyArray<string>;
  
  /** Include macro section (default: false for Beta v0.9) */
  readonly includeMacro?: boolean;
}

/**
 * Build an AdvancedInsightCard from a MarketSnapshotPayload
 * 
 * Pure, deterministic function:
 * - No side effects
 * - Same input always produces same output
 * - Strictly typed (no `any`)
 * - Easy to unit test
 * 
 * @param snapshot - Market snapshot with pre-computed heuristics
 * @param options - Build options (layers, playbook, macro)
 * @returns Complete AdvancedInsightCard ready for frontend ingestion
 */
export function buildAdvancedInsightFromSnapshot(
  snapshot: MarketSnapshotPayload,
  options: BuildAdvancedInsightOptions = {}
): AdvancedInsightCard {
  const {
    activeLayers = ['L1_STRUCTURE', 'L2_FLOW', 'L3_TACTICAL'],
    playbookEntries = [],
    includeMacro = false,
  } = options;

  // Build sections from snapshot data (deterministic)
  const sections: AdvancedInsightSections = {
    market_structure: {
      range: createEditableField(
        snapshot.range_structure ?? createFallbackRange(snapshot)
      ),
      key_levels: createEditableField(
        snapshot.key_levels ?? []
      ),
      zones: createEditableField(
        snapshot.zones ?? []
      ),
      bias: createEditableField(
        snapshot.bias ?? createFallbackBias(snapshot)
      ),
    },
    flow_volume: {
      flow: createEditableField(
        snapshot.flow_volume ?? createFallbackFlowVolume(snapshot)
      ),
    },
    playbook: {
      entries: createEditableField([...playbookEntries]),
    },
    macro: {
      tags: createEditableField(
        includeMacro ? (snapshot.macro_tags ?? []) : []
      ),
    },
  };

  return {
    sections,
    source_payload: snapshot,
    active_layers: [...activeLayers],
  };
}

/**
 * Create an EditableField with auto_value and is_overridden = false
 * 
 * Pure function - deterministic output
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
 * Deterministic: same candles → same range
 */
function createFallbackRange(snapshot: MarketSnapshotPayload): RangeStructure {
  const candles = snapshot.candles ?? [];
  
  if (candles.length === 0) {
    return {
      window_hours: 24,
      low: 0,
      high: 0,
      mid: 0,
    };
  }

  // Calculate 24h range from candles (deterministic)
  const highs = candles.map(c => c.h);
  const lows = candles.map(c => c.l);
  const high = Math.max(...highs);
  const low = Math.min(...lows);
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
 * Deterministic: same candles → same bias
 */
function createFallbackBias(snapshot: MarketSnapshotPayload): BiasReading {
  const candles = snapshot.candles ?? [];
  
  if (candles.length === 0) {
    return {
      bias: 'neutral',
      reason: 'No candle data available for bias calculation',
      above_midrange: false,
      higher_lows: false,
      lower_highs: false,
    };
  }

  // Simple bias: last close vs mid-range (deterministic)
  const lastCandle = candles[candles.length - 1];
  const lastClose = lastCandle?.c ?? 0;
  const highs = candles.map(c => c.h);
  const lows = candles.map(c => c.l);
  const high = Math.max(...highs);
  const low = Math.min(...lows);
  const mid = (high + low) / 2;
  
  const aboveMid = lastClose > mid;
  const deltaFromMid = mid !== 0 ? ((lastClose - mid) / mid) * 100 : 0;
  
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
  const higherLows = recent.length >= 3 && 
    recent[1].l > recent[0].l && 
    recent[2].l > recent[1].l;
  const lowerHighs = recent.length >= 3 && 
    recent[1].h < recent[0].h && 
    recent[2].h < recent[1].h;

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
 * Deterministic: same snapshot → same flow
 */
function createFallbackFlowVolume(snapshot: MarketSnapshotPayload): FlowVolumeSnapshot {
  return {
    vol_24h_usd: snapshot.volume_24h_usd,
    vol_24h_delta_pct: undefined,
    source: snapshot.meta.source ?? 'Unknown',
  };
}
