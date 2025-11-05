/**
 * Signal Orchestrator Types
 * Event-sourced trading signal architecture with learning layer
 *
 * Implements the AI Signal Orchestrator & Learning Architect pattern:
 * - Normalized market signals with confidence + thesis
 * - Trade plans with risk management + expectancy
 * - Action graph for event sourcing
 * - Lesson extraction for continuous learning
 *
 * @module types/signal
 */

// ============================================================================
// EVENT TAXONOMY (Telemetry)
// ============================================================================

/**
 * Standardized event types for action graph
 * Each event represents a node in the knowledge graph
 */
export type SignalEventType =
  // Signal lifecycle
  | 'signal.detected'
  | 'signal.confirmed'
  | 'signal.invalidated'
  // Trade lifecycle
  | 'trade.plan.created'
  | 'trade.opened'
  | 'trade.position.adjusted'
  | 'risk.adjusted'
  | 'stoploss.hit'
  | 'takeprofit.hit'
  | 'trade.closed'
  // Learning lifecycle
  | 'review.logged'
  | 'insight.extracted'
  | 'lesson.curated'
  // System events
  | 'system.error'
  | 'system.warning'

// ============================================================================
// REGIME CLASSIFICATION
// ============================================================================

/**
 * Market regime classification for context-aware signals
 */
export interface MarketRegime {
  /** Overall trend direction */
  trend: 'up' | 'down' | 'side'
  
  /** Volatility level */
  vol: 'low' | 'mid' | 'high'
  
  /** Liquidity depth */
  liquidity: 'low' | 'mid' | 'high'
  
  /** Optional: Time session (for session-aware strategies) */
  session?: 'asia' | 'london' | 'nyc' | 'overlap' | 'offhours'
  
  /** Optional: Market phase */
  phase?: 'accumulation' | 'markup' | 'distribution' | 'markdown'
}

// ============================================================================
// SIGNAL SCHEMA
// ============================================================================

/**
 * Normalized market signal with features, thesis, and confidence
 * Source of truth for all trading decisions
 */
export interface Signal {
  /** Unique signal ID */
  id: string // sig_<uuid>
  
  /** Timestamp (UTC) */
  timestamp_utc: string // ISO8601
  
  /** Market context */
  market: {
    chain: 'solana' | 'ethereum' | 'bsc' | 'arbitrum' | 'base' | 'polygon' | 'cex'
    symbol: string // e.g., "SOL/USDC"
    venue: string  // e.g., "raydium", "jupiter", "binance"
  }
  
  /** Market regime for context */
  regime: MarketRegime
  
  /** Technical + on-chain features */
  features: {
    // Price action
    price: number
    atr: number
    rsi: number
    ema_fast: number
    ema_slow: number
    
    // On-chain metrics (optional)
    onchain?: {
      holders_delta: number      // Change in holder count
      liquidity_usd: number       // Pool liquidity
      top10_share: number         // Top 10 holder concentration (0-1)
      mint_age_days: number       // Token age in days
      dev_tokens_pct?: number     // Dev wallet holding %
    }
    
    // Risk flags
    risk_flags: Array<'rug_suspect' | 'illiquid' | 'dev_unverified' | 'low_holders' | 'high_concentration' | 'new_token'>
  }
  
  /** Detected pattern */
  pattern: 'breakout' | 'reversal' | 'range-bounce' | 'momentum' | 'mean-reversion' | 'continuation' | 'divergence'
  
  /** Confidence score (0.0 - 1.0) */
  confidence: number
  
  /** Trade direction */
  direction: 'long' | 'short' | 'neutral'
  
  /** Human-readable thesis (why this setup has edge) */
  thesis: string
  
  /** Optional: Source nodes that contributed to this signal */
  source_nodes?: string[]
  
  /** Optional: Invalidation conditions */
  invalidation?: {
    price_below?: number
    price_above?: number
    time_expiry?: string // ISO8601
    conditions?: string[]
  }
}

// ============================================================================
// TRADE PLAN SCHEMA
// ============================================================================

/**
 * Executable trade plan (NEVER an order!)
 * Includes risk management, targets, and expectancy calculation
 */
export interface TradePlan {
  /** Unique plan ID */
  id: string // plan_<uuid>
  
  /** Reference to source signal */
  signal_id: string
  
  /** Entry specification */
  entry: {
    type: 'limit' | 'market' | 'stop-limit'
    price: number
    valid_for?: string // e.g., "30m", "1h", "2h"
    slippage_tolerance?: number // Max slippage % (0.5 = 0.5%)
  }
  
  /** Risk management */
  risk: {
    stop: number              // Stop loss price
    risk_pct_equity: number   // % of equity to risk
    pos_size_units: number    // Position size in base units
    max_loss_usd?: number     // Absolute max loss
  }
  
  /** Take profit targets (partial exits) */
  targets: Array<{
    tp: number                // Target number (1, 2, 3...)
    price: number             // Target price
    share: number             // % of position to exit (0.3 = 30%)
  }>
  
  /** Performance metrics */
  metrics: {
    rr: number                // Risk:Reward ratio
    expectancy: number        // Expected value per trade
    win_prob: number          // Win probability estimate (0-1)
    time_horizon?: string     // Expected holding time
  }
  
  /** Pre-trade checklist */
  checklist: Array<
    | 'regime_ok'
    | 'spread_ok'
    | 'slippage_ok'
    | 'liquidity_ok'
    | 'rugcheck_ok'
    | 'news_clear'
    | 'correlation_ok'
    | 'position_size_ok'
  >
  
  /** Notes and context */
  notes: string
  
  /** Optional: Related plans (scaling, hedging) */
  related_plans?: string[]
  
  /** Plan status */
  status: 'pending' | 'active' | 'filled' | 'cancelled' | 'expired'
  
  /** Timestamps */
  created_at: string  // ISO8601
  expires_at?: string // ISO8601
}

// ============================================================================
// ACTION GRAPH NODE
// ============================================================================

/**
 * Event-sourced action node for knowledge graph
 * Every action, decision, and insight is a node
 */
export interface ActionNode {
  /** Unique node ID */
  id: string // node_<uuid>
  
  /** Event type from taxonomy */
  type: SignalEventType
  
  /** Timestamp (UTC) */
  ts_utc: string // ISO8601
  
  /** References to related entities */
  refs: {
    signal_id?: string | null
    plan_id?: string | null
    trade_id?: string | null
    prev_node_id?: string | null
  }
  
  /** Event-specific payload (strictly typed per event type) */
  payload: Record<string, unknown>
  
  /** Tags for filtering and search */
  tags: string[] // e.g., ["setup/momo", "lesson/risk", "error/execution", "win/rr>2"]
  
  /** Confidence score (0.0 - 1.0) */
  confidence: number
  
  /** Optional: User notes */
  notes?: string
}

// ============================================================================
// LESSON SCHEMA (Learning Layer)
// ============================================================================

/**
 * Distilled lesson from action graph nodes
 * Helps users learn and improve over time
 */
export interface Lesson {
  /** Unique lesson ID */
  id: string // lesson_<uuid>
  
  /** Source nodes that contributed to this lesson */
  from_nodes: string[]
  
  /** Pattern/setup name */
  pattern: string // e.g., "momentum-breakout-AM-session"
  
  /** When this setup works */
  when_it_works: string
  
  /** When this setup fails */
  when_it_fails: string
  
  /** Pre-trade checklist specific to this lesson */
  checklist: string[]
  
  /** Best practices (DOs) */
  dos: string[]
  
  /** Common mistakes (DONTs) */
  donts: string[]
  
  /** Next practice drill */
  next_drill: string
  
  /** Lesson metadata */
  created_at: string  // ISO8601
  updated_at: string  // ISO8601
  
  /** Confidence/relevance score (0-1) */
  score: number
  
  /** Optional: Performance stats */
  stats?: {
    trades_analyzed: number
    win_rate: number
    avg_rr: number
    sample_size: number
  }
}

// ============================================================================
// OUTPUT CONTRACT
// ============================================================================

/**
 * Standardized output format for all signal orchestrator responses
 * MUST follow this contract for consistency
 */
export interface SignalOrchestratorOutput {
  /** Action graph updates */
  action_graph_update: {
    nodes: ActionNode[]
    edges: Array<[string, string, 'CAUSES' | 'FOLLOWS' | 'INVALIDATES' | 'REFINES']>
  }
  
  /** Detected/analyzed signals */
  signals: Signal[]
  
  /** Generated trade plans */
  trade_plans: TradePlan[]
  
  /** Extracted lessons */
  lessons: Lesson[]
  
  /** Human-readable explanation (<= 120 words) */
  explanation: string
  
  /** Optional: Warnings/guardrails */
  warnings?: string[]
}

// ============================================================================
// QUERY TYPES
// ============================================================================

/**
 * Query for signals from action graph
 */
export interface SignalQuery {
  /** Filter by pattern */
  pattern?: Signal['pattern'] | Signal['pattern'][]
  
  /** Filter by direction */
  direction?: Signal['direction']
  
  /** Min confidence threshold */
  min_confidence?: number
  
  /** Time range */
  time_range?: {
    start: string // ISO8601
    end: string   // ISO8601
  }
  
  /** Filter by market regime */
  regime?: Partial<MarketRegime>
  
  /** Filter by tags */
  tags?: string[]
  
  /** Limit results */
  limit?: number
}

/**
 * Query for lessons from learning layer
 */
export interface LessonQuery {
  /** Filter by pattern */
  pattern?: string
  
  /** Min score threshold */
  min_score?: number
  
  /** Sort by */
  sort_by?: 'score' | 'created_at' | 'updated_at' | 'win_rate'
  
  /** Limit results */
  limit?: number
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Trade outcome for lesson extraction
 */
export interface TradeOutcome {
  plan_id: string
  signal_id: string
  result: 'win' | 'loss' | 'breakeven' | 'partial'
  pnl_usd: number
  pnl_pct: number
  rr_actual: number
  held_duration: number // seconds
  exit_reason: 'tp' | 'sl' | 'manual' | 'time' | 'invalidation'
  notes?: string
}

/**
 * Risk check result
 */
export interface RiskCheck {
  passed: boolean
  checks: {
    spread_ok: boolean
    slippage_ok: boolean
    liquidity_ok: boolean
    rug_risk_ok: boolean
    news_clear: boolean
  }
  warnings: string[]
  blockers: string[]
}

/**
 * Expectancy calculation
 */
export interface ExpectancyCalc {
  win_rate: number      // Historical win rate
  avg_win: number       // Average win amount
  avg_loss: number      // Average loss amount
  expectancy: number    // Expected value per trade
  kelly: number         // Kelly criterion position sizing
  sample_size: number   // Number of trades analyzed
}
