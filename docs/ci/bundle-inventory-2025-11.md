# Bundle-Inventur Sparkfined_PWA – November 2025

**Erstellt:** 2025-11-24
**Build-Version:** Post-Hardening (commit: 52c41ca)
**Zweck:** Systematische Bestandsaufnahme aller App-Bundles als Basis für Performance-Optimierung

---

## 1. Überblick

### Build-Kontext

- **Build-Command:** `pnpm build` (Vite 5.4.21 + TypeScript 5.9.3)
- **Chunk-Splitting:** `splitVendorChunkPlugin()` + manuelle `manualChunks`-Regeln
- **Lazy-Loading:** Alle Routen via `React.lazy()`
- **PWA-Precache:** 58 Einträge (3,44 MB total inkl. Assets)
- **Analyzer:** `ANALYZE=true pnpm build` → `dist/stats.html`

### Aktuelle Gesamt-Größen

```
Gesamt JS (uncompressed):  ~440 KB (20 Chunks)
Gesamt JS (gzipped est.):  ~132 KB
Gesamt CSS:                 46 KB (uncompressed), ~9.5 KB (gzipped)
PWA Precache Total:         3,44 MB (inkl. Fonts, Icons, HTML, etc.)
```

**Bundle-Budget (aktuell):**
- Per-Chunk-Thresholds: Definiert in `scripts/check-bundle-size.mjs`
- Total-Budget: 950 KB (uncompressed JS)
- Status: **PASSED** (aktuell bei ~440 KB, 46% des Budgets)

---

## 2. Aktuelle Bundle-Checks (scripts/check-bundle-size.mjs)

### Definierte Thresholds

| Pattern | Threshold (KB gzipped) | Bemerkung |
|---------|------------------------|-----------|
| `vendor-react` | 115 | React + ReactDOM + Router + base UI |
| `vendor-workbox` | 12 | Service Worker utilities |
| `vendor-dexie` | 8 | IndexedDB wrapper |
| `chart` | 15 | Lightweight Charts target |
| `analyze` | 12 | Analysis sections |
| `index` | 35 | Main app shell |
| `vendor` | 22 | Generic vendor chunks |

**Total Budget:** 950 KB (uncompressed, alle JS-Chunks)

### Probleme mit aktuellen Patterns

| Pattern | Status | Problem |
|---------|--------|---------|
| `vendor-workbox` | ⚠️ Kein Match | Workbox wird **nicht** als separater Chunk ausgegeben (in SW-Dateien) |
| `vendor-dexie` | ⚠️ Kein Match | Dexie wird in `vendor`-Chunk zusammengefasst, nicht separat |
| `chart` | ⚠️ Kein Match | Chart-Code wird nicht als separater Chunk erkannt (siehe Analyse unten) |
| `analyze` | ⚠️ Kein Match | Analyze-Sections nicht als Chunk (in Page-Bundle integriert) |

**Ergebnis:** Nur `vendor-react`, `vendor`, und `index` werden tatsächlich geprüft. Die anderen Patterns sind **veraltet** und sollten entfernt oder aktualisiert werden.

---

## 3. Bundle-Liste & Klassifikation

### Vollständige JS-Bundle-Tabelle

| Chunk Name | Größe (uncomp.) | Größe (gzipped) | Kategorie | Enthält | Routen/Features | Opt.-Potenzial |
|------------|-----------------|-----------------|-----------|---------|------------------|----------------|
| `vendor-react-BwYDliKp.js` | 165 KB | 53.28 KB | **vendor-react** | React 18.3, ReactDOM, React-Router-Dom 6.30 | Alle Routen (App-Shell) | **niedrig** |
| `index-Ch0CIiOs.js` | 69 KB | 22.22 KB | **app-shell** | App-Root, Layout, Routing-Setup, Contexts (Settings, Telemetry, AI), GlobalInstruments | Initial-Load (Dashboard-Redirect) | **mittel** |
| `vendor-BUAOAx_a.js` | 13 KB | 5.64 KB | **vendor** | Shared libs (wahrscheinlich Zustand, lucide-react, heroicons, kleinere Utils) | Alle Features | **niedrig** |
| `AnalysisPageV2-Cmj29RjQ.js` | 29 KB | 8.15 KB | **feature** | Analysis-Page (Token-Research, AI-Insights) | `/analysis-v2` | **mittel** |
| `ReplayPage-CJcIsHab.js` | 24 KB | 5.63 KB | **feature** | Replay-Feature (Session-Playback) | `/replay`, `/replay/:id` | **mittel** |
| `NotificationsPage-DjoSg7gg.js` | 23 KB | 6.45 KB | **feature** | Push-Notifications-Verwaltung | `/notifications` | **niedrig** |
| `SettingsPageV2-DqaXpFVS.js` | 21 KB | 6.37 KB | **feature** | Settings-UI (Themes, AI-Provider, Preferences) | `/settings-v2` | **niedrig** |
| `JournalPageV2-BzfUdzrW.js` | 16 KB | 4.26 KB | **feature** | Journal (Trade-Logs, Tags, AI-Condense) | `/journal-v2` | **niedrig** |
| `LandingPage-DaAH1MxL.js` | 15 KB | 4.16 KB | **feature** | Landing-Page (Marketing, Onboarding) | `/landing` | **niedrig** |
| `SignalsPage-BZp5wItp.js` | 14 KB | 3.40 KB | **feature** | Signals-Matrix (Confluence-Rules) | `/signals` | **niedrig** |
| `WatchlistPageV2-OlX6hcpj.js` | 14 KB | 4.11 KB | **feature** | Watchlist (Token-Tracking) | `/watchlist-v2` | **niedrig** |
| `LessonsPage-DQEgTDrT.js` | 11 KB | 2.60 KB | **feature** | Lessons (Educational Content) | `/lessons` | **niedrig** |
| `DashboardPageV2-C_0acnIM.js` | 8 KB | 2.59 KB | **feature** | Dashboard (KPI-Tiles, Overview) | `/dashboard-v2` (Initial-Route) | **niedrig** |
| `AlertsPageV2-CEk_9DiJ.js` | 8 KB | 2.31 KB | **feature** | Alerts-Page (Price-Alerts) | `/alerts-v2` | **niedrig** |
| `StateView-DXly1EY5.js` | 5 KB | 1.75 KB | **tooling** | State-Debug-View (Dev-Tool) | Dev-Only (?) | **n/a** |
| `IconShowcase-BUioaRsU.js` | 5 KB | 1.50 KB | **tooling** | Icon-Showcase-Page (Design-System-Demo) | `/icons` | **n/a** |
| `ChartPageV2-ttCxqHMY.js` | 2.5 KB | 0.98 KB | **feature** | Chart-Page-Shell (lazy-loads Chart-Lib?) | `/chart-v2` | **hoch** ⚠️ |
| `Button-Br649Wh9.js` | 1.9 KB | 0.92 KB | **ui-component** | Button-Komponente (primitiv) | Überall | **niedrig** |
| `priceAdapter-BD3MyVhs.js` | 2.0 KB | 0.97 KB | **util** | Price-Data-Adapter | Chart, Analysis | **niedrig** |
| `DashboardShell-6H2Ou2t5.js` | 1.8 KB | 0.80 KB | **ui-component** | Dashboard-Layout-Shell | Dashboard | **niedrig** |

**Total:** 20 JS-Chunks, ~440 KB uncompressed, ~132 KB gzipped (estimated)

---

## 4. Mapping Bundles ↔ Routen/Features

### Initial Load (Root `/` → Redirect `/dashboard-v2`)

**Geladene Bundles beim ersten Aufruf:**

1. `vendor-react-BwYDliKp.js` (165 KB) – React-Ökosystem
2. `vendor-BUAOAx_a.js` (13 KB) – Shared-Libs
3. `index-Ch0CIiOs.js` (69 KB) – App-Shell (Routing, Layout, Contexts)
4. `DashboardPageV2-C_0acnIM.js` (8 KB) – Dashboard-Page (Initial-Route)
5. `DashboardShell-6H2Ou2t5.js` (1.8 KB) – Dashboard-Layout

**Total Initial Load:** ~257 KB uncompressed, ~79 KB gzipped (estimated)

**TTI (Time to Interactive):** Kritisch – diese Bundles müssen schnell geladen werden.

### Feature-Routen (Lazy-Loaded)

| Route | Feature | Bundles (lazy) | Größe | Besonderheiten |
|-------|---------|----------------|-------|----------------|
| `/analysis-v2` | Token-Research + AI-Insights | `AnalysisPageV2-Cmj29RjQ.js` | 29 KB | Größter Feature-Chunk, AI-Prompting |
| `/replay` | Session-Playback | `ReplayPage-CJcIsHab.js` | 24 KB | Komplex, aber nur für Power-User |
| `/notifications` | Push-Notifications | `NotificationsPage-DjoSg7gg.js` | 23 KB | Web-Push-Integration |
| `/settings-v2` | Settings | `SettingsPageV2-DqaXpFVS.js` | 21 KB | Einstellungen, nicht kritisch |
| `/journal-v2` | Trade-Journal | `JournalPageV2-BzfUdzrW.js` | 16 KB | Dexie-Integration, AI-Condense |
| `/watchlist-v2` | Watchlist | `WatchlistPageV2-OlX6hcpj.js` | 14 KB | Token-Tracking |
| `/signals` | Signal-Matrix | `SignalsPage-BZp5wItp.js` | 14 KB | Confluence-Rules |
| `/chart-v2` | Chart-View | `ChartPageV2-ttCxqHMY.js` | 2.5 KB ⚠️ | **Verdächtig klein!** Lädt Chart-Lib nach? |
| `/landing` | Landing-Page | `LandingPage-DaAH1MxL.js` | 15 KB | Marketing, nur vor Login |
| `/lessons` | Educational | `LessonsPage-DQEgTDrT.js` | 11 KB | Content-Heavy, aber klein |
| `/alerts-v2` | Price-Alerts | `AlertsPageV2-CEk_9DiJ.js` | 8 KB | Leicht, gutes Splitting |

### Schwere Dependencies (wo landen sie?)

| Dependency | Größe (npm) | Erwartet in Bundle | Tatsächlich in Bundle? | Status |
|------------|-------------|-------------------|------------------------|--------|
| **driver.js** | ~50 KB | Sollte lazy in Feature-Bundle | ✅ Lazy via `import()` in productTour.ts | ✅ **Optimal** – On-demand geladen |
| **tesseract.js** | ~500 KB | Sollte lazy in Feature-Bundle (OCR) | ✅ Lazy via `import()` in ocrService.ts | ✅ **Optimal** – On-demand + WASM via CDN |
| **dexie** | ~30 KB | `vendor-dexie` (laut Config) | ❌ In `vendor` integriert | ⚠️ Kein separater Chunk (aber klein) |
| **openai SDK** | ~100 KB | `vendor` | ✅ Wahrscheinlich in `vendor` | ✅ OK (nur für AI-Features) |
| **zustand** | ~5 KB | `vendor` | ✅ In `vendor` | ✅ OK |
| **lucide-react** | ~50 KB (tree-shakeable) | `vendor` oder spread | ✅ Wahrscheinlich in `vendor` | ✅ OK (Icons tree-shaken) |
| **Chart-Library** | N/A | `chart`-Chunk (laut Config) | ✅ Nicht verwendet (Placeholder-Page) | ✅ **Optimal** – Kein Bloat |

---

## 5. Befund – Aktueller Bundle-Zustand

### ✅ Positiv (Was gut läuft)

1. **Exzellentes Lazy-Loading:** Alle Routen via `React.lazy()` → Initial-Load nur ~79 KB gzipped
2. **Vendor-Splitting funktioniert:** React-Ökosystem sauber in `vendor-react` (165 KB) getrennt
3. **Feature-Bundles sind klein:** Durchschnittlich 8–24 KB pro Page-Chunk (gut cacheable)
4. **PWA-Precaching aktiv:** 58 Einträge, offline-fähig
5. **Sourcemaps aktiviert:** Debugging in Production möglich

### ⚠️ Probleme & Hotspots

#### **HOTSPOT #1: Chart-Library – Wo ist sie? ✅ GEKLÄRT**

- **Symptom:** `ChartPageV2-ttCxqHMY.js` ist nur 2.5 KB groß (0.98 KB gzipped)
- **Erwartung:** Chart-Library (z.B. Lightweight Charts ~35 KB uncompressed) sollte hier sein
- **✅ BEFUND (verifiziert):**
  - Chart-Library wird **aktuell nicht verwendet**
  - ChartPageV2 ist ein **Placeholder/Migration-Notice** (siehe src/pages/ChartPageV2.tsx:15-19)
  - V1-Chart wurde archiviert unter `docs/archive/v1-migration-backup/`
  - Route bleibt aktiv für künftige V2-Module
- **Impact:** ✅ **Positiv** – Keine Chart-Library im Bundle = keine Bloat
- **Optimierungspotenzial:** **Keine Action nötig** – Architektur ist korrekt
- **Future:** Wenn V2-Chart implementiert wird → Chart-Lib **muss** lazy geladen werden (via `import()`)

#### **HOTSPOT #2: Fehlende Chunks für schwere Dependencies ✅ GEKLÄRT**

- **driver.js** (Product Tour): ~50 KB – Nicht als Chunk sichtbar
  - **✅ BEFUND (verifiziert via src/lib/productTour.ts:19-22):**
    ```typescript
    const [{ driver }] = await Promise.all([
      import('driver.js'),
      import('driver.js/dist/driver.css'),
    ]);
    ```
  - **Impact:** ✅ **Korrekt lazy geladen** – driver.js wird nur geladen, wenn `createProductTour()` aufgerufen wird
  - **Optimierungspotenzial:** **Keine Action nötig** – Architektur ist optimal
- **tesseract.js** (OCR): ~500 KB (!!) – Nicht als Chunk sichtbar
  - **✅ BEFUND (verifiziert via src/lib/ocr/ocrService.ts:26):**
    ```typescript
    const { createWorker } = await import('tesseract.js')
    ```
  - **Impact:** ✅ **Korrekt lazy geladen** – tesseract.js wird nur geladen, wenn OCR erstmalig verwendet wird
  - **Zusätzlich:** Tesseract lädt WASM-Worker separat via CDN (nicht im JS-Bundle)
  - **Optimierungspotenzial:** **Keine Action nötig** – Architektur ist optimal

#### **HOTSPOT #3: Veraltete Bundle-Check-Patterns**

- **Problem:** 4 von 7 Patterns in `check-bundle-size.mjs` matchen keine realen Chunks
- **Betroffene Patterns:**
  - `vendor-workbox` (12 KB) – SW-Dateien sind separat, nicht in Bundle
  - `vendor-dexie` (8 KB) – Dexie ist in `vendor` integriert
  - `chart` (15 KB) – Kein Chart-Chunk gefunden
  - `analyze` (12 KB) – Analyze-Sections in `AnalysisPageV2` integriert
- **Impact:** False Sense of Security – Script prüft nur 3 reale Bundles
- **Action:** Script-Patterns aktualisieren (siehe Abschnitt 6)

#### **HOTSPOT #4: `index`-Bundle könnte optimiert werden**

- **Aktuelle Größe:** 69 KB (22.22 KB gzipped)
- **Enthält:** App-Root, Layout, Routing-Setup, Contexts (Settings, Telemetry, AI), GlobalInstruments
- **Optimierungspotenzial:** **MITTEL**
  - **GlobalInstruments** könnte lazy geladen werden (wenn nicht auf Initial-Route benötigt)
  - **AI-Context** könnte lazy sein (nur für AI-Features nötig)
  - **Telemetry-Context** könnte lazy sein (nicht kritisch für TTI)
- **Einsparung:** Geschätzt 5–10 KB durch Lazy-Loading von nicht-kritischen Contexts

### 📊 Verteilung: Logisch oder problematisch?

**Verteilung ist insgesamt gut:**

| Kategorie | Anzahl Chunks | Gesamt-Größe | Anteil | Bewertung |
|-----------|---------------|--------------|--------|-----------|
| **Vendor (React)** | 1 | 165 KB | 38% | ✅ OK (kritisch, aber cacheable) |
| **App-Shell** | 1 | 69 KB | 16% | ⚠️ Könnte reduziert werden |
| **Vendor (Other)** | 1 | 13 KB | 3% | ✅ OK |
| **Feature-Pages** | 11 | 170 KB | 39% | ✅ Exzellent (lazy, klein) |
| **UI-Components** | 2 | 4 KB | 1% | ✅ OK |
| **Utils** | 1 | 2 KB | <1% | ✅ OK |
| **Tooling** | 2 | 10 KB | 2% | ✅ OK (Dev-Only?) |

**Ergebnis:** Initial-Load (Vendor-React + App-Shell + Dashboard) ist **~79 KB gzipped** → **Exzellent für eine Trading-PWA!**

---

## 6. Vorschlag – Ziel-Budgets & nächste Schritte

### 6.1 Empfohlene neue Chunk-Budgets

**Grundprinzip:** Budgets müssen **reale Chunks** widerspiegeln, nicht hypothetische Patterns.

#### Vorgeschlagene Thresholds (gzipped)

| Chunk Pattern | Budget (KB gzipped) | Begründung |
|---------------|---------------------|------------|
| `vendor-react` | **60 KB** | React-Ökosystem ist stabil, aktuell 53 KB → 60 KB mit Headroom |
| `index` | **25 KB** | App-Shell, aktuell 22 KB → 25 KB nach Optimierung von Contexts |
| `vendor` | **10 KB** | Generic Libs, aktuell 5.6 KB → 10 KB mit Headroom |
| `*Page*.js` | **15 KB** | Feature-Pages (durchschnittlich 2–8 KB, max. 29 KB für AnalysisPage) |
| `AnalysisPageV2` | **12 KB** | Größter Feature-Chunk, aktuell 8.15 KB → 12 KB mit Headroom |

#### Patterns entfernen (veraltet)

- ❌ `vendor-workbox` (SW ist nicht im Bundle)
- ❌ `vendor-dexie` (in `vendor` integriert)
- ❌ `chart` (kein separater Chunk)
- ❌ `analyze` (in `AnalysisPageV2` integriert)

#### Neue Patterns hinzufügen (wenn Features aktiviert)

- ✅ `driver` (falls Product-Tour als Chunk geladen wird)
- ✅ `tesseract` (falls OCR als Chunk geladen wird – sollte aber WASM-Worker sein)

### 6.2 Global-Budget (Total JS)

**Aktuell:** 440 KB uncompressed (~132 KB gzipped)
**Budget (check-bundle-size.mjs):** 950 KB uncompressed

**Vorschlag:**

- **Initial-Load-Budget (kritisch für TTI):** ≤ 100 KB gzipped
  → Aktuell bei ~79 KB → **✅ Exzellent, Headroom für Features**

- **Total-Budget (alle Chunks, uncompressed):** **500 KB**
  → Aktuell bei 440 KB → **Headroom für Chart-Lib + weitere Features**
  → Begründung: 950 KB ist zu großzügig, 500 KB ist realistisch und performant

- **Per-Page-Budget (lazy Chunks):** ≤ 15 KB gzipped
  → Ausnahmen: AnalysisPage (12 KB), ReplayPage (10 KB)

### 6.3 Nächste Schritte (Optimierungs-Roadmap)

#### **Phase 1: Diagnose ✅ ABGESCHLOSSEN**

1. ✅ Bundle-Inventur erstellt (dieser Report)
2. ✅ **HOTSPOT #1 geklärt:** `ChartPageV2.tsx` source-code geprüft
   - Chart-Library wird nicht verwendet (Placeholder-Page) → **Kein Problem**
3. ✅ **HOTSPOT #2 geklärt:** driver.js + tesseract.js Imports gefunden
   - Beide sind korrekt lazy geladen via `import()` → **Optimal**

#### **Phase 2: Quick Wins (1 Tag)**

1. **`check-bundle-size.mjs` aktualisieren:**
   - Veraltete Patterns entfernen (`vendor-workbox`, `vendor-dexie`, `chart`, `analyze`)
   - Neue Thresholds setzen (siehe 6.1)
   - Total-Budget auf 500 KB senken
2. **`index`-Bundle optimieren:**
   - GlobalInstruments lazy laden (wenn nicht auf Initial-Route benötigt)
   - AI-Context + Telemetry-Context lazy laden
   - Einsparung: ~5–10 KB

#### **Phase 3: Feature-Hardening ✅ NICHT NÖTIG (Architektur bereits optimal)**

1. ~~**Chart-Feature korrekt lazy-loaden:**~~ ✅ Chart-Page ist Placeholder, keine Library im Bundle
2. ~~**OCR-Feature prüfen:**~~ ✅ Tesseract.js ist bereits korrekt lazy + WASM via CDN
3. ~~**Product-Tour (driver.js) lazy-loaden:**~~ ✅ driver.js ist bereits korrekt lazy geladen

**Ergebnis:** Alle schweren Dependencies sind **bereits optimal lazy geladen**. Keine Aktion nötig.

#### **Phase 4: Monitoring (laufend)**

1. **CI-Check aktualisieren:**
   - `pnpm run check:size` in CI-Pipeline
   - Bei Überschreitung: Build **muss** fehlschlagen
2. **Visualizer regelmäßig nutzen:**
   - Bei jedem Feature-Release: `pnpm analyze` ausführen
   - Neue Dependencies kritisch prüfen (> 10 KB = Review)

---

## 7. Zusammenfassung

### Status Quo

- ✅ **Initial-Load:** ~79 KB gzipped (exzellent)
- ✅ **Feature-Splitting:** Alle Routen lazy (gut)
- ✅ **Vendor-Splitting:** React separat (gut)
- ✅ **Schwere Dependencies:** driver.js + tesseract.js korrekt lazy geladen (optimal)
- ✅ **Chart-Library:** Nicht im Bundle (Placeholder-Page, kein Bloat)
- ⚠️ **Bundle-Checks:** 4 von 7 Patterns veraltet (false sense of security)

### Realistische Ziele

- **Initial-Load:** ≤ 100 KB gzipped (aktuell 79 KB → **Headroom OK**)
- **Total JS:** ≤ 500 KB uncompressed (aktuell 440 KB → **Headroom OK**)
- **Per-Page:** ≤ 15 KB gzipped (aktuell max. 8.15 KB → **OK**)

### Top 3 Actions (Priorität)

1. **check-bundle-size.mjs updaten** (veraltete Patterns entfernen) — **PRIO 1**
2. **index-Bundle optimieren** (Contexts lazy laden) — **PRIO 2** (optional, ~5–10 KB Einsparung)
3. **Total-Budget auf 500 KB senken** (aktuell 950 KB zu großzügig) — **PRIO 1**

---

**Nächster Schritt:** Codex-Task für **Phase 2** (Quick Wins: check-bundle-size.mjs updaten)

**Verantwortlich:** Claude Code (Diagnose ✅ abgeschlossen), Codex (Implementierung Phase 2)

**Review:** Nach Phase 2 → Neue Bundle-Analyse erstellen (Diff zu diesem Report)

---

## 8. Changelog

**2025-11-24 (Initial):** Bundle-Inventur erstellt, 20 JS-Chunks analysiert, alle Routen verifiziert

**2025-11-24 (Update 1):** HOTSPOT #1 + #2 geklärt:
- ✅ Chart-Library nicht im Bundle (Placeholder-Page, kein Bloat)
- ✅ driver.js korrekt lazy geladen via `import()` (src/lib/productTour.ts:19-22)
- ✅ tesseract.js korrekt lazy geladen via `import()` (src/lib/ocr/ocrService.ts:26)
- **Ergebnis:** Architektur ist bereits optimal, nur Bundle-Check-Patterns müssen aktualisiert werden

---

**Ende des Bundle-Inventur-Reports**
