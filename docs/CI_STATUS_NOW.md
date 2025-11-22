# CI Status Report — Sparkfined PWA

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

### Phase 3: Build & E2E (geplant)
- **Datei:** `docs/CI_FIX_PHASE_3_BUILD.md` (noch nicht erstellt)
- **Status:** 🔜 Nach Phase 2

---

## 🎯 Kritischer Pfad für CI-Stabilisierung

```
Phase 1 (Workflow)  →  Phase 2 (TypeScript/Tests/Lint)  →  Phase 3 (Build/E2E)
      ↓                          ↓                                  ↓
  YAML-Fixes           Code-Fixes (10 TS + 2 Tests)      Build + Playwright
   (Codex)                   (Codex)                         (Codex)
      ↓                          ↓                                  ↓
 pnpm install OK        pnpm typecheck OK              pnpm build OK
                        pnpm test OK                    Playwright OK
                        pnpm lint OK
```

**Aktueller Stand:** Phase 1 dokumentiert, Phase 2 dokumentiert, bereit für Codex-Implementierung.

---

**Status-Update:** Phase 1 ✅ Dokumentiert | Phase 2 ✅ Dokumentiert | Bereit für Codex
