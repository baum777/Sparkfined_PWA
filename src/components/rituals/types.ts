/**
 * Rituals & Trade Journal Types
 * Privacy-first data models for daily rituals and trade journaling
 */

/**
 * Mood states for daily ritual tracking
 */
export type MoodState = 'calm' | 'neutral' | 'anxious' | 'stressed';

/**
 * Daily ritual entry with goal setting and streak tracking
 */
export interface DailyRitual {
  /** Date in YYYY-MM-DD format */
  date: string;
  /** SHA-256 hash of the goal text (for privacy) */
  goalHash: string;
  /** Raw goal text (stored locally only) */
  goal: string;
  /** Current mood state */
  mood: MoodState;
  /** Whether the ritual was completed */
  completed: boolean;
  /** Current streak count */
  streak: number;
  /** Timestamp when created */
  createdAt: string;
  /** Whether synced to server */
  synced: boolean;
}

/**
 * Pre-trade checklist validation data
 */
export interface PreTradeChecklist {
  /** Unique ID */
  id: string;
  /** Trading symbol */
  symbol: string;
  /** SHA-256 hash of the thesis (for privacy) */
  thesisHash: string;
  /** Raw thesis text (stored locally only) */
  thesis: string;
  /** Risk/Reward ratio */
  rr: number;
  /** Risk amount in currency */
  riskAmount: number;
  /** Position size */
  positionSize?: number;
  /** Stop loss percentage */
  stopLossPct?: number;
  /** Timestamp when created */
  createdAt: string;
  /** Whether synced to server */
  synced: boolean;
}

/**
 * Emotional state tracking for trades
 */
export interface EmotionalState {
  before: MoodState;
  during: MoodState;
  after: MoodState;
}

/**
 * Trade outcome data
 */
export interface TradeOutcome {
  /** Profit/Loss amount */
  pnl: number;
  /** SHA-256 hash of notes (for privacy) */
  notesHash: string;
  /** Raw notes text (stored locally only) */
  notes: string;
}

/**
 * Complete trade journal entry
 */
export interface TradeJournalEntry {
  /** Unique ID */
  id: string;
  /** User ID (optional, for multi-user support) */
  userId?: string;
  /** Trading symbol */
  symbol: string;
  /** Entry timestamp */
  entryTime: string;
  /** Exit timestamp */
  exitTime: string;
  /** SHA-256 hash of trade plan */
  tradePlanHash: string;
  /** Raw trade plan (stored locally only) */
  tradePlan: string;
  /** Position size */
  positionSize: number;
  /** Risk amount */
  riskAmount: number;
  /** Stop loss percentage */
  stopLossPct: number;
  /** Emotional states throughout trade */
  emotionalState: EmotionalState;
  /** Influencing factors (e.g., news, indicators) */
  influencers: string[];
  /** Trade outcome */
  outcome: TradeOutcome;
  /** Optional replay snapshot ID */
  replaySnapshotId: string | null;
  /** Timestamp when created */
  createdAt: string;
  /** Whether synced to server */
  synced: boolean;
}

/**
 * PnL bucket for analytics (privacy-preserving)
 */
export type PnLBucket = 'large_win' | 'small_win' | 'breakeven' | 'small_loss' | 'large_loss';

/**
 * Helper to categorize PnL into buckets
 */
export function categorizePnL(pnl: number, riskAmount: number): PnLBucket {
  const ratio = pnl / riskAmount;
  if (ratio > 2) return 'large_win';
  if (ratio > 0.5) return 'small_win';
  if (ratio > -0.5) return 'breakeven';
  if (ratio > -2) return 'small_loss';
  return 'large_loss';
}

/**
 * Ritual event metadata (for telemetry)
 */
export interface RitualEventMetadata {
  date?: string;
  goalHash?: string;
  mood?: MoodState;
  streak?: number;
  symbol?: string;
  rr?: number;
  riskAmount?: number;
  thesisHash?: string;
  thesisLength?: number;
  pnlBucket?: PnLBucket;
  emotions?: string;
  tradeId?: string;
  journalId?: string;
  snapshotId?: string;
  errorType?: string;
  errorReason?: string;
}
