## Chart — 01 Polish Suggestions (approved)

### Approved changes

1) **Add a clear primary CTA to Journal from Chart**
   - A prominent “Log this setup → Journal” action near the bottom insight panel, framed as the next step on “degen → mastery”.

2) **Explain URL defaults with a subtle one-time hint**
   - When the chart auto-populates missing query params (symbol/timeframe/address/network), show a small, non-intrusive hint so users understand why the URL changes.

3) **Make “Refresh” meaningful (or remove it)**
   - If the top bar shows “Refresh”, it should actually refresh chart data; otherwise remove/replace to avoid false affordance.

4) **Guide tools into a simple sequence**
   - Reframe tools as a guided “Analyze → Mark → Alert” flow (still using the existing sections), to reduce scanning and improve task completion.

### Rationale (conversion/usability first)

- **(1)** Moves users from analysis to journaling (core habit loop) with a direct, narrative-aligned CTA.
- **(2)** Reduces confusion and distrust caused by “mysterious” URL mutation.
- **(3)** Removes a misleading control and helps users recover quickly when data is stale/unavailable.
- **(4)** Reduces cognitive load in a dense surface by making the next action obvious.

### Risks

- **Performance**: avoid increasing re-renders of the chart canvas; keep expensive updates localized.
- **URL/state sync**: do not introduce infinite loops when showing the one-time hint or updating query params.
- **E2E stability**: keep existing `data-testid` selectors and flows intact (chart E2E relies on them).

### Acceptance criteria (testable)

- **(1)** A visible primary CTA exists to create/log journal context from the chart and is reachable via keyboard.
- **(2)** When defaults are injected into the URL, a subtle hint appears once and does not reappear on every render/navigation.
- **(3)** “Refresh” either:
  - triggers a real data refresh (visible effect on data status), or
  - is removed/replaced so no non-functional button remains.
- **(4)** Tools presentation communicates a clear sequence “Analyze → Mark → Alert” without removing existing capabilities.

### Affected paths (strict, from cluster map)

- root/src/features/chart/*
- root/src/components/chart/*
- root/tests/e2e/ | chart-navigation.spec.ts / chartFlows.spec.ts (only if selectors/flows must change; prefer no changes)

