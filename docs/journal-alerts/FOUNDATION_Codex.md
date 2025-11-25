# 🏗️ Foundation Document – Codex Implementation

**Project:** Sparkfined PWA – Journal 2.0, Settings 2.0, Alerts 2.0
**Created:** 2025-11-25
**Architect:** Claude (Structure & Skeleton)
**Implementer:** Codex (Full Implementation & Polish)

---

## 🎯 Purpose

This document provides **complete structural specifications** for Codex to implement Journal 2.0, Settings 2.0, and Alerts 2.0. All architectural decisions have been made, components are scaffolded, and props are defined. Codex can now **focus on implementation and refinement** without structural concerns.

---

## 📋 Summary of Work Done

### ✅ Journal 2.0 – Analytics & Snapshot

**What was built:**
- `src/components/ui/Tabs.tsx` – Reusable tabs component
- `src/components/journal/JournalAnalyticsDashboard.tsx` – Analytics skeleton
- `src/pages/JournalPageV2.tsx` – Extended with Analytics tab
- `src/components/journal/JournalDetailPanel.tsx` – Added snapshot button

**What Codex needs to implement:**
- `src/lib/journal/analytics-engine.ts` – Full analytics calculation logic
- `src/lib/chart/snapshot.ts` – Chart screenshot capture utility
- Chart components (Equity Curve, Setup Breakdown charts)
- Wire up analytics loading in `JournalPageV2`

---

### ✅ Settings 2.0 – Wallet-UI

**What was built:**
- `src/components/settings/WalletConnectionSection.tsx` – Wallet management UI
- `src/components/settings/WalletSettingsPanel.tsx` – Auto-journal settings
- `src/pages/SettingsPageV2.tsx` – Extended with Wallet tab

**What Codex needs to implement:**
- Solana Wallet Adapter integration in `WalletConnectionSection`
- Wallet connect/disconnect logic
- Access tier badge (if NFT checking is implemented)

---

### ✅ Alerts 2.0 – RuleBuilder & Backtest

**What was built:**
- `src/store/alertHistoryStore.ts` – Alert trigger history store
- `src/components/alerts/AlertRuleBuilder.tsx` – Rule builder skeleton
- `src/components/alerts/AlertBacktestPanel.tsx` – Backtest panel skeleton
- `src/pages/AlertsPageV2.tsx` – Extended with Builder/Backtest/History tabs

**What Codex needs to implement:**
- `src/lib/alerts/rule-builder.ts` – Rule evaluation logic
- `src/lib/alerts/backtest.ts` – Backtesting engine
- `src/lib/alerts/action-executor.ts` – Alert action executor
- Condition editor UI (Price, Volume, RSI, FVG, etc.)
- Action selector UI
- Time restriction selector UI
- Backtest chart & trigger table

---

## 🌲 Component Trees

### JournalPageV2 Component Tree

```
JournalPageV2
├── DashboardShell
│   ├── JournalHeaderActions
│   │   └── Snapshot button (TODO: Wire up snapshot logic)
│   └── Tabs
│       ├── TabsList
│       │   ├── TabsTrigger ("Entries")
│       │   └── TabsTrigger ("Analytics")
│       ├── TabsContent ("entries")
│       │   └── JournalLayout
│       │       ├── JournalList (Left panel)
│       │       └── JournalDetailPanel (Right panel)
│       │           └── Snapshot button (TODO: Wire up)
│       └── TabsContent ("analytics")
│           └── JournalAnalyticsDashboard
│               ├── MetricCard (Win Rate, PnL, Expectancy, Profit Factor)
│               ├── BreakdownCard (By Setup, Emotion, Session)
│               ├── Equity Curve (TODO: Chart component)
│               └── Perfect Trader Comparison
└── JournalNewEntryDialog
```

**Data Flow:**
```
journalStore.entries
  ↓
calculateAdvancedAnalytics() [TODO: Implement in analytics-engine.ts]
  ↓
AdvancedAnalyticsReport
  ↓
JournalAnalyticsDashboard (displays metrics)
```

**Key Props:**

```typescript
// JournalAnalyticsDashboard.tsx
type JournalAnalyticsDashboardProps = {
  analytics: AdvancedAnalyticsReport | null;
  isLoading?: boolean;
};

// JournalDetailPanel.tsx (snapshot button)
// TODO Codex: Wire up captureChartSnapshot() from @/lib/chart/snapshot.ts
onClick={() => captureChartSnapshot(entry.tokenAddress, entry.timestamp)}
```

---

### SettingsPageV2 Component Tree

```
SettingsPageV2
├── DashboardShell
│   └── Tabs
│       ├── TabsList
│       │   ├── TabsTrigger ("General")
│       │   ├── TabsTrigger ("Wallet & Auto-Journal")
│       │   └── TabsTrigger ("Alerts")
│       ├── TabsContent ("general")
│       │   └── SettingsPage (existing)
│       ├── TabsContent ("wallet")
│       │   ├── WalletConnectionSection
│       │   │   ├── WalletSlot (Main 1) [TODO: Wallet Adapter]
│       │   │   ├── WalletSlot (Main 2)
│       │   │   └── WalletSlot (Trading)
│       │   └── WalletSettingsPanel
│       │       ├── Auto-Journal Enabled (Toggle)
│       │       ├── Min Trade Size (Input)
│       │       ├── Auto Snapshot (Toggle)
│       │       └── Excluded Tokens (List + Input)
│       └── TabsContent ("alerts")
│           └── TODO: Alert settings (evaluation interval, etc.)
```

**Data Flow:**
```
walletStore.wallets / walletStore.settings
  ↓
WalletConnectionSection / WalletSettingsPanel
  ↓
User interactions
  ↓
walletStore actions (connectWallet, updateSettings, etc.)
```

**Key Props:**

```typescript
// WalletConnectionSection.tsx
// TODO Codex: Implement Solana Wallet Adapter integration
// Use @solana/wallet-adapter-react for Phantom, Solflare, Backpack

// WalletSettingsPanel.tsx
// All state is in walletStore.settings
const { settings, updateSettings } = useWalletStore();
```

---

### AlertsPageV2 Component Tree

```
AlertsPageV2
├── DashboardShell
│   └── Tabs
│       ├── TabsList
│       │   ├── TabsTrigger ("Active Alerts")
│       │   ├── TabsTrigger ("Rule Builder")
│       │   ├── TabsTrigger ("Backtest")
│       │   └── TabsTrigger ("History")
│       ├── TabsContent ("active")
│       │   └── AlertsLayout
│       │       ├── AlertsList (Left panel)
│       │       └── AlertsDetailPanel (Right panel)
│       ├── TabsContent ("builder")
│       │   └── AlertRuleBuilder
│       │       ├── Rule Name / Description
│       │       ├── Conditions (TODO: AlertConditionEditor)
│       │       ├── Actions (TODO: AlertActionSelector)
│       │       └── Time Restrictions (TODO: TimeRestrictionSelector)
│       ├── TabsContent ("backtest")
│       │   └── AlertBacktestPanel
│       │       ├── Backtest Config (Symbol, Timeframe, Date Range)
│       │       ├── Run Backtest Button
│       │       └── Results (TODO: Chart + Table)
│       └── TabsContent ("history")
│           └── AlertTriggerHistoryList (TODO: Implement)
```

**Data Flow:**
```
AlertRule (created in AlertRuleBuilder)
  ↓
alertsStore.addRule()
  ↓
Background evaluation loop (TODO: Implement in background service)
  ↓
evaluateAlertRule() [TODO: Implement in rule-builder.ts]
  ↓
Trigger detected → executeAlertActions() [TODO: Implement in action-executor.ts]
  ↓
alertHistoryStore.addTrigger()
  ↓
AlertTriggerHistoryList (displays triggers)
```

**Key Props:**

```typescript
// AlertRuleBuilder.tsx
type AlertRuleBuilderProps = {
  initialRule?: AlertRule;
  onSave: (rule: AlertRule) => void;
  onCancel: () => void;
};

// AlertBacktestPanel.tsx
type AlertBacktestPanelProps = {
  rule: AlertRule;
};

// TODO Codex: Implement backtestAlertRule() from @/lib/alerts/backtest.ts
```

---

## 🔗 Data Flow Diagrams

### Journal 2.0 – Auto-Capture Flow

```
Wallet Transaction (Helius WebSocket)
  ↓
parseTransaction() → MonitoredTransaction
  ↓
detectSetup() [src/lib/analysis/setup-detector.ts]
detectSession() [src/lib/analysis/session-detector.ts]
  ↓
createJournalFromTransaction() [src/lib/journal/auto-capture.ts]
  ↓
captureChartSnapshot() [TODO: Implement in src/lib/chart/snapshot.ts]
  ↓
createEntry() → Dexie (IndexedDB)
  ↓
journalStore updates → UI refreshes
  ↓
calculateAdvancedAnalytics() [TODO: Implement]
  ↓
JournalAnalyticsDashboard
```

### Settings 2.0 – Wallet Connect Flow

```
User clicks "Connect Wallet"
  ↓
WalletConnectionSection opens dialog
  ↓
TODO Codex: Solana Wallet Adapter
  ↓
walletStore.connectWallet(address, provider, role, label)
  ↓
WalletSlot displays connected wallet
  ↓
User configures Auto-Journal settings
  ↓
walletStore.updateSettings({ autoJournalEnabled, minTradeSize, ... })
  ↓
Settings persisted to localStorage (Zustand persist)
```

### Alerts 2.0 – Rule → Trigger → Action Flow

```
User creates alert rule (AlertRuleBuilder)
  ↓
createAlertRule() [TODO: Implement in rule-builder.ts]
  ↓
alertsStore.addRule(rule)
  ↓
Background evaluation (interval: 5-60s)
  ↓
evaluateAlertRule(rule, marketData) [TODO: Implement]
  ↓
Conditions met? → triggerAlert()
  ↓
alertHistoryStore.addTrigger()
  ↓
executeAlertActions(rule, triggerData) [TODO: Implement in action-executor.ts]
  - Push notification
  - Create journal entry
  - Send webhook
  - Telegram/Discord
```

---

## 🛠️ Implementation Checklist for Codex

### Phase 1: Journal 2.0 Analytics (Priority: High)

- [ ] **`src/lib/journal/analytics-engine.ts`**
  - [ ] Implement `calculateAdvancedAnalytics(entries): Promise<AdvancedAnalyticsReport>`
  - [ ] Implement `calculateOverallMetrics(entries): PerformanceMetrics`
  - [ ] Implement `calculateSetupBreakdown(entries): SetupBreakdown[]`
  - [ ] Implement `calculateEmotionBreakdown(entries): EmotionBreakdown[]`
  - [ ] Implement `calculateSessionBreakdown(entries): SessionBreakdown[]`
  - [ ] Implement `buildEquityCurve(entries): EquityPoint[]`
  - [ ] Implement `calculateMonthlyStats(entries): MonthlyStats[]`
  - [ ] Implement `calculatePerfectTrader(...): PerfectTraderComparison`

- [ ] **`src/lib/chart/snapshot.ts`**
  - [ ] Install `html2canvas` (or use Lightweight Charts built-in screenshot)
  - [ ] Implement `captureChartSnapshot(tokenAddress, timestamp): Promise<string | null>`
  - [ ] Add `data-chart-canvas` attribute to chart container

- [ ] **Wire up in `JournalPageV2.tsx`**
  - [ ] Uncomment analytics loading useEffect
  - [ ] Import `calculateAdvancedAnalytics`
  - [ ] Handle loading/error states

- [ ] **Chart Components (Optional – can use placeholder text)**
  - [ ] EquityCurveChart.tsx (line chart)
  - [ ] SetupBreakdownChart.tsx (bar chart)

---

### Phase 2: Settings 2.0 Wallet Integration (Priority: High)

- [ ] **Solana Wallet Adapter**
  - [ ] Install packages: `@solana/wallet-adapter-react`, `@solana/wallet-adapter-wallets`
  - [ ] Wrap app with `WalletProvider`
  - [ ] Implement wallet connect/disconnect in `WalletConnectionSection`

- [ ] **WalletConnectionDialog (Full Implementation)**
  - [ ] Replace placeholder with actual wallet adapter buttons
  - [ ] Handle Phantom, Solflare, Backpack
  - [ ] Store connected wallet in `walletStore`

- [ ] **AccessTierBadge (Optional – if NFT checking is implemented)**
  - [ ] Display user access tier (Free, NFT Holder, Premium)

---

### Phase 3: Alerts 2.0 Confluence Engine (Priority: Medium)

- [ ] **`src/lib/alerts/rule-builder.ts`**
  - [ ] Implement `createAlertRule(...): AlertRule`
  - [ ] Implement `evaluateAlertRule(rule, marketData): Promise<boolean>`
  - [ ] Implement `evaluateConditionGroup(...): boolean`
  - [ ] Implement `evaluateCondition(...): boolean`
  - [ ] Implement `evaluatePriceCondition(...): boolean`
  - [ ] Implement `evaluateVolumeCondition(...): boolean`
  - [ ] Implement `evaluateRSICondition(...): boolean`
  - [ ] Implement `checkTimeRestrictions(...): boolean`

- [ ] **`src/lib/alerts/action-executor.ts`**
  - [ ] Implement `executeAlertActions(rule, triggerData): Promise<void>`
  - [ ] Implement `executePushNotification(...): Promise<void>`
  - [ ] Implement `executeCreateJournalEntry(...): Promise<void>`
  - [ ] Implement `executePlaySound(...): Promise<void>`
  - [ ] Implement `executeWebhook(...): Promise<void>`
  - [ ] Implement `executeTelegram(...): Promise<void>` (optional)

- [ ] **AlertConditionEditor Component**
  - [ ] UI for adding/editing conditions
  - [ ] Support Price, Volume, RSI, MACD, EMA, FVG, Orderblock, Liquidity

- [ ] **AlertActionSelector Component**
  - [ ] UI for selecting actions
  - [ ] Configure each action type

- [ ] **TimeRestrictionSelector Component**
  - [ ] UI for time restrictions (Session, Killzone, Weekday, Custom Range)

- [ ] **Wire up in AlertRuleBuilder**
  - [ ] Build AlertRule object from UI state
  - [ ] Call `onSave` with complete rule

---

### Phase 4: Alerts 2.0 Backtesting (Priority: Low)

- [ ] **`src/lib/alerts/backtest.ts`**
  - [ ] Implement `backtestAlertRule(rule, config): Promise<BacktestResult>`
  - [ ] Fetch historical OHLC data
  - [ ] Evaluate rule on each candle
  - [ ] Calculate session/weekday performance
  - [ ] Calculate monthly trigger counts

- [ ] **AlertBacktestPanel (Full Implementation)**
  - [ ] Wire up actual backtest logic (uncomment TODO)
  - [ ] Implement BacktestResultChart (triggers over time)
  - [ ] Implement BacktestTriggerTable (individual triggers)

- [ ] **AlertTriggerHistoryList Component**
  - [ ] Display triggers from `alertHistoryStore`
  - [ ] Show timestamp, price, outcome, journal link
  - [ ] User feedback (good/bad/neutral)

---

### Phase 5: Polish & Testing (Priority: Medium)

- [ ] **Journal Templates UI**
  - [ ] Add template selector in `JournalNewEntryDialog`
  - [ ] Use `JOURNAL_TEMPLATES` from `wallet-tracking.ts`

- [ ] **Emotion Rating Slider**
  - [ ] Add emotion rating UI in journal entry dialog
  - [ ] Use `EmotionRating` type

- [ ] **Monte Carlo Simulation Panel (Optional)**
  - [ ] Implement Monte Carlo simulation in `analytics-engine.ts`
  - [ ] Add UI in `JournalAnalyticsDashboard`

- [ ] **E2E Tests**
  - [ ] Wallet connect → Auto-journal flow
  - [ ] Alert rule → Trigger → Action flow
  - [ ] Analytics calculation

---

## 📝 Key TODO Comments for Codex

**Search for these comments in the codebase:**

```bash
# Journal 2.0
grep -r "TODO Codex.*analytics" src/
grep -r "TODO Codex.*snapshot" src/

# Settings 2.0
grep -r "TODO Codex.*Wallet" src/
grep -r "TODO Codex.*Solana" src/

# Alerts 2.0
grep -r "TODO Codex.*rule-builder" src/
grep -r "TODO Codex.*backtest" src/
grep -r "TODO Codex.*AlertConditionEditor" src/
```

**All TODO comments follow this pattern:**
```typescript
// TODO Codex: <Clear instruction for what to implement>
```

---

## 🎨 Design System (Reference)

**Colors:**
- `text-text-primary` – Primary text color
- `text-text-secondary` – Secondary text color
- `text-text-tertiary` – Tertiary text color
- `bg-surface` – Surface background
- `bg-surface-elevated` – Elevated surface
- `border-border` – Default border color
- `border-border-subtle` – Subtle border color
- `text-sentiment-bull` – Positive/bullish color (green)
- `text-sentiment-bear` – Negative/bearish color (red)
- `text-brand` – Brand color (accent)

**Layout:**
- Use `Card` component from `@/components/ui/Card` for containers
- Use `Button` component from `@/components/ui/Button` for actions
- Use `Input`, `Select`, `Textarea` from `@/components/ui/` for form controls

**Spacing:**
- `space-y-4` – Vertical spacing between sections
- `gap-4` – Gap in flex/grid layouts
- `p-4` – Padding (adjust as needed)

---

## 🚀 Getting Started for Codex

1. **Install dependencies:**
   ```bash
   pnpm install html2canvas @solana/wallet-adapter-react @solana/wallet-adapter-wallets
   ```

2. **Start implementation in order:**
   - Phase 1 (Journal Analytics) first – highest value
   - Phase 2 (Wallet) next – needed for auto-journal
   - Phase 3 (Alerts) after – complex but well-structured
   - Phase 4 (Backtest) last – nice-to-have

3. **Run type checker frequently:**
   ```bash
   pnpm run typecheck
   ```

4. **Test in browser:**
   ```bash
   pnpm run dev
   ```

5. **Focus on TODO comments** – all critical implementation points are marked

---

## 📞 Questions?

If anything is unclear:
1. Check `HANDOFF.md` for full type definitions
2. Check `.rulesync/` for architecture rules
3. Check existing implementations for patterns (e.g., `journalStore.ts`, `walletStore.ts`)
4. All types are in `src/types/` (wallet-tracking.ts, analytics-v2.ts, confluence-alerts.ts)

**Good luck, Codex! 🚀**

---

**End of Foundation Document**
