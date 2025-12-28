// Base Trade type (existing)
export interface Trade {
  id: string;
  asset: string;
  direction: "long" | "short";
  entryPrice: string;
  entryDate: string;
  exitPrice?: string;
  pnl?: string;
  notes?: string;
  tags?: string;
  createdAt: string;
}

// Transaction within an auto-captured entry
export interface CapturedTransaction {
  type: "BUY" | "SELL";
  time: string;
  amount: number;
  priceUsd: number;
  valueUsd: number;
}

// Token info
export interface TokenInfo {
  symbol: string;
  name: string;
  mint?: string;
}

// Position snapshot
export interface PositionSnapshot {
  avgEntry: number;
  sizeUsd: number;
}

// PnL breakdown
export interface PnLInfo {
  unrealizedUsd: number;
  realizedUsd: number;
  pct: number;
}

// Extended data (optional enrichments)
export interface ExtendedData {
  marketContext?: {
    marketCap?: number;
    marketCapCategory?: "micro" | "small" | "mid" | "large";
    volume24h?: number;
  };
  technical?: {
    rsi?: number;
    rsiCondition?: "oversold" | "neutral" | "overbought";
  };
  onChain?: {
    holderCount?: number;
    whaleConcentration?: number;
    tokenAge?: number;
    tokenMaturity?: "new" | "established" | "mature";
  };
}

// Derived status for pending entries
export type PendingStatus = "active" | "ready" | "expiring";

// Auto-captured entry (Pending inbox)
export interface AutoCapturedEntry {
  id: string;
  token: TokenInfo;
  createdAt: string;
  lastActivityAt: string;
  expiresAt: string;
  position: PositionSnapshot;
  pnl: PnLInfo;
  txs: CapturedTransaction[];
  extended?: ExtendedData;
  // Derived fields (computed)
  isFullExit?: boolean;
  timeLeftMs?: number;
  status?: PendingStatus;
}

// Archive reasons
export type ArchiveReason = "full_exit" | "expired" | "manual";

// Archived entry (Logbook)
export interface ArchivedEntry extends AutoCapturedEntry {
  archivedAt: string;
  archiveReason: ArchiveReason;
}

// Emotion tags for enrichment
export type EmotionTag = "fomo" | "setup" | "revenge" | "fear" | "greed";

// User enrichment data
export interface EntryEnrichment {
  emotion?: EmotionTag;
  notes?: string;
  tags?: string[];
}

// Confirmed journal entry
export interface ConfirmedEntry extends AutoCapturedEntry {
  confirmedAt: string;
  enrichment: EntryEnrichment;
}

// Extended data settings
export interface ExtendedDataSettings {
  preset: "minimal" | "default" | "maximum";
  marketContext: boolean;
  technicalIndicators: boolean;
  onChainMetrics: boolean;
  customTimeframes: string[];
}
