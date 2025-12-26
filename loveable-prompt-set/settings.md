---
TAB: Settings
Allowed paths (strict):
- root/src/pages/SettingsPage.tsx
- root/src/pages/SettingsContent.tsx
- root/src/features/settings/*
- root/src/components/settings/*
- root/tests/e2e/settings/data-export.spec.ts (only if selectors must be updated; prefer no changes)

Goal (conversion first):
Stabilize and polish Settings to guide users through essential setup (theme, wallet monitoring, export) with clear stub labeling, safe destructive actions, and setup completeness tracking.

Do:
1) IF you find instability/a11y gaps blocking polish: fix obvious issues where needed.
2) Apply these approved polish changes (minimal diff):
   - Clearly label stub/mock actions in copy (or remove from primary paths)
   - Add "degen → mastery" guidance by emphasizing top 3 setup essentials: theme, wallet monitoring, export
   - Ensure export/import UI exposes stable `data-testid` selectors expected by E2E and improve success feedback clarity
   - Make factory reset require typed confirmation instead of timing-based double click
   - Add compact "Setup completeness" cue at top (e.g., 0/3, 1/3, 2/3, 3/3) based on whether essentials are configured, no telemetry

Guardrails:
- Don't rename existing `data-testid`; add missing ones as needed
- No new global config changes
- No new network calls, no extra timers
- Keep changes minimal and localized

Done when:
- Stubbed controls are clearly marked in UI
- Top 3 essentials are visually emphasized and easy to find
- Export/import shows clear "success" feedback; E2E selectors remain stable
- Factory reset requires typed confirmation
- Setup completeness cue is readable and uncluttered

Output:
- Touched files list + short change summary (no long explanation).
