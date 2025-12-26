---
TAB: Journal
Allowed paths (strict):
- root/src/pages/JournalPage.tsx
- root/src/features/journal-v2/components/*
- root/src/features/journal/*
- root/src/components/journal/*

Goal (conversion first):
Stabilize and polish Journal to guide users through "degen → mastery" progression with clear required-field completion, unified templates UX, and transparent AI notes status.

Do:
1) IF you find instability/a11y gaps blocking polish: fix obvious issues (labels, focus, role semantics) where needed.
2) Apply these approved polish changes (minimal diff):
   - Add compact "degen → mastery" progress cue near sticky action bar (Step 1/3: State → Thesis → Review)
   - Improve required-field completion: inline helper/error visibility, on submit focus/jump to first invalid field
   - Unify templates UX (desktop + mobile) with consistent discovery → preview → apply flow, keep overwrite semantics explicit
   - Make AI notes status explicit (demo/offline/real) with calm, trust-building messaging
   - Add lightweight "completion readiness" cue near CTA (e.g., "2/2 required fields complete" for Thesis), updates based on validation state, no new stores/telemetry

Guardrails:
- Keep data-testid stable (never rename/remove)
- Don't change autosave timing behavior or add new timers
- No new network calls or additional pipeline runs
- Avoid new state stores or cross-tab changes

Done when:
- Progress cue appears near primary CTA, readable on mobile
- Submitting with missing required fields shows inline messaging and focuses first invalid field
- Templates UX is consistent across breakpoints with explicit apply semantics
- AI notes section clearly communicates demo/offline/real state
- Readiness cue helps users finish "Run Journal" without performance regressions

Output:
- Touched files list + short change summary (no long explanation).
