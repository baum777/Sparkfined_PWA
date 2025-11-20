# Sparkfined PWA

> **Offline-first Trading Command Center** — AI-powered crypto market research, journaling, and alerts in your browser.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/baum777/sparkfined-pwa)

---

## What is Sparkfined?

Sparkfined is a **Progressive Web App (PWA)** that brings professional-grade trading tools directly to your browser — no installation required. Built for crypto traders who need to work anywhere, even offline.

**Key Differentiators:**
- ✅ **Offline-First:** Full functionality without internet (IndexedDB + Service Worker)
- 🤖 **AI-Powered:** Dual-provider AI (OpenAI + Grok) for market insights and trade analysis
- 📊 **Advanced Charting:** 60fps canvas rendering, multi-timeframe analysis, 25+ indicators
- 📝 **Integrated Journal:** OCR screenshot analysis, AI condensation, offline sync
- 🔔 **Smart Alerts:** Visual rule builder, serverless evaluation, web push notifications
- 🔐 **Access Gating:** Solana wallet-based authentication (OG Pass NFT + token holding)

**Perfect for:** Day traders, meme coin researchers, trading educators, crypto analysts who demand speed, privacy, and offline capability.

---

## Features

### Production-Ready ✅

| Feature | Description |
|---------|-------------|
| **Advanced Charts** | Canvas-rendered OHLC charts with SMA, EMA, RSI, Bollinger Bands, MACD. Replay mode, multi-timeframe, export. |
| **Token Analysis** | 25+ KPIs, heatmaps, AI-generated insights. Multi-provider data (Moralis, DexPaprika). |
| **Trading Journal** | Rich text editor, OCR for screenshots, AI-powered trade summaries, tag-based filtering. |
| **Alerts & Signals** | Visual rule wizard, serverless evaluation, push notifications, alert history. |
| **Board Dashboard** | KPI tiles, activity feed, quick actions, guided onboarding tour. |
| **PWA Offline Mode** | 66 precached assets (~2.3 MB), offline fallback page, background sync. |
| **Access Gating** | Solana wallet integration, OG Pass NFT validation, token holding requirements. |

### In Development 🚧

- **Signal Orchestrator** — Multi-indicator confluence engine
- **Moralis Cortex Integration** — Advanced on-chain analytics
- **Social Features** — Trade sharing, community insights
- **Real-Time WebSocket** — Live price updates (currently polling)

**See [`docs/features/production-ready.md`](docs/features/production-ready.md) and [`docs/features/next-up.md`](docs/features/next-up.md) for details.**

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18.3, TypeScript 5.6, Vite 5.4, TailwindCSS 4.1 |
| **State** | Zustand, React Context, Custom Hooks |
| **Persistence** | Dexie (IndexedDB), Offline-First Architecture |
| **Backend** | Vercel Edge Functions (Serverless) |
| **AI** | OpenAI (gpt-4o-mini), Grok (xAI) — Dual-provider strategy |
| **Data** | Moralis, DexPaprika, Solana Web3.js |
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

# === Solana (for access gating) ===
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
VITE_ACCESS_TOKEN_MINT=your_token_mint_address
VITE_METAPLEX_COLLECTION_MINT=your_collection_mint_address

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
