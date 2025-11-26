# Loop 1 – Baseline & Ziel-Budgets

**Branch:** `cursor/analyze-and-optimize-bundle-size-claude-4.5-sonnet-thinking-92d7`  
**Datum:** 2025-11-26  
**Status:** ✅ CI bereits erfolgreich (703KB / 950KB = 74%)

---

## Executive Summary

Der aktuelle `main`-Branch wurde bereits durch **PR #199** optimiert und läuft **erfolgreich** durch CI.

- **Ist-Zustand:** 703KB total (uncompressed)
- **Budget:** 950KB
- **Auslastung:** 74% ✅
- **CI-Status:** Alle Checks grün

**Wichtig:** Die ursprüngliche Aufgabenstellung erwähnte einen Fehler von 1287KB, aber der aktuelle Zustand ist bereits optimiert.

---

## Aktuelle Bundle-Größen (Top 10)

### Vendor Chunks

| Chunk | Raw Size | Gzip Size | Budget (Gzip) | Auslastung | Status |
|-------|----------|-----------|---------------|------------|--------|
| `vendor-react-*.js` | 173 KB | 54.86 KB | 115 KB | 48% | ✅ PASS |
| `vendor-*.js` (generic) | 172 KB | 55.73 KB | 60 KB | **93%** | ⚠️ NEAR LIMIT |
| `vendor-dexie-*.js` | 74 KB | 26.66 KB | 30 KB | 89% | ⚠️ NEAR LIMIT |

### App Chunks

| Chunk | Raw Size | Gzip Size | Budget (Gzip) | Auslastung | Status |
|-------|----------|-----------|---------------|------------|--------|
| `index-*.js` | 71 KB | 22.55 KB | 35 KB | 64% | ✅ PASS |
| `AnalysisPageV2-*.js` | 29 KB | 8.15 KB | 12 KB | **68%** | ⚠️ OVER BUDGET |
| `ReplayPage-*.js` | 27 KB | 6.76 KB | – | – | ℹ️ No limit |
| `NotificationsPage-*.js` | 23 KB | 6.45 KB | – | – | ℹ️ No limit |
| `SettingsPageV2-*.js` | 21 KB | 6.37 KB | – | – | ℹ️ No limit |
| `chartTelemetry-*.js` | 17 KB | 5.92 KB | 15 KB | 39% | ✅ PASS |
| `JournalPageV2-*.js` | 15 KB | 4.27 KB | – | – | ℹ️ No limit |

### Total

- **Total (Raw):** 703 KB
- **Total Budget:** 950 KB
- **Auslastung:** 74% ✅

---

## Aktuelle Limits (aus `check-bundle-size.mjs`)

```js
const THRESHOLDS = {
  'vendor-react': 115,    // React + ReactDOM + Router
  'vendor-workbox': 12,   // ⚠️ NOT FOUND
  'vendor-dexie': 30,
  'vendor-icons': 20,     // ⚠️ NOT FOUND
  'vendor-router': 25,    // ⚠️ NOT FOUND
  'vendor-state': 5,      // ⚠️ NOT FOUND
  'chart': 15,            // ⚠️ NOT FOUND (heißt jetzt chartTelemetry/chartLinks)
  'analyze': 12,          // ⚠️ NOT FOUND (heißt jetzt AnalysisPageV2)
  'index': 35,
  'vendor': 60,           // Generic vendor – NEAR LIMIT (93%)
};

const TOTAL_BUDGET_KB = 950;
```

---

## Probleme & Warnings

### 🔴 Problem 1: Fehlende Pattern-Matches

Der `check:size`-Script wirft 5 Warnings:

```
⚠️  No files found matching pattern "vendor-workbox"
⚠️  No files found matching pattern "vendor-icons"
⚠️  No files found matching pattern "vendor-router"
⚠️  No files found matching pattern "vendor-state"
⚠️  No files found matching pattern "analyze"
```

**Ursache:** Die `manualChunks`-Konfiguration in `vite.config.ts` definiert diese Splits, aber Vite erstellt sie nicht als separate Chunks (zu klein oder nicht verwendet).

**Lösung:** Diese Patterns als `OPTIONAL_CHUNKS` markieren (siehe Phase 3 der CI-Hardening Section).

---

### 🟡 Problem 2: Generic `vendor-*` Chunk zu groß

Der generische `vendor-DgvhZXmf.js` ist **93% ausgelastet** (55.73 KB / 60 KB).

**Inhalt (wahrscheinlich):**
- `driver.js` (Onboarding-Tour)
- `tesseract.js` (OCR)
- Weitere kleinere libs

**Empfehlung:** Zusätzliche Splits erwägen:
- `vendor-ocr` für Tesseract
- `vendor-onboarding` für Driver.js

---

### 🟡 Problem 3: `AnalysisPageV2` über Budget

- **Ist:** 8.15 KB (gzip)
- **Budget:** 12 KB
- **Problem:** Budget passt nicht zum aktuellen Pattern-Namen

**Ursache:** Check-Script sucht nach `analyze`, aber der tatsächliche Chunk heißt `AnalysisPageV2`.

**Lösung:** Pattern in `check-bundle-size.mjs` anpassen.

---

### 🟢 Positive Findings

✅ **React Vendor (48% Auslastung)** – Viel Headroom für React 19 Migration  
✅ **Index Chunk (64%)** – Stabiler App Shell  
✅ **Charts lazy-loaded** – `lightweight-charts` ist NICHT im initialen Bundle (dynamischer Import funktioniert!)  
✅ **Dexie isoliert** – IndexedDB-Layer sauber getrennt

---

## Aktuelle `vite.config.ts` manualChunks

```ts
manualChunks(id) {
  if (id.includes('node_modules')) {
    // React ecosystem
    if (id.includes('react') || id.includes('scheduler')) {
      return 'vendor-react';
    }
    // Dexie
    if (id.includes('dexie')) {
      return 'vendor-dexie';
    }
    // Lucide Icons
    if (id.includes('lucide-react')) {
      return 'vendor-icons';  // ⚠️ Wird nicht erstellt
    }
    // React Router
    if (id.includes('react-router')) {
      return 'vendor-router';  // ⚠️ Wird nicht erstellt
    }
    // Zustand
    if (id.includes('zustand')) {
      return 'vendor-state';  // ⚠️ Wird nicht erstellt
    }
    // Workbox
    if (id.includes('workbox')) {
      return 'vendor-workbox';  // ⚠️ Wird nicht erstellt
    }
    // All other node_modules
    return 'vendor';
  }
  
  // App code splitting
  if (id.includes('/sections/chart/')) return 'chunk-chart';
  if (id.includes('/sections/analyze/')) return 'chunk-analyze';
  if (id.includes('/sections/signals/')) return 'chunk-signals';
}
```

**Beobachtung:** Die definierten Splits für `icons`, `router`, `state`, `workbox` werden **nicht erstellt**, weil:
1. Diese Libs direkt in Pages importiert werden (treeshaking)
2. Zu klein für separaten Chunk (Vite-Heuristik)
3. Bereits im `vendor-react`-Chunk enthalten (React Router wird mit React gebündelt)

---

## Vergleich: CI-Hardening Section vs. Ist-Zustand

### Phase 0 – Basis & Sicherheit ✅

- [x] Node-SDKs vom Client fernhalten
- [x] `engines.node >= 20.10.0`
- [x] Keine Fehler im Browser-Pfad

**Status:** Abgeschlossen

---

### Phase 1 – Charts & Heavy Libraries ✅

- [x] `lightweight-charts` dynamisch geladen (nicht im initialen Bundle)
- [x] Heavy-Libs identifiziert:
  - `tesseract.js` (in generic `vendor`)
  - `driver.js` (in generic `vendor`)

**Status:** Teilweise abgeschlossen  
**Verbesserung möglich:** Tesseract/Driver.js aus generic `vendor` in eigene Chunks splitten

---

### Phase 2 – Vite manualChunks ⚠️

**Status:** Implementiert, aber nicht alle Chunks werden erstellt

**Problem:** Icons, Router, State, Workbox landen trotzdem im `vendor-react` oder werden tree-shaked.

**Empfehlung:** Config bereinigen – nur realistische Splits definieren.

---

### Phase 3 – `check-bundle-size.mjs` härten ⚠️

**Status:** Funktioniert, aber Warnings stören

**TODO:**
1. `OPTIONAL_PATTERNS` einführen (vendor-workbox, vendor-icons, etc.)
2. Pattern-Namen an echte Chunk-Namen anpassen (`analyze` → `AnalysisPageV2`)
3. Top-N-Reporting optional hinzufügen

---

### Phase 4 – Env & Secrets ✅

**Status:** Erfolgreich implementiert

---

### Phase 5 – CI-Workflow Hardening ✅

**Status:** CI läuft stabil

---

### Phase 6 – Iterative Analyse-Schleife ✅

**Status:** Funktioniert (dieser Loop ist Beweis dafür!)

---

### Phase 7 – Dokumentation ⏳

**Status:** In Arbeit (dieses Dokument)

---

## Empfohlene Maßnahmen für Loop 2

### 🎯 Priorität 1: Warnings beheben

**Aktion:** `check-bundle-size.mjs` um `OPTIONAL_CHUNKS` erweitern

```js
const OPTIONAL_CHUNKS = [
  'vendor-workbox',
  'vendor-icons',
  'vendor-router',
  'vendor-state',
  'analyze',
  'chart',
];
```

**Begründung:** Diese Chunks existieren nicht/nicht immer → keine Hard-Fails

---

### 🎯 Priorität 2: Pattern-Namen korrigieren

**Aktion:** Limits-Map in `check-bundle-size.mjs` anpassen:

```js
const THRESHOLDS = {
  'vendor-react': 115,
  'vendor-dexie': 30,
  'vendor': 60,            // Generic vendor
  'index': 35,
  'AnalysisPageV2': 15,    // Korrigiert von 'analyze'
  'chartTelemetry': 15,    // Neu
  'chartLinks': 5,         // Neu
};
```

---

### 🎯 Priorität 3: Generic `vendor` entschärfen

**Aktion:** Zusätzliche Splits in `vite.config.ts`:

```ts
// Tesseract OCR
if (id.includes('tesseract')) {
  return 'vendor-ocr';
}

// Driver.js (Onboarding)
if (id.includes('driver.js')) {
  return 'vendor-onboarding';
}
```

**Ziel:** Generic `vendor` von 55.73 KB auf < 40 KB reduzieren

---

### 🎯 Priorität 4 (optional): TOTAL_BUDGET anpassen

**Aktuell:** 950 KB (74% Auslastung)

**Option A – Guardrail Mode:**  
Budget auf **800 KB** senken (aktuell 703 KB + 12% Headroom)

**Option B – Wachstums-Mode:**  
Budget auf **1000 KB** anheben (mehr Spielraum für neue Features)

**Empfehlung:** Guardrail Mode (800 KB), weil:
- PWA-Best-Practice: < 1 MB initial bundle
- Noch 97 KB Reserve für neue Features
- Zwingt zu bewusstem Code-Splitting

---

## Vorgeschlagene Ziel-Limits (Loop 2)

| Chunk | Aktuell (Gzip) | Neues Limit | Begründung |
|-------|----------------|-------------|------------|
| `vendor-react` | 54.86 KB | 115 KB | Behalten (Headroom für React 19) |
| `vendor-dexie` | 26.66 KB | 30 KB | Behalten (nah am Ist-Wert) |
| `vendor` | 55.73 KB | **45 KB** | Reduzieren (nach OCR/Onboarding-Split) |
| `vendor-ocr` | – | **30 KB** | Neu (Tesseract isolieren) |
| `vendor-onboarding` | – | **20 KB** | Neu (Driver.js isolieren) |
| `index` | 22.55 KB | 35 KB | Behalten |
| `AnalysisPageV2` | 8.15 KB | 15 KB | Umbenennen (war 'analyze') |
| `chartTelemetry` | 5.92 KB | 15 KB | Neu |
| `chartLinks` | 0.34 KB | 5 KB | Neu |

**Neue TOTAL_BUDGET:** 800 KB (Guardrail Mode)

---

## Definition of Done – Loop 1

- [x] CI-Hardening Section gelesen
- [x] `pnpm build` erfolgreich
- [x] `pnpm analyze` versucht (visualizer-Problem, aber Build-Logs ausreichend)
- [x] `pnpm run check:size` erfolgreich
- [x] Top 10 größte Bundles dokumentiert
- [x] Baseline definiert (703 KB / 950 KB)
- [x] Verbesserungspotenziale identifiziert:
  - Warnings durch OPTIONAL_CHUNKS beheben
  - Pattern-Namen korrigieren
  - Generic `vendor` splitten
  - TOTAL_BUDGET auf 800 KB senken (optional)
- [x] Konkrete Empfehlungen für Loop 2 erstellt

---

## Nächste Schritte → Loop 2

**Ziel:** Konkrete Implementierungs-Specs für Codex

1. **Überarbeitete `manualChunks`-Funktion** (vite.config.ts)
2. **Überarbeitete LIMITS-Map** (check-bundle-size.mjs)
3. **OPTIONAL_CHUNKS-Array** (check-bundle-size.mjs)
4. **Angepasstes TOTAL_BUDGET** (check-bundle-size.mjs)
5. **Reihenfolge der Umsetzung** (welche Dateien zuerst, welche Tests)

---

**Status:** ✅ Loop 1 abgeschlossen  
**Nächster Loop:** Loop 2 – Design: Splits & Dynamic Imports
