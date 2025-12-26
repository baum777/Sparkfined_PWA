## Working Paper — 40 Global Styling & Theming

### Purpose

Keep visuals coherent across the app (spacing, typography, surfaces, borders, states) while respecting the existing design-token system and avoiding regressions in dark/contrast modes.

### Relevant Paths (from Cluster Map)

- root/src/styles/*
- root/tailwind.config.ts
- root/postcss.config.cjs
- root/eslint-rules/no-hardcoded-colors.js
- root/src/features/theme/*
- root/src/lib/theme/*
- root/docs/DESIGN_TOKENS_STYLEGUIDE_DE.md
- root/docs/UI_STYLE_GUIDE.md
- root/docs/RESPONSIVE_GUIDELINES.md

### What “Done” means

- New/updated UI uses existing tokens/utilities (no ad-hoc hex colors).
- Common surfaces/typography feel consistent across tabs.
- Contrast and focus visibility are preserved (a11y baseline).

### Risks / Guardrails

- Don’t introduce hardcoded colors (enforced by lint rule).
- Avoid broad CSS changes that alter unrelated tabs (prefer localized utilities).
- Don’t add global overrides that increase layout shift or repaint cost.

### Loveable Prompt Guardrails

- Any styling prompt must name the exact components/pages it touches.
- Allowed paths should be minimal; avoid touching `tailwind.config.ts` unless required.
- Require explicit acceptance criteria (contrast, spacing, responsive breakpoints).

### Checklist

- **Use tokens/utilities**; avoid hex/arbitrary values unless already allowed.
- **Validate responsive behavior** on `sm/md/lg` breakpoints.
- **Check focus rings** and interactive states are visible.
- **Avoid layout shift** (stable heights/spacing; avoid late-loading font swaps).
- **Prefer composable UI primitives** over custom one-off styles.

