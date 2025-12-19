# UI & UX Polish — Working Paper (Sparkfined)
**Status:** Planning  
**Last Updated:** 2025-12-17  
**Owner:** Codex  

> This document is the canonical “execution spec” for UI/UX polish + PWA refactor work.
> It is written to be *Codex-executable*: minimal ambiguity, strict file targets, binary acceptance criteria.

---

## Work Package Clusters (Epic planning) — how to execute without scope explosions

We plan WPs in **clusters** (epics) for coherence, but we **deliver as small, reviewable PRs**.

### Cluster map (epics)
- **Cluster A — Foundation/Shell:** WP-001 → WP-002 → WP-003 → WP-004
- **Cluster B — Dashboard:** WP-010..WP-016
- **Cluster C — Journal:** WP-030..WP-035
- **Cluster D — Chart:** WP-050..WP-056
- **Cluster E — Alerts:** WP-070..WP-076
- **Cluster F — Settings:** WP-090..WP-097

### Execution rule
- **Default:** 1 WP = 1 PR (strict), even within a cluster.
- PRs inside the same cluster should be **stacked/linear** when possible (clean history, easy bisect).

### Atomic Pair exception (rare)
Two WPs may be combined into one PR **only if**:
- the WPs are explicitly marked as **Atomic Pair** in this document, **and**
- the combined PR remains reviewable (no broad cross-feature changes).

### Review & hygiene
- If a PR exceeds expected scope (e.g., large unrelated diffs), **split it** before requesting review.
- Any cross-cutting cleanup belongs in a separate PR, not bundled into a WP delivery.

---

## Codex Execution Contract (Applies to every WP)

### Workflow Optimizations (Recommended)
- **PR-Guardrail Script:** Add a `pnpm wp:guard` (or pre-push hook) that checks: only allowed WP file targets changed, `./WP-Polish/<WP-ID>/checklist.md` exists, and PR title includes `WP-XXX`.
- **Done Marker in Working Paper:** Each WP gets `Implemented in PR:` + date/link so “current state check” is deterministic.
- **Review Snapshots:** Store 1–2 screenshots/GIFs (mobile/desktop) or exact viewport steps under `./WP-Polish/<WP-ID>/` to speed up reviews and make UX changes verifiable.
- **Definition of Done (DoD) mini-block:** Every WP PR must include a short DoD checklist (A11y basics, relevant loading/empty/error states, mobile+desktop smoke check) to keep reviews consistent.
- **Ownership map for integration hotspots:** Minimize merge conflicts by treating these as “touch only if required by the WP”: `src/components/layout/AppShell.tsx` (or `src/layouts/MainLayout.tsx`), `src/config/navigation.ts`, global CSS entry points.
- **Centralize mock data fixtures:** Use a single location for mock API data and fixtures (e.g. `src/api/__mocks__/` or `src/test/fixtures/`) so each WP doesn’t reinvent mock payloads and tests stay stable.

#### Definition of Done (Template)
- [ ] WP acceptance criteria fully satisfied and mapped in PR description
- [ ] No scope creep (one WP only; non-WP issues moved to backlog)
- [ ] A11y smoke check (keyboard tabbing, focus-visible, aria-labels where applicable)
- [ ] UI states handled where relevant (loading / empty / error)
- [ ] Viewport smoke check: mobile (<768px) + desktop (≥768px)
- [ ] Verification ran: `pnpm typecheck`, `pnpm lint` (no new warnings), `pnpm test`/`pnpm vitest run` (e2e noted if blocked)

#### Ownership Map (Integration Hotspots)
Treat these files as high-conflict areas; only modify them when the WP explicitly requires integration:
- `src/components/layout/AppShell.tsx` (or `src/layouts/MainLayout.tsx`)
- `src/config/navigation.ts`
- `src/App.tsx` (global providers/imports)
- `src/styles/theme.css` + `src/styles/ui.css` (tokens/utilities)

#### Mock/Fixture Convention
- Prefer: `src/api/__mocks__/` (API-shaped mocks) and/or `src/test/fixtures/` (test fixtures)
- If a WP introduces a new API DTO, add a matching mock payload in the central mocks folder.

### Scope & PR hygiene
- **One WP per PR** (exceptions only if explicitly marked *“Atomic Pair”* in the WP).
- **No drive-by refactors.** If unrelated issues are discovered, add a note to the *Backlog* section at the bottom.
- **Prefer extension over replacement.** Reuse existing components/patterns unless the WP explicitly says “replace”.

### Dependency gate
- **Do not implement a WP if any `Depends On` is incomplete.**
- If blocked, output a short “Blocked by …” report and stop.

### Design tokens (hard rule)
- **From WP-002 onward:** UI components must not use hard-coded colors.
- All colors must come from **CSS variables** defined in `src/styles/theme.css`.
- Spacing and radii should use the shared utilities in `src/styles/ui.css` (introduced in WP-002).

### Single source of truth
- Navigation must be defined once in `src/config/navigation.ts` and reused by:
  - `BottomNavBar` (mobile)
  - `Sidebar` (desktop)
  - any header quick-links (if applicable)

### Typed APIs + mock fallback
- Any WP that references `src/api/*` must:
  - define a **typed interface** (DTOs)
  - provide a **mock fallback** so the UI renders without backend availability
  - keep UI resilient (loading / empty / error states)

### Accessibility & interaction
- Keyboard navigable (Tab order sane).
- Focus styles visible (`:focus-visible`).
- Touch targets **≥ 44×44px** on mobile.
- Modal/sheet: focus trap + ESC close + scroll lock (reuse existing overlay primitives if present).

### Verification (minimum)
- Run: `pnpm typecheck`
- Run: `pnpm lint` (don’t introduce new warnings)
- Run: `pnpm test` / `pnpm vitest run` where applicable
- If e2e is configured but browsers are missing: document it; don’t block PR

---

## Execution Rules — Must-have vs. Nice-to-have (for Sparkfined WPs)

This section defines which rules are **non-negotiable** in our repo, and which are **recommended** to improve flow quality without adding bureaucracy.

### Must-have (Non-negotiable)
- **1 WP = 1 PR/Branch (strict):** keep scope reviewable and bisectable.
- **Cluster is planning, not delivery:** execute WPs sequentially inside a cluster, but never bundle multiple WPs into one PR (unless explicitly marked *Atomic Pair*).
- **Dependency gate = hard stop:** do not start a WP if any `Depends On` is incomplete.
- **Current-state check first:** before editing, scan the repo for existing implementations and integration points to avoid duplicate mounts/drift.
- **Per-WP checklist doc:** create `./WP-Polish/<WP-ID>/checklist.md` with snapshot, steps, AC, and verification; keep it updated.
- **Step log discipline:** after each implementation step, check it off and write a short change note + files touched.
- **Stop-gates (quality):**
  - If `pnpm typecheck` fails → STOP.
  - If `pnpm test`/`pnpm vitest run` fails → STOP.
  - `pnpm lint` must not introduce **new** warnings/errors (pre-existing warnings may remain).
- **Tokens-only from WP-002 onward:** no hard-coded colors in changed/new code; use `src/styles/theme.css` variables.
- **Single Source of Truth (Navigation):** routes/labels/icons must come from `src/config/navigation.ts` if navigation is involved.
- **API resilience rule:** any WP touching `src/api/*` must provide:
  - typed DTOs
  - deterministic mock fallback
  - UI states: loading / empty / error

### Nice-to-have (Recommended)
- **Step-commit rule:** one commit after each WP step (maximizes rollback/bisect). Use:
  - `WP-<ID> step <N>: <desc>`
  - `WP-<ID> docs: update changelog/index`
  - `WP-<ID>: finalize checklist`
- **Ownership map for integration hotspots:** treat shell/global entry points as high-conflict; only modify when WP requires:
  - `src/components/layout/AppShell.tsx` (or `src/layouts/MainLayout.tsx`)
  - `src/config/navigation.ts`
  - `src/App.tsx`
  - `src/styles/theme.css`, `src/styles/ui.css`
- **Backlog instead of drive-bys:** log unrelated findings in `./WP-Polish/backlog.md` with file paths + short note.
- **Review snapshots:** store 1–2 screenshots/GIFs or exact viewport steps under `./WP-Polish/<WP-ID>/` when UI changes are significant.
- **Cluster summary:** maintain `./WP-Polish/Cluster-<X>/summary.md` listing WPs, checklist links, verification outcomes, and open risks.

### Autonomy Mode (Optional, when running clusters without human review)
When executing a full cluster without intermediate review/merge:
- still keep **1 WP = 1 branch/PR**
- enforce the **Stop-gates**
- maintain a **stacked series** of WP branches
- add/refresh `./WP-Polish/Cluster-<X>/summary.md` as the “single glance” status report


---

## Canonical Routes & Navigation

### Routes
- `/dashboard`
- `/journal`
- `/chart`
- `/watchlist`
- `/alerts`
- `/settings`

### Navigation ordering (Desktop)
- Items (top → down): Dashboard → Journal → Chart → Watchlist → Alerts  
- **Settings icon is separate at the very bottom** of the rail (not part of the list).

### Navigation ordering (Mobile)
- Bottom tabs: Dashboard · Journal · Chart · Watchlist · Alerts  
- Settings is accessible via:
  - Header gear icon on mobile, **and**
  - `/settings` route (deep link)

---

## Design System Tokens (WP-002 defines these; listed here for reference)

### Color tokens
Components use variables only:
- `--sf-bg-0` (app background)
- `--sf-bg-1` (raised surface)
- `--sf-bg-2` (card surface)
- `--sf-border-1` (hairline border)
- `--sf-text-1` (primary text)
- `--sf-text-2` (secondary text)
- `--sf-text-3` (muted text)
- `--sf-primary` (brand / primary)
- `--sf-danger` (error / destructive)
- `--sf-warning`
- `--sf-success`
- `--sf-shadow` (rgba shadow token)

### Radius tokens
- `--sf-radius-sm` (8px)
- `--sf-radius-md` (12px)
- `--sf-radius-lg` (16px)

### Spacing utilities
Use `ui.css` utility classes (WP-002):
- `.sf-gap-2` (8px) `.sf-gap-3` (12px) `.sf-gap-4` (16px) `.sf-gap-6` (24px) `.sf-gap-8` (32px)
- `.sf-pad-4` (16px) `.sf-pad-6` (24px)
- `.sf-card` (standard surface + border + radius + shadow)

---

## File/module conventions (recommended)
- **Global UI shell:** `src/features/shell/*`
- **Theme system:** `src/features/theme/*`, `src/styles/theme.css`, `src/styles/ui.css`
- **Dashboard:** `src/features/dashboard/*`
- **Journal:** `src/features/journal/*`
- **Chart:** `src/features/chart/*`
- **Alerts:** `src/features/alerts/*`
- **Settings:** `src/features/settings/*`
- **Shared components:** `src/shared/components/*`
- **API clients:** `src/api/*`
- **Navigation config:** `src/config/navigation.ts`

> Note: If your repo already has a different structure, keep existing conventions,
> but still apply the “single source of truth” rules.

---

# GLOBAL LAYER — Core Infrastructure

## WP-001 — Bottom Navigation Bar (Mobile PWA)
**Status:** Planned  
**Depends On:** —  
**Priority:** P0
**Implemented in PR:** —  

### Goal
Mobile users get a fixed, safe-area aware bottom tab bar with 5 primary destinations.

### In Scope
- Bottom navigation with icons + labels
- Active state
- Safe-area padding
- Mobile-only rendering

### Out of Scope
- Settings tab (mobile settings is via header + route)

### File targets
```txt
CREATE  src/features/shell/BottomNavBar.tsx
CREATE  src/features/shell/bottom-nav.css
MODIFY  src/layouts/MainLayout.tsx
CREATE  src/config/navigation.ts
```

### Implementation steps
1. Create `src/config/navigation.ts` exporting a `NAV_ITEMS` array (route, label, icon).
2. Implement `BottomNavBar.tsx`:
   - `position: fixed; bottom: 0; left:0; right:0; z-index: 40`
   - height 64–72px with `padding-bottom: max(12px, env(safe-area-inset-bottom))`
   - 5 equal-width items, touch target ≥44×44
3. Wire into `MainLayout.tsx` for **mobile only** (`<768px`).
4. Active tab:
   - use `useLocation()` to compare route prefixes.
5. Ensure keyboard focus and aria-labels.

### Acceptance criteria
- [ ] Visible on <768px, hidden on ≥768px
- [ ] 5 tabs: Dashboard / Journal / Chart / Watchlist / Alerts
- [ ] Active tab visually distinct
- [ ] Safe-area padding works (no overlap with iOS home bar)
- [ ] Navigates correctly via React Router

### Verification
- [ ] `pnpm typecheck`
- [ ] Visual check on narrow viewport

### Codex notes
WP-001 may use simple CSS with hard-coded colors **only if WP-002 is not merged yet**. Once WP-002 is merged, migrate BottomNav to tokens.

---

## WP-002 — Theme System (Dark/Light + Tokens)
**Status:** Planned  
**Depends On:** —  
**Priority:** P0
**Implemented in PR:** —  

### Goal
Introduce a single theme system with CSS variables, dark default, light optional, persisted selection, and shared UI utilities.

### In Scope
- Theme provider + hook
- `data-theme` + `color-scheme`
- `theme.css` + `ui.css`
- Persistence: localStorage
- “System” mode (optional but recommended)

### File targets
```txt
CREATE  src/features/theme/ThemeContext.tsx
CREATE  src/features/theme/useTheme.ts
CREATE  src/styles/theme.css
CREATE  src/styles/ui.css
MODIFY  src/App.tsx
MODIFY  src/store/userSettings.ts   (or equivalent settings store)
```

### Implementation steps
1. Define theme modes: `dark | light | system`.
2. Implement `ThemeProvider`:
   - reads saved preference from settings store/localStorage
   - applies `document.documentElement.dataset.theme = resolvedTheme`
   - applies `document.documentElement.style.colorScheme = resolvedTheme`
3. Create `theme.css`:
   - `:root[data-theme="dark"] { ...tokens... }`
   - `:root[data-theme="light"] { ...tokens... }`
4. Create `ui.css` utilities:
   - `.sf-card`, `.sf-btn`, spacing helpers, focus ring helper
5. Update app entry to import `theme.css` and `ui.css`.

### Token definitions (recommended defaults)
Dark (example values; components must never inline these):
- `--sf-bg-0: #0F0F0F`
- `--sf-bg-1: #121212`
- `--sf-bg-2: #1E1E1E`
- `--sf-border-1: #2A2A2A`
- `--sf-text-1: #FFFFFF`
- `--sf-text-2: rgba(255,255,255,0.85)`
- `--sf-text-3: rgba(255,255,255,0.65)`
- `--sf-primary: #22C55E`
- `--sf-danger: #EF4444`
- `--sf-warning: #F59E0B`
- `--sf-success: #22C55E`
- `--sf-shadow: rgba(0,0,0,0.25)`

Light: choose accessible equivalents (no pure-white glare; still high contrast).

### Acceptance criteria
- [ ] Dark is default
- [ ] Theme selection persists across reload
- [ ] Components can style using tokens (no hard-coded colors in WPs ≥ 002)
- [ ] `data-theme` updates on change
- [ ] System mode (if implemented) follows OS changes (optional; document if skipped)

### Verification
- [ ] `pnpm typecheck`
- [ ] Manual: toggle theme and reload

---

## WP-003 — Desktop Navigation Sidebar (Rail)
**Status:** Planned  
**Depends On:** WP-002  
**Priority:** P0
**Implemented in PR:** —  

### Goal
Desktop users get a fixed left rail with nav icons, active highlight, and a separate settings icon pinned to the bottom.

### In Scope
- Left rail (≥768px)
- Icons, active state, tooltips
- Settings icon separate bottom
- Uses `NAV_ITEMS`

### File targets
```txt
CREATE  src/features/shell/Sidebar.tsx
CREATE  src/features/shell/sidebar.css
MODIFY  src/layouts/MainLayout.tsx
MODIFY  src/config/navigation.ts
```

### Implementation steps
1. In `navigation.ts` ensure desktop ordering:
   - Dashboard, Journal, Chart, Watchlist, Alerts
2. Implement `Sidebar.tsx`:
   - fixed left, full height, width 64–80px
   - items in a column
   - settings icon block at bottom (`margin-top: auto`)
3. Active state:
   - left border or glow using `--sf-primary`
4. Tooltip on hover/focus for collapsed rail.
5. Hidden on mobile.

### Acceptance criteria
- [ ] Visible on ≥768px, hidden on <768px
- [ ] Correct ordering + routing
- [ ] Settings icon is separate at bottom
- [ ] Active item visible
- [ ] No hard-coded colors (tokens only)

### Verification
- [ ] `pnpm typecheck`
- [ ] Manual: resize + navigate

---

## WP-004 — Header Bar (TopBar)
**Status:** Planned  
**Depends On:** WP-002  
**Priority:** P0
**Implemented in PR:** —  

### Goal
A sticky top bar that provides context + quick actions:
- Desktop: Alerts + Settings icons on the right, plus theme toggle.
- Mobile: Title + Settings + theme toggle (keep it minimal).

### File targets
```txt
CREATE  src/features/shell/TopBar.tsx
CREATE  src/features/shell/top-bar.css
MODIFY  src/layouts/MainLayout.tsx
```

### Implementation steps
1. Sticky top bar: height 56–64px, z-index 50.
2. Left: page title (or brand).
3. Right:
   - Desktop: Alerts (with badge), Settings, Theme toggle
   - Mobile: Settings, Theme toggle (alerts already in bottom tabs)
4. Badge count is from alerts store (mock fallback if not available).
5. All icons have aria-labels + focus.

### Acceptance criteria
- [ ] Top bar sticky
- [ ] Desktop shows alerts+settings+theme toggle
- [ ] Mobile shows settings+theme toggle
- [ ] Badge renders when count > 0
- [ ] Tokens only

---

# DASHBOARD — Analytics & Overview

## WP-010 — Dashboard Foundation (Typography, Spacing, Card System)
**Status:** Planned  
**Depends On:** WP-001..WP-004  
**Priority:** P1
**Implemented in PR:** —  

### Goal
Introduce dashboard layout primitives: spacing, grid, card base styling, hover states—using theme tokens/utilities.

### File targets
```txt
CREATE  src/features/dashboard/dashboard.css
MODIFY  src/features/dashboard/DashboardPage.tsx   (or existing page)
CREATE  src/features/dashboard/DashboardLayout.tsx (if needed)
```

### Implementation steps
1. Define dashboard layout classes in `dashboard.css`:
   - section gap 24–32px
   - card padding 24px
2. Use `.sf-card` for surfaces + borders.
3. Typography conventions:
   - title 28–32
   - section header 20–24
   - body 14–16
4. Hover: subtle scale (1.01–1.02) + shadow increase.
5. Responsive:
   - desktop grid (2 cols where needed)
   - mobile stacked + horizontal scroll for KPI bar.

### Acceptance criteria
- [ ] Consistent spacing between sections
- [ ] Cards use token-based surfaces
- [ ] No hard-coded colors
- [ ] Mobile layout readable without overflow issues

---

## WP-011 — Hero KPI Bar (Sticky, 4–5 KPIs)
**Status:** Planned  
**Depends On:** WP-010  
**Priority:** P1
**Implemented in PR:** —  

### Goal
Sticky KPI strip under the header showing key stats; scrollable on mobile, sticky on desktop.

### File targets
```txt
CREATE  src/features/dashboard/KPIBar.tsx
CREATE  src/features/dashboard/KPICard.tsx
CREATE  src/features/dashboard/kpi.css
```

### Implementation steps
1. KPI bar is sticky under `TopBar` (use CSS var / constant for offset).
2. KPI cards:
   - icon + label
   - primary value
   - delta indicator (arrow or +/-)
3. Data binding via props; use placeholder values until real stats exist.
4. Mobile: horizontal scroll with snap.
5. Tooltip optional.

### Acceptance criteria
- [ ] 4–5 KPI cards render
- [ ] Sticky behavior works (desktop)
- [ ] Mobile horizontal scroll works
- [ ] Tokens only

---

## WP-012 — Daily Bias / Market Intel Card
**Status:** Planned  
**Depends On:** WP-010  
**Priority:** P1
**Implemented in PR:** —  

### Goal
Full-width card summarizing daily bias + insights with refresh action and stable states.

### File targets
```txt
CREATE  src/features/dashboard/DailyBiasCard.tsx
CREATE  src/features/dashboard/BiasTag.tsx
CREATE  src/api/marketIntelligence.ts
```

### Implementation steps
1. API client exports:
   - `getDailyBias(): Promise<DailyBiasDTO>`
   - mock fallback data
2. UI card:
   - header with refresh button
   - bias tag (Bullish/Bearish/Neutral)
   - bullet insights + timestamp
   - footer actions (view analysis / refresh)
3. Add loading and error states.

### Acceptance criteria
- [ ] Bias tag visible and styled
- [ ] Refresh shows loading state and updates timestamp
- [ ] Works without backend (mock)
- [ ] Tokens only

---

## WP-013 — Holdings / Wallet Snapshot Card
**Status:** Planned  
**Depends On:** WP-010  
**Priority:** P1
**Implemented in PR:** —  

### Goal
Wallet holdings table with connected/not-connected states, hover rows, and responsive layout.

### File targets
```txt
CREATE  src/features/dashboard/HoldingsCard.tsx
CREATE  src/api/wallet.ts
```

### Implementation steps
1. API client exports typed DTO:
   - `getHoldings(walletAddress?: string): Promise<HoldingDTO[]>`
   - mock fallback
2. Connected state shows a small table/list:
   - Symbol / Amount / Value / Change
3. Not connected:
   - CTA “Connect wallet” linking to Settings → Wallet Monitoring
4. Row hover + click to open Watchlist detail (or placeholder handler).

### Acceptance criteria
- [ ] Shows placeholder when no wallet
- [ ] Shows rows when wallet exists
- [ ] Change values color-coded via tokens (danger/success)
- [ ] Tokens only

---

## WP-014 — Recent Trades (Trade Log Card)
**Status:** Planned  
**Depends On:** WP-010  
**Priority:** P1
**Implemented in PR:** —  

### Goal
Show recent trades and provide a “Log entry” action. The action is disabled until a BUY signal exists (per Journal V2 pipeline requirement).

### File targets
```txt
CREATE  src/features/dashboard/TradeLogCard.tsx
CREATE  src/features/dashboard/TradeLogEntry.tsx
MODIFY  src/api/journalEntries.ts              (or create if missing)
MODIFY  src/features/journal/*                 (only for signal availability wiring, minimal)
```

### Implementation steps
1. Recent trades list (10 items) with “Load more”.
2. Entry styling:
   - left accent (success/danger) based on P&L sign
   - click navigates to `/journal/:id`
3. “Log entry” button behavior:
   - default **disabled** (tooltip: “Enabled when a BUY signal is detected”)
   - becomes enabled when there is at least one pending BUY signal in state
   - on click: opens the existing Entry panel/overlay (not a full page nav)
4. Provide mock data for trade list + mock BUY signal flag if pipeline is not available.

### Acceptance criteria
- [ ] Recent trades render with empty + loading states
- [ ] Load more works
- [ ] Log entry button disabled by default
- [ ] Log entry enables when BUY signal is present
- [ ] Tokens only

---

## WP-015 — Recent Journal Entries + Alerts Overview
**Status:** Planned  
**Depends On:** WP-010  
**Priority:** P2
**Implemented in PR:** —  

### Goal
Bottom dashboard section combining recent journal entries and alerts stats.

### File targets
```txt
CREATE  src/features/dashboard/RecentEntriesSection.tsx
CREATE  src/features/dashboard/AlertsOverviewWidget.tsx
MODIFY  src/api/journalEntries.ts
MODIFY  src/api/alerts.ts     (create if missing)
```

### Implementation steps
1. Recent journal entries (3–5):
   - desktop grid
   - mobile horizontal scroll
2. Alerts widget:
   - “Armed / Triggered / Paused”
   - links to `/alerts`
3. Mock fallback for both.

### Acceptance criteria
- [ ] Responsive layout (grid vs scroll)
- [ ] Links work
- [ ] Tokens only

---

## WP-016 — Quick Actions (FAB)
**Status:** Planned  
**Depends On:** WP-010..WP-015  
**Priority:** P2
**Implemented in PR:** —  

### Goal
Mobile floating action button with quick actions (Log entry, Create alert).

### File targets
```txt
CREATE  src/features/dashboard/FAB.tsx
CREATE  src/features/dashboard/FABMenu.tsx
```

### Implementation steps
1. FAB fixed above bottom nav safe area.
2. Toggle menu with outside-click and ESC.
3. Actions:
   - Log entry → open Entry overlay/panel
   - Create alert → open New Alert modal/sheet

### Acceptance criteria
- [ ] FAB visible on mobile
- [ ] Menu opens/closes reliably
- [ ] Actions wired
- [ ] Tokens only

---

# JOURNAL — Trade Tracking & Psychology

## WP-030 — Journal Foundation (Typography, Spacing, Contrast)
**Status:** Planned  
**Depends On:** WP-010  
**Priority:** P1
**Implemented in PR:** —  

### Goal
Journal pages match dashboard typography + spacing while ensuring WCAG AA contrast.

### File targets
```txt
CREATE  src/features/journal/journal.css
MODIFY  src/features/journal/JournalForm.tsx
MODIFY  src/features/journal/JournalCard.tsx
```

### Acceptance criteria
- [ ] Contrast meets WCAG AA (manual spot-check)
- [ ] Consistent spacing + left-aligned text
- [ ] Tokens only

---

## WP-031 — Emotional State (Emojis + Gradient Sliders)
**Status:** Planned  
**Depends On:** WP-030  
**Priority:** P2
**Implemented in PR:** —  

### Goal
Emoji selector + confidence slider with gradient track, touch-friendly thumb.

### File targets
```txt
CREATE  src/features/journal/EmojiSelector.tsx
CREATE  src/shared/components/GradientSlider.tsx
CREATE  src/features/journal/EmotionalStateCard.tsx
```

### Implementation steps
- Emoji selector: 3–5 options, keyboard/touch accessible
- Gradient slider:
  - track gradient uses CSS (allowed as it’s not a “color value in component”; define gradient in `journal.css`)
  - thumb ≥ 32px on mobile

### Acceptance criteria
- [ ] Emojis selectable
- [ ] Slider has gradient + large thumb
- [ ] Optional additional sliders behind toggle

---

## WP-032 — Market Context Accordion (Regime Selector)
**Status:** Planned  
**Depends On:** WP-030  
**Priority:** P2
**Implemented in PR:** —  

### Goal
Accordion refactor with desktop dropdown and mobile horizontal regime buttons.

### File targets
```txt
CREATE  src/features/journal/MarketContextAccordion.tsx
CREATE  src/features/journal/MarketRegimeSelector.tsx
```

### Acceptance criteria
- [ ] Accordion opens/closes
- [ ] Desktop dropdown works
- [ ] Mobile toggle buttons work

---

## WP-033 — Trade Thesis (Tags + Screenshot + AI Notes)
**Status:** Planned  
**Depends On:** WP-030  
**Priority:** P2
**Implemented in PR:** —  

### Goal
Trade thesis card supports tags, chart screenshot capture, and AI note generation.

### Important rename
- **Fix typo:** `TradeTthesisCard.tsx` → `TradeThesisCard.tsx` (update imports).

### File targets
```txt
RENAME  src/features/journal/TradeTthesisCard.tsx -> src/features/journal/TradeThesisCard.tsx
CREATE  src/features/journal/TagInput.tsx
CREATE  src/features/journal/AINotesGenerator.tsx
```

### Acceptance criteria
- [ ] Tags add/remove with autocomplete
- [ ] Screenshot action shows loading state and stores reference
- [ ] AI notes generate with clear output + error state

---

## WP-034 — Mobile Journal (Bottom Sheet + Touch)
**Status:** Planned  
**Depends On:** WP-030, WP-031  
**Priority:** P2
**Implemented in PR:** —  

### Goal
Journal UX on mobile: card stacking, large controls, templates in a bottom sheet.

### File targets
```txt
MODIFY  src/features/journal/JournalCard.tsx
CREATE  src/features/journal/TemplateBottomSheet.tsx
CREATE  src/shared/components/BottomSheet.tsx
```

### Acceptance criteria
- [ ] Bottom sheet opens/closes with drag handle
- [ ] Large touch controls
- [ ] Template selection auto-applies

---

## WP-035 — Journal Workflow (Templates + Auto-Save + Validation)
**Status:** Planned  
**Depends On:** WP-030..WP-034  
**Priority:** P1
**Implemented in PR:** —  

### Goal
Reliable journaling workflow: autosave, required field validation, template prefill, autocomplete inputs.

### File targets
```txt
CREATE  src/features/journal/useAutoSave.ts
CREATE  src/features/journal/NewTradeModal.tsx
CREATE  src/features/journal/TextfieldWithAutocomplete.tsx
MODIFY  src/features/journal/JournalForm.tsx
```

### Acceptance criteria
- [ ] Auto-save every 30s with “Saved at …” feedback
- [ ] Required fields show inline errors
- [ ] Template prefill works
- [ ] Draft persists on refresh (localStorage)

---

# CHART — Advanced Visualization & Replay

## WP-050 — Chart Foundation (Layout, Sidebar, TopBar, Toolbar, Bottom Panel)
**Status:** Planned  
**Depends On:** WP-002, WP-003  
**Priority:** P1
**Implemented in PR:** —  

### Goal
A stable chart page shell: left sidebar, main chart, right toolbar, bottom panel + sticky top controls.

### File targets
```txt
CREATE  src/features/chart/ChartLayout.tsx
CREATE  src/features/chart/ChartSidebar.tsx
CREATE  src/features/chart/ChartTopBar.tsx
CREATE  src/features/chart/ChartToolbar.tsx
CREATE  src/features/chart/ChartBottomPanel.tsx
CREATE  src/features/chart/chart.css
```

### Implementation steps
1. Layout:
   - desktop: sidebar (240) + main (flex) + toolbar (200)
   - bottom panel collapsible (120–200)
2. Mobile:
   - sidebar and toolbar become sheets/drawers
   - main chart full width
3. TopBar:
   - timeframe toggle
   - title “SOL/USDC · 1h”
   - actions: refresh, replay, export (wired later)
4. Bottom panel:
   - tabs/accordion for “Grok Pulse” and “Journal Notes” placeholders

### Acceptance criteria
- [ ] Chart page renders full-height without overflow bugs
- [ ] Desktop layout shows 3 columns
- [ ] Mobile collapses side areas into sheets
- [ ] Tokens only

---

## WP-051 — Main Chart Area (Crosshair, Zoom, Markers)
**Status:** Planned  
**Depends On:** WP-050  
**Priority:** P1
**Implemented in PR:** —  

### Goal
Core chart interactions: crosshair, zoom/pan, and journal markers overlay.

### File targets
```txt
CREATE  src/features/chart/ChartCanvas.tsx
CREATE  src/features/chart/markers.ts
MODIFY  src/api/journalEntries.ts
```

### Acceptance criteria
- [ ] Crosshair visible
- [ ] Zoom/pan works (mouse + touch where possible)
- [ ] Journal markers render from mocked entries

---

## WP-052 — Right Toolbar (Indicators, Drawings, Alerts)
**Status:** Planned  
**Depends On:** WP-050  
**Priority:** P2
**Implemented in PR:** —  

### Goal
Right toolbar groups chart tools with expandable sections.

### File targets
```txt
MODIFY  src/features/chart/ChartToolbar.tsx
CREATE  src/features/chart/toolbar-sections.tsx
CREATE  src/api/alerts.ts
```

### Acceptance criteria
- [ ] Indicators section UI present
- [ ] Drawings section UI present
- [ ] Alerts manager entry point exists
- [ ] Works with mock data

---

## WP-053 — Bottom Panel (Grok Pulse + Journal Notes)
**Status:** Planned  
**Depends On:** WP-050  
**Priority:** P2
**Implemented in PR:** —  

### Goal
Bottom panel shows quick AI pulse + inline notes.

### File targets
```txt
MODIFY  src/features/chart/ChartBottomPanel.tsx
CREATE  src/features/chart/GrokPulseCard.tsx
CREATE  src/features/chart/InlineJournalNotes.tsx
```

### Acceptance criteria
- [ ] Collapsible bottom panel
- [ ] Notes editable + persists draft
- [ ] Tokens only

---

## WP-054 — Replay & Controls (Speed, Export)
**Status:** Planned  
**Depends On:** WP-051, WP-050  
**Priority:** P2
**Implemented in PR:** —  

### Goal
Replay mode controls and export action in top bar.

### File targets
```txt
MODIFY  src/features/chart/ChartTopBar.tsx
CREATE  src/features/chart/replay.ts
```

### Acceptance criteria
- [ ] Replay toggle + speed controls
- [ ] Export action produces a file or stub output (document behavior)

---

## WP-055 — Default Chart & Fallback (SOL/USDC)
**Status:** Planned  
**Depends On:** WP-050  
**Priority:** P2
**Implemented in PR:** —  

### Goal
Chart opens with a sensible default market and survives missing market data.

### File targets
```txt
MODIFY  src/features/chart/* (minimal)
CREATE  src/api/marketData.ts
```

### Acceptance criteria
- [ ] Defaults to SOL/USDC if no symbol chosen
- [ ] Clear empty/error states if data missing

---

## WP-056 — Mobile Chart UX (Bottom Sheet + Floating Buttons)
**Status:** Planned  
**Depends On:** WP-050  
**Priority:** P2
**Implemented in PR:** —  

### Goal
Mobile chart navigation and tool access without clutter.

### File targets
```txt
MODIFY  src/features/chart/ChartLayout.tsx
CREATE  src/features/chart/MobileChartControls.tsx
```

### Acceptance criteria
- [ ] Mobile tool access via sheet + floating controls
- [ ] No overlap with bottom nav safe area

---

# ALERTS — Notification & Trigger Management

## WP-070 — Alerts Desktop Layout (Top-Bar, Filters, List)
**Status:** Planned  
**Depends On:** WP-002, WP-003, WP-004  
**Priority:** P2
**Implemented in PR:** —  

### File targets
```txt
CREATE  src/features/alerts/AlertsPage.tsx
CREATE  src/features/alerts/alerts.css
CREATE  src/features/alerts/FiltersBar.tsx
```

### Acceptance criteria
- [ ] Desktop layout: filters + list
- [ ] Tokens only

---

## WP-071 — Alert Card Design & Actions
**Status:** Planned  
**Depends On:** WP-070  
**Priority:** P2
**Implemented in PR:** —  

### File targets
```txt
CREATE  src/features/alerts/AlertCard.tsx
MODIFY  src/api/alerts.ts
```

### Acceptance criteria
- [ ] Card shows symbol, condition, status, actions (pause/delete)
- [ ] Optimistic UI with rollback on failure (mock ok)

---

## WP-072 — New Alert Modal/Sheet (Autocomplete + Conditions)
**Status:** Planned  
**Depends On:** WP-070  
**Priority:** P2
**Implemented in PR:** —  

### File targets
```txt
CREATE  src/features/alerts/NewAlertSheet.tsx
CREATE  src/features/alerts/SymbolAutocomplete.tsx
```

### Acceptance criteria
- [ ] Opens from FAB/menu and Alerts page
- [ ] Validates required fields
- [ ] Saves via mock API

---

## WP-073 — Filter System (Status, Type, Symbol, Search)
**Status:** Planned  
**Depends On:** WP-070  
**Priority:** P3
**Implemented in PR:** —  

### File targets
```txt
MODIFY  src/features/alerts/FiltersBar.tsx
CREATE  src/features/alerts/filtering.ts
```

### Acceptance criteria
- [ ] Filters update list
- [ ] Search works (debounced)

---

## WP-074 — Preset Templates & Import
**Status:** Planned  
**Depends On:** WP-072  
**Priority:** P3
**Implemented in PR:** —  

### File targets
```txt
CREATE  src/features/alerts/AlertTemplates.tsx
```

### Acceptance criteria
- [ ] Apply a template to prefill new alert

---

## WP-075 — Mobile Alerts (Scrollable, Swipe Actions)
**Status:** Planned  
**Depends On:** WP-070, WP-071  
**Priority:** P3
**Implemented in PR:** —  

### File targets
```txt
MODIFY  src/features/alerts/AlertsPage.tsx
CREATE  src/features/alerts/MobileAlertRow.tsx
```

### Acceptance criteria
- [ ] Mobile list scrolls smoothly
- [ ] Swipe actions (optional; document if skipped)

---

## WP-076 — Integrations (Chart → Alert, Browser Notifications)
**Status:** Planned  
**Depends On:** WP-072  
**Priority:** P3
**Implemented in PR:** —  

### File targets
```txt
MODIFY  src/features/chart/* (entry point to create alert)
CREATE  src/api/push.ts
```

### Acceptance criteria
- [ ] “Create alert from chart” path exists
- [ ] Browser notification permission flow documented/implemented

---

# SETTINGS — Configuration & Admin

## WP-090 — Settings Foundation (Layout + Cards)
**Status:** Planned  
**Depends On:** WP-002, WP-003, WP-004  
**Priority:** P2
**Implemented in PR:** —  

### Goal
Build the new settings structure (desktop + mobile) with clean cards and top actions.

### Required UI structure
- Header: **Settings**
- Subtitle: “Manage preferences, data backups, wallet monitoring and app controls.”
- Right buttons: **Export All**, **Reset Defaults**
- Cards (vertical, gap-6, padding 24px, bg surface, rounded-xl)
- **Danger Zone is an accordion** (keeps screen clean)

### File targets
```txt
CREATE  src/features/settings/SettingsPage.tsx
CREATE  src/features/settings/settings.css
CREATE  src/features/settings/SettingsCard.tsx
```

### Acceptance criteria
- [ ] Layout matches structure above
- [ ] Mobile responsive
- [ ] Tokens only

---

## WP-091 — Appearance & General (Theme, Font Size, Cache)
**Status:** Planned  
**Depends On:** WP-090  
**Priority:** P3
**Implemented in PR:** —  

### File targets
```txt
CREATE/MODIFY  src/features/settings/AppearanceCard.tsx
MODIFY         src/features/theme/* (wire theme selection UI)
```

### Acceptance criteria
- [ ] Theme selection works (dark/light/system)
- [ ] Basic general toggles exist (stubs ok)

---

## WP-092 — Token Usage (Only) + Daily Reset at 00:00
**Status:** Planned  
**Depends On:** WP-090  
**Priority:** P2
**Implemented in PR:** —  

### Goal
Replace “AI Provider & Usage” complexity with a single **Token Usage** card:
- tokens consumed today
- API calls today
- resets daily at **00:00 Europe/Berlin**

### File targets
```txt
CREATE  src/features/settings/TokenUsageCard.tsx
CREATE  src/features/settings/token-usage.ts
MODIFY  src/store/telemetry.ts (or equivalent usage store)
```

### Implementation notes
- Remove/hide: provider selection, model override, max tokens/cost controls.
- Keep data local (no telemetry/onboarding).

### Acceptance criteria
- [ ] Token usage section shows “Tokens today” + “API calls today”
- [ ] Resets at 00:00 local time (Europe/Berlin)
- [ ] No other AI provider settings shown

---

## WP-093 — Wallet Monitoring
**Status:** Planned  
**Depends On:** WP-090  
**Priority:** P2
**Implemented in PR:** —  

### Required UI
- Monitored Wallet Address (with copy button)
- Enable Monitoring (toggle)

### File targets
```txt
CREATE  src/features/settings/WalletMonitoringCard.tsx
MODIFY  src/api/wallet.ts
MODIFY  src/store/userSettings.ts
```

### Acceptance criteria
- [ ] Address can be copied
- [ ] Toggle persists in settings
- [ ] UI indicates enabled/disabled state clearly

---

## WP-094 — Data Export & Import (JSON/Markdown/Backup)
**Status:** Planned  
**Depends On:** WP-090  
**Priority:** P3
**Implemented in PR:** —  

### File targets
```txt
CREATE  src/features/settings/DataExportCard.tsx
CREATE  src/features/settings/DataImportCard.tsx
```

### Acceptance criteria
- [ ] Export all produces a downloadable file (or stub with documented output)
- [ ] Import validates and shows errors

---

## WP-095 — Chart & App Preferences
**Status:** Planned  
**Depends On:** WP-090  
**Priority:** P3
**Implemented in PR:** —  

### File targets
```txt
CREATE  src/features/settings/PreferencesCard.tsx
```

### Acceptance criteria
- [ ] Basic preferences toggle/radio UI exists and persists

---

## WP-096 — Danger Zone (Accordion)
**Status:** Planned  
**Depends On:** WP-090  
**Priority:** P3
**Implemented in PR:** —  

### Goal
Destructive actions are grouped under a collapsible accordion to keep settings clean.

### File targets
```txt
CREATE  src/features/settings/DangerZoneAccordion.tsx
```

### Acceptance criteria
- [ ] Collapsed by default
- [ ] Expands to show destructive actions
- [ ] Requires confirmation step for destructive actions

---

## WP-097 — Mobile Settings (Accordion + Responsive)
**Status:** Planned  
**Depends On:** WP-090..WP-096  
**Priority:** P3
**Implemented in PR:** —  

### File targets
```txt
MODIFY  src/features/settings/SettingsPage.tsx
MODIFY  src/features/settings/settings.css
```

### Acceptance criteria
- [ ] Cards stack and are readable on mobile
- [ ] Accordions usable with touch targets ≥44×44px

---

# Cross-cutting removals (must happen during relevant WPs)

## Remove onboarding & telemetry (global requirement)
- Any onboarding screens/flows must be removed or fully hidden from navigation.
- Any telemetry collection beyond local token usage must be removed/disabled.

> Implementation should be done opportunistically as affected files are touched.
> If you find these systems, add a short note and the exact file paths in the PR summary.

---

# Backlog / Notes
- Add any discovered issues here (with file paths + short description) instead of doing drive-by refactors.
