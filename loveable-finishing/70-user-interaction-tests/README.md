## Working Paper — 70 User Interaction Tests

### Purpose

Protect conversion/usability work with stable automated coverage: ensure UI polish does not break existing Playwright E2E flows and strengthen selectors/waits where needed (without introducing flakiness).

### Relevant Paths (from Cluster Map)

- root/tests/e2e/*
- root/tests/components/*
- root/tests/pages/*
- root/playwright.config.ts
- root/.cursor/rules/playwright-e2e-health.mdc

### What “Done” means

- Existing E2E tests remain green after UI polish changes.
- Any updated selectors use stable `data-testid`.
- No new hard waits; waits are locator/state-based.

### Risks / Guardrails

- Never “fix” tests by skipping/disabling suites.
- Don’t introduce timing-dependent waits (`waitForTimeout`) to mask real issues.
- Keep `data-testid` stable; if you must change it, update all affected tests in the same change.

### Loveable Prompt Guardrails

- Prompts must state whether selectors/flows change; if yes, include test updates in scope.
- Allowed paths must include both the UI files and the exact test files impacted.
- Acceptance criteria must include a specific E2E run target (suite or file) and expected pass.

### Checklist

- **Identify impacted flows** (CRUD, filters, navigation, export, replay).
- **Use `data-testid`** for selectors; avoid CSS/text brittle selectors.
- **Prefer auto-waits**: expect-visible/enabled, not sleeps.
- **Isolate state** when needed (IndexedDB reset patterns).
- **Run relevant E2E** after changes (single file first, then full suite when appropriate).

