/**
 * Wallet Tracking Types
 *
 * Hybrid tracking system: Auto-tracking via wallet monitoring + manual entries
 */

// ============================================================================
// WALLET CONNECTION
// ============================================================================

export type WalletProvider = 'phantom' | 'solflare' | 'backpack' | 'manual';

export type WalletRole = 'main-1' | 'main-2' | 'trading';

export type ConnectedWallet = {
  address: string;
  provider: WalletProvider;
  role: WalletRole;
  label?: string;              // User-friendly label (e.g., "Scalping Wallet")
  connectedAt: number;
  lastSyncedAt?: number;       // Last transaction sync timestamp
  isActive: boolean;           // Enable/disable tracking
};

export type WalletSettings = {
  wallets: ConnectedWallet[];
  autoJournalEnabled: boolean;  // Auto-create journal entries from transactions
  minTradeSize: number;         // Minimum USD value to auto-journal (filter dust)
  excludedTokens: string[];     // Token addresses to exclude from auto-journal
  autoSnapshotEnabled: boolean; // Auto-capture chart screenshot
};

// ============================================================================
// TRANSACTION MONITORING
// ============================================================================

export type DexPlatform = 'raydium' | 'jupiter' | 'orca' | 'meteora' | 'phoenix' | 'unknown';

export type TransactionType = 'buy' | 'sell' | 'swap';

export type MonitoredTransaction = {
  signature: string;            // Solana transaction signature
  timestamp: number;            // Block timestamp
  wallet: string;               // User wallet address

  // Trade Details
  type: TransactionType;
  tokenAddress: string;
  tokenSymbol: string;
  tokenAmount: number;

  // Pricing
  priceUsd: number;             // USD price per token
  totalUsd: number;             // Total trade value in USD

  // DEX Info
  dex: DexPlatform;
  poolAddress?: string;

  // Market Context (at time of trade)
  marketCap?: number;
  volume24h?: number;
  priceChange24h?: number;

  // Processing
  processed: boolean;           // Has this been converted to journal entry?
  journalEntryId?: string;      // Link to created journal entry
  processedAt?: number;
};

// ============================================================================
// AUTO-JOURNAL CREATION
// ============================================================================

export type AutoJournalSource = 'wallet-monitoring' | 'tradingview-webhook' | 'manual';

export type AutoJournalOptions = {
  source: AutoJournalSource;
  captureScreenshot: boolean;
  detectSetup: boolean;
  detectSession: boolean;
  promptForEmotions: boolean;   // Ask user to rate emotions after auto-create
};

// ============================================================================
// SETUP DETECTION (ICT/SMC)
// ============================================================================

export type ICTSetupType =
  | 'fvg'                       // Fair Value Gap
  | 'orderblock'                // Order Block
  | 'breaker'                   // Breaker Block
  | 'liquidity-sweep'           // Liquidity Sweep
  | 'judas-swing'               // Judas Swing
  | 'turtle-soup'               // Turtle Soup
  | 'mitigation'                // Mitigation Block
  | 'inducement'                // Inducement
  | 'displacement'              // Displacement
  | 'bos'                       // Break of Structure
  | 'choch'                     // Change of Character
  | 'premium-discount';         // Premium/Discount Array

export type SetupDetectionResult = {
  detected: boolean;
  setups: ICTSetupType[];
  confidence: number;           // 0-1 (how confident is the detection)
  context: string;              // Human-readable explanation

  // Technical Details
  fvgDetails?: FVGDetails;
  orderblockDetails?: OrderblockDetails;
  liquidityDetails?: LiquidityDetails;
};

export type FVGDetails = {
  type: 'bullish' | 'bearish';
  startPrice: number;
  endPrice: number;
  size: number;                 // Gap size in %
  timeframe: string;
};

export type OrderblockDetails = {
  type: 'bullish' | 'bearish';
  highPrice: number;
  lowPrice: number;
  volume: number;
  timeframe: string;
  mitigated: boolean;
};

export type LiquidityDetails = {
  type: 'buy-side' | 'sell-side';
  level: number;                // Price level
  swept: boolean;
  sweptAt?: number;             // Timestamp of sweep
};

// ============================================================================
// SESSION DETECTION
// ============================================================================

export type TradingSession = 'asian' | 'london' | 'ny' | 'sydney';

export type ICTKillzone =
  | 'asian-killzone'            // 20:00-00:00 EST (01:00-05:00 UTC)
  | 'london-killzone'           // 02:00-05:00 EST (07:00-10:00 UTC)
  | 'ny-am-killzone'            // 08:30-11:00 EST (13:30-16:00 UTC)
  | 'ny-pm-killzone'            // 13:30-16:00 EST (18:30-21:00 UTC)
  | 'none';

export type SessionInfo = {
  session: TradingSession;
  killzone: ICTKillzone;
  isHighVolatility: boolean;    // Is this a high-volatility period?
  sessionStart: number;         // Timestamp of session start
  sessionEnd: number;           // Timestamp of session end
};

// ============================================================================
// MENTAL TRACKING
// ============================================================================

export type EmotionRating = {
  confidence: number;           // 0-10 (how confident were you?)
  fomo: number;                 // 0-10 (FOMO level)
  fear: number;                 // 0-10 (fear level)
  discipline: number;           // 0-10 (how disciplined?)
  tiltScore: number;            // 0-10 (tilt/revenge trading score)
  overallMood: number;          // 0-10 (overall mental state)
};

export type SessionQuality = {
  rating: number;               // 1-5 stars
  notes?: string;               // What went well/wrong?
  wouldRepeat: boolean;         // Would you take this trade again?
};

// ============================================================================
// JOURNAL TEMPLATES
// ============================================================================

export type JournalTemplate = {
  id: string;
  name: string;
  setupType: ICTSetupType;

  // Pre-filled Fields
  defaultTags: string[];
  defaultEmotions?: Partial<EmotionRating>;

  // Required Fields (user must fill before saving)
  requiredFields: TemplateField[];

  // Optional Fields
  optionalFields: TemplateField[];
};

export type TemplateField = {
  id: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'multiselect' | 'textarea';
  placeholder?: string;
  options?: string[];           // For select/multiselect
  validation?: {
    required: boolean;
    min?: number;
    max?: number;
    pattern?: string;
  };
};

// ============================================================================
// EXAMPLE TEMPLATES
// ============================================================================

export const FVG_TEMPLATE: JournalTemplate = {
  id: 'fvg-template',
  name: 'Fair Value Gap (FVG)',
  setupType: 'fvg',
  defaultTags: ['FVG', 'ICT'],
  requiredFields: [
    {
      id: 'fvg-direction',
      label: 'FVG Direction',
      type: 'select',
      options: ['Bullish', 'Bearish'],
      validation: { required: true },
    },
    {
      id: 'fvg-timeframe',
      label: 'FVG Timeframe',
      type: 'select',
      options: ['1m', '5m', '15m', '1h', '4h', '1d'],
      validation: { required: true },
    },
    {
      id: 'fill-percentage',
      label: 'Gap Fill %',
      type: 'number',
      placeholder: 'e.g., 50',
      validation: { required: true, min: 0, max: 100 },
    },
  ],
  optionalFields: [
    {
      id: 'confluence',
      label: 'Confluence',
      type: 'multiselect',
      options: ['Order Block', 'Liquidity Sweep', 'Premium/Discount', 'High Volume Node'],
    },
  ],
};

export const ORDERBLOCK_TEMPLATE: JournalTemplate = {
  id: 'orderblock-template',
  name: 'Order Block',
  setupType: 'orderblock',
  defaultTags: ['Orderblock', 'ICT'],
  requiredFields: [
    {
      id: 'ob-type',
      label: 'Order Block Type',
      type: 'select',
      options: ['Bullish', 'Bearish', 'Breaker'],
      validation: { required: true },
    },
    {
      id: 'ob-timeframe',
      label: 'Timeframe',
      type: 'select',
      options: ['5m', '15m', '1h', '4h', '1d'],
      validation: { required: true },
    },
    {
      id: 'mitigation',
      label: 'Was OB Mitigated?',
      type: 'select',
      options: ['Yes', 'No', 'Partial'],
      validation: { required: true },
    },
  ],
  optionalFields: [
    {
      id: 'volume-profile',
      label: 'Volume Profile',
      type: 'text',
      placeholder: 'High/Medium/Low',
    },
  ],
};

export const LIQUIDITY_SWEEP_TEMPLATE: JournalTemplate = {
  id: 'liquidity-sweep-template',
  name: 'Liquidity Sweep',
  setupType: 'liquidity-sweep',
  defaultTags: ['Liquidity Sweep', 'ICT'],
  requiredFields: [
    {
      id: 'liquidity-type',
      label: 'Liquidity Type',
      type: 'select',
      options: ['Buy-Side (Stops above highs)', 'Sell-Side (Stops below lows)', 'Both'],
      validation: { required: true },
    },
    {
      id: 'liquidity-level',
      label: 'Which Liquidity Was Taken?',
      type: 'textarea',
      placeholder: 'Describe the liquidity pool (e.g., previous day high, equal highs, etc.)',
      validation: { required: true },
    },
  ],
  optionalFields: [
    {
      id: 'reaction',
      label: 'Market Reaction',
      type: 'textarea',
      placeholder: 'How did price react after sweep?',
    },
  ],
};

// ============================================================================
// EXPORT ALL TEMPLATES
// ============================================================================

export const JOURNAL_TEMPLATES: JournalTemplate[] = [
  FVG_TEMPLATE,
  ORDERBLOCK_TEMPLATE,
  LIQUIDITY_SWEEP_TEMPLATE,
];
