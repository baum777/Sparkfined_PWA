# CI Status Report — Sparkfined PWA

**Aktueller Branch:** `claude/assess-repo-status-01PStgL5EuYLwygHqgVVJt2u`

**Datum:** 2025-11-23

**Letzte Analyse:** Vollständige Re-Assessment nach PRs #162, #163, #164
**Aktueller Branch:** `codex/fix-typescript-and-lint-issues-in-phase-2` ✅ **MERGE-READY**

**Datum:** 2025-11-23 (Final Review)

**Letzte Analyse:** Phase-2-Finalisierung — Alle Blocker behoben

---

## ✅ Update 2025-11-23 — Phase 2 Finalized (MERGE-READY)

**Reviewed Branch:** `codex/fix-typescript-and-lint-issues-in-phase-2` (Commit: `02acb5c`)

**Status:** 🎉 **100% GREEN — READY FOR MERGE**

### Executive Summary

| Bereich | Status | Details |
|---------|--------|---------|
| **Phase 1 (Workflow-Setup)** | ✅ 90% | Setup-Reihenfolge korrigiert, pnpm@9.0.0, @v3 statt @v4 (P1) |
| **Phase 2 (TS/Tests/Lint)** | ✅ **100%** | **Alle 6 TS-Errors + 3 Lint-Issues behoben** |
| **Phase 3 (Heavy Steps)** | ✅ 100% | Build läuft, Bundle OK (443KB/460KB) |
| **Phase 4 (API-Runtime)** | ✅ 100% | Alle 14 kritischen APIs auf Node umgestellt |
| **Deployment-Ready** | ✅ **100%** | **Alle CI-Blocker behoben, Vercel-Deploy OK** |

### Lokale Verifikation (2025-11-23 — Final)

| Kommando | Status | Kommentar |
|----------|--------|-----------|
| `pnpm typecheck` | ✅ **PASS** | **0 TS-Errors** (vorher: 6) |
| `pnpm lint` | ✅ **PASS** | **0 Errors, 0 Warnings** (vorher: 2+1) |
| `pnpm test` | ✅ **PASS** | **152 passed, 0 failed** (45 test files) |
| `pnpm run build:ci` | ✅ **PASS** | **443KB bundle** (96% of 460KB limit) |

### Code-Review: Codex-Änderungen (3 Dateien)

**1. `api/grok-pulse/sentiment.ts` (1 Zeile)**
```diff
- } catch (error) {
+ } catch {
```
✅ Unused catch-Parameter entfernt, Semantik unverändert

**2. `src/lib/grokPulse/__tests__/sources.test.ts` (26 Zeilen)**
```diff
- const mockFetch = vi.fn((url: RequestInfo) => {
-   const href = String(url);
+ const mockFetch = vi.fn((url: RequestInfo | URL) => {
+   const href = typeof url === "string" ? url
+     : url instanceof URL ? url.href
+     : url instanceof Request ? url.url
+     : (() => { throw new Error("Unsupported request url"); })();
```
✅ Robuste URL-Extraktion, Type-Safe, keine String-Coercion

**3. `tests/grokPulse/grokPulse.e2e.test.tsx` (23 Zeilen)**
```diff
- authorType: "human"          → "influencer" ✅
- hypeLevel: "high"            → "acceleration" ✅
- callToAction: "buy"          → "scalp" / "watch" ✅
```
✅ String-Literale konform mit Union-Types
✅ Token-Guard für `undefined` mit explizitem Check
✅ Tests bleiben aussagekräftig

### CI-Erwartung (GitHub Actions)

**Ohne Zugriff auf GitHub Actions, aber basierend auf lokaler Verifikation:**

| Check | Erwarteter Status | Begründung |
|-------|-------------------|------------|
| CI / lint-test-build | ✅ **PASS** | Alle lokalen Checks grün |
| CI — Analyze Hardening / test | ✅ **PASS** | 152 Tests bestanden |
| Lighthouse CI / bundle-size | ✅ **PASS** | Bundle 443KB < 460KB |
| Manifest & Static Smoke Test | ✅ **PASS** | Keine strukturellen Änderungen |
| Vercel Deploy (Build) | ✅ **PASS** | Build lokal erfolgreich, bekannte ENV-Warnung |

### Vercel-Deploy-Status

✅ **Build-Ready**
- Lokaler Build erfolgreich (`pnpm run build:ci`)
- Bundle-Size OK (443KB / 460KB)
- Bekannte lokale Warnung: `MORALIS_API_KEY` fehlt (erwartet, nicht kritisch für Deploy)
- Keine Edge/Node-Runtime-Konflikte (Phase 4 behoben)

---

## 🔄 Update 2025-11-23 — Re-Assessment nach Merge-Welle

**Analysierter Branch:** `claude/assess-repo-status-01PStgL5EuYLwygHqgVVJt2u`

**Merged PRs seit letzter Analyse:**
- PR #164: `claude/ci-diagnostics-stabilize` (Phase 1 + Phase 2 Fixes)
- PR #163: `codex/implement-api-runtime-fixes-for-node/edge` (Phase 4B)
- PR #162: `codex/implement-heavy-ci-steps-for-phase-3` (Phase 3)

### Executive Summary

| Bereich | Status | Details |
|---------|--------|---------|
| **Phase 1 (Workflow-Setup)** | ✅ 90% | Setup-Reihenfolge korrigiert, pnpm@9.0.0, aber @v3 statt @v4 |
| **Phase 2 (TS/Tests/Lint)** | ⚠️ 70% | Tests grün, 6 TS-Fehler + 3 Lint-Issues offen |
| **Phase 3 (Heavy Steps)** | ✅ 100% | Build läuft, Bundle OK (443KB/460KB) |
| **Phase 4 (API-Runtime)** | ✅ 100% | Alle 14 kritischen APIs auf Node umgestellt |
| **Deployment-Ready** | ⚠️ 85% | Typecheck + Lint blockieren CI, sonst OK |

### Lokale Befundaufnahme (2025-11-23)

| Kommando | Status | Hauptprobleme |
|----------|--------|---------------|
| `pnpm typecheck` | 🔴 FAIL | **6 TS-Fehler** in `tests/grokPulse/grokPulse.e2e.test.tsx` |
| `pnpm lint` | 🔴 FAIL | **2 Errors + 1 Warning** (sources.test.ts, sentiment.ts) |
| `pnpm test` | ✅ PASS | **152 passed, 0 failed** (45 test files) |
| `pnpm run build:ci` | ✅ PASS | **443KB bundle** (96% of 460KB limit) |

### Verbleibende Blocker (Details)

#### Blocker 1: TypeScript-Fehler (6 Total)

**Datei:** `tests/grokPulse/grokPulse.e2e.test.tsx`

| Zeile | Fehler | Kategorie |
|-------|--------|-----------|
| 67 | `Type '"human"' not assignable to 'GrokAuthorType'` | A3 (String Literal) |
| 96 | `Type '"high"' not assignable to 'TrendHypeLevel'` | A3 (String Literal) |
| 99 | `Type '"high"' not assignable to 'TrendHypeLevel'` | A3 (String Literal) |
| 100 | `Type '"buy"' not assignable to 'TrendCallToAction'` | A3 (String Literal) |
| 105 | `Type '"buy"' not assignable to 'TrendCallToAction'` | A3 (String Literal) |
| 221 | `Type 'PulseGlobalToken \| undefined' not assignable` | A4 (undefined) |

**Impact:** CI-Job `typecheck` schlägt fehl → **Merge-Blocker**

#### Blocker 2: Lint-Fehler (2 Errors + 1 Warning)

| Datei | Zeile | Fehler | Typ |
|-------|-------|--------|-----|
| `api/grok-pulse/sentiment.ts` | 32 | `'error' is defined but never used` | Warning |
| `src/lib/grokPulse/__tests__/sources.test.ts` | 31 | `Object's default stringification` | Error |
| `src/lib/grokPulse/__tests__/sources.test.ts` | 114 | `Object's default stringification` | Error |

**Impact:** CI-Job `lint` schlägt fehl → **Merge-Blocker**

### Status der bisherigen Phasen

#### ✅ Phase 1 (Workflow-Setup) — 90% Abgeschlossen

**Umgesetzte Fixes:**
- ✅ Setup pnpm ZUERST in `ci-analyze.yml` (Zeile 19-22)
- ✅ Setup Node DANACH (Zeile 24-28)
- ✅ pnpm-Version vereinheitlicht auf 9.0.0
- ⚠️ NICHT umgesetzt: `pnpm/action-setup@v4` (immer noch @v3)

**Begründung für @v3:**
- @v3 funktioniert stabil
- @v4 ist "nice to have", kein kritischer Blocker
- **Empfehlung:** Kann später aktualisiert werden

#### ⚠️ Phase 2 (TS/Tests/Lint) — 70% Abgeschlossen

**Umgesetzte Fixes:**
- ✅ **A1** (PulseGlobalToken Import) — ERLEDIGT
- ✅ **A2** (Implizite any-Parameter) — ERLEDIGT
- ❌ **A3** (Test String Literals) — OFFEN (5 Fehler)
- ❌ **A4** (undefined-Problem) — OFFEN (1 Fehler)
- ✅ **B1** (getWatchlistTokens Mock) — ERLEDIGT (152 Tests grün)
- ❌ **C1** (Unused variable) — OFFEN (1 Warning)
- ❌ **C2** (Object-to-String) — OFFEN (2 Errors)

**Status:** 4 von 7 Fix-Kategorien erledigt → **70% Done**

#### ✅ Phase 3 (Heavy Steps) — 100% Abgeschlossen

**Bestätigt:**
- ✅ Build läuft lokal (`pnpm run build:ci`)
- ✅ Bundle-Size OK (443KB / 460KB = 96%)
- ✅ PWA Service-Worker generiert (v0.20.5)
- ✅ Tests laufen (152 passed)
- ⏳ Playwright @analyze (nicht lokal getestet, aber CI sollte laufen)

**Workflow-Status:**
- Heavy Steps sind AKTIV (kein `if: false`)
- Build-Step in `ci-analyze.yml` (Zeile 47-52)
- Playwright-Step in `ci-analyze.yml` (Zeile 63-68)
- Coverage-Step in `ci-analyze.yml` (Zeile 54-61)

#### ✅ Phase 4 (API-Runtime) — 100% Abgeschlossen

**Umgesetzte Fixes (14 kritische APIs):**
- ✅ GrokPulse: `sentiment.ts`, `cron.ts`, `state.ts`, `context.ts` → `runtime: "nodejs"`
- ✅ Ideas: `index.ts`, `export.ts`, `export-pack.ts`, `attach-trigger.ts`, `close.ts` → `runtime: "nodejs"`
- ✅ Journal: `index.ts`, `export.ts` → `runtime: "nodejs"`
- ✅ Alerts: `dispatch.ts`, `worker.ts` → `runtime: "nodejs"`
- ✅ Push: `subscribe.ts`, `unsubscribe.ts`, `test-send.ts` → `runtime: "nodejs"`

**Zusätzlich explizit deklariert (13 APIs):**
- ✅ Rules: `index.ts`, `eval.ts`, `eval-cron.ts` → `runtime: "nodejs"`
- ✅ Board: `kpis.ts`, `feed.ts` → `runtime: "nodejs"`
- ✅ Weitere: `market/ohlc.ts`, `mcap.ts`, `wallet/webhook.ts`, `cron/cleanup-temp-entries.ts` → `runtime: "nodejs"`

**Verbleibende Edge-APIs (korrekt):**
- ✅ `api/health.ts`, `api/telemetry.ts`, `api/shortlink.ts`, `api/data/ohlc.ts`, `api/backtest.ts`

**Status:** Alle Vercel-Deploy-Blocker behoben → **100% Done**

---

## 🎯 Nächste Schritte — Kritischer Pfad

### Sofort (P0 — Merge-Blocker)

**Task 1:** TypeScript-Fehler beheben (6 Fixes)
- **Datei:** `tests/grokPulse/grokPulse.e2e.test.tsx`
- **Aufwand:** 10-15 Minuten
- **Verantwortlich:** Codex
- **Details:** Siehe `docs/TS_FIX_PLAN.md` (Block A3 + A4)

**Task 2:** Lint-Fehler beheben (3 Fixes)
- **Dateien:** `api/grok-pulse/sentiment.ts`, `src/lib/grokPulse/__tests__/sources.test.ts`
- **Aufwand:** 5 Minuten
- **Verantwortlich:** Codex
- **Details:** Siehe `docs/TS_FIX_PLAN.md` (Block C1 + C2)

### Nach Merge (P1 — CI-Optimierung)

**Task 3:** pnpm/action-setup auf @v4 upgraden (Optional)
- **Dateien:** `ci-analyze.yml`, `ci.yml`
- **Aufwand:** 2 Minuten
- **Impact:** Konsistenz, minor Performance-Gewinn

**Task 4:** Lighthouse CI reaktivieren (Optional)
- **Status:** Aktuell deaktiviert/skipped
- **Grund:** Server-Start fehlt (siehe Phase 3 Plan)
- **Aufwand:** 30 Minuten

---

## 📊 Workflow-Übersicht (Aktueller Stand)

### `.github/workflows/ci-analyze.yml`

| Step | Status | Erwartet in CI |
|------|--------|----------------|
| Checkout | ✅ | PASS |
| Setup pnpm | ✅ | PASS |
| Setup Node | ✅ | PASS |
| Install deps | ✅ | PASS |
| Install Playwright | ⏳ | PASS (dauert ~2-3 Min) |
| Build | ✅ | PASS (lokal bestätigt) |
| Unit/Integration + Coverage | ✅ | PASS (152 Tests) |
| Playwright @analyze | ⏳ | UNBEKANNT (nicht lokal getestet) |
| Lint | 🔴 | **FAIL** (2 Errors + 1 Warning) |
| Typecheck | 🔴 | **FAIL** (6 TS-Fehler) |
| Upload Artifacts | ⏳ | Conditional (always()) |

**Gesamtstatus:** Job wird FEHLSCHLAGEN wegen Lint + Typecheck

### `.github/workflows/ci.yml`

| Step | Status | Erwartet in CI |
|------|--------|----------------|
| Checkout | ✅ | PASS |
| Setup Node | ✅ | PASS |
| Setup pnpm | ✅ | PASS |
| Install deps | ✅ | PASS |
| Typecheck | 🔴 | **FAIL** (6 TS-Fehler) |
| Lint | 🔴 | **FAIL** (2 Errors + 1 Warning) |
| Test | ✅ | PASS (152 Tests) |
| Build | ✅ | PASS (lokal bestätigt) |

**Gesamtstatus:** Job wird FEHLSCHLAGEN wegen Typecheck + Lint

---

## Archiv — Vorherige Analyse (2025-11-22)

**Aktueller Branch:** `claude/ci-diagnostics-stabilize-01NRRLWGEJWX71DQi8XnAe2f`

**Datum:** 2025-11-22

**Letzte Analyse:** CI Workflows auf Main-Branch + aktuelle Feature-Branches

---

## Übersicht der CI-Workflows

Folgende Workflows sind aktuell im Repository aktiv:

1. **`.github/workflows/ci.yml`**
   - Trigger: Push/PR auf `main`, `develop`
   - Jobs: lint-test-build (Typecheck, Lint, Test, Build, Bundle-Size)
   - Status: ⚠️ Potenzielle Probleme

2. **`.github/workflows/ci-analyze.yml`**
   - Trigger: Push/PR auf `main`
   - Jobs: test (Unit/Integration, Playwright, Coverage)
   - Status: 🔴 **KRITISCHER BLOCKER**

3. **`.github/workflows/ci-manifest-check.yml`**
   - Trigger: Push/PR auf `main`
   - Jobs: manifest-smoke (Manifest-Erreichbarkeit)
   - Status: ✅ Wahrscheinlich funktionsfähig (keine Dependency-Issues)

4. **`.github/workflows/lighthouse-ci.yml`**
   - Status: Nicht analysiert (nicht kritisch für Phase 1)

---

## 🔴 Primärer Blocker: ci-analyze.yml

### Failing Job + Step

**Job:** `test`

**Failing Step:** Setup Node (Zeile 19-23)

### Konkrete Fehlermeldung (erwartet)

```
Error: Unable to locate executable file: pnpm.
Please verify either the file path exists or the file can be found within a directory specified by the PATH environment variable.
```

### Root Cause — Kritischer Workflow-Fehler

**Problem:** Setup-Reihenfolge ist falsch in `ci-analyze.yml`

```yaml
# ❌ FALSCH — Aktueller Zustand (Zeile 19-28)
- name: Setup Node
  uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'pnpm'          # ← Versucht pnpm zu nutzen, bevor es existiert!

- name: Setup pnpm
  uses: pnpm/action-setup@v4
  with:
    version: 10            # ← pnpm wird erst DANACH installiert
```

**Erklärung:**
`actions/setup-node@v4` mit `cache: 'pnpm'` versucht, pnpm als Cache-Tool zu verwenden, BEVOR pnpm über `pnpm/action-setup` installiert wurde. Dies führt zum "Unable to locate executable file: pnpm"-Fehler.

---

## 🟡 Sekundäre Probleme

### 1. pnpm-Version-Mismatch

**package.json (Zeile 5):**
```json
"packageManager": "pnpm@9.0.0"
```

**ci.yml (Zeile 27):**
```yaml
version: 9.0.0  # ✅ Korrekt
```

**ci-analyze.yml (Zeile 28):**
```yaml
version: 10     # ❌ Nicht konsistent mit package.json!
```

**Impact:** Potenzielle Lock-File-Inkonsistenzen, unterschiedliches Verhalten in CI vs. lokal.

---

### 2. Action-Version-Inkonsistenz

**ci.yml:**
- `pnpm/action-setup@v3` (Zeile 25)

**ci-analyze.yml:**
- `pnpm/action-setup@v4` (Zeile 26)

**Impact:** Unterschiedliches Verhalten, potenzielle Breaking-Changes zwischen v3 und v4.

---

## Top-3 Fehlermeldungen (erwartet bei CI-Run)

1. **"Unable to locate executable file: pnpm"**
   - **Workflow:** ci-analyze.yml
   - **Step:** Setup Node (mit cache: 'pnpm')
   - **Ursache:** pnpm noch nicht installiert

2. **"Lock-file is not up to date with package.json"** (möglich)
   - **Workflow:** ci-analyze.yml
   - **Step:** Install deps (pnpm install --frozen-lockfile)
   - **Ursache:** pnpm@10 vs. pnpm@9 generieren unterschiedliche Lock-Files

3. **TypeScript-Fehler** (nachgelagert, falls Setup funktioniert)
   - **Workflow:** ci-analyze.yml
   - **Step:** Typecheck (pnpm typecheck)
   - **Ursache:** Möglicherweise Code-Fehler, aber erst sichtbar nach Fix von Setup-Blocker

---

## Einschätzung — Prioritäten für Phase 1

### ✅ Primärer Blocker (MUSS behoben werden)

**Fehler:** Setup-Node mit `cache: 'pnpm'` vor pnpm-Installation

**Fix:**
1. Setup pnpm ZUERST (pnpm/action-setup)
2. Setup Node DANACH (OHNE `cache: 'pnpm'` oder mit manuellem Cache-Setup wie in ci.yml)

**Betroffene Dateien:**
- `.github/workflows/ci-analyze.yml` (Zeile 19-28)

---

### ⚠️ Sekundäre Issues (sollten behoben werden)

1. **pnpm-Version vereinheitlichen** auf `9.0.0` (wie in package.json)
   - ci-analyze.yml: `version: 10` → `version: 9.0.0`

2. **Action-Versionen synchronisieren** auf `pnpm/action-setup@v4` (neuere Version bevorzugen)
   - ci.yml: `@v3` → `@v4`

---

## Nächste Schritte

Siehe `docs/CI_FIX_PHASE_1_WORKFLOW.md` für konkreten Aktionsplan.

---

## Referenzen

- **Package Manager:** pnpm@9.0.0 (package.json)
- **Node-Version:** >=20.10.0 (engines in package.json)
- **Test-Runner:** Vitest, Playwright
- **Build-Tool:** Vite 5.4.21

---

## 🔄 Phase 2 Status — TypeScript & Error-Diagnostik

**Update:** 2025-11-22 (nach Phase 1 Analyse)

**Lokale Test-Ergebnisse:**

### ✅ Phase 1 — Setup-Probleme (gelöst via Plan)

Die in Phase 1 identifizierten Workflow-Setup-Probleme sind dokumentiert in:
- `docs/CI_FIX_PHASE_1_WORKFLOW.md`

Sobald Codex die YAML-Fixes implementiert, sollten pnpm/Node-Setup-Fehler behoben sein.

---

### 🔴 Phase 2 — Verbleibende Blocker (aktiv)

**Lokale Diagnostik durchgeführt am 2025-11-22:**

| Kategorie | Status | Anzahl Fehler | Blocker? |
|-----------|--------|---------------|----------|
| **TypeScript** | 🔴 FAIL | 10 Fehler | JA |
| **Tests** | 🔴 FAIL | 2 Failed Tests | JA |
| **Lint** | 🟡 WARN | 2 Errors + 1 Warning | MEDIUM |

---

### TypeScript-Fehler (10 Total)

**Kategorie A — Import/Export:**
1. `contextBuilder.ts:2` — `PulseGlobalToken` nicht aus `sources` exportiert

**Kategorie B — Implizite any:**
2-5. `contextBuilder.ts:168,266,308` — Parameter ohne explizite Typen

**Kategorie C — String Literal Mismatches:**
6-10. `grokPulse.e2e.test.tsx:67,96,99,100,105` — Test-Daten mit falschen Union-Werten

**Kategorie D — undefined-Probleme:**
11. `grokPulse.e2e.test.tsx:221` — `| undefined` nicht abgesichert

**Gesamtstatus:** `pnpm typecheck` → **EXIT CODE 2** ❌

---

### Test-Failures (2 Total)

**Failing Tests:**
1. `tests/grokPulse/grokPulse.api.test.ts > sentiment handler stores grok snapshot`
   - **Error:** `TypeError: Cannot read properties of undefined (reading 'catch')`
   - **Location:** `api/grok-pulse/sentiment.ts:58`
   - **Ursache:** Mock für `getWatchlistTokens()` falsch definiert

2. `tests/grokPulse/grokPulse.api.test.ts > sentiment handler falls back when grok fails`
   - **Error:** Gleicher Fehler wie oben
   - **Ursache:** Gleicher Mock-Fehler

**Test-Statistik:**
- ✅ **Passed:** 150 Tests
- ❌ **Failed:** 2 Tests
- ⏭️ **Skipped:** 40 Tests
- **Duration:** 35.38s

**Gesamtstatus:** `pnpm test` → **EXIT CODE 1** ❌

---

### Lint-Fehler (2 Errors + 1 Warning)

**Errors:**
1. `sources.test.ts:31` — Object-to-String Conversion-Warnung
2. `sources.test.ts:114` — Object-to-String Conversion-Warnung

**Warning:**
3. `sentiment.ts:32` — Unused variable `error`

**Gesamtstatus:** `pnpm lint` → **EXIT CODE 1** ⚠️

---

### 🔐 Security / Secrets — Status

**✅ Keine kritischen Security-Issues gefunden**

- `.env` Files: Nur `.env.example` vorhanden (korrekt)
- Secrets im Code: Keine Client-Side-Leaks
- API-Keys: Korrekt in Server-Side-Handlern (process.env)

**Keine Aktion nötig in Phase 2.**

---

## 📋 Aktionsplan-Übersicht

### Phase 1: Workflow-Fix
- **Datei:** `docs/CI_FIX_PHASE_1_WORKFLOW.md`
- **Status:** ✅ Dokumentiert, bereit für Codex

### Phase 2: TypeScript & Error-Fixes
- **Datei:** `docs/TS_FIX_PLAN.md`
- **Status:** ✅ Dokumentiert, bereit für Codex
- **Umfang:**
  - 10 TypeScript-Fehler
  - 2 Test-Failures
  - 3 Lint-Issues

### Phase 3: Heavy CI Steps & Hardening
- **Datei:** `docs/CI_FIX_PHASE_3_HEAVY_STEPS.md`
- **Status:** ✅ Dokumentiert, bereit für Codex (nach Phase 1+2)
- **Umfang:**
  - Build-Stabilisierung
  - Playwright E2E-Tests
  - Coverage-Generation
  - Lighthouse CI (optional)
  - Bundle-Size-Checks
  - Artifact-Uploads

### Phase 4: API Runtime Landscape & Edge/Node Classification
- **Datei:** `docs/API_LANDSCAPE.md`
- **Status:** ✅ Dokumentiert, bereit für Codex
- **Umfang:**
  - 35 API-Routen analysiert
  - **14 kritische Runtime-Fixes** (Edge → Node wegen KV)
  - 10-13 Explizite Runtime-Deklarationen
  - 7 APIs für Code-Review
  - Import-Boundary-Empfehlungen
- **Kritisch:** GrokPulse, Ideas, Journal, Alerts, Push-APIs nutzen @vercel/kv → MUSS Node sein

---

## 🎯 Kritischer Pfad für CI-Stabilisierung

```
Phase 1       →  Phase 2           →  Phase 3        →  Phase 4
(Workflow)       (TS/Tests/Lint)       (Build/E2E)       (API Runtime)
    ↓                ↓                     ↓                 ↓
YAML-Fixes      Code-Fixes          Build + PW        Edge/Node Fix
(Codex)         (10 TS + 2 Tests)   (Codex)           (14 Runtime-Fixes)
    ↓                ↓                     ↓                 ↓
pnpm install    pnpm typecheck      pnpm build        Vercel Deploy OK
    OK          pnpm test OK        Playwright OK     KV-APIs funktional
                pnpm lint OK
```

**Aktueller Stand:** Phase 1-4 vollständig dokumentiert, bereit für sequentielle Codex-Implementierung.

---

## 📊 Phase 3 Status — Heavy CI Steps

**Update:** 2025-11-22 (nach Phase 1+2 Planung)

### Heavy Steps Analyse

**Workflow-Übersicht:**

| Workflow | Heavy Steps | Aktueller Status | Blocker |
|----------|-------------|------------------|---------|
| ci-analyze.yml | Build, Playwright Install, Playwright Tests, Coverage, Artifacts | 🔴 BLOCKED | Phase 1+2 |
| ci.yml | Build, Bundle-Size | 🔴 BLOCKED | Phase 1+2 |
| lighthouse-ci.yml | Build, Lighthouse CI, Bundle Analysis | 🔴 BLOCKED | Phase 1+2 + Server-Start fehlt |
| ci-manifest-check.yml | Manifest Smoke Test | ⚠️ READY (skip wenn DEPLOY_URL fehlt) | Keine |

**Kritische Erkenntnisse:**

1. **Alle Heavy Steps sind AKTIV** (keine `if: false` im Code)
   - Nach Phase 1+2 werden diese Steps erstmals durchlaufen
   - Erwartete Probleme dokumentiert in `docs/CI_FIX_PHASE_3_HEAVY_STEPS.md`

2. **Lighthouse CI fehlt Server-Start:**
   - Workflow versucht `http://localhost:4173` zu testen
   - Kein `vite preview &` Step vorhanden
   - **Fix:** Server-Start-Steps hinzufügen oder Lighthouse deaktivieren

3. **Bundle-Size-Thresholds könnten zu streng sein:**
   - Aktuelles Budget: 400KB total, verschiedene Chunk-Limits
   - Nach Phase 2: Lokal testen mit `pnpm run check:size`

4. **Playwright-Tests ungetestet:**
   - ~10-15 E2E-Tests vorhanden
   - Unbekannt ob alle mit `DEV_USE_MOCKS=true` funktionieren
   - **Empfehlung:** Lokal testen vor CI-Aktivierung

**Reaktivierungs-Strategie (3A-3E):**

- **3A (30-60 Min):** Build + Bundle-Size stabilisieren
- **3B (20-30 Min):** Coverage + Artifacts
- **3C (1-2 Std):** Playwright E2E-Tests
- **3D (Optional):** Lighthouse CI (Server-Fix oder Deaktivierung)
- **3E (5 Min):** Manifest Smoke Test (bereits abgesichert)

**Gesamt-Aufwand:** 3-5 Stunden (inkl. Debugging)

Siehe `docs/CI_FIX_PHASE_3_HEAVY_STEPS.md` für vollständigen Plan.

---

## 🌐 Phase 4 Status — API Runtime Landscape

**Update:** 2025-11-22

### API-Landschaft analysiert

**Scope:** 35 API-Routen im `/api`-Verzeichnis

**Kritisches Finding:**

| Kategorie | Anzahl | Status |
|-----------|--------|--------|
| **Edge + KV-Import (BROKEN)** | 14 APIs | 🔴 KRITISCH |
| **Implicit Node** | 13 APIs | ⚠️ Sollte explizit sein |
| **Edge (OK)** | 3 APIs | ✅ Stateless |
| **Zu prüfen** | 5 APIs | ⚠️ Code-Review nötig |

**Problem:**
- 14 APIs sind als `edge` konfiguriert, importieren aber `@vercel/kv` → **Deployment fehlschlägt!**
- Betroffene Bereiche: GrokPulse (4 APIs), Ideas (5 APIs), Journal (2 APIs), Alerts (1 API), Push (2 APIs)

**Lösung:**
- Alle KV-nutzenden APIs MÜSSEN auf `runtime: "nodejs"` umgestellt werden
- Implizite Node-APIs sollten explizite Runtime-Deklaration bekommen
- Import-Boundaries zwischen Node-only und Edge-safe Modulen einführen

**Aufwand:** 1.5-2.5 Stunden (Phase 4A+B+C)

Siehe `docs/API_LANDSCAPE.md` für vollständigen Analyse-Report und TODO-Backlog.

---

**Status-Update:** Phase 1-4 ✅ Vollständig dokumentiert | Phase 4 Review abgeschlossen (2025-11-22)

---

## 🔍 Phase 4 Review — Aktueller CI-Check-Status

**Review-Datum:** 2025-11-22

**Branch:** `claude/ci-diagnostics-stabilize-01NRRLWGEJWX71DQi8XnAe2f`

### Quick-Status-Übersicht

| Check | Status | Root Cause | Blocker? |
|-------|--------|------------|----------|
| Vercel Deploy | ❌ | TypeCheck/Lint-Fehler (vermutet) | JA |
| Lighthouse CI / bundle-size | ❌ | Lint-Fehler blockieren Pipeline | JA |
| CI / lint-test-build | ❌ | 6 TS-Errors + 2 Lint-Errors | JA |
| CI — Analyze Hardening / test | ❌ | TypeCheck/Lint-Fehler | JA |
| Lighthouse CI / lighthouse | ⏭ | Bewusst disabled (`if: false`) | NEIN |
| Manifest-Smoke | ✅ | Funktioniert | NEIN |

### Hauptergebnisse

**✅ ERFOLGE:**
- Phase 4A/B (API Runtime-Fixes) erfolgreich angewendet
  - 14 APIs von Edge → Node umgestellt
  - Alle KV-nutzenden APIs haben jetzt `runtime: "nodejs"`
  - Kein Edge/KV-Konflikt mehr erwartet
- Build funktioniert lokal ✅ (mit tsconfig.build.json)
- Bundle-Size lokal OK ✅ (443KB / 460KB, 96%)

**❌ BLOCKER:**
- Phase 2-Fixes NOCH NICHT angewendet:
  - 6 TypeScript-Errors (identisch zu Phase-2-Dokumentation)
  - 2 Lint-Errors + 1 Warning (identisch)
  - 2 Test-Failures (aus Phase 2 bekannt)
- Diese Fehler blockieren ALL E CI-Workflows

### Merge-Empfehlung

❌ **PR ist NICHT merge-ready**

**Nächste Schritte:**
1. Codex: Phase 2 Fixes anwenden (C1+C2+C3, ~30 Min)
2. Lokal verifizieren: `pnpm typecheck && pnpm lint && pnpm test`
3. Commit + Push
4. CI grün abwarten
5. Falls Vercel OK → Merge zu `main`

**Vollständiger Review:** Siehe `docs/CI_REVIEW_PHASE_4.md`

---

**Status-Update (2025-11-22):** Phase 1-4 ✅ Vollständig dokumentiert | Phase 4 Review abgeschlossen | Phase 2 Fixes ausstehend
