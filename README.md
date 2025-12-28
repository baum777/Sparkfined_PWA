# ⚡ Sparkfined

> **From Chaos to Mastery** — Your Offline-First Trading Command Center for Crypto Markets

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](package.json)
[![PWA](https://img.shields.io/badge/PWA-enabled-brightgreen.svg)](https://web.dev/progressive-web-apps/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

**[🚀 Launch App](https://sparkfined.vercel.app)** • **[📖 Documentation](./docs)** • **[💬 Discord](https://discord.gg/sparkfined)** • **[🐦 Twitter](https://twitter.com/sparkfined)**

---

## ⚡ Quick Start

```bash
# 1. Clone & Setup
git clone <repo-url>
cd sparkfined-pwa
pnpm install

# 2. Config
cp .env.example .env.local
# Add your RPC URL (optional for dev, defaults to mainnet public)

# 3. Run
pnpm dev
```

## 🛠️ Tech Stack

### Frontend
- **React 18.3** + **Vite 5.4**
- **TypeScript 5.8**
- **TailwindCSS 3.4**
- **Zustand** (State)
- **Dexie** (Offline DB)
- **Solana Wallet Adapter**

### Quality Gates
- **Typecheck:** `pnpm typecheck`
- **Lint:** `pnpm lint`
- **Tests:** `pnpm test` (Unit) + `pnpm test:e2e` (Playwright)

## ⚠️ Known Limitations
- **Market Data:** Uses public CoinGecko API (rate-limited). Connect custom API key in `src/lib/api/market.ts` for production.
- **RPC:** Default public RPC may be slow. Set `VITE_SOLANA_RPC_URL` for better performance.
- **Mobile:** PWA installable, but push notifications require service worker configuration (in progress).


---

## 🎯 What is Sparkfined?

**Stop trading blind. Start trading smart.**

**Sparkfined** is an **offline-first Progressive Web App (PWA)** that transforms how crypto traders learn, reflect, and improve. Built by traders for traders, it combines:

- 📊 **Professional charting** with 30+ technical indicators
- 🔔 **Smart alerts** that work while you sleep  
- 📝 **AI-powered journaling** to track your evolution
- 🎮 **Trade replay** to learn from past mistakes
- 🧠 **Behavioral insights** to spot your blind spots

Unlike generic charting platforms, Sparkfined doesn't just show you data — it helps you **understand yourself** through systematic reflection and AI-driven analysis. Your edge isn't the chart. It's what you DO with it.

### 🎯 Built For

- 🚀 **Day Traders** breaking FOMO loops and revenge-trade cycles
- 🔥 **Meme Coin Traders** who need structure in market chaos  
- 📈 **Swing Traders** tracking multi-day positions
- 🧠 **Self-Improvement Traders** who journal consistently
- 🎯 **Disciplined Learners** tired of repeating the same mistakes

---

## 💡 Why Sparkfined?

### The Problem We Solve

You're losing money. Not because you lack charts or indicators, but because:

| Pain Point | The Reality |
|-----------|-------------|
| 📉 **Missed Breakouts** | *"Set alert at $50k, woke up to $52k. FML."* |
| 🧠 **Trade Amnesia** | *"Why did I enter this? Was it FOMO or setup?"* |
| 📱 **Desktop-Only Tools** | *"Can't draw trendlines on my phone at 3am."* |
| 💸 **Subscription Hell** | *"$50/month for basic alerts? Really?"* |
| 🔄 **Scattered Tools** | *"TradingView + Telegram + Twitter + 12 tabs..."* |

**The truth:** You don't need more indicators. You need more **discipline**. More **self-awareness**. More **systematic reflection**.

### The Solution: Three Pillars

Sparkfined gives you what matters most:

#### 💎 **1. Clarity Over Chaos**
Professional charting that works **offline**. Canvas-based 60fps rendering, 30+ technical indicators, drawing tools, multi-timeframe analysis. Your command center in your pocket.

#### 📜 **2. Memory Over Instinct**  
Trading journal with AI compression, OCR screenshot analysis, emotion tracking, pattern recognition. Your instinct lies. Your data doesn't.

#### 🔑 **3. Sovereignty Over Dependency**
Local-first storage, no vendor lock-in, works offline, your data stays yours. You own your strategy. You own your journey.

---

## ✨ Core Features

### 📊 **Dashboard — Your Command Center**

**Why it matters:** One place to see everything that matters.

```
✅ KPI Strip (Net P&L, Win Rate, Alert Count, Journal Streak)
✅ Market Bias Card (AI-powered daily insights)
✅ Holdings Snapshot (connected wallet tracking)
✅ Recent Trades (quick access to journal history)
✅ Quick Actions (FAB for mobile — Log entry, Create alert)
✅ StateView Pattern (clear loading/error/empty/offline states)
```

**Your trading command center in one glance.**

---

### 📝 **Journal — Behavioral Pipeline with Offline-First**

**Why it matters:** Consistent journaling separates profitable traders from those who repeat mistakes.

```
✅ Offline-First (IndexedDB via Dexie — works without internet)
✅ Archetype Scoring System (0-100 behavioral analysis)
✅ Immediate Insights (AI feedback right after submission)
✅ Trade Event Integration (Log Entry Inbox → Journal flow)
✅ Emotional State Tracking (emoji selectors, confidence sliders)
✅ Market Context (regime selector, thesis tags)
✅ Export to Markdown/CSV (own your data forever)
✅ Version Tracking (evolution over time)
```

**Log every trade. Especially the painful ones.**

---

### 📊 **Charts — Professional Analysis Tools**

**Why it matters:** You can't trade what you can't see clearly.

```
✅ Multi-Timeframe Analysis (15m, 1h, 4h, 1d)
✅ Indicator Presets (Scalper, Swing, Position setups)
✅ Annotations System (journal entries, alerts, pulse signals in chart)
✅ Replay Mode (time-travel through historical data)
✅ Works Offline (PWA architecture with cached snapshots)
✅ Mobile-Optimized (trade analysis anywhere)
🚧 Drawing Tools (trendlines, fibonacci — Q2 2025)
🚧 Volume Profile+ (advanced indicators — Q2 2025)
```

**Professional charting without subscription hell.**

---

### 🔔 **Alerts — Never Miss a Breakout**

**Why it matters:** The market never sleeps. But you have to.

```
✅ Status Filters (All, Armed, Triggered, Paused — Pills design)
✅ Type Filters (Price-above, Price-below)
✅ URL State Sync (share alerts via ?alert=id)
✅ 2-Column Layout (list + detail panel, responsive on mobile)
✅ Quick Actions (Snooze, Edit, Delete with optimistic UI)
🚧 Multi-Condition Rules (price + volume + indicators — Q2 2025)
🚧 Push Notifications (desktop + mobile — Q1 2025)
🚧 Backtest Mode (see historical triggers — Q2 2025)
```

**Set it. Track it. Get notified.**

---

### 📋 **Watchlist — Session-Based Multi-Asset Tracking**

**Why it matters:** Trade smarter by focusing on the right session.

```
✅ Session Filters (All, London, NY, Asia)
✅ Sort Modes (Default, Top Movers, Alphabetical)
✅ Detail Panel (token info, sentiment teaser, trend data)
✅ Direct Chart Links (Open Chart, Open Replay)
✅ Offline Banner (shows cached prices when disconnected)
```

**Session-aware trading eliminates bad timing.**

---

### 🎯 **Navigation — AppShell with Rail & ActionPanel**

**Why it matters:** Clean UI means less distraction, more focus.

```
✅ AppShell Architecture (Topbar + Rail + Canvas + ActionPanel)
✅ Icon-First Rail (60px collapsed, 240px expanded)
   📊 Dashboard
   ✎ Journal  
   ⌁ Chart
   ★ Watchlist
✅ Route-Aware ActionPanel (context-dependent inspector tools)
✅ Responsive Design (Rail collapses on mobile, ActionPanel desktop-only xl+)
✅ Persistent UI States (localStorage for panel preferences)
```

**Minimal distraction. Maximum context.**

---

### 🎮 **Journey System — From Degen to Sage**

**Why it matters:** Trading is a craft. Mastery comes from discipline, not luck.

Track your **evolution** through five phases:

```
💀 DEGEN    → Chasing pumps, pure emotions, no system
🔍 SEEKER   → Building awareness, testing setups
⚔️  WARRIOR  → Following rules, managing risk
👑 MASTER   → Consistent edge, pattern recognition
🧙 SAGE     → Wisdom, mentorship, teaching others
```

**Earn XP for:**
- ✅ Journaling every trade (consistency > profits)
- ✅ Following your setup (discipline > FOMO)
- ✅ Respecting stop-losses (survival > revenge)
- ✅ Daily streaks (showing up > short bursts)

**The truth:** You don't need more indicators. You need more discipline.

---

### 🧠 **AI-Powered Behavioral Insights**

**Why it matters:** You can't fix patterns you don't see. AI spots them for you.

Analyze your journal entries and get **evidence-based insights** in 5 categories:

```
🔄 BEHAVIOR LOOPS
   "You FOMO into breakouts already +30% from lows.
    This leads to late entries and high drawdown risk."

⏰ TIMING PATTERNS
   "Your worst trades happen after 8 PM.
    Fatigue leads to revenge trading."

💰 RISK MANAGEMENT
   "You size 3x larger on revenge trades vs. planned setups.
    This blows your account faster."

📋 SETUP DISCIPLINE
   "You take 2x more trades on weekends (but 15% lower win rate).
    Overtrading when bored."

😡 EMOTIONAL PATTERNS
   "After 2 losses in a row, you double position size.
    This turns small losses into wipeouts."
```

**How it works:**
1. Select journal entries for analysis
2. Click "Generate Insights" (~30 seconds)
3. Get concrete insights with **actionable recommendations**
4. See which trades support each insight (evidence, not guesses)

**AI doesn't tell you *what* to trade. It tells you *how* you're sabotaging yourself.**

---

### 🔒 Offline-First — Your Data, Your Control

**Why it matters:** Internet fails. APIs go down. Your journal shouldn't depend on anyone's server.

Sparkfined is a **Progressive Web App (PWA)** built to work offline:

- **Install from browser** — no App Store, no gatekeepers
- **Write journal entries offline** — they sync when you're back online
- **Cache your trades locally** — always accessible, even on a plane
- **Own your data** — everything lives on your device first

**The promise:** Your trading journey belongs to you. Not to a cloud service.

---

### 🎨 Built for Traders, Not Tourists

Most crypto dashboards are built for casual investors checking prices once a day. Sparkfined is built for **traders** — people who spend hours analyzing, journaling, and refining their edge.

**Design principles:**
- **Dark-mode-first** — reduce eye strain during late-night sessions
- **Information-dense** — see more data, scroll less
- **One-click actions** — save journal, generate insights, filter entries instantly
- **Offline-capable** — no internet required for core features

---

## 🛠️ Tech Stack

### Frontend (The Fast Stuff)
```typescript
⚡ React 18.3          // UI framework
📘 TypeScript 5.6      // Type safety (strict mode)
🎨 TailwindCSS 4.1     // Dark-mode-first design
🏪 Zustand             // State management (<1KB)
💾 Dexie               // IndexedDB wrapper (offline storage)
🧭 React Router 6      // Client-side routing
⚙️  Vite 5.4           // Build tool (blazing fast HMR)
```

### Backend (The Serverless Magic)
```typescript
🌐 Vercel Edge Functions  // Serverless API (Node 18+)
🤖 OpenAI API (gpt-4o-mini) // AI insights & analysis
🦾 xAI Grok              // Crypto-native reasoning (optional)
```

### PWA & Offline (The Resilience)
```typescript
📦 vite-plugin-pwa + Workbox  // Service Worker
💿 ~428KB precache           // Static assets cached
🔄 Cache strategies          // Precache, Cache-First, Network-First
```

### Testing (The Confidence)
```typescript
✅ Vitest           // Unit + Integration tests
🎭 Playwright       // E2E tests (critical flows)
🧪 Testing Library  // Component tests
🎯 Coverage: 80% overall, 90% critical paths
```

### Deployment (The Pipeline)
```typescript
🚀 Vercel              // Edge Functions + Static Hosting
⚙️  GitHub Actions     // CI/CD automation
📊 Lighthouse CI       // Performance monitoring
```

---

## 🚀 How It Works (5-Minute Flow)

```
1️⃣  LOG A TRADE
    Close a position → Document: ticker, thesis, emotions, outcome
    
2️⃣  TAG & FILTER  
    Apply tags: "FOMO", "Revenge Trade", "Setup: Breakout"
    
3️⃣  GENERATE AI INSIGHTS
    After 10-20 trades → Click "Generate Insights" (~30s)
    
4️⃣  IDENTIFY PATTERNS
    AI reveals: behavior loops, timing issues, emotional triggers
    
5️⃣  FIX ONE THING
    Pick your highest-severity insight → Address it systematically
    
6️⃣  TRACK PROGRESS
    Monitor evolution: XP, phases, win rates, streaks
```

**Simple. Systematic. Transformative.**

---

## 🗺️ Roadmap

**Current Status:** `v0.1.0 Beta` — Core features stable, PWA functional, AI integrations live

### 🎯 Q1 2025 — UI/UX Polish & Stability

```
✅ COMPLETED (Foundation)
   ✓ Multi-Tool Prompt System (AI optimization)
   ✓ PWA Offline-Mode Audit (428KB precache)
   ✓ AI Cost Optimization (gpt-4o-mini migration)
   ✓ Journal V2 with Archetype System & Trade Event Bridge
   ✓ Alerts with URL State Sync & Detail Panel
   ✓ Watchlist with Session Filters & Sort Modes

⏳ IN PROGRESS (UI/UX Refactor — Working Paper execution)
   🎨 WP-001..004: AppShell Foundation (BottomNav, Theme, Sidebar, TopBar)
   📊 WP-010..016: Dashboard Refinement (KPI Bar, Bias Card, Holdings, FAB)
   📝 WP-030..035: Journal Polish (Emotional State, Context, Mobile UX)
   📈 WP-050..056: Chart Layout (Sidebar, Toolbar, Bottom Panel, Replay)
   🔔 WP-070..076: Alerts Completion (Templates, Mobile, Integrations)
   ⚙️  WP-090..097: Settings Revamp (Token Usage, Wallet, Danger Zone)
   🧪 E2E Test Coverage (15-20 critical flows)
   ⚙️  Bundle-Size Optimization (<400KB target)

🚀 PLANNED (Q1 Late)
   🔔 Real-Time Push Notifications (browser + mobile)
   🔄 Background Sync (offline write queue)
```

### 🌟 Q2 2025 — Platform Expansion

```
☁️  Supabase Migration (cross-device sync)
📱 Mobile App Wrapper (iOS/Android via Capacitor)
📈 Advanced TA Indicators (Ichimoku, Keltner, Volume Profile+)
🖊️  Chart Drawing Tools (trendlines, fibonacci, rectangles)
🎮 Enhanced Replay Mode (save studies, annotations)
💬 In-App Chat (trader community)
```

### 🚀 Q3 2025 — Community & Scale

```
🌐 Community Heatmaps (anonymized behavioral patterns)
📋 Setup Templates (save & track custom strategies)
📤 Social Sharing (export insights to Twitter/Discord)
🎓 Mentorship Pairing (connect with traders 1 phase ahead)
🏆 Leaderboards (XP, streaks, win rates)
🔓 Open Source Release (MIT license)
```

**Our Promise:** Build features that matter. No fluff. No token pump. Just tools that make you better.

---

## 📋 UI/UX Polish Status (Detailed)

**Reference:** See `./tasks/WP-polish/UI_&_UX_polish.md` for complete execution spec.

**Cluster Progress:**
- **Cluster A (Foundation/Shell):** WP-001..004 — ⏳ In Progress
- **Cluster B (Dashboard):** WP-010..016 — 🚀 Planned
- **Cluster C (Journal):** WP-030..035 — 🚀 Planned  
- **Cluster D (Chart):** WP-050..056 — 🚀 Planned
- **Cluster E (Alerts):** WP-070..076 — 🚀 Planned
- **Cluster F (Settings):** WP-090..097 — 🚀 Planned

**Execution Model:** 1 WP = 1 PR (strict). Each work package is delivered as a small, reviewable PR. Clusters are for planning coherence only.

---

## 🎯 The Sparkfined Promise

We don't promise:
- ❌ Guaranteed profits
- ❌ "100x moon shots"
- ❌ Signal groups
- ❌ Token pumps

We **do** promise:
- ✅ **Honest tools** that respect your intelligence
- ✅ **A journal** that makes you face your mistakes
- ✅ **AI insights** that spot your blind spots
- ✅ **Offline-first** architecture (your data, your control)
- ✅ **No BS** — transparent development, no gimmicks

**Your edge is not an indicator. It's discipline. It's self-awareness. It's systematic reflection.**

Sparkfined is your training ground. The market is your test.

---

## 💭 Philosophy — The Path to Mastery

### From Degen to Sage

Sparkfined is not just software. It's a **system for self-improvement** disguised as a trading tool.

**Stage 1: The Degen (Chaos)**
- Trading on emotions, FOMO, revenge trades
- No journal, no system, no edge
- *"Why did I lose again?"* ← You don't even know

**Stage 2: The Seeker (Awareness)**
- You start journaling. Every trade. Every mistake.
- You add tags. You filter for patterns.
- Losses hurt less because you're **learning**.

**Stage 3: The Warrior (Discipline)**
- You have a system. You follow it.
- You know your edge. You trust the process.
- You trade less, but win more.

**Stage 4: The Master (Consistency)**
- Your journal shows patterns. You fix them.
- Your AI insights reveal blind spots. You address them.
- You track metrics: win rate, expectancy, drawdown.

**Stage 5: The Sage (Wisdom)**
- You share lessons. You help others avoid your mistakes.
- Your trading becomes a craft, not a gamble.
- You remember: **The best trade is the one you didn't take.**

---

## The Sparkfined Promise

We don't promise profits. We don't sell signals. We don't guarantee moon shots.

**We promise:**
- A **tool that respects your intelligence** (no scammy "100x guaranteed" BS)
- A **journal that makes you honest** (face your mistakes, own your wins)
- **AI that spots your blind spots** (patterns you can't see on your own)
- A **system that works offline** (your data, your control)

**Your edge is not an indicator. It's discipline. It's journaling. It's self-awareness.**

Sparkfined is your training ground. The market is your test.

---

## 🚀 Getting Started

### For Users

**Ready to level up your trading?**

1. **Clone or deploy** the app (see Development Setup below)
2. **Install as PWA** from your browser (works on desktop, mobile, tablet)
3. **Log your first trade** — document thesis, emotions, and outcome
4. **Generate AI insights** after 10-20 trades to reveal patterns
5. **Fix one pattern** at a time — systematic improvement over quick fixes

### For Developers

**Prerequisites:**
- Node.js ≥ 20.10.0
- pnpm ≥ 9.0.0

**Setup:**

```bash
# Clone the repository
git clone <repository-url>
cd sparkfined-pwa

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local
# Edit .env.local and add your API keys:
# - OPENAI_API_KEY (required for AI features)
# - XAI_API_KEY (optional, for Grok integration)
# - MORALIS_API_KEY (optional, for market data)

# Start development server
pnpm dev
```

**Available Scripts:**

```bash
pnpm dev              # Start dev server (http://localhost:5173)
pnpm build            # Build for production
pnpm preview          # Preview production build
pnpm typecheck        # Run TypeScript type checking
pnpm lint             # Run ESLint
pnpm test             # Run Vitest unit tests
pnpm test:e2e         # Run Playwright E2E tests
pnpm check:size       # Check bundle size
```

**Project Structure:**

```
sparkfined-pwa/
├── src/
│   ├── pages/           # Full-page components
│   ├── components/      # Reusable UI components
│   ├── features/        # Feature-specific modules
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Pure utilities & helpers
│   ├── store/           # Zustand state stores
│   ├── types/           # TypeScript type definitions
│   └── styles/          # Global CSS & Tailwind
├── api/                 # Vercel serverless functions
├── docs/                # Documentation & ADRs
├── tests/               # Test files (E2E, integration)
└── public/              # Static assets
```

---

## 📚 Documentation

- **[Architecture Overview](/.rulesync/02-frontend-arch.md)** — 5-layer architecture model
- **[TypeScript Conventions](/.rulesync/01-typescript.md)** — Patterns & best practices
- **[PWA Guidelines](/.rulesync/03-pwa-conventions.md)** — Offline-first strategies
- **[Testing Strategy](/.rulesync/06-testing-strategy.md)** — Test pyramid & coverage targets
- **[Design Decisions](/.rulesync/_intentions.md)** — ADRs (Architecture Decision Records)
- **[AI Integration](/.rulesync/11-ai-integration.md)** — Dual-provider setup & cost management

---

## 🤝 Contributing

We welcome contributions! Please follow these guidelines:

1. **Read** `.rulesync/` documentation for architecture & conventions
2. **Create** feature branches from `main`
3. **Write** tests for new features (target: 80% coverage)
4. **Run** `pnpm typecheck && pnpm lint && pnpm test` before committing
5. **Document** significant decisions in `_intentions.md` (ADRs)

---

## 📝 License

This project is currently in private beta. License information will be provided upon public release.

---

## 🎯 Philosophy

**Sparkfined** is built by traders, for traders. We've experienced FOMO, revenge trading, and account blow-ups. We built this tool because **we needed it ourselves**.

Every feature exists because we made a mistake that could have been avoided through systematic reflection and learning.

### The Path to Mastery

```
DEGEN → SEEKER → WARRIOR → MASTER → SAGE
```

Your losses don't define you. **What you learn from them does.**

---

**Version:** `0.1.0-beta`  
**Status:** ⚡ Active Development | 🚀 Beta Testing

*Trading is a craft. Losses are lessons. Mastery comes from self-improvement, not luck.*
