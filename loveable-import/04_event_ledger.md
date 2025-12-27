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
| TelemetryEvents.JOURNAL_SAVE_MS | Submit Journal | src/... | src/... | ☐ |  |
| ... | ... | ... | ... | ☐ |  |

Legend:
✅ wired
⚠️ missing UI hook/component (must add)
❌ removed (not allowed unless explicitly approved)