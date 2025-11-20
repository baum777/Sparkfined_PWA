# Sparkfined PWA – Working Plan (Claude + Codex)

This document coordinates architecture, refactors, and production hardening of the Sparkfined PWA.

## Section Overview

| # | Section                                  | Scope                                                | Primary Agent | Handoff        |
|---|------------------------------------------|------------------------------------------------------|--------------|----------------|
| 1 | Status Sync & Architecture Freeze        | Confirm current repo state & decisions               | Claude       | Summary for 2+ |
| 2 | Layout & Navigation Review               | UX review of new DashboardShell layout               | Claude       | Issues for 3   |
| 3 | Chart & Settings V2 Completion           | Finish ChartPageV2 & SettingsPageV2, ensure parity   | Codex        | Review for 4   |
| 4 | Routing & Navigation Migration (UX-04 & UX-05) | Redirect legacy routes, update Sidebar/BottomNav to V2 | Codex        | UX check       |
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

### Summary

V2-Layout analysis reveals a generally solid DashboardShell foundation with several critical inconsistencies to address:

**Key Findings:**
- ✅ DashboardShell provides consistent page-header structure (title, description, actions, optional tabs/KPI-strip)
- ✅ Dashboard and Journal pages use DashboardShell cleanly
- ❌ Watchlist, Alerts, and Analysis pages have **double headers** (DashboardShell + Feature-Layout wrappers)
- ❌ Extensive hardcoded colors in DashboardShell and Feature-Layouts (blocks Design Token adoption)
- ❌ Sidebar and BottomNav still link to V1 routes (/chart, /settings)
- ⚠️ Minor typography inconsistencies (eyebrow tracking, text-size) between DashboardShell and Feature-Layouts

**Decision:** DashboardShell pattern is acceptable and should remain the canonical page-wrapper for all V2 pages. Feature-Layout wrappers (WatchlistLayout, AlertsLayout, AnalysisLayout, JournalLayout) should be refactored to remove duplicate headers and contain ONLY content-area styling.

Checklist:

- [x] Desktop:
  - [x] Each V2 page shows exactly one header (no doubles).
  - [x] Titles, subtitles, and action areas are consistent in spacing and typography.
  - [x] Sidebar active state matches current route.
- [x] Mobile:
  - [x] Bottom navigation is visible and correctly linked.
  - [x] No clipped headers or important content.
- [x] Collect a short list of "must-fix" UX issues (for Codex) and "nice-to-have later" items.
- [x] Decide whether the DashboardShell pattern is acceptable as-is or needs minor structural tweaks.

---

### Must Fix Issues (for Codex)

**UX-01: Double Header in Watchlist & Alerts Pages**
- **Scope:** `src/pages/WatchlistPageV2.tsx`, `src/pages/AlertsPageV2.tsx`, `src/components/watchlist/WatchlistLayout.tsx`, `src/components/alerts/AlertsLayout.tsx`
- **Problem:** These pages use both DashboardShell (with title/description/actions) AND their own Feature-Layout wrappers (WatchlistLayout, AlertsLayout) which contain redundant headers ("Sparkfined" eyebrow, title, subtitle). This creates double headers.
- **Solution:** Refactor WatchlistLayout and AlertsLayout to remove the `<header>` block entirely. Keep only the inner content container (`rounded-2xl border border-white/5 bg-black/40`). The DashboardShell should be the single source of truth for page headers.
- **Priority:** P0 (critical for visual consistency)
- **Files to change:**
  - `src/components/watchlist/WatchlistLayout.tsx` (remove header, keep content box)
  - `src/components/alerts/AlertsLayout.tsx` (remove header, keep content box)
  - `src/pages/WatchlistPageV2.tsx` (remove `title` and `subtitle` props passed to WatchlistLayout)
  - `src/pages/AlertsPageV2.tsx` (remove `title` and `subtitle` props passed to AlertsLayout)

**UX-02: Design Tokens in DashboardShell**
- **Scope:** `src/components/dashboard/DashboardShell.tsx`
- **Problem:** Uses hardcoded colors:
  - Background: `bg-gradient-to-b from-[#050505] via-[#0b0b13] to-[#050505]`
  - Text: `text-zinc-100`, `text-zinc-500`, `text-zinc-400`
  - Border: `border-white/5`
  - Tabs: `border-blue-500/70 bg-blue-500/10 text-white`
- **Solution:** Replace with semantic design tokens from `tailwind.config` (e.g., `bg-surface`, `text-text-primary`, `border-border`, `bg-brand`, etc.) as used in AnalysisLayout.
- **Priority:** P0 (required for Design Token sweep in Section 5)

**UX-03: Design Tokens in Feature-Layouts**
- **Scope:** `src/components/watchlist/WatchlistLayout.tsx`, `src/components/alerts/AlertsLayout.tsx`, `src/components/journal/JournalLayout.tsx`
- **Problem:** All use hardcoded colors (`border-white/5`, `bg-black/20`, `bg-black/30`, `bg-black/40`, `text-zinc-500`, `text-white`, `text-zinc-400`)
- **Solution:** Replace with semantic design tokens. AnalysisLayout is a good reference (it already uses `border-border`, `bg-surface/70`, `text-text-primary`, `text-text-secondary`, `text-text-tertiary`).
- **Priority:** P0 (required for Design Token sweep in Section 5)
- **Note:** This issue can be addressed in parallel with UX-01 as part of the same refactor.

**UX-04: Sidebar Links to V1 Routes**
- **Scope:** `src/components/layout/Sidebar.tsx`
- **Problem:** Sidebar primaryNavItems include:
  - `/chart` → V1 ChartPage (uses old Layout wrapper)
  - `/settings` → V1 SettingsPage (uses old Layout wrapper)
- **Solution:** Update links to `/chart-v2` and `/settings-v2` after ChartPageV2 and SettingsPageV2 are implemented (Section 3).
- **Priority:** P1 (blocked by Section 3 completion)

**UX-05: BottomNav Links to V1 Route**
- **Scope:** `src/components/BottomNav.tsx`
- **Problem:** BottomNav includes `/settings` → V1 SettingsPage
- **Solution:** Update link to `/settings-v2` after SettingsPageV2 is implemented (Section 3).
- **Priority:** P1 (blocked by Section 3 completion)

**UX-06: Inconsistent Eyebrow Typography**
- **Scope:** DashboardShell vs. Feature-Layouts (WatchlistLayout, AlertsLayout, AnalysisLayout)
- **Problem:**
  - DashboardShell: `text-sm uppercase tracking-[0.3em] text-zinc-500`
  - Feature-Layouts: `text-xs uppercase tracking-[0.4em] text-zinc-500`
- **Solution:** Standardize on a single eyebrow style. Recommended: `text-xs uppercase tracking-[0.3em] text-text-tertiary` (smaller size, tighter tracking, semantic token).
- **Priority:** P2 (visual polish, not critical for launch)

---

### Nice to Have

**UX-NH-01: Mobile Header Padding Optimization**
- **Scope:** `src/components/dashboard/DashboardShell.tsx`
- **Problem:** `py-8` on header may take up too much vertical space on small mobile viewports (e.g., iPhone SE), pushing content below the fold.
- **Solution:** Test and potentially adjust to `py-6 sm:py-8` to show more content above the fold on mobile.
- **Priority:** P3 (mobile optimization)

**UX-NH-02: KPI Strip for All V2 Pages**
- **Scope:** Journal, Watchlist, Alerts, Analysis pages
- **Problem:** Only Dashboard has a KPI strip; other pages have empty space where it could be.
- **Solution:** Consider adding KPI strips:
  - Journal: Streak, Win Rate, Total Entries, Avg. Entry Length
  - Watchlist: Top Mover, Biggest Loser, Avg. 24h Change, Total Watched
  - Alerts: Armed Count, Triggered Today, Snoozed Count, Total Alerts
  - Analysis: Confidence, Bias, Timeframe, Last Updated
- **Priority:** P3 (feature enhancement, not required for launch)

**UX-NH-03: Consistent HeaderActions Styling**
- **Scope:** All `*HeaderActions.tsx` components (Dashboard, Journal, Watchlist, Alerts, Analysis)
- **Problem:** Not verified whether all HeaderActions use consistent button sizes, spacing, hover states, and loading states.
- **Solution:** Audit all HeaderActions components and ensure they follow a unified pattern (e.g., same button padding, same gap between buttons, same loading spinner size).
- **Priority:** P3 (polish)

**UX-NH-04: Tab System Consistency**
- **Scope:** DashboardShell tabs vs. AnalysisPageV2 custom tabs (AnalysisSidebarTabs)
- **Problem:** DashboardShell includes a tab system, but AnalysisPageV2 uses a completely separate tab implementation (AnalysisSidebarTabs with sidebar/horizontal orientation). This could lead to confusion about which tab system to use for future pages.
- **Solution:** Document when to use DashboardShell tabs (simple horizontal tabs) vs. custom tab systems (complex sidebar/multi-orientation tabs). Consider consolidating if possible, or clarify in component docs.
- **Priority:** P3 (architecture clarity, not urgent)

---

### Handoff to Codex

**For Section 3 (Chart & Settings V2 Completion):**
- After ChartPageV2 and SettingsPageV2 are implemented, update Sidebar and BottomNav to link to V2 routes (addresses UX-04, UX-05).

**For Section 5 (Design Tokens Full Sweep):**
- Implement UX-02 (DashboardShell tokens) and UX-03 (Feature-Layout tokens) as part of the global design token migration.
- Optionally address UX-06 (eyebrow typography) in the same pass.

**For Immediate Layout Fixes (can be done before Section 3):**
- Implement UX-01 (remove double headers) immediately to achieve visual consistency across all V2 pages.

**For Post-Launch Polish:**
- UX-NH-01 through UX-NH-04 can be addressed in backlog after launch.

---

## 3. Chart & Settings V2 Completion

Goal: Ensure ChartPageV2 and SettingsPageV2 are fully implemented, routed, and on par with any V1 behaviour.

Primary agent: Codex

Summary:
- ChartPageV2 now wraps the full legacy chart experience inside DashboardShell with unified header/actions and the original replay/drawing/export tooling.
- SettingsPageV2 reuses the complete V1 settings functionality inside DashboardShell while suppressing duplicate headings and exposing header actions.
- Remaining V2 pages (Watchlist, Alerts) no longer render duplicate headers thanks to lean layouts.

Checklist:

- [x] Verify ChartPageV2 exists and is routed (e.g. /chart-v2).
- [x] Verify SettingsPageV2 exists and is routed (e.g. /settings-v2).
- [x] For ChartPageV2:
  - [x] Timeframe controls wired.
  - [x] Indicator toggles wired.
  - [x] Replay / tool features from V1 migrated.
- [x] For SettingsPageV2:
  - [x] Account / wallet section.
  - [x] Preferences (theme, currency, etc.) section.
  - [x] Data / AI providers section.
- [x] Both pages wrapped in DashboardShell with consistent header and actions.
- [x] Both pages use design tokens, not hardcoded colors.
- [x] pnpm typecheck + pnpm run build succeed.

Open Points:

- None identified for this section. Future navigation/link updates remain scheduled for UX-04/UX-05.

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

## 4 – Routing & Navigation Migration (UX-04 & UX-05)

Goal: Ensure all navigation elements route exclusively to V2 pages and legacy V1 paths are safely redirected, so users consistently land in the new layout.

Summary: Section 4 migrates all primary navigation elements to the V2 routes and installs redirects for legacy paths like /board and /journal. Users with old bookmarks are now transparently taken to the new layout, and both sidebar and bottom navigation highlight the correct active pages. No direct links to V1 pages remain in the app shell.

Checklist:

- [x] Redirects: /board, /journal, /analyze, /chart, /settings → jeweilige V2-Routen.
- [x] Sidebar links updated to V2 routes (UX-04).
- [x] Bottom navigation updated to V2 routes (UX-05).
- [x] Manual navigation smoke test on desktop and mobile.
- [x] Any discovered edge-case routes documented as open points.

Open Points:

- None.

---

## 5. Design Tokens Full Sweep

Goal: Enforce token-based styling throughout the UI, not just the core V2 pages.

**📖 Detailed Specification:** See `docs/design/Sparkfined_V2_Design_Tokens.md` for complete token schema, mapping tables, and implementation guide.

**📝 Summary:** See `docs/design/Section_5A_Summary.md` for executive summary of Section 5A work.

### 5A – Design Token & Visual Spec (Claude) — ✅ COMPLETE

**Status:** Specification complete, ready for Codex implementation

**Deliverables:**
- ✅ Token inventory & mapping table (24+ opacity-based colors identified)
- ✅ Enhanced token schema for `tailwind.config.ts`
- ✅ 8 standard layout patterns with code snippets
- ✅ 30+ acceptance criteria checkpoints
- ✅ Implementation priority guide (Phase 1-3)

**Key Findings:**
- ✅ No hardcoded hex colors in V2 pages
- ⚠️ Opacity-based colors (`white/5`, `black/30`) need semantic replacements
- ⚠️ 1 hardcoded gradient in `DashboardShell.tsx`
- ✅ Good foundation exists in `tailwind.config.ts`

**Open Questions:**
- **DT-01:** Backdrop blur token? → Keep as utility for now
- **DT-02:** Skeleton color? → Use `bg-surface-skeleton`
- **DT-03:** Active border token? → Keep sentiment borders

### 5B – Token Implementation (Codex) — 🔄 PENDING

**Primary agent:** Codex

Checklist:

- [ ] Update `tailwind.config.ts` with new color tokens (bg-surface-*, border-border-*, interactive-*, sentiment-*, status-*)
- [ ] Add background gradients (`bg-app-gradient`, `bg-surface-gradient`)
- [ ] Replace hardcoded gradient in `DashboardShell.tsx`
- [ ] Replace opacity-based colors in all V2 pages using mapping table:
  - [ ] `DashboardPageV2.tsx`
  - [ ] `JournalPageV2.tsx`
  - [ ] `WatchlistPageV2.tsx`
  - [ ] `AlertsPageV2.tsx`
  - [ ] `AnalysisPageV2.tsx`
  - [ ] `ChartPageV2.tsx`
  - [ ] `SettingsPageV2.tsx`
- [ ] Replace opacity-based colors in core components:
  - [ ] `DashboardShell.tsx`
  - [ ] `DashboardKpiStrip.tsx`
  - [ ] `JournalList.tsx`
  - [ ] `WatchlistTable.tsx`
  - [ ] `AlertsList.tsx`
- [ ] Normalize spacing patterns across all V2 pages
- [ ] Run visual regression checks (before/after screenshots)
- [ ] Confirm no visual regressions on key pages

Handoff to Claude:

- [ ] Approve or propose minor color tweaks based on readability / contrast.
- [ ] Review visual regression screenshots

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
