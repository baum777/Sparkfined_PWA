# Env Inventory

| Name | Files | Used At | Exposure | Comment |
|---|---|---|---|---|
| `MORALIS_API_KEY` | `api/moralis/[...path].ts`, `scripts/check-env.js` | runtime (server functions) | server-only | Required secret for Moralis proxy; validated before builds. |
| `MORALIS_BASE_URL` | `api/moralis/[...path].ts`, `src/config/providers.ts` | runtime (server functions) | server-only | Optional override for Moralis upstream base URL. |
| `MORALIS_PROXY_TTL_MS` | `api/moralis/[...path].ts` | runtime (server functions) | server-only | Controls in-memory cache TTL for proxy responses. |
| `DEV_USE_MOCKS` | `api/moralis/[...path].ts`, `.env.example`, `scripts/smoke-vercel-check.sh` | runtime (server + local scripts) | server-only | When true, proxy returns mocked payloads instead of hitting Moralis. |
| `DEXPAPRIKA_API_KEY` | `src/config/providers.ts`, `.env.example` | runtime (server functions) | server-only | Optional DexPaprika secret consumed by provider helper. |
| `VITE_APP_VERSION` | `src/pages/SettingsPage.tsx` | runtime (client) | client (exposed) | Displays current app version in settings UI. |
| `VITE_VAPID_PUBLIC_KEY` | `src/pages/SettingsPage.tsx`, `src/pages/NotificationsPage.tsx`, `src/lib/validateEnv.ts` | runtime (client) | client (exposed) | Public Web Push key; safe to expose. |
| `VITE_ENABLE_DEBUG` | `src/hooks/useEventLogger.ts`, `src/lib/logger.ts`, `src/lib/ocr/ocrService.ts`, `src/lib/config.ts` | runtime (client) | client (exposed) | Toggles verbose logging in UI and services. |
| `VITE_DEBUG` | `src/lib/logger.ts` | runtime (client) | client (exposed) | Legacy debug flag for logging. |
| `VITE_ENABLE_ANALYTICS` | `src/lib/config.ts` | runtime (client) | client (exposed) | Enables analytics collectors in UI. |
| `VITE_DEXPAPRIKA_BASE` | `src/lib/adapters/dexpaprikaAdapter.ts`, `src/lib/priceAdapter.ts` | runtime (client) | client (exposed) | Base URL for DexPaprika fetchers in the browser. |
| `VITE_API_BASE_URL` | `src/lib/config.ts` | runtime (client) | client (exposed) | Configures base URL for REST calls from frontend. |
| `VITE_API_KEY` | `src/lib/config.ts` | runtime (client) | client (exposed) | Optional API key for frontend REST calls (public). |
| `VITE_ANALYSIS_AI_PROVIDER` | `src/lib/config/flags.ts` | runtime (client) | client (exposed) | Selects AI provider for analysis features. |
| `VITE_DATA_PRIMARY` | `src/lib/config/flags.ts`, `src/lib/data/marketOrchestrator.ts` | runtime (client) | client (exposed) | Primary data provider selection. |
| `VITE_DATA_SECONDARY` | `src/lib/config/flags.ts`, `src/lib/data/marketOrchestrator.ts` | runtime (client) | client (exposed) | Secondary data provider fallback. |
| `VITE_DATA_FALLBACKS` | `src/lib/data/marketOrchestrator.ts` | runtime (client) | client (exposed) | Ordered list of additional providers. |
| `VITE_ENABLE_METRICS` | `src/lib/data/marketOrchestrator.ts` | runtime (client) | client (exposed) | Enables local performance metrics capture. |
| `VITE_ORDERFLOW_PROVIDER` | `src/lib/data/orderflow.ts` | runtime (client) | client (exposed) | Configures orderflow provider integration. |
| `VITE_WALLETFLOW_PROVIDER` | `src/lib/data/walletFlow.ts` | runtime (client) | client (exposed) | Configures wallet flow provider integration. |
| `VITE_OPENAI_API_KEY` | `src/lib/validateEnv.ts` | runtime (client validation only) | client (exposed) | Optional; warns user if AI features not configured. |
| `VITE_ANTHROPIC_API_KEY` | `src/lib/validateEnv.ts` | runtime (client validation only) | client (exposed) | Optional; warns user if Anthropic AI not configured. |
| `VITE_ENABLE_AI_TEASER` | `src/lib/config/flags.ts` | runtime (client) | client (exposed) | Toggles AI teaser UI. |
| `VITE_VERCEL_ENV` | `src/lib/env.ts` | runtime (client) | client (exposed) | Distinguishes Vercel environment at runtime. |
***

> **Legend:**
> - *Exposure*: `client (exposed)` denotes variables bundled into the frontend (safe only for non-secret values). `server-only` variables must never be prefixed with `VITE_`.
> - *Used At*: indicates whether the variable is evaluated during build, runtime, or in serverless functions.
