# Sparkfined ← Loveable UI Migration (UI Replace + Design System + Wiring + Telemetry)

## TL;DR
- Sparkfined_PWA bleibt Source of Truth (Routes/Navigation/Stores/Engines).
- Loveable liefert UI Layout/Komponenten (Pages + Components).
- Sparkfined Design System bleibt Source of Truth (Tokens/Primitives/Patterns).
- Protected Paths dürfen NICHT überschrieben werden.
- Alle bestehenden Telemetry.log Events müssen weiterhin feuern; Missing Hooks/Components markieren.

---

## 0) Guardrails (HARTE REGELN)
- [ ] Protected Paths niemals überschreiben (siehe 03_ui_replace_scope.md).
- [ ] src/config/navigation.ts & src/routes/RoutesRoot.tsx = Source of Truth (nur minimal anpassen, nicht ersetzen).
- [ ] Keine neuen Timer/Polling hinzufügen.
- [ ] Keine neuen Routes/URLs (außer Aliases: /replay → Chart replay mode; / bleibt Redirect auf /dashboard).
- [ ] data-testid: niemals umbenennen/entfernen.
- [ ] Telemetry: TelemetryService.ts bleibt unverändert; Telemetry.log muss weiter aufgerufen werden.

---

## 1) Workspace Setup
- [ ] Create folder: ./loveable-import/
- [ ] Place:
  - loveable-ui.zip
  - 00_migration_checklist.md (this file)
  - 01_contracts.md (Settings/Chart/Journal/Dashboard “identisch” Specs)
  - 02_route_map.md
  - 03_ui_replace_scope.md
  - 04_event_ledger.md
  - 05_test_ledger.md
- [ ] Unzip Loveable UI into: ./loveable-import/_incoming/

---

## 2) Route Contract (Sparkfined URLs = Truth)
- [ ] Keep: /dashboard, /journal, /lessons, /chart, /alerts, /settings, /watchlist, /oracle
- [ ] Root route: "/" redirects to "/dashboard" (keep existing behavior)
- [ ] Learn/Lessons: Loveable Learn UI mounts at Sparkfined /lessons
- [ ] Replay:
  - /replay is alias route (optional) that mounts ChartPage in replay mode
  - Replay is not a top-level tab; Chart must be active state for Replay

Deliverable: ./loveable-import/02_route_map.md

---

## 3) UI Replace Scope (Loveable → Sparkfined)
### Allowed to replace/adapt (UI-only)
- [ ] src/pages/*Page.tsx
- [ ] src/components/** (UI components)
- [ ] src/features/** (UI-only parts)
- [ ] src/styles/**

### Never overwrite (Protected)
- [ ] src/api/**
- [ ] src/lib/data/**
- [ ] src/lib/wallet/**
- [ ] src/lib/alerts/triggerEngine.ts
- [ ] src/lib/replay/ohlcReplayEngine.ts
- [ ] src/lib/db.ts
- [ ] src/lib/datastore.ts
- [ ] src/lib/ai/**
- [ ] src/lib/journal/JournalService.ts
- [ ] src/lib/export/**
- [ ] src/lib/TelemetryService.ts
- [ ] src/store/**Store.ts
- [ ] src/store/eventBus.ts
- [ ] src/store/gamificationStore.ts
- [ ] src/state/**
- [ ] vite.config.ts / playwright.config.ts / vercel.json / service worker / manifest

Deliverable: ./loveable-import/03_ui_replace_scope.md

---

## 4) Design System Application (Sparkfined tokens/primitives)
Goal: Loveable layout, Sparkfined styling system.
- [ ] No hardcoded colors in imported UI.
- [ ] Use Sparkfined tokens + primitives.
- [ ] If Loveable uses shadcn/ui primitives, they must be “style-adapted” to Sparkfined tokens.

Definition:
- Tokens: (Sparkfined) Tailwind + CSS vars mapping
- Primitives: Button/Card/Input/Select/Modal/Sheet/StateView/PageHeader
- Patterns: EmptyState, ErrorBanner, Skeleton, ListRow, KPI tiles

---

## 5) Adapter Strategy (required)
Loveable has hooks in /features/* and /hooks/*.
Sparkfined keeps stores/engines. Therefore:
- [ ] Do NOT import Loveable business logic hooks as-is.
- [ ] Create Adapter hooks that match Loveable expected API but call Sparkfined stores/services.

Example: useTradesStore() adapter wraps useJournalStore().

Deliverable: ./loveable-import/ADAPTER_CATALOG.md

---

## 6) Telemetry Integration (must be complete)
- [ ] Inventory all Telemetry.log usages in Sparkfined
- [ ] For each event: ensure equivalent UI trigger exists after UI replace
- [ ] If trigger missing in Loveable UI: mark ⚠️ in ledger and create "Missing UI hook/component" task

Ledger columns:
Event | Trigger UI | Old path | New path | Status ✅/⚠️ | Notes

Deliverable: ./loveable-import/04_event_ledger.md

---

## 7) Tab-by-Tab Migration Runbook (order)
Order:
1) Shell/Navigation (UI only; keep nav.ts/RoutesRoot.tsx truth)
2) Dashboard
3) Journal
4) Chart (+ Replay integration)
5) Alerts
6) Lessons
7) Settings
8) Watchlist
9) Oracle

Per tab:
- [ ] Replace UI layout from Loveable mapping
- [ ] Apply Sparkfined primitives/tokens
- [ ] Wire Sparkfined data flows (stores/services)
- [ ] Wire Telemetry events
- [ ] Run tests (typecheck + unit + build; E2E if available)
- [ ] Update ledgers (event/test)

---

## 8) Verification (global)
- [ ] pnpm typecheck
- [ ] pnpm vitest run
- [ ] pnpm build
- [ ] Smoke flows: Dashboard → Journal → Chart → Alerts → Settings
- [ ] Telemetry export still works (CSV/JSON)
- [ ] No route regressions: "/" still redirects to "/dashboard", /replay aliases Chart replay mode