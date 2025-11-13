---
title: "Checklist — F-05 Signal Matrix"
sources:
  - tickets/signal-matrix-todo.md
  - src/pages/SignalsPage.tsx
  - src/lib/signalDb.ts
  - api/rules/eval-cron.ts
---

## Preflight
- [ ] `pnpm install`
- [ ] Configure fake-indexeddb for Vitest
- [ ] Prepare signal seed fixture (JSON) for tests & e2e

## Unit / Integration
- [ ] `pnpm vitest --run --testNamePattern="signalDb"`
- [ ] `pnpm vitest --run --testNamePattern="useSignals"`
- [ ] `pnpm vitest --run --testNamePattern="pattern stats"`

## Backend Contracts
- [ ] `pnpm vitest --run --testNamePattern="rules eval"`
- [ ] `pnpm vitest --run --testNamePattern="api rules"`
- [ ] Inspect dispatched payload snapshot

## E2E
- [ ] Seed IndexedDB before test (playwright fixture)
- [ ] `pnpm playwright test signals`
- [ ] Capture screenshot of detail modal

## Quality Gates
- [ ] `pnpm lint src/pages/SignalsPage.tsx src/lib/signalDb.ts api/rules/eval-cron.ts`
- [ ] `pnpm typecheck --filter signals`
- [ ] `pnpm build`
- [ ] Verify telemetry spy captures filter interactions

## Artefacts
- [ ] Update docs with seeding script instructions
- [ ] Attach sample signal export in PR

