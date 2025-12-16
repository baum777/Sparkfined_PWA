# App Shell — Navigation + Topbar + Action Panel

## Objective
Make AppShell the consistent frame for every page:
- topbar + rail + main + optional right panel/sheet host
- consistent padding/max-width rules inside main

## Required UX Behaviors
- Main content uses <Container> (max-width) by default unless page explicitly needs full-bleed (Chart).
- Global "SheetHost" lives at AppShell root so every page can open RightSheet.
- Ensure stacking contexts are correct: sheet above page, above chart canvas, etc.

## Implementation Steps
1) Locate AppShell layout components (Topbar, Rail, ActionPanel).
2) Add a global overlay portal root (e.g. <div id="overlay-root" />) if missing.
3) Ensure main has `id="main-content"` and skip-link works.
4) Normalize spacing:
   - pages that are not Chart should not be full width
   - set consistent vertical rhythm (header -> content)
5) Validate rail active state and icon hover/focus.

## Acceptance Criteria
- No overlay renders “inside” a scrolling container causing overlap (fix current Alerts "New alert" overlap bug).
- RightSheet uses the same host everywhere.
- AppShell still passes existing layout tests.

## Tests
- Update/add tests asserting overlay root exists and sheet renders above main.
