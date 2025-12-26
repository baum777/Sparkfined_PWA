## Working Paper — 80 Assets & Branding

### Purpose

Keep the app’s visual identity crisp and trustworthy (icons, logos, typography, motion) while staying performance-lean and consistent with the “degen → mastery” narrative.

### Relevant Paths (from Cluster Map)

- root/public/*
- root/docs/core/design/*
- root/src/pages/ | IconShowcase.tsx / StyleShowcasePage.tsx / UXShowcasePage.tsx
- root/src/components/__tests__/Logo.test.tsx

### What “Done” means

- Brand assets render sharply across DPRs and themes.
- Icons/logos are used consistently across shell + key tabs.
- No unnecessary asset bloat (size, count, formats).

### Risks / Guardrails

- Don’t introduce large unoptimized images or duplicate icon sets.
- Avoid changing public asset paths that the PWA/manifest depends on.
- Keep branding changes incremental; avoid “rebrand” scope creep.

### Loveable Prompt Guardrails

- Prompts must specify the exact asset(s) and exact usage points.
- Allowed paths should be limited to `public/` and the consuming components.
- Acceptance criteria must include performance constraints (size budget / no extra requests if possible).

### Checklist

- **Audit asset usage** (where each logo/icon appears).
- **Prefer SVG where possible** (sharp + small), otherwise optimized PNG.
- **Confirm PWA manifest** and icons remain valid.
- **Avoid duplication**: reuse existing assets before adding new.
- **Verify contrast** and clarity in dark surfaces.

