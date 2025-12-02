# Sparkfined PWA

> **From Chaos to Mastery** — An Offline-First Trading Command Center for Crypto Markets

[![Version](https://img.shields.io/badge/version-0.1.0-blue.svg)](package.json)
[![PWA](https://img.shields.io/badge/PWA-enabled-brightgreen.svg)](https://web.dev/progressive-web-apps/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-blue.svg)](https://react.dev/)

---

## What is Sparkfined?

**Sparkfined** is an **offline-first Progressive Web App (PWA)** designed for crypto traders who want to transform losses into lessons and emotions into discipline. Built with a focus on self-improvement, it combines powerful journaling, AI-powered insights, and technical analysis tools to help you discover your trading edge.

Unlike generic charting platforms, Sparkfined helps you **understand yourself** — your behavioral patterns, blind spots, and evolution as a trader through systematic reflection and AI-driven analysis.

### Built For

- **Day Traders** breaking FOMO loops and revenge-trade cycles
- **Meme Coin Traders** who need structure in market chaos  
- **Self-Improvement Traders** who journal consistently
- **Disciplined Learners** tired of repeating the same mistakes

---

## Why Sparkfined?

### The Problem

Most traders lose money not because they lack charts or indicators, but because they:
- **Repeat the same mistakes** (FOMO into pumps, revenge-trade after losses)
- **Trade on emotion** instead of rules
- **Have no system** to track what works and what doesn't
- **Never reflect** on their trades — they just move to the next one

### The Solution

Sparkfined gives you **three things that matter more than any indicator:**

1. **A Journal That Makes You Honest**  
   Write down every trade. The good, the bad, the ugly. Face your patterns before they break you.

2. **AI That Spots Your Blind Spots**  
   Let AI analyze your last 20-50 trades and tell you what you can't see: timing patterns, emotional triggers, setup discipline gaps.

3. **A Journey That Rewards Growth**  
   Track your evolution from Degen (chaos) to Master (discipline) with an XP system that rewards consistency, not just profits.

---

## ✨ Core Features

### 📝 Trading Journal — Your Second Brain

**Why it matters:** Consistent journaling separates profitable traders from those who repeat mistakes. Every loss becomes a lesson.

- **Rich note-taking** — Document thesis, emotions, and outcomes for every trade
- **Tag-based filtering** — Instantly find patterns like "FOMO", "Revenge Trade", or specific setups
- **Offline-capable** — Write anywhere, sync when online
- **Privacy-first** — Data stored locally in IndexedDB (Dexie), under your control
- **AI-Condense** — Let AI summarize long journal entries for quick review

**The discipline:** Log every trade. Especially the painful ones.

---

### 🎯 Journey & XP — From Degen to Master

**Why it matters:** Trading is a craft. Mastery comes from self-improvement, not luck.

Sparkfined tracks your **trading evolution** through five phases:

| Phase | What It Means |
|-------|---------------|
| **DEGEN** | Chasing pumps, trading on emotions, no system |
| **SEEKER** | Building awareness, testing setups, journaling starts |
| **WARRIOR** | Following rules, managing risk, discipline emerging |
| **MASTER** | Consistent edge, pattern recognition, emotional control |
| **SAGE** | Wisdom, mentorship, helping others avoid your mistakes |

**How it works:**
- Earn **XP** for disciplined actions (journaling trades, following your setup, respecting stop-losses)
- Build **streaks** by staying consistent
- See your **phase** evolve as you level up

**The truth:** You don't need more indicators. You need more discipline. The XP system keeps you accountable.

---

### 🧠 AI-Powered Behavioral Insights

**Why it matters:** You can't fix patterns you don't see. AI spots them for you.

Sparkfined analyzes your recent trades and identifies **recurring patterns** across five categories:

1. **Behavior Loops**  
   Example: *"You FOMO into breakouts that are already +30% from lows. This leads to late entries and high drawdown risk."*

2. **Timing Patterns**  
   Example: *"Your worst trades happen after 8 PM. Fatigue leads to revenge trading."*

3. **Risk Management**  
   Example: *"You size 3x larger on revenge trades vs. planned setups. This blows your account faster."*

4. **Setup Discipline**  
   Example: *"You take twice as many trades on weekends vs. weekdays, but your weekend win rate is 15% lower."*

5. **Emotional Patterns**  
   Example: *"After 2 losses in a row, you double position size. This turns small losses into wipeouts."*

**How it works:**
- Select your last 20-50 journal entries
- Click "Generate Insights" (runs in ~30 seconds)
- Get 2-5 concrete insights with **actionable recommendations**
- Each insight shows which trades support it (evidence-based, not guesses)

**The value:** AI doesn't tell you *what* to trade. It tells you *how* you're sabotaging yourself — so you can fix it.

---

### 📊 Social Preview — See Your Dominant Patterns

**Why it matters:** Patterns become clearer when you see them aggregated.

After generating AI insights, Sparkfined shows you a **heatmap of your behavioral patterns:**

- Which categories appear most often (e.g., "Behavior Loop: 5 insights")
- Severity breakdown (INFO / WARNING / CRITICAL)
- Your top 3 areas to improve

**Coming soon:** Community-wide pattern heatmaps — see what mistakes *everyone* is making, not just you.

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

**Frontend:**
- **React 18.3** with **TypeScript 5.6** (strict mode enabled)
- **Vite 5.4** for blazing-fast builds and HMR
- **TailwindCSS 4.1** (dark-mode-first design)
- **Zustand** for state management (lightweight, <1KB)
- **Dexie** (IndexedDB wrapper) for offline-first data persistence
- **React Router 6** for client-side routing

**Backend (Serverless):**
- **Vercel Edge Functions** (Node 18+)
- **OpenAI API** (gpt-4o-mini) for AI features
- **xAI Grok** for crypto-native reasoning (optional)

**PWA & Offline:**
- **vite-plugin-pwa** + **Workbox** for Service Worker
- **~428KB precache** (static assets)
- Cache strategies: Precache, Cache-First, Network-First, Stale-While-Revalidate

**Testing:**
- **Vitest** for unit/integration tests
- **Playwright** for E2E tests
- **Testing Library** (React) for component tests
- Target: **80% coverage** overall, **90% for critical modules**

**Deployment:**
- **Vercel** (Edge Functions + Static Hosting)
- **GitHub Actions** for CI/CD
- **Lighthouse CI** for performance monitoring

---

## 🚀 How It Works (Simple Flow)

1. **Log a Trade**  
   After closing a position, document: ticker, thesis, emotions, and outcome

2. **Tag & Filter**  
   Apply tags (setups, emotions, outcomes) and filter to find patterns like "FOMO" or "Revenge Trade"

3. **Generate AI Insights**  
   After 10-20 trades, click "Generate Insights" for AI-powered pattern analysis

4. **Identify Patterns**  
   AI reveals: behavior loops, timing issues, risk management gaps, emotional triggers

5. **Fix One Thing**  
   Choose your highest-severity insight and address it systematically

6. **Track Progress**  
   Monitor your evolution through XP, phases, and improving win rates

---

## 🗺️ Roadmap

**Current Status:** `v0.1.0 Beta` — Core features stable, PWA functional, AI integrations live

### Active Sprint: S0 — Foundation Cleanup (Nov 12 → Nov 26, 2025)

**In Progress:**
- ✅ Multi-Tool Prompt System (AI agent optimization)
- ✅ PWA Offline-Mode Audit (Service Worker stable, 428KB precache)
- ⏳ Bundle-Size Optimization (Target: <400KB)
- ⏳ E2E Test Coverage expansion (Target: 15-20 critical flows)

### Q1 2025 — High-Priority Features

**🔐 On-Chain Access Gating** `P0`
- Replace mock wallet with real Solana NFT-based access control
- Integrate `@solana/wallet-adapter-react` (Phantom, Solflare)
- `/api/access/verify` endpoint for on-chain NFT verification
- **Effort:** 2 sprints (4 weeks)

**🔔 Real-Time Alerts (Push Notifications)** `P0`
- Browser push notifications for price alerts and signal triggers
- Service Worker push event handlers
- Alert subscription/triggering via Vercel Cron
- **Effort:** 2 sprints (4 weeks)

**🔄 Background Sync (Offline-First Writes)** `P0`
- Queue offline actions (journal entries, alerts) for sync when online
- Service Worker `sync` event handlers
- Retry logic + conflict resolution
- **Effort:** 1 sprint (2 weeks)

**📊 Chart Library Evaluation** `P1`
- Evaluate: Lightweight-Charts (current) vs. TradingView Widget vs. Recharts
- Decision deadline: End Q1 2025
- **Effort:** 1 sprint spike

**💰 AI Cost Optimization** `P1`
- Response caching (1h TTL) ✅ Partially done
- Migrate high-volume tasks to gpt-4o-mini ✅ Done
- Per-user rate limiting (20 requests/hour)
- Prompt compression for long contexts
- **Effort:** 1 sprint (2 weeks)

### Q2 2025 — Platform Growth

- **Supabase Migration** (Optional): Backend DB for cross-device sync
- **Mobile App Wrapper** (Capacitor): Native iOS/Android app via App Store
- **Advanced TA Indicators**: Ichimoku, Keltner, additional studies
- **Trade Replay**: Study past price action with annotations

### Q3 2025 — Community Features

- **Community Heatmaps**: Anonymized behavioral patterns across traders
- **Setup Templates**: Save & track win rates for custom setups
- **Social Sharing**: Share journal insights/lessons
- **Mentorship Pairing**: Connect with traders one phase ahead

---

## Philosophy — The Path to Mastery

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
