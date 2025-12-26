## Showcase — 02 Loveable Prompts

### Prompt V0 (1:1 existing UI)

**Tab scope**: Showcase  
**Component scope**: Icons + Style + UX demo pages (no behavior changes)

**Allowed paths (strict)**:
- root/src/pages/IconShowcase.tsx
- root/src/pages/StyleShowcasePage.tsx
- root/src/pages/UXShowcasePage.tsx

**Task (atomic)**:
Reproduce and stabilize the existing Showcase pages without changing behavior. Fix only obvious a11y/consistency issues and avoid unrelated diffs.

**Guardrails**:
- Do not touch global styling/theming.
- Keep existing `data-testid` stable (`icon-showcase-page`, `style-showcase-page`, `ux-showcase-page`).

**Acceptance criteria**:
- Pages render as before; minor a11y issues improved; no scope creep.

---

### Prompt V1 (polish — implement approved changes with minimal diff)

**Tab scope**: Showcase  
**Component scope**: Dev-only clarity + layout consistency + docs links + icons utility

**Allowed paths (strict)**:
- root/src/pages/IconShowcase.tsx
- root/src/pages/StyleShowcasePage.tsx
- root/src/pages/UXShowcasePage.tsx

**Task (atomic)**:
Implement the approved Showcase polish changes:
1) Add a clear “Internal / dev-only” banner (copy + styling) so end users don’t mistake it for product UI.
2) Normalize layout so Icons/UX pages align better with the Style page (container + header pattern; prefer `DashboardShell` where appropriate).
3) Add compact “Docs” deep links to `docs/UI_STYLE_GUIDE.md`, `docs/DESIGN_TOKENS_STYLEGUIDE_DE.md`, and `docs/RESPONSIVE_GUIDELINES.md`.
4) Improve icon grid UX: lazy-load images and add a “copy filename/path” affordance.

**Guardrails**:
- No new dependencies.
- No edits outside Allowed paths.
- Keep existing `data-testid` stable.

**Acceptance criteria**:
- Showcase is clearly labeled as internal.
- Layout is consistent across pages.
- Docs links are present and correct.
- Icons page loads smoothly and supports quick copy of references.

---

### Prompt V2 (polish + micro-upgrade — still incremental)

**Tab scope**: Showcase  
**Component scope**: V1 + one tiny team-velocity boost

**Allowed paths (strict)**:
- root/src/pages/IconShowcase.tsx
- root/src/pages/StyleShowcasePage.tsx
- root/src/pages/UXShowcasePage.tsx

**Task (atomic)**:
Apply V1 improvements, then add exactly one micro-upgrade:
- Add a small “Jump to section” mini-nav (anchors) at the top of Style/UX pages to make the long page easier to scan.

**Guardrails**:
- Exactly one micro-upgrade; keep it lightweight and non-intrusive.

**Acceptance criteria**:
- Navigation reduces scroll friction on long demo pages.

