# Sparkfined PWA – Working Plan (Claude + Codex)

This document coordinates architecture, refactors, and production hardening of the Sparkfined PWA.

## Section Overview

| # | Section                                  | Scope                                                | Primary Agent | Handoff        |
|---|------------------------------------------|------------------------------------------------------|--------------|----------------|
| 1 | Status Sync & Architecture Freeze        | Confirm current repo state & decisions               | Claude       | Summary for 2+ |
| 2 | Layout & Navigation Review               | UX review of new DashboardShell layout               | Claude       | Issues for 3   |
| 3 | Chart & Settings V2 Completion           | Finish ChartPageV2 & SettingsPageV2, ensure parity   | Codex        | Review for 4   |
| 4 | TS Strictness & API Types                | Reduce any, define adapter types                     | Codex        | Review for 5   |
| 5 | Design Tokens Full Sweep                 | Remove remaining hardcoded colors                    | Codex        | Visual check   |
| 6 | Dead Code & V1 Archive                   | Archive/remove V1 pages & dev-only files             | Codex        | Sanity check   |
| 7 | E2E Test Strategy                        | Define scenarios + priorities                        | Claude       | Inputs for 8   |
| 8 | E2E Implementation & CI Gates            | Implement Playwright tests & CI quality gates        | Codex        | Review for 9   |
| 9 | Docs & Governance                        | Update CLAUDE.md, README, MIGRATION_V2.md            | Claude       | Final review   |
|10 | Final Pre-Prod Check & Monitoring        | Lighthouse, smoke tests, monitoring plan             | Claude+Codex | Deploy         |

---

## 1. Status Sync & Architecture Freeze

Goal: Align on what Codex has already applied (AppHeader removal, V2 layout, routing) and lock decisions.

Primary agent: Claude

Checklist:

- [ ] Confirm latest branch / PR from Codex is checked out.
- [ ] Run basic smoke test in browser on:
  - [ ] /dashboard-v2
  - [ ] /journal-v2
  - [ ] /watchlist-v2
  - [ ] /alerts-v2
  - [ ] /analysis-v2
- [x] Confirm global AppHeader is removed from App.tsx.
- [x] Confirm Journal/Watchlist/Alerts/Analysis V2 use DashboardShell.
- [x] Confirm V1 routes redirect or link to V2 routes.
- [ ] List remaining functional / visual gaps that are out of scope for Section 1.
- [ ] Produce a short “Gaps & Priorities” bullet list for Sections 2–6.

---

## 2 – Journal Stabilization & Telemetry Dev Mode

Goal: Stabilize Journal V2 render behaviour and silence telemetry noise during local development while keeping production telemetry intact.

Summary: JournalPageV2 now guards URL/selection sync to prevent render loops, and telemetry buffering skips network sends in dev to avoid 500s. Verified that entries still load/create correctly and telemetry stays active for preview/prod paths.

Checklist:

- [x] JournalPageV2 no longer throws "Maximum update depth exceeded"
- [x] Journal entries load and can be created
- [x] Telemetry no longer produces 500 errors in dev
- [x] Telemetry remains active in preview/prod
- [ ] Any follow-up tasks (if discovered)

Open Points:

- None noted during this pass.

---

## 2. Layout & Navigation Review (UX)

Goal: Make sure the new DashboardShell layout feels coherent on desktop and mobile.

Primary agent: Claude

Checklist:

- [ ] Desktop:
  - [ ] Each V2 page shows exactly one header (no doubles).
  - [ ] Titles, subtitles, and action areas are consistent in spacing and typography.
  - [ ] Sidebar active state matches current route.
- [ ] Mobile:
  - [ ] Bottom navigation is visible and correctly linked.
  - [ ] No clipped headers or important content.
- [ ] Collect a short list of “must-fix” UX issues (for Codex) and “nice-to-have later” items.
- [ ] Decide whether the DashboardShell pattern is acceptable as-is or needs minor structural tweaks.

---

## 3. Chart & Settings V2 Completion

Goal: Ensure ChartPageV2 and SettingsPageV2 are fully implemented, routed, and on par with any V1 behaviour.

Primary agent: Codex

Checklist:

- [ ] Verify ChartPageV2 exists and is routed (e.g. /chart-v2).
- [ ] Verify SettingsPageV2 exists and is routed (e.g. /settings-v2).
- [ ] For ChartPageV2:
  - [ ] Timeframe controls wired.
  - [ ] Indicator toggles wired.
  - [ ] Any replay / tool features from V1 migrated (if still desired).
- [ ] For SettingsPageV2:
  - [ ] Account / wallet section.
  - [ ] Preferences (theme, currency, etc.) section.
  - [ ] Data / AI providers section.
- [ ] Both pages wrapped in DashboardShell with consistent header and actions.
- [ ] Both pages use design tokens, not hardcoded colors.
- [ ] pnpm typecheck + pnpm run build succeed.

Handoff to Claude:

- [ ] Perform a quick UX/feature parity review and list any missing behaviours.

---

## 4. TypeScript Strictness & API Types

Goal: Reduce explicit any usage and properly type external API adapters.

Primary agent: Codex

Checklist:

- [ ] Record current any count via grep.
- [ ] Fix Category A (easy) any uses in hooks and components (replace by unknown + type guards).
- [ ] Introduce src/types/moralis.ts with typed responses.
- [ ] Introduce src/types/dexpaprika.ts with typed responses.
- [ ] Update Moralis/Dexpaprika/price adapters to use these types.
- [ ] Ensure pnpm typecheck passes.
- [ ] Ensure any count is < 5.

Handoff to Claude:

- [ ] Sanity check API types and suggest improvements if needed.

---

## 5. Design Tokens Full Sweep

Goal: Enforce token-based styling throughout the UI, not just the core V2 pages.

Primary agent: Codex

Checklist:

- [ ] Run grep for raw color classes (bg-[#, text-zinc-*, border-white/*, etc.).
- [ ] Replace remaining hardcoded colors in src/pages with semantic tokens.
- [ ] Replace remaining hardcoded colors in core components (dashboard, journal, ui primitives).
- [ ] Confirm tailwind.config contains all semantic tokens used.
- [ ] Visual spot-check on key pages to confirm no regressions.

Handoff to Claude:

- [ ] Approve or propose minor color tweaks based on readability / contrast.

---

## 6. Dead Code & V1 Archive

Goal: Remove or archive all obsolete V1 pages and dev-only files.

Primary agent: Codex

Checklist:

- [ ] Create docs/archive/v1-migration-backup/ if missing.
- [ ] Move V1 pages and layouts into archive (JournalPage, ChartPage, AnalyzePage, Layout, Header, etc.).
- [ ] Move or remove sections/* that only support V1.
- [ ] Delete clearly dev-only pages (HomePage, FontTestPage, wireframes/) if no longer needed.
- [ ] Clean up imports and routes referencing removed files.
- [ ] Ensure pnpm run build still succeeds.

Handoff to Claude:

- [ ] Confirm no needed V1 behaviour was lost and archive README is clear.

---

## 7. E2E Test Strategy

Goal: Define which flows will be covered by E2E testing before any code is written.

Primary agent: Claude

Checklist:

- [ ] Identify core smoke flows (dashboard loading, navigation across V2 pages).
- [ ] Identify critical user flows:
  - [ ] Create/read journal entry.
  - [ ] Create/see an alert.
  - [ ] Add/remove token from watchlist.
- [ ] Identify PWA/offline/responsive behaviours to test.
- [ ] Prioritise scenarios (P0 / P1 / P2) and define 10–20 test cases with short IDs (TC-01, …).
- [ ] Provide a concise testing matrix to Codex.

---

## 8. E2E Implementation & CI Gates

Goal: Implement Playwright tests and wire them into CI.

Primary agent: Codex

Checklist:

- [ ] Implement 10–20 Playwright tests based on Section 7.
- [ ] Ensure tests run locally via pnpm test:e2e (or equivalent).
- [ ] Add CI step to run E2E tests on each PR / main push.
- [ ] Make E2E tests fast and deterministic (no flakiness).
- [ ] Add basic reporting (which scenarios passed/failed).

Handoff to Claude:

- [ ] Review whether coverage is sufficient for a first production launch.

---

## 9. Docs & Governance

Goal: Align documentation and governance with actual code state.

Primary agent: Claude

Checklist:

- [ ] Update CLAUDE.md with V2 layout & token conventions.
- [ ] Add MIGRATION_V2.md explaining the V1→V2 migration.
- [ ] Update README with up-to-date architecture overview.
- [ ] Document TypeScript, testing, and PWA expectations for contributors.
- [ ] Propose CI quality gates (lint, typecheck, E2E, bundle-size, any-count).

---

## 10. Final Pre-Prod Check & Monitoring

Goal: Verify the app is production-ready and define monitoring & rollback strategies.

Primary agent: Claude + Codex

Checklist:

- [ ] Run Lighthouse (Performance, PWA, Accessibility).
- [ ] Run full test suite (unit, integration, E2E).
- [ ] Perform manual smoke test on desktop & mobile browsers.
- [ ] Define monitoring plan (error tracking, performance, usage metrics).
- [ ] Define rollback strategy (what to do if production issues arise).
- [ ] Get explicit “ready to launch” sign-off.
