## Settings — 01 Polish Suggestions (approved)

### Approved changes

1) **Remove or clearly label stubbed actions**
   - Any “stub/mock” controls should be explicitly labeled as such to avoid trust loss.

2) **Add “degen → mastery” guidance by prioritizing the top 3 settings**
   - Visually emphasize the three most important user-facing levers first (theme, wallet monitoring, export).

3) **Align export/import controls with E2E selectors and clarify success feedback**
   - Ensure the export/import UI exposes the expected stable `data-testid` selectors and that success feedback is obvious.

4) **Make destructive actions safer**
   - Replace double-click confirmation for factory reset with a typed confirmation (e.g., type “RESET”) before enabling.

### Rationale (conversion/usability first)

- **(1)** Prevents confusion and distrust (users shouldn’t think they changed real settings when it’s stubbed).
- **(2)** Reduces cognitive overload in a long settings list; guides users to the most impactful setup steps.
- **(3)** Improves reliability (tests + user confidence) and makes outcomes visible.
- **(4)** Reduces accidental destructive actions and aligns with “trustworthy trading tool” expectations.

### Risks

- **Selector stability**: do not break existing E2E selectors; prefer adding missing `data-testid` rather than renaming.
- **Scope drift**: keep changes minimal—no refactor of settings architecture.
- **A11y**: typed confirmation must remain accessible (label, focus management).

### Acceptance criteria (testable)

- **(1)** Stubbed controls are labeled “Mock/Stub” in UI copy (or removed from primary surfaces).
- **(2)** The page clearly highlights the top 3 “setup essentials” (theme, wallet monitoring, export) without hiding other cards.
- **(3)** Export/import flows provide stable `data-testid` hooks and show clear success messaging after completion.
- **(4)** “Factory reset” requires typed confirmation before it can execute; users cannot trigger it accidentally by double-click timing.

### Affected paths (strict, from cluster map)

- root/src/pages/ | SettingsPage.tsx / SettingsContent.tsx
- root/src/features/settings/*
- root/src/components/settings/*
- root/tests/e2e/settings/data-export.spec.ts (only if selectors change; prefer no changes)
