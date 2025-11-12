---
title: "Production Readiness Report"
sources:
  - docs/features/production-ready.md
  - docs/features/next-up.md
  - tickets/market-analyze-todo.md
  - tickets/journal-workspace-todo.md
  - tickets/signal-matrix-todo.md
  - tickets/replay-lab-todo.md
  - tickets/notifications-center-todo.md
---

## Executive Summary
- **Ready for Production:** Telemetry & Diagnostics, Offline Shell/PWA Core (validated via unit + e2e tests).
- **In Progress:** Analyze dashboard, Journal workspace, Signal matrix, Replay lab, Notifications center require targeted hardening (tests, mocks, observability).
- **Risks:** External provider dependencies (Moralis, DexPaprika, OpenAI/xAI) lack resilient fallback verification; push notification pipeline untested; replay feature relies on mocked OHLC data.

## Readiness Matrix
| Feature | Status | Key Gaps |
|---------|--------|----------|
| F-01 Command Board | 40% | Mock KPI data, missing data loaders/tests |
| F-02 Market Analyze | 65% | Idea packet contracts, AI guardrails tests |
| F-03 Interactive Chart | 60% | Lack of automated coverage for draw/export/backtest |
| F-04 Journal Workspace | 55% | Skipped CRUD tests, API normalization |
| F-05 Signal Matrix | 30% | No Dexie tests, cron evaluator unverified |
| F-06 Replay Lab | 45% | Mocked OHLC, skipped e2e |
| F-07 Notifications Center | 35% | Push endpoints untested, PushManager mocks |
| F-08 Access Control | 30% | Mock wallet, missing Solana integration tests |
| F-09 Settings | 70% | Wallet monitor + AI budgets lack tests |
| F-10 Lessons & Ideas | 25% | Data export/import unverified |
| F-11 Telemetry & Diagnostics | ✅ Ready | All criteria met |
| F-12 Offline Shell & PWA Core | ✅ Ready | All criteria met |

## Recommended Iteration Order
1. **F-02 Market Analyze** — High user impact, dependency for idea/rule flows.
2. **F-04 Journal Workspace** — Core data retention; unlocks user trust.
3. **F-05 Signal Matrix** — Prerequisite for alerts + cron evaluations.
4. **F-06 Replay Lab** — Medium impact; requires data & UX polish.
5. **F-07 Notifications Center** — Completes alert lifecycle (push + rules).

## Observability & CI
- Current automation covers: Vitest unit suites (`tests/unit`), specialized case suites (`tests/cases`), Playwright smoke (`tests/e2e/pwa.spec.ts`).
- Missing automation: Access checks, push worker, signal evaluator, replay flows.
- CI Pipeline recommendation: `pnpm lint && pnpm typecheck && pnpm test && pnpm playwright test --config=playwright.config.ts --project chromium`.

## Next Steps
- Follow tickets under `tickets/` and validation routines under `tests/checklists/`.
- Use `patches/` proposals to stage test-first iterations.
- Maintain PR discipline with `PR_TEMPLATE.md`.

