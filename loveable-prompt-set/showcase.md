---
TAB: Showcase
Allowed paths (strict):
- root/src/pages/IconShowcase.tsx
- root/src/pages/StyleShowcasePage.tsx
- root/src/pages/UXShowcasePage.tsx

Goal (conversion first):
Stabilize and polish Showcase pages to clearly label them as dev-only, normalize layout consistency, provide docs links, and improve icon grid utility.

Do:
1) IF you find instability/a11y gaps blocking polish: fix obvious issues where needed.
2) Apply these approved polish changes (minimal diff):
   - Add clear "Internal / dev-only" banner (copy + styling) so end users don't mistake for product UI
   - Normalize layout so Icons/UX pages align better with Style page (container + header pattern; prefer `DashboardShell` where appropriate)
   - Add compact "Docs" deep links to `docs/UI_STYLE_GUIDE.md`, `docs/DESIGN_TOKENS_STYLEGUIDE_DE.md`, and `docs/RESPONSIVE_GUIDELINES.md`
   - Improve icon grid UX: lazy-load images and add "copy filename/path" affordance
   - Add small "Jump to section" mini-nav (anchors) at top of Style/UX pages to reduce scroll friction

Guardrails:
- Keep existing `data-testid` stable: `icon-showcase-page`, `style-showcase-page`, `ux-showcase-page`
- Do not touch global styling/theming
- No new dependencies

Done when:
- Showcase clearly labeled as internal/dev-only
- Layout is consistent across pages
- Docs links are present and correct
- Icons page loads smoothly and supports quick copy of references
- Section navigation reduces scroll friction on long demo pages

Output:
- Touched files list + short change summary (no long explanation).
