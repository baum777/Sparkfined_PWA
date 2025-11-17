# Sparkfined PWA
_A progressive web application for crypto market research, journaling, and alert workflows._

## Table of Contents
- [Overview](#overview)
- [Quick Start](#quick-start)
- [Available Scripts](#available-scripts)
- [Environment Configuration](#environment-configuration)
- [Runtime & Tooling](#runtime--tooling)
- [Development Workflow](#development-workflow)
- [Architecture Overview](#architecture-overview)
- [Telemetry & Security Notes](#telemetry--security-notes)
- [Contribution](#contribution)
- [License & Maintainers](#license--maintainers)
- [Releases](#releases)

## Overview
Sparkfined is a Vite-powered Progressive Web App that bundles trading research utilities such as market data adapters, journaling tools, and alert orchestration into a single offline-capable interface. The app validates configuration at startup, registers a PWA service worker in production, and wires diagnostic hooks to keep deployments observable without blocking the UI. 【F:src/main.tsx†L1-L108】

Supporting documentation that details the product roadmap, rollout phases, and feature plans lives under the `docs/` directory and can be consulted for deeper context about the long-term vision. 【F:docs/REPO_STRUKTURPLAN_2025.md†L1-L40】

## Quick Start
### Prerequisites
- **Node.js** >= 20.10.0
- **pnpm** (recommended) or npm

### Setup

```bash
# Clone repository
git clone https://github.com/baum777/sparkfined-pwa.git
cd sparkfined-pwa

# Install dependencies
pnpm install

# Copy environment template
cp .env.example .env.local

# Add required API keys to .env.local (server-only)
# - MORALIS_API_KEY (required for Moralis proxy)
# - OPENAI_API_KEY (optional, for AI features)
# - VITE_SOLANA_RPC_URL (optional, defaults to mainnet)

# Start development server
pnpm dev
```

The app will be available at `http://localhost:5173`

### Testing PWA Features

```bash
# Build production version
pnpm build

# Preview with service worker enabled
pnpm preview

# Access different pages:
# - Main app: http://localhost:4173
# - Icon showcase: http://localhost:4173/icons
# - Offline test: http://localhost:4173/offline.html
```

**Test Installation:**
1. Open Chrome DevTools → Application → Manifest
2. Verify all 14 icons are listed (32px - 1024px)
3. Check Service Worker status (should be "activated")
4. Click "Install" button in browser address bar
5. Test offline: Disconnect network → reload → see custom offline page

---

## 🛠️ Development Scripts

```bash
pnpm dev           # Start Vite dev server with HMR
pnpm build         # TypeScript check + production build
pnpm preview       # Preview production build locally (port 4173)
pnpm test          # Run Vitest unit tests
pnpm test:watch    # Watch mode for tests
pnpm test:e2e      # Run Playwright E2E tests
pnpm lint          # ESLint with flat config
pnpm format        # Format code with Prettier
pnpm typecheck     # Run TypeScript compiler (no emit)
pnpm analyze       # Bundle size analysis
pnpm lighthouse    # Lighthouse audit (requires preview)
```

---

## 🌐 Deployment (Vercel)

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/baum777/sparkfined-pwa)

### Manual Deployment

1. **Connect Git Repository** in Vercel Dashboard
2. **Set Environment Variables (Vercel Project → Settings → Environment Variables):**
   ```
   MORALIS_API_KEY=REDACTED_TOKEN
   MORALIS_BASE_URL=https://deep-index.moralis.io/api/v2.2
   OPENAI_API_KEY=REDACTED_TOKEN # optional
   ```
   > ⚠️ Do **not** expose `VITE_MORALIS_API_KEY` anymore. The Moralis key must stay server-side.
3. **Deploy:** Push to main branch → auto-deploy
4. **Verify:** Check Lighthouse scores (target 90+ in all categories)

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `DEXPAPRIKA_BASE` | ✅ | Base URL for DexPaprika OHLC API (primary provider) |
| `DEXPAPRIKA_API_KEY` | ❌ | DexPaprika API key (if required by plan) |
| `MORALIS_API_KEY` | ✅ | Server-only Moralis API key consumed by `/api/moralis` |
| `MORALIS_BASE_URL` | ❌ | Override base URL for Moralis API (defaults to official endpoint) |
| `DATA_PROXY_SECRET` | ✅ | Shared secret for internal API proxy calls |
| `OPENAI_API_KEY` | ❌ | OpenAI API key for AI features |
| `ANTHROPIC_API_KEY` | ❌ | Alternative AI provider |
| `VITE_SOLANA_RPC_URL` | ❌ | Solana RPC endpoint (defaults to mainnet) |
| `VITE_VAPID_PUBLIC_KEY` | ❌ | Public Web Push key exposed to the client; must match `VAPID_PUBLIC_KEY` |
| `VAPID_PUBLIC_KEY` | ❌ | Web Push public key |
| `VAPID_PRIVATE_KEY` | ❌ | Web Push private key (server-side only) |
| `ALERTS_ADMIN_SECRET` | ❌ | Bearer token for `/api/push/test-send` (required in production) |
| `DEV_USE_MOCKS` | ❌ | When `true`, proxy returns mocked responses instead of live Moralis calls |

*Note: Client-side variables must be prefixed with `VITE_`*

See `docs/setup/push-notifications.md` for a dedicated Web Push checklist, sample payload, and verification commands.

---

## 📱 PWA Features

### Offline Support
- **Cache-First Strategy** for static assets (JS, CSS, fonts)
- **Network-First** for API calls with fallback to cache
- **Custom Offline Page** (`/offline.html`) with Sparkfined branding
- Full app functionality without internet connection
- 66 precached entries (~2.3 MB) for instant offline access
- Background sync for pending actions (planned)

- Node.js \>= 20.10.0 【F:package.json†L6-L13】
- [pnpm](https://pnpm.io/) (repository ships with a `pnpm-lock.yaml`)

### Installation
```bash
pnpm install
```

### Local development
```bash
pnpm dev
```
The dev server runs on [http://localhost:5173](http://localhost:5173) by default. Preview builds are exposed on port 4173 when using `pnpm preview`.

### Build and verification
```bash
pnpm build        # TypeScript project references + production bundle
pnpm preview      # Preview the latest production bundle
pnpm lint         # ESLint with the flat config at the project root
pnpm typecheck    # Run the TypeScript compiler without emitting files
pnpm test         # Vitest with V8 coverage
pnpm test:watch   # Vitest watch mode for rapid feedback
pnpm test:e2e     # Playwright browser tests
pnpm build:local  # Production build + bundle size verification
pnpm build:ci     # build:local plus Playwright e2e checks
pnpm analyze      # Build with bundle analyzer enabled
pnpm lighthouse   # Run Lighthouse against a preview build
pnpm check:size   # Standalone bundle size assertion used by build:local
```
The script responsibilities and when to use them are documented in `docs/BUILD_SCRIPTS_EXPLAINED.md`. 【F:docs/BUILD_SCRIPTS_EXPLAINED.md†L1-L52】

## Available Scripts
The `package.json` exposes the following pnpm scripts:

- `pnpm dev` – Vite development server with hot module replacement.【F:package.json†L9-L22】
- `pnpm build` – TypeScript project references build followed by a production bundle.【F:package.json†L9-L22】
- `pnpm preview` – Preview the production build locally.【F:package.json†L9-L22】
- `pnpm test` / `pnpm test:watch` – Vitest with optional watch mode.【F:package.json†L17-L22】
- `pnpm test:e2e` – Playwright end-to-end suite.【F:package.json†L17-L22】
- `pnpm lint` / `pnpm format` / `pnpm typecheck` – Linting, formatting, and type-only checks.【F:package.json†L9-L22】
- `pnpm build:local` / `pnpm build:ci` – Production build with bundle size and CI verification.【F:package.json†L9-L22】
- `pnpm analyze` / `pnpm lighthouse` – Bundle analysis and Lighthouse audits.【F:package.json†L13-L20】
- `pnpm check:size` – Standalone bundle size enforcement used by local and CI builds.【F:package.json†L17-L22】

> **Note:** `pnpm lint` currently fails because of existing unused variables and unnecessary type assertions in several API and UI modules. Review the lint output before enabling the command in automation. 【ab583b†L1-L111】

## Environment Configuration
All runtime configuration is sourced from `.env.local` (copy `.env.example` as a baseline). The table below lists active keys from the template together with their intent. Additional, commented variables for push notifications, Solana access control, and performance budgets are documented in `docs/ENVIRONMENT_VARIABLES.md`. 【F:.env.example†L1-L122】【F:docs/ENVIRONMENT_VARIABLES.md†L1-L80】

| Name | Purpose | Example / Default | Required |
| --- | --- | --- | --- |
| `VITE_APP_VERSION` | Displays the current app version in the UI. | `1.0.0-beta` | Yes |
| `VITE_MORALIS_BASE` | Frontend base URL for Moralis data APIs. | `https://deep-index.moralis.io/api/v2.2` | Conditional (Moralis)
| `VITE_MORALIS_API_KEY` | Exposes the Moralis key to frontend fetchers. | `YOUR_MORALIS_KEY_HERE` | Conditional (Moralis)
| `MORALIS_API_KEY` | Server-side Moralis key for API routes. | `YOUR_MORALIS_KEY_HERE` | Conditional (Moralis)
| `MORALIS_BASE` | Backend Moralis base URL. | `https://deep-index.moralis.io/api/v2.2` | Conditional (Moralis)
| `MORALIS_WEBHOOK_SECRET` | Validates webhook calls from Moralis Streams. | `CHANGE_ME_FOR_MORALIS_WEBHOOK` | Optional (prod)
| `VITE_DEXPAPRIKA_BASE` | Frontend base URL for DexPaprika data. | `https://api.dexpaprika.com` | Conditional (DexPaprika)
| `DEXPAPRIKA_API_KEY` | Server-side DexPaprika API key. | `YOUR_DEXPAPRIKA_KEY_HERE` | Conditional (DexPaprika)
| `DEXPAPRIKA_BASE` | Backend DexPaprika base URL. | `https://api.dexpaprika.com` | Conditional (DexPaprika)
| `DATA_PROXY_SECRET` | Shared secret that protects backend data proxies. | `CHANGE_ME_FOR_DATA_PROXY` | Optional (prod)
| `ENABLE_OG_MINT` | Toggles OG mint endpoints in API handlers. | `false` | Optional |
| `VITE_DATA_PRIMARY` | Primary provider slug used by data orchestrators. | `dexpaprika` | Optional |
| `VITE_DATA_SECONDARY` | Secondary data provider fallback. | `moralis` | Optional |
| `VITE_DATA_FALLBACKS` | Comma-separated backup providers. | `dexscreener,pumpfun` | Optional |
| `OPENAI_API_KEY` | Enables OpenAI-backed AI features. | `YOUR_OPENAI_KEY_HERE` | Optional |
| `XAI_API_KEY` | Enables xAI/Grok backed AI features. | `YOUR_XAI_KEY_HERE` | Optional |
| `AI_MAX_COST_USD` | Upper bound for AI request spend. | `0.25` | Optional |
| `AI_CACHE_TTL_SEC` | Cache lifetime for AI responses (seconds). | `3600` | Optional |
| `AI_PROXY_SECRET` | Authorizes access to AI proxy API routes. | `CHANGE_ME_FOR_AI_PROXY` | Optional (prod)
| `ANALYSIS_AI_PROVIDER` | Selects which AI provider to use. | `openai` | Optional |
| `VITE_DEBUG` | Enables verbose debug UI modes. | `false` | Optional |
| `VITE_ENABLE_DEBUG` | Enables debug logging in production. | `false` | Optional |
| `VITE_ENABLE_AI_TEASER` | Toggles AI teaser UI elements. | `false` | Optional |
| `VITE_ENABLE_ANALYTICS` | Enables analytics collectors. | `false` | Optional |
| `VITE_ENABLE_METRICS` | Enables local performance metrics capture. | `true` | Optional |
| `VITE_ORDERFLOW_PROVIDER` | Configures the order flow provider. | `none` | Optional |
| `VITE_WALLETFLOW_PROVIDER` | Configures the wallet flow provider. | `none` | Optional |

## Runtime & Tooling
| Tool | Version / Source |
| --- | --- |
| Node.js | >= 20.10.0 (enforced via `engines`) 【F:package.json†L6-L13】
| pnpm | Developed against the lockfile committed in `pnpm-lock.yaml` |
| TypeScript | ^5.6.2 【F:package.json†L51-L72】
| React | ^18.3.1 【F:package.json†L36-L44】
| Vite | ^5.4.21 【F:package.json†L68-L72】
| ESLint | ^9.9.0 (flat config in `eslint.config.js`) 【F:package.json†L51-L72】
| Vitest | ^1.6.0 【F:package.json†L68-L72】
| Playwright | ^1.48.2 【F:package.json†L44-L52】

## Development Workflow
- Use topic branches that describe the change scope (for example `feature/my-feature`). The deployment checklist demonstrates the expected Git usage before pushing. 【F:docs/DEPLOY_CHECKLIST.md†L445-L460】
- Follow Conventional Commits in commit messages (`docs(readme): ...`, `feat: ...`, etc.). 【F:docs/README_LEGACY.md†L384-L390】
- Run `pnpm build:local` plus unit and lint checks before opening a pull request. The Playwright suite behind `pnpm build:ci` is the baseline for CI parity. 【F:docs/BUILD_SCRIPTS_EXPLAINED.md†L23-L52】

## Architecture Overview
- **Client bootstrap:** `src/main.tsx` installs boot guards, validates environment variables, and registers the PWA service worker before rendering the React tree. 【F:src/main.tsx†L1-L108】
- **Telemetry & diagnostics:** `src/state/telemetry.tsx` buffers sampled events and flushes them to `/api/telemetry`, while `src/lib/TelemetryService.ts` offers local performance instrumentation helpers. 【F:src/state/telemetry.tsx†L1-L96】【F:src/lib/TelemetryService.ts†L1-L86】
- **Serverless APIs:** Route handlers under `api/` provide data orchestration, alerting, telemetry, and journaling endpoints that the frontend consumes via typed adapters. 【F:api/telemetry.ts†L1-L15】
- **Documentation:** Repository-level product strategy, onboarding notes, and environment guidance are curated in `docs/`, including the environment catalogue and build script reference. 【F:docs/ENVIRONMENT_VARIABLES.md†L1-L80】【F:docs/BUILD_SCRIPTS_EXPLAINED.md†L1-L52】

## Telemetry & Security Notes
Telemetry capture is opt-in and stored locally until flushed. The provider samples events, stores them in session storage, and sends batched payloads to `/api/telemetry` via `navigator.sendBeacon` before unload. Ensure production deployments keep secrets such as API keys and shared secrets out of client bundles and rotate them regularly. 【F:src/state/telemetry.tsx†L1-L96】【F:.env.example†L12-L88】

## Contribution
This repository is private. Coordinate contributions with the maintainer team and keep pull requests aligned with the deployment checklist stored under `docs/DEPLOY_CHECKLIST.md`. 【F:docs/DEPLOY_CHECKLIST.md†L445-L460】

## License & Maintainers
No public license is published; all rights reserved by the Sparkfined team.

## Releases
A dedicated changelog has not been established yet. Track release planning and historical notes in `IMPROVEMENT_ROADMAP.md` and related documents under `docs/`. 【F:IMPROVEMENT_ROADMAP.md†L1-L40】
