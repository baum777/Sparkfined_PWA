## Oracle — 01 Polish Suggestions (approved)

### Approved changes

1) **Calmer reward banner + direct loop completion**
   - Replace the celebratory “🎉 +50 XP…” style banner copy with calmer “degen → mastery” wording and add a “View auto-journal entry” link.

2) **Make rewards clear before “Mark as read”**
   - Add short pre-click explanation of what “Mark as read” does (XP, streak, auto-journal entry).

3) **Add a compact “Today’s takeaway” summary**
   - Insert a short summary block above the full `<pre>` so users don’t have to read the whole report to get value.

4) **Theme filter discoverability**
   - Improve theme filter labeling (“All themes”) and show a count so users know the filter affects history.

### Rationale (conversion/usability first)

- **(1)** Keeps the reward message trustworthy and ties the Oracle read action to the journal habit loop.
- **(2)** Reduces hesitation and “what just happened?” confusion; increases read completion.
- **(3)** Improves time-to-value: users can act on the oracle without scrolling long text.
- **(4)** Makes history exploration more discoverable and less “hidden”.

### Risks

- **E2E selectors**: keep `oracle-refresh-button`, `oracle-mark-read-button`, and `oracle-pre` stable.
- **Timing**: reward banner still uses a timeout; keep it predictable and avoid rerender loops.
- **Links**: “View auto-journal entry” must not introduce new routes unless already supported; keep navigation minimal.

### Acceptance criteria (testable)

- **(1)** Reward banner uses calm copy and includes a working “View auto-journal entry” link/CTA.
- **(2)** “Mark as read” area explains rewards before click, without adding clutter.
- **(3)** A “Today’s takeaway” summary appears above the full report `<pre>` and is visible without scrolling.
- **(4)** Theme filter shows “All themes” labeling and a count; selection still filters chart/list.

### Affected paths (strict, from cluster map)

- root/src/pages/OraclePage.tsx
- root/src/components/oracle/*
- root/src/store/oracleStore.ts
- root/tests/e2e/oracle.spec.ts (only if selectors/flows must change; prefer no changes)
