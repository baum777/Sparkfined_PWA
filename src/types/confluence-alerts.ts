/**
 * Confluence Alert Engine Types
 *
 * Visual rule builder for multi-condition alerts:
 * - Drag & drop conditions
 * - AND/OR/NOT logic
 * - Time window restrictions
 * - Backtesting & performance tracking
 */

// ============================================================================
// ALERT RULE BUILDER
// ============================================================================

export type AlertRule = {
  id: string;
  name: string;
  description?: string;

  // Conditions
  conditions: AlertConditionGroup;

  // Actions (what happens when alert triggers)
  actions: AlertAction[];

  // Schedule & Restrictions
  timeRestrictions?: TimeRestriction[];
  enabled: boolean;

  // Metadata
  createdAt: number;
  updatedAt: number;
  triggeredCount: number;       // How many times has this rule triggered
  lastTriggeredAt?: number;

  // Performance Tracking
  performance?: AlertPerformance;
};

// ============================================================================
// CONDITION GROUPS (Logical Operators)
// ============================================================================

export type AlertConditionGroup = {
  operator: 'AND' | 'OR';
  conditions: (AlertCondition | AlertConditionGroup)[];
};

// ============================================================================
// INDIVIDUAL CONDITIONS
// ============================================================================

export type AlertCondition =
  | PriceCondition
  | VolumeCondition
  | RSICondition
  | MACDCondition
  | EMACondition
  | FVGCondition
  | OrderblockCondition
  | LiquidityCondition
  | OrderflowCondition
  | CustomIndicatorCondition;

// Base Condition
export type BaseCondition = {
  id: string;
  type: ConditionType;
  negate?: boolean;             // NOT operator (invert condition)
};

export type ConditionType =
  | 'price'
  | 'volume'
  | 'rsi'
  | 'macd'
  | 'ema'
  | 'fvg'
  | 'orderblock'
  | 'liquidity'
  | 'orderflow'
  | 'custom-indicator';

// ============================================================================
// PRICE CONDITIONS
// ============================================================================

export type PriceCondition = BaseCondition & {
  type: 'price';
  operator: ComparisonOperator;
  value: number;                // Price threshold
  valueType: 'absolute' | 'percent-change' | 'percent-from-level';
  level?: PriceLevel;           // Optional: compare to specific level
  timeframe?: string;           // e.g., '1h' (price on 1h chart)
};

export type ComparisonOperator = '>' | '<' | '>=' | '<=' | '==' | '!=';

export type PriceLevel =
  | 'open'
  | 'high'
  | 'low'
  | 'close'
  | 'vwap'
  | 'previous-close'
  | 'session-high'
  | 'session-low';

// ============================================================================
// VOLUME CONDITIONS
// ============================================================================

export type VolumeCondition = BaseCondition & {
  type: 'volume';
  operator: ComparisonOperator;
  value: number;
  valueType: 'absolute' | 'percent-of-avg' | 'spike';
  period?: number;              // For avg calculation (e.g., 20-bar avg)
  timeframe?: string;
};

// ============================================================================
// INDICATOR CONDITIONS
// ============================================================================

export type RSICondition = BaseCondition & {
  type: 'rsi';
  operator: ComparisonOperator;
  value: number;                // e.g., 70 (overbought)
  period: number;               // e.g., 14
  timeframe?: string;
};

export type MACDCondition = BaseCondition & {
  type: 'macd';
  condition:
    | 'bullish-cross'           // MACD crosses above signal
    | 'bearish-cross'           // MACD crosses below signal
    | 'above-zero'
    | 'below-zero';
  fastPeriod?: number;
  slowPeriod?: number;
  signalPeriod?: number;
  timeframe?: string;
};

export type EMACondition = BaseCondition & {
  type: 'ema';
  condition:
    | 'price-above'             // Price above EMA
    | 'price-below'             // Price below EMA
    | 'ema-cross';              // EMA cross (requires two periods)
  period: number;               // e.g., 200
  secondPeriod?: number;        // For cross (e.g., 50 crosses 200)
  timeframe?: string;
};

// ============================================================================
// ICT/SMC CONDITIONS
// ============================================================================

export type FVGCondition = BaseCondition & {
  type: 'fvg';
  condition:
    | 'fvg-detected'            // FVG formed
    | 'fvg-filled'              // FVG filled
    | 'fvg-partial-fill';       // FVG partially filled
  direction?: 'bullish' | 'bearish' | 'any';
  minSize?: number;             // Minimum gap size (%)
  timeframe?: string;
};

export type OrderblockCondition = BaseCondition & {
  type: 'orderblock';
  condition:
    | 'ob-detected'             // Order block formed
    | 'ob-mitigated'            // Order block mitigated
    | 'ob-touched';             // Price touched OB
  direction?: 'bullish' | 'bearish' | 'any';
  timeframe?: string;
};

export type LiquidityCondition = BaseCondition & {
  type: 'liquidity';
  condition:
    | 'sweep-detected'          // Liquidity sweep occurred
    | 'liquidity-building';     // Liquidity building at level
  side: 'buy-side' | 'sell-side' | 'any';
  timeframe?: string;
};

export type OrderflowCondition = BaseCondition & {
  type: 'orderflow';
  condition:
    | 'imbalance'               // Buy/sell imbalance
    | 'absorption'              // Large absorption detected
    | 'aggression';             // Aggressive buying/selling
  side?: 'buy' | 'sell' | 'any';
  threshold?: number;           // e.g., 70% buy volume
};

// ============================================================================
// CUSTOM INDICATOR
// ============================================================================

export type CustomIndicatorCondition = BaseCondition & {
  type: 'custom-indicator';
  indicator: string;            // Custom indicator name
  operator: ComparisonOperator;
  value: number;
  params?: Record<string, any>; // Indicator parameters
};

// ============================================================================
// TIME RESTRICTIONS
// ============================================================================

export type TimeRestriction = {
  type: 'session' | 'killzone' | 'time-range' | 'weekday';

  // Session Restriction
  session?: 'asian' | 'london' | 'ny' | 'sydney';

  // Killzone Restriction
  killzone?: 'asian-killzone' | 'london-killzone' | 'ny-am-killzone' | 'ny-pm-killzone';

  // Time Range (UTC)
  startTime?: string;           // HH:MM (e.g., "13:30")
  endTime?: string;             // HH:MM

  // Weekday
  weekdays?: Array<'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'>;
};

// ============================================================================
// ALERT ACTIONS
// ============================================================================

export type AlertAction =
  | PushNotificationAction
  | CreateJournalEntryAction
  | PlaySoundAction
  | WebhookAction
  | TelegramAction
  | DiscordAction
  | ChainAlertAction;

export type BaseAction = {
  id: string;
  type: AlertActionType;
  enabled: boolean;
};

export type AlertActionType =
  | 'push-notification'
  | 'create-journal-entry'
  | 'play-sound'
  | 'webhook'
  | 'telegram'
  | 'discord'
  | 'chain-alert';

// Push Notification
export type PushNotificationAction = BaseAction & {
  type: 'push-notification';
  title: string;
  message: string;
  priority: 'low' | 'normal' | 'high';
  includeScreenshot: boolean;
};

// Auto-Create Journal Entry
export type CreateJournalEntryAction = BaseAction & {
  type: 'create-journal-entry';
  templateId?: string;          // Use specific template
  preFillThesis: boolean;       // Pre-fill thesis with confluence conditions
  captureScreenshot: boolean;
  promptForEmotions: boolean;   // Ask user to rate emotions immediately
};

// Play Sound
export type PlaySoundAction = BaseAction & {
  type: 'play-sound';
  soundId: string;              // e.g., 'bell', 'chime', 'alert'
  volume: number;               // 0-100
};

// Webhook
export type WebhookAction = BaseAction & {
  type: 'webhook';
  url: string;
  method: 'GET' | 'POST';
  headers?: Record<string, string>;
  body?: string;                // JSON body template
};

// Telegram
export type TelegramAction = BaseAction & {
  type: 'telegram';
  chatId: string;
  message: string;
  includeScreenshot: boolean;
  includeDeepLink: boolean;     // Link back to Sparkfined
};

// Discord
export type DiscordAction = BaseAction & {
  type: 'discord';
  webhookUrl: string;
  message: string;
  includeScreenshot: boolean;
};

// Chain Alert (trigger another alert)
export type ChainAlertAction = BaseAction & {
  type: 'chain-alert';
  targetAlertId: string;        // Alert to arm/trigger
  action: 'arm' | 'trigger' | 'snooze' | 'disable';
};

// ============================================================================
// ALERT PERFORMANCE TRACKING
// ============================================================================

export type AlertPerformance = {
  // Trigger Stats
  totalTriggers: number;
  avgTriggersPerDay: number;

  // Outcome Tracking (if linked to journal entries)
  linkedJournalEntries: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;              // % (0-100)

  // Performance Metrics
  avgPnl: number;               // Average PnL when alert triggers
  totalPnl: number;
  expectancy: number;

  // Hit Rate (was the alert "right"?)
  hitRate: number;              // % (0-100)
  falsePositiveRate: number;    // % (0-100)

  // Historical Triggers
  triggers: AlertTrigger[];
};

export type AlertTrigger = {
  id: string;
  timestamp: number;
  price: number;
  conditionsMet: string[];      // Which conditions were met

  // Outcome (if tracked)
  journalEntryId?: string;
  outcome?: 'win' | 'loss' | 'breakeven' | 'pending';
  pnl?: number;
  pnlPercent?: number;

  // Was this a true positive?
  wasCorrect?: boolean;
  userFeedback?: 'good' | 'bad' | 'neutral';
};

// ============================================================================
// ALERT BACKTESTING
// ============================================================================

export type BacktestConfig = {
  alertRuleId: string;
  symbol: string;
  timeframe: string;

  // Date Range
  startDate: number;            // Unix timestamp
  endDate: number;

  // Options
  includePartialTriggers: boolean;
  minConfidence?: number;       // Minimum confidence to count as trigger
};

export type BacktestResult = {
  config: BacktestConfig;
  ranAt: number;

  // Trigger Stats
  totalTriggers: number;
  avgTriggersPerDay: number;
  triggersPerMonth: MonthlyTriggerCount[];

  // Simulated Performance (if we have OHLC data)
  simulatedWinRate?: number;
  simulatedExpectancy?: number;
  simulatedPnl?: number;

  // Detailed Triggers
  triggers: BacktestTrigger[];

  // Performance by Time
  performanceBySession: SessionPerformance[];
  performanceByWeekday: WeekdayPerformance[];
};

export type MonthlyTriggerCount = {
  year: number;
  month: number;
  triggerCount: number;
};

export type BacktestTrigger = {
  timestamp: number;
  price: number;
  conditionsMet: string[];

  // Simulated Outcome (simple heuristic)
  priceAfter1h?: number;
  priceAfter4h?: number;
  priceAfter1d?: number;
  changeAfter1h?: number;       // % change
  changeAfter4h?: number;
  changeAfter1d?: number;
};

export type SessionPerformance = {
  session: 'asian' | 'london' | 'ny' | 'sydney';
  triggers: number;
  winRate?: number;
  avgPnl?: number;
};

export type WeekdayPerformance = {
  weekday: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
  triggers: number;
  winRate?: number;
  avgPnl?: number;
};

// ============================================================================
// ALERT SETS (Community Sharing)
// ============================================================================

export type AlertSet = {
  id: string;
  name: string;
  description: string;
  author: string;
  version: string;

  // Rules in this set
  rules: AlertRule[];

  // Metadata
  tags: string[];               // e.g., ['ICT', 'Scalping', 'London']
  downloads: number;
  rating?: number;              // 1-5 stars
  createdAt: number;
  updatedAt: number;

  // Compatibility
  requiredIndicators?: string[]; // e.g., ['RSI', 'MACD']
  minVersion?: string;          // Minimum Sparkfined version
};

// ============================================================================
// ALERT RULE TEMPLATES (Pre-configured)
// ============================================================================

export const EXAMPLE_ALERT_RULES: Partial<AlertRule>[] = [
  {
    name: 'FVG + Liquidity Sweep Confluence',
    description: 'Alert when FVG is detected AND liquidity is swept within 15 minutes',
    conditions: {
      operator: 'AND',
      conditions: [
        {
          id: 'fvg-1',
          type: 'fvg',
          condition: 'fvg-detected',
          direction: 'bullish',
          minSize: 0.5,
          timeframe: '5m',
        } as FVGCondition,
        {
          id: 'liq-1',
          type: 'liquidity',
          condition: 'sweep-detected',
          side: 'sell-side',
          timeframe: '5m',
        } as LiquidityCondition,
      ],
    },
    actions: [
      {
        id: 'action-1',
        type: 'create-journal-entry',
        enabled: true,
        templateId: 'fvg-template',
        preFillThesis: true,
        captureScreenshot: true,
        promptForEmotions: true,
      } as CreateJournalEntryAction,
      {
        id: 'action-2',
        type: 'push-notification',
        enabled: true,
        title: 'FVG + Liquidity Sweep',
        message: 'Bullish FVG with sell-side liquidity sweep detected on 5m',
        priority: 'high',
        includeScreenshot: true,
      } as PushNotificationAction,
    ],
    timeRestrictions: [
      {
        type: 'killzone',
        killzone: 'london-killzone',
      },
    ],
  },

  {
    name: 'RSI Divergence + Volume Spike',
    description: 'Alert on RSI divergence with volume > 150% of 20-bar average',
    conditions: {
      operator: 'AND',
      conditions: [
        {
          id: 'rsi-1',
          type: 'rsi',
          operator: '<',
          value: 30,
          period: 14,
          timeframe: '15m',
        } as RSICondition,
        {
          id: 'vol-1',
          type: 'volume',
          operator: '>',
          value: 150,
          valueType: 'percent-of-avg',
          period: 20,
          timeframe: '15m',
        } as VolumeCondition,
      ],
    },
    actions: [
      {
        id: 'action-1',
        type: 'push-notification',
        enabled: true,
        title: 'RSI Divergence + Volume',
        message: 'RSI below 30 with volume spike detected',
        priority: 'normal',
        includeScreenshot: false,
      } as PushNotificationAction,
    ],
  },
];
