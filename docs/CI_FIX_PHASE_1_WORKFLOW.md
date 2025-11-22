# Phase 1 — CI Workflow Stabilisierung

**Ziel:** Minimaler CI-Job (Checkout + pnpm + Node + Install + Typecheck) läuft grün auf allen Workflows.

**Branch:** `claude/ci-diagnostics-stabilize-01NRRLWGEJWX71DQi8XnAe2f`

**Verantwortlich:** Codex (Code-Änderungen) + Claude (Planung & Review)

**Datum:** 2025-11-22

---

## 🎯 Ziel von Phase 1

Ein **minimaler, stabiler CI-Job** der folgendes ERFOLGREICH ausführt:

1. ✅ Checkout (Code auschecken)
2. ✅ Setup pnpm (Package-Manager installieren)
3. ✅ Setup Node (Node.js runtime installieren)
4. ✅ Install deps (Dependencies aus pnpm-lock.yaml installieren)
5. ✅ Typecheck (TypeScript strict-mode Validierung)

**Keine schweren Steps** (Build, Playwright, Lighthouse) in Phase 1 — diese werden in Phase 2+ aktiviert.

---

## 📋 Betroffene Dateien

### Primär (MUSS geändert werden)

1. **`.github/workflows/ci-analyze.yml`**
   - **Problem:** Setup-Reihenfolge falsch (Node vor pnpm)
   - **Problem:** pnpm-Version nicht konsistent (10 statt 9.0.0)
   - **Action:** Setup-Steps neu ordnen, Version korrigieren

### Sekundär (SOLLTE geändert werden)

2. **`.github/workflows/ci.yml`**
   - **Problem:** pnpm-Action-Version veraltet (@v3 statt @v4)
   - **Action:** Auf @v4 aktualisieren für Konsistenz

---

## 🔧 Konkrete Änderungen für Codex

### Änderung 1: ci-analyze.yml — Setup-Reihenfolge korrigieren

**Datei:** `.github/workflows/ci-analyze.yml`

**Zeilen:** 19-28

**Aktueller Zustand (FALSCH):**

```yaml
- name: Setup Node
  uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'pnpm'          # ❌ pnpm existiert noch nicht!

- name: Setup pnpm
  uses: pnpm/action-setup@v4
  with:
    version: 10            # ❌ Version-Mismatch
```

**Neuer Zustand (KORREKT):**

```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v4
  with:
    version: 9.0.0         # ✅ Konsistent mit package.json

- name: Setup Node
  uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'pnpm'          # ✅ pnpm ist jetzt installiert
```

**Begründung:**
- pnpm MUSS vor Node-Setup installiert sein, wenn `cache: 'pnpm'` verwendet wird
- Version 9.0.0 stimmt mit `package.json` überein

---

### Änderung 2: ci-analyze.yml — Schwere Steps deaktivieren (optional für Phase 1)

**Datei:** `.github/workflows/ci-analyze.yml`

**Zeilen:** 36-85 (Build, Playwright, Coverage-Upload)

**Optionale Strategie:** Temporär deaktivieren für schnelleres Feedback

**Methode A — Komplette Steps auskommentieren:**

```yaml
# - name: Build
#   env:
#     DEV_USE_MOCKS: 'true'
#     ANALYZE_IDEA_PACKET: 'true'
#     NODE_ENV: 'test'
#   run: pnpm build

# ... (weitere Steps auskommentieren)
```

**Methode B — if: false Condition (sauberer):**

```yaml
- name: Build
  if: false  # Temporär deaktiviert für Phase 1
  env:
    DEV_USE_MOCKS: 'true'
    ANALYZE_IDEA_PACKET: 'true'
    NODE_ENV: 'test'
  run: pnpm build
```

**Empfehlung für Codex:**
- **Für Phase 1:** Methode B verwenden (`if: false`) für Build, Playwright, Coverage-Upload
- **Beibehalten:** Install deps, Typecheck, Lint (Core-Steps)
- **Grund:** Schnelleres Feedback (1-2 Min statt 10-20 Min), fokussiert auf Setup-Probleme

---

### Änderung 3: ci.yml — Action-Version aktualisieren

**Datei:** `.github/workflows/ci.yml`

**Zeile:** 25

**Aktueller Zustand:**

```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v3  # ❌ Veraltet
  with:
    version: 9.0.0
```

**Neuer Zustand:**

```yaml
- name: Setup pnpm
  uses: pnpm/action-setup@v4  # ✅ Konsistent mit ci-analyze.yml
  with:
    version: 9.0.0
```

**Begründung:**
- Konsistenz über alle Workflows
- pnpm/action-setup@v4 ist stabiler und besser getestet

---

## ✅ Akzeptanzkriterien für Phase 1

### Minimale Erfolgs-Kriterien (MUSS erfüllt sein)

GitHub Actions auf `claude/ci-diagnostics-stabilize-01NRRLWGEJWX71DQi8XnAe2f`:

1. ✅ **Checkout** — Code erfolgreich ausgecheckt
2. ✅ **Setup pnpm** — pnpm@9.0.0 installiert (keine "executable not found"-Fehler)
3. ✅ **Setup Node** — Node 20 installiert, pnpm-Cache funktioniert
4. ✅ **Install deps** — `pnpm install --frozen-lockfile` erfolgreich
5. ✅ **Typecheck** — `pnpm typecheck` ohne TypeScript-Fehler

**Workflow-Status:** ci-analyze.yml Job "test" zeigt ✅ grünen Haken (zumindest bis Typecheck)

---

### Erwartetes Ergebnis (bei grünem CI)

**Console-Output sollte enthalten:**

```
✓ Checkout
✓ Setup pnpm (pnpm@9.0.0 installed)
✓ Setup Node (Node 20.x, pnpm cache loaded)
✓ Install deps (lockfile up-to-date, X packages installed)
✓ Typecheck (No errors found)
✓ Lint (passed)
```

**NICHT in Phase 1 erwartet:**
- Build-Output (deaktiviert via `if: false`)
- Playwright-Tests (deaktiviert via `if: false`)
- Coverage-Upload (deaktiviert via `if: false`)

---

## 🚫 Was Codex NICHT tun soll (in Phase 1)

1. ❌ **Keine Code-Änderungen** in `src/` — nur Workflow-Files
2. ❌ **Keine TypeScript-Fixes** — falls Typecheck fehlschlägt, wird das in Phase 2 behandelt
3. ❌ **Keine Test-Fixes** — Playwright/Vitest-Fehler sind NICHT Teil von Phase 1
4. ❌ **Keine Dependency-Updates** — pnpm-lock.yaml nicht ändern
5. ❌ **Keine Secrets-Änderungen** — MORALIS_API_KEY etc. bleiben unverändert

**Fokus:** Nur Workflow-Setup stabilisieren, keine App-Logic anfassen.

---

## 📦 Step-by-Step Anleitung für Codex

### Schritt 1: ci-analyze.yml Setup-Reihenfolge korrigieren

```bash
# Datei öffnen
.github/workflows/ci-analyze.yml

# Zeilen 19-28 umstellen (siehe "Änderung 1" oben)
# 1. Setup pnpm zuerst (Zeile 25-28 → Zeile 19-22)
# 2. Setup Node danach (Zeile 19-23 → Zeile 24-28)
# 3. version: 10 → version: 9.0.0
```

---

### Schritt 2: ci-analyze.yml Schwere Steps deaktivieren

```bash
# Zeilen 36-85 (Build, Playwright, Coverage)
# Jedem Step "if: false" hinzufügen (siehe "Änderung 2" oben)

# Steps, die AKTIV bleiben:
# - Install deps (Zeile 30-31)
# - Typecheck (Zeile 62-63)
# - Lint (Zeile 59-60)

# Steps, die DEAKTIVIERT werden (if: false):
# - Install Playwright browsers
# - Build
# - Unit/Integration + Coverage
# - Playwright @analyze
# - Upload Playwright report
# - Upload traces
# - Upload coverage (lcov)
```

---

### Schritt 3: ci.yml Action-Version aktualisieren

```bash
# Datei öffnen
.github/workflows/ci.yml

# Zeile 25: @v3 → @v4
# (siehe "Änderung 3" oben)
```

---

### Schritt 4: Commit + Push

```bash
git add .github/workflows/ci-analyze.yml .github/workflows/ci.yml
git commit -m "ci: fix pnpm setup order and disable heavy steps for phase 1"
git push origin claude/ci-diagnostics-stabilize-01NRRLWGEJWX71DQi8XnAe2f
```

---

### Schritt 5: GitHub Actions Run beobachten

1. GitHub Repository öffnen
2. Actions Tab → "CI — Analyze Hardening" Workflow
3. Auf neuesten Run klicken (Branch: `claude/ci-diagnostics-stabilize-01NRRLWGEJWX71DQi8XnAe2f`)
4. Job "test" öffnen
5. Warten auf Ergebnis (ca. 1-2 Min ohne schwere Steps)

**Erwartung:**
- ✅ Setup pnpm — grün
- ✅ Setup Node — grün (Cache wird geladen oder erstellt)
- ✅ Install deps — grün
- ✅ Typecheck — grün (oder rot, dann Phase 2)
- ✅ Lint — grün (oder rot, dann Phase 2)

---

## 🔄 Wenn Phase 1 grün ist → Phase 2

**Phase 2 Ziele:**

1. TypeScript-Fehler beheben (falls Typecheck rot)
2. Lint-Fehler beheben (falls Lint rot)
3. Schwere Steps wieder aktivieren (`if: false` entfernen)
4. Build-Step grün bekommen
5. Vitest-Tests grün bekommen
6. Playwright @analyze grün bekommen

**Phase 2 Planung:** Separate Datei `docs/CI_FIX_PHASE_2_TESTS.md` (noch nicht erstellt)

---

## 📊 Monitoring & Rollback

### Erfolgs-Metriken

- **Primär:** CI-Job "test" läuft durch ohne Setup-Fehler
- **Sekundär:** Keine pnpm/Node-Cache-Fehler
- **Tertiär:** Workflow-Laufzeit <2 Min (ohne schwere Steps)

### Rollback-Plan (falls Phase 1 fehlschlägt)

1. Git-Commit rückgängig machen:
   ```bash
   git revert HEAD
   git push origin claude/ci-diagnostics-stabilize-01NRRLWGEJWX71DQi8XnAe2f
   ```

2. Neue Iteration mit angepasstem Fix

---

## 🔗 Referenzen

- **Status-Report:** `docs/CI_STATUS_NOW.md`
- **Package-Manager:** pnpm@9.0.0 (package.json Zeile 5)
- **Action-Docs:** https://github.com/pnpm/action-setup
- **Best Practice:** Setup pnpm VOR Node-Setup bei Verwendung von `cache: 'pnpm'`

---

**Bereit für Codex-Implementierung** ✅

**Nächster Schritt:** Codex führt Änderungen 1-3 aus, committed, pusht, beobachtet CI.
