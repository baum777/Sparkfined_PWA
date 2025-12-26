## Working Paper — 10 Tabs (tab-by-tab pipeline)

### Purpose

Provide a repeatable, controllable pipeline to document current UI (no opinions), propose small high-impact polish (conversion/usability first), and generate atomic “Loveable” prompts per tab/component—while keeping changes safe, testable, and scoped.

### Relevant Paths (from Cluster Map)

- root/src/config/navigation.ts
- root/src/routes/RoutesRoot.tsx
- root/src/pages/*
- root/tests/e2e/*
- root/tests/components/*
- root/tests/pages/*

### What “Done” means

- Every tab in `manifest.yml` has a folder in `10-tabs/tabs/<tab-slug>/`.
- Each processed tab contains:
  - `00-current-ui.md` (accurate description of current UI + interactions)
  - `01-polish-suggestions.md` (only after explicit user approval)
  - `02-loveable-prompts.md` (V0/V1/V2 variants with strict Allowed paths)
- `manifest.yml` statuses progress: `todo → drafted → approved → ready_for_loveable`.

### Risks / Guardrails

- Don’t invent UI: descriptions must be derived from code/tests/known behaviors.
- Avoid scope creep: no cross-tab refactors; prompts must be atomic.
- Keep performance in mind: lists/charts/replay are sensitive to re-render churn.
- Maintain stable selectors (`data-testid`) to protect Playwright E2E tests.

### Loveable Prompt Guardrails

- Always include **Allowed paths** (strict, minimal set).
- Specify the smallest achievable “Task” (one intent per prompt).
- Prefer existing UI primitives/patterns; do not create parallel component libraries.
- No hardcoded colors or ad-hoc spacing—use tokens/utilities already in the system.
- If anything about behavior is unclear: **ask questions before coding**.

### Checklist

- **Confirm tab order** from `root/src/config/navigation.ts` (fallback `RoutesRoot.tsx`).
- **Create tab folder** `10-tabs/tabs/<slug>/`.
- **Write `00-current-ui.md`**: layout, hierarchy, states, interactions, performance touchpoints.
- **Post ≤50-word suggestions** in chat only.
- **After approval**: write `01-polish-suggestions.md` + acceptance criteria.
- **Write `02-loveable-prompts.md`**: V0/V1/V2 with guardrails + Allowed paths.
- **Update manifest status** for the tab.

