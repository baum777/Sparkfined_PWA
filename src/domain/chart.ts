/**
 * Chart-Domain-Typen für Sparkfined PWA
 * Konsolidiert Chart + Replay + OHLC in einem Typ-System
 */

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

// ===== Chart View State =====
export interface ChartViewState {
  /** Selected timeframe */
  timeframe: ChartTimeframe;
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

// ===== Chart Snapshot (für Dexie-Cache) =====
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

// ===== OHLC Fetch Status =====
export type OhlcFetchStatus =
  | { status: 'idle' }
  | { status: 'loading'; progress?: number }
  | { status: 'success'; data: OhlcCandle[]; provider: string; cachedAt: number }
  | { status: 'error'; error: Error; lastSuccessfulData?: OhlcCandle[] };

// ===== Replay-spezifische Typen =====
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
