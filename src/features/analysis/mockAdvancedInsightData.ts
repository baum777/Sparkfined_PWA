/**
 * Mock Advanced Insight Data Generator
 * For testing and development of Advanced Insight UI
 */

import type {
  AdvancedInsightCard,
  RangeStructure,
  KeyLevel,
  PriceZone,
  BiasReading,
  FlowVolumeSnapshot,
  MacroTag,
  MarketSnapshotPayload,
  MarketMeta,
} from '@/types/ai';

/**
 * Generate mock Advanced Insight data for testing
 */
export function generateMockAdvancedInsight(
  ticker: string = 'SOL',
  currentPrice: number = 45.67
): AdvancedInsightCard {
  const range: RangeStructure = {
    window_hours: 24,
    low: currentPrice * 0.92,
    high: currentPrice * 1.08,
    mid: currentPrice,
  };

  const keyLevels: KeyLevel[] = [
    {
      price: currentPrice * 0.95,
      type: ['support'],
      label: '24h Support',
      strength: 'medium',
    },
    {
      price: currentPrice * 1.05,
      type: ['resistance'],
      label: '24h Resistance',
      strength: 'strong',
    },
    {
      price: currentPrice * 1.0,
      type: ['round_number'],
      label: 'Round Number',
      strength: 'weak',
    },
  ];

  const zones: PriceZone[] = [
    {
      label: 'support',
      from: currentPrice * 0.93,
      to: currentPrice * 0.97,
      source_level: currentPrice * 0.95,
      offset_type: 'percent',
      offset_value: 0.02,
      is_default: true,
    },
    {
      label: 'target_tp1',
      from: currentPrice * 1.03,
      to: currentPrice * 1.07,
      source_level: currentPrice * 1.05,
      offset_type: 'percent',
      offset_value: 0.02,
      is_default: true,
    },
  ];

  const bias: BiasReading = {
    bias: 'bullish',
    reason: 'Price trading above 24h midrange with higher lows forming',
    above_midrange: true,
    higher_lows: true,
    lower_highs: false,
  };

  const flow: FlowVolumeSnapshot = {
    vol_24h_usd: 1234567890,
    vol_24h_delta_pct: 15.4,
    source: 'DexScreener',
  };

  const playbookEntries: string[] = [
    `If price breaks above $${(currentPrice * 1.05).toFixed(2)} with volume → target $${(currentPrice * 1.1).toFixed(2)}`,
    `If price rejects $${(currentPrice * 1.05).toFixed(2)} → watch for retrace to $${(currentPrice * 0.98).toFixed(2)}`,
    `Below $${(currentPrice * 0.95).toFixed(2)} → bias shifts bearish, consider exit`,
  ];

  const macroTags: MacroTag[] = [
    { label: '45k', category: 'macro_level' },
    { label: 'Weekly Support', category: 'narrative' },
  ];

  const mockPayload: MarketSnapshotPayload = {
    meta: {
      symbol: `${ticker}/USDT`,
      ticker: ticker,
      timeframe: '15m',
      exchange: 'DexScreener',
      source: 'Mock Data',
      timestamp: new Date().toISOString(),
    } as MarketMeta,
    candles: [],
    heuristics_source: 'local_engine',
  };

  return {
    sections: {
      market_structure: {
        range: {
          auto_value: range,
          is_overridden: false,
        },
        key_levels: {
          auto_value: keyLevels,
          is_overridden: false,
        },
        zones: {
          auto_value: zones,
          is_overridden: false,
        },
        bias: {
          auto_value: bias,
          is_overridden: false,
        },
      },
      flow_volume: {
        flow: {
          auto_value: flow,
          is_overridden: false,
        },
      },
      playbook: {
        entries: {
          auto_value: playbookEntries,
          is_overridden: false,
        },
      },
      macro: {
        tags: {
          auto_value: macroTags,
          is_overridden: false,
        },
      },
    },
    source_payload: mockPayload,
    active_layers: ['L1_STRUCTURE', 'L2_FLOW', 'L3_TACTICAL'],
  };
}

