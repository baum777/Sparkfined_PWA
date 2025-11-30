---
title: "Production Readiness PR Template"
sources:
  - docs/features/production-ready.md
  - docs/features/next-up.md
  - tests/checklists/market-analyze.md
  - tests/checklists/journal-workspace.md
  - tests/checklists/signal-matrix.md
  - tests/checklists/replay-lab.md
  - tests/checklists/notifications-center.md
---

## Summary
- Feature / scope:
- Linked ticket(s):
- Risk surface:

## Checklist
- [ ] Linked checklist(s) run and attached (paste command logs or link artifacts)
- [ ] `pnpm lint`
- [ ] `pnpm typecheck`
- [ ] `pnpm test`
- [ ] `pnpm playwright test` (or equivalent targeted suite)
- [ ] `pnpm build`
- [ ] Telemetry/observability updated or confirmed
- [ ] Docs updated (`docs/features/*` + relevant README)
- [ ] Secrets handled (no new secrets in client bundles)

## Validation Evidence
```
# paste command outputs or link CI logs
```

## Observability / Dashboards
- Metrics / logs touched:
- Follow-up dashboards or alerts:

## Rollout Plan
- Feature flag / toggle (if any):
- Backward compatibility considerations:
- Post-deploy validation steps:

