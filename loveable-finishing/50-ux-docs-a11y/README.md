## Working Paper — 50 UX Docs & A11y

### Purpose

Ensure polishing work stays aligned with existing UX guidance and meets accessibility basics (keyboard, focus, semantics, contrast), especially for high-conversion flows (journal entry, alerts creation, watchlist actions).

### Relevant Paths (from Cluster Map)

- root/docs/UI_STYLE_GUIDE.md
- root/docs/UX-IMPROVEMENTS.md
- root/docs/RESPONSIVE_GUIDELINES.md
- root/docs/DESIGN_TOKENS_STYLEGUIDE_DE.md
- root/docs/archive/CHART_A11Y_GUIDELINES.md
- root/docs/active/reports/ui-errors.md
- root/src/components/ui/Modal/__tests__/Modal.a11y.spec.tsx
- root/tests/e2e/board-a11y.spec.ts

### What “Done” means

- Tab-level proposals cite relevant guidance and define acceptance criteria that can be tested.
- Key interaction patterns are keyboard-friendly and have visible focus states.
- No new known a11y regressions are introduced by polish work.

### Risks / Guardrails

- Don’t treat “a11y” as visual-only: semantics and keyboard flows matter.
- Avoid text-only selectors in tests; prefer `data-testid`.
- Don’t add motion/animation without considering reduced motion.

### Loveable Prompt Guardrails

- Prompts must include explicit a11y acceptance criteria (focus order, ARIA label presence).
- Allowed paths must be constrained; do not “sweep” across many components.
- If the correct behavior is unclear: ask questions before coding.

### Checklist

- **Keyboard**: tab order, escape to close dialogs, enter to submit, focus restore.
- **Focus visibility**: consistent ring/outline and not clipped.
- **Semantics**: headings/landmarks, form labels, button names.
- **Contrast**: text and interactive states meet baseline expectations.
- **Responsive**: mobile-first layout still readable and tappable.

