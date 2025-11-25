/**
 * Auto-Journal Capture
 *
 * Automatically creates journal entries from:
 * - Wallet transactions (DEX trades)
 * - TradingView webhooks
 * - Manual triggers
 */

import type {
  MonitoredTransaction,
  AutoJournalSource,
  AutoJournalOptions,
  SetupDetectionResult,
  SessionInfo,
} from '@/types/wallet-tracking';
import type { JournalEntry as PersistedJournalEntry } from '@/types/journal';
import { createEntry } from '@/lib/JournalService';
import { detectSetup } from '@/lib/analysis/setup-detector';
import { detectSession } from '@/lib/analysis/session-detector';
import { captureChartSnapshot } from '@/lib/chart/snapshot';
import { useWalletStore } from '@/store/walletStore';

// ============================================================================
// AUTO-JOURNAL FROM TRANSACTION
// ============================================================================

/**
 * Create journal entry from monitored transaction
 */
export async function createJournalFromTransaction(
  tx: MonitoredTransaction,
  options: Partial<AutoJournalOptions> = {},
): Promise<PersistedJournalEntry> {
  const opts: AutoJournalOptions = {
    source: 'wallet-monitoring',
    captureScreenshot: true,
    detectSetup: true,
    detectSession: true,
    promptForEmotions: false,
    ...options,
  };

  console.info('[AutoCapture] Creating journal entry from transaction:', tx.signature);

  // 1. Detect setup (if enabled)
  let setupResult: SetupDetectionResult | undefined;
  if (opts.detectSetup) {
    setupResult = await detectSetup(tx.tokenAddress, tx.timestamp);
  }

  // 2. Detect session (if enabled)
  let sessionInfo: SessionInfo | undefined;
  if (opts.detectSession) {
    sessionInfo = detectSession(tx.timestamp);
  }

  // 3. Capture chart snapshot (if enabled)
  let chartSnapshot: string | undefined;
  if (opts.captureScreenshot) {
    chartSnapshot = await captureChartSnapshot(tx.tokenAddress, tx.timestamp);
  }

  // 4. Build thesis/notes
  const thesis = buildThesisFromTransaction(tx, setupResult, sessionInfo);

  // 5. Determine setup tag
  const setupTag = setupResult?.setups?.[0] || 'custom';

  // 6. Create journal entry
  const entry = await createEntry({
    ticker: tx.tokenSymbol,
    address: tx.tokenAddress,
    setup: setupTag as any, // Type assertion - we'll map ICT setups to existing tags
    emotion: 'custom',
    status: tx.type === 'buy' ? 'active' : 'closed',
    timestamp: tx.timestamp,
    thesis,

    // Chart snapshot
    chartSnapshot: chartSnapshot ? { screenshot: chartSnapshot } : undefined,

    // Transaction data
    outcome: tx.type === 'sell' ? {
      pnl: 0, // Will be calculated later when we have entry/exit pair
      pnlPercent: 0,
      transactions: [
        {
          type: tx.type,
          timestamp: tx.timestamp,
          price: tx.priceUsd,
          amount: tx.tokenAmount,
          mcap: tx.marketCap || 0,
          txHash: tx.signature,
        },
      ],
    } : undefined,

    // Custom tags
    customTags: buildCustomTags(tx, setupResult, sessionInfo),
  });

  console.info('[AutoCapture] Created journal entry:', entry.id);

  return entry;
}

// ============================================================================
// THESIS BUILDING
// ============================================================================

/**
 * Build thesis text from transaction data
 */
function buildThesisFromTransaction(
  tx: MonitoredTransaction,
  setup?: SetupDetectionResult,
  session?: SessionInfo,
): string {
  const parts: string[] = [];

  // Transaction type
  parts.push(`[Auto] ${tx.type.toUpperCase()} ${tx.tokenSymbol}`);

  // Setup detection
  if (setup?.detected && setup.setups.length > 0) {
    const setupNames = setup.setups.join(', ').toUpperCase();
    parts.push(`Setup: ${setupNames}`);
    if (setup.context) {
      parts.push(setup.context);
    }
  }

  // Session info
  if (session) {
    parts.push(`Session: ${session.session.toUpperCase()} ${session.killzone !== 'none' ? `(${session.killzone})` : ''}`);
  }

  // Trade details
  parts.push('');
  parts.push('Trade Details:');
  parts.push(`- Price: $${tx.priceUsd.toFixed(6)}`);
  parts.push(`- Amount: ${tx.tokenAmount.toLocaleString()} ${tx.tokenSymbol}`);
  parts.push(`- Total: $${tx.totalUsd.toFixed(2)}`);
  parts.push(`- DEX: ${tx.dex.toUpperCase()}`);

  if (tx.marketCap) {
    parts.push(`- Market Cap: $${(tx.marketCap / 1_000_000).toFixed(2)}M`);
  }

  // Transaction link
  parts.push('');
  parts.push(`TX: https://solscan.io/tx/${tx.signature}`);

  return parts.join('\n');
}

/**
 * Build custom tags array
 */
function buildCustomTags(
  tx: MonitoredTransaction,
  setup?: SetupDetectionResult,
  session?: SessionInfo,
): string[] {
  const tags: string[] = [];

  // Auto tag
  tags.push('auto-captured');

  // DEX tag
  tags.push(tx.dex);

  // Setup tags
  if (setup?.detected && setup.setups.length > 0) {
    setup.setups.forEach((s) => tags.push(s));
  }

  // Session tags
  if (session) {
    tags.push(session.session);
    if (session.killzone !== 'none') {
      tags.push(session.killzone);
    }
  }

  // Size tags
  if (tx.totalUsd < 100) {
    tags.push('small-size');
  } else if (tx.totalUsd < 1000) {
    tags.push('medium-size');
  } else {
    tags.push('large-size');
  }

  return tags;
}

// ============================================================================
// MATCHING BUY/SELL PAIRS
// ============================================================================

/**
 * Match buy and sell transactions to calculate PnL
 *
 * This is a simplified FIFO (First-In-First-Out) matching.
 * In production, you might want LIFO or weighted average.
 */
export async function matchTransactionPairs(
  transactions: MonitoredTransaction[],
): Promise<Array<{ buy: MonitoredTransaction; sell: MonitoredTransaction; pnl: number; pnlPercent: number }>> {
  const pairs: Array<{ buy: MonitoredTransaction; sell: MonitoredTransaction; pnl: number; pnlPercent: number }> = [];

  // Group by token
  const byToken = new Map<string, MonitoredTransaction[]>();
  transactions.forEach((tx) => {
    if (!byToken.has(tx.tokenAddress)) {
      byToken.set(tx.tokenAddress, []);
    }
    byToken.get(tx.tokenAddress)!.push(tx);
  });

  // Match pairs for each token
  byToken.forEach((txs, tokenAddress) => {
    const buys = txs.filter((t) => t.type === 'buy').sort((a, b) => a.timestamp - b.timestamp);
    const sells = txs.filter((t) => t.type === 'sell').sort((a, b) => a.timestamp - b.timestamp);

    let buyIndex = 0;
    let sellIndex = 0;

    while (buyIndex < buys.length && sellIndex < sells.length) {
      const buy = buys[buyIndex];
      const sell = sells[sellIndex];

      // Calculate PnL
      const pnl = (sell.priceUsd - buy.priceUsd) * Math.min(buy.tokenAmount, sell.tokenAmount);
      const pnlPercent = ((sell.priceUsd - buy.priceUsd) / buy.priceUsd) * 100;

      pairs.push({ buy, sell, pnl, pnlPercent });

      // Move to next pair
      buyIndex++;
      sellIndex++;
    }
  });

  return pairs;
}

// ============================================================================
// BATCH PROCESSING
// ============================================================================

/**
 * Process multiple transactions in batch
 *
 * This is useful for:
 * - Initial wallet sync (many historical transactions)
 * - Reconnecting after being offline
 */
export async function batchProcessTransactions(
  transactions: MonitoredTransaction[],
  options: Partial<AutoJournalOptions> = {},
): Promise<PersistedJournalEntry[]> {
  const { settings } = useWalletStore.getState();

  // Filter transactions that should be processed
  const toProcess = transactions.filter((tx) =>
    shouldProcessTransaction(tx, settings.minTradeSize, settings.excludedTokens)
  );

  console.info('[AutoCapture] Batch processing', toProcess.length, 'transactions');

  // Process in parallel (with concurrency limit)
  const CONCURRENCY = 5;
  const entries: PersistedJournalEntry[] = [];

  for (let i = 0; i < toProcess.length; i += CONCURRENCY) {
    const batch = toProcess.slice(i, i + CONCURRENCY);
    const batchEntries = await Promise.all(
      batch.map((tx) => createJournalFromTransaction(tx, options))
    );
    entries.push(...batchEntries);
  }

  console.info('[AutoCapture] Created', entries.length, 'journal entries from batch');

  return entries;
}

/**
 * Helper: Should transaction be processed?
 */
function shouldProcessTransaction(
  tx: MonitoredTransaction,
  minTradeSize: number,
  excludedTokens: string[],
): boolean {
  if (tx.processed) return false;
  if (tx.totalUsd < minTradeSize) return false;
  if (excludedTokens.includes(tx.tokenAddress)) return false;
  if (tx.type !== 'buy' && tx.type !== 'sell') return false;
  return true;
}

// ============================================================================
// TRADINGVIEW WEBHOOK
// ============================================================================

/**
 * Create journal entry from TradingView webhook
 *
 * Expects webhook payload:
 * {
 *   "ticker": "SOL/USD",
 *   "action": "BUY" | "SELL",
 *   "price": 123.45,
 *   "time": 1234567890000,
 *   "strategy": "FVG Scalp"
 * }
 */
export async function createJournalFromWebhook(
  payload: any,
  options: Partial<AutoJournalOptions> = {},
): Promise<PersistedJournalEntry> {
  const opts: AutoJournalOptions = {
    source: 'tradingview-webhook',
    captureScreenshot: false,
    detectSetup: false,
    detectSession: true,
    promptForEmotions: false,
    ...options,
  };

  console.info('[AutoCapture] Creating journal entry from TradingView webhook');

  const ticker = payload.ticker || 'UNKNOWN';
  const action = payload.action?.toLowerCase() || 'buy';
  const price = payload.price || 0;
  const timestamp = payload.time || Date.now();
  const strategy = payload.strategy || 'TradingView Signal';

  // Detect session
  let sessionInfo: SessionInfo | undefined;
  if (opts.detectSession) {
    sessionInfo = detectSession(timestamp);
  }

  // Build thesis
  const thesisParts = [
    `[TradingView] ${action.toUpperCase()} ${ticker}`,
    `Strategy: ${strategy}`,
    `Price: $${price}`,
  ];

  if (sessionInfo) {
    thesisParts.push(`Session: ${sessionInfo.session.toUpperCase()}`);
  }

  const thesis = thesisParts.join('\n');

  // Create entry
  const entry = await createEntry({
    ticker,
    address: 'tradingview-signal',
    setup: 'custom',
    emotion: 'custom',
    status: action === 'buy' ? 'active' : 'closed',
    timestamp,
    thesis,
    customTags: ['tradingview', strategy.toLowerCase(), sessionInfo?.session || 'unknown-session'],
  });

  console.info('[AutoCapture] Created journal entry from webhook:', entry.id);

  return entry;
}
