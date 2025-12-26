## Working Paper — 60 Events & Telemetry

### Purpose

Keep UI polish measurable: ensure critical conversion actions and friction points are observable (without adding noisy or expensive tracking), and keep event naming consistent across tabs.

### Relevant Paths (from Cluster Map)

- root/src/hooks/useEventLogger.ts
- root/src/lib/ | TelemetryService.ts / logger.ts
- root/src/store/eventBus.ts
- root/src/domain/telemetry.ts
- root/docs/archive/telemetry/schemas/*
- root/tests/unit/ | telemetry.test.ts / muxing.test.ts
- root/src/lib/journal/ | journalTelemetry.ts / journal-insights-telemetry.ts / journey-analytics.ts

### What “Done” means

- Key user actions (create/edit/save/export/search/select) have consistent, documented events where intended.
- Telemetry calls are low overhead and don’t cause render loops.
- Unit tests for telemetry mapping remain green.

### Risks / Guardrails

- Don’t add tracking inside render paths; use handlers/effects with guards.
- Avoid high-cardinality payloads (e.g., full text blobs).
- Don’t break existing schemas used by downstream analytics.

### Loveable Prompt Guardrails

- Prompts must specify the exact event(s) to add/change and why (conversion/usability signal).
- Allowed paths should be limited to the emitting component + telemetry module.
- Acceptance criteria must include “no new runtime loops” and “no performance regressions”.

### Checklist

- **Identify conversion events** per tab (primary CTA, success/failure).
- **Confirm schema** exists or define minimal new one (only when necessary).
- **Emit from handlers** (not render), with cleanup/guards in effects.
- **Keep payload lean** (IDs, enums, durations; avoid PII/text blobs).
- **Maintain tests** for event mapping and muxing.

