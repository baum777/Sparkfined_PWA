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

**Status-Update:** Bereit für Phase 1 — Workflow-Fix
