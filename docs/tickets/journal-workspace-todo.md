---
title: "F-04 Journal Workspace — Production Readiness"
sources:
  - src/pages/JournalPage.tsx
  - src/lib/journal.ts
  - api/journal/index.ts
  - tests/cases/journal-condense-ai/JCA-UNIT-001.test.ts
  - tests/unit/journal.crud.test.ts
  - src/sections/journal/useJournal.ts
---

## Kontext
- Journal combines IndexedDB Dexie store with KV-backed API for sync and AI-assisted condense flow.
- Current implementation exposes CRUD UI, AI attach, server exports.
- Unit suite for `journal.crud` is fully skipped; API handler lacks contract coverage; E2E condense flow is CI-only due to missing fixtures.

## Blocker
1. No automated guarantee that `useJournal` persistence is lossless across create/update/delete operations.
2. `/api/journal` normalisation and metric recomputation untested.
3. AI condense flow lacks clearance for PII stripping and cost guard.

## Fortschritt 2025-12-05
- Journal CRUD Vitest-Suite erweitert: Titel-Validation, Duplicate-ID-Schutz, Import/Merge- und v4→v5-Migrationspfad abgedeckt.

## Tasks
- [ ] Re-implement `tests/unit/journal.crud.test.ts` using Dexie in-memory adapter or vi-mocked IndexedDB; cover CRUD lifecycle + export/import.
- [ ] Add Vitest contract tests for `/api/journal`:
  - [ ] Create note with mixed numeric strings
  - [ ] Update note ensures recomputed metrics (PnL, RR)
  - [ ] Delete branch returns ok
- [ ] Extend AI condense tests:
  - [ ] Assert `[redacted-phone]` replacement using fixture containing phone numbers.
  - [ ] Add latency budget/perf assertions (<=350ms) with deterministic mocks.
- [ ] Provide Playwright smoke (can reuse Journal page) verifying:
  - [ ] Draft injection via `journal:draft`
  - [ ] Server sync list updates after save
  - [ ] AI attach toggles persist to server
- [ ] Add observability check ensuring `telemetry.enqueue` fires on save + AI attach.

## Acceptance Criteria
- Vitest journal CRUD suite runs without skips and passes.
- `/api/journal` tests cover create/update/delete and metric normalization.
- Journal Playwright smoke green locally & CI (with mocked backend).
- AI condense tests include PII sanitization & cost cap.
- Telemetry buffer shows events for journal saves during tests (can assert using spy).

## Validation
- `pnpm vitest --run --testNamePattern="journal"`
- `pnpm playwright test journal`
- `pnpm lint src/pages/JournalPage.tsx api/journal/index.ts`
- `pnpm typecheck --filter journal`

