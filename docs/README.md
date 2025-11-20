# Sparkfined PWA — Documentation

**Version:** 4.0 (Consolidated & Refactored)
**Last Updated:** 2025-11-20
**Status:** ✅ Production-Ready

---

## 📋 Quick Navigation

### New to Sparkfined?
👉 **Start here:** `../README.md` (project overview) → [Getting Started](#getting-started)

### Want to deploy?
👉 [Setup Guide](#setup--installation) → [Deployment Guide](guides/deployment.md)

### Having issues?
👉 [Troubleshooting Guide](guides/troubleshooting.md)

### Need API docs?
👉 [API Reference](api/reference.md)

---

## Table of Contents

- [Overview](#overview)
- [Documentation Structure](#documentation-structure)
- [Getting Started](#getting-started)
- [Setup & Installation](#setup--installation)
- [Architecture & Design](#architecture--design)
- [Features](#features)
- [Development](#development)
- [Deployment](#deployment)
- [API & Integration](#api--integration)
- [Testing & Quality](#testing--quality)
- [Project Management](#project-management)
- [Archive](#archive)

---

## Overview

Sparkfined is an **offline-first Progressive Web App** for crypto trading research, journaling, and alerts. Built with React 18, TypeScript 5.6, Vite 5.4, and powered by dual AI providers (OpenAI + Grok).

**Key Features:**
- 📱 PWA with offline support
- 📊 Real-time OHLC charts with technical indicators
- 📝 AI-powered trading journal
- 🔔 Customizable price alerts
- 🪙 Solana wallet-based access control
- 🤖 Dual AI analysis (OpenAI + Grok)

**Tech Stack:**
- React 18.3, TypeScript 5.6, Vite 5.4
- TailwindCSS 4.1, Zustand 5.0, Dexie 3.2
- Vercel serverless functions
- PWA with Workbox

---

## Documentation Structure

```
docs/
├── README.md                          # 👈 You are here (Navigation Guide)
│
├── setup/                             # Installation & Configuration
│   ├── environment-and-providers.md   # ENV vars, API keys, providers
│   ├── build-and-deploy.md            # Build scripts reference
│   └── push-notifications.md          # Web Push setup
│
├── guides/                            # How-To Guides
│   ├── deployment.md                  # 🚀 Vercel deployment (NEW)
│   ├── troubleshooting.md             # 🔧 Common issues & fixes (NEW)
│   └── access-tabs.md                 # Access page UX guide
│
├── api/                               # API Documentation
│   └── reference.md                   # 📡 All endpoints (NEW)
│
├── architecture/                      # System Design (planned)
│   ├── overview.md                    # 5-layer model
│   ├── frontend.md                    # React architecture
│   ├── backend.md                     # Serverless functions
│   └── pwa.md                         # Offline-first strategy
│
├── features/                          # Feature Documentation
│   ├── advanced-insight.md            # Advanced Insight backend
│   ├── next-up.md                     # Upcoming features
│   └── production-ready.md            # Production readiness
│
├── concepts/                          # Domain Concepts
│   ├── journal-system.md              # Journal data model
│   ├── signal-orchestrator.md         # Signal pipeline
│   └── ai-roadmap.md                  # AI integration roadmap
│
├── design/                            # Design System
│   ├── IMPLEMENTATION_GUIDE.md        # Component guidelines
│   └── LOGO_DESIGN_DOCUMENTATION.md   # Branding assets
│
├── process/                           # Project Management
│   ├── product-overview.md            # Product vision
│   └── onboarding-blueprint.md        # User onboarding
│
├── lore/                              # Community & Marketing
│   ├── degens-creed.md                # Brand manifesto
│   ├── three-pillars.md               # Core principles
│   ├── hero-journey-full.md           # User journey
│   ├── onboarding-dialogs.md          # Onboarding copy
│   ├── x-timeline-posts.md            # Social media content
│   ├── community-posts-templates.md   # Community templates
│   └── nft-meme-collection-concept.md # NFT collection concept
│
├── pwa-audit/                         # PWA Audit Reports
│   ├── 01_repo_index.md               # Repository structure
│   ├── 02_feature_catalog.md          # Feature inventory
│   ├── 03_core_flows.md               # User flows
│   ├── 04_offline_sync_model.md       # Offline strategy
│   ├── 05_security_privacy.md         # Security audit
│   ├── 06_tests_observability_gaps.md # Testing gaps
│   └── 07_future_concepts.md          # Future concepts
│
└── _archive/                          # Historical Documentation
    ├── history/                       # 🆕 Implementation summaries
    │   ├── 2025-11-20-repository-audit.md
    │   ├── 2025-11-15-cleanup-complete.md
    │   ├── 2025-11-14-implementation-summary.md
    │   └── ... (12 more files)
    ├── phases/                        # Phase completion reports
    ├── audits/                        # Test & audit reports
    ├── deployment/                    # Legacy deployment docs
    ├── raw/2025-11-12/                # Consolidated legacy docs
    └── README.md                      # Archive guide
```

---

## Getting Started

### Prerequisites

- **Node.js** >= 20.10.0
- **pnpm** (recommended) or npm
- **Git**

### Quick Start

```bash
# 1. Clone repository
git clone https://github.com/baum777/Sparkfined_PWA.git
cd Sparkfined_PWA

# 2. Install dependencies
pnpm install

# 3. Set up environment
cp .env.example .env.local
# Add required API keys (see setup/environment-and-providers.md)

# 4. Start development server
pnpm dev
# → Open http://localhost:5173

# 5. Build for production
pnpm build
pnpm preview
# → Open http://localhost:4173
```

**Next Steps:**
1. Read [Environment Setup](setup/environment-and-providers.md) for API key configuration
2. Review [Architecture Overview](../CLAUDE.md) to understand the 5-layer model
3. Check [API Reference](api/reference.md) for backend endpoints

---

## Setup & Installation

| Document | Description | When to Use |
|----------|-------------|-------------|
| **[Environment & Providers](setup/environment-and-providers.md)** | ENV vars, API keys, data providers | First-time setup, adding providers |
| **[Build & Deploy](setup/build-and-deploy.md)** | Build scripts, deployment steps | Before deploying |
| **[Push Notifications](setup/push-notifications.md)** | Web Push setup, VAPID keys | Enabling push notifications |

---

## Architecture & Design

| Document | Description | When to Use |
|----------|-------------|-------------|
| **[../CLAUDE.md](../CLAUDE.md)** ⭐ | **Main architecture doc**: 5-layer model, patterns, ADRs | Understanding system design |
| **[../.rulesync/](../.rulesync/)** | Canonical project rules (11 SYSTEM + 6 ITERATIVE files) | Development guidelines |
| **[Design Implementation Guide](design/IMPLEMENTATION_GUIDE.md)** | Component design patterns | Building UI components |
| **[Logo Design](design/LOGO_DESIGN_DOCUMENTATION.md)** | Branding assets | Using brand assets |

**Key Concepts:**
- **5-Layer Model:** UI → State → Persistence → Backend → External Services
- **Offline-First:** PWA with Service Worker, IndexedDB (Dexie)
- **Type-Safe:** TypeScript strict mode, Result<T,E> pattern
- **Serverless:** Vercel Edge Functions, no traditional backend

---

## Features

### Current Features

| Feature | Status | Documentation |
|---------|--------|---------------|
| **Dashboard (Board)** | ✅ Live | 11 KPIs, real-time feed |
| **Interactive Charts** | ✅ Live | OHLC + 5 indicators (RSI, MACD, EMA, Bollinger, Volume) |
| **Trading Journal** | ✅ Live | [Journal System](concepts/journal-system.md) |
| **Price Alerts** | ✅ Live | Customizable rules |
| **Watchlist** | ✅ Live | Token tracking |
| **AI Analysis** | ✅ Beta | [AI Roadmap](concepts/ai-roadmap.md) |
| **Advanced Insight** | ✅ Beta | [Advanced Insight](features/advanced-insight-backend-wiring.md) |
| **Access Control** | 🚧 Mocked | Solana wallet + NFT gating (Q1 2025) |
| **Push Notifications** | 🚧 Optional | [Push Setup](setup/push-notifications.md) |

### Planned Features

| Feature | Timeline | Documentation |
|---------|----------|---------------|
| **On-Chain Access Gating** | Q1 2025 | Real Solana NFT verification |
| **Real-Time Alerts** | Q1 2025 | WebSocket live updates |
| **Background Sync** | Q1 2025 | Offline queue |
| **Signal Orchestrator** | Q1 2025 | [Signal Orchestrator](concepts/signal-orchestrator.md) |
| **Moralis Cortex AI** | Q1 2025 | Risk scores, trade ideas |

**See:** [Next Up](features/next-up.md) for full roadmap

---

## Development

### Available Scripts

```bash
pnpm dev           # Start dev server (http://localhost:5173)
pnpm build         # Production build (TypeScript + Vite)
pnpm preview       # Preview production build (http://localhost:4173)
pnpm test          # Run Vitest unit tests
pnpm test:watch    # Watch mode
pnpm test:e2e      # Playwright E2E tests
pnpm lint          # ESLint
pnpm typecheck     # TypeScript check (no emit)
pnpm analyze       # Bundle size analyzer
pnpm lighthouse    # Lighthouse audit
```

**See:** [Build & Deploy Guide](setup/build-and-deploy.md) for detailed script explanations

### Development Workflow

1. **Branch Naming:** `feature/my-feature`, `fix/bug-name`
2. **Commits:** Follow Conventional Commits (`feat:`, `fix:`, `docs:`)
3. **Pre-Commit:**
   ```bash
   pnpm lint && pnpm typecheck && pnpm test
   ```
4. **Pull Requests:** Use template in `.github/PULL_REQUEST_TEMPLATE.md`

---

## Deployment

### Quick Deploy to Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/baum777/sparkfined-pwa)

### Manual Deployment

**Full Guide:** [Deployment Guide](guides/deployment.md)

**Quick Checklist:**
1. ✅ Set environment variables in Vercel Dashboard
2. ✅ Run `pnpm build:local` (verify bundle size)
3. ✅ Push to main branch → auto-deploy
4. ✅ Run post-deploy validation (Lighthouse, smoke tests)
5. ✅ Monitor Vercel function logs

**Required ENV Variables:**
- `MORALIS_API_KEY` (server-only)
- `DEXPAPRIKA_BASE`
- `DATA_PROXY_SECRET`
- Optional: `OPENAI_API_KEY`, `XAI_API_KEY`

---

## API & Integration

### API Documentation

**[API Reference](api/reference.md)** — Complete endpoint documentation

**Quick Links:**
- Health check: `GET /api/health`
- Market data: `GET /api/data/ohlc?symbol=SOL`
- Journal: `GET /api/journal`
- AI analysis: `POST /api/ai/analyze-market`
- Push notifications: `POST /api/push/subscribe`

### Integration Patterns

**fetchWithRetry Pattern:**
```typescript
import { fetchWithRetry } from '@/lib/net/fetch'

const result = await fetchWithRetry('/api/data/ohlc?symbol=SOL', {
  retries: 3,
  baseDelay: 1000,
  timeout: 10000
})
```

**Result<T,E> Pattern:**
```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E }

const result = await fetchTokenData('SOL')
if (result.success) {
  console.log(result.data)
} else {
  console.error(result.error)
}
```

---

## Testing & Quality

### Test Coverage

- **Unit Tests:** Vitest (`pnpm test`)
- **E2E Tests:** Playwright (`pnpm test:e2e`)
- **Coverage Target:** 80% overall, 90% for critical modules

### Quality Checks

```bash
# Pre-deploy checklist
pnpm lint          # ESLint
pnpm typecheck     # TypeScript strict mode
pnpm test          # Unit tests
pnpm build:local   # Build + bundle size check
pnpm lighthouse    # Performance audit (≥90 target)
```

**See:** [Testing Strategy](../.rulesync/06-testing-strategy.md)

---

## Project Management

### Product Vision

**[Product Overview](process/product-overview.md)** — Features, roadmap, vision

**[Onboarding Blueprint](process/onboarding-blueprint.md)** — User onboarding strategy

### Roadmap

**Active Sprint:** Foundation Cleanup (2025-11-12 → 2025-11-26)

**Q1 2025 Priorities:**
1. On-Chain Access Gating (Solana NFT)
2. Real-Time Alerts (WebSocket)
3. Background Sync (Offline Queue)

**See:** `../IMPROVEMENT_ROADMAP.md` for detailed roadmap

---

## Archive

Historical documentation and implementation summaries are preserved in `_archive/`:

### Recent History

- **[2025-11-20 Repository Audit](_archive/history/2025-11-20-repository-audit.md)** — Comprehensive codebase audit
- **[2025-11-15 Cleanup Complete](_archive/history/2025-11-15-cleanup-complete.md)** — Repo cleanup summary
- **[2025-11-14 Implementation Summary](_archive/history/2025-11-14-implementation-summary.md)** — UI/UX implementation

### Archive Categories

- **history/** — Implementation summaries, cleanup reports (12 files)
- **phases/** — Phase completion documents (9 files)
- **audits/** — Test & performance audits (3 files)
- **deployment/** — Legacy deployment docs (2 files)
- **raw/2025-11-12/** — Consolidated legacy docs (18 files)

**See:** [Archive README](_archive/README.md) for full index

---

## Troubleshooting

**Having issues?** Check these resources:

1. **[Troubleshooting Guide](guides/troubleshooting.md)** ⭐ — Common problems & solutions
2. **[Deployment Guide](guides/deployment.md)** — Deployment-specific issues
3. **[API Reference](api/reference.md)** — API error codes
4. **GitHub Issues** — [Report a bug](https://github.com/baum777/Sparkfined_PWA/issues)

**Common Issues:**
- Build fails → [TypeScript errors](guides/troubleshooting.md#typescript-errors)
- PWA not installing → [Service Worker issues](guides/troubleshooting.md#pwa--service-worker-issues)
- API returns 500 → [Backend issues](guides/troubleshooting.md#api--backend-issues)
- Double headers → [Layout issues](guides/troubleshooting.md#ui--layout-issues)

---

## Contributing

This is a private repository. Coordinate contributions with the maintainer team.

**Development Guidelines:**
1. Follow patterns in [CLAUDE.md](../CLAUDE.md)
2. Use TypeScript strict mode
3. Write tests for new features
4. Update documentation
5. Use PR template in `.github/`

---

## External Resources

- **Repository:** https://github.com/baum777/Sparkfined_PWA
- **Vercel Dashboard:** https://vercel.com/baum777/sparkfined-pwa
- **Wireframes:** `../wireframes/` directory
- **Tests:** `../tests/` directory

---

## Documentation Principles

This documentation follows these principles:

1. **Single Source of Truth:** No duplication, clear canonical sources
2. **Actionable:** Step-by-step guides with commands
3. **Up-to-Date:** Last update date in header
4. **Searchable:** Clear structure, table of contents
5. **Archived:** Historical docs preserved in `_archive/`
6. **Consolidated:** Related content merged into comprehensive guides

---

## Support

**For questions:**
1. Check this README for navigation
2. Search `_archive/` for historical context
3. Review inline code documentation
4. Check test files for usage examples
5. Ask in team chat

---

**Maintained by:** Sparkfined Team
**Documentation Version:** 4.0 (Consolidated 2025-11-20)
**Status:** ✅ Production-Ready | 🚀 Launch-Ready
