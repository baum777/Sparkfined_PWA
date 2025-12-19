# WP-030 — Journal Foundation (Typography, Spacing, Contrast)

## Current state snapshot
- Journal page uses `JournalInputForm` and `JournalResultView` from `src/features/journal-v2`, styled inline without a dedicated `journal.css`.
- Metric score colors in `JournalResultView` rely on Tailwind palette classes (emerald/amber/rose) instead of theme tokens.
- Layout follows `DashboardShell` with mixed spacing utilities (`space-y-4`, `gap-6`) but no journal-specific typography rules.
- Journal form card already uses tokenized text classes and glass variant cards but lacks WCAG AA verification or shared spacing presets.
- No tests target the journal v2 components; bottom nav and sidebar tests exist under `tests/components`.

## Acceptance Criteria
- [x] Contrast meets WCAG AA (manual spot-check)
- [x] Consistent spacing + left-aligned text
- [x] Tokens only

## File targets
- [x] CREATE  src/features/journal/journal.css
- [x] MODIFY  src/features/journal/JournalForm.tsx
- [x] MODIFY  src/features/journal/JournalCard.tsx

## Implementation steps
- [x] Add journal foundation stylesheet with token-based typography, spacing rhythm, and score color utility classes. _Notes:_ Added `journal.css` with spacing grid helpers and token-colored score states for journal views. (Files: `src/features/journal/journal.css`)
- [x] Wrap the journal input form with the new layout shell/imports so the page can consume `journal.css` and consistent spacing. _Notes:_ Added `JournalForm` wrapper that imports `journal.css`, preserves aria labeling, and keeps spacing via `journal-shell__section` container. (Files: `src/features/journal/JournalForm.tsx`)
- [x] Tokenize result card score colors + align text blocks, exposing a JournalCard wrapper around `JournalResultView`. _Notes:_ Replaced tailwind palette colors with token-based tone classes, added journal heading/meta styles, and wrapped result output via `JournalCard`. (Files: `src/features/journal-v2/components/JournalResultView.tsx`, `src/features/journal/JournalCard.tsx`)
- [x] Wire JournalPage to use the new wrappers and add a focused test for journal typography/active colors. _Notes:_ Swapped JournalPage to the journal shell grid, consumed JournalForm/JournalCard wrappers, imported `journal.css`, and added a page test asserting shell class and tokenized score tone. (Files: `src/pages/JournalPage.tsx`, `tests/pages/JournalPage.test.tsx`)
- [x] Update docs (CHANGELOG + index) and record verification. _Notes:_ Logged WP-030 delivery in docs/CHANGELOG.md and docs/index.md with checklist link and touched files. (Files: `docs/CHANGELOG.md`, `docs/index.md`)

## Verification checklist
- [x] pnpm typecheck
- [x] pnpm lint
- [x] pnpm test or pnpm vitest run
- [ ] pnpm test:e2e (blocked: Playwright browsers not installed in environment)
