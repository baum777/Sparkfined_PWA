---
title: "Checklist — F-06 Replay Lab"
sources:
  - tickets/replay-lab-todo.md
  - src/pages/ReplayPage.tsx
  - src/lib/ReplayService.ts
  - tests/unit/replay.math.test.ts
---

## Preflight
- [ ] `pnpm install`
- [ ] Prepare replay session fixtures (JSON + OHLC)
- [ ] Ensure fake-indexeddb or Dexie mocks configured for Vitest

## Unit / Integration
- [ ] `pnpm vitest --run --testNamePattern="replay math"`
- [ ] `pnpm vitest --run --testNamePattern="ReplayService"`
- [ ] `pnpm vitest --run --testNamePattern="JournalService replay"`

## E2E
- [ ] Seed replay session via fixture
- [ ] `pnpm playwright test replay`
- [ ] Verify trace shows keyboard scrubbing + bookmarks

## Quality Gates
- [ ] `pnpm lint src/pages/ReplayPage.tsx src/lib/ReplayService.ts`
- [ ] `pnpm typecheck --filter replay`
- [ ] `pnpm build`
- [ ] Confirm telemetry logs (`user.bookmark.add`) emitted (spy)

## Artefacts
- [ ] Update docs with replay data requirements
- [ ] Attach GIF/video of Replay UI for review

