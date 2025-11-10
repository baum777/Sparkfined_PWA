# Feature → Events Mapping

Vollständige Zuordnung aller Features zu ihren Telemetrie-Events.

**Workshop Status:** ✅ Abgeschlossen
**Implementation Status:** 1 von 6 Features vollständig implementiert

---

## ✅ Feature 5: Chart Crosshair (IMPLEMENTIERT)

**Status:** Production-Ready
**Files:** 18 (Core + Tests + Docs)
**Cost Savings:** 87%

### Events
- `chart.crosshair_agg` (Analytics) - Aggregated activity
- `chart.crosshair_move` (Local only) - Never sent to analytics

### Documentation
- Event Catalog: `docs/event-catalog/CROSSHAIR.md`
- Implementation: `docs/telemetry/crosshair-implementation.md`
- Monitoring: `docs/monitoring/prometheus-alerts.yml`

---

## 📋 Feature 1-4: Definiert, Ready for Implementation

### Feature 1: Screenshot Upload & Analysis
**Events:** 6 total (4 A-priority, 2 B-priority)
**Estimated Cost:** $3k/month

### Feature 2: Watchlist Management  
**Events:** 7 total (4 A-priority, 3 B-priority)
**Estimated Cost:** $5k/month

### Feature 3: Replay & Session Management
**Events:** 7 total (4 A-priority, 3 B-priority)
**Estimated Cost:** $2k/month

### Feature 4: Trade Execution & Order Management
**Events:** 7 total (4 A-priority, 3 B-priority)
**Estimated Cost:** $1k/month

---

## 📊 Gesamtübersicht

| Feature | Events | Status | Cost/Month |
|---------|--------|--------|------------|
| Crosshair | 2 | ✅ Implemented | $35k |
| Screenshot | 6 | 📋 Defined | $3k |
| Watchlist | 7 | 📋 Defined | $5k |
| Replay | 7 | 📋 Defined | $2k |
| Trading | 7 | 📋 Defined | $1k |
| Journal | 10 | ⏳ Partial | $4k |
| **TOTAL** | **39** | **1/6 Done** | **$50k** |

**Savings vs Raw Streaming:** 83% cost reduction ($300k → $50k)

---

**Next Steps:** Implementiere Features 2, 4, 1, 3 in dieser Reihenfolge (nach Priorität).
