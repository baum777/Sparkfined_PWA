---
TAB: Lessons
Allowed paths (strict):
- root/src/pages/LessonsPage.tsx
- root/src/components/signals/LessonCard.tsx

Goal (conversion first):
Stabilize and polish Lessons to guide users through unlock → filter → drill application with clear unlock paths, accessible filters, and actionable next steps.

Do:
1) IF you find instability/a11y gaps blocking polish: fix obvious issues (labels, focus, semantics) where needed.
2) Apply these approved polish changes (minimal diff):
   - Add clear "How to unlock lessons" callout with direct CTA to prerequisite surface (Journal/Signals)
   - Add small sort control and render active filters as chips (pattern + min score + sort), with easy reset
   - Improve slider accessibility (label, current value, keyboard hint, focus styles)
   - Add lightweight "Start next drill" action per lesson routing to next step (e.g., `/chart` or `/journal`), no new data sources
   - Add compact "Apply today" one-liner at top of each lesson (derived from existing text like checklist/DOs) to improve scanability, no new data fields

Guardrails:
- Do not introduce new data fetching; keep `useLessons()` usage intact
- No new routes; use existing navigation targets only
- If making card clickable, ensure Enter/Space activation works
- Avoid adding list virtualization unless proven necessary

Done when:
- Users immediately understand how lessons are generated and can navigate there
- Sort + filters are visible and reduce time-to-find high-value lesson
- Slider is clearly labeled and keyboard accessible
- Each lesson provides actionable next step
- Users can scan lessons faster with "Apply today" one-liner

Output:
- Touched files list + short change summary (no long explanation).
