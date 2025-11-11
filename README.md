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
