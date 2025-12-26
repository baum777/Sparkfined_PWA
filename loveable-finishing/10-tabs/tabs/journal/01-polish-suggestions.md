## Journal — 01 Polish Suggestions (approved)

### Approved changes

1) **Add a “degen → mastery” progress cue near the action bar**
   - A compact “Step 1/3: State → Thesis → Review” style cue near the primary CTA.

2) **Make required fields unavoidable**
   - Add inline helper text and on submit jump/focus to the first invalid required field.

3) **Unify templates UX**
   - Reduce confusion between desktop template picker and mobile template sheet by aligning to one consistent flow/mental model.

4) **Make AI notes status explicit (demo/offline/real) with calmer messaging**
   - Clear status indicator + copy that builds trust and reduces anxiety when AI is unavailable.

### Rationale (conversion/usability first)

- **(1)** Increases orientation and motivation by framing the workflow as a short, finishable path.
- **(2)** Reduces drop-off by preventing “silent failure” and guiding users to completion fast.
- **(3)** Reduces cognitive load and mismatched expectations across devices.
- **(4)** Builds trust: users understand whether content is real AI output or a demo/offline fallback.

### Risks

- **Don’t break autosave**: avoid changes that cause excessive writes or re-render loops.
- **No new timers/intervals**: the draft autosave already uses a debounce + interval; keep it stable.
- **Selector stability**: keep existing `data-testid` attributes intact; avoid introducing test fragility.

### Acceptance criteria (testable)

- **(1)** The action area displays a concise progress cue that fits on mobile and desktop without clutter.
- **(2)** Submitting with missing required fields:
  - shows an inline helper/error near the invalid field(s)
  - moves focus to the first invalid required field
  - does not submit or start “Analyzing…”
- **(3)** Templates UX is consistent across breakpoints:
  - users can discover, preview, and apply templates in the same conceptual steps
  - apply mode semantics (“fill empty” vs “overwrite”) remain clear and explicit
- **(4)** AI notes clearly indicate status (demo/offline/real); error copy is calm and actionable; no misleading “AI succeeded” state.

### Affected paths (strict, from cluster map)

- root/src/pages/ | JournalPage.tsx
- root/src/features/journal-v2/components/*
- root/src/features/journal/*
- root/src/components/journal/*
- root/tests/e2e/journal/**/*.spec.ts (only if selectors/flows must change; prefer no changes)

