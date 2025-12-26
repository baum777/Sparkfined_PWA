## Showcase — 01 Polish Suggestions (approved)

### Approved changes

1) **Clarify “dev-only” intent**
   - Make it explicit these pages are internal labs (banner + copy), and (optionally) remove/hide them from production navigation.

2) **Normalize layout consistency**
   - Align pages to a consistent shell pattern (prefer `DashboardShell` where appropriate) so Showcase feels coherent.

3) **Add “Used in / links to docs” affordances**
   - Add small deep links from demo sections to canonical docs (tokens + responsive guidelines) to reduce hunting.

4) **Upgrade icons page utility**
   - Lazy-load icon images and add a quick “copy filename/path” action for faster verification.

### Rationale (conversion/usability first)
- Even for internal tools, reducing confusion and time-to-answer improves team velocity and reduces accidental exposure to end users.

### Risks / guardrails
- If you hide/remove from nav, ensure routes still exist for internal access and avoid breaking any e2e expectations.
- Avoid global CSS changes; keep changes scoped to the Showcase pages/navigation config only.

### Acceptance criteria (testable)
- **(1)** Users immediately see these pages are internal; no ambiguity.
- **(2)** Layout feels consistent across Icons/Style/UX (header, spacing, container).
- **(3)** Docs links are present and useful (tokens + responsive).
- **(4)** Icons load efficiently and users can copy references quickly.

### Affected paths (strict, from cluster map)
- root/src/pages/IconShowcase.tsx
- root/src/pages/StyleShowcasePage.tsx
- root/src/pages/UXShowcasePage.tsx
- root/src/config/navigation.ts (only if you hide from nav)
- root/src/routes/RoutesRoot.tsx (only if routing needs adjustment)

