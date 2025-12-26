## Journal — 02 Loveable Prompts

### Prompt V0 (1:1 existing UI)

**Tab scope**: Journal  
**Component scope**: Journal page layout + existing v2 form/result/history (no behavior changes)

**Allowed paths (strict)**:
- root/src/pages/ | JournalPage.tsx
- root/src/features/journal-v2/components/*
- root/src/features/journal/*
- root/src/components/journal/*

**Task (atomic)**:
Reproduce and stabilize the current Journal UI without changing behavior. Fix only obvious a11y/consistency issues (labels, focus, role semantics) and ensure the existing autosave + submit flows remain intact.

**UI atoms / patterns to use**:
- Existing `DashboardShell`, `Card`, `Badge`, `Button`, `EmptyState`, `ListRow`, `StateView`
- Keep all existing `data-testid` attributes unchanged

**Guardrails**:
- No unrelated diffs, no refactors, no route changes.
- No new timers/intervals; keep existing autosave logic unchanged.
- No hardcoded colors; use existing tokens/utilities.
- Ask questions before coding if anything about behavior is unclear.

**Acceptance criteria**:
- The page renders with the same sections and interactions as before.
- Keyboard focus behavior remains correct (templates sheet, tag input, submit/reset).
- No changes to existing `data-testid` values.

---

### Prompt V1 (polish — implement approved changes with minimal diff)

**Tab scope**: Journal  
**Component scope**: Action bar guidance + required-field UX + templates UX alignment + AI notes status copy

**Allowed paths (strict)**:
- root/src/pages/ | JournalPage.tsx
- root/src/features/journal-v2/components/ | JournalInputForm.tsx
- root/src/features/journal/ | AINotesGenerator.tsx / TemplateBottomSheet.tsx
- root/src/components/journal/templates/*

**Task (atomic)**:
Implement the approved Journal polish changes:
1) Add a compact “degen → mastery” progress cue near the sticky action bar (Step 1/3: State → Thesis → Review).
2) Improve required-field completion:
   - inline helper/error visibility
   - on submit, focus/jump to the first invalid required field.
3) Unify templates UX so desktop and mobile follow a consistent flow/mental model (discovery → preview → apply) while keeping overwrite semantics explicit.
4) Make AI notes status explicit (demo/offline/real) with calm, trust-building messaging.

**UI atoms / patterns to use**:
- Existing section headings and badges
- Existing template picker/sheet components (no new template system)
- Existing `Button` and `Textarea` patterns

**Guardrails**:
- No edits outside Allowed paths.
- Don’t change autosave timing behavior or add new timers.
- Don’t rename/remove existing `data-testid`.
- Avoid new network calls or additional pipeline runs.
- Ask questions before coding if anything is unclear.

**Acceptance criteria**:
- Progress cue appears near the primary CTA and is readable on mobile.
- Submitting with missing required fields:
  - shows inline messaging
  - focuses first invalid field
  - does not run the journal pipeline.
- Templates UX is consistent across breakpoints; apply semantics remain explicit.
- AI notes section clearly communicates demo/offline/real state with calm messaging.

---

### Prompt V2 (polish + micro-upgrade — still incremental)

**Tab scope**: Journal  
**Component scope**: Same as V1, plus a small conversion micro-upgrade

**Allowed paths (strict)**:
- root/src/pages/ | JournalPage.tsx
- root/src/features/journal-v2/components/*
- root/src/features/journal/*
- root/src/components/journal/templates/*

**Task (atomic)**:
Apply V1 improvements, then add one micro-upgrade that increases completion without scope creep:
- Add a lightweight “completion readiness” cue near the CTA (e.g., “2/2 required fields complete” for Thesis) that updates based on validation state—no new state stores, no telemetry, no new routes.

**UI atoms / patterns to use**:
- Existing badges/meta text styles
- Existing validation state already computed in the form

**Guardrails**:
- No new stores or cross-tab changes.
- No new timers or intervals; no render-loop risk.
- Keep copy short; avoid adding more than one new cue element.
- Ask questions before coding if anything is unclear.

**Acceptance criteria**:
- Shows exactly one readiness cue that helps users finish “Run Journal”.
- Validation and submit behavior remain correct and unchanged otherwise.
- No new performance regressions (no extra saves, no extra analysis runs).
