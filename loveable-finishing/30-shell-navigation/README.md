## Working Paper — 30 Shell & Navigation

### Purpose

Make navigation feel effortless and “always oriented”: clear current location, predictable back/forward behavior, and consistent shell layout across tabs—without breaking route aliases, URL sync, or E2E tests.

### Relevant Paths (from Cluster Map)

- root/src/features/shell/*
- root/src/components/layout/*
- root/src/config/navigation.ts
- root/src/routes/RoutesRoot.tsx
- root/src/components/navigation/SwipeNavGate.tsx
- root/tests/e2e/* (navigation-related coverage)

### What “Done” means

- Primary navigation (tabs) is consistent (labels, icons, active state, focus states).
- Route aliases still resolve correctly (deep links + existing E2E rely on them).
- Shell layout doesn’t shift unexpectedly between tabs (header/footer/side).

### Risks / Guardrails

- Don’t change route paths/aliases casually (high risk to bookmarks + E2E).
- Don’t regress swipe/gesture gates (mobile nav stability).
- Preserve `data-testid` for nav items (e.g., `nav-dashboard`, `nav-journal`).

### Loveable Prompt Guardrails

- Keep prompts focused: one nav element or one behavior at a time.
- Allowed paths must include `navigation.ts` only when necessary (avoid cross-cutting diffs).
- Acceptance criteria must include keyboard navigation + active state correctness.

### Checklist

- **Confirm tab order** matches `root/src/config/navigation.ts`.
- **Validate active-state logic** (aliases + sub-routes) stays correct.
- **Keyboard navigation**: tab/enter/escape and focus visibility on nav.
- **Mobile touch targets**: ≥44px for primary nav.
- **No layout jank** when switching tabs (shell stability).
- **Protect E2E selectors** and update tests only if strictly necessary.

