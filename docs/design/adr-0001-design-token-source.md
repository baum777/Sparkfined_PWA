# ADR 0001: Tailwind config as the design-token source of truth

**Status:** Accepted  \
**Date:** 2025-02-18

## Context

Historically, Sparkfined PWA carried two parallel token definitions: CSS custom properties in `src/styles/tokens.css` and the semantic palette inside `tailwind.config.ts`. Values drifted (e.g., hover surfaces, skeleton backgrounds, focus borders), and UI components fell back to hardcoded palette classes like `bg-blue-500`, making it difficult to maintain brand consistency.

## Decision

- Treat `tailwind.config.ts` as the canonical source for semantic tokens (brand, surface, border, text, status, sentiment).
- Mirror the same values in `src/styles/tokens.css` so non-Tailwind surfaces (e.g., charts, overlays) stay aligned without duplication.
- Require UI primitives and pages to use semantic utilities (e.g., `bg-brand`, `bg-surface`, `text-text-primary`, `text-success`, `text-danger`) instead of raw palette colors.
- Preserve existing spacing, radius, shadow, and motion tokens in CSS with values matched to Tailwind for consistency.

## Consequences

- **Consistency:** Design updates happen once in Tailwind and propagate to both utility classes and CSS variable consumers.
- **Accessibility:** Semantic color names map to intended meaning (brand, success, danger, warn) making reviews and audits faster.
- **Migration path:** Legacy palette usage should be refactored to semantic tokens during component work; new components must avoid hardcoded colors.

## References

- `tailwind.config.ts` — canonical semantic palette
- `src/styles/tokens.css` — mirrored CSS variables for non-utility contexts
- README section "Design tokens & styling" for contributor guidance
