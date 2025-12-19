# WP-031 Checklist — Emotional State (Emojis + Gradient Sliders)

## Current state snapshot (pre-implementation)
- JournalForm delegates to `JournalInputForm` (journal-v2) with select + numeric sliders for emotional state, conviction, and pattern quality (no emojis yet).
- Existing `EmotionalSlider` component in `src/components/journal/EmotionalSlider.tsx` provides a gradient range input with inline styles, used via Suspense in the form.
- No shared gradient slider component or emoji selector in `src/shared/components`; slider inputs in `JournalInputForm` use plain `<input type="range">` with accent styles.
- `src/features/journal/journal.css` defines journal layout/typography spacing from WP-030; no emotional state-specific styles or gradient tokens there.

## File targets
- [x] src/features/journal/EmojiSelector.tsx
- [x] src/shared/components/GradientSlider.tsx
- [x] src/features/journal/EmotionalStateCard.tsx
- [x] src/features/journal/JournalForm.tsx (integration covered via JournalInputForm wrapper; no direct changes required)
- [x] src/features/journal-v2/components/JournalInputForm.tsx
- [x] src/features/journal/journal.css (or new scoped CSS)
- [x] docs/CHANGELOG.md
- [x] docs/index.md

## Implementation steps
- [x] Step 1 — EmojiSelector component — Added accessible emoji button group with roving tabindex and radio semantics. Files: src/features/journal/EmojiSelector.tsx, WP-Polish/WP-031/checklist.md
- [x] Step 2 — GradientSlider shared component — Built shared gradient slider shell with label/value display and ARIA hooks. Files: src/shared/components/GradientSlider.tsx, WP-Polish/WP-031/checklist.md
- [x] Step 3 — EmotionalStateCard UI — Added card combining emoji selector, confidence slider, and optional advanced sliders toggle. Files: src/features/journal/EmotionalStateCard.tsx, WP-Polish/WP-031/checklist.md
- [x] Step 4 — Wire EmotionalStateCard into JournalForm state — Integrated card into JournalInputForm with existing emotional/conviction state and value text. Files: src/features/journal-v2/components/JournalInputForm.tsx, WP-Polish/WP-031/checklist.md
- [x] Step 5 — CSS for emotional state + gradient slider — Styled emoji buttons, advanced toggle, and gradient slider track/thumb sizing with scoped journal classes. Files: src/features/journal/journal.css, WP-Polish/WP-031/checklist.md
- [x] Step 6 — Docs updates — Logged WP-031 delivery in docs changelog and index with file pointers. Files: docs/CHANGELOG.md, docs/index.md, WP-Polish/WP-031/checklist.md
- [x] Step 7 — Finalize checklist — Recorded verification results and AC status after regression commands. Files: WP-Polish/WP-031/checklist.md, src/features/journal/EmojiSelector.tsx, src/features/journal/EmotionalStateCard.tsx, src/features/journal-v2/components/JournalInputForm.tsx

## Acceptance criteria
- [x] Emojis selectable (mouse + keyboard)
- [x] Slider has gradient + large thumb
- [x] Optional additional sliders behind toggle (if specified; document decision)

## Verification
- [x] pnpm typecheck — Pass
- [x] pnpm lint — Pass (pre-existing warnings in unrelated files)
- [x] pnpm test (or pnpm vitest run) — Pass
- [ ] pnpm test:e2e (Playwright browsers not installed; see pnpm exec playwright install chromium)
