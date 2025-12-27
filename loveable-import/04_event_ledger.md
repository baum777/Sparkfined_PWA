# Event Ledger (Telemetry.log) — Status Tracker

## How to build the ledger (quick)
1) Ripgrep all Telemetry.log calls:
   rg "Telemetry\.log\(" src -n
2) For each occurrence:
   - note event constant/name
   - note UI trigger and file path
3) During migration:
   - ensure new Loveable UI triggers call the same Telemetry.log (same event)
   - if UI trigger doesn't exist → mark ⚠️ Missing UI hook/component

---

## Ledger
| Event | Trigger UI | Old Path | New Path | Status | Notes |
|---|---|---|---|---|---|
| `market.provider.used` | Market provider chain resolves | `src/lib/data/marketOrchestrator.ts` | `src/lib/data/marketOrchestrator.ts` | ✅ | Preserved (no migration touch) |
| `ui.advanced_insight.opened` | Advanced Insight opened | `src/features/analysis/advancedInsightTelemetry.ts` | `src/features/analysis/advancedInsightTelemetry.ts` | ✅ | Preserved (no migration touch) |
| `ui.advanced_insight.tab_switched` | Advanced Insight tab switched | `src/features/analysis/advancedInsightTelemetry.ts` | `src/features/analysis/advancedInsightTelemetry.ts` | ✅ | Preserved (no migration touch) |
| `ui.advanced_insight.field_overridden` | Advanced Insight field override | `src/features/analysis/advancedInsightTelemetry.ts` | `src/features/analysis/advancedInsightTelemetry.ts` | ✅ | Preserved (no migration touch) |
| `ui.advanced_insight.saved` | Advanced Insight saved | `src/features/analysis/advancedInsightTelemetry.ts` | `src/features/analysis/advancedInsightTelemetry.ts` | ✅ | Preserved (no migration touch) |
| `ui.advanced_insight.reset` | Advanced Insight reset field | `src/features/analysis/advancedInsightTelemetry.ts` | `src/features/analysis/advancedInsightTelemetry.ts` | ✅ | Preserved (no migration touch) |
| `ui.advanced_insight.reset_all` | Advanced Insight reset all | `src/features/analysis/advancedInsightTelemetry.ts` | `src/features/analysis/advancedInsightTelemetry.ts` | ✅ | Preserved (no migration touch) |
| `ui.advanced_insight.unlock_clicked` | Advanced Insight unlock CTA | `src/features/analysis/advancedInsightTelemetry.ts` | `src/features/analysis/advancedInsightTelemetry.ts` | ✅ | Preserved (no migration touch) |

Legend:
✅ wired
⚠️ missing UI hook/component (must add)
❌ removed (not allowed unless explicitly approved)