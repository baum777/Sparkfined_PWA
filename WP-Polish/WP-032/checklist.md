# WP-032 Checklist — Market Context Accordion

## Current state snapshot
- Market context is captured in `JournalInputForm` via `marketContext` state defaulting to `'chop'`, surfaced in a Collapsible section using the shared `Select` component with options like breakout/mean-reversion/trend-up/down and saved into the form payload.
- The active journal mount is `JournalForm` wrapping `JournalInputForm` (v2), which imports `journal.css` for domain styles.
- Existing accordion/collapsible primitive is `Collapsible` in `src/components/ui/Collapsible.tsx`, using a button with aria-expanded and a slide transition; no dedicated market-context accordion yet.
- `journal.css` defines journal layout and tokens-based styles for emotion/slider components; no market-context-specific styles present.
- The shared `Select` component in `src/components/ui/Select.tsx` handles dropdowns with tokens and keyboard support; no mobile-specific regime buttons exist.

## File targets
- [x] CREATE `src/features/journal/MarketContextAccordion.tsx`
- [x] CREATE `src/features/journal/MarketRegimeSelector.tsx`
- [x] MODIFY journal form to mount accordion and persist regime
- [x] UPDATE styles in `src/features/journal/journal.css` or new scoped file
- [x] UPDATE docs (`docs/CHANGELOG.md`, `docs/index.md`)

## Implementation steps
- [x] Step 1 — Define regimes + selector contract — Added shared `MarketRegimeSelector` with stable regime list, desktop select, and mobile pill variants; files: `src/features/journal/MarketRegimeSelector.tsx`, `WP-Polish/WP-032/checklist.md`.
- [x] Step 2 — Accordion container — Implemented `MarketContextAccordion` with accessible toggle wiring, helper copy, and nested selector support; files: `src/features/journal/MarketContextAccordion.tsx`, `WP-Polish/WP-032/checklist.md`.
- [x] Step 3 — Wire into journal form state — Mounted the accordion in `JournalInputForm`, preserving marketContext state and self-reflection inputs; files: `src/features/journal-v2/components/JournalInputForm.tsx`, `WP-Polish/WP-032/checklist.md`.
- [x] Step 4 — Styling (tokenized) + mobile ergonomics — Added scoped market-context styles for accordion, desktop select, and scrollable mobile pills with 44px touch targets; files: `src/features/journal/journal.css`, `WP-Polish/WP-032/checklist.md`.
- [x] Step 5 — Docs — Logged WP-032 completion in `docs/CHANGELOG.md` and `docs/index.md`.
- [x] Step 6 — Finalize checklist — Captured acceptance mapping and verification results; files: `WP-Polish/WP-032/checklist.md`.

## Acceptance criteria
- [x] Accordion opens/closes — `MarketContextAccordion` toggles aria-expanded/controls state with default-collapsed panel.
- [x] Desktop dropdown works — Desktop `MarketRegimeSelector` renders select with labeled options and helper text.
- [x] Mobile toggle buttons work — Scrollable pill buttons render in the mobile variant with active/pressed states.

## Verification
- [x] pnpm typecheck — Passed.
- [x] pnpm lint — Passed with pre-existing warnings only.
- [x] pnpm test or pnpm vitest run — `pnpm vitest run --reporter=basic` passed.
- [ ] pnpm test:e2e (or document prerequisite) — Not run; Playwright browsers require `pnpm exec playwright install chromium`.
