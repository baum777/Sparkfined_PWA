---
title: "Checklist — F-02 Market Analyze"
sources:
  - tickets/market-analyze-todo.md
  - tests/cases/analyze-bullets-ai/ABA-UNIT-001.test.ts
  - api/market/ohlc.ts
  - src/pages/AnalyzePage.tsx
---

## Preflight
- [ ] Install deps `pnpm install`
- [ ] Ensure env vars set (`AI_PROXY_SECRET`, `MORALIS_API_KEY`, `DATA_PROXY_SECRET`)
- [ ] Start mock server (if required) `pnpm dev --filter api` (documented in ticket)

## Unit / Integration
- [ ] `pnpm vitest --run --testNamePattern="ABA-UNIT"`
- [ ] `pnpm vitest --run --testNamePattern="ABA-INTEG"`
- [ ] `pnpm vitest --run --testNamePattern="ABA-SEC"`
- [ ] `pnpm vitest --run --testNamePattern="priceAdapter"`
- [ ] Capture coverage summary for analyze modules

## Backend Contracts
- [ ] `pnpm vitest --run --testNamePattern="api rules"`
- [ ] `pnpm vitest --run --testNamePattern="api ideas"`
- [ ] `pnpm vitest --run --testNamePattern="api journal"`

## E2E
- [ ] Seed / mock data per ticket instructions
- [ ] `pnpm playwright test analyze`
- [ ] Attach video or trace for review

## Quality Gates
- [ ] `pnpm lint src/pages/AnalyzePage.tsx api/market/ohlc.ts`
- [ ] `pnpm typecheck --filter analyze`
- [ ] `pnpm build` (ensures tree compiles)
- [ ] Document telemetry events observed (id, payload)

## Artefacts
- [ ] Update docs or changelog with new tests
- [ ] Link logs/screenshots in PR

