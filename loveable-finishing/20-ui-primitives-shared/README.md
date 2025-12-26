## Working Paper — 20 UI Primitives (shared)

### Purpose

Centralize polish decisions for shared UI atoms (buttons, cards, dialogs, inputs, toasts) so tab-level work stays consistent, accessible, and performance-safe across the whole app.

### Relevant Paths (from Cluster Map)

- root/src/components/ui/*
- root/src/lib/ui/ | cn.ts / useFocusTrap.ts
- root/src/components/ui/Modal/__tests__/Modal.a11y.spec.tsx
- root/src/components/ui/Modal/Modal.stories.tsx

### What “Done” means

- Shared primitives behave consistently across tabs (sizes, spacing, focus rings, disabled/loading states).
- A11y basics are standardized (keyboard/focus/ARIA labels, trap for modals).
- No regressions in unit tests and E2E selectors that depend on primitives.

### Risks / Guardrails

- Don’t introduce new component paradigms; reuse existing primitives and patterns.
- Avoid breaking `data-testid` usage that tests rely on.
- No hardcoded colors; prefer established tokens/utilities.
- Be careful with focus management: regressions here are high-impact.

### Loveable Prompt Guardrails

- Scope prompts to a single primitive or a single behavior (e.g., “Dialog focus trap + escape close”).
- Allowed paths must be limited to the primitive folder + minimal call sites if needed.
- Require acceptance criteria for keyboard navigation and screen-reader semantics.

### Checklist

- **Inventory** core primitives used across tabs (buttons, inputs, cards, modal/sheet).
- **Define state matrix**: default/hover/active/disabled/loading/error/success.
- **Verify keyboard flows**: tab order, focus ring visibility, escape/enter behavior.
- **Verify modal focus trap** and restore focus on close.
- **Check motion/animation** for reduced-motion support if present.
- **Ensure stable `data-testid`** stays intact when used by tests.

