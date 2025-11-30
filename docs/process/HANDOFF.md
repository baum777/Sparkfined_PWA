# 📋 Handoff-Dokument: Journal 2.0 & Alerts 2.0

**Projekt:** Sparkfined PWA
**Version:** Journal 2.0 + Alerts 2.0 (Wallet-Tracking & Confluence Engine)
**Erstellt:** 2025-11-25
**Für:** Codex (Implementierung)

---

## 🎯 Executive Summary

**Was gebaut wird:**
1. **Wallet-Tracking-System** – Auto-Journaling via Solana-Wallet-Monitoring (Helius WebSocket)
2. **ICT/SMC Setup-Detection** – Automatische Erkennung von FVG, Orderblocks, Liquidity Sweeps
3. **Advanced Analytics** – Expectancy, Monte Carlo, Perfect Trader, Win Rate by Session/Setup
4. **Confluence Alert Engine** – Multi-Condition-Alerts mit Visual Rule Builder
5. **Alert Backtesting** – Historische Performance-Analyse für Alerts
6. **Alert → Journal Integration** – Auto-Create Journal Entry on Alert Trigger

**Bereits erstellt:**
- ✅ Type Definitions (`src/types/wallet-tracking.ts`, `analytics-v2.ts`, `confluence-alerts.ts`)
- ✅ Wallet Store (`src/store/walletStore.ts`)
- ✅ Transaction Monitor (`src/lib/wallet/transaction-monitor.ts`)
- ✅ Auto-Capture Logic (`src/lib/journal/auto-capture.ts`)
- ✅ Setup Detector (`src/lib/analysis/setup-detector.ts`)
- ✅ Session Detector (`src/lib/analysis/session-detector.ts`)

**Noch zu implementieren:**
- ⏳ Advanced Analytics Engine (`src/lib/journal/analytics-engine.ts`)
- ⏳ Chart Snapshot Utility (`src/lib/chart/snapshot.ts`)
- ⏳ Confluence Alert Rule Builder (`src/lib/alerts/rule-builder.ts`)
- ⏳ Alert Backtesting Engine (`src/lib/alerts/backtest.ts`)
- ⏳ Alert Actions Executor (`src/lib/alerts/action-executor.ts`)
- ⏳ Alert History Store (`src/store/alertHistoryStore.ts`)
- ⏳ UI Components (14 Komponenten)
- ⏳ Integration in bestehende Pages

---

## 📐 Architektur-Übersicht

### Datenfluss: Wallet → Transaction → Journal

```
User connects wallet (Phantom/Solflare)
         ↓
walletStore.connectWallet()
         ↓
subscribeToWalletTransactions() [Helius WebSocket]
         ↓
parseTransaction() → MonitoredTransaction
         ↓
detectSetup() → FVG/Orderblock/Liquidity Sweep
detectSession() → London/NY/Asian + Killzone
         ↓
createJournalFromTransaction()
         ↓
captureChartSnapshot() [optional]
         ↓
createEntry() → Dexie (IndexedDB)
         ↓
journalStore updates → UI refreshes
         ↓
calculateAdvancedAnalytics() → Dashboard
```

### Datenfluss: Alert Rule → Trigger → Action

```
User creates alert rule (Visual Builder)
         ↓
createAlertRule() → AlertRule stored
         ↓
Real-time evaluation (interval: 5s-60s)
         ↓
evaluateAlertRule() checks conditions (Price AND Volume AND RSI...)
         ↓
Conditions met? → triggerAlert()
         ↓
Store in alertHistoryStore
         ↓
executeAlertActions():
  - Push notification
  - Create journal entry
  - Send webhook
  - Telegram/Discord notification
```

---

## 🗂️ Datei-Struktur

```
src/
├── types/
│   ├── wallet-tracking.ts          ✅ DONE
│   ├── analytics-v2.ts              ✅ DONE
│   ├── confluence-alerts.ts         ✅ DONE
│   └── journal.ts                   📌 EXISTING
│
├── store/
│   ├── walletStore.ts               ✅ DONE
│   ├── journalStore.ts              📌 EXISTING
│   ├── alertsStore.ts               📌 EXISTING (needs extension)
│   └── alertHistoryStore.ts         ⏳ TODO
│
├── lib/
│   ├── wallet/
│   │   └── transaction-monitor.ts   ✅ DONE
│   ├── journal/
│   │   ├── auto-capture.ts          ✅ DONE
│   │   ├── analytics-engine.ts      ⏳ TODO
│   │   └── export.ts                ⏳ TODO
│   ├── analysis/
│   │   ├── setup-detector.ts        ✅ DONE
│   │   └── session-detector.ts      ✅ DONE
│   ├── alerts/
│   │   ├── rule-builder.ts          ⏳ TODO
│   │   ├── backtest.ts              ⏳ TODO
│   │   └── action-executor.ts       ⏳ TODO
│   └── chart/
│       └── snapshot.ts              ⏳ TODO
│
├── components/
│   ├── wallet/
│   │   ├── WalletConnectionDialog.tsx     ⏳ TODO
│   │   └── WalletSettingsPanel.tsx        ⏳ TODO
│   ├── journal/
│   │   ├── JournalAnalyticsDashboard.tsx  ⏳ TODO
│   │   ├── JournalTemplateSelector.tsx    ⏳ TODO
│   │   ├── EmotionRatingSlider.tsx        ⏳ TODO
│   │   ├── SetupBreakdownChart.tsx        ⏳ TODO
│   │   ├── EquityCurveChart.tsx           ⏳ TODO
│   │   └── MonteCarloSimulationPanel.tsx  ⏳ TODO
│   └── alerts/
│       ├── AlertRuleBuilder.tsx           ⏳ TODO
│       ├── AlertConditionEditor.tsx       ⏳ TODO
│       ├── AlertActionSelector.tsx        ⏳ TODO
│       ├── AlertBacktestPanel.tsx         ⏳ TODO
│       ├── AlertPerformanceChart.tsx      ⏳ TODO
│       └── AlertTriggerHistoryList.tsx    ⏳ TODO
│
└── pages/
    ├── JournalPageV2.tsx            📌 EXISTING (extend)
    ├── AlertsPageV2.tsx             📌 EXISTING (extend)
    └── SettingsPageV2.tsx           📌 EXISTING (add wallet settings)
```

---

## 📦 Teil 1: Advanced Analytics Engine

### Datei: `src/lib/journal/analytics-engine.ts`

**Purpose:** Calculate advanced metrics from journal entries.

**Imports:**
```typescript
import type { JournalEntry as PersistedJournalEntry } from '@/types/journal';
import type {
  AdvancedAnalyticsReport,
  PerformanceMetrics,
  SetupBreakdown,
  EmotionBreakdown,
  SessionBreakdown,
  EquityPoint,
  MonthlyStats,
  PerfectTraderComparison,
} from '@/types/analytics-v2';
import {
  calculateExpectancy,
  calculateProfitFactor,
  calculateMaxDrawdown,
} from '@/types/analytics-v2';
```

**Main Function:**
```typescript
/**
 * Calculate advanced analytics from journal entries
 */
export async function calculateAdvancedAnalytics(
  entries: PersistedJournalEntry[]
): Promise<AdvancedAnalyticsReport> {
  // 1. Calculate overall performance metrics
  const overall = calculateOverallMetrics(entries);

  // 2. Calculate breakdowns by dimension
  const bySetup = calculateSetupBreakdown(entries);
  const byEmotion = calculateEmotionBreakdown(entries);
  const bySession = calculateSessionBreakdown(entries);
  const byKillzone = calculateKillzoneBreakdown(entries);
  const byWeekday = calculateWeekdayBreakdown(entries);
  const byDirection = calculateDirectionBreakdown(entries);
  const byTiltLevel = calculateTiltBreakdown(entries);

  // 3. Build equity curve
  const equityCurve = buildEquityCurve(entries);

  // 4. Calculate monthly stats
  const monthlyPerformance = calculateMonthlyStats(entries);

  // 5. Find best/worst performers
  const bestSetup = bySetup.length > 0 ? bySetup[0] : null;
  const worstSetup = bySetup.length > 0 ? bySetup[bySetup.length - 1] : null;
  const bestSession = bySession.length > 0 ? bySession[0] : null;
  const worstSession = bySession.length > 0 ? bySession[bySession.length - 1] : null;
  const bestEmotion = byEmotion.length > 0 ? byEmotion[0] : null;
  const worstEmotion = byEmotion.length > 0 ? byEmotion[byEmotion.length - 1] : null;

  // 6. Perfect Trader comparison
  const perfectTrader = calculatePerfectTrader(entries, bySetup, bySession, byEmotion);

  return {
    overall,
    bySetup,
    byEmotion,
    bySession,
    byKillzone,
    byWeekday,
    byDirection,
    byTiltLevel,
    equityCurve,
    monthlyPerformance,
    bestSetup,
    worstSetup,
    bestSession,
    worstSession,
    bestEmotion,
    worstEmotion,
    perfectTrader,
  };
}
```

**Helper Functions (implement each):**

1. **calculateOverallMetrics(entries): PerformanceMetrics**
   - Count total trades, wins, losses
   - Calculate win rate, avg PnL, expectancy
   - Calculate profit factor, max drawdown
   - Track streaks (current, longest win/loss)

2. **calculateSetupBreakdown(entries): SetupBreakdown[]**
   - Group entries by setup tag
   - Calculate metrics for each setup
   - Sort by expectancy (best → worst)
   - Add rank property

3. **calculateEmotionBreakdown(entries): EmotionBreakdown[]**
   - Group by emotion tag
   - Calculate performance per emotion

4. **calculateSessionBreakdown(entries): SessionBreakdown[]**
   - Extract session from customTags or detect from timestamp
   - Calculate performance per session

5. **buildEquityCurve(entries): EquityPoint[]**
   - Sort entries by timestamp
   - Calculate cumulative PnL
   - Track balance at each trade
   - Calculate drawdown from peak

6. **calculateMonthlyStats(entries): MonthlyStats[]**
   - Group by year-month
   - Calculate monthly performance
   - Return sorted by date

7. **calculatePerfectTrader(entries, bySetup, bySession, byEmotion): PerfectTraderComparison**
   - Find best setup, session, emotion
   - Calculate "what if only traded those"
   - Generate recommendations

**Integration Point:**
```typescript
// In JournalPageV2.tsx or new AnalyticsDashboard component
import { calculateAdvancedAnalytics } from '@/lib/journal/analytics-engine';
import { queryEntries } from '@/lib/JournalService';

const entries = await queryEntries({ status: 'all' });
const analytics = await calculateAdvancedAnalytics(entries);

// Display analytics.overall, analytics.bySetup, etc.
```

---

## 📦 Teil 2: Chart Snapshot Utility

### Datei: `src/lib/chart/snapshot.ts`

**Purpose:** Capture chart screenshot at specific timestamp.

**Imports:**
```typescript
import html2canvas from 'html2canvas'; // May need: pnpm add html2canvas
```

**Main Function:**
```typescript
/**
 * Capture chart screenshot
 *
 * @param tokenAddress - Token to capture
 * @param timestamp - Timestamp to show on chart (optional, defaults to now)
 * @returns Base64 PNG string or null if failed
 */
export async function captureChartSnapshot(
  tokenAddress: string,
  timestamp?: number
): Promise<string | null> {
  try {
    // Find chart element in DOM
    const chartElement = document.querySelector('[data-chart-canvas]');

    if (!chartElement) {
      console.warn('[ChartSnapshot] No chart element found');
      return null;
    }

    // Capture as canvas
    const canvas = await html2canvas(chartElement as HTMLElement, {
      backgroundColor: '#0a0e1a', // Match dark theme
      scale: 2, // High DPI
      logging: false,
    });

    // Convert to base64 PNG
    const base64 = canvas.toDataURL('image/png');

    return base64;
  } catch (error) {
    console.error('[ChartSnapshot] Failed to capture:', error);
    return null;
  }
}

/**
 * Alternative: Capture from Lightweight Charts instance
 */
export function captureFromLightweightChart(
  chartInstance: any // IChartApi from lightweight-charts
): string | null {
  try {
    // LWC has built-in screenshot method
    const canvas = chartInstance.takeScreenshot();
    return canvas ? canvas.toDataURL('image/png') : null;
  } catch (error) {
    console.error('[ChartSnapshot] Failed to capture from LWC:', error);
    return null;
  }
}
```

**Integration Point:**
```typescript
// In InteractiveChart.tsx or ChartPageV2.tsx
// Add data-chart-canvas attribute to chart container
<div data-chart-canvas ref={chartContainerRef}>
  {/* Chart rendered here */}
</div>

// When creating journal entry from chart
import { captureChartSnapshot } from '@/lib/chart/snapshot';

const screenshot = await captureChartSnapshot(tokenAddress);
// Pass screenshot to journal creation
```

---

## 📦 Teil 3: Alert Rule Builder

### Datei: `src/lib/alerts/rule-builder.ts`

**Purpose:** Create, evaluate, and manage alert rules.

**Imports:**
```typescript
import type {
  AlertRule,
  AlertCondition,
  AlertConditionGroup,
  PriceCondition,
  VolumeCondition,
  RSICondition,
  BacktestResult,
} from '@/types/confluence-alerts';
```

**Functions:**

```typescript
/**
 * Create new alert rule
 */
export function createAlertRule(
  name: string,
  conditions: AlertConditionGroup,
  actions: AlertAction[],
  timeRestrictions?: TimeRestriction[]
): AlertRule {
  return {
    id: crypto.randomUUID(),
    name,
    description: '',
    conditions,
    actions,
    timeRestrictions,
    enabled: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    triggeredCount: 0,
  };
}

/**
 * Evaluate alert rule against current market data
 */
export async function evaluateAlertRule(
  rule: AlertRule,
  marketData: {
    price: number;
    volume: number;
    timestamp: number;
    ohlc?: OhlcPoint[];
  }
): Promise<boolean> {
  // 1. Check if enabled
  if (!rule.enabled) return false;

  // 2. Check time restrictions
  if (rule.timeRestrictions && rule.timeRestrictions.length > 0) {
    const passesTimeRestrictions = checkTimeRestrictions(
      rule.timeRestrictions,
      marketData.timestamp
    );
    if (!passesTimeRestrictions) return false;
  }

  // 3. Evaluate condition group (recursive)
  return evaluateConditionGroup(rule.conditions, marketData);
}

/**
 * Evaluate condition group (AND/OR logic)
 */
function evaluateConditionGroup(
  group: AlertConditionGroup,
  marketData: any
): boolean {
  if (group.operator === 'AND') {
    return group.conditions.every(cond => {
      if ('operator' in cond) {
        // It's a condition group (nested)
        return evaluateConditionGroup(cond as AlertConditionGroup, marketData);
      } else {
        // It's a single condition
        return evaluateCondition(cond as AlertCondition, marketData);
      }
    });
  } else {
    // OR
    return group.conditions.some(cond => {
      if ('operator' in cond) {
        return evaluateConditionGroup(cond as AlertConditionGroup, marketData);
      } else {
        return evaluateCondition(cond as AlertCondition, marketData);
      }
    });
  }
}

/**
 * Evaluate single condition
 */
function evaluateCondition(
  condition: AlertCondition,
  marketData: any
): boolean {
  switch (condition.type) {
    case 'price':
      return evaluatePriceCondition(condition as PriceCondition, marketData);
    case 'volume':
      return evaluateVolumeCondition(condition as VolumeCondition, marketData);
    case 'rsi':
      return evaluateRSICondition(condition as RSICondition, marketData);
    // ... more condition types
    default:
      console.warn('[RuleBuilder] Unknown condition type:', condition.type);
      return false;
  }
}

/**
 * Evaluate price condition
 */
function evaluatePriceCondition(
  condition: PriceCondition,
  marketData: { price: number }
): boolean {
  const { operator, value, negate } = condition;
  let result = false;

  switch (operator) {
    case '>':
      result = marketData.price > value;
      break;
    case '<':
      result = marketData.price < value;
      break;
    case '>=':
      result = marketData.price >= value;
      break;
    case '<=':
      result = marketData.price <= value;
      break;
    case '==':
      result = Math.abs(marketData.price - value) < 0.0001;
      break;
    case '!=':
      result = Math.abs(marketData.price - value) >= 0.0001;
      break;
  }

  return negate ? !result : result;
}

/**
 * Check time restrictions
 */
function checkTimeRestrictions(
  restrictions: TimeRestriction[],
  timestamp: number
): boolean {
  return restrictions.every(restriction => {
    if (restriction.type === 'session') {
      const sessionInfo = detectSession(timestamp);
      return sessionInfo.session === restriction.session;
    }
    if (restriction.type === 'killzone') {
      const sessionInfo = detectSession(timestamp);
      return sessionInfo.killzone === restriction.killzone;
    }
    // ... more restriction types
    return true;
  });
}
```

**Integration Point:**
```typescript
// In AlertsPageV2.tsx or AlertRuleBuilder component
import { createAlertRule, evaluateAlertRule } from '@/lib/alerts/rule-builder';

// Create rule
const rule = createAlertRule(
  'BTC Above 50k + Volume Spike',
  {
    operator: 'AND',
    conditions: [
      { id: '1', type: 'price', operator: '>', value: 50000 },
      { id: '2', type: 'volume', operator: '>', value: 150, valueType: 'percent-of-avg' },
    ],
  },
  [
    { id: 'a1', type: 'push-notification', enabled: true, title: 'BTC Alert', message: '...' },
  ]
);

// Store rule
alertsStore.addRule(rule);

// Evaluate (in background interval)
setInterval(async () => {
  const marketData = await fetchCurrentMarketData('BTC');
  const triggered = await evaluateAlertRule(rule, marketData);
  if (triggered) {
    executeAlertActions(rule);
  }
}, 10000); // Every 10 seconds
```

---

## 📦 Teil 4: Alert Backtesting Engine

### Datei: `src/lib/alerts/backtest.ts`

**Purpose:** Test alert rules on historical data.

**Imports:**
```typescript
import type {
  BacktestConfig,
  BacktestResult,
  BacktestTrigger,
  AlertRule,
} from '@/types/confluence-alerts';
import { evaluateAlertRule } from './rule-builder';
```

**Main Function:**
```typescript
/**
 * Backtest alert rule on historical data
 */
export async function backtestAlertRule(
  rule: AlertRule,
  config: BacktestConfig
): Promise<BacktestResult> {
  const { symbol, timeframe, startDate, endDate } = config;

  // 1. Fetch historical OHLC data
  const ohlcData = await fetchHistoricalOhlc(symbol, timeframe, startDate, endDate);

  if (!ohlcData || ohlcData.length === 0) {
    throw new Error('No historical data available for backtest');
  }

  // 2. Evaluate rule on each candle
  const triggers: BacktestTrigger[] = [];

  for (let i = 0; i < ohlcData.length; i++) {
    const candle = ohlcData[i];
    const marketData = {
      price: candle.c,
      volume: candle.v || 0,
      timestamp: candle.t,
      ohlc: ohlcData.slice(0, i + 1), // Historical context
    };

    const triggered = await evaluateAlertRule(rule, marketData);

    if (triggered) {
      // Find conditions that were met
      const conditionsMet = extractMetConditions(rule.conditions, marketData);

      // Look ahead to see price movement
      const priceAfter1h = findPriceAfter(ohlcData, i, 3600000); // 1 hour
      const priceAfter4h = findPriceAfter(ohlcData, i, 14400000); // 4 hours

      triggers.push({
        timestamp: candle.t,
        price: candle.c,
        conditionsMet,
        priceAfter1h,
        priceAfter4h,
        changeAfter1h: priceAfter1h ? ((priceAfter1h - candle.c) / candle.c) * 100 : undefined,
        changeAfter4h: priceAfter4h ? ((priceAfter4h - candle.c) / candle.c) * 100 : undefined,
      });
    }
  }

  // 3. Calculate statistics
  const totalTriggers = triggers.length;
  const avgTriggersPerDay = calculateAvgTriggersPerDay(triggers, startDate, endDate);

  // 4. Performance by session/weekday
  const performanceBySession = calculateSessionPerformance(triggers);
  const performanceByWeekday = calculateWeekdayPerformance(triggers);

  // 5. Monthly trigger counts
  const triggersPerMonth = calculateMonthlyTriggers(triggers);

  return {
    config,
    ranAt: Date.now(),
    totalTriggers,
    avgTriggersPerDay,
    triggersPerMonth,
    triggers,
    performanceBySession,
    performanceByWeekday,
  };
}

/**
 * Find price at specific time offset
 */
function findPriceAfter(
  ohlc: OhlcPoint[],
  currentIndex: number,
  offsetMs: number
): number | undefined {
  const targetTime = ohlc[currentIndex].t + offsetMs;
  const found = ohlc.find(c => c.t >= targetTime);
  return found?.c;
}
```

**Integration Point:**
```typescript
// In AlertBacktestPanel.tsx
import { backtestAlertRule } from '@/lib/alerts/backtest';

async function handleBacktest() {
  const result = await backtestAlertRule(rule, {
    alertRuleId: rule.id,
    symbol: 'SOL',
    timeframe: '15m',
    startDate: Date.now() - 90 * 24 * 60 * 60 * 1000, // 90 days ago
    endDate: Date.now(),
    includePartialTriggers: false,
  });

  // Display result.totalTriggers, result.performanceBySession, etc.
}
```

---

## 📦 Teil 5: Alert Action Executor

### Datei: `src/lib/alerts/action-executor.ts`

**Purpose:** Execute actions when alert triggers.

**Imports:**
```typescript
import type {
  AlertRule,
  AlertAction,
  PushNotificationAction,
  CreateJournalEntryAction,
} from '@/types/confluence-alerts';
import { createJournalFromTransaction } from '@/lib/journal/auto-capture';
import { captureChartSnapshot } from '@/lib/chart/snapshot';
```

**Main Function:**
```typescript
/**
 * Execute all actions for triggered alert
 */
export async function executeAlertActions(
  rule: AlertRule,
  triggerData: {
    price: number;
    timestamp: number;
    conditionsMet: string[];
  }
): Promise<void> {
  for (const action of rule.actions) {
    if (!action.enabled) continue;

    try {
      switch (action.type) {
        case 'push-notification':
          await executePushNotification(action as PushNotificationAction, triggerData);
          break;
        case 'create-journal-entry':
          await executeCreateJournalEntry(action as CreateJournalEntryAction, rule, triggerData);
          break;
        case 'play-sound':
          await executePlaySound(action as PlaySoundAction);
          break;
        case 'webhook':
          await executeWebhook(action as WebhookAction, triggerData);
          break;
        case 'telegram':
          await executeTelegram(action as TelegramAction, triggerData);
          break;
        // ... more action types
        default:
          console.warn('[ActionExecutor] Unknown action type:', action.type);
      }
    } catch (error) {
      console.error('[ActionExecutor] Failed to execute action:', action.type, error);
    }
  }
}

/**
 * Execute push notification
 */
async function executePushNotification(
  action: PushNotificationAction,
  triggerData: any
): Promise<void> {
  // Use Web Push API or Service Worker
  if ('Notification' in window && Notification.permission === 'granted') {
    const notification = new Notification(action.title, {
      body: action.message,
      icon: '/icon-192.png',
      badge: '/icon-96.png',
      tag: `alert-${Date.now()}`,
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };
  } else {
    console.warn('[ActionExecutor] Notifications not permitted');
  }
}

/**
 * Execute create journal entry
 */
async function executeCreateJournalEntry(
  action: CreateJournalEntryAction,
  rule: AlertRule,
  triggerData: any
): Promise<void> {
  // Build thesis from confluence conditions
  const thesis = action.preFillThesis
    ? `[Alert] ${rule.name}\n\nConditions met:\n${triggerData.conditionsMet.map((c: string) => `- ${c}`).join('\n')}`
    : undefined;

  // Capture screenshot if enabled
  let screenshot: string | undefined;
  if (action.captureScreenshot) {
    screenshot = await captureChartSnapshot('SOL'); // TODO: Get from context
  }

  // Create journal entry
  const entry = await createEntry({
    ticker: 'ALERT',
    address: 'alert-signal',
    setup: 'custom',
    emotion: 'custom',
    status: 'active',
    timestamp: triggerData.timestamp,
    thesis,
    chartSnapshot: screenshot ? { screenshot } : undefined,
    customTags: ['alert', rule.name.toLowerCase()],
  });

  console.info('[ActionExecutor] Created journal entry from alert:', entry.id);

  // Prompt for emotions if enabled
  if (action.promptForEmotions) {
    // TODO: Show emotion rating dialog
  }
}

/**
 * Execute webhook
 */
async function executeWebhook(
  action: WebhookAction,
  triggerData: any
): Promise<void> {
  await fetch(action.url, {
    method: action.method,
    headers: {
      'Content-Type': 'application/json',
      ...action.headers,
    },
    body: action.body ? JSON.stringify({ ...triggerData, ...JSON.parse(action.body) }) : undefined,
  });
}
```

**Integration Point:**
```typescript
// In alert evaluation loop (background service)
import { executeAlertActions } from '@/lib/alerts/action-executor';

if (triggered) {
  await executeAlertActions(rule, {
    price: marketData.price,
    timestamp: Date.now(),
    conditionsMet: ['Price > 50000', 'Volume > 150% avg'],
  });
}
```

---

## 📦 Teil 6: Alert History Store

### Datei: `src/store/alertHistoryStore.ts`

**Purpose:** Track alert trigger history and performance.

**Code:**
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AlertTrigger, AlertPerformance } from '@/types/confluence-alerts';

interface AlertHistoryState {
  triggers: AlertTrigger[];

  // Actions
  addTrigger: (trigger: AlertTrigger) => void;
  updateTriggerOutcome: (triggerId: string, outcome: 'win' | 'loss' | 'breakeven', pnl: number) => void;
  updateTriggerFeedback: (triggerId: string, feedback: 'good' | 'bad' | 'neutral') => void;

  // Analytics
  getPerformanceForRule: (ruleId: string) => AlertPerformance | null;
  getTriggersForRule: (ruleId: string) => AlertTrigger[];
}

export const useAlertHistoryStore = create<AlertHistoryState>()(
  persist(
    (set, get) => ({
      triggers: [],

      addTrigger: (trigger) => {
        set((state) => ({
          triggers: [trigger, ...state.triggers].slice(0, 1000), // Keep last 1000
        }));
      },

      updateTriggerOutcome: (triggerId, outcome, pnl) => {
        set((state) => ({
          triggers: state.triggers.map((t) =>
            t.id === triggerId
              ? { ...t, outcome, pnl, pnlPercent: 0 } // Calculate pnlPercent if needed
              : t
          ),
        }));
      },

      updateTriggerFeedback: (triggerId, feedback) => {
        set((state) => ({
          triggers: state.triggers.map((t) =>
            t.id === triggerId ? { ...t, userFeedback: feedback } : t
          ),
        }));
      },

      getPerformanceForRule: (ruleId) => {
        const triggers = get().triggers.filter((t) => t.id.startsWith(ruleId));

        if (triggers.length === 0) return null;

        const withOutcome = triggers.filter((t) => t.outcome && t.outcome !== 'pending');
        const wins = withOutcome.filter((t) => t.outcome === 'win').length;
        const losses = withOutcome.filter((t) => t.outcome === 'loss').length;
        const winRate = withOutcome.length > 0 ? (wins / withOutcome.length) * 100 : 0;

        const totalPnl = withOutcome.reduce((sum, t) => sum + (t.pnl || 0), 0);
        const avgPnl = withOutcome.length > 0 ? totalPnl / withOutcome.length : 0;

        return {
          totalTriggers: triggers.length,
          avgTriggersPerDay: 0, // TODO: Calculate
          linkedJournalEntries: triggers.filter((t) => t.journalEntryId).length,
          winningTrades: wins,
          losingTrades: losses,
          winRate,
          avgPnl,
          totalPnl,
          expectancy: avgPnl, // Simplified
          hitRate: winRate,
          falsePositiveRate: 100 - winRate,
          triggers,
        };
      },

      getTriggersForRule: (ruleId) => {
        return get().triggers.filter((t) => t.id.startsWith(ruleId));
      },
    }),
    {
      name: 'sparkfined-alert-history-store',
    }
  )
);
```

---

## 🎨 Teil 7: UI Components

### 7.1 Wallet Connection Dialog

**Datei:** `src/components/wallet/WalletConnectionDialog.tsx`

**Purpose:** Dialog to connect up to 2 main wallets + 1 trading wallet.

**Props:**
```typescript
interface WalletConnectionDialogProps {
  isOpen: boolean;
  onClose: () => void;
}
```

**Implementation Hints:**
- Use Solana Wallet Adapter (`@solana/wallet-adapter-react`)
- Display 3 slots: Main Wallet 1, Main Wallet 2, Trading Wallet
- Show connected wallet address (shortened)
- Add label input for each wallet
- Store via `walletStore.connectWallet(address, provider, role, label)`

**Integration Point:**
```typescript
// In SettingsPageV2.tsx
import WalletConnectionDialog from '@/components/wallet/WalletConnectionDialog';

const [walletDialogOpen, setWalletDialogOpen] = useState(false);

<Button onClick={() => setWalletDialogOpen(true)}>
  Connect Wallets
</Button>

<WalletConnectionDialog
  isOpen={walletDialogOpen}
  onClose={() => setWalletDialogOpen(false)}
/>
```

---

### 7.2 Wallet Settings Panel

**Datei:** `src/components/wallet/WalletSettingsPanel.tsx`

**Purpose:** Settings for auto-journaling (min trade size, excluded tokens).

**Props:** None (reads from `walletStore`)

**UI Elements:**
- Toggle: Auto-Journal Enabled
- Number Input: Minimum Trade Size ($10-$1000)
- Token Exclusion List (add/remove)
- Toggle: Auto-Screenshot

**Integration Point:**
```typescript
// In SettingsPageV2.tsx
import WalletSettingsPanel from '@/components/wallet/WalletSettingsPanel';

<section>
  <h2>Wallet & Auto-Journaling</h2>
  <WalletSettingsPanel />
</section>
```

---

### 7.3 Journal Analytics Dashboard

**Datei:** `src/components/journal/JournalAnalyticsDashboard.tsx`

**Purpose:** Display advanced analytics (win rate, expectancy, breakdowns).

**Props:**
```typescript
interface JournalAnalyticsDashboardProps {
  analytics: AdvancedAnalyticsReport;
}
```

**UI Sections:**
1. **Overall Metrics** (KPI cards)
   - Win Rate, Total PnL, Expectancy, Profit Factor
   - Current Streak, Max Drawdown

2. **Breakdowns** (Tabs)
   - By Setup (bar chart + table)
   - By Emotion (bar chart + table)
   - By Session (bar chart + table)
   - By Weekday (bar chart)

3. **Equity Curve** (Line chart)

4. **Perfect Trader** (Comparison card)
   - Actual vs. Perfect PnL
   - Recommendations

**Integration Point:**
```typescript
// In JournalPageV2.tsx (add new tab or section)
import JournalAnalyticsDashboard from '@/components/journal/JournalAnalyticsDashboard';
import { calculateAdvancedAnalytics } from '@/lib/journal/analytics-engine';

const [analytics, setAnalytics] = useState<AdvancedAnalyticsReport | null>(null);

useEffect(() => {
  async function loadAnalytics() {
    const entries = await queryEntries({ status: 'all' });
    const result = await calculateAdvancedAnalytics(entries);
    setAnalytics(result);
  }
  loadAnalytics();
}, [entries]);

{analytics && <JournalAnalyticsDashboard analytics={analytics} />}
```

---

### 7.4 Alert Rule Builder

**Datei:** `src/components/alerts/AlertRuleBuilder.tsx`

**Purpose:** Visual drag-and-drop rule builder (Price AND Volume AND RSI...).

**Props:**
```typescript
interface AlertRuleBuilderProps {
  initialRule?: AlertRule;
  onSave: (rule: AlertRule) => void;
  onCancel: () => void;
}
```

**UI Structure:**
```
[Rule Name Input]

Conditions:
  ┌─────────────────────────────────────┐
  │ AND / OR (toggle)                   │
  ├─────────────────────────────────────┤
  │ ▶ Price > $50,000                   │ [Edit] [Delete]
  │ ▶ Volume > 150% of 20-bar avg       │ [Edit] [Delete]
  │ ▶ RSI < 30 (14-period, 15m)         │ [Edit] [Delete]
  ├─────────────────────────────────────┤
  │ [+ Add Condition]                   │
  └─────────────────────────────────────┘

Actions:
  ┌─────────────────────────────────────┐
  │ ✅ Push Notification                │ [Edit]
  │ ✅ Create Journal Entry              │ [Edit]
  │ ❌ Send Webhook                      │ [Edit]
  ├─────────────────────────────────────┤
  │ [+ Add Action]                      │
  └─────────────────────────────────────┘

Time Restrictions:
  ┌─────────────────────────────────────┐
  │ ⏰ Only during London Killzone       │ [Remove]
  ├─────────────────────────────────────┤
  │ [+ Add Restriction]                 │
  └─────────────────────────────────────┘

[Cancel] [Save Rule]
```

**Implementation Hints:**
- Use `AlertConditionEditor` component for each condition
- Use `AlertActionSelector` for actions
- Store rule via `alertsStore.addRule(rule)` or update existing

**Integration Point:**
```typescript
// In AlertsPageV2.tsx (new dialog/modal)
import AlertRuleBuilder from '@/components/alerts/AlertRuleBuilder';

const [ruleBuilderOpen, setRuleBuilderOpen] = useState(false);

<Button onClick={() => setRuleBuilderOpen(true)}>
  + Create Alert Rule
</Button>

{ruleBuilderOpen && (
  <AlertRuleBuilder
    onSave={(rule) => {
      alertsStore.addRule(rule);
      setRuleBuilderOpen(false);
    }}
    onCancel={() => setRuleBuilderOpen(false)}
  />
)}
```

---

### 7.5 Alert Backtest Panel

**Datei:** `src/components/alerts/AlertBacktestPanel.tsx`

**Purpose:** Run backtest on alert rule, display results.

**Props:**
```typescript
interface AlertBacktestPanelProps {
  rule: AlertRule;
}
```

**UI:**
```
Backtest Configuration:
  - Symbol: [SOL] [BTC] [ETH]
  - Timeframe: [5m] [15m] [1h]
  - Date Range: [Last 30 days] [Last 90 days] [Custom]

[Run Backtest]

Results:
  - Total Triggers: 47
  - Avg Triggers/Day: 1.2
  - Best Session: London (Win Rate: 68%)
  - Best Weekday: Tuesday (Win Rate: 72%)

[Chart: Triggers over time]
[Table: Individual trigger details]
```

**Integration Point:**
```typescript
// In AlertsPageV2.tsx or AlertDetailsPanel
import AlertBacktestPanel from '@/components/alerts/AlertBacktestPanel';

<Tabs>
  <Tab label="Overview">...</Tab>
  <Tab label="Backtest">
    <AlertBacktestPanel rule={activeRule} />
  </Tab>
</Tabs>
```

---

## 🔌 Integration in bestehende Pages

### JournalPageV2.tsx

**Änderungen:**
1. **Add Analytics Tab**
   ```typescript
   <Tabs>
     <Tab label="Entries">
       {/* Existing journal list */}
     </Tab>
     <Tab label="Analytics">
       <JournalAnalyticsDashboard analytics={analytics} />
     </Tab>
   </Tabs>
   ```

2. **Load Analytics on Mount**
   ```typescript
   useEffect(() => {
     async function loadAnalytics() {
       const entries = await queryEntries({ status: 'all' });
       const result = await calculateAdvancedAnalytics(entries);
       setAnalytics(result);
     }
     loadAnalytics();
   }, []);
   ```

3. **Show Template Selector in Create Dialog**
   ```typescript
   // In JournalNewEntryDialog
   import { JOURNAL_TEMPLATES } from '@/types/wallet-tracking';

   <Select label="Template">
     <option value="">No Template</option>
     {JOURNAL_TEMPLATES.map(tpl => (
       <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
     ))}
   </Select>
   ```

---

### AlertsPageV2.tsx

**Änderungen:**
1. **Extend alertsStore** with rule management
   ```typescript
   // In alertsStore.ts
   addRule: (rule: AlertRule) => void;
   updateRule: (ruleId: string, updates: Partial<AlertRule>) => void;
   deleteRule: (ruleId: string) => void;
   getRules: () => AlertRule[];
   ```

2. **Add Rule Builder Button**
   ```typescript
   <Button onClick={() => setRuleBuilderOpen(true)}>
     + Create Confluence Rule
   </Button>
   ```

3. **Add Backtest Tab in Alert Details**
   ```typescript
   <AlertBacktestPanel rule={activeRule} />
   ```

4. **Show Alert Performance in List**
   ```typescript
   // For each alert, display:
   // - Total triggers
   // - Win rate (if tracked)
   // - Last trigger time
   ```

---

### SettingsPageV2.tsx

**Änderungen:**
1. **Add Wallet Settings Section**
   ```typescript
   <section>
     <h2>Wallet & Auto-Journaling</h2>
     <WalletConnectionDialog />
     <WalletSettingsPanel />
   </section>
   ```

2. **Add Alert Settings Section**
   ```typescript
   <section>
     <h2>Alert Settings</h2>
     <Toggle label="Enable background alert evaluation" />
     <NumberInput label="Evaluation interval (seconds)" defaultValue={10} />
   </section>
   ```

---

## 🚀 Implementation Order (for Codex)

**Phase 1: Core Analytics (Priority: High)**
1. ✅ `src/lib/journal/analytics-engine.ts`
2. ✅ `src/lib/chart/snapshot.ts`
3. ✅ `src/components/journal/JournalAnalyticsDashboard.tsx`
4. ✅ Integrate analytics in `JournalPageV2.tsx`

**Phase 2: Wallet Integration (Priority: High)**
5. ✅ `src/components/wallet/WalletConnectionDialog.tsx`
6. ✅ `src/components/wallet/WalletSettingsPanel.tsx`
7. ✅ Integrate in `SettingsPageV2.tsx`
8. ✅ Test wallet connection + transaction monitoring

**Phase 3: Alert Confluence Engine (Priority: Medium)**
9. ✅ `src/store/alertHistoryStore.ts`
10. ✅ `src/lib/alerts/rule-builder.ts`
11. ✅ `src/lib/alerts/action-executor.ts`
12. ✅ `src/components/alerts/AlertRuleBuilder.tsx`
13. ✅ `src/components/alerts/AlertConditionEditor.tsx`
14. ✅ Integrate in `AlertsPageV2.tsx`

**Phase 4: Alert Backtesting (Priority: Low)**
15. ✅ `src/lib/alerts/backtest.ts`
16. ✅ `src/components/alerts/AlertBacktestPanel.tsx`
17. ✅ Integrate in `AlertsPageV2.tsx`

**Phase 5: Polish & Testing (Priority: Medium)**
18. ✅ Add Journal Templates UI
19. ✅ Add Emotion Rating Slider
20. ✅ Add Monte Carlo Simulation Panel
21. ✅ E2E tests for wallet connection → auto-journal flow
22. ✅ E2E tests for alert rule → trigger → action flow

---

## 📋 Checklists

### Analytics Implementation Checklist
- [ ] Implement `calculateOverallMetrics()`
- [ ] Implement `calculateSetupBreakdown()`
- [ ] Implement `calculateEmotionBreakdown()`
- [ ] Implement `calculateSessionBreakdown()`
- [ ] Implement `buildEquityCurve()`
- [ ] Implement `calculateMonthlyStats()`
- [ ] Implement `calculatePerfectTrader()`
- [ ] Create `JournalAnalyticsDashboard` component
- [ ] Create chart components (Setup Breakdown, Equity Curve)
- [ ] Integrate in `JournalPageV2.tsx`
- [ ] Test with real journal data

### Wallet Integration Checklist
- [ ] Install Solana Wallet Adapter packages
- [ ] Create `WalletConnectionDialog` component
- [ ] Create `WalletSettingsPanel` component
- [ ] Test wallet connection (Phantom, Solflare)
- [ ] Test transaction monitoring (mock or testnet)
- [ ] Test auto-journal creation from transaction
- [ ] Test setup detection on real trades
- [ ] Integrate in `SettingsPageV2.tsx`

### Alert Engine Checklist
- [ ] Implement `createAlertRule()`
- [ ] Implement `evaluateAlertRule()`
- [ ] Implement `evaluatePriceCondition()`
- [ ] Implement `evaluateVolumeCondition()`
- [ ] Implement `evaluateRSICondition()`
- [ ] Implement `executeAlertActions()`
- [ ] Create `alertHistoryStore.ts`
- [ ] Create `AlertRuleBuilder` component
- [ ] Create `AlertConditionEditor` component
- [ ] Create `AlertActionSelector` component
- [ ] Integrate in `AlertsPageV2.tsx`
- [ ] Test rule creation → evaluation → trigger → action

### Backtesting Checklist
- [ ] Implement `backtestAlertRule()`
- [ ] Implement historical OHLC fetching
- [ ] Implement session/weekday performance calculation
- [ ] Create `AlertBacktestPanel` component
- [ ] Create backtest results chart
- [ ] Integrate in `AlertsPageV2.tsx`
- [ ] Test with 90-day historical data

---

## 🔗 Dependencies & APIs

### New NPM Packages (may need install)
```bash
pnpm add html2canvas                    # Chart screenshot
pnpm add @solana/wallet-adapter-react   # Wallet connection
pnpm add @solana/wallet-adapter-wallets # Phantom, Solflare
pnpm add recharts                       # Charts (or use existing chart lib)
```

### External APIs
1. **Helius API** (Transaction monitoring)
   - Env: `VITE_HELIUS_API_KEY`
   - WebSocket: `wss://atlas-mainnet.helius-rpc.com?api-key=...`
   - Docs: https://docs.helius.dev/

2. **Jupiter Price API** (Token prices)
   - No key needed
   - Endpoint: `https://price.jup.ag/v4/price?ids=...`

3. **Birdeye/DexScreener** (Market data, OHLC)
   - Env: `VITE_BIRDEYE_API_KEY` (optional)
   - Endpoint: `https://public-api.birdeye.so/...`

---

## ✅ Acceptance Criteria

### Journal 2.0
- [ ] User can connect up to 2 main wallets + 1 trading wallet
- [ ] Transactions auto-create journal entries (buy/sell)
- [ ] Setup detection works for FVG, Orderblock, Liquidity Sweep
- [ ] Session detection shows London/NY/Asian + Killzones
- [ ] Analytics dashboard shows win rate by setup/session/emotion
- [ ] Equity curve chart displays correctly
- [ ] Perfect Trader comparison shows recommendations
- [ ] Export to JSON/CSV works

### Alerts 2.0
- [ ] User can create multi-condition alert (Price AND Volume AND RSI)
- [ ] Rule builder supports AND/OR logic
- [ ] Time restrictions work (only London Killzone, etc.)
- [ ] Alert triggers execute actions (push notification, journal entry)
- [ ] Alert history tracks trigger timestamps + outcomes
- [ ] Backtest shows historical trigger count + performance
- [ ] Alert performance dashboard shows win rate, false positive rate

---

## 📝 Hinweise für Codex

1. **Bestehende Patterns folgen:**
   - Use Zustand for state management
   - Use Dexie for persistence (IndexedDB)
   - Follow existing component structure (ui/, sections/, pages/)
   - Use TailwindCSS classes (bg-surface, text-text-primary, etc.)

2. **Type Safety:**
   - All new functions should be fully typed
   - No `any` without TODO comment
   - Import types from `@/types/...`

3. **Error Handling:**
   - Wrap async calls in try/catch
   - Log errors with console.error()
   - Show user-friendly error messages

4. **Performance:**
   - Use React.memo for expensive components
   - Debounce expensive calculations (analytics)
   - Lazy load heavy components

5. **Testing:**
   - Add unit tests for analytics functions
   - Add E2E tests for wallet → journal flow
   - Add E2E tests for alert → action flow

6. **Offline Support:**
   - All analytics should work offline (IndexedDB)
   - Alerts should queue when offline, execute when online
   - Chart snapshots should be stored locally

---

## 🎨 UI/UX Guidelines

1. **Dark Mode First:** All components should match existing dark theme
2. **Mobile Responsive:** Use Tailwind breakpoints (sm:, md:, lg:)
3. **Loading States:** Show spinners/skeletons while loading
4. **Empty States:** Show helpful messages when no data
5. **Error States:** Show retry buttons + error details
6. **Success Feedback:** Show toast notifications on success

---

## 📞 Support & Questions

Falls während der Implementierung Unklarheiten auftreten:

1. **Type Definitions:** Alle Types sind in `src/types/*.ts` dokumentiert
2. **Existing Patterns:** Siehe bestehende Stores (`journalStore.ts`, `alertsStore.ts`)
3. **Component Examples:** Siehe `src/components/journal/` für Journal-UI-Patterns
4. **Data Flow:** Siehe Architektur-Diagramme oben

**Wichtig:** Alle Dateipfade, Imports und Schnittstellen sind in diesem Dokument exakt spezifiziert. Codex kann direkt implementieren ohne Rückfragen.

---

**Ende des Handoff-Dokuments.**
