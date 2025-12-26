## Learning (Lessons) — 01 Polish Suggestions (approved)

### Approved changes

1) **Clarify “how to unlock lessons” (degen → mastery loop)**
   - Add a direct CTA to the surface that creates lessons (Journal/Signals), so users understand the prerequisite immediately.

2) **Add quick sort + visible active filters**
   - Provide a simple sort switch (e.g., Top confidence / Recent / Most impactful) and show active filters as chips for clarity.

3) **Improve min-score slider accessibility**
   - Add an explicit label, readable current value, and a keyboard hint; ensure focus style is obvious.

4) **Make “Next Drill” actionable (lightweight)**
   - Add a “Start next drill” action that routes users to the most relevant next step (e.g., open Chart, open Journal, or start a focused review ritual) without new data sources.

### Rationale (conversion/usability first)
- **(1)** Converts confusion into a guided habit loop (log → learn → apply).
- **(2)** Helps users find value fast when the list grows.
- **(3)** Improves a11y and reduces “mystery control” friction.
- **(4)** Turns reading into action, reinforcing mastery progression.

### Risks / guardrails
- Avoid introducing new routes or URL sync.
- Keep the page lightweight (no new heavy renders; avoid list virtualization unless truly needed).
- If you make `LessonCard` interactive, ensure keyboard activation works (not only `tabIndex`).

### Acceptance criteria (testable)
- **(1)** Users can clearly discover how to unlock lessons and navigate there in one click.
- **(2)** Sorting and filtering are obvious; “clear” is easy; list content updates correctly.
- **(3)** Slider is labeled and keyboard usable; value is visible.
- **(4)** Each lesson provides a clear next action that does not require additional backend work.

### Affected paths (strict, from cluster map)
- root/src/pages/LessonsPage.tsx
- root/src/components/signals/LessonCard.tsx
