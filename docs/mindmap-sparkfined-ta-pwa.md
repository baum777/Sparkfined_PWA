# 🧠 Mindmap – Sparkfined TA-PWA

> **Comprehensive System Overview**  
> **Created:** 2025-11-13  
> **Purpose:** High-level mental model of the entire Sparkfined PWA system

---

```
                           ╔═══════════════════════════════════╗
                           ║   SPARKFINED TA-PWA (ROOT)        ║
                           ║   Offline-First Trading Command   ║
                           ║   Center for Crypto Traders       ║
                           ╚═══════════════════════════════════╝
                                          │
                 ┌────────────────────────┼────────────────────────┐
                 │                        │                        │
      ┌──────────▼──────────┐  ┌─────────▼─────────┐  ┌──────────▼──────────┐
      │  1. Zielbild &      │  │  2. Layered       │  │  3. Module &        │
      │     Vision          │  │     Analysis      │  │     UX-Flows        │
      └─────────────────────┘  └───────────────────┘  └─────────────────────┘
                 │                        │                        │
      ┌──────────▼──────────┐  ┌─────────▼─────────┐  ┌──────────▼──────────┐
      │  4. System-         │  │  5. Implementierungs│ │  6. Events &        │
      │     Architektur     │  │     -Roadmap       │  │     Telemetrie      │
      └─────────────────────┘  └───────────────────┘  └─────────────────────┘
                                         │
                              ┌──────────▼──────────┐
                              │  7. Erweiterungen & │
                              │     Ideen           │
                              └─────────────────────┘
```

---

## 1. 🎯 Zielbild & Vision

### 1.1 Core Vision
```
Sparkfined TA-PWA
├── Mission
│   ├── Offline-First Trading Command Center
│   ├── Self-Improvement through Journaling
│   ├── AI-Powered Market Insights
│   └── Crypto-Native Access Control
│
├── Target Users
│   ├── Crypto Day-Traders
│   ├── Swing Traders
│   ├── Meme-Coin Hunters
│   └── Self-Improvement Oriented Traders
│
└── Value Propositions
    ├── ✅ Works Offline (Journal, Charts, Watchlist)
    ├── 🤖 AI-Powered (OpenAI + Grok Dual-Provider)
    ├── 📊 Trading Journal with Lessons-Learned
    ├── 🔐 Solana Wallet-Based Access Gating
    └── 📱 PWA (iOS, Android, Desktop)
```

### 1.2 Differentiators
```
vs. TradingView
├── Offline-First (TradingView requires internet)
├── AI Journal Analysis (TradingView has no journaling)
└── Crypto-Native (Solana Wallet Integration)

vs. Notion/Trading Journals
├── Integrated Market Data (Notion is generic)
├── Technical Analysis Tools (no separate tools needed)
└── Real-Time Alerts (Notion has no alerts)

vs. Centralized Platforms
├── Decentralized Access (Wallet-based, no email/password)
└── Privacy-First (data stays in IndexedDB)
```

### 1.3 Success Metrics (KPIs)
```
User Engagement
├── Daily Active Users (DAU)
├── Journal Entries per User per Week
├── Average Session Duration
└── PWA Installation Rate

Technical Performance
├── Offline Success Rate (>95%)
├── Bundle Size (<400KB)
├── Time to Interactive (<2s)
└── Service Worker Cache Hit Rate (>80%)

Business Metrics
├── User Retention (30-day, 90-day)
├── AI Cost per User (<$1/month)
└── Feature Adoption (Journal, Alerts, Board)
```

---

## 2. 📊 Layered Analysis Model

### 2.1 5-Layer Architecture
```
┌─────────────────────────────────────────────────────────┐
│ Layer 5: UI (Pages, Sections, Components)              │
│          React 18.3, TailwindCSS 4.1, Dark-Mode         │
├─────────────────────────────────────────────────────────┤
│ Layer 4: State & Hooks (Zustand, Context, Hooks)       │
│          Global State, Feature State, Custom Hooks     │
├─────────────────────────────────────────────────────────┤
│ Layer 3: Persistence (Dexie/IndexedDB)                 │
│          Offline Storage, Sync Queue, Cache             │
├─────────────────────────────────────────────────────────┤
│ Layer 2: Backend (Vercel Edge Functions)               │
│          Serverless APIs, Secret Management, Proxies    │
├─────────────────────────────────────────────────────────┤
│ Layer 1: External Services (Moralis, OpenAI, etc.)     │
│          Market Data, AI Models, On-Chain Data          │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Data Flow
```
User Action
    │
    ▼
UI Component (Layer 5)
    │
    ├── Local State? → useState
    │
    ├── Feature State? → Context/Zustand (Layer 4)
    │
    ├── Persistence? → Dexie (Layer 3)
    │       │
    │       ├── Offline: Save to IndexedDB
    │       └── Online: Sync Queue
    │
    └── API Call? → Backend Proxy (Layer 2)
            │
            └── External Service (Layer 1)
                    │
                    └── Response → Cache → UI Update
```

### 2.3 State Management Strategy
```
State Types
├── 1. Local State (useState)
│   ├── Form inputs
│   ├── Modal open/close
│   └── Component-specific toggles
│
├── 2. React Context
│   ├── AI Provider Settings
│   ├── Theme/Settings
│   └── Feature-scoped state
│
└── 3. Zustand (Global State)
    ├── Access Status (wallet, NFT-check)
    ├── User Preferences
    └── Cross-feature shared state
```

---

## 3. 🧩 Module & UX-Flows

### 3.1 Core Modules (7 Domains) — VOLLSTÄNDIG AUFGESCHLÜSSELT

```
Sparkfined Modules
│
├── 1. Market Data
│   ├── OHLC Charts (Candlestick, Line, Area)
│   │   ├── Data-Sources: DexPaprika (primary), Dexscreener (fallback), Moralis
│   │   ├── Timeframes: 1m, 5m, 15m, 1h, 4h, 1d, 1w
│   │   ├── Offline-Capable: Cached-OHLC (last 1000 candles)
│   │   └── Update-Strategy: Polling (5s), WebSocket (planned Q1 2025)
│   │
│   ├── Token Prices (Real-time, Historical)
│   │   ├── Adapters: priceAdapter.ts (multi-source-orchestration)
│   │   ├── Sources: Moralis, DexPaprika, Dexscreener, Pumpfun
│   │   └── Caching: 5s-TTL (in-memory), 1h-TTL (IndexedDB)
│   │
│   ├── Volume Analysis
│   │   ├── 24h-Volume, 7d-Volume, Volume-Change%
│   │   ├── Volume-Profile (Price-Levels, High-Volume-Nodes)
│   │   └── Order-Flow-Analysis (orderflow.ts)
│   │
│   └── On-Chain Metrics (TVL, Holders, Transactions)
│       ├── Moralis-API: Token-Holders, Transfers, TVL
│       ├── Solscan-Whale-Alerts (Top-10-Wallets)
│       ├── Wallet-Flow-Tracking (walletFlow.ts)
│       └── Wallet-Monitor-Service (walletMonitor.ts)
│
├── 2. Technical Analysis (TA)
│   ├── Indicators (DETAILLIERT)
│   │   ├── RSI (Relative Strength Index)
│   │   │   ├── Calculation: 100 - (100 / (1 + RS)), RS = AvgGain / AvgLoss
│   │   │   ├── Period: 14 (default), configurable 7-21
│   │   │   ├── Thresholds: <30 Oversold, >70 Overbought
│   │   │   ├── Signals: Divergence (Bullish/Bearish), Overbought/Oversold
│   │   │   └── Implementation: src/sections/chart/indicators.ts
│   │   │
│   │   ├── EMA/SMA (Exponential/Simple Moving Averages)
│   │   │   ├── Periods: 9, 21, 50, 200 (configurable)
│   │   │   ├── Calculation: SMA = Sum(Close) / N, EMA = (Close - EMA_prev) * (2/(N+1)) + EMA_prev
│   │   │   ├── Signals: Golden-Cross (50 > 200), Death-Cross (50 < 200)
│   │   │   └── Crossovers: 9/21, 21/50, 50/200
│   │   │
│   │   ├── MACD (Moving Average Convergence Divergence)
│   │   │   ├── Calculation: MACD = EMA12 - EMA26, Signal = EMA9(MACD), Histogram = MACD - Signal
│   │   │   ├── Signals: Zero-Line-Cross, Signal-Line-Cross, Divergence
│   │   │   ├── Thresholds: Histogram > 0 Bullish, < 0 Bearish
│   │   │   └── Implementation: src/sections/chart/indicators.ts
│   │   │
│   │   ├── Bollinger Bands
│   │   │   ├── Calculation: Middle = SMA20, Upper = SMA20 + (2 * StdDev), Lower = SMA20 - (2 * StdDev)
│   │   │   ├── Signals: Squeeze (Bands-Narrow), Expansion (Bands-Wide), Breakout (Close > Upper)
│   │   │   ├── Width: (Upper - Lower) / Middle (volatility-indicator)
│   │   │   └── Implementation: src/sections/chart/indicators.ts
│   │   │
│   │   ├── Fibonacci Retracements
│   │   │   ├── Levels: 0%, 23.6%, 38.2%, 50%, 61.8%, 78.6%, 100%
│   │   │   ├── Calculation: Level = High - ((High - Low) * FibRatio)
│   │   │   ├── Usage: Support/Resistance, Entry/Exit-Points
│   │   │   └── Drawing-Tools: src/sections/chart/draw/
│   │   │
│   │   └── Volume-Weighted (Planned Q2 2025)
│   │       ├── VWAP (Volume-Weighted-Average-Price)
│   │       └── Volume-Profile (High-Volume-Nodes)
│   │
│   ├── Chart Types
│   │   ├── Candlestick (default)
│   │   ├── Line (simplified, mobile-friendly)
│   │   ├── Area (gradient-fill)
│   │   └── Heikin-Ashi (smoothed-candlesticks, planned Q2 2025)
│   │
│   ├── Drawing Tools (src/sections/chart/draw/)
│   │   ├── Trendlines (Drag-to-Draw, Snap-to-Price)
│   │   ├── Horizontal Lines (Support/Resistance)
│   │   ├── Rectangles (Range-Boxes)
│   │   ├── Fibonacci (Auto-Levels)
│   │   ├── Annotations (Text-Labels)
│   │   └── Hit-Detection (hit.ts, Click-to-Edit)
│   │
│   └── Backtest-Module (backtest.ts, BacktestPanel.tsx)
│       ├── Strategy-Backtesting (Test-Indicators on Historical-Data)
│       ├── P&L-Calculation (Realized/Unrealized)
│       ├── Metrics: Winrate, Sharpe-Ratio, Max-Drawdown
│       └── Export-Results (CSV, JSON)
│
├── 3. Meme Trading (12 Signals, 6 Combos, 8 Solana-Strategies)
│   ├── 12 Core-Signals
│   │   ├── 1. Wallet-Accumulation (Top-10-Wallets buying, >5% total-supply)
│   │   ├── 2. Volume-Spike (>3x 24h-avg, sustained >1h)
│   │   ├── 3. Social-Mentions (Twitter, Reddit, Telegram growth >50%)
│   │   ├── 4. Holder-Distribution (No whale >10%, >1000 holders)
│   │   ├── 5. Liquidity-Depth (>$100k pool-size, <5% price-impact)
│   │   ├── 6. Price-Action (New-ATH, Breakout from consolidation)
│   │   ├── 7. Developer-Activity (GitHub-Commits, Contract-Updates)
│   │   ├── 8. Community-Engagement (Discord-Activity, Reactions >100/day)
│   │   ├── 9. Influencer-Shills (Tracked-Influencer mentions, >10k followers)
│   │   ├── 10. Launch-Timing (Favorable-Market-Conditions, BTC-stable)
│   │   ├── 11. Contract-Audit (Rugcheck-Pass, Honeypot-Scan-Pass)
│   │   └── 12. Token-Unlock-Schedule (No-Cliff-Unlocks, <10% circulating)
│   │
│   ├── 6 Confluence-Combos
│   │   ├── 1. Whale-Watch (Signal 1 + 2: Wallet-Accumulation + Volume-Spike)
│   │   ├── 2. Social-Momentum (Signal 3 + 8: Social-Mentions + Community-Engagement)
│   │   ├── 3. Launch-Perfect (Signal 10 + 5 + 11: Launch-Timing + Liquidity + Audit)
│   │   ├── 4. Breakout-Confluence (Signal 6 + 2 + 3: Price-Action + Volume + Social)
│   │   ├── 5. Dev-Active (Signal 7 + 8: Developer-Activity + Community-Engagement)
│   │   └── 6. Influencer-Pump (Signal 9 + 2: Influencer-Shills + Volume-Spike)
│   │
│   ├── 8 Top Solana-Strategies
│   │   ├── 1. Raydium-Liquidity-Snipe (Front-Run-New-Pools, <5min after launch)
│   │   ├── 2. Jupiter-Aggregator-Arbitrage (Cross-DEX-Price-Diff, >1% spread)
│   │   ├── 3. Pump.fun-Launch-Tracker (Track-New-Launches, pumpfunAdapter.ts)
│   │   ├── 4. Solscan-Whale-Alert (Monitor-Top-Wallets, >1M SOL)
│   │   ├── 5. Magic-Eden-NFT-Correlation (NFT-Project-Token-Pump, >50% floor-price-increase)
│   │   ├── 6. Marinade-stSOL-Yield (Liquid-Staking-Yield-Farming, 6-8% APY)
│   │   ├── 7. Orca-Whirlpool-LP (Concentrated-Liquidity-Farming, high-fee-tiers)
│   │   └── 8. Backpack-Gang-Gating (Community-Token-Gating, NFT-based-access)
│   │
│   ├── Wallet Tracking (walletMonitor.ts, walletFlow.ts)
│   │   ├── Top-10-Wallets (Solana-Whales, >1M SOL)
│   │   ├── Wallet-Flow-Tracking (Inflows, Outflows, Net-Change)
│   │   ├── Wallet-Alerts (Webhook-based, wallet/webhook.ts)
│   │   └── Wallet-Monitor-Service (Real-time-tracking, polling 10s)
│   │
│   ├── Social Sentiment Analysis (socialHeuristics.ts, ai/orchestrator.ts)
│   │   ├── Twitter-Mentions (Track-Keywords, @mentions)
│   │   ├── Reddit-Activity (r/cryptocurrency, r/solana)
│   │   ├── Telegram-Group-Activity (Message-Count, Active-Users)
│   │   ├── AI-Sentiment-Score (Grok-Powered, -1 to +1)
│   │   └── Influencer-Tracking (Monitored-List, >10k followers)
│   │
│   ├── GT Score (Good-Trade Score, analysis/heuristic.ts)
│   │   ├── Calculation: Weighted-Score (0-100) based on 12 Signals
│   │   ├── Thresholds: <30 Avoid, 30-60 Neutral, 60-80 Good, >80 Excellent
│   │   ├── Factors: Liquidity (20%), Volume (15%), Social (15%), Wallet (15%), etc.
│   │   └── Update-Frequency: Every 5min (cached, re-calc on-demand)
│   │
│   └── Degen Metrics (Rug-Risk, Holder-Distribution)
│       ├── Rug-Risk-Score (0-100, based on Contract-Audit, Liquidity-Lock)
│       ├── Holder-Distribution (Top-10, Top-50, Top-100 holders %)
│       ├── Honeypot-Check (Can-Sell-Check, Simulation-based)
│       └── Liquidity-Lock-Status (Lock-Duration, Unlock-Date)
│
├── 4. Journaling (CRUD, AI-Condense, OCR, Stats)
│   ├── Journal-CRUD (journal.ts, JournalService.ts)
│   │   ├── Create-Entry (Rich-Text-Editor, JournalEditor.tsx)
│   │   ├── Read-Entries (Filter, Sort, Search, JournalList.tsx)
│   │   ├── Update-Entry (Inline-Edit, Modal-Edit)
│   │   ├── Delete-Entry (Soft-Delete, Archive)
│   │   └── Storage: Dexie (IndexedDB), Offline-First
│   │
│   ├── Trade Logs (Entry, Exit, P&L, Tags)
│   │   ├── Fields: Symbol, Entry-Price, Exit-Price, Quantity, P&L, Timestamp
│   │   ├── Tags: #win, #loss, #lesson-learned, #mistake, #setup, #breakout
│   │   ├── Auto-Calculation: P&L, %-Gain/Loss, Risk-Reward
│   │   └── Linked-Charts: Reference-to-Chart-Screenshot
│   │
│   ├── AI Condense (Summarize entries, journal-condense.md prompt)
│   │   ├── Provider: OpenAI (gpt-4o-mini, cheap ~$0.003/entry)
│   │   ├── Output: 1-2 sentence summary + Key-Insights + Mistakes
│   │   ├── Max-Tokens: 300 (cost-limit)
│   │   └── Caching: 1h-TTL (identical-entries)
│   │
│   ├── Bullet Analysis (Extract insights, analyze-bullets-ai.md prompt)
│   │   ├── Provider: OpenAI (gpt-4o-mini)
│   │   ├── Output: Bullet-Points (Actionable-Insights, Lessons)
│   │   ├── Usage: Multi-Entry-Analysis (select 5-10 entries)
│   │   └── Export: Markdown, PDF (planned)
│   │
│   ├── OCR (Image-to-Text, ocr/ocrService.ts)
│   │   ├── Engine: Tesseract.js (client-side, offline-capable)
│   │   ├── Use-Case: Screenshot-Import (Trading-Platform, Charts)
│   │   ├── Accuracy: ~85% (English, Trading-Jargon)
│   │   └── Post-Processing: Extract-Numbers, Symbols, Timestamps
│   │
│   ├── Lessons-Learned Archive (LessonsPage.tsx)
│   │   ├── Auto-Tag: Entries with #lesson-learned
│   │   ├── Display: Card-Grid (LessonCard.tsx)
│   │   ├── Search: Full-Text-Search (Dexie-Query)
│   │   └── Export: CSV, JSON, Markdown
│   │
│   └── Journal-Stats (JournalStats.tsx)
│       ├── Metrics: Total-Entries, Winrate, Avg-P&L, Max-Drawdown
│       ├── Charts: P&L-over-Time, Tag-Distribution, Entry-Frequency
│       ├── Timeframes: 7d, 30d, 90d, All-Time
│       └── KPI-Formulas (siehe Abschnitt 3.7)
│
├── 5. Alerts & Signals (CRUD, Rule-Editor, Confluence, Push)
│   ├── Alert-CRUD (notifications/useAlertRules.ts)
│   │   ├── Create-Alert (RuleWizard.tsx, Step-by-Step)
│   │   ├── Read-Alerts (NotificationsPage.tsx, Filter-by-Status)
│   │   ├── Update-Alert (RuleEditor.tsx, Visual-Rule-Builder)
│   │   ├── Delete-Alert (Soft-Delete, Archive)
│   │   └── Storage: Dexie (db.signals), Sync-to-Backend (planned Q1 2025)
│   │
│   ├── Price Alerts (Above, Below, Crossover)
│   │   ├── Types: Price > X, Price < X, Price-Change% > X
│   │   ├── Evaluation: Server-Side (rules/eval-cron.ts, every 1min)
│   │   ├── Notification: Browser-Push-API (push/subscribe.ts)
│   │   └── Status: Active, Triggered, Paused, Expired
│   │
│   ├── Indicator Alerts (RSI, MACD, Confluence)
│   │   ├── Conditions: RSI < 30, MACD-Cross, Bollinger-Breakout
│   │   ├── Confluence-Rules: Multi-Indicator (RSI + MACD + Volume)
│   │   ├── Presets: notifications/presets.ts (RSI-Oversold, Golden-Cross)
│   │   └── Custom-Rules: User-Defined-Logic (ruleToken.ts parser)
│   │
│   ├── Signal Matrix (Multi-timeframe view, SignalsPage.tsx)
│   │   ├── Timeframes: 15m, 1h, 4h, 1d (4x4 grid)
│   │   ├── Indicators: RSI, MACD, EMA-Cross, Bollinger (per timeframe)
│   │   ├── Confluence-Score: Sum of Bullish-Signals (0-10 scale)
│   │   └── Color-Coding: Green (Bullish), Red (Bearish), Yellow (Neutral)
│   │
│   ├── Push Notifications (Browser, PWA, planned Q1 2025)
│   │   ├── Subscribe: push/subscribe.ts (Web-Push-API)
│   │   ├── Dispatch: alerts/dispatch.ts (Triggered-Alert → Push)
│   │   ├── Service-Worker: Handle-Push-Event (show-notification)
│   │   └── Permissions: Browser-Permission-Prompt (NotificationsPage)
│   │
│   └── Signal-Orchestrator (Event-Sourcing, Learning-Architect, planned Q1 2025)
│       ├── Event-Sourcing: Log all Signals (Success/Failure)
│       ├── Learning-Architect: Improve-Signals based on Past-Performance
│       ├── Lessons-Module: Auto-Generate-Lessons from Signal-History
│       └── Export: Signal-Playbook (JSON, Markdown)
│
├── 6. Access Gating (Solana-Wallet, NFT-Check, Lock-Calculator)
│   ├── Solana Wallet Connect (AccessPage.tsx, access/)
│   │   ├── Adapters: @solana/wallet-adapter-react (Phantom, Solflare)
│   │   ├── Connect-UI: AccessStatusCard.tsx (Connect-Button, Status-Display)
│   │   ├── Status: Connected, Disconnected, Checking, Error
│   │   └── Storage: accessStore.ts (Zustand), localStorage-cache
│   │
│   ├── NFT Ownership Check (HoldCheck.tsx, planned Q1 2025)
│   │   ├── Contract: Backpack-Gang-NFT (Solana-Mainnet)
│   │   ├── Verification: On-Chain-Query (Solana-RPC, Moralis-API)
│   │   ├── Grace-Period: 7-day-trial (mock-wallet)
│   │   └── Fallback: access/status.ts (API-check)
│   │
│   ├── Beta Access (currently mocked, access/status.ts)
│   │   ├── Mock-Wallet: Always-Returns-Granted (Development-Only)
│   │   ├── Whitelist: Hardcoded-Addresses (Beta-Testers)
│   │   └── Migration: Q1 2025 (On-Chain-Verification)
│   │
│   ├── Lock-Calculator (LockCalculator.tsx, access/lock.ts)
│   │   ├── Calculate: Token-Lock-Duration based on Holdings
│   │   ├── Formula: Lock-Days = (Holdings / Total-Supply) * 365
│   │   ├── UI: Slider-Input, Real-Time-Calculation
│   │   └── Use-Case: Token-Gating-Preview (Pre-Purchase)
│   │
│   └── Access Logs (telemetry, TelemetryService.ts)
│       ├── Events: wallet_connect, access_check, nft_verify
│       ├── Storage: IndexedDB (local), API-telemetry.ts (backend)
│       └── Analytics: Access-Funnel (Connect → Check → Grant)
│
└── 7. AI Orchestration (OpenAI + Grok, Task-Queue, Cost-Management)
    ├── Dual Provider (OpenAI + Grok, ai/orchestrator.ts)
    │   ├── OpenAI (gpt-4o-mini):
    │   │   ├── Cost: ~$0.15/1M input-tokens, ~$0.60/1M output-tokens
    │   │   ├── Use-Cases: Journal-Condense, Bullet-Analysis, Quick-Summaries
    │   │   ├── Latency: 500-800ms (p50), 1-2s (p95)
    │   │   └── Client: ai/model_clients/openai.ts
    │   │
    │   ├── Grok (xAI, grok-beta):
    │   │   ├── Cost: ~$5/1M input-tokens, ~$15/1M output-tokens (40x OpenAI)
    │   │   ├── Use-Cases: Market-Reasoning, Social-Heuristics, Meme-Analysis
    │   │   ├── Latency: 1-2s (p50), 3-5s (p95)
    │   │   └── Client: ai/model_clients/grok.ts
    │   │
    │   └── Provider-Selection-Logic (ai/orchestrator.ts, selectProvider())
    │       ├── Rules: market-reasoning → Grok, journal-condense → OpenAI
    │       ├── Fallback: Grok-Error → OpenAI (graceful-degradation)
    │       └── Override: User-Selectable (SettingsPage, ai-provider-toggle)
    │
    ├── Task Queue (Priority, Cost-Budget, ai/orchestrator.ts)
    │   ├── Queue-Structure: Priority-Queue (High → Low)
    │   ├── Priorities: High (User-Initiated), Low (Background-Analysis)
    │   ├── Concurrency-Limit: 3 concurrent-tasks (rate-limiting)
    │   └── Retry-Logic: Exponential-Backoff (ai/retry.ts, 3 retries)
    │
    ├── Prompt Library (System prompts, ai/prompts/*.md)
    │   ├── journal-condense.md          Summary-Generation (1-2 sentences + Insights)
    │   ├── analyze-bullets-ai.md        Bullet-Point-Analysis (Actionable-Insights)
    │   ├── teaser-vision-analysis.md    Vision-API-Analysis (Image-Description)
    │   ├── market-reasoning.md          Market-Reasoning (Grok, Crypto-Context)
    │   ├── social-heuristics.md         Social-Sentiment-Analysis (Grok, Twitter/Reddit)
    │   └── Prompt-Loader (ai/promptLoader.ts, loadSystemPrompt())
    │
    ├── Cost Management (<$0.25/request, $100/day, ai/orchestrator.ts)
    │   ├── Per-Request-Limit: $0.25 (throws-error if exceeded)
    │   ├── Per-User-Limit: $10/day (planned, not implemented)
    │   ├── Total-Daily-Limit: $100/day (global-limit)
    │   ├── Cost-Estimation: estimateCost() (token-count * provider-rate)
    │   ├── Cost-Tracking: trackAICall() (log-cost, provider, timestamp)
    │   └── Cost-Analytics: telemetry_output/ai_cost_tracked.json
    │
    ├── Response-Caching (1h-TTL, ai/orchestrator.ts)
    │   ├── Cache-Key: hash(task-type + input)
    │   ├── TTL: 1 hour (3600s)
    │   ├── Storage: In-Memory-Map (ephemeral, per-session)
    │   └── Planned: IndexedDB-Cache (persistent, Q1 2025)
    │
    ├── Request-Deduplication (ai/orchestrator.ts, inFlight-Map)
    │   ├── Logic: If-identical-task-in-flight → await-existing-request
    │   ├── Benefit: Prevent-Duplicate-API-Calls (cost-savings)
    │   └── Use-Case: User-Double-Click on "Condense"-Button
    │
    └── Telemetry (TelemetryService.ts, events/)
        ├── Events: ai_assist_invoked, ai_assist_success, ai_assist_error
        ├── Metrics: latency, tokens-used, cost, provider
        ├── Storage: IndexedDB (local), api/telemetry.ts (backend)
        └── Analytics: AI-Cost-Dashboard (planned, Q2 2025)
```

### 3.2 Key UX Flows
```
Flow 1: First-Time User Onboarding
├── 1. Landing Page
├── 2. Connect Wallet (Solana)
├── 3. Access Gate Check (NFT, mocked in beta)
├── 4. Tour (Board → Market → Journal)
└── 5. Create First Journal Entry

Flow 2: Daily Trading Workflow
├── 1. Open Board (Dashboard)
│   └── View KPIs (Watchlist, Recent Entries)
│
├── 2. Market Analysis
│   ├── Select Token (SOL, BTC, ETH, Meme-Coin)
│   ├── View Chart + Indicators
│   ├── Check Signal Matrix
│   └── Set Price Alert
│
├── 3. Execute Trade (External Platform)
│
└── 4. Log Trade in Journal
    ├── Entry Price, Exit Price, P&L
    ├── Add Tags (#lesson-learned)
    └── AI Condense (optional)

Flow 3: Offline Mode
├── 1. User Goes Offline
├── 2. Service Worker Intercepts Requests
├── 3. Serve Cached Data
│   ├── Journal (from IndexedDB)
│   ├── Charts (last cached OHLC)
│   └── Watchlist (local storage)
│
├── 4. User Creates Journal Entry
│   └── Save to IndexedDB (Sync Queue)
│
└── 5. User Goes Online
    └── Background Sync (planned)

Flow 4: AI Analysis
├── 1. User Writes Journal Entry
├── 2. Click "Condense with AI"
├── 3. Select Provider (OpenAI or Grok)
├── 4. AI Orchestrator
│   ├── Check Cost Budget
│   ├── Queue Task
│   └── Call Provider
│
└── 5. Display Result
    ├── Summary (1-2 sentences)
    ├── Lessons Learned (bullet points)
    └── Save to IndexedDB
```

### 3.3 Component Taxonomy
```
Level 1: UI Primitives
├── Button (Primary, Secondary, Danger)
├── Input (Text, Number, Date)
├── Card (with Header, Body, Footer)
├── Modal (Overlay, Centered)
└── Spinner (Loading indicator)

Level 2: Composed Components
├── ChartCard (Card + InteractiveChart)
├── TokenRow (Price, Change%, Volume)
├── JournalEntryCard (Card + Entry + Tags)
└── AlertCard (Alert + Status + Actions)

Level 3: Sections (Page Sections)
├── ChartSection (Chart + Indicators + Controls)
├── SignalMatrix (Multi-timeframe signals)
├── JournalList (Filter, Sort, Pagination)
└── BoardKPIs (Tiles, Charts, Stats)

Level 4: Pages (Full Pages)
├── MarketPage (Chart + Signals + Alerts)
├── JournalPage (List + Detail + AI)
├── BoardPage (Dashboard + KPIs)
└── SettingsPage (Preferences, AI-Provider)
```

---

## 4. 🏗️ System-Architektur

### 4.1 Frontend Architecture
```
Frontend Stack
├── Framework: React 18.3 + TypeScript 5.6
├── Build: Vite 5.4 (Fast HMR, Optimized Builds)
├── Styling: TailwindCSS 4.1 (Dark-Mode-First)
├── State: Zustand (Global), Context (Feature), useState (Local)
├── Routing: React Router 6
├── PWA: vite-plugin-pwa + Workbox
├── Storage: Dexie (IndexedDB Wrapper)
└── Testing: Vitest (Unit), Playwright (E2E)
```

### 4.2 Backend Architecture
```
Backend Stack
├── Platform: Vercel (Edge Functions, Static Hosting)
├── Runtime: Node 18 (Serverless)
├── APIs: Vercel Edge Functions
│   ├── /api/data/* (Market Data Proxies)
│   ├── /api/ai/* (AI Proxies)
│   ├── /api/alerts/* (Alert Management)
│   └── /api/access/* (Access Gating)
│
├── Secrets: Vercel Environment Variables
│   ├── MORALIS_API_KEY (Market Data)
│   ├── OPENAI_API_KEY (AI Provider 1)
│   ├── XAI_API_KEY (AI Provider 2 - Grok)
│   └── DATA_PROXY_SECRET (Internal Auth)
│
└── External Services
    ├── Moralis (Token Data, On-Chain Metrics)
    ├── DexPaprika (OHLC, Volume)
    ├── Dexscreener (Meme-Coin Data)
    ├── OpenAI (gpt-4o-mini, ~$0.15/1M tokens)
    └── xAI (Grok, ~$5/1M tokens)
```

### 4.3 PWA Architecture
```
PWA Components
├── Service Worker (sw.js)
│   ├── Precache Strategy (All Static Assets)
│   │   └── ~428KB (index.html, JS, CSS, fonts, icons)
│   │
│   ├── Runtime Caching
│   │   ├── Cache-First: Images, Fonts
│   │   ├── Network-First: API Calls (with fallback)
│   │   └── Stale-While-Revalidate: OHLC Data
│   │
│   └── Background Sync (planned)
│       └── Queue Offline Actions (Journal, Alerts)
│
├── Web App Manifest (manifest.webmanifest)
│   ├── name: "Sparkfined"
│   ├── short_name: "Sparkfined"
│   ├── theme_color: "#1e293b" (Dark Slate)
│   ├── background_color: "#0f172a" (Navy)
│   ├── display: "standalone"
│   └── icons: 192x192, 512x512
│
└── Offline Page (offline.html)
    └── Fallback when network unavailable
```

### 4.4 Data Architecture
```
Data Storage
├── IndexedDB (Dexie)
│   ├── journal (entries, tags, timestamps)
│   ├── watchlist (tokens, prices, alerts)
│   ├── settings (user preferences, ai-provider)
│   └── cache (ohlc, token-metadata)
│
├── LocalStorage (Fallback, Legacy)
│   └── Migration to IndexedDB in progress
│
└── Session Storage (Temporary)
    └── Current session state (chart config, filters)
```

### 4.5 Security Architecture
```
Security Layers
├── 1. Secrets Management
│   ├── ✅ No secrets in client bundle (no VITE_ prefix)
│   ├── ✅ Serverless proxies for external APIs
│   └── ✅ Vercel Environment Variables
│
├── 2. Input Validation
│   ├── ✅ API handlers validate inputs (type, length)
│   ├── ✅ Journal content sanitized (max 10k chars)
│   └── ✅ User inputs escaped (XSS prevention)
│
├── 3. Authentication (planned)
│   ├── Solana Wallet Signature (challenge-response)
│   ├── NFT Ownership Check (on-chain)
│   └── Session Management (JWT)
│
└── 4. HTTPS Only
    ├── ✅ Vercel enforces HTTPS
    └── ✅ Service Worker requires HTTPS
```

---

## 5. 🚀 Implementierungs-Roadmap

### 5.1 Current Status (Sprint S0 - Foundation Cleanup)
```
Sprint S0 (2025-11-12 → 2025-11-26)
├── ✅ Multi-Tool Prompt System
│   ├── 11 SYSTEM Files (project-core, typescript, frontend, etc.)
│   └── 6 ITERATIVE Files (planning, context, intentions, etc.)
│
├── ⏳ Bundle-Size Optimization
│   ├── Target: <400KB (currently 428KB)
│   ├── Actions: Code-splitting, Tree-shaking
│   └── Deadline: 2025-11-20
│
├── ⏳ E2E Test Coverage
│   ├── Target: 15-20 tests (currently 3)
│   ├── Focus: Journal, Market, Access-Gating
│   └── Deadline: 2025-11-26
│
└── ⏳ PWA Offline-Mode Audit
    ├── Test all offline-first features
    └── Deadline: 2025-11-26
```

### 5.2 Q1 2025 Roadmap (High-Priority)
```
P0: On-Chain Access Gating (2 Sprints, 4 weeks)
├── Replace mock wallet with real Solana integration
├── NFT ownership check (Backpack Gang NFT)
├── Access control for premium features
└── Session management

P0: Real-Time Alerts (2 Sprints, 4 weeks)
├── Browser Push Notifications
├── Alert management UI (create, edit, delete)
├── Confluence rules (multi-indicator alerts)
└── Alert history + logs

P0: Background Sync (1 Sprint, 2 weeks)
├── Queue offline actions (journal, alerts)
├── Sync when online
└── Conflict resolution
```

### 5.3 Q2 2025 Roadmap (Medium-Priority)
```
P1: Chart Library Upgrade (TBD)
├── Evaluate Lightweight-Charts vs. TradingView Widgets
├── Decision Deadline: End Q1 2025
└── Estimated Effort: 2 sprints

P1: Real-Time Data (WebSocket vs. Polling)
├── Decision: When Real-Time Alerts goes live
├── Estimated Effort: 1 sprint
└── Dependency: Real-Time Alerts

P2: Light-Mode Support
├── Currently Dark-Mode-First only
├── Add Light-Mode theme
└── Estimated Effort: 1 sprint

P2: Mobile-Optimized UX
├── Touch-friendly chart controls
├── Mobile-first journal entry
└── Estimated Effort: 1 sprint
```

### 5.4 Backlog (Future Considerations)
```
Backend Database (Supabase vs. Stay Client-Only)
├── Decision: After On-Chain Access Gating
├── Use-Case: Multi-device sync, social features
└── Estimated Effort: 3-4 sprints

Claude (Anthropic) as 3rd AI Provider
├── Decision: Q2 2025
├── Rationale: Better reasoning for complex analysis
└── Estimated Effort: 1 sprint

Social Features (Community, Share Insights)
├── Share journal entries
├── Follow top traders
└── Estimated Effort: 4-5 sprints

Portfolio Tracking (P&L, Tax Reports)
├── Import trades from exchanges
├── Calculate realized/unrealized P&L
└── Estimated Effort: 3-4 sprints
```

---

## 6. 📡 Events & Telemetrie

### 6.1 Event Catalog
```
Event Categories
├── 1. User Actions
│   ├── journal_entry_create
│   ├── journal_entry_update
│   ├── journal_entry_delete
│   ├── alert_create
│   ├── alert_trigger
│   └── wallet_connect
│
├── 2. AI Events
│   ├── ai_task_start (journal-condense, bullet-analysis)
│   ├── ai_task_complete
│   ├── ai_task_error
│   ├── ai_cost_tracked
│   └── ai_provider_switch (openai ↔ grok)
│
├── 3. Performance Events
│   ├── page_load (ttfb, fcp, lcp)
│   ├── service_worker_install
│   ├── service_worker_activate
│   ├── cache_hit (hit rate tracking)
│   └── offline_mode_enter
│
├── 4. Error Events
│   ├── api_error (endpoint, status, message)
│   ├── fetch_timeout
│   ├── indexeddb_error
│   └── chart_render_error
│
└── 5. Business Events
    ├── feature_adoption (journal, alerts, board)
    ├── session_duration
    ├── user_retention (7d, 30d, 90d)
    └── pwa_install
```

### 6.2 Telemetry Architecture
```
Telemetry Flow
├── 1. Event Capture
│   ├── Client: trackEvent('journal_entry_create', { tags: ['#win'] })
│   └── Format: { event, timestamp, userId, sessionId, metadata }
│
├── 2. Event Buffering
│   ├── Store in memory (batch size: 10 events)
│   └── Flush on: batch full, 30s interval, page unload
│
├── 3. Event Transmission
│   ├── POST /api/telemetry (batch)
│   └── Retry on failure (3 attempts, exponential backoff)
│
└── 4. Event Storage (Future)
    ├── Vercel Analytics (basic metrics)
    ├── Self-hosted (planned, privacy-first)
    └── Analysis Dashboard (planned)
```

### 6.3 Key Metrics Dashboard (Planned)
```
Real-Time Metrics
├── Active Users (now, 24h, 7d)
├── Page Views (by route)
├── Error Rate (by endpoint, by page)
└── Offline Mode Usage (% of sessions)

Performance Metrics
├── Core Web Vitals (LCP, FID, CLS)
├── Bundle Size (trend over time)
├── Cache Hit Rate (service worker)
└── API Response Times (p50, p95, p99)

Business Metrics
├── Feature Adoption
│   ├── Journal: % users with 5+ entries
│   ├── Alerts: % users with 1+ alert
│   └── AI: % users who used condense/bullets
│
├── User Retention
│   ├── Day 1, Day 7, Day 30, Day 90
│   └── Cohort Analysis
│
└── AI Cost Tracking
    ├── Cost per User per Day
    ├── Total Cost per Day
    └── Cost by Provider (OpenAI vs. Grok)
```

---

## 7. 🔮 Erweiterungen & Ideen

### 7.1 Short-Term Ideas (Q1-Q2 2025)
```
1. Smart Alerts (Confluence Rules)
├── Multi-indicator alerts (RSI + MACD + Volume)
├── Multi-timeframe confirmation (15m + 1h + 4h)
└── Custom alert logic (user-defined formulas)

2. AI-Powered Trade Suggestions
├── Analyze current market conditions
├── Suggest entry/exit points
└── Risk management recommendations

3. Social Sentiment Integration
├── Twitter sentiment analysis
├── Reddit mentions tracking
└── Telegram group activity

4. Voice Journal Entry (Mobile)
├── Speech-to-text for journal entries
├── Quick capture while trading
└── Hands-free logging

5. Portfolio Sync (Exchange Integration)
├── Import trades from Binance, Coinbase
├── Auto-calculate P&L
└── Tax report generation
```

### 7.2 Medium-Term Ideas (Q3-Q4 2025)
```
1. Community Features
├── Share journal insights (anonymized)
├── Follow top traders (public profiles)
├── Leaderboard (P&L, win-rate)
└── Comments on shared insights

2. Advanced Charting
├── Multi-chart view (4x4 grid)
├── Chart templates (save/load configurations)
├── Custom indicators (user-defined formulas)
└── Backtesting (test strategies on historical data)

3. AI Trading Assistant (Chatbot)
├── Ask questions about market conditions
├── Get AI explanations for indicators
├── Conversational interface for analysis
└── Multi-turn dialogue with context

4. Mobile App (React Native)
├── Native iOS/Android app
├── Push notifications (better than PWA)
├── Biometric authentication
└── Faster performance

5. Desktop App (Electron)
├── Native Windows/Mac/Linux app
├── Better offline support
├── System tray integration
└── Keyboard shortcuts
```

### 7.3 Long-Term Ideas (2026+)
```
1. Decentralized Trading Journal
├── Store journal on IPFS/Arweave
├── NFT-gated access to premium features
├── Tokenomics (reward active journaling)
└── DAO governance (feature voting)

2. AI Trading Bot (Autonomous)
├── Execute trades based on AI signals
├── Risk management (stop-loss, take-profit)
├── Portfolio rebalancing
└── Backtesting + paper trading

3. Multi-Chain Support
├── Ethereum, Polygon, Arbitrum, Optimism
├── Cross-chain portfolio tracking
├── Multi-wallet support
└── Cross-chain alerts

4. Institutional Features
├── Team collaboration (shared watchlists)
├── Role-based access control
├── Audit logs (compliance)
└── API access for automated trading

5. AI Model Fine-Tuning
├── Train custom AI models on user data
├── Personalized insights (learn user patterns)
├── Predictive analytics (forecast P&L)
└── Anomaly detection (unusual trading behavior)
```

### 7.4 Experimental Ideas (Tech Spikes)
```
1. AR/VR Trading Interface
├── 3D chart visualization
├── Spatial UI for multi-timeframe analysis
└── Gesture controls

2. Blockchain-Based Identity
├── DID (Decentralized Identifier)
├── Verifiable credentials (trading history)
└── Zero-knowledge proofs (privacy-preserving)

3. Quantum-Resistant Encryption
├── Prepare for post-quantum crypto
└── Future-proof security

4. Edge AI (On-Device Models)
├── Run small AI models in browser
├── No server calls (privacy, cost)
└── Faster inference

5. Real-Time Collaboration
├── Multi-user chart analysis (like Figma)
├── Live cursor tracking
└── Voice/video chat integration
```

---

## 🗂️ Quick Reference Index

### By Domain
- **Vision:** Section 1
- **Architecture:** Section 4
- **Features:** Section 3
- **Roadmap:** Section 5
- **Telemetry:** Section 6
- **Future:** Section 7

### By Stakeholder
- **Product Manager:** Section 1, 5, 7
- **Developer:** Section 2, 4
- **Designer:** Section 3 (UX Flows, Component Taxonomy)
- **DevOps:** Section 4 (Backend, PWA, Security)
- **Data Analyst:** Section 6

### Key Files in Codebase
```
Documentation
├── /docs/README.md (Overview)
├── /.rulesync/ (11 SYSTEM + 6 ITERATIVE files)
└── /docs/mindmap-sparkfined-ta-pwa.md (This file)

Source Code
├── /src/pages/ (MarketPage, JournalPage, BoardPage)
├── /src/sections/ (ChartSection, SignalMatrix)
├── /src/components/ (UI primitives, composed components)
├── /src/hooks/ (useTokenData, useAccessGate)
├── /src/lib/ (indicators, fetch, format)
└── /src/state/ (Context providers)

Backend
├── /api/data/ (Market data proxies)
├── /api/ai/ (AI proxies)
├── /api/alerts/ (Alert management)
└── /api/access/ (Access gating)

AI
├── /ai/orchestrator.ts (Task queue, cost management)
├── /ai/model_clients/ (OpenAI, Grok wrappers)
└── /ai/prompts/ (System prompts)

Testing
├── /tests/ (Vitest unit tests)
└── /playwright.config.ts (E2E tests)
```

---

## 📝 Maintenance Notes

**Update Frequency:** This mindmap should be updated when:
- Major features are added (update Section 3, 5)
- Architecture changes (update Section 2, 4)
- Roadmap shifts (update Section 5)
- New experiments are documented (update Section 7)

**Owners:**
- **Content:** Product + Engineering Teams
- **Review:** Quarterly (end of each quarter)
- **Format:** Markdown (easy to version control, readable)

**Related Docs:**
- `.rulesync/_planning.md` (Detailed sprint planning)
- `.rulesync/_context.md` (Current session focus)
- `.rulesync/_intentions.md` (Design decisions, ADRs)

---

**Legend:**
- ✅ Completed
- ⏳ In Progress
- 📝 Planned
- 🔮 Future Idea
- ⚠️ At Risk
- ❌ Deprecated

**Last Updated:** 2025-11-13
