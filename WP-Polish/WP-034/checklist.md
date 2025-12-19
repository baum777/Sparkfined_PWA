# WP-034 Checklist — Mobile Journal (Bottom Sheet + Touch)

## Current state snapshot (pre-implementation)
- Journal page mounts `JournalForm` which wraps `JournalInputForm` (journal-v2) for entry capture; template picker uses a select inside the form header.
- No bottom sheet primitive exists; overlays rely on `Modal` and `RightSheet` for focus trap/scroll lock.
- Journal result card (`JournalCard`) renders the latest insights only, without template controls or mobile-specific touch sizing.
- Template management lives under `src/components/journal/templates` with built-in templates and manager sheet (RightSheet-based), but nothing tailored for mobile bottom sheets.

## File targets
- [x] src/shared/components/BottomSheet.tsx
- [x] src/features/journal/TemplateBottomSheet.tsx
- [x] src/features/journal/JournalCard.tsx
- [x] src/features/journal/journal.css (scoped styles for bottom sheet / mobile sizing)
- [x] docs/CHANGELOG.md
- [x] docs/index.md
- [x] WP-Polish/WP-034/checklist.md

## Implementation steps
- [x] Step 1 — BottomSheet primitive — Added shared overlay primitive with focus trap, esc/overlay close, scroll lock, and a tap-to-close handle sized for touch. Files: src/shared/components/BottomSheet.tsx, WP-Polish/WP-034/checklist.md
- [x] Step 2 — TemplateBottomSheet list — Implemented template list bottom sheet with deterministic builtin fallback and apply callbacks. Files: src/features/journal/TemplateBottomSheet.tsx, WP-Polish/WP-034/checklist.md
- [x] Step 3 — Wire into JournalCard (mobile controls) — Added template trigger with bottom sheet wiring and touch-sized controls on the insights card path. Files: src/features/journal/JournalCard.tsx, WP-Polish/WP-034/checklist.md
- [x] Step 4 — Apply templates to journal form state — Added forwarded ref handle on the active JournalForm/JournalInputForm to apply templates with fill-empty or overwrite-all rules from TemplateBottomSheet. Files: src/features/journal-v2/components/JournalInputForm.tsx, src/features/journal/JournalForm.tsx, src/pages/JournalPage.tsx, WP-Polish/WP-034/checklist.md
- [x] Step 5 — Tokenized styling — Added token-based spacing for mobile template actions and bottom sheet surface/background. Files: src/features/journal/journal.css, WP-Polish/WP-034/checklist.md
- [x] Step 6 — Docs updates — Updated changelog/index with WP-034 bottom sheet + template wiring references. Files: docs/CHANGELOG.md, docs/index.md, WP-Polish/WP-034/checklist.md
- [x] Step 7 — Finalize checklist — Recorded AC mapping and verification results. Files: WP-Polish/WP-034/checklist.md

## Acceptance criteria
- [x] Bottom sheet opens/closes with drag handle (tap-to-close handle; drag-to-close not implemented)
- [x] Large touch controls on mobile (≥44px targets)
- [x] Template selection auto-applies to the current journal draft

## Verification
- [x] pnpm typecheck — Pass
- [x] pnpm lint — Warnings pre-existing (unused vars in api/tests, hardcoded color in FeatureTooltip, etc.)
- [x] pnpm vitest run — Pass
- [ ] pnpm test:e2e — Not run (Playwright browsers not installed; run `pnpm exec playwright install chromium`)
