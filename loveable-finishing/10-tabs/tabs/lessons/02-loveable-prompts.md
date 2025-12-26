## Learning (Lessons) — 02 Loveable Prompts

### Prompt V0 (1:1 existing UI)

**Tab scope**: Learning (Lessons)  
**Component scope**: Lessons library page + LessonCard rendering (no behavior changes)

**Allowed paths (strict)**:
- root/src/pages/LessonsPage.tsx
- root/src/components/signals/LessonCard.tsx

**Task (atomic)**:
Reproduce and stabilize the existing Lessons UI without changing behavior. Fix only obvious a11y/consistency issues (labels, focus, semantics) and avoid unrelated diffs.

**Guardrails**:
- Do not introduce new data fetching; keep the `useLessons()` usage intact.
- No new timers/intervals; no global styling refactors.

**Acceptance criteria**:
- Lessons page renders the same content as before.
- Keyboard focus is visible and the slider is usable via keyboard.

---

### Prompt V1 (polish — implement approved changes with minimal diff)

**Tab scope**: Learning (Lessons)  
**Component scope**: Unlock clarity + sort/filters clarity + slider a11y + actionable next drill

**Allowed paths (strict)**:
- root/src/pages/LessonsPage.tsx
- root/src/components/signals/LessonCard.tsx

**Task (atomic)**:
Implement the approved Lessons polish changes:
1) Add a clear “How to unlock lessons” callout with a direct CTA to the prerequisite surface (Journal/Signals).
2) Add a small sort control and render active filters as chips (pattern + min score + sort), with an easy reset.
3) Improve slider accessibility (label, current value, keyboard hint, focus styles).
4) Add a lightweight “Start next drill” action per lesson that routes to the next step (e.g. `/chart` or `/journal`) without new data sources.

**UI atoms / patterns to use**:
- Existing `Card` and `Button` patterns already used in the page
- Keep the “dense card” `LessonCard` readable; avoid adding more noise

**Guardrails**:
- No new routes; use existing navigation targets only.
- If you make any card clickable, ensure Enter/Space activation works (not just `tabIndex`).
- Avoid adding list virtualization unless proven necessary.

**Acceptance criteria**:
- Users immediately understand how lessons are generated and can navigate there.
- Sort + filters are visible and reduce time-to-find a high-value lesson.
- Slider is clearly labeled and keyboard accessible.
- Each lesson provides an actionable next step.

---

### Prompt V2 (polish + micro-upgrade — still incremental)

**Tab scope**: Learning (Lessons)  
**Component scope**: V1 + one tiny usability boost

**Allowed paths (strict)**:
- root/src/pages/LessonsPage.tsx
- root/src/components/signals/LessonCard.tsx

**Task (atomic)**:
Apply V1 improvements, then add exactly one micro-upgrade:
- Add a compact “Apply today” one-liner at the top of each lesson (derived from existing text like checklist/DOs) to improve scanability, without changing data models.

**Guardrails**:
- Exactly one micro-upgrade; no new data fields; no new dependencies.

**Acceptance criteria**:
- Users can scan lessons faster and pick one to apply in their next session.
