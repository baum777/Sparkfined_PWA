# Spark Phase 5 Checklist – Stabilize & Govern

This checklist is for engineers, QA, and design reviewing the Spark design system rollout.
Phase 4 (migration) is complete; Phase 5 focuses on stabilization, visual QA, and governance.

Spark is the **only** styling source:
- Semantic tokens in `src/styles/tokens.css`
- Components & hooks exported from `@/design-system/*`
- No Tailwind legacy palettes, no shims

---

## 1. Pre-flight Checks

- [ ] `pnpm lint` passes
- [ ] `pnpm typecheck` passes
- [ ] `pnpm test` passes
- [ ] `pnpm test:e2e` passes

If any of these fail, fix them **before** doing visual QA – broken states make visual review meaningless.

---

## 2. Core Flows – Visual & Interaction QA

For each flow, verify **both** behavior and visual consistency with Spark tokens.

### 2.1 Dashboard

- [ ] Cards, CTAs, alerts, and quick actions use `@/design-system` Button/Card/Alert/Badge/Tooltip.
- [ ] No layout regressions (spacing, alignment, wrapping).
- [ ] Hover/active/focus states read correctly on dark theme (and light, if enabled).
- [ ] Sentiment tokens (gain/loss etc.) are legible and accessible.

### 2.2 Watchlist & Analysis Boards

- [ ] Table rows, chips, filters, and context actions use Spark primitives (Button, Badge, Tooltip, Modal).
- [ ] Gesture hooks (`useSwipeable`, `useDragReorder`, etc.) behave as expected on list/board interactions.
- [ ] No leftover custom colors – only Spark tokens (background, border, text).

### 2.3 Alerts CRUD (Dialogs & Forms)

- [ ] All inputs use `@/design-system/Input` with `errorText` and semantic tokens.
- [ ] Validation errors show correctly and are screen-reader friendly.
- [ ] Dialogs use `@/design-system/Modal` with proper focus trap and ESC/overlay close.
- [ ] Former `errorTestId` plumbing is no longer relied on in tests.

### 2.4 Onboarding Wizard

- [ ] Steps, buttons, and progress indicators use Spark components & tokens.
- [ ] No emerald/legacy brand artifacts; new gradients/glows feel consistent with Spark.
- [ ] Copy + visual hierarchy (“primary vs secondary actions”) are still clear.

### 2.5 Landing Hero / Marketing Surfaces

- [ ] Hero, CTAs, promo cards use Spark tokens and gradients (`gradient-spark`, `gradient-void`, etc.).
- [ ] Contrast and readability are acceptable on both large and small screens.
- [ ] Any remaining bespoke marketing styles are documented as intentional in the design docs.

### 2.6 Signals / Metrics / Boards

- [ ] Metrics tiles and signals cards use Spark Cards/Badges/Buttons.
- [ ] Color encodings (risk levels, performance, status) use sentiment tokens, not hardcoded colors.
- [ ] Hover/active states don’t conflict with meaning colors (e.g., hover doesn’t “look like error”).

---

## 3. Known UX & Token Follow-ups

Verify the items called out in `PHASE4_MIGRATION.md` under “Known UX & Token Follow-ups”:

- [ ] **SettingsPage**  
      – Run a contrast/legibility pass for toggles, danger zones, and panels.
- [ ] **MetricsPanel**  
      – Validate token mapping for labels, badges, and trend indicators.
- [ ] **UXShowcase**  
      – Confirm DEV-only status; `.btn-*` helpers are documented as demo-only and not reused in app code.
- [ ] **Composite patterns in src/components/ui/**  
      – Ensure they wrap Spark primitives and are correctly flagged as future migration targets.

If any of these fail, either:
- adjust token choices, or
- document the deviation and open a follow-up ticket.

---

## 4. Governance & Extension Rules (Quick View)

Spark governance is fully documented in `DESIGN_SYSTEM.md`. Before introducing **any** new UI pattern:

- [ ] Check if an existing component covers the use case.
- [ ] If not, add a proposal to `DESIGN_MODULE_SPEC.md` (API, states, accessibility).
- [ ] Only after spec review:
      - [ ] Implement under `src/design-system/components` or `src/design-system/gestures`.
      - [ ] Add tests (unit + basic visual/interaction scenarios).
      - [ ] Update docs and examples.

**Codex usage:**
- [ ] Prompts must reference the latest `DESIGN_SYSTEM.md` and `DESIGN_MODULE_SPEC.md`.
- [ ] Codex must not introduce new tokens/colors outside the documented Spark set.
- [ ] All Codex-generated UI code is reviewed against Spark governance (lint, typecheck, tests, visual QA where relevant).

---

## 5. Sign-off

Phase 5 is considered complete when:

- [ ] All flows in this checklist are visually and functionally validated.
- [ ] Any deviations or UX concerns are documented with follow-up tickets.
- [ ] `DESIGN_SYSTEM.md`, `DESIGN_MODULE_SPEC.md`, and `PHASE4_MIGRATION.md` are in sync.
- [ ] The team agrees that Spark is stable enough to be treated as the default, governed design system for new work.

Once this is checked off, Spark enters **“stable” mode** and future changes must go through the documented spec + governance process.
