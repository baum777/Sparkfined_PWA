/**
 * Chart domain types for Sparkfined PWA
 * Consolidates chart, replay, and OHLC concepts in a single type system.
 */

import type { UTCTimestamp } from 'lightweight-charts'

// ===== Timeframes =====
export type ChartTimeframe = '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1w';

export const TIMEFRAME_LABELS: Record<ChartTimeframe, string> = {
  '1m': '1 Minute',
  '5m': '5 Minutes',
  '15m': '15 Minutes',
  '1h': '1 Hour',
  '4h': '4 Hours',
  '1d': '1 Day',
  '1w': '1 Week',
};

export const TIMEFRAME_ORDER: ChartTimeframe[] = ['1m', '5m', '15m', '1h', '4h', '1d', '1w'];
export const DEFAULT_TIMEFRAME: ChartTimeframe = '1h';

// ===== OHLC Candle =====
export interface OhlcCandle {
  /** Unix timestamp in milliseconds */
  t: number;
  /** Open price */
  o: number;
  /** High price */
  h: number;
  /** Low price */
  l: number;
  /** Close price */
  c: number;
  /** Volume (optional) */
  v?: number;
}

// ===== Chart status =====
export type ChartFetchStatus = 'idle' | 'loading' | 'success' | 'stale' | 'error' | 'no-data';

export type ChartMode = 'live' | 'replay';

// ===== Chart View State =====
export interface ChartViewState {
  /** Selected timeframe */
  timeframe: ChartTimeframe;
  /** Current mode for the chart */
  mode?: ChartMode;
  /** Current frame index for replay */
  currentIndex?: number;
  /** Playback speed multiplier */
  playbackSpeed?: number;
  /** Active indicators */
  indicators: {
    sma?: { period: number; color: string };
    ema?: { period: number; color: string };
    rsi?: { period: number; overbought: number; oversold: number };
    bollinger?: { period: number; stdDev: number };
  };
  /** Chart visual settings */
  visual: {
    showVolume: boolean;
    showGrid: boolean;
    candleStyle: 'candle' | 'hollow' | 'line';
  };
  /** Zoom & Pan state */
  viewport?: {
    fromTime?: number;
    toTime?: number;
    scale?: number;
  };
}

// ===== Chart Snapshot (Dexie cache) =====
export interface BoardChartSnapshot {
  id?: number; // Auto-increment
  /** Solana token address */
  address: string;
  /** Symbol (e.g. "SOL", "BONK") */
  symbol: string;
  /** Timeframe */
  timeframe: ChartTimeframe;
  /** Cached OHLC data */
  ohlc: OhlcCandle[];
  /** Chart view state (indicators, zoom, etc.) */
  viewState: ChartViewState;
  /** Snapshot metadata */
  metadata: {
    createdAt: number;
    lastFetchedAt: number;
    fetchedFrom: 'dexpaprika' | 'moralis' | 'dexscreener' | 'cache';
    /** Number of candles */
    candleCount: number;
  };
}

// ===== Indicators & annotations (prep) =====
export type ChartIndicatorOverlay =
  | { type: 'sma'; period: number }
  | { type: 'ema'; period: number }
  | { type: 'bb'; period: number; deviation: number }
  | { type: 'rsi'; period: number; overbought?: number; oversold?: number }

export type IndicatorId = 'sma' | 'ema' | 'bb' | 'rsi'

export type IndicatorEnabled = Partial<Record<IndicatorId, boolean>>

export interface IndicatorParams {
  sma?: { period: number; color?: string }
  ema?: { period: number; color?: string }
  bb?: { period: number; deviation: number; color?: string }
  rsi?: { period: number; overbought?: number; oversold?: number; color?: string }
}

export interface IndicatorSettingsRecord {
  id?: number
  symbol: string
  timeframe: ChartTimeframe
  enabled: IndicatorEnabled
  params: IndicatorParams
  preset?: IndicatorPresetId
  createdAt: number
  updatedAt: number
}

export interface ChartAnnotation {
  id: string;
  candleTime: number;
  label: string;
  description?: string;
  severity?: 'low' | 'medium' | 'high';
  kind: 'journal' | 'alert' | 'signal';
}

export type IndicatorPresetId = 'scalper' | 'swing' | 'position' | 'custom'

export interface IndicatorConfig {
  overlays: ChartIndicatorOverlay[]
  preset?: IndicatorPresetId
}

export interface ChartCreationContext {
  address: string
  symbol: string
  price: number
  time: number
  timeframe: ChartTimeframe
}

export type IndicatorSeriesPoint = {
  time: UTCTimestamp;
  value: number;
};

export type ComputedIndicator =
  | {
      id: string;
      indicatorId: IndicatorId;
      type: 'line';
      config: Exclude<ChartIndicatorOverlay, { type: 'bb' }>;
      points: IndicatorSeriesPoint[];
      color?: string;
    }
  | {
      id: string;
      indicatorId: IndicatorId;
      type: 'bb';
      config: Extract<ChartIndicatorOverlay, { type: 'bb' }>;
      basis: IndicatorSeriesPoint[];
      upper: IndicatorSeriesPoint[];
      lower: IndicatorSeriesPoint[];
      color?: string;
    };

export type IndicatorOutput = ComputedIndicator;

// ===== Drawings (persisted + overlay rendering) =====
export type ChartDrawingType = 'HLINE' | 'LINE' | 'BOX' | 'FIB'

export interface ChartDrawingPoint {
  /** Unix timestamp in milliseconds */
  t: number
  /** Price at the point */
  p: number
}

export interface ChartDrawingStyle {
  color?: string
  lineWidth?: number
  dash?: number[]
  label?: string
}

export interface ChartDrawingRecord {
  id?: string
  symbol: string
  timeframe: ChartTimeframe
  type: ChartDrawingType
  points: ChartDrawingPoint[]
  style?: ChartDrawingStyle
  origin?: 'manual' | 'ai'
  isSelected?: boolean
  createdAt?: number
  updatedAt?: number
}

// ===== OHLC Fetch Status =====
export type OhlcFetchStatus =
  | { status: 'idle' }
  | { status: 'loading'; progress?: number }
  | { status: 'success'; data: OhlcCandle[]; provider: string; cachedAt: number }
  | { status: 'error'; error: Error; lastSuccessfulData?: OhlcCandle[] };

// ===== Replay-specific types =====
export interface ReplayChartState extends ChartViewState {
  /** Current frame index */
  currentFrame: number;
  /** Total frames available */
  totalFrames: number;
  /** Playback speed multiplier */
  speed: 1 | 2 | 4 | 8;
  /** Is playing */
  isPlaying: boolean;
}
