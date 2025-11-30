---
title: "F-05 Signal Matrix — Production Readiness"
sources:
  - src/pages/SignalsPage.tsx
  - src/hooks/useSignals.ts
  - src/lib/signalDb.ts
  - src/lib/serverRules.ts
  - api/rules/eval-cron.ts
  - api/rules/index.ts
---

## Kontext
- Signal Matrix renders IndexedDB-backed signal feeds, plan reviews, and server rule evaluation hooks.
- Data persistence relies on `signalDb` Dexie schema; server integration via `/api/rules` + cron evaluator.
- Currently lacks seeded fixtures, no automated tests for Dexie layer, and cron evaluator is untested.

## Blocker
1. `signalDb` operations untested (save/load/sort), risking data loss or stale caches.
2. No integration between signals and rule evaluator — cron job may fail silently.
3. UI lacks deterministic test data, making Playwright and unit coverage difficult.

## Tasks
- [ ] Create MSW or vi-fetch fixtures for signals/trade plans/trade outcomes.
- [ ] Add Vitest Dexie integration tests using `fake-indexeddb`:
  - [ ] `saveSignal` + `getAllSignals` ordering
  - [ ] `getSignalsByPattern`
  - [ ] Trade plan save/get flows
  - [ ] Pattern stats aggregator
- [ ] Add tests for `/api/rules/eval-cron` using mocked fetch:
  - [ ] Grouping + limit logic
  - [ ] Rule evaluation branches (`price-cross`, `pct-change-24h`, `vwap-cross`)
  - [ ] Dispatch payload shape
- [ ] Extend `useSignals` hook tests verifying loading/error states and confidence filtering.
- [ ] Build Playwright smoke:
  - [ ] Loads seeded signals
  - [ ] Filters by pattern + confidence slider
  - [ ] Opens detail modal & accepts signal
- [ ] Document seeding script for Dexie (e.g., `scripts/seed-signals.ts`) to prep CI.

## Acceptance Criteria
- Dexie tests run headless in Vitest using fake-indexeddb.
- `/api/rules/eval-cron` fully covered with deterministic responses.
- Playwright scenario passes using seeded data.
- Signal page logs telemetry for filter interactions (asserted via spy).
- Documentation updated with seeding command.

## Validation
- `pnpm vitest --run --testNamePattern="signal"`
- `pnpm vitest --run --testNamePattern="rules eval"`
- `pnpm playwright test signals`
- `pnpm lint src/pages/SignalsPage.tsx src/lib/signalDb.ts api/rules/eval-cron.ts`
- `pnpm typecheck --filter signals`

