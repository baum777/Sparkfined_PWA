## Learning (Lessons) — 00 Current UI (as implemented)

### What the user sees

- **Page shell**
  - Wrapped in `DashboardShell` with title “Lessons” and a short description about extracted wisdom.
  - Page root container: `data-testid="lessons-page"`.
- **Top row (two cards)**
  - **“Trading Lessons”** (glass card)
    - Icon badge (Book).
    - 4 stat tiles: **Total**, **High score**, **Avg WR**, **Trades**.
  - **“How Lessons Work”** (muted card)
    - Short explainer bullets and a CTA link: “Analyze Your Next Chart” → `/chart`.
- **Filters toolbar**
  - Label “Filters”.
  - Pills: **All Patterns** + one button per detected `pattern` from the lessons dataset.
- **Lesson Library card**
  - Title + helper description.
  - **Min Score** badge (percentage) + a **range slider** (`0..1`, step `0.05`).
  - Main content:
    - Loading: `StateView` loading (“Loading lessons...”)
    - Error: `StateView` error (“Failed to load lessons”)
    - Empty (after filtering): `StateView` empty (“No lessons yet. Trade more to accumulate wisdom!”)
    - Otherwise: vertical list of `LessonCard`s.
  - If `lessons.length === 0` (no data at all), an additional centered CTA appears: “Analyze Your First Chart” → `/chart`.

### Key states

- **Loading**: lessons are fetched via `useLessons()`, page remains fully mounted; only the library body swaps.
- **Error**: error state in the library body; no retry control on the page.
- **Empty**
  - **No lessons**: empty state + extra “Analyze Your First Chart” CTA block.
  - **Filtered to none**: empty `StateView` but the bottom CTA block may not show (depends on `lessons.length`).

### Primary user interactions

- **Pattern filter**
  - Click “All Patterns” to clear.
  - Click a pattern pill to filter (no multi-select).
- **Min score slider**
  - Drag range input to adjust confidence threshold.
- **CTAs**
  - Two links to `/chart` (top right card + optional bottom CTA).
- **Lesson reading**
  - Scroll the list; `LessonCard` is informational in this page (no click handler passed).

### Information scent (what’s obvious vs. hidden)

- **Obvious**
  - “This is a curated playbook from my outcomes” framing (title, description, score, win rate, sample size).
  - Immediate paths forward if empty (chart CTAs).
- **Less obvious**
  - What “pattern” means/how to create patterns (implied via “log patterns consistently”, but no direct deep link to journal/signals setup).
  - Whether lessons are actionable “today” vs. historical summaries (there is a “Next Drill” section per card, but no “start drill” action).

### UI composition details (LessonCard)

- **Dense card layout** (default)
  - Header: pattern name, “Updated X ago”, confidence percent.
  - Optional stats row: win rate, avg R:R, trades.
  - Sections: “When It Works”, “When It Fails”, “Checklist”, “DOs”, “DON’Ts”, “Next Drill”.
  - Score drives surface + text colors (bull / warn / tertiary).
- **Compact mode exists** (not used in LessonsPage)
  - If `onClick` is provided, it uses `role="button"` and `tabIndex=0` (but no explicit keyboard activation handler).

### Performance / responsiveness touchpoints

- `useMemo` for `filteredLessons`, `patterns`, and `stats` reduces recompute churn, but:
  - Changing the slider or pattern re-renders the full list area.
  - Rendering long lessons can be heavy (many sections + lists per card).
- No virtualization for the lesson list.
- No E2E coverage detected for Lessons (no `tests/e2e/*lessons*.spec.ts` in repo at time of writing).

