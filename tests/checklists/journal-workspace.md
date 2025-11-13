---
title: "Checklist — F-04 Journal Workspace"
sources:
  - tickets/journal-workspace-todo.md
  - tests/cases/journal-condense-ai/JCA-UNIT-001.test.ts
  - api/journal/index.ts
  - src/pages/JournalPage.tsx
---

## Preflight
- [ ] `pnpm install`
- [ ] Ensure fake-indexeddb configured for Vitest (`setupTests.ts` or similar)
- [ ] Load env secrets (`AI_PROXY_SECRET`) for AI proxy tests

## Unit / Integration
- [ ] `pnpm vitest --run --testNamePattern="journal crud"`
- [ ] `pnpm vitest --run --testNamePattern="JCA-UNIT"`
- [ ] `pnpm vitest --run --testNamePattern="JCA-INTEG"`
- [ ] `pnpm vitest --run --testNamePattern="JCA-SEC"`
- [ ] Snapshot Dexie export/import results

## Backend Contracts
- [ ] `pnpm vitest --run --testNamePattern="api journal"`
- [ ] Verify recomputed metrics via assertion logs

## E2E
- [ ] Seed local storage / KV mocks
- [ ] `pnpm playwright test journal`
- [ ] Attach trace with AI attach path

## Quality Gates
- [ ] `pnpm lint src/pages/JournalPage.tsx api/journal/index.ts`
- [ ] `pnpm typecheck --filter journal`
- [ ] `pnpm build`
- [ ] Verify telemetry spy recorded journal save + AI attach

## Artefacts
- [ ] Update docs with new test coverage & env requirements
- [ ] Provide sample exported note JSON in PR (if changed)

