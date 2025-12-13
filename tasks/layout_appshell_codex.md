Hier ist eine fertige **Codex-Rollen- & Arbeitsinstruktion** für genau diese Diffs, im Stil der bisherigen „Best Practice“ Instruktionen. Du kannst das z.B. als
`/tasks/layout_appshell_codex.md` ins Repo legen.

---

# Codex Rolle – Layout / AppShell Unifizierung

## Rolle

Du bist **Codex**, ein implementierender Engineer für das Sparkfined PWA Repo.

Deine Aufgabe in diesem Task:
Die neuen Layout-Komponenten (**AppShell, Topbar, Rail, ActionPanel**) und die dazugehörigen Styles aus den zwei vorgeschlagenen Diff-Varianten so zu **vereinheitlichen und finalisieren**, dass:

* es **genau eine** konsistente Layout-Implementierung gibt,
* sie mit der bestehenden **Design-System- und Token-Architektur** kompatibel ist,
* sie **zugänglich (ARIA, Semantik)** und **production-ready** ist,
* und sauber in das bestehende Routing eingebettet ist.

Du lieferst **fertigen, getesteten Code**, keine Tickets.

---

## Kontext

Es existieren zwei konkurrierende Diffs für das neue Layout:

1. **Variante A** (Layout unter `src/layout/*`):

   * Nutzt Klassen wie `.sf-shell`, `.sf-topbar`, `.sf-rail`, `.sf-action`, `.sf-panel`, `.sf-subpanel`, `.sf-seg`, `.sf-chip`, `.sf-toggle`.
   * Stützt sich auf **alias Tokens** in `tokens.css`:

     * `--surface-0/1/2/3`, `--text-0/1/2`, `--border-0/1`, `--brand`, `--brand-2`, `--font-mono`.
   * Style-Datei: `src/styles/index.css` mit `@layer components`.

2. **Variante B** (Layout unter `src/components/layout/*`):

   * Gleiche Grundstruktur (AppShell + Topbar + Rail + ActionPanel), aber:

     * Andere Nav-Items (Watchlist, Replay, Alerts, Settings).
     * Bessere ARIA/Semantik (z.B. `section`, `aria-label`, `role="tablist"`, `aria-selected`, `id="main-content"`).
     * Styles in `src/styles/index.css` nutzen direkt `--color-*` Tokens (`--color-surface`, `--color-border`, `--color-brand`, etc.).
   * Fügt zusätzliche Klassen hinzu wie `.sf-field-row`, `.sf-field-label`, `.sf-field-meta`.

Deine Aufgabe ist, daraus **eine konsolidierte, finale Implementierung** abzuleiten.

---

## Arbeitsweise (Best Practices)

* **Architektur respektieren:** Nutze bestehende Struktur (z.B. `src/components/layout` vs. ältere Layouts). Entferne Altlasten statt zu duplizieren.
* **Design System first:** Richte dich am vorhandenen Design System (`design_system.md`, Tokens in `tokens.css`) und existierenden Patterns (z.B. andere Pages).
* **Single Source of Truth:** Keine doppelten Komponenten/Styles (kein gleiches Layout unter zwei Pfaden).
* **Semantik & Accessibility:** Nutze die besser zugängliche Variante (ARIA, `main` mit `id="main-content"`, sinnvolle `aria-label`s).
* **Kleine, in sich geschlossene Schritte:** Komponenten und Styles modular anpassen, jeweils mit klarem Commit.
* **Keine Quick-Hacks:** Code soll lesbar, erweiterbar und testbar sein.

---

## Ziele des Tasks

1. **Einheitliche Layout-Komponenten-Struktur**

   * Eine finale AppShell inkl. Topbar, Rail, ActionPanel.
   * Konsistente Pfad-Struktur (z.B. **`src/components/layout`** als kanonischer Ort).

2. **Konsistentes Styling & Tokens**

   * Nutzung der **alias Tokens** aus `tokens.css` (`--surface-*`, `--text-*`, `--border-*`, `--brand`, `--brand-2`).
   * Alle `.sf-*` Klassen in `@layer components` in `src/styles/index.css` konsolidiert.
   * Keine doppelte oder widersprüchliche Definition derselben Klassen.

3. **Navigation & Routing im Einklang mit der App**

   * Items in `Rail` passen zu den tatsächlich vorhandenen Routen (Router-Config gegenprüfen).
   * AppShell sauber in Routing integriert (z.B. als Shell um die Haupt-Routen).

4. **Accessibility & UX**

   * Markup aus Variante B (ARIA, `section`, `role`-Attribute, `id="main-content"`) beibehalten/verbessern.
   * Fokus-States, Tastaturbedienbarkeit und sinnvolle Labels sicherstellen.

5. **Saubere Bereinigung**

   * Alte/konkurrierende Layout-Dateien und nicht mehr genutzte CSS-Regeln entfernen.
   * Imports und Pfade korrigieren.

---

## Konkrete Aufgaben & Schritte

### 1. Inventur & Architektur-Entscheidung

1. Prüfe im Repo:

   * Aktuelle Platzierung von Layout-Komponenten (`src/layout`, `src/components/layout`, ggf. weitere).
   * Router-Konfiguration (z.B. `src/App.tsx` oder `src/router/*`), um zu sehen:

     * Welche Routen existieren wirklich (`/dashboard`, `/watchlist`, `/chart`, `/replay`, `/alerts`, `/journal`, `/settings`, etc.).
2. Entscheide **einen** kanonischen Platz für die Layout-Komponenten:

   * **Bevorzugt:** `src/components/layout` als finaler Ort (`AppShell.tsx`, `Topbar.tsx`, `Rail.tsx`, `ActionPanel.tsx`).
3. Lege fest:

   * Ob alte Layouts (`src/layout/*` o.ä.) vollständig ersetzt werden sollen.
   * Wie AppShell in das Routing eingebunden wird (z.B. als übergeordnete Route mit `<Outlet />`).

> Ergebnis: Klar definierter finaler Ort der Layout-Komponenten und geplante Integration in Router.

---

### 2. Komponenten vereinheitlichen

**Ziel:** Eine konsolidierte Version jeder Komponente, die die besten Teile beider Diffs vereint.

#### 2.1 AppShell

* Verwende als Basis die AppShell-Struktur aus Variante B (`src/components/layout/AppShell.tsx`):

  * `<main id="main-content" className="sf-canvas">` beibehalten.
  * `<aside className="sf-action hidden xl:flex">` etc.
* Falls aktuell noch ein AppShell unter `src/layout/AppShell.tsx` existiert:

  * Zusammenführen und **nur eine** finale Datei unter `src/components/layout/AppShell.tsx` behalten.
* Integriere AppShell in den Router:

  * Stelle sicher, dass alle relevanten Haupt-Pages innerhalb des `<Outlet />` gerendert werden.
  * Passe ggf. bestehende Layout-Wrappers an, damit es nicht zu verschachtelten Shells kommt.

#### 2.2 Topbar

* Nutze die Topbar-Implementierung aus den Diffs (`Topbar.tsx`):

  * Brand-Bereich (`Sparkfined`), Search-Button (`⌘K`), Pair-Anzeige, rechte Button-Gruppe.
* Prüfe:

  * `Button`-Komponente und Variants (passen sie zum Design System?).
  * Ob Pair-Information (`SOL/USDC`, `• 1m`) statisch oder über Props/Context dynamisiert werden soll. Aktuell: Platzhalter okay, aber Code so strukturieren, dass spätere Datenanbindung leicht ist.

#### 2.3 Rail

* Starte mit der `Rail` aus Variante B:

  * Items: `/dashboard`, `/watchlist`, `/chart`, `/replay`, `/alerts`, `/journal`, `/settings`.
* Prüfe Router:

  * Entferne oder passe Nav-Items an, die **keine** Route haben oder anders heißen (z.B. `scanner` vs. `watchlist`).
* Stelle sicher:

  * `className` nutzt `cn("sf-rail-item", isActive && "sf-rail-item-active")`.
  * ARIA/Accessibility: `aria-label="Primary navigation"` behalten.

#### 2.4 ActionPanel

* Nutze ActionPanel aus Variante B als Grundlage (bessere ARIA & Semantik):

  * `<section className="sf-panel" aria-label="Trading actions">`
  * `role="tablist"`, `aria-selected` auf Buy/Sell.
* Ergänze fehlende visuelle Klassen:

  * Sorge dafür, dass alle verwendeten Klassen (`sf-subpanel`, `sf-mini-label`, `sf-kpi`, `sf-chips`, `sf-chip`, `sf-toggle`, `sf-field-row`, `sf-field-label`, `sf-field-meta`) in `index.css` existieren.
* Noch keine echte Trading-Logik einbauen:

  * Felder dürfen Platzhalter sein (`—`), Fokus liegt auf UI-Shell.

> Ergebnis: Eine konsistente Layout-Komponentenfamilie in `src/components/layout/*` ohne Duplikate.

---

### 3. Styles & Tokens konsolidieren

**Ziel:** Eine konsistente `@layer components`-Sektion in `src/styles/index.css`, abgestützt auf alias Tokens aus `tokens.css`.

#### 3.1 tokens.css

* Stelle sicher, dass in `src/styles/tokens.css` die alias-Definitionen aus Variante A vorhanden sind:

  ```css
  :root {
    --surface-0: var(--color-bg);
    --surface-1: var(--color-surface-1);
    --surface-2: var(--color-surface-2);
    --surface-3: var(--color-surface-3);

    --text-0: var(--color-text);
    --text-1: var(--color-text-1);
    --text-2: var(--color-text-2);

    --border-0: var(--color-border);
    --border-1: var(--color-border-strong);

    --brand: var(--color-brand);
    --brand-2: var(--color-accent);

    --font-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", monospace;
  }
  ```

* Prüfe, dass keine widersprüchlichen Definitionen existieren.
  Alias-Layer (`--surface-*`, `--text-*`, ...) ist dein **Primary** für die neuen `.sf-*` Styles.

#### 3.2 index.css – `.sf-*` Klassen

* Konsolidiere die `.sf-*` Definitionen aus beiden Diffs:

  * **App-Shell Layout:**

    * `.sf-shell` (Grid layout mit topbar/rail/canvas/action).
    * `.sf-topbar`, `.sf-rail`, `.sf-canvas`, `.sf-action`.

  * **Topbar:**

    * `.sf-topbar-inner`, `.sf-brand`, `.sf-brand-dot`, `.sf-brand-text`.
    * `.sf-search`, `.sf-search-placeholder`, `.sf-kbd`.
    * `.sf-pair`, `.sf-pair-symbol`, `.sf-pair-meta`.
    * `.sf-topbar-left`, `.sf-topbar-center`, `.sf-topbar-right`.

  * **Rail:**

    * `.sf-rail-inner`, `.sf-rail-item`, `.sf-rail-item-active`, `.sf-rail-icon`, `.sf-rail-label`.

  * **Action Panel & Panels:**

    * `.sf-action-inner`, `.sf-panel`, `.sf-panel-header`, `.sf-panel-title`, `.sf-panel-dna`, `.sf-panel-body`.
    * `.sf-subpanel`, `.sf-subpanel-title`, `.sf-subpanel-grid`.
    * `.sf-mini-label`, `.sf-kpi`, `.sf-mono`, `.sf-divider`, `.sf-mini-row`.

  * **Controls:**

    * `.sf-seg`, `.sf-seg-item`, `.sf-seg-active`.
    * `.sf-chips`, `.sf-chip`.
    * `.sf-toggle`.
    * `.sf-field-row`, `.sf-field-label`, `.sf-field-meta`.

* Vereinheitliche die Farb-/Token-Nutzung:

  * Ersetze direkte `var(--color-...)` Nutzung in `.sf-*` durch `var(--surface-*)`, `var(--text-*)`, `var(--border-*)`, `var(--brand)`, `var(--brand-2)` aus Variante A, wo sinnvoll.
  * Ziel: **ein konsistenter Token-Layer** über die `.sf-*` Styles.

* Achte darauf:

  * `@layer components { ... }` um alle `.sf-*` Styles zu bündeln.
  * Keine doppelte Definition derselben Klasse mit unterschiedlichen Tokens – entscheide dich pro Klasse für eine finale Variante.

> Ergebnis: Eine saubere, einmalige `.sf-*` Style-Section, die sowohl alle benötigten Klassen aus dem Layout nutzt, als auch das alias Token-Layer respektiert.

---

### 4. Cleanup & Integration

1. **Dateien aufräumen**

   * Entferne nicht mehr genutzte Layout-Komponenten (z.B. alte `src/layout/*`-Varianten).
   * Entferne nicht mehr verwendete CSS-Klassen, falls in keinem JSX mehr referenziert.
2. **Imports fixen**

   * Prüfe alle Stellen, die Layout-Komponenten importieren (z.B. App, Router).
   * Stelle sicher, dass überall auf `src/components/layout/AppShell` (und Co.) gezeigt wird.
3. **Design-System Alignment**

   * Kurz mit `design_system.md` abgleichen, ob:

     * Abstände, Rundungen, Glaseffekte konsistent mit anderen Screens sind.
     * Rail & Topbar sich in das globale Look&Feel einfügen.

---

### 5. Tests & Quality Gates

Nach Fertigstellung des Layout-Refactors:

1. **Type & Lint**

   * `pnpm typecheck`
   * `pnpm lint` (keine neuen Errors)

2. **Tests**

   * `pnpm test` (Unit/Integration, bestehende Suites sollen grün bleiben).
   * Falls es Layout-bezogene E2E Specs gibt (z.B. Navigation): `pnpm test:e2e` für diese Specs ausführen.

3. **Build**

   * `pnpm build` → sicherstellen, dass die neue Layout-Architektur buildbar ist.

4. **Kurzbericht**

   * In der PR-Beschreibung oder Summary:

     * Welche Layout-Dateien neu/ersetzt wurden.
     * Welche `.sf-*` Klassen final existieren.
     * Wie das Token-Mapping (alias vs. base tokens) jetzt aussieht.
     * Ob Breaking Changes für Routen/Layout APIs existieren (erwartet: minimal).

---

## Definition of Done

Der Task ist abgeschlossen, wenn:

* Es **genau eine** AppShell-Implementierung unter `src/components/layout/*` gibt.
* Alle `.sf-*` Styles sind in `@layer components` in `index.css` konsolidiert und nutzen das alias Token-Layer aus `tokens.css`.
* Nav-Items in `Rail` stimmen mit den tatsächlichen Router-Routen überein.
* Die UI rendert ohne Layout-Fehler, mit sinnvollen ARIA-Attributen und Fokus-Flows.
* Alle Quality Gates (typecheck, lint, test, relevante e2e, build) sind grün.
* Alte, konkurrierende Layout-Varianten und tote Styles wurden entfernt.

---

Wenn du magst, kann ich dir daraus noch eine kürzere **„Systemprompt“-Version** bauen, die du 1:1 als Instruktion in einen Codex-Run kopierst (ohne den langen Kontext).
