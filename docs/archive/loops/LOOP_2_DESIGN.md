# Loop 2 – Design: Splits & Dynamic Imports

**Branch:** `cursor/analyze-and-optimize-bundle-size-claude-4.5-sonnet-thinking-92d7`  
**Datum:** 2025-11-26  
**Basis:** Loop 1 Baseline (703 KB / 950 KB)

---

## Ziel

Konkrete Implementierungs-Specs für Codex erstellen:

1. ✅ **Überarbeitete `manualChunks`** (vite.config.ts)
2. ✅ **Überarbeitete LIMITS** (check-bundle-size.mjs)
3. ✅ **OPTIONAL_CHUNKS-Array** (check-bundle-size.mjs)
4. ✅ **Angepasstes TOTAL_BUDGET** (check-bundle-size.mjs)
5. ✅ **Umsetzungs-Reihenfolge**

---

## 1. Überarbeitete `manualChunks` (vite.config.ts)

### Problem (Ist-Zustand)

Die aktuelle Config definiert Splits, die nicht erstellt werden:
- `vendor-icons` (lucide-react)
- `vendor-router` (react-router-dom)
- `vendor-state` (zustand)
- `vendor-workbox` (workbox-window)

**Grund:** Diese Libs werden entweder tree-shaked oder sind zu klein für separaten Chunk.

### Lösung: Realistische Splits

```ts
// vite.config.ts - build.rollupOptions.output.manualChunks
manualChunks(id) {
  // Only process node_modules
  if (!id.includes('node_modules')) {
    // App code splitting (optional, Vite handles this automatically)
    if (id.includes('/sections/chart/')) return 'chunk-chart';
    if (id.includes('/sections/analyze/')) return 'chunk-analyze';
    if (id.includes('/sections/signals/')) return 'chunk-signals';
    return undefined;
  }

  // === VENDOR SPLITTING ===
  
  // 1. React Ecosystem (React + ReactDOM + Scheduler + React-Router)
  // Note: React-Router is intentionally bundled with React (they're always used together)
  if (id.includes('react') || id.includes('scheduler') || id.includes('react-router')) {
    return 'vendor-react';
  }

  // 2. Dexie (IndexedDB wrapper)
  if (id.includes('dexie')) {
    return 'vendor-dexie';
  }

  // 3. Tesseract.js (OCR) - Heavy library, isolate for lazy loading
  if (id.includes('tesseract')) {
    return 'vendor-ocr';
  }

  // 4. Driver.js (Onboarding tour) - Isolate for lazy loading
  if (id.includes('driver.js')) {
    return 'vendor-onboarding';
  }

  // 5. Generic vendor (everything else: zustand, lucide-react, etc.)
  // These are small libraries that don't need separate chunks
  return 'vendor';
}
```

### Rationale

| Chunk | Inhalt | Warum separater Split? |
|-------|--------|------------------------|
| `vendor-react` | React, ReactDOM, Scheduler, React-Router | Immer geladen, großer Chunk (54 KB), aber stabil |
| `vendor-dexie` | Dexie (IndexedDB) | Core-Feature (Journal, Watchlist), mittlere Größe (26 KB) |
| `vendor-ocr` | Tesseract.js | **Heavy (30+ KB), nur bei OCR-Feature benötigt** → Kandidat für Lazy Load |
| `vendor-onboarding` | Driver.js | **Heavy (20+ KB), nur bei Onboarding benötigt** → Kandidat für Lazy Load |
| `vendor` | Zustand, Lucide-Icons, sonstige | Klein, immer benötigt, zusammen < 40 KB |

### React-Router bei React bündeln?

**JA**, weil:
- React-Router wird auf **jeder Route** benötigt
- Splitting würde 2 separate HTTP-Requests erfordern (schlechter für Performance)
- React 19 + React-Router 7 werden zusammen aktualisiert (ähnliche Lifecycle)

---

## 2. Überarbeitete LIMITS (check-bundle-size.mjs)

### Ist-Zustand (Probleme)

1. Pattern-Namen passen nicht (`analyze` ≠ `AnalysisPageV2`)
2. Nicht-existierende Chunks erzeugen Warnings
3. Keine Limits für große Pages (ReplayPage, NotificationsPage, SettingsPageV2)

### Neue LIMITS-Map

```js
// scripts/check-bundle-size.mjs - THRESHOLDS

const THRESHOLDS = {
  // === VENDOR CHUNKS ===
  
  // React + ReactDOM + Scheduler + React-Router
  // Current: 54.86 KB gzip, allow headroom for React 19
  'vendor-react': 115,
  
  // Dexie (IndexedDB wrapper)
  // Current: 26.66 KB gzip, Dexie is ~26KB - cannot reduce
  'vendor-dexie': 30,
  
  // Generic vendor (Zustand, Lucide-Icons, etc.)
  // Current: 55.73 KB gzip (includes OCR + Onboarding)
  // After split: expected ~30-35 KB
  'vendor': 45,
  
  // Tesseract.js (OCR) - NEW
  // Estimated: 25-30 KB gzip (lazy-loaded)
  'vendor-ocr': 35,
  
  // Driver.js (Onboarding tour) - NEW
  // Estimated: 15-20 KB gzip (lazy-loaded)
  'vendor-onboarding': 25,
  
  // === APP CHUNKS ===
  
  // Main app shell (routing, layout, offline chrome, dashboard tiles)
  // Current: 22.55 KB gzip
  'index': 35,
  
  // Analysis Page (token research + AI affordances)
  // Current: 8.15 KB gzip
  // FIXED: Pattern was 'analyze', actual chunk is 'AnalysisPageV2'
  'AnalysisPageV2': 15,
  
  // Chart-related app code (not the library itself!)
  // Current: 5.92 KB (chartTelemetry) + 0.34 KB (chartLinks)
  'chartTelemetry': 15,
  'chartLinks': 5,
  
  // === OPTIONAL CHUNKS (may not exist in all builds) ===
  // These are checked but won't fail if missing
  // (see OPTIONAL_CHUNKS array below)
};
```

### Neue Gesamt-Budget

```js
// BEFORE: 950 KB (74% Auslastung - zu viel Headroom)
// AFTER: 800 KB (aktuell 703 KB + 12% Reserve)
const TOTAL_BUDGET_KB = 800;
```

**Begründung:**
- PWA-Best-Practice: < 1 MB initial bundle
- Aktueller Build: 703 KB (noch 97 KB Reserve)
- Guardrail-Modus: Zwingt zu bewusstem Code-Splitting
- Flexibilität: ~2-3 neue mittelgroße Features möglich

---

## 3. OPTIONAL_CHUNKS-Array (check-bundle-size.mjs)

### Problem

Chunks wie `vendor-ocr` und `vendor-onboarding` existieren nur, wenn die Features tatsächlich importiert werden (lazy loading).

Aktuell: "No files found" → Warning (stört, aber kein Hard-Fail)

### Lösung: OPTIONAL_CHUNKS

```js
// scripts/check-bundle-size.mjs

// Chunks that may not exist in all builds (don't fail if missing)
const OPTIONAL_CHUNKS = [
  'vendor-ocr',         // Only if OCR feature is imported
  'vendor-onboarding',  // Only if onboarding tour is imported
  'chartLinks',         // Only if chart links exist
  'chunk-chart',        // App code split (may be bundled with page)
  'chunk-analyze',      // App code split (may be bundled with page)
  'chunk-signals',      // App code split (may be bundled with page)
];

// In checkBundleSizes() function:
for (const [pattern, threshold] of Object.entries(THRESHOLDS)) {
  const matchingFiles = files.filter(f => f.includes(pattern) && !checkedFiles.has(f));
  
  if (matchingFiles.length === 0) {
    // Check if this is an optional chunk
    if (OPTIONAL_CHUNKS.includes(pattern)) {
      console.log(`${BLUE}ℹ️  Optional chunk "${pattern}" not found (this is OK)${RESET}`);
      continue;
    }
    
    // Required chunk missing - warning (not hard fail yet)
    warnings.push(`${YELLOW}⚠️  No files found matching pattern "${pattern}"${RESET}`);
    continue;
  }
  
  // ... rest of check logic
}
```

---

## 4. Lazy Loading-Strategie

### Kandidaten für Lazy Loading

| Library | Aktuell | Nach Split | Lazy Load? | Import-Ort |
|---------|---------|------------|------------|------------|
| `tesseract.js` | In `vendor` | `vendor-ocr` | ✅ JA | SettingsPageV2 (OCR-Scan) |
| `driver.js` | In `vendor` | `vendor-onboarding` | ✅ JA | Onboarding-Tour |
| `lightweight-charts` | – | Dynamisch | ✅ BEREITS | ChartPageV2, ReplayPage |

### Umsetzung: Tesseract Lazy Loading

**Aktuell (vermutlich):**

```tsx
// src/pages/SettingsPageV2.tsx
import Tesseract from 'tesseract.js';

function handleOCRScan(image: File) {
  const worker = await Tesseract.createWorker();
  // ...
}
```

**NEU (Dynamic Import):**

```tsx
// src/pages/SettingsPageV2.tsx
async function handleOCRScan(image: File) {
  // Lazy load only when OCR is actually used
  const Tesseract = await import('tesseract.js');
  const worker = await Tesseract.default.createWorker();
  // ...
}
```

### Umsetzung: Driver.js Lazy Loading

**Aktuell (vermutlich):**

```tsx
// src/components/OnboardingTour.tsx
import { driver } from 'driver.js';

function startTour() {
  const driverObj = driver({ ... });
  driverObj.drive();
}
```

**NEU (Dynamic Import):**

```tsx
// src/components/OnboardingTour.tsx
async function startTour() {
  // Lazy load only when tour is started
  const { driver } = await import('driver.js');
  const driverObj = driver({ ... });
  driverObj.drive();
}
```

### Erwartete Bundle-Reduktion

| Chunk | Vorher | Nachher | Δ |
|-------|--------|---------|---|
| `vendor` (generic) | 55.73 KB | ~30 KB | **-25.73 KB** ✅ |
| `vendor-ocr` | – | ~30 KB | (lazy loaded) |
| `vendor-onboarding` | – | ~20 KB | (lazy loaded) |
| **Initial Bundle** | 703 KB | **~650 KB** | **-53 KB** ✅ |

---

## 5. Umsetzungs-Reihenfolge für Codex

### Phase A: Vendor-Splitting (keine Code-Änderungen)

1. **vite.config.ts** anpassen:
   - `manualChunks`-Funktion ersetzen (siehe Abschnitt 1)
   - Tesseract → `vendor-ocr`
   - Driver.js → `vendor-onboarding`

2. **Build & Verify:**
   ```bash
   pnpm build
   ls -lh dist/assets/vendor-*.js
   ```
   Erwartung: 5 vendor-Chunks sichtbar (react, dexie, ocr, onboarding, generic)

3. **NICHT YET:** Lazy-Loading implementieren (kommt in Phase B)

**Commit-Message (Phase A):**
```
refactor(build): Split vendor bundle into granular chunks

- Add vendor-ocr (tesseract.js)
- Add vendor-onboarding (driver.js)
- Reduce generic vendor from 55KB to ~30KB

Related to ci_hardening_section.md Phase 2
```

---

### Phase B: Bundle-Check-Script anpassen

1. **scripts/check-bundle-size.mjs** anpassen:
   - Neue `THRESHOLDS`-Map (siehe Abschnitt 2)
   - `OPTIONAL_CHUNKS`-Array hinzufügen (siehe Abschnitt 3)
   - `TOTAL_BUDGET_KB` auf 800 setzen (siehe Abschnitt 2)

2. **Test:**
   ```bash
   pnpm run check:size
   ```
   Erwartung: Alle Checks grün, keine Warnings mehr

**Commit-Message (Phase B):**
```
refactor(ci): Update bundle size limits for granular vendor splits

- Add limits for vendor-ocr, vendor-onboarding
- Mark optional chunks (no hard fail if missing)
- Lower TOTAL_BUDGET to 800KB (guardrail mode)
- Fix pattern mismatch (analyze → AnalysisPageV2)

Related to ci_hardening_section.md Phase 3
```

---

### Phase C: Lazy Loading (Code-Änderungen)

1. **Finde Import-Stellen:**
   ```bash
   rg "import.*tesseract" src/
   rg "import.*driver\.js" src/
   ```

2. **Ersetze statische Imports durch Dynamic Imports:**
   - Für jeden Fund: siehe Beispiele in Abschnitt 4
   - **Wichtig:** Nur ändern, wenn Import in **Event-Handler** oder **useEffect** verwendet wird

3. **Test:**
   ```bash
   pnpm build
   pnpm run check:size
   ```
   Erwartung: Initial bundle < 650 KB, `vendor-ocr`/`vendor-onboarding` als separate Chunks

4. **Runtime-Test:**
   - Lokal: `pnpm dev`
   - Test OCR-Feature (sollte vendor-ocr.js lazy laden)
   - Test Onboarding-Tour (sollte vendor-onboarding.js lazy laden)
   - DevTools → Network → Verify lazy-load

**Commit-Message (Phase C):**
```
feat(perf): Lazy load heavy libs (tesseract, driver.js)

- Tesseract only loaded when OCR is used (~30KB saved initially)
- Driver.js only loaded when onboarding starts (~20KB saved initially)
- Initial bundle reduced from 703KB to ~650KB

Related to ci_hardening_section.md Phase 1
```

---

### Phase D: CI-Validation

1. **Lokaler CI-Durchlauf:**
   ```bash
   pnpm run build:ci
   ```
   Erwartung: Exit code 0, alle Checks grün

2. **Git Push (Branch):**
   ```bash
   git add .
   git commit -m "chore(ci): Complete bundle optimization (Loop 2)"
   git push origin cursor/analyze-and-optimize-bundle-size-claude-4.5-sonnet-thinking-92d7
   ```

3. **PR erstellen & CI beobachten:**
   - GitHub Actions → Workflow "CI" läuft
   - Alle Steps (typecheck, lint, test, build, check:size) grün?
   - Bundle-Size-Output im CI-Log prüfen

---

## Erwartete Ergebnisse (nach Loop 2)

### Bundle-Sizes (Ziel)

| Chunk | Vorher (Gzip) | Nachher (Gzip) | Status |
|-------|---------------|----------------|--------|
| `vendor-react` | 54.86 KB | 54.86 KB | ✅ Unverändert |
| `vendor-dexie` | 26.66 KB | 26.66 KB | ✅ Unverändert |
| `vendor` | 55.73 KB | ~30 KB | ✅ **-25.73 KB** |
| `vendor-ocr` | – | ~30 KB | ℹ️ Lazy-loaded |
| `vendor-onboarding` | – | ~20 KB | ℹ️ Lazy-loaded |
| `index` | 22.55 KB | 22.55 KB | ✅ Unverändert |
| **Initial Total** | **703 KB** | **~650 KB** | ✅ **-53 KB** |

### Check-Size-Output (Ziel)

```bash
📦 Bundle Size Check

Checking 25 JavaScript files in dist/assets/

✓ Passed (8)
  ✓ vendor-react-*.js: 51KB / 115KB (44%)
  ✓ vendor-dexie-*.js: 22KB / 30KB (73%)
  ✓ vendor-*.js: 28KB / 45KB (62%)
  ✓ vendor-ocr-*.js: 28KB / 35KB (80%)
  ✓ vendor-onboarding-*.js: 18KB / 25KB (72%)
  ✓ index-*.js: 21KB / 35KB (60%)
  ✓ AnalysisPageV2-*.js: 8KB / 15KB (53%)
  ✓ chartTelemetry-*.js: 5KB / 15KB (33%)

ℹ️ Optional chunks not found (OK):
  ℹ️ chunk-chart
  ℹ️ chunk-analyze

📊 Total Bundle Size
  ✓ Total: 650KB / 800KB (81%)

✓ All bundles within size limits!
```

---

## Risiken & Mitigations

### Risiko 1: Lazy-Loading-Fehler zur Laufzeit

**Problem:** Dynamic import fails (network error, wrong path)

**Mitigation:**
```tsx
try {
  const Tesseract = await import('tesseract.js');
  // ...
} catch (error) {
  console.error('Failed to load OCR library:', error);
  showUserError('OCR feature temporarily unavailable');
}
```

### Risiko 2: Tesseract/Driver.js werden doch statisch importiert (woanders)

**Problem:** Vite bündelt sie trotzdem in `vendor`, weil andere Dateien sie statisch importieren

**Mitigation:**
1. Grep nach allen Imports:
   ```bash
   rg "import.*tesseract" src/ --no-ignore
   rg "import.*driver" src/ --no-ignore
   ```
2. Alle Stellen auf Dynamic Import umstellen

### Risiko 3: Vendor-Splits zu granular → mehr HTTP-Requests

**Problem:** Viele kleine Chunks erhöhen HTTP/2-Overhead

**Mitigation:**
- Nur 5 Vendor-Chunks (react, dexie, ocr, onboarding, generic) → akzeptabel
- HTTP/2 parallel loads sind effizient
- Lazy-loaded Chunks (ocr, onboarding) werden nur bei Bedarf geladen

---

## Definition of Done – Loop 2

- [x] Konkrete `manualChunks`-Funktion definiert
- [x] Neue `THRESHOLDS`-Map definiert
- [x] `OPTIONAL_CHUNKS`-Array definiert
- [x] Neues `TOTAL_BUDGET` definiert (800 KB)
- [x] Lazy-Loading-Strategie dokumentiert
- [x] Umsetzungs-Reihenfolge (4 Phasen: A→B→C→D)
- [x] Erwartete Ergebnisse dokumentiert
- [x] Risiken & Mitigations dokumentiert

---

## Handoff an Codex

**Codex: Bitte setze Phase A + Phase B um (in separaten Commits).**

Nach Phase A+B:
1. Build & Check:
   ```bash
   pnpm build
   pnpm run check:size
   ```
2. Output hier posten (ich reviewe)

Nach meinem Review:
- Phase C (Lazy Loading) implementieren
- Phase D (CI-Validation) durchführen

---

**Status:** ✅ Loop 2 abgeschlossen  
**Nächster Loop:** Loop 3 – Review & Feintuning (nach Codex-Umsetzung)
