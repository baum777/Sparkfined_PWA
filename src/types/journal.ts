/**
 * Unified Journal & Replay Types
 * 
 * BLOCK 1: Data Model Foundation
 * Consolidates all journal/replay schemas into single source of truth
 */

// ============================================================================
// JOURNAL ENTRY (Core Entity)
// ============================================================================

export type JournalEntry = {
  // Core IDs
  id: string;                    // UUID
  timestamp: number;             // Unix ms (Entry-Creation)
  
  // Token Context
  ticker: string;                // Token Symbol (e.g., "BONK")
  address: string;               // Solana CA
  
  // Setup & Psychology (PRIO 1: Reflexion & Mindset)
  setup: SetupTag;               // Predefined setup type
  emotion: EmotionTag;           // Predefined emotion
  customTags?: string[];         // User-defined tags (optional)
  thesis?: string;               // Manual reasoning/hypothesis (3a)
  
  // Auto-Fetched Context (3b - Grok Integration)
  grokContext?: GrokContext;
  
  // Chart Context (Hybrid: Screenshot + State)
  chartSnapshot?: ChartSnapshot;

  // Screenshot capture (V1)
  screenshot?: string;              // data:image/...;base64,...
  screenshotCapturedAt?: string;    // ISO string when capture occurred
  
  // Outcome & Performance (PRIO 3: PnL-Analyse)
  outcome?: TradeOutcome;
  
  // Lifecycle & Status
  status: "temp" | "active" | "closed";
  createdAt: number;             // Auto-Entry: Buy-Time
  updatedAt: number;
  markedActiveAt?: number;       // When user marked as "active"
  
  // Links
  replaySessionId?: string;      // Link to Replay Session
  walletAddress?: string;        // Which wallet (for multi-wallet later)

  // Journey / XP progression (Loop J2)
  journeyMeta?: JournalJourneyMeta;
};

export type JourneyPhase = 'DEGEN' | 'SEEKER' | 'WARRIOR' | 'MASTER' | 'SAGE';

export interface JournalJourneyMeta {
  phase: JourneyPhase;
  xpTotal: number;
  streak: number;
  lastEventAt: number;
  lastPhaseChangeAt?: number;
}

// ============================================================================
// CHART STATE (Reconstructable)
// ============================================================================

export type ChartState = {
  address: string;
  timeframe: Timeframe;
  view: { start: number; end: number };  // Bar-Index-Range
  indicators: IndicatorConfig[];
  shapes?: Shape[];              // Drawings (Lines, Boxes, etc.)
  timestamp: number;             // When this state was saved
};

export type Timeframe = "30s" | "1m" | "5m" | "15m" | "1h" | "4h" | "1d";

export type IndicatorConfig = {
  type: "sma" | "ema" | "vwap" | "rsi" | "macd";
  params: Record<string, number>;  // e.g., { period: 20 }
  enabled: boolean;
};

export type Shape = {
  id: string;
  type: "line" | "box" | "text" | "arrow";
  points: Array<{ x: number; y: number }>;
  style?: {
    color?: string;
    lineWidth?: number;
    fill?: boolean;
  };
  label?: string;
};

// ============================================================================
// CHART SNAPSHOT (Hybrid)
// ============================================================================

export type ChartSnapshot = {
  screenshot?: string;           // Base64 PNG (for quick capture)
  state?: ChartState;            // Reconstructable state
};

// ============================================================================
// TRANSACTION (Buy/Sell Event)
// ============================================================================

export type Transaction = {
  type: "buy" | "sell";
  timestamp: number;
  price: number;                 // USD per Token
  amount: number;                // Token-Amount
  mcap: number;                  // MCap at time of transaction
  txHash: string;                // Solana TX Signature
};

// ============================================================================
// TRADE OUTCOME (PnL Tracking)
// ============================================================================

export type TradeOutcome = {
  pnl: number;                   // Total PnL in USD
  pnlPercent: number;            // %
  transactions: Transaction[];   // Buys/Sells
  closedAt?: number;             // Timestamp when trade closed
  winRate?: number;              // Optional: calculated win rate
};

// ============================================================================
// GROK CONTEXT (X-Timeline Fetch)
// ============================================================================

export type GrokContext = {
  lore: string;                  // X-Timeline: "What's the hype?"
  sentiment: "bullish" | "bearish" | "neutral";
  keyTweets?: GrokTweet[];
  fetchedAt: number;
};

export type GrokTweet = {
  author: string;
  text: string;
  url: string;
  timestamp: number;
  likes?: number;
  retweets?: number;
};

// ============================================================================
// REPLAY SESSION (Pattern Recognition)
// ============================================================================

export type ReplaySession = {
  id: string;
  name?: string;                 // User-friendly name
  journalEntryId?: string;       // Optional Link to Journal
  
  // Replay-Data
  ohlcCache?: OhlcPoint[];       // Cached OHLC for playback (offline-first)
  
  // User-Actions during Replay
  bookmarks?: ReplayBookmark[];  // Bookmarked moments
  
  // Metadata
  createdAt: number;
  updatedAt?: number;
};

export type ReplayBookmark = {
  id: string;                    // UUID
  frame: number;                 // Frame index in ohlcCache
  timestamp: number;             // Unix ms when bookmark was created
  note?: string;                 // User note
};

export type OhlcPoint = {
  t: number;                     // Unix timestamp (ms)
  o: number;                     // Open price
  h: number;                     // High price
  l: number;                     // Low price
  c: number;                     // Close price
  v?: number;                    // Volume (optional)
};

// ============================================================================
// TAGS (Predefined + Custom)
// ============================================================================

export type SetupTag = 
  | "support"
  | "resistance"
  | "breakout"
  | "breakdown"
  | "range"
  | "liquidity"
  | "momentum"
  | "reversal"
  | "custom";

export type EmotionTag =
  | "fomo"
  | "fear"
  | "confident"
  | "revenge"
  | "disciplined"
  | "uncertain"
  | "excited"
  | "custom";

// ============================================================================
// QUERY FILTERS
// ============================================================================

export type JournalQueryOptions = {
  status?: JournalEntry["status"] | "all";
  setup?: SetupTag | "all";
  emotion?: EmotionTag | "all";
  outcome?: "win" | "loss" | "pending" | "all";
  dateRange?: {
    from: number;  // Unix ms
    to: number;
  };
  search?: string;  // Search in ticker, thesis, notes
  limit?: number;
  offset?: number;
  sortBy?: "timestamp" | "pnl" | "winRate";
  sortOrder?: "asc" | "desc";
};

// ============================================================================
// PATTERN ANALYTICS (Stats)
// ============================================================================

export type PatternStats = {
  totalTrades: number;
  winRate: number;               // 0-100
  avgPnl: number;                // USD
  avgTimeToExit: number;         // milliseconds
  bySetup: SetupStats[];
  byEmotion: EmotionStats[];
};

export type SetupStats = {
  setup: SetupTag;
  totalTrades: number;
  winCount: number;
  lossCount: number;
  avgPnl: number;
  totalPnl: number;
};

export type EmotionStats = {
  emotion: EmotionTag;
  totalTrades: number;
  winCount: number;
  lossCount: number;
  avgPnl: number;
  totalPnl: number;
};

// ============================================================================
// IMPORT TYPES
// ============================================================================

export type LegacyJournalEntryV4 = {
  id: string;
  title: string;
  notes?: string;
  date?: string;
  direction?: 'long' | 'short';
  pnl?: string;
  tags?: string[];
};

export type JournalImportPayload = {
  version: number;
  entries: Array<JournalEntry | LegacyJournalEntryV4>;
};

// ============================================================================
// EXPORT TYPES
// ============================================================================

export type JournalExportFormat = "json" | "csv" | "md";

export type JournalExport = {
  version: string;               // Schema version
  exportedAt: number;
  entries: JournalEntry[];
  stats: PatternStats;
};
