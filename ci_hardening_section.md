# CI-Hardening Section – Sparkfined_PWA

## Zweck

Diese Section dokumentiert den schrittweisen Plan, um das CI-System (GitHub Actions + Bundle-Checks) stabil, reproduzierbar und performance-orientiert aufzusetzen.

Ziele:

- Vendor- und Gesamt-Bundle-Größen unter klar definierten Limits halten  
- Node-/Server-SDKs vom Client-Bundle fernhalten  
- Heavy-Libs (Charts, AI, OCR etc.) sauber splitten / lazy laden  
- CI-Builds reproduzierbar und aussagekräftig machen (keine „stale“ Runs)  
- Alle PRs durchlaufen denselben Hardening-Workflow (typecheck, lint, test, build, check:size)

Die Phasen werden **der Reihe nach** durchgearbeitet. Jede Phase kann als eigener PR behandelt werden, sollte aber am Ende als gesamtes System konsistent sein.

---

## Phase 0 – Basis & Sicherheit

**Ziel:** Stabile Toolchain + Verbot von Node-SDKs im Browser.

- [ ] `package.json`  
  - [ ] `engines.node` und CI-Node-Version auf `>=20.10.0` ausrichten  
  - [ ] `packageManager` und `pnpm-lock.yaml` synchron halten (`pnpm install --no-frozen-lockfile` + Commit)
- [ ] Verhindern, dass Node-/Server-SDKs im Client-Bundle landen  
  - [ ] Codebase nach Imports wie `openai`, `@aws-sdk/*`, `pg`, `fs`, etc. durchsuchen  
  - [ ] Falls nötig: betroffene Adapter auf **fetch-basierte Wrapper** umstellen (reine HTTP-Calls, keine SDKs)
- [ ] Einmalig `pnpm build` laufen lassen und sicherstellen, dass keine Node-spezifischen Fehler im Browser-Pfad auftreten

---

## Phase 1 – Charts & Heavy Libraries

**Ziel:** Heavy-Libs nur on-demand laden.

- [ ] **Lightweight-Charts**  
  - [ ] In `src/components/chart/AdvancedChart.tsx` und allen anderen Stellen:  
        - nur `import type { … } from 'lightweight-charts'`  
        - Runtime-Import ausschließlich über `await import('lightweight-charts')` (z. B. im `useEffect`)  
  - [ ] Sicherstellen, dass es **keinen** statischen `import { createChart } from 'lightweight-charts'` mehr gibt
- [ ] Weitere Heavy-Libs identifizieren (via `pnpm analyze`)  
  - [ ] Tesseract (`tesseract.js`)  
  - [ ] Driver.js (`driver.js`)  
  - [ ] Weitere große Module > ~60 KB  
- [ ] Entscheiden, welche dieser Libraries via Dynamic Import oder eigene Chunks ausgelagert werden

---

## Phase 2 – Vite manualChunks (Vendor-Splitting)

**Ziel:** Klare, nachvollziehbare Vendor-Chunks statt einem monolithischen Vendor-Bundle.

- [ ] `vite.config.ts`  
  - [ ] `manualChunks`-Konfiguration ergänzen, z. B.:

    ```ts
    manualChunks: {
      'vendor-react': ['react', 'react-dom', 'scheduler'],
      'vendor-router': ['react-router-dom'],
      'vendor-state': ['zustand'],
      'vendor-icons': ['lucide-react'],
      'vendor-workbox': ['workbox-window'], // falls im Client verwendet
      // ggf. weitere Splits siehe unten
    }
    ```

  - [ ] `lightweight-charts` **nicht** in manualChunks aufnehmen (bleibt dynamic import)
- [ ] Optional zusätzliche Splits für sehr große Libs  
  - [ ] `vendor-ocr`: `['tesseract.js']` (falls im Client)  
  - [ ] `vendor-onboarding`: `['driver.js']` (falls im Client)
- [ ] Fallback-Vendor definieren (z. B. via Helper-Funktion), damit restliche `node_modules` in einen generischen `vendor`-Chunk laufen

---

## Phase 3 – `scripts/check-bundle-size.mjs` härten

**Ziel:** Realistische, wartbare Limits ohne „pattern not found“-Rauschen.

- [ ] LIMITS-Map neu definieren, z. B.:

  ```js
  export const LIMITS = {
    'vendor-react': 115,
    'vendor-router': 40,
    'vendor-state': 20,
    'vendor-icons': 40,
    'vendor-workbox': 20,
    'vendor': 120,          // generischer Vendor-Fallback
    'index': 35,
    'chartLinks': 15,
    'chartTelemetry': 20,
  };

  export const TOTAL_BUDGET = 950; // in KB
````

* [ ] OPTIONAL_PATTERNS einführen

  * [ ] Muster wie `vendor-workbox`, `vendor-icons`, `vendor-router`, `vendor-state`, `analyze` als optional kennzeichnen, sodass fehlende Dateien nur als Info/Warning, nicht als Hard-Fail gewertet werden
* [ ] Optional: Top-N-Reporting

  * [ ] Beim Überschreiten von Limits die Top 5 größten Bundles inkl. Größe im Log ausgeben (hilft beim Debuggen)

---

## Phase 4 – Env & `check-env.js` Robustheit

**Ziel:** Keine Builds, die versehentlich Client-Secrets leaken oder an falschen Env-Keys scheitern.

* [ ] `scripts/check-env.js` prüfen

  * [ ] `MORALIS_API_KEY` (Server-only) ist Pflicht
  * [ ] Client-prefixed Secrets wie `VITE_MORALIS_API_KEY` werden aktiv blockiert
* [ ] GitHub Actions Secrets

  * [ ] Sicherstellen, dass im Repo nur `MORALIS_API_KEY` als Secret gesetzt ist
  * [ ] Kein `VITE_MORALIS_API_KEY` als Action-Secret verwenden
* [ ] Fehlermeldungen in `check-env.js` so formulieren, dass sie eindeutig erklären, welche Keys erlaubt oder zu entfernen sind
* [ ] Lokal `node scripts/check-env.js` ausführen, um sicherzustellen, dass Fehlermeldungen klar und reproduzierbar sind

---

## Phase 5 – CI-Workflow (GitHub Actions) Hardening

**Ziel:** Reproduzierbare CI-Läufe ohne „stale builds“ und mit vollem Hardening.

* [ ] Workflow-Datei `.github/workflows/ci.yml` pflegen

  * [ ] Trigger:

    ```yaml
    on:
      push:
        branches: [main, develop]
      pull_request:
        branches: [main, develop]
    ```

  * [ ] Job `lint-test-build` mit `runs-on: ubuntu-latest`
* [ ] Steps:

  * [ ] `actions/checkout@v4` mit `fetch-depth: 0`

  * [ ] `actions/setup-node@v4` mit Node `20.10.0`

  * [ ] `pnpm/action-setup@v3` mit pnpm `9.0.0`

  * [ ] (bewusst gewählt) pnpm-Cache-Strategie:

    * Entweder: Cache **deaktivieren** (maximale Reproduzierbarkeit)
    * Oder: Cache nur für `~/.pnpm-store` verwenden, Key basiert mindestens auf `pnpm-lock.yaml`

  * [ ] Dependencies installieren (je nach Strategie):

    ```bash
    pnpm install --frozen-lockfile
    # oder, falls Lockfile oft wechselt:
    pnpm install --no-frozen-lockfile
    ```

  * [ ] Typecheck: `pnpm run typecheck`

  * [ ] Lint: `pnpm run lint`

  * [ ] Tests: `pnpm test`

  * [ ] Build & Hardening: `pnpm run build:ci` (führt `build` + `check:size` aus)
* [ ] Optional: Commit-Freshness prüfen

  * [ ] Sicherstellen, dass CI auf `GITHUB_SHA` und nicht auf einem „stale“ Commit baut

---

## Phase 6 – Iterative Analyse-Schleife (Build → Analyze → Check Size)

**Ziel:** CI-Hardening nicht „blind“ einbauen, sondern iterativ verifizieren.

Für jeden CI-Hardening-Branch / -PR:

* [ ] Lokal oder im Codespace ausführen:

  * [ ] `pnpm build`
  * [ ] `pnpm analyze`
  * [ ] `pnpm run check:size`
* [ ] Nach jedem Lauf prüfen:

  * [ ] Wird ein Limit überschritten? →
    - manualChunks-Logik anpassen
    - ggf. Dynamic Import oder zusätzliche Splits einbauen
  * [ ] Fehlt ein erwartetes Pattern? →
    - prüfen, ob der Chunk wirklich existieren soll
    - ggf. `LIMITS` oder `OPTIONAL_PATTERNS` anpassen
  * [ ] Wird das Gesamtbudget (TOTAL_BUDGET) überschritten? →
    - Top-5-Chunks aus dem Analyzer anschauen
    - gezielt größte Verursacher entschärfen
* [ ] Zyklus wiederholen, bis alle drei Kommandos **fehlerfrei** und ohne kritische Warnings laufen

---

## Phase 7 – Abschluss & Dokumentation pro CI-Hardening-PR

**Ziel:** Jeder CI-Hardening-PR hinterlässt eine nachvollziehbare Spur.

* [ ] Abschluss-Kommentar im PR verfassen mit:

  * [ ] Liste der geänderten Dateien (`vite.config.ts`, `scripts/check-bundle-size.mjs`, CI-Workflow, ggf. Adapter/Imports)
  * [ ] Finaler Zustand der wichtigsten Chunks inkl. gzip-Größen (Output von `pnpm analyze` / `check:size`)
  * [ ] Screenshot-ähnliche Textausgabe von `pnpm run check:size` (letzter erfolgreicher Lauf)
  * [ ] Kurze Begründung, warum die finalen Limits stabil und zukunftssicher gewählt sind (z. B. Slack für React 19, neue AI-Module etc.)
* [ ] Prüfen, dass:

  * [ ] Alle CI-Jobs grün sind (Typecheck, Lint, Test, Build, check:size)
  * [ ] Keine „pattern not found“-Fehler mehr auftreten (nur ggf. bewusst tolerierte Warnings)
  * [ ] `TOTAL_BUDGET` eingehalten wird
  * [ ] Keine Node-/Server-SDKs im Client-Bundle landen
  * [ ] Charts und andere Heavy-Features lazy / on-demand geladen werden

---

## Definition of Done – CI-Hardening

Die CI-Hardening Section gilt als vollständig umgesetzt, wenn:

* [ ] Alle Phasen 0–7 einmal durchlaufen und im Repo nachvollziehbar angewendet wurden
* [ ] Der generische Vendor-Chunk und alle dedizierten Vendor-Chunks innerhalb ihrer Limits bleiben
* [ ] `pnpm build`, `pnpm analyze` und `pnpm run check:size` stabil und reproduzierbar laufen
* [ ] Neue Features/Libs ohne manuellen Eingriff frühzeitig vom Bundle-Check erfasst werden
* [ ] CI-Fehler auf echte Probleme hinweisen (nicht mehr auf alte Caches oder inkonsistente Konfigurationen)

---

