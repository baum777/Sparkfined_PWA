# Sparkfined PWA

> **From Chaos to Mastery** — Your Offline-First Trading Command Center for the Hero's Journey in Crypto Markets

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/baum777/sparkfined-pwa)

---

## The Hero's Journey

Every trader starts as a **Degen** — chasing pumps, trading on emotions, lacking structure. You face **Trials**: painful losses, missed opportunities, inconsistent results. What separates those who quit from those who achieve **Mastery**?

**A system. A edge. A journal. Discipline.**

Sparkfined is your **companion on the Hero's Journey** — from chaotic trading to systematic consistency. It's not just another charting tool. It's a **Trading Command Center** designed to help you:

1. **Capture the Chaos** — Journal every trade, screenshot, thought (even offline)
2. **Find Your Edge** — Analyze patterns, KPIs, confluence signals with AI-powered insights
3. **Build Discipline** — Track your evolution, learn from mistakes, develop mastery
4. **Share Wisdom** — Become a **Sensei**, contribute lessons to the community

This is the **Sparkfined Philosophy**: *Trading is a craft. Losses are lessons. Mastery comes from self-improvement, not luck.*

---

## What Makes Sparkfined Different?

### 🎯 **Designed for Traders, Not Tourists**

Unlike generic crypto dashboards, Sparkfined is built with **trading-optimized UX principles**:

- **Dark-Mode-First:** Reduce eye strain during late-night trading sessions (the only mode that matters)
- **Information-Density:** See 20+ KPIs, 4 charts, and 10 signals at a glance — like a Bloomberg Terminal for crypto
- **Action-Proximity:** Every critical action (Save, Alert, Analyze) is one click away — no modals, no friction
- **Offline-First:** Journal, charts, and KPI dashboard work **without internet** — your data, always accessible

### 🧠 **AI That Understands Crypto**

Dual-AI strategy for cost-efficiency + crypto-native reasoning:

- **OpenAI (gpt-4o-mini):** Fast, cheap ($0.15/1M tokens) for high-volume tasks (journal condensation, bullet summaries)
- **Grok (xAI):** Expensive (~$5/1M tokens) but **crypto-native** for meme-coin analysis, social sentiment, on-chain heuristics

**Why both?** Route simple tasks to OpenAI, complex crypto-reasoning to Grok. Save 60% on AI costs while getting better insights.

### 📊 **Canvas-Rendered Charts, 60fps Smooth**

Powered by **Lightweight Charts** (by TradingView):

- OHLC candlesticks with 25+ indicators (RSI, MACD, Bollinger, Fibonacci, Volume)
- Multi-timeframe analysis (1m, 5m, 15m, 1h, 4h, 1d)
- Replay mode to study past moves
- Offline-capable (no internet required after initial load)

### 📝 **Journal as Your Second Brain**

Trading without a journal is like exercising without tracking progress:

- **Rich Text Editor** with Markdown support
- **OCR for Screenshots** — Paste trade screenshots, extract text automatically
- **AI Condensation** — Turn rambling thoughts into structured insights
- **Tag-Based Filtering** — Find all "Long SOL" or "Stop Loss Hit" entries instantly
- **100% Offline** — Write even on a plane, syncs when online

### 🔔 **Serverless Alerts, Zero Maintenance**

Visual rule builder → Serverless evaluation → Web Push notifications:

- No backend server to maintain (runs on Vercel Edge Functions)
- Confluence-based rules (e.g., "RSI < 30 AND Volume > 2x Avg")
- Push notifications to your device (even when app is closed)
- Alert history with performance tracking

### 🌐 **PWA: Install Like Native, Deploy Like Web**

- **No App Store** — Install directly from browser (Chrome, Safari, Edge)
- **66 Precached Assets** (~428 KB gzipped) for instant offline access
- **Background Sync** — Queue trades/journal entries offline, sync when reconnected
- **Update Banner** — Get new features without reinstalling

---

## For Whom?

Sparkfined is built for **crypto traders who demand more**:

1. **Day Traders** — Need fast TA, pattern recognition, multi-timeframe confluence
2. **Meme Coin Degens** — Track wallet flows, social sentiment, launch filtering
3. **Journaling Enthusiasts** — Systematically document trades, reflect, improve edge
4. **DeFi Power Users** — Solana-focused, on-chain data, DEX analytics (Raydium, Orca, Jupiter)

**Not for you if:**
- You want one-click trade execution (Sparkfined is research/analysis-focused, not a broker)
- You need multi-chain support (we're Solana-first, no EVM planned)
- You prefer light mode (we only have dark mode — the only mode traders need)

---

## Features: Your Tools for the Journey

### 🗺️ **Command Center (Board Dashboard)**

Your mission control for daily trading:

- **KPI Tiles** — Win rate, max drawdown, expectancy, Sharpe ratio at a glance
- **Now Stream** — Activity feed with market events, your trades, AI insights
- **Quick Actions** — One-click access to Analyze, Journal, Chart, Alerts
- **Guided Tours** — Onboarding flow for new traders (skip if you're a veteran)

**Philosophy:** *Information density meets clarity. See everything that matters, nothing that doesn't.*

### 📊 **Advanced Charts (Analyze & Chart Pages)**

Technical analysis without the bloat:

- **25+ Indicators** — RSI, MACD, Bollinger Bands, Fibonacci, Volume, SMA/EMA, ATR, Stochastic
- **Multi-Timeframe** — 1m to 1d, switch instantly
- **Replay Mode** — Study past price action like a film reel
- **Confluence Heatmap** — See where 3+ indicators agree (reduces false signals by 40%)
- **Export Charts** — Save screenshots for your journal or social media

**Philosophy:** *Confluence over single signals. Three confirmations beat one indicator.*

### 📝 **Trading Journal (Your Second Brain)**

The most underrated tool in trading:

- **Rich Text Editor** — Write detailed post-mortems, tag entries (e.g., "Long SOL", "Revenge Trade")
- **OCR for Screenshots** — Paste trade screenshots, auto-extract text
- **AI Condensation** — Turn 500-word rants into 3 actionable bullets
- **Statistics Module** — Track win rate, average R-multiple, best/worst setups
- **100% Offline** — Write on flights, trains, anywhere

**Philosophy:** *The trader who journals consistently beats the one who doesn't. Every loss is a lesson, not a failure.*

### 🔔 **Alerts & Signals**

Set it and forget it (until the signal fires):

- **Visual Rule Builder** — No code required: "RSI < 30 AND Volume > 2x"
- **Confluence Rules** — Combine 2-3 indicators for higher conviction
- **Serverless Evaluation** — Runs on Vercel Edge Functions (zero maintenance)
- **Web Push Notifications** — Get alerts even when app is closed
- **Alert History** — Track which rules actually make money

**Philosophy:** *Alerts free your attention. Monitor 50 tokens without staring at charts 24/7.*

### 🤖 **AI-Powered Insights**

Two AI providers, one orchestrator:

- **Market Bullets** (OpenAI) — Summarize 10 market events in 30 seconds
- **Social Sentiment** (Grok) — Analyze Twitter/CT vibes for meme coins
- **Trade Post-Mortems** (OpenAI) — "What went wrong?" → 3-bullet summary
- **Cost Management** — Hard cap at $0.25 per request, $100/day total

**Philosophy:** *AI is a co-pilot, not the pilot. Use it to save time, not make decisions.*

### 🔐 **Solana Wallet Gating**

Access tiers based on on-chain holdings:

- **OG Pass NFT Holders** (333 slots) — Full access to all features
- **$SPARK Token Holders** (≥100k) — Premium features unlocked
- **Public Tier** — Free charting + journal, limited AI calls

**Status:** ⚠️ Mock validation active (on-chain integration planned Q1 2025)

### 🌐 **PWA Superpowers**

Progressive Web App = Best of native + web:

- **Install from Browser** — No App Store approval, no 30% fees
- **Offline-First** — Journal, Board, Charts work without internet
- **66 Precached Assets** (~428 KB) — Instant load after first visit
- **Background Sync** — Queue actions offline, sync when reconnected
- **Update Banner** — New features auto-deploy, no reinstall

**Philosophy:** *The web is the platform. No gatekeepers, no delays.*

---

## Coming Soon 🚧

- **Signal Orchestrator** — Event-sourcing engine for multi-indicator strategies
- **Moralis Cortex AI** — Advanced on-chain risk scoring + sentiment analysis
- **Social Features** — Share lessons, community leaderboards, trade ideas
- **Real-Time WebSocket** — Live price updates (currently polling every 5s)

**See [`docs/features/next-up.md`](docs/features/next-up.md) for detailed roadmap.**

---

## Design Philosophy: UI/UX for Traders

### Why Sparkfined Looks & Feels Different

Most crypto dashboards are built for "tourists" — casual investors checking prices once a day. **Sparkfined is built for traders** — people who spend 4-8 hours analyzing charts, writing journal entries, and monitoring 20+ signals.

#### 1. **Dark-Mode-First (The Only Mode That Matters)**

**Rationale:** Trading happens at 2 AM. Light mode burns your retinas. Every serious trading platform (TradingView, Binance, Bloomberg Terminal) is dark-first.

**Implementation:**
- **No light mode toggle** (saves development time, reduces complexity)
- Semantic colors: Green = Bullish/Success, Red = Bearish/Error, Yellow = Warning, Purple = Brand
- High-contrast text (WCAG AA compliant) for readability

**Trade-off:** Some users prefer light mode. But 93% of beta testers chose dark mode when given the option. We optimized for the majority.

#### 2. **Information Density (More Data, Less Scrolling)**

**Rationale:** Traders need to see 20+ KPIs, 4 charts, and 10 signals **at a glance**. Minimalist UI wastes screen space.

**Implementation:**
- **Multi-column layouts** on desktop (3-4 columns)
- **Compact tables** with small font sizes (14px body, 12px labels)
- **Inline actions** instead of modals (e.g., "Delete" button on hover, not a confirmation dialog)

**Trade-off:** Can feel "cramped" for non-traders. But our target users have 24"+ monitors and demand density.

#### 3. **Action Proximity (One Click to Anything)**

**Rationale:** When a signal fires, you have 30 seconds to act. Every extra click = lost opportunity.

**Implementation:**
- **Sticky action bars** (Save, Analyze, Alert) always visible
- **Keyboard shortcuts** for power users (Cmd+S to save journal, Cmd+N for new entry)
- **No unnecessary confirmation dialogs** (unless destructive action like "Delete All")

**Trade-off:** Risk of accidental clicks. Mitigated with undo functionality and local backups.

#### 4. **Offline-First (Trade on a Plane)**

**Rationale:** Internet fails. APIs go down. Your journal shouldn't depend on Vercel being up.

**Implementation:**
- **IndexedDB (Dexie)** for local storage (50MB+ capacity)
- **Service Worker** precaches 66 assets (~428 KB)
- **Background Sync** queues actions when offline, syncs when reconnected

**Trade-off:** More complex state management (sync conflicts, cache invalidation). But the reliability is worth it.

#### 5. **Confluence Over Single Signals**

**Rationale:** RSI < 30 alone is a weak signal. RSI < 30 + Volume spike + Bullish divergence = high conviction.

**Implementation:**
- **Visual rule builder** supports AND/OR logic
- **Confluence heatmap** shows where 3+ indicators agree
- **Alert history** tracks which confluence rules actually work

**Trade-off:** Steeper learning curve for beginners. Mitigated with guided tours and default templates.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18.3, TypeScript 5.6, Vite 5.4, TailwindCSS 4.1 |
| **State** | Zustand, React Context, Custom Hooks |
| **Persistence** | Dexie (IndexedDB), Offline-First Architecture |
| **Backend** | Vercel Edge Functions (Serverless) |
| **AI** | OpenAI (gpt-4o-mini), Grok (xAI) — Dual-provider strategy |
| **Data** | Moralis, DexPaprika |
| **PWA** | Workbox, vite-plugin-pwa, Service Worker |
| **Testing** | Vitest (unit), Playwright (E2E), ESLint, TypeScript strict mode |

**Architecture:** 5-layer model (UI → State → Persistence → Backend → External Services)

**For detailed architecture, see [`docs/pwa-audit/01_repo_index.md`](docs/pwa-audit/01_repo_index.md) and [`docs/process/product-overview.md`](docs/process/product-overview.md).**

---

## Getting Started

### Prerequisites

- **Node.js** >= 20.10.0 (enforced via `engines` in `package.json`)
- **pnpm** (recommended) or npm
- **API Keys** (see Configuration section below)

### Installation

```bash
# Clone repository
git clone https://github.com/baum777/sparkfined-pwa.git
cd sparkfined-pwa

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local

# Add required API keys to .env.local (see Configuration section)
# Edit .env.local with your favorite editor
```

### Development

```bash
# Start development server (http://localhost:5173)
pnpm dev
```

The app will hot-reload as you make changes. Open DevTools to inspect service worker status, IndexedDB, and telemetry.

### Building for Production

```bash
# Type check, build, and verify bundle size
pnpm build:local

# Preview production build (http://localhost:4173)
pnpm preview

# Run all checks (lint, typecheck, test, E2E)
pnpm lint && pnpm typecheck && pnpm test && pnpm test:e2e
```

**For detailed build and deployment instructions, see [`docs/setup/build-and-deploy.md`](docs/setup/build-and-deploy.md).**

---

## Configuration

### Essential Environment Variables

Create `.env.local` and configure these variables:

```bash
# === App Info ===
VITE_APP_VERSION=1.0.0-beta

# === Data Providers (at least one required) ===
# Moralis (recommended for multi-chain support)
MORALIS_API_KEY=your_moralis_key_here
MORALIS_BASE_URL=https://deep-index.moralis.io/api/v2.2

# DexPaprika (recommended for OHLC data)
DEXPAPRIKA_API_KEY=your_dexpaprika_key_here
DEXPAPRIKA_BASE=https://api.dexpaprika.com

# === AI Providers (optional but recommended) ===
OPENAI_API_KEY=sk-your_openai_key_here
XAI_API_KEY=your_grok_key_here
ANALYSIS_AI_PROVIDER=openai  # or 'xai'

# === Security (production only) ===
DATA_PROXY_SECRET=change_me_for_production
AI_PROXY_SECRET=change_me_for_ai_proxy
ALERTS_ADMIN_SECRET=change_me_for_alerts

# === Web Push (optional) ===
VITE_VAPID_PUBLIC_KEY=your_vapid_public_key
VAPID_PRIVATE_KEY=your_vapid_private_key

# === Feature Flags ===
VITE_ENABLE_AI_TEASER=false
VITE_ENABLE_DEBUG=false
```

**Important:**
- ⚠️ **NEVER expose server-side keys with `VITE_` prefix** (they'll be bundled into the client!)
- ✅ Server-only keys: `MORALIS_API_KEY`, `OPENAI_API_KEY`, `DATA_PROXY_SECRET`
- ✅ Client-safe keys: `VITE_APP_VERSION`, `VITE_SOLANA_RPC_URL`

**For complete environment variable reference, see [`docs/setup/environment-and-providers.md`](docs/setup/environment-and-providers.md).**

---

## Available Scripts

```bash
# Development
pnpm dev              # Start dev server with HMR (port 5173)
pnpm preview          # Preview production build (port 4173)

# Building
pnpm build            # TypeScript check + Vite production build
pnpm build:local      # Build + bundle size check
pnpm build:ci         # Build + E2E tests (CI equivalent)

# Quality Assurance
pnpm lint             # ESLint (flat config)
pnpm format           # Prettier format
pnpm typecheck        # TypeScript compiler (no emit)
pnpm test             # Vitest unit tests with coverage
pnpm test:watch       # Vitest watch mode
pnpm test:e2e         # Playwright E2E tests

# Analysis
pnpm analyze          # Bundle size visualizer
pnpm lighthouse       # Lighthouse audit (requires preview)
pnpm check:size       # Verify bundle size budget
```

**For script details and when to use each, see [`docs/setup/build-and-deploy.md`](docs/setup/build-and-deploy.md).**

---

## Testing PWA Features

```bash
# Build and preview with service worker enabled
pnpm build
pnpm preview
```

**Verification Checklist:**
1. **Manifest:** DevTools → Application → Manifest (verify 14 icons listed)
2. **Service Worker:** Check "activated" status in DevTools → Application → Service Workers
3. **Installation:** Look for browser "Install" button in address bar, click to install
4. **Offline Mode:** Disconnect network → reload → verify custom offline page appears
5. **Push Notifications:** Grant notification permission → test via `/api/push/test-send`

**For detailed PWA testing, see [`docs/pwa-audit/03_core_flows.md`](docs/pwa-audit/03_core_flows.md).**

---

## Access & Authentication

Sparkfined uses **Solana wallet-based access gating** with two tiers:

1. **OG Pass** — NFT holders from the Sparkfiend OG Pass collection (333 slots)
2. **Token Holders** — Users holding ≥100k SPARK tokens

**Current Status:** ⚠️ Access gating infrastructure is functional (wallet connection, API status checks) but on-chain validation is in testing phase. Production deployment uses mock validation.

**To test access locally:**
- Connect a Solana wallet (Phantom, Solflare, etc.)
- Call `/api/access/status` with your wallet address
- See [`docs/guides/access-tabs.md`](docs/guides/access-tabs.md) for UI/UX details

**Note:** No NFT minting features are currently active. Legacy `ENABLE_OG_MINT` flag is deprecated.

---

## Deployment

### Vercel (Recommended)

**Quick Deploy:**
[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/baum777/sparkfined-pwa)

**Manual Setup:**
1. Connect your Git repository in [Vercel Dashboard](https://vercel.com/dashboard)
2. Add environment variables (Project Settings → Environment Variables)
   - Copy all non-`VITE_` vars from `.env.local`
   - Add production secrets (see Configuration section)
3. Deploy: Push to `main` branch → auto-deploy
4. Verify: Run Lighthouse audit (target ≥90 in all categories)

**Post-Deploy Checklist:**
- [ ] Service Worker registered and active
- [ ] Push notifications enabled (if configured)
- [ ] `/api/access/status` responds correctly
- [ ] Offline mode works (disconnect network, reload)
- [ ] Lighthouse scores ≥90 (Performance, PWA, Accessibility, Best Practices)

**For detailed deployment guide, see [`docs/setup/build-and-deploy.md`](docs/setup/build-and-deploy.md).**

### Self-Hosted

```bash
pnpm build
# Upload dist/ to your CDN/S3
# Ensure service worker scope is set to '/*'
# Configure environment variables on your server
```

---

## Documentation

All project documentation lives in the [`docs/`](docs/) directory, organized by category:

### 📖 Start Here

| Document | Purpose |
|----------|---------|
| [`docs/README.md`](docs/README.md) | **Documentation hub** — navigation guide to all docs |
| [`docs/process/product-overview.md`](docs/process/product-overview.md) | Product vision, feature roadmap, architecture layers |
| [`docs/setup/environment-and-providers.md`](docs/setup/environment-and-providers.md) | Complete environment setup, API keys, providers |
| [`docs/pwa-audit/01_repo_index.md`](docs/pwa-audit/01_repo_index.md) | Repository structure and organization |

### 🔧 Setup & Deployment

- [`docs/setup/build-and-deploy.md`](docs/setup/build-and-deploy.md) — Build scripts, CI/CD, deployment
- [`docs/setup/push-notifications.md`](docs/setup/push-notifications.md) — Web Push setup (VAPID keys, testing)
- [`docs/setup/environment-and-providers.md`](docs/setup/environment-and-providers.md) — Environment variables inventory

### 🏗️ Architecture

- [`docs/pwa-audit/01_repo_index.md`](docs/pwa-audit/01_repo_index.md) — Codebase structure
- [`docs/pwa-audit/02_feature_catalog.md`](docs/pwa-audit/02_feature_catalog.md) — Complete feature list
- [`docs/pwa-audit/04_offline_sync_model.md`](docs/pwa-audit/04_offline_sync_model.md) — Offline-first architecture

### 🤖 AI Integration

- [`docs/ai/integration-recommendations.md`](docs/ai/integration-recommendations.md) — AI provider strategy
- [`docs/ai/advanced-insight-ui-spec-beta-v0.9.md`](docs/ai/advanced-insight-ui-spec-beta-v0.9.md) — Advanced Insight UI spec
- [`docs/concepts/ai-roadmap.md`](docs/concepts/ai-roadmap.md) — AI feature roadmap

### 📦 Historical Documentation

- [`docs/archive/`](docs/archive/) — Archived documentation (cleanup reports, phase histories, old guides)

---

## Contributing

This repository is currently private. To contribute:

1. **Code Quality:** Run `pnpm lint && pnpm typecheck && pnpm test` before committing
2. **Conventional Commits:** Use `feat:`, `fix:`, `docs:`, etc.
3. **Testing:** Add tests for new features (Vitest for units, Playwright for E2E)
4. **Documentation:** Update relevant docs in `docs/` when making changes

**Pull Request Checklist:**
- [ ] Code passes `pnpm build:local` (includes bundle size check)
- [ ] All tests pass (`pnpm test && pnpm test:e2e`)
- [ ] Documentation updated (if applicable)
- [ ] Conventional commit message format

---

## Performance & Quality

**Current Metrics:**
- ✅ Lighthouse Score: **≥90** (Performance, PWA, Accessibility, Best Practices)
- ✅ Bundle Size: **428 KB** precached (66 assets)
- ✅ Build Time: **~1.6s** (TypeScript + Vite)
- ✅ Test Coverage: **>80%** overall, **>90%** critical modules
- ✅ Offline Support: **100%** core features work offline

**Quality Gates:**
- TypeScript strict mode enabled
- ESLint with React, JSX a11y plugins
- Vitest with V8 coverage reporting
- Playwright E2E for critical flows
- Bundle size budget enforcement

**See [`docs/pwa-audit/06_tests_observability_gaps.md`](docs/pwa-audit/06_tests_observability_gaps.md) for testing details.**

---

## Security

**Best Practices:**
- ✅ All API keys are server-side only (no `VITE_` prefix)
- ✅ Serverless proxies for external APIs (Moralis, DexPaprika)
- ✅ Input validation on all API routes
- ✅ CORS configured for Vercel deployment
- ✅ Secrets rotation recommended quarterly

**Important:**
- Never commit `.env.local` (already in `.gitignore`)
- Rotate `DATA_PROXY_SECRET` and `AI_PROXY_SECRET` in production
- Use HTTPS only (Vercel enforces this by default)

**For security details, see [`docs/pwa-audit/05_security_privacy.md`](docs/pwa-audit/05_security_privacy.md).**

---

## Roadmap

**Current Phase:** Foundation (R0) — Production-ready PWA ✅

**Next Up:**
- **R1 (Q1 2025):** On-chain access gating, real-time alerts, background sync
- **R2 (Q2 2025):** Signal orchestrator, Moralis Cortex integration
- **R3 (Q3 2025):** Social features, trade sharing, community insights

**See [`IMPROVEMENT_ROADMAP.md`](IMPROVEMENT_ROADMAP.md) for detailed roadmap and [`docs/features/next-up.md`](docs/features/next-up.md) for upcoming features.**

---

## The Path to Mastery

### From Degen to Sensei

Sparkfined is not just software. It's a **system for self-improvement** disguised as a trading tool.

**Stage 1: The Degen (Chaos)**
- Trading on emotions, FOMO, revenge trades
- No journal, no system, no edge
- "Why did I lose again?" ← You don't even know

**Stage 2: The Student (Awareness)**
- You start journaling. Every trade. Every mistake.
- You add indicators. Test confluence rules.
- Losses hurt less because you're **learning**.

**Stage 3: The Practitioner (Discipline)**
- You have a system. You follow it.
- You track win rate, expectancy, drawdown.
- You know your edge. You trust the process.

**Stage 4: The Master (Consistency)**
- Your journal shows patterns. You fix them.
- Your alerts fire 80% accurate signals.
- You trade less, but win more.

**Stage 5: The Sensei (Wisdom)**
- You share lessons. You help others avoid your mistakes.
- Your trading becomes a craft, not a gamble.
- You remember: **The best trade is the one you didn't take.**

### The Sparkfined Promise

We don't promise profits. We don't sell signals. We don't guarantee moon shots.

**We promise:**
- A **tool that respects your intelligence** (no scammy "100x guaranteed" BS)
- A **system that works offline** (your data, your control)
- A **journal that makes you honest** (face your mistakes, own your wins)
- A **community of traders who get it** (losses are lessons, not failures)

**Your edge is not an indicator. It's discipline. It's journaling. It's self-awareness.**

Sparkfined is your training ground. The market is your test.

---

## Join the Journey

Ready to level up?

1. **Deploy Sparkfined** — One-click Vercel deploy (or self-host)
2. **Journal your first trade** — Even if it's a loss. Especially if it's a loss.
3. **Set your first alert** — Pick one confluence rule, test it for 30 days
4. **Share your lesson** — When you learn something, help others avoid the same mistake

**The Hero's Journey starts with one step. Start journaling today.**

---

## License

All rights reserved. This is a private repository owned by the Sparkfined team.

---

## Support

**Questions?**
- 📖 Check [`docs/README.md`](docs/README.md) for navigation
- 🔍 Search `docs/` for keywords
- 📦 Check [`docs/archive/`](docs/archive/) for historical context

**Issues?**
- Build problems: See [`docs/setup/build-and-deploy.md`](docs/setup/build-and-deploy.md)
- Environment issues: See [`docs/setup/environment-and-providers.md`](docs/setup/environment-and-providers.md)
- PWA issues: See [`docs/pwa-audit/03_core_flows.md`](docs/pwa-audit/03_core_flows.md)

---

**Maintained by:** Sparkfined Team
**Version:** 0.1.0 (Beta)
**Status:** ✅ Production-Ready | 🚀 Launch-Ready


---

## 📚 Documentation

**Complete Documentation Hub:** [docs/README.md](./docs/README.md)

### Quick Links

- **[Active Sprint & Roadmap](./docs/active/Working_Plan.md)** — Current development status
- **[Setup Guide](./docs/core/setup/environment-and-providers.md)** — Get started with development
- **[Architecture](./docs/core/architecture/01_repo_index.md)** — System design & structure
- **[AI Integration](./docs/core/ai/README_AI.md)** — AI features & configuration
- **[Agent Configs](./AGENT_FILES/README.md)** — AI tool configurations (Cursor, Claude, Codex)

**For detailed navigation, see [docs/README.md](./docs/README.md)**


