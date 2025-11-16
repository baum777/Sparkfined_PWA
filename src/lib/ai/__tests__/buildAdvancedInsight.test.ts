/**
 * Unit Tests for Advanced Insight Builder
 * Beta v0.9: Pure, deterministic, strictly typed
 */

import { describe, test, expect } from 'vitest';
import {
  buildAdvancedInsightFromSnapshot,
  type BuildAdvancedInsightOptions,
} from '../buildAdvancedInsight';
import type {
  MarketSnapshotPayload,
  OhlcCandle,
  MarketMeta,
  RangeStructure,
  KeyLevel,
  BiasReading,
  FlowVolumeSnapshot,
} from '@/types/ai';

/**
 * Helper: Create minimal MarketSnapshotPayload for testing
 */
function createTestSnapshot(overrides?: Partial<MarketSnapshotPayload>): MarketSnapshotPayload {
  const meta: MarketMeta = {
    symbol: 'SOL/USDT',
    ticker: 'SOL',
    timeframe: '15m',
    source: 'Test',
    timestamp: '2025-11-15T00:00:00Z',
  };

  const candles: OhlcCandle[] = [
    { t: 1000, o: 40, h: 45, l: 38, c: 42, v: 1000 },
    { t: 2000, o: 42, h: 46, l: 40, c: 44, v: 1200 },
    { t: 3000, o: 44, h: 48, l: 42, c: 46, v: 1100 },
  ];

  return {
    meta,
    candles,
    volume_24h_usd: 1000000,
    heuristics_source: 'local_engine',
    ...overrides,
  };
}

describe('buildAdvancedInsightFromSnapshot', () => {
  test('should build card with fallback range when range_structure is missing', () => {
    const snapshot = createTestSnapshot();
    const card = buildAdvancedInsightFromSnapshot(snapshot);

    expect(card.sections.market_structure.range.auto_value).toEqual({
      window_hours: 24,
      low: 38,
      high: 48,
      mid: 43,
    });
    expect(card.sections.market_structure.range.is_overridden).toBe(false);
  });

  test('should use provided range_structure when available', () => {
    const providedRange: RangeStructure = {
      window_hours: 24,
      low: 35,
      high: 50,
      mid: 42.5,
    };
    
    const snapshot = createTestSnapshot({ range_structure: providedRange });
    const card = buildAdvancedInsightFromSnapshot(snapshot);

    expect(card.sections.market_structure.range.auto_value).toEqual(providedRange);
    expect(card.sections.market_structure.range.is_overridden).toBe(false);
  });

  test('should initialize all is_overridden to false', () => {
    const snapshot = createTestSnapshot();
    const card = buildAdvancedInsightFromSnapshot(snapshot);

    expect(card.sections.market_structure.range.is_overridden).toBe(false);
    expect(card.sections.market_structure.key_levels.is_overridden).toBe(false);
    expect(card.sections.market_structure.zones.is_overridden).toBe(false);
    expect(card.sections.market_structure.bias.is_overridden).toBe(false);
    expect(card.sections.flow_volume.flow.is_overridden).toBe(false);
    expect(card.sections.playbook.entries.is_overridden).toBe(false);
    expect(card.sections.macro.tags.is_overridden).toBe(false);
  });

  test('should build bullish bias when price is above midrange', () => {
    const candles: OhlcCandle[] = [
      { t: 1000, o: 40, h: 42, l: 38, c: 41, v: 1000 },
      { t: 2000, o: 41, h: 45, l: 39, c: 44, v: 1200 },
    ];

    const snapshot = createTestSnapshot({ candles });
    const card = buildAdvancedInsightFromSnapshot(snapshot);

    const bias = card.sections.market_structure.bias.auto_value;
    expect(bias.bias).toBe('bullish');
    expect(bias.above_midrange).toBe(true);
  });

  test('should build bearish bias when price is below midrange', () => {
    const candles: OhlcCandle[] = [
      { t: 1000, o: 40, h: 45, l: 38, c: 43, v: 1000 },
      { t: 2000, o: 43, h: 44, l: 36, c: 38, v: 1200 },
    ];

    const snapshot = createTestSnapshot({ candles });
    const card = buildAdvancedInsightFromSnapshot(snapshot);

    const bias = card.sections.market_structure.bias.auto_value;
    expect(bias.bias).toBe('bearish');
    expect(bias.above_midrange).toBe(false);
  });

  test('should include playbook entries when provided', () => {
    const snapshot = createTestSnapshot();
    const playbookEntries = [
      'If price breaks $50 → target $55',
      'Stop loss below $45',
    ];

    const card = buildAdvancedInsightFromSnapshot(snapshot, { playbookEntries });

    expect(card.sections.playbook.entries.auto_value).toEqual(playbookEntries);
    expect(card.sections.playbook.entries.is_overridden).toBe(false);
  });

  test('should keep macro empty when includeMacro is false (default)', () => {
    const snapshot = createTestSnapshot({ macro_tags: [
      { label: 'Test Tag', category: 'macro_level' },
    ]});

    const card = buildAdvancedInsightFromSnapshot(snapshot);

    expect(card.sections.macro.tags.auto_value).toEqual([]);
  });

  test('should include macro tags when includeMacro is true', () => {
    const macroTags = [
      { label: '42k', category: 'macro_level' as const },
      { label: 'Weekly Support', category: 'narrative' as const },
    ];
    
    const snapshot = createTestSnapshot({ macro_tags: macroTags });
    const card = buildAdvancedInsightFromSnapshot(snapshot, { includeMacro: true });

    expect(card.sections.macro.tags.auto_value).toEqual(macroTags);
  });

  test('should use provided key_levels when available', () => {
    const keyLevels: KeyLevel[] = [
      { price: 45, type: ['resistance'], label: 'R1', strength: 'strong' },
      { price: 38, type: ['support'], label: 'S1', strength: 'medium' },
    ];

    const snapshot = createTestSnapshot({ key_levels: keyLevels });
    const card = buildAdvancedInsightFromSnapshot(snapshot);

    expect(card.sections.market_structure.key_levels.auto_value).toEqual(keyLevels);
  });

  test('should handle empty candles gracefully', () => {
    const snapshot = createTestSnapshot({ candles: [] });
    const card = buildAdvancedInsightFromSnapshot(snapshot);

    const range = card.sections.market_structure.range.auto_value;
    expect(range.low).toBe(0);
    expect(range.high).toBe(0);
    expect(range.mid).toBe(0);

    const bias = card.sections.market_structure.bias.auto_value;
    expect(bias.bias).toBe('neutral');
    expect(bias.reason).toContain('No candle data');
  });

  test('should be deterministic (same input → same output)', () => {
    const snapshot = createTestSnapshot();
    const options: BuildAdvancedInsightOptions = {
      playbookEntries: ['Entry 1', 'Entry 2'],
      includeMacro: false,
    };

    const card1 = buildAdvancedInsightFromSnapshot(snapshot, options);
    const card2 = buildAdvancedInsightFromSnapshot(snapshot, options);

    expect(card1).toEqual(card2);
  });

  test('should preserve source_payload in result', () => {
    const snapshot = createTestSnapshot();
    const card = buildAdvancedInsightFromSnapshot(snapshot);

    expect(card.source_payload).toEqual(snapshot);
  });

  test('should set default active_layers', () => {
    const snapshot = createTestSnapshot();
    const card = buildAdvancedInsightFromSnapshot(snapshot);

    expect(card.active_layers).toEqual(['L1_STRUCTURE', 'L2_FLOW', 'L3_TACTICAL']);
  });

  test('should use custom active_layers when provided', () => {
    const snapshot = createTestSnapshot();
    const customLayers = ['L1_STRUCTURE', 'L2_FLOW'] as const;
    const card = buildAdvancedInsightFromSnapshot(snapshot, {
      activeLayers: customLayers,
    });

    expect(card.active_layers).toEqual(customLayers);
  });

  test('should build flow_volume from snapshot data', () => {
    const snapshot = createTestSnapshot({
      volume_24h_usd: 1234567.89,
      flow_volume: {
        vol_24h_usd: 1234567.89,
        vol_24h_delta_pct: 15.5,
        source: 'DexScreener',
      },
    });

    const card = buildAdvancedInsightFromSnapshot(snapshot);

    expect(card.sections.flow_volume.flow.auto_value).toEqual({
      vol_24h_usd: 1234567.89,
      vol_24h_delta_pct: 15.5,
      source: 'DexScreener',
    });
  });

  test('should create fallback flow_volume when not provided', () => {
    const snapshot = createTestSnapshot({
      volume_24h_usd: 999999,
    });

    const card = buildAdvancedInsightFromSnapshot(snapshot);

    expect(card.sections.flow_volume.flow.auto_value).toEqual({
      vol_24h_usd: 999999,
      vol_24h_delta_pct: undefined,
      source: 'Test',
    });
  });
});
