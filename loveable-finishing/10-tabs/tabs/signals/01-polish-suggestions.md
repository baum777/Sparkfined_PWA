## Signals — 01 Polish Suggestions (approved)

### Approved changes

1) **Persist Accept/Reject feedback**
   - Replace console-only outcomes with visible UI feedback (e.g., badge state + success toast/inline confirmation).

2) **Add a primary “Open in Chart” CTA on Signal Details**
   - Make the next action obvious so signals convert into analysis.

3) **Add confidence preset buttons**
   - Provide quick presets (60/75/90%) to speed up filtering without fiddly slider use.

4) **Add “Next step to mastery” after Accept**
   - After accepting a signal, nudge the habit loop: “Log outcome in Journal.”

### Rationale (conversion/usability first)

- **(1)** Builds trust and reduces confusion: users see that their review action “stuck”.
- **(2)** Converts interest into action (chart analysis) with fewer clicks.
- **(3)** Makes filtering fast and mobile-friendly.
- **(4)** Reinforces the degen → mastery journey by connecting signals to journaling.

### Risks

- **No scope creep**: keep persistence lightweight (avoid new complex storage unless already available).
- **A11y**: modal actions and toast/feedback must be keyboard/screen-reader friendly.
- **Performance**: avoid re-render loops when changing filters (keep state local and minimal).

### Acceptance criteria (testable)

- **(1)** Clicking Accept or Reject shows immediate visible feedback and closes the modal without relying on console logs.
- **(2)** Signal Details includes a clear primary “Open in Chart” action that navigates predictably.
- **(3)** Preset buttons set the confidence threshold to 60/75/90% and update list + stats accordingly.
- **(4)** After Accept, the UI shows a short “Next step to mastery: Log outcome in Journal” hint.

### Affected paths (strict, from cluster map)

- root/src/pages/SignalsPage.tsx
- root/src/components/signals/*
- root/src/hooks/useSignals.ts

