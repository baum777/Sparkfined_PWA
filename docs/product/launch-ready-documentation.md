# Sparkfined PWA – Launch-Ready Product & Technical Documentation

**Version**: 1.0 (MVP-Ready)
**Last Updated**: 2025-12-11
**Status**: Product specification for controlled feature rollout

---

## Executive Summary

**Sparkfined PWA** is a Progressive Web App designed for crypto traders seeking to **journal their trades, analyze patterns, and optimize decision-making** through AI-powered insights and real-time market data.

**Core Mission**: Transform trading journals from passive logs into actionable learning tools with gamified progression and intelligent pattern recognition.

**Target Users**:
- Retail traders (beginner to advanced)
- Crypto enthusiasts monitoring portfolios
- Active traders seeking performance analytics
- Community members wanting shared insights

**Key Problems Solved**:
1. **Fragmented Trading Data** – All journal entries, alerts, watchlist, and analysis in one offline-first app
2. **Limited Market Insight** – Multi-provider price data with fallback resilience and whale activity tracking
3. **Passive Journaling** – AI-powered sentiment analysis and pattern detection from trade entries
4. **No Motivation System** – Hero's Journey gamification with XP, badges, and journey phases
5. **Scattered Learning** – Centralized signals, lessons, and trend analysis with context-aware recommendations

**Go-to-Market Strategy**: Launch with MVP (core trading journal + basic charts + price alerts). Activate advanced features (GrokPulse sentiment, gamification, wallet monitoring) in Release 1–2 based on usage data and user feedback.

---

## 1. Informationsarchitektur – Pages & Tabs

### Overview: All Pages in the App

| Page/Tab | Description | Primary Use Case | MVP Included? | Release Target |
|----------|-------------|------------------|---------------|-----------------|
| **Journal V2** | Hero's Journey trading journal with entry management | Record and review past trades for learning | ✅ Yes | MVP |
| **Charts** | Interactive multi-timeframe charting with annotations | Analyze price action and technical setups | ✅ Yes (Basic) | MVP |
| **Dashboard** | KPI snapshots, performance metrics, activity feed | Quick overview of trading performance | ✅ Yes (Minimal) | MVP |
| **Alerts** | Price-based alerts with custom triggers | Set price targets and monitor positions | ✅ Yes | MVP |
| **Watchlist** | Token monitoring with real-time price tracking | Monitor portfolio and market opportunities | ✅ Yes | MVP |
| **Oracle (GrokPulse)** | AI sentiment analysis and threat scoring | Understand market sentiment and risks | ⚠️ Limited | Release 1 |
| **Signals** | Trading signals and pattern recognition | Identify high-probability setups | ⚠️ Limited | Release 1 |
| **Lessons** | Structured learning content tied to trades | Learn from past wins and losses | ⏳ Planned | Release 2 |
| **Replay** | Historical price replay and backtesting | Test strategies on past price action | ⏳ Planned | Release 2 |
| **Analysis** | Advanced chart analysis with patterns | Detect setups and playbook matching | ⏳ Planned | Release 2 |
| **Notifications** | Centralized notification history | Review alerts and system messages | ✅ Yes (Basic) | MVP |
| **Settings** | User preferences, theme, OCR scanning | Configure app behavior and appearance | ✅ Yes | MVP |

### Navigation Structure (MVP)

```
App Root
├── Journal V2 (Primary)
├── Charts (Primary)
├── Dashboard (Secondary)
├── Alerts (Primary)
├── Watchlist (Primary)
├── Settings (Utility)
└── Notifications (Utility)

(Release 1+: Oracle, Signals)
(Release 2+: Lessons, Replay, Analysis)
```

---

## 2. Functional Catalog per Page/Tab

### 2.1 Journal V2

**Purpose**: Record, review, and learn from trading decisions with AI-powered insights.

| Feature | User Action | Use Case | AI/Provider | Tech Dependency | Release |
|---------|-------------|----------|-------------|-----------------|---------|
| **Create Entry** | Click "New Entry" → fill title, entry, notes → save | Document a trade immediately after execution or later | — | Dexie, Zustand | MVP |
| **View Entry List** | Scroll through list, filtered by setup/emotion/status | Review trading history chronologically | — | JournalService | MVP |
| **Edit Notes** | Click entry → click "Edit" → modify notes → save | Update trade reflection or add learnings | — | Dexie | MVP |
| **Delete Entry** | Click entry → click delete → confirm | Remove incorrect or duplicate entries | — | Dexie | MVP |
| **Filter by Setup** | Select setup type from dropdown (e.g., "breakout", "pullback") | Find trades of a specific pattern type | — | JournalService | MVP |
| **Filter by Emotion** | Select emotion (e.g., "confident", "uncertain", "greedy") | Identify emotional patterns in trading | — | JournalService | MVP |
| **Filter by Status** | Select outcome (e.g., "win", "loss", "break-even") | Analyze win/loss distribution | — | JournalService | MVP |
| **AI Insights** | Entry auto-generates sentiment, tone, advice section | Receive AI feedback on trade rationale and psychology | OpenAI LLM | JournalService | Release 1 |
| **Journey Meta** | System tracks XP earned, journey phase, badges | Gamify journaling and motivate consistent logging | — | GamificationStore | Release 1 |
| **Social Preview** | Click "Share" → preview card with trade summary | Share trade on social or with community | — | JournalService | Release 1 |
| **Export Journal** | Click "Export" → choose format (JSON/MD/CSV) → download | Backup or analyze data externally | — | ExportService | Release 1 |
| **Pattern Analytics** | View win rate, average hold time, best setups | Identify most profitable patterns | — | JournalService | MVP |

### 2.2 Charts

**Purpose**: Visualize price action, draw annotations, and replay historical scenarios.

| Feature | User Action | Use Case | AI/Provider | Tech Dependency | Release |
|---------|-------------|----------|-------------|-----------------|---------|
| **Symbol Selection** | Search/select token (e.g., "SOL/USD") | Switch between different trading pairs | Moralis, DexPaprika, DexScreener | MarketOrchestrator | MVP |
| **Timeframe Selection** | Click timeframe tabs (1m, 5m, 1h, 4h, 1d, etc.) | Analyze price at different scales | OHLC providers | ChartUiStore | MVP |
| **Display Indicators** | Toggle indicators (MA, RSI, MACD, Bollinger) | Apply technical analysis tools | — | ChartUiStore | MVP (Basic) |
| **Draw Annotations** | Use annotation tools (line, box, text) → click on chart | Mark support/resistance, key levels | — | AnnotationsService | MVP |
| **Save Trade from Chart** | Click "Save Trade" → create journal entry with context | Create journal entry directly from price action | — | EventBus, JournalService | MVP |
| **Replay Mode** | Select date range → press play → watch price replay | Backtest strategy or practice entries | ReplayService | MVP (MVP Minimal) | Release 1 |
| **Setup Detection** | System auto-detects patterns (breakout, pullback, etc.) | Identify high-probability setups | SignalOrchestrator | Release 1 | Release 1 |
| **Playbook Matching** | System highlights matching playbooks from past wins | See which setups match historical winners | SignalOrchestrator | Release 1 | Release 1 |

### 2.3 Dashboard

**Purpose**: Overview of trading performance and market activity at a glance.

| Feature | User Action | Use Case | AI/Provider | Tech Dependency | Release |
|---------|-------------|----------|-------------|-----------------|---------|
| **KPI Strip** | View cards: daily PnL, win rate, journal streak, XP | See high-level performance metrics | — | GamificationStore, JournalService | MVP (Minimal) |
| **Performance Metrics** | View trade count, average hold time, risk/reward | Analyze trading behavior | — | JournalService | MVP (Minimal) |
| **Activity Feed** | View recent journal entries, alerts triggered, streaks | Catch up on recent activity | — | EventBus | MVP (Minimal) |
| **Quick Actions** | One-click buttons: "New Entry", "New Alert", "Search Token" | Quickly navigate to common tasks | — | Router | MVP |

### 2.4 Alerts

**Purpose**: Set price-based alerts to monitor opportunities and manage risk.

| Feature | User Action | Use Case | AI/Provider | Tech Dependency | Release |
|---------|-------------|----------|-------------|-----------------|---------|
| **Create Alert** | Enter token symbol, trigger type (above/below), price → save | Monitor price targets for trading decisions | Moralis, LiveDataManager | AlertsStore | MVP |
| **View Alert List** | See all active, triggered, and paused alerts | Manage multiple price targets across tokens | — | AlertsStore | MVP |
| **Arm/Disarm Alert** | Toggle alert status between "armed" and "paused" | Temporarily stop alerts without deleting | — | AlertsStore | MVP |
| **Delete Alert** | Click alert → delete → confirm | Remove obsolete price targets | — | AlertsStore | MVP |
| **Push Notification** | When alert triggers, send web push notification | Receive real-time notification of price movement | Web Push API | PushQueueStore | MVP |
| **View Notification History** | Navigate to Notifications → see all alert history | Review which alerts fired and when | — | AlertsStore | MVP (Basic) |
| **Edit Alert** | Click alert → edit price or trigger type | Adjust price targets or conditions | — | AlertsStore | Release 1 |

### 2.5 Watchlist

**Purpose**: Monitor tokens and track price changes without alerts.

| Feature | User Action | Use Case | AI/Provider | Tech Dependency | Release |
|---------|-------------|----------|-------------|-----------------|---------|
| **Add Token** | Search token → click "Add to Watchlist" | Monitor price and market cap of interest | Moralis | WatchlistStore | MVP |
| **View Watchlist** | See list of tokens with current price, change, volume | Quick view of portfolio and market opportunities | LiveDataManager | MVP | MVP |
| **Real-Time Price Updates** | Price updates as provider feeds data | See live price movements | Moralis, DexScreener | LiveDataStore | MVP |
| **Sort by Price/Change** | Click column header → sort ascending/descending | Organize by gain/loss or price | — | WatchlistStore | MVP |
| **Filter by Trend** | Select trend filter (gainer, loser, volatile) | Find tokens matching market conditions | — | WatchlistStore | Release 1 |
| **Remove Token** | Click token → remove from watchlist | Clean up unwanted tokens | — | WatchlistStore | MVP |
| **Price Change % Display** | Green for gains, red for losses with percentage | Quickly gauge performance | — | Components | MVP |

### 2.6 Oracle (GrokPulse)

**Purpose**: Understand market sentiment and identify high-risk tokens using AI analysis.

| Feature | User Action | Use Case | AI/Provider | Tech Dependency | Release |
|---------|-------------|----------|-------------|-----------------|---------|
| **View Sentiment Reports** | Browse sentiment analysis for tokens with threat scores | Understand market sentiment and risk | GrokPulse Engine (custom AI) | OracleStore | Release 1 |
| **Filter by Theme** | Select theme (e.g., "solana-memes", "emerging-defi") | Focus on relevant token categories | — | OracleStore | Release 1 |
| **Threat Scoring** | View numeric threat score (0-100) with reasoning | Assess risk level of tokens | GrokPulse Engine | Release 1 | Release 1 |
| **Bot Score Analysis** | See bot activity and manipulation likelihood | Identify potentially manipulated tokens | Heuristics (custom) | Release 1 | Release 1 |
| **Market Structure Insights** | Analyze whale concentration, volume, bid-ask | Understand market depth and liquidity | Moralis, custom heuristics | Release 1 | Release 1 |
| **Trend Detection** | Auto-identify emerging trends and hype patterns | Stay ahead of market moves | GrokPulse Engine | Release 1 | Release 1 |
| **Read/Unread Status** | Mark reports as read to track which you've reviewed | Organize reading list | — | OracleStore | Release 1 |

### 2.7 Signals

**Purpose**: Identify trading signals and high-probability setups using pattern matching.

| Feature | User Action | Use Case | AI/Provider | Tech Dependency | Release |
|---------|-------------|----------|-------------|-----------------|---------|
| **View Active Signals** | See list of current signals with symbol, pattern, score | Discover trading opportunities | SignalOrchestrator | SignalDb | Release 1 |
| **Filter by Pattern** | Select pattern type (breakout, pullback, etc.) | Focus on specific setup types | — | SignalDb | Release 1 |
| **Signal Strength** | View confidence/strength score for each signal | Prioritize high-probability setups | SignalOrchestrator | Release 1 | Release 1 |
| **Navigate to Chart** | Click signal → jump to chart with pre-configured view | Analyze setup visually | — | Router | Release 1 |

### 2.8 Notifications

**Purpose**: Centralized view of all system notifications and alerts.

| Feature | User Action | Use Case | AI/Provider | Tech Dependency | Release |
|---------|-------------|----------|-------------|-----------------|---------|
| **View Notification History** | See all alerts, system messages, activity in chronological order | Review what happened while away | — | AlertsStore, EventBus | MVP (Basic) |
| **Mark as Read** | Click notification → mark read | Organize notification list | — | NotificationStore | Release 1 |
| **Clear All** | Click "Clear All" → confirm → empty notification list | Clean up old notifications | — | NotificationStore | Release 1 |

### 2.9 Settings

**Purpose**: Configure app preferences, theme, and advanced features.

| Feature | User Action | Use Case | AI/Provider | Tech Dependency | Release |
|---------|-------------|----------|-------------|-----------------|---------|
| **Theme Toggle** | Select light/dark/auto mode → save | Customize app appearance | — | ThemeStore | MVP |
| **Language Selection** | Choose language (en, de, etc.) → save | Localize app interface | — | I18nStore | Release 1 |
| **OCR Scanning** | Upload image/screenshot of chart → extract price/time data | Quickly capture price levels from external sources | Tesseract.js | SettingsPage | Release 1 |
| **Wallet Connection** | Connect wallet (MetaMask, etc.) → authorize | Enable portfolio and position tracking | Web3 Provider | WalletStore | Release 2 |
| **Export App Data** | Click "Export All Data" → download JSON backup | Create full backup of all personal data | — | ExportService | Release 2 |
| **Clear All Data** | Click "Reset App" → confirm → wipe all data | Reset app to fresh state (destructive) | — | AllStores | Release 2 |

### 2.10 Lessons (Release 2+)

**Purpose**: Structured learning content derived from user's own trading.

| Feature | User Action | Use Case | AI/Provider | Tech Dependency | Release |
|---------|-------------|----------|-------------|-----------------|---------|
| **View Generated Lessons** | Browse AI-generated lessons from own trade history | Learn from personal patterns | OpenAI LLM | JournalService | Release 2 |
| **Lesson Content** | Read lesson title, description, examples, key takeaway | Understand specific trading principle | LessonStore | Release 2 | Release 2 |

### 2.11 Replay (Release 2+)

**Purpose**: Historical price replay for backtesting and practice.

| Feature | User Action | Use Case | AI/Provider | Tech Dependency | Release |
|---------|-------------|----------|-------------|-----------------|---------|
| **Select Date Range** | Choose start and end date on calendar | Define replay window | — | ReplayService | Release 2 |
| **Start Replay** | Click play → watch price progress through time | Backtest strategy or practice entries | ReplayService | Release 2 | Release 2 |
| **Speed Control** | Adjust replay speed (1x, 2x, 4x, etc.) | Watch faster or slower | — | ReplayService | Release 2 |
| **Create Entry During Replay** | Pause → record trade → see actual outcome | Test trading decisions against past | JournalService, ReplayService | Release 2 | Release 2 |

### 2.12 Analysis (Release 2+)

**Purpose**: Advanced chart analysis with pattern detection and playbook matching.

| Feature | User Action | Use Case | AI/Provider | Tech Dependency | Release |
|---------|-------------|----------|-------------|-----------------|---------|
| **Pattern Detection** | System highlights detected patterns on chart | Automatically identify setups | SignalOrchestrator | Release 2 | Release 2 |
| **Playbook Matching** | See which stored playbooks match current setup | Leverage past winning patterns | SignalOrchestrator | Release 2 | Release 2 |

---

## 3. Core User Journeys

### Journey 1: "Quick Trade Logging" (MVP – ~3 min)

**Actor**: Active trader mid-trade or immediately after execution

**Goal**: Document a trade with minimal friction to capture decision-making context

**Steps**:
1. User opens app → taps **Journal** tab
2. Taps **"New Entry"** button
3. **[MVP]** Fills title (e.g., "SOL breakout above $210")
4. **[MVP]** Selects setup type (e.g., "breakout", "retest")
5. **[MVP]** Selects emotion state (e.g., "confident", "uncertain")
6. **[MVP]** Types notes explaining trade rationale
7. **[MVP]** Taps **"Save Entry"**
8. System creates entry with timestamp and ID
9. Entry appears at top of Journal list
10. User returns to **Charts** to continue trading

**Release Mapping**:
- ✅ **MVP**: Steps 1–9 (title, setup, emotion, notes)
- 🚀 **Release 1**: AI auto-generates sentiment and advice (step 6+)
- 🎮 **Release 1**: XP earned notification shows immediately after save

---

### Journey 2: "Monitor Price Targets" (MVP – ~2 min setup + ongoing)

**Actor**: Trader wanting to automate position monitoring

**Goal**: Set price alerts and receive notifications when targets are hit

**Steps**:
1. User taps **Alerts** tab
2. Taps **"New Alert"** button
3. **[MVP]** Searches and selects token (e.g., "SOL")
4. **[MVP]** Chooses trigger type ("Price Above" or "Price Below")
5. **[MVP]** Enters price level (e.g., "$250")
6. **[MVP]** Taps **"Create Alert"**
7. System arms alert and waits for price movement
8. **[MVP]** When price hits target → web push notification fires
9. **[MVP]** User can see fired alert in Notifications tab
10. User disarms alert or deletes if no longer needed

**Release Mapping**:
- ✅ **MVP**: Steps 1–10 (basic alert creation and notification)
- 🚀 **Release 1**: Edit alert without recreating (step 5)
- 📊 **Release 1**: Alert history with analytics (step 9)

---

### Journey 3: "Chart Analysis & Trade Setup" (MVP – ~5 min)

**Actor**: Technical analyst researching a potential entry

**Goal**: Analyze price action on multiple timeframes and document setup

**Steps**:
1. User taps **Charts** tab
2. **[MVP]** Searches token (e.g., "BTC/USD")
3. **[MVP]** Selects timeframe (e.g., "1h")
4. **[MVP]** Views candlestick chart with price history
5. **[MVP]** Uses annotation tools to mark support/resistance
6. **[MVP]** Clicks "Save Trade from Chart"
7. **[MVP]** Quick entry dialog pre-fills with symbol and current price
8. **[MVP]** User adds setup type, emotion, notes
9. **[MVP]** Taps **"Save Entry"** → journal entry created
10. User continues analyzing or switches token

**Release Mapping**:
- ✅ **MVP**: Steps 1–9 (basic charting + save to journal)
- 🚀 **Release 1**: Setup detection highlights patterns (step 4+)
- 🚀 **Release 1**: Replay mode to backtest (step 4)
- 📊 **Release 2**: Playbook matching shows similar past wins (step 4)

---

### Journey 4: "Review Trading Performance" (MVP – ~5 min)

**Actor**: Trader doing weekly performance review

**Goal**: Analyze win rate, identify best setups, reflect on psychology

**Steps**:
1. User taps **Dashboard** tab
2. **[MVP]** Views KPI strip: trade count, win rate, streak
3. **[MVP]** Scrolls to see recent activity feed
4. User taps **Journal** tab
5. **[MVP]** Views all entries sorted newest first
6. **[MVP]** Filters by "Status" → selects "win"
7. **[MVP]** Reviews winning trades to identify patterns
8. **[MVP]** Filters by "Setup" → selects "breakout"
9. **[MVP]** Calculates win rate for breakout setups
10. User opens specific winning entry to read notes
11. **[Release 1]** Views AI sentiment analysis and insights
12. User identifies that breakouts have highest win rate

**Release Mapping**:
- ✅ **MVP**: Steps 1–10 (basic filtering and review)
- 📊 **Release 1**: AI insights and sentiment (step 11)
- 🎮 **Release 1**: XP badges highlight achievements (step 2)

---

### Journey 5: "Monitor Market Opportunities" (MVP – ~3 min setup + ongoing)

**Actor**: Trader wanting quick overview of token prices

**Goal**: Track watchlist and find gainer/loser tokens

**Steps**:
1. User taps **Watchlist** tab
2. **[MVP]** Views list of monitored tokens with current prices
3. **[MVP]** Sees real-time price updates as they flow in
4. **[MVP]** Notices a token is up 15% (green highlight)
5. **[MVP]** Taps token to view price details
6. User can optionally navigate to **Charts** to analyze further
7. **[MVP]** Adds new token: searches "BONK" → taps **"Add to Watchlist"**
8. New token appears in watchlist with live price feed
9. User continues trading or exits app

**Release Mapping**:
- ✅ **MVP**: Steps 1–9 (watchlist with real-time prices)
- 🔥 **Release 1**: Trend filtering (gainers, losers, volatile) (step 4)
- 🎯 **Release 1**: One-click create alert from watchlist (step 5)

---

### Journey 6: "Understand Market Sentiment" (Release 1)

**Actor**: Trader wanting to assess risk of potential investments

**Goal**: Check sentiment analysis and threat scoring before entering token

**Steps**:
1. User identifies potential token to trade
2. User taps **Oracle** tab
3. **[Release 1]** Searches token in sentiment reports
4. **[Release 1]** Views threat score (0-100) with explanation
5. **[Release 1]** Reads bot score and market structure analysis
6. **[Release 1]** Reviews confidence level of analysis
7. Threat score is high (80+) → user decides to skip trade (risk mitigation)
8. User marks report as read for later reference
9. User browses other tokens with low threat scores

**Release Mapping**:
- 🚀 **Release 1**: Steps 1–9 (GrokPulse sentiment and threat scoring)
- 📊 **Release 2**: Trend tracking shows emerging opportunities (step 4)

---

## 4. AI & Provider Integrations

### 4.1 Market Data Provider Chain

**Primary Chain**: Moralis (1500 req/min) → DexPaprika (300 req/min) → DexScreener (client-side fallback)

| Provider | Endpoint | Data Type | Rate Limit | Fallback To | Use Case |
|----------|----------|-----------|-----------|------------|----------|
| **Moralis** | `/api/moralis/token` | Token price, OHLC, metadata, volume, market cap, whale activity | 1500 req/min, 40K req/day | DexPaprika | Primary source for all market data |
| **DexPaprika** | API endpoint | Token metadata, OHLC, volume | 300 req/min | DexScreener | Secondary if Moralis rate-limited |
| **DexScreener** | Client-side API | DEX token search, OHLC data | 300 req/min | None | Tertiary client-side fallback |
| **CoinGecko** | API endpoint (legacy) | Token metadata, market cap | Unlimited | — | Historical/low-priority data |

**Health Tracking**: TelemetryService monitors API latency, error rates, and availability per provider. If provider health degrades, system auto-shifts to next in chain.

**Risk**: If all providers down → app can still display cached data but no live price updates until restored.

**Activation**: MVP uses live Moralis; Release 1 adds DexPaprika fallback handling.

---

### 4.2 AI Services

| Service | Type | Use Case | Input | Output | Release |
|---------|------|----------|-------|--------|---------|
| **OpenAI LLM (GPT-4/3.5)** | Text generation | Journal entry sentiment analysis, advice generation, pattern descriptions | Journal entry notes, emotions, setup type | Sentiment label, trade psychology advice, key insights | Release 1 |
| **GrokPulse (Custom Engine)** | Sentiment analysis | Threat scoring, sentiment assessment, trend detection | Token metadata, market data, on-chain metrics, bot behavior | Threat score (0-100), confidence level, reasoning, trend flags | Release 1 |
| **Cortex (Moralis API)** | Advanced insights | On-chain pattern matching, whale activity alerts | Token address, historical transactions | Whale transactions, risk scoring, manipulation detection | Release 2 |

**Risk**: If AI services are down → core app functionality (journaling, charting) still works; only AI insights degrade gracefully.

**Data Privacy**: Journal entries are processed locally when possible; only sent to OpenAI/GrokPulse if user opts into AI insights (Release 1).

---

### 4.3 Authentication & Wallet Integration

| Service | Type | Purpose | Release |
|---------|------|---------|---------|
| **Web3 Wallet (MetaMask, WalletConnect)** | Authentication | Connect user wallet for portfolio tracking and position monitoring | Release 2 |
| **Etherscan / Solscan API** | On-chain data | Fetch wallet positions, balance history, transaction data | Release 2 |

**MVP**: App works completely anonymously; Release 2 adds optional wallet connection for portfolio features.

---

### 4.4 Notifications & Push System

| Service | Type | Purpose | Release |
|---------|------|---------|---------|
| **Web Push API** | Notifications | Send browser notifications when alerts fire | MVP |
| **Workbox Service Worker** | Background sync | Queue notifications and retry delivery if offline | MVP |

**Behavior**: When alert triggers, app sends push notification immediately. If user is offline, PushQueueStore queues notification and retries on reconnect.

---

### 4.5 Infrastructure & APIs

| Service | Purpose | Release |
|---------|---------|---------|
| **Vercel Functions** | Proxy API calls to Moralis, DexPaprika to avoid CORS issues | MVP |
| **Dexie/IndexedDB** | Offline-first local storage for all app data | MVP |
| **Tesseract.js (OCR)** | Extract price/time data from chart screenshots (lazy-loaded) | Release 1 |
| **Driver.js (Onboarding)** | Interactive product tour for new users (lazy-loaded) | Release 1 |

---

## 5. Data Flows & Dependencies

### 5.1 Journal Entry Creation Flow

```
User Action: Create Journal Entry
        ↓
Input: Title, Setup, Emotion, Notes
        ↓
JournalService.createEntry()
        ├─ Generate unique ID (UUID)
        ├─ Add timestamp
        └─ Store to Dexie/IndexedDB
        ↓
journalStore.addEntry() ← Update Zustand state
        ↓
EventBus.publish('JournalEntryCreated')
        ↓
[Release 1] AI Insights Request → OpenAI LLM
        │ ├─ Input: Notes, setup, emotion
        │ └─ Output: Sentiment, advice
        │
[Release 1] GamificationStore → Award XP
        │
UI Re-render: Entry appears at top of list
        ↓
User Notification: "Entry saved" + XP gained
```

**Key Dependencies**:
- Title is required (validation pre-save)
- Dexie must be initialized (offline storage)
- EventBus active to trigger side effects
- OpenAI API available for Release 1 insights

---

### 5.2 Alert Trigger & Notification Flow

```
User Action: Create Price Alert
        ↓
Input: Token, Trigger Type, Price Level
        ↓
AlertsStore.createAlert()
        ├─ Fetch current price from MarketOrchestrator
        └─ Store alert to Dexie
        ↓
LiveDataManager.subscribeToPrice(token)
        ├─ Start polling Moralis for price updates
        └─ Cache in liveDataStore
        ↓
[Ongoing] Price updates from provider
        ↓
livePriceComparator checks: isPriceAbove() or isPriceBelow()
        ↓
[MATCH] Alert condition triggered
        ↓
AlertsStore.updateAlertStatus('triggered')
        ↓
PushQueueStore.queueNotification()
        ↓
Web Push API sends notification to browser
        ↓
User receives notification: "SOL hit $250"
        ↓
User can tap → navigate to Chart or view Alert details
```

**Key Dependencies**:
- Moralis/MarketOrchestrator healthy for live prices
- LiveDataStore active subscriptions
- Web Push API permissions granted by user
- Dexie for persistence

---

### 5.3 Chart Display & Data Flow

```
User Action: Switch to Charts Tab
        ↓
chartUiStore.setSymbol('SOL')
chartUiStore.setTimeframe('1h')
        ↓
ChartComponent requests OHLC data
        ↓
MarketOrchestrator.getOHLC(symbol, timeframe)
        ├─ Try Moralis first
        ├─ If rate-limited → try DexPaprika
        ├─ If DexPaprika fails → try DexScreener
        └─ If all fail → return cached data (graceful degradation)
        ↓
TelemetryService logs provider latency & health
        ↓
LightweightCharts renders candlestick chart
        ↓
[MVP] User can draw annotations
        ↓
[Release 1] SignalOrchestrator detects patterns
        ├─ Compares price action to known setups
        └─ Highlights breakouts, pullbacks, etc.
```

**Key Dependencies**:
- At least one provider healthy (Moralis, DexPaprika, or DexScreener)
- OHLC data must be available or cached
- Lightweight Charts library loaded
- Chart annotations stored in IndexedDB

---

### 5.4 Watchlist Real-Time Update Flow

```
User Action: View Watchlist
        ↓
WatchlistStore.loadEntries() from Dexie
        ↓
For each token in watchlist:
        ├─ LiveDataManager.subscribeToPrice(token)
        └─ Request price from Moralis/DexScreener
        ↓
[Ongoing] Price feed arrives in real-time
        ↓
liveDataStore updates price for each token
        ↓
WatchlistComponent watches liveDataStore
        ↓
React re-renders list with new prices
        ├─ Green for positive change %
        └─ Red for negative change %
        ↓
User sees live updates without refreshing
```

**Key Dependencies**:
- LiveDataManager subscriptions active
- Moralis/DexScreener APIs responsive
- liveDataStore Zustand connected to component

---

### 5.5 GrokPulse Sentiment Analysis (Release 1)

```
User Action: View Oracle Tab
        ↓
OracleStore.loadReports() from Dexie (cached)
        ↓
[On demand] GrokPulseEngine.analyzeToken(symbol)
        ├─ Fetch token metadata from Moralis
        ├─ Fetch on-chain activity from Cortex
        ├─ Analyze bot behavior (heuristics)
        ├─ Calculate threat score (0-100)
        └─ Generate reasoning
        ↓
ContextBuilder merges multiple data sources:
        ├─ Price history & volatility
        ├─ Volume & whale concentration
        ├─ Meme/trend flags
        └─ Market structure
        ↓
Result cached to Dexie
        ↓
OracleStore updates with report
        ↓
UI displays: Threat Score, Bot Score, Trends, Market Structure
```

**Key Dependencies**:
- Moralis API available for token data
- GrokPulse engine heuristics operational
- Cortex API (Moralis) for whale activity
- Dexie for caching reports

**Data Privacy**: Token analysis data cached locally; only aggregated metrics sent to telemetry.

---

## 6. UI/UX Flow & Interaction Model

### 6.1 Entry Point & Navigation

```
User opens app
        ↓
[First time] Display onboarding tour (Driver.js)
[Returning user] Skip to Dashboard
        ↓
Bottom Tab Navigation (persistent)
├─ Journal (default)
├─ Charts
├─ Dashboard
├─ Alerts
├─ Watchlist
└─ Settings
```

**Mobile-First Design**:
- Portrait: Stack all tabs vertically at bottom
- Landscape: Tab bar may collapse or switch to side menu
- All touch targets ≥ 44px

---

### 6.2 Page Layout Patterns

#### Journal V2 Layout
```
┌─────────────────────────────────┐
│  Journal V2          [New Entry] │
├─────────────────────────────────┤
│ Filters: [Setup ▼] [Emotion ▼]  │
│          [Status ▼]             │
├─────────────────────────────────┤
│ Entry List (scrollable)         │
│ ┌─────────────────────────────┐ │
│ │ SOL Breakout Above $210  ❌ │ │ ← Active Entry
│ │ 2h ago | setup: Breakout    │ │
│ │ emotion: Confident          │ │
│ └─────────────────────────────┘ │
│ ┌─────────────────────────────┐ │
│ │ BTC Pullback to $45K        │ │
│ │ 5h ago | setup: Retest      │ │
│ └─────────────────────────────┘ │
└─────────────────────────────────┘

[If entry selected, show right panel:]
┌─────────────────────────────────┐
│ Entry Detail Panel              │
├─────────────────────────────────┤
│ Title: SOL Breakout Above $210  │
│ Setup: Breakout | Emotion: Sure │
│ Notes: [Edit mode toggle]       │
│ Notes content...                │
│                                 │
│ [Release 1]                     │
│ AI Insights:                    │
│ - Sentiment: Optimistic         │
│ - Advice: Consider taking $...  │
│                                 │
│ Journey Progress: +50 XP        │
│                                 │
│ [Share] [Edit] [Delete]         │
└─────────────────────────────────┘
```

#### Charts Layout
```
┌─────────────────────────────────┐
│ SOL/USD [⚙️ Settings]           │
├─────────────────────────────────┤
│ [1m] [5m] [1h] [4h] [1d] [W] [M]│
├─────────────────────────────────┤
│                                 │
│      [Candlestick Chart]        │
│      Lightweight Charts          │
│                                 │
│                                 │
├─────────────────────────────────┤
│ [📈 Indicators] [✏️ Annotate]   │
│ [Save Trade] [Replay]           │
└─────────────────────────────────┘
```

#### Dashboard Layout
```
┌─────────────────────────────────┐
│ Dashboard                       │
├─────────────────────────────────┤
│ KPI Strip:                      │
│ [Trades: 23] [Win Rate: 62%]    │
│ [Streak: 5d] [Level: Warrior]   │
├─────────────────────────────────┤
│ Quick Actions:                  │
│ [+ New Entry] [⏲️ New Alert]   │
│                                 │
│ Recent Activity:                │
│ • 2h ago: Entered BONK trade    │
│ • 1h ago: Alert SOL hit $250    │
│ • 45m ago: Reviewed BTC setup   │
│                                 │
│ [View All in Journal]           │
└─────────────────────────────────┘
```

---

### 6.3 Interaction Patterns

#### Modal Dialog (New Entry / New Alert)
```
┌───────────────────────────────────┐
│ Create New Alert           [✕ Close]
├───────────────────────────────────┤
│ Token:        [SOL            ▼]  │
│ Trigger:      [Price Above    ▼]  │
│ Price Level:  [$250.00        ]   │
│                                   │
│ [Validation Error] (if invalid)   │
│                                   │
│               [Cancel] [Create]   │
└───────────────────────────────────┘
```

#### Dropdown Filter
```
[Setup ▼]
├─ All
├─ Breakout
├─ Retest
├─ Pullback
├─ Failed Breakout
└─ Other
```

#### Inline Edit (Journal Entry Notes)
```
[View Mode]
Notes: User set take profit at $300...
[Edit] [Share] [Delete]

[Edit Mode - Click Edit]
Notes: [Text input with auto-focus]
[Save] [Cancel]
```

---

### 6.4 Example User Journeys as Visual Flows

#### Journey: "Create Alert While Trading"

```
Trading → Spot SOL opportunity
        ↓
Open App (PWA already open)
        ↓
Tap [Alerts] tab
        ↓
Tap [New Alert] button
        ↓
Modal appears: "Create Alert"
        ↓
Input: Token = SOL, Type = Above, Price = $260
        ↓
Tap [Create] button
        ↓
✅ Alert created notification
        ↓
Modal closes
        ↓
Return to trading with alert armed
        ↓
[Later] Price hits $260 → Web push fires
```

#### Journey: "End-of-Day Trade Review"

```
Trading finished for the day
        ↓
Open App
        ↓
Tap [Journal] tab
        ↓
Scroll through today's entries
        ↓
Click on winning entry
        ↓
Read notes and entry details
        ↓
[Release 1] View AI insights panel
        ↓
Understand psychology of the win
        ↓
Filter by [Setup = Breakout]
        ↓
Calculate: 5 breakout trades, 4 wins = 80% win rate
        ↓
Decide: Focus more on breakout setups tomorrow
```

---

## 7. Release Plan & Feature Roadmap

### 7.1 Feature Matrix by Release

| Feature | Page/Tab | AI/Provider | MVP | Release 1 | Release 2 | Notes |
|---------|----------|------------|-----|-----------|-----------|-------|
| **Create Journal Entry** | Journal | — | ✅ | — | — | Core feature |
| **View Entry List** | Journal | — | ✅ | — | — | With filtering |
| **Edit/Delete Entry** | Journal | — | ✅ | — | — | |
| **Filter by Setup/Emotion/Status** | Journal | — | ✅ | — | — | |
| **AI Sentiment & Insights** | Journal | OpenAI | — | ✅ | — | Release 1 |
| **Social Preview & Share** | Journal | — | — | ✅ | — | Release 1 |
| **Export Journal** | Journal | — | — | ✅ | — | JSON/MD/CSV |
| **Pattern Analytics (Win Rate)** | Journal | — | ✅ | — | — | |
| **Gamification (XP/Badges)** | Journal, Dashboard | — | — | ✅ | — | Release 1 |
| | | | | | | |
| **Interactive Charts** | Charts | Moralis, DexPaprika | ✅ | — | — | Multi-timeframe |
| **Annotations** | Charts | — | ✅ | — | — | Draw on chart |
| **Save Trade from Chart** | Charts | — | ✅ | — | — | |
| **Replay Mode** | Charts | ReplayService | — | ✅ | — | Release 1 |
| **Setup Detection** | Charts | SignalOrchestrator | — | ✅ | — | Release 1 |
| **Playbook Matching** | Charts | SignalOrchestrator | — | — | ✅ | Release 2 |
| | | | | | | |
| **Dashboard KPI Strip** | Dashboard | — | ✅ | — | — | Minimal MVP |
| **Performance Metrics** | Dashboard | — | ✅ | — | — | |
| **Activity Feed** | Dashboard | EventBus | ✅ | — | — | |
| **Quick Actions** | Dashboard | — | ✅ | — | — | |
| | | | | | | |
| **Create Price Alert** | Alerts | Moralis, LiveData | ✅ | — | — | |
| **View Alert List** | Alerts | — | ✅ | — | — | |
| **Arm/Disarm Alert** | Alerts | — | ✅ | — | — | |
| **Delete Alert** | Alerts | — | ✅ | — | — | |
| **Edit Alert** | Alerts | — | — | ✅ | — | Release 1 |
| **Push Notification** | Alerts, Notifications | Web Push | ✅ | — | — | |
| | | | | | | |
| **Add/Remove Watchlist** | Watchlist | Moralis | ✅ | — | — | |
| **Real-Time Prices** | Watchlist | LiveDataManager | ✅ | — | — | |
| **Sort by Price/Change** | Watchlist | — | ✅ | — | — | |
| **Trend Filter (Gainers/Losers)** | Watchlist | — | — | ✅ | — | Release 1 |
| | | | | | | |
| **View Sentiment Reports** | Oracle | GrokPulse | — | ✅ | — | Release 1 |
| **Threat Scoring** | Oracle | GrokPulse | — | ✅ | — | Release 1 |
| **Bot Score Analysis** | Oracle | GrokPulse Heuristics | — | ✅ | — | Release 1 |
| **Market Structure Insights** | Oracle | Moralis, Heuristics | — | ✅ | — | Release 1 |
| **Trend Detection** | Oracle | GrokPulse | — | ✅ | — | Release 1 |
| **Theme Filtering** | Oracle | OracleStore | — | ✅ | — | Release 1 |
| | | | | | | |
| **Active Signals List** | Signals | SignalOrchestrator | — | ✅ | — | Release 1 |
| **Filter by Pattern** | Signals | SignalDb | — | ✅ | — | Release 1 |
| **Signal Strength Score** | Signals | SignalOrchestrator | — | ✅ | — | Release 1 |
| | | | | | | |
| **Notification History** | Notifications | — | ✅ | — | — | Basic MVP |
| **Mark Read/Clear** | Notifications | — | — | ✅ | — | Release 1 |
| | | | | | | |
| **Theme Toggle** | Settings | — | ✅ | — | — | |
| **Language Selection** | Settings | — | — | ✅ | — | Release 1 |
| **OCR Scanning** | Settings | Tesseract.js | — | ✅ | — | Release 1 |
| **Wallet Connection** | Settings | Web3 | — | — | ✅ | Release 2 |
| **Export All Data** | Settings | ExportService | — | — | ✅ | Release 2 |
| | | | | | | |
| **View Generated Lessons** | Lessons | OpenAI | — | — | ✅ | Release 2 |
| **Lesson Content** | Lessons | — | — | — | ✅ | Release 2 |
| | | | | | | |
| **Replay Date Range** | Replay | ReplayService | — | — | ✅ | Release 2 |
| **Replay with Speed Control** | Replay | — | — | — | ✅ | Release 2 |
| **Create Entry During Replay** | Replay | JournalService | — | — | ✅ | Release 2 |
| | | | | | | |
| **Pattern Detection** | Analysis | SignalOrchestrator | — | — | ✅ | Release 2 |
| **Playbook Matching** | Analysis | SignalOrchestrator | — | — | ✅ | Release 2 |

---

### 7.2 Release Timeline & Milestones

**MVP (Launch)**:
- Core journaling (CRUD, filtering)
- Basic charting (price visualization, annotations)
- Price alerts (create, arm/disarm, push notifications)
- Watchlist (real-time prices)
- Dashboard (KPI, activity feed)
- Notifications (basic history)
- Settings (theme)
- **Target**: ~6–8 weeks from start
- **Focus**: User can journal trades, set alerts, monitor tokens

**Release 1 (~4–6 weeks after MVP)**:
- AI journal insights (sentiment, advice via OpenAI)
- Gamification (XP, badges, journey phases)
- GrokPulse Oracle (threat scoring, sentiment analysis)
- Signal detection (pattern recognition)
- Replay mode (backtest historical prices)
- OCR scanning (extract price from screenshots)
- Enhanced watchlist (trend filtering)
- Product tours (Driver.js)
- **Focus**: Gamify and AI-power the core journaling experience

**Release 2 (~4–6 weeks after Release 1)**:
- Wallet connection (MetaMask, portfolio tracking)
- Lessons (AI-generated learning from trades)
- Advanced replay (speed control, create entries during replay)
- Analysis page (pattern detection, playbook matching)
- Full export (backup all data)
- **Focus**: Portfolio integration and advanced learning

---

### 7.3 Go-to-Market Strategy

**MVP Launch**:
1. Soft launch to closed beta (50–100 early traders)
2. Gather feedback on journal UX, alert reliability, chart usability
3. Monitor: journal entry creation rate, alert accuracy, user retention
4. Key metrics: DAU, journal entries/day, alert creation rate

**Release 1 (Gamification + AI)**:
1. Launch when MVP metrics show strong engagement (>60% DAU return rate)
2. Activate AI insights and gamification to drive habit formation
3. Introduce GrokPulse to differentiate from competitors
4. Measure: XP streak adoption, journal completion rate, Oracle usage

**Release 2 (Portfolio Integration)**:
1. Add wallet connection for power users wanting portfolio tracking
2. Introduce lessons for educational positioning
3. Enable advanced replay for serious technical traders
4. Measure: wallet connection rate, lesson completion, replay usage

---

## 8. Summary & Key Takeaways

### MVP Scope (Launch-Ready)
- ✅ Trading journal with setup/emotion/status filtering
- ✅ Interactive charts with technical analysis tools
- ✅ Price alerts with push notifications
- ✅ Watchlist with real-time pricing
- ✅ Dashboard with KPI overview
- ✅ Offline-first architecture (Dexie)
- ✅ Multi-provider market data (Moralis + DexPaprika fallback)
- ✅ No AI required (graceful degradation in Release 1)
- ✅ No wallet integration (MVP works anonymously)

### Release 1 Unlocks (4–6 weeks)
- 🚀 AI journal insights (OpenAI)
- 🚀 Gamification (XP, badges, journey phases)
- 🚀 GrokPulse sentiment analysis
- 🚀 Signal detection and pattern matching
- 🚀 Replay mode for backtesting

### Release 2 Matures (4–6 weeks)
- 📊 Wallet integration and portfolio tracking
- 📊 AI-generated lessons
- 📊 Advanced chart analysis with playbook matching
- 📊 Full data export

### Core Architectural Advantages
1. **Offline-First**: Works without network; syncs when reconnected
2. **Multi-Provider Resilience**: Automatic fallback if primary provider fails
3. **Event-Driven**: Loose coupling between journal, charts, alerts
4. **Lazy Loading**: Heavy features (OCR, tours, charts) only load when needed
5. **Privacy-Conscious**: Minimal data sent to external services by default

### Success Metrics
- **Engagement**: >60% daily active users return after MVP
- **Journaling**: >5 entries/user/week
- **Alerts**: >80% alert accuracy (fires at correct price)
- **Performance**: <2s chart load time, <500ms alert response
- **Retention**: >40% retained after 4 weeks

---

**Next Steps**:
1. Validate MVP scope with design team
2. Finalize data schema and Dexie structure
3. Build authentication/onboarding flow (if needed)
4. Set up CI/CD pipeline and monitoring
5. Begin MVP implementation sprints
6. Plan Release 1 AI integration work

---

**Document Maintainers**: Product Team, Engineering Lead
**Last Review**: 2025-12-11
**Next Review**: After MVP launch feedback
