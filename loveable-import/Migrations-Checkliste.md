
# Workingplan - logic
* **Sparkfined_PWA bleibt main / Source of Truth**
* Sparkfined übernimmt **Darstellung/UI von Lovable**
* **Sparkfined Design System (Tokens/Primitives/Patterns)** bleibt maßgeblich und wird **auf das Lovable-UI angewendet**
* **Settings & bestehende Inhalte/Funktionen** sollen **inhaltlich bestehen bleiben**
* **Alle existierenden Events** müssen weiterhin feuern; wenn im Lovable-UI kein passender Hook/Komponent existiert → **explizit markieren** als “Missing / to add”

---

# Migration Checklist: Sparkfined_PWA übernimmt Lovable UI (mit Sparkfined Design System)

## Phase 0 — Guardrails & Arbeitsweise festziehen

* [ ] **Branch-Strategie**: `ui/loveable-migration` (ein Branch für die gesamte Migration)
* [ ] **Scope-Lock**: “UI Replace + Wiring only” → keine fachlichen Feature-Adds außer **Missing Events/Bindings**, die notwendig sind
* [ ] **TestID-Vertrag**: bestehende `data-testid` in Sparkfined **nicht umbenennen/entfernen**
* [ ] **No-drive-by Refactors**: jede Änderung muss einer dieser Kategorien dienen:

  1. UI-Replace  2) Design-Adapter  3) Wiring/Data  4) Events  5) Tests/Regression

**Output-Artefakte (im Repo anlegen, bevor du startest):**

* [ ] `./loveable-finishing/MIGRATION_README.md`
* [ ] `./loveable-finishing/01-ui-scope.md`
* [ ] `./loveable-finishing/02-route-map.md`
* [ ] `./loveable-finishing/03-data-contracts.md`
* [ ] `./loveable-finishing/04-event-ledger.md`
* [ ] `./loveable-finishing/05-test-ledger.md`

---

## Phase 1 — UI Scope definieren (was wird ersetzt, was bleibt)

### 1.1 “Replace Sets” festlegen

* [ ] **UI-only Replace (typisch)**:

  * `src/pages/**`
  * `src/features/**` (nur UI-nahe Teile)
  * `src/components/**`
  * `src/styles/**`
  * `public/**` (nur UI-assets: icons, images, manifest wenn kompatibel)
* [ ] **Bleibt unangetastet / nur adaptieren**:

  * `src/api/**`, `src/lib/**` (Business, fetchers, domain logic)
  * `src/store/**` (State Ownership)
  * Settings-Inhalte/Optionen/Flows (dürfen neu aussehen, aber **müssen dieselbe Substanz behalten**)

### 1.2 “Keep Sets” für Settings konkretisieren

* [ ] Liste der **Settings-Sections**, die inhaltlich identisch bleiben müssen:

  * Theme / Token Usage / Export/Import / Danger Zone / Wallet Monitoring / … (was bei euch existiert)
* [ ] “Allowed UI Changes” in Settings:

  * Reihenfolge / visuelle Hierarchie / Komponententyp (Card/Accordion) OK
  * **Semantik/Funktion/Ergebnis** muss gleich bleiben

**Deliverable:** `loveable-finishing/01-ui-scope.md` mit:

* Replace Sets (Ordnerliste)
* Keep Sets
* “Settings must remain” Liste

---

## Phase 2 — Design System als “Adapter Layer” festziehen

Ziel: Lovable UI soll **so aussehen**, wie es Lovable vorgibt, aber **mit Sparkfined Tokens/Primitives** realisiert sein.

### 2.1 Design Source of Truth (Sparkfined)

* [ ] Token-Dateien/Theme-Mechanik identifizieren:

  * CSS vars / Tailwind mapping / theme provider (wo auch immer bei euch definiert)
* [ ] UI Primitives festlegen (Sparkfined):

  * Button, Card/MetricCard, Input/Select, Banner/StateView, Modal/Sheet, PageHeader/Container

### 2.2 “No new colors” Regel (Hard Lock)

* [ ] Lint/Check-Regel oder Code Review Regel: **keine hardcoded Farben** in neu importiertem Lovable-UI
* [ ] Wenn Lovable UI eigene Farben nutzt → **mappen auf Tokens** statt neue definieren

**Deliverable:** `loveable-finishing/Design-Adapter.md` (kurz):

* Token-Namen
* Primitives
* “Do/Don’t” Beispiele (z.B. keine Hex-Farben)

---

## Phase 3 — Route & Tab Mapping (UI-Struktur übernehmen, Routing stabil halten)

### 3.1 Route Map erstellen

* [ ] Tabelle: **Sparkfined Route → Lovable Screen → Ziel-Komponent**
* [ ] Primary/Secondary Policy einbauen:

  * Primary Tabs bleiben: Dashboard, Journal, Learn/Lessons, Chart, Alerts, Settings
  * Secondary: Watchlist + Oracle
  * Replay = Subroute von Chart (Chart active state)

**Deliverable:** `loveable-finishing/02-route-map.md`

### 3.2 Navigation contract

* [ ] Desktop: Sidebar + Advanced collapsible
* [ ] Mobile: BottomNav für Primary + “More/Advanced” Sheet für Secondary
* [ ] Active-state Regeln: Replay zählt zu Chart

---

## Phase 4 — UI Import/Replace aus Lovable (ohne Wiring kaputt zu machen)

### 4.1 Import-Strategie

* [ ] Lovable UI zunächst **in eine “staging area”** im Sparkfined-Repo holen (temporär), z.B.:

  * `./loveable-finishing/_incoming-ui/**`
* [ ] Danach **gezielt** in Replace Sets übernehmen (nicht blind “alles drüber”)

### 4.2 Konflikt-Regeln (entscheidend)

* [ ] Wenn Lovable-Komponente existiert, aber Sparkfined-Logik braucht:

  * UI wird übernommen → intern wird auf Sparkfined hooks/stores umgestellt (**Adapter Pattern**)
* [ ] Wenn Sparkfined-Komponente funktional wichtig ist (Settings, Export, Danger Zone):

  * Keep the flow, apply Lovable layout/patterns

---

## Phase 5 — Datenflüsse & State Ownership neu verdrahten (Tab für Tab)

Für **jeden Tab** ein Mini-Contract (sehr wichtig für sauberes Wiring):

**Pro Tab dokumentieren:**

* [ ] Data Inputs: welche Stores/Hooks/API?
* [ ] Writes: welche Actions/Mutations?
* [ ] Side-effects: caching, refresh, debounce?
* [ ] States: loading/error/empty Standard (StateView)

**Deliverable:** `loveable-finishing/03-data-contracts.md` (je Tab ein Abschnitt)

### Tab-Reihenfolge fürs Wiring (empfohlen)

1. Shell/Routes (damit alles erreichbar ist)
2. Dashboard (weil es Querverweise hat: holdings/trades)
3. Journal (Core)
4. Chart (+ Replay subroute)
5. Alerts
6. Lessons
7. Settings
8. Watchlist, Oracle

---

## Phase 6 — Event Ledger (alle bestehenden Events müssen weiter existieren)

Das ist dein Punkt 5: “Wenn kein Komponent existiert → markieren”.

### 6.1 Event-Inventar extrahieren

* [ ] Suche in Sparkfined nach Track/Telemetry-Aufrufen (z.B. `track`, `telemetry`, `emit`, `analytics`, `record*`)
* [ ] Baue eine Ledger Tabelle:

**Event Ledger Columns (Minimum):**

* Event Name
* Source Tab/Feature
* Trigger UI (Button/Form/Auto)
* Required payload keys
* Current file path(s)
* New file path (nach UI replace)
* Status: ✅ wired / ⚠️ missing UI hook / ❌ not found
* Notes (z.B. “needs new component”)

**Deliverable:** `loveable-finishing/04-event-ledger.md`

### 6.2 Missing Events / Missing Components

* [ ] Wenn Lovable UI kein entsprechendes UI-Element hat:

  * Status = ⚠️ missing UI hook
  * Add “to add” mini task + vorgeschlagener Platz (welche Datei / welcher Komponent)

---

## Phase 7 — Test Ledger & Stabilitätsvertrag

### 7.1 Tests als Vertrag definieren

* [ ] Liste kritischer Flows (Smoke):

  * Navigation
  * Dashboard shows holdings/trades
  * Journal create/validate/save
  * Chart CTA → Journal
  * Alerts create
  * Settings export + reset confirm
  * Watchlist open chart
  * Oracle mark read

### 7.2 Test Ledger

* [ ] Welche Tests existieren schon (Vitest/E2E)
* [ ] Welche `data-testid` müssen stabil bleiben
* [ ] Wo Änderungen unvermeidbar sind → minimal, nur Assertions

**Deliverable:** `loveable-finishing/05-test-ledger.md`

---

## Phase 8 — Integration Runbook (pro Tab: Replace → Design Adapter → Wiring → Events → Tests)

Für jeden Tab iterativ:

1. **UI Replace** (Lovable layout/komponenten rein)
2. **Design Adapter** (Tokens/Primitives, keine hardcoded colors)
3. **Wiring** (Sparkfined hooks/stores/APIs)
4. **Events** (Ledger Items dieses Tabs ✅ machen)
5. **Tests** (Smoke + ggf. minimal E2E fix)

**Definition of Done pro Tab:**

* [ ] Layout entspricht Lovable Darstellung
* [ ] Design entspricht Sparkfined System (Tokens/Primitives)
* [ ] Alle Data Inputs/Writes funktionieren
* [ ] Alle Tab-Events feuern (oder missing dokumentiert)
* [ ] Tests/Smoke bestanden

---
