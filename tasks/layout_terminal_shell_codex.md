# Codex Rolle – Terminal Shell Layout + 420px Action Panel

## Rolle

Du bist **Codex**, ein implementierender Engineer für das Sparkfined PWA Repo.

Deine Aufgabe in diesem Task:

* Den bereitgestellten **Terminal Shell Layout Patch** (Topbar + Rail + Canvas + 420px Action Panel) in das Projekt integrieren.
* Sicherstellen, dass:

  * das Layout **zentral über `AppShell`** läuft,
  * der **Skip-Link** korrekt auf `#main-content` zeigt,
  * alle `sf-*` Klassen **namespaced, konsistent und konfliktfrei** in `src/styles/index.css` hängen,
  * bestehende Layout-/Shell-Reste aufgeräumt werden, um keine doppelten Layouts zu haben.

Du lieferst **fertigen, getesteten Code**, keine Tickets oder TODO-Kommentare.

---

## Kontext & Annahmen

* Der Patch bringt eine **Shell-Struktur**:
  `Topbar` (oben) + `Rail` (links) + `Canvas` (Main) + `ActionPanel` (rechts, 420px, xl+).
* Die Dateien sollen unter `src/components/layout/` liegen.
* `AppShell` beinhaltet `<main id="main-content">` als Skip-Link-Ziel (z.B. von `App.tsx`).
* Styles leben im Tailwind-Setup über `@layer components` in `src/styles/index.css` und nutzen `sf-*` Namensräume.
* Design-Tokens (`bg-surface`, `text-text-primary`, `--color-border`, `--color-brand`, etc.) existieren bereits im Projekt und werden weiterverwendet.

---

## Aufgabenpaket für Codex

### 1. Layout-Architektur & Routing prüfen

**Ziel:** `AppShell` ist der zentrale Layout-Wrapper und wird vom Router korrekt genutzt.

1. Prüfe:

   * Existiert bereits `RoutesRoot.tsx` (oder ein ähnlicher Root-Router)?
   * Nutzt dieser Root bereits ein Layout mit `<AppShell>` + `<Outlet />`?
2. Falls **nein**:

   * Binde `AppShell` als **Layout-Route** ein, z.B.:

     * `RoutesRoot` (oder `App.tsx`) definiert eine Route, die `AppShell` rendert und die Child-Routes im `<Outlet />` platziert.
3. Stelle sicher:

   * Dass die Hauptseiten (Dashboard, Watchlist, Chart, Replay, Alerts, Journal, Settings) **innerhalb** des `<Outlet />` liegen.
   * Der Skip-Link (z.B. in `App.tsx`) verweist auf `href="#main-content"` und das `<main id="main-content">` befindet sich in `AppShell`.

> Ergebnis: AppShell ist als **einzige übergeordnete Shell** aktiv; keine konkurrierenden Shells.

---

### 2. Layout-Komponenten unter `src/components/layout/` erstellen/ersetzen

**Ziel:** Die vier Layout-Komponenten liegen an einem zentralen Ort und entsprechen exakt dem Patch.

1. Lege (oder **ersetze**) folgende Dateien an:

   * `src/components/layout/AppShell.tsx`
   * `src/components/layout/Topbar.tsx`
   * `src/components/layout/Rail.tsx`
   * `src/components/layout/ActionPanel.tsx`

2. Verwende für jede dieser Dateien **den Code aus dem bereitgestellten Patch** (siehe Abschnitt „Codex Patch“ unten in diesem Dokument):

   * `AppShell`:

     * Struktur: `<header>` (Topbar), `<aside>` (Rail), `<main id="main-content">`, `<aside>` (ActionPanel).
     * `main` ist explizit mit `id="main-content"` versehen (Skip-Link-Ziel).
     * ActionPanel rechts: `className="sf-action hidden xl:flex"` → 420px, always-on auf `xl+`.

   * `Topbar`:

     * Brand (`Sparkfined`), Search-Button (`⌘K`), Pair (`SOL/USDC • 1m`), Buttons `Wallet`, `Notifications`, `Settings`.

   * `Rail`:

     * Navigation-Items: `/dashboard`, `/watchlist`, `/chart`, `/replay`, `/alerts`, `/journal`, `/settings`.
     * Nutzung von `NavLink` + `cn("sf-rail-item", isActive && "sf-rail-item-active")`.
     * `aria-label="Primary navigation"`.

   * `ActionPanel`:

     * `section` mit `aria-label="Trading actions"`.
     * Segmented-Control „Buy/Sell“ mit `role="tablist"` und `role="tab"` + `aria-selected`.
     * Size-Feld mit `%`-Chips.
     * Risk-Subpanel, Slippage-Toggle, Buttons `Set Alert`, `+ Journal`, `Confirm`.

3. Prüfe Import-Pfade:

   * `Button` kommt aus `@/components/ui/Button`.
   * `Input` kommt aus `@/components/ui/Input`.
   * `cn` kommt aus `@/lib/ui/cn`.

> Ergebnis: Die neuen Layout-Komponenten sind im Projekt vorhanden und nutzbar, ohne alte Layout-Duplikate.

---

### 3. CSS in `src/styles/index.css` integrieren

**Ziel:** Alle `sf-*` Styles sind sauber im `@layer components` Block registriert und verwenden die bestehenden Token-Klassen.

1. Öffne `src/styles/index.css`.

2. Stelle sicher, dass ein `@layer components { ... }` Block existiert:

   * Falls **nicht vorhanden**, lege einen an.

3. Füge den im Patch angegebenen CSS-Block für alle `.sf-*` Klassen **innerhalb** dieses `@layer components { ... }` Blocks ein:

   * **Nicht** den `@layer components {` doppelt anlegen, wenn bereits vorhanden.
   * Falls schon `.sf-*` Klassen existieren, ersetze sie durch die finalen Versionen aus dem Patch.

4. Achte darauf, dass:

   * Layout-Klassen (`.sf-shell`, `.sf-topbar`, `.sf-rail`, `.sf-canvas`, `.sf-action`) korrekt gesetzt sind.
   * Topbar-, Rail- und Panel-Klassen genau wie im Patch definiert sind.
   * `bg-surface`, `text-text-*`, `rgb(var(--color-border)/...)`, `rgb(var(--color-brand)/...)` etc. sich mit dem bestehenden Token-Setup vertragen.

> Ergebnis: Die Terminal-Shell-Optik (Topbar, Rail, Action Panel) erscheint, ohne andere Komponenten zu zerschießen.

---

### 4. Navigation & Routen-Abgleich

**Ziel:** Die `Rail` spiegelt reale Routen wider.

1. Vergleiche die Items in `Rail`:

   ```ts
   const items = [
     { to: "/dashboard", label: "Dashboard", icon: "▦" },
     { to: "/watchlist", label: "Watchlist", icon: "⌁" },
     { to: "/chart", label: "Chart", icon: "⟐" },
     { to: "/replay", label: "Replay", icon: "⟲" },
     { to: "/alerts", label: "Alerts", icon: "🔔" },
     { to: "/journal", label: "Journal", icon: "✎" },
     { to: "/settings", label: "Settings", icon: "⚙︎" },
   ];
   ```

2. Prüfe die Router-Konfiguration:

   * Existieren diese Routen?
   * Falls einige Routen derzeit anders heißen oder (noch) nicht existieren:

     * **Passe die `to`-Werte** an den realen Routing-Stand an (z.B. `"/"` statt `"/dashboard"`, etc.).

3. Ziel: Keine Links in der Rail, die ins Leere laufen oder 404s produzieren.

---

### 5. Cleanup & Konflikte entfernen

**Ziel:** Kein Doppel-Layout, keine alten `sf-*` Überreste.

1. Suche im Repo nach:

   * Alten Layout-Files (`src/layout/AppShell.tsx`, o.ä.).
   * Alten `.sf-*` CSS-Regeln, die ggf. aus einem vorherigen Layout-Versuch stammen.
2. Entferne oder refaktoriere:

   * Veraltete Layout-Komponenten, die nicht mehr verwendet werden.
   * Duplikate von `.sf-*` Klassen (nur die neue Version behalten).
3. Stelle sicher:

   * Alle Imports auf `AppShell`, `Topbar`, `Rail`, `ActionPanel` beziehen sich auf `src/components/layout/*`.
   * Es gibt keine zweite Shell-Komponente, die innerhalb derselben Route-Sektion genutzt wird.

---

### 6. Accessibility & UX kurz prüfen

**Ziel:** Die wichtigsten A11y-Punkte sind umgesetzt.

* [ ] `main`-Element:

  * `id="main-content"` vorhanden.
* [ ] Skip-Link in `App.tsx` oder Root-Komponente zeigt auf `#main-content`.
* [ ] `Rail`:

  * `<nav aria-label="Primary navigation">` vorhanden.
* [ ] `ActionPanel`:

  * `section` mit `aria-label="Trading actions"`.
  * Segmented-Control mit `role="tablist"`, `role="tab"`, `aria-selected`.
* [ ] Buttons (z.B. Slippage-Toggle, Notifications, Settings) haben sinnvolle `aria-label`s.

---

### 7. Quality Gates

Nach Integration des Patches:

1. **Typecheck & Lint**

   * `pnpm typecheck`
   * `pnpm lint`
     → keine neuen Errors/Warnings, außer bekannten globalen.

2. **Tests**

   * `pnpm test`
     → Unit-/Integrationstests laufen grün.
   * Relevante `pnpm test:e2e` Specs, falls Navigations-/Layout-Tests existieren.

3. **Build**

   * `pnpm build`
     → Build ohne Fehler.

4. **Kurz-Summary für Maintainer**

   * 3–5 Bullet Points:

     * Neue Terminal Shell Layout-Struktur aktiviert.
     * `AppShell` als zentrale Shell für die Haupt-Routen.
     * `sf-*` CSS in `@layer components` konsolidiert.
     * Skip-Link und ARIA-Struktur hergestellt.

---

## Codex Patch (Referenz)

> **Hinweis für Codex:**
> Nutze den folgenden Patch **1:1** als Quelle für die Komponenten- und CSS-Inhalte.
> Passe nur dort an, wo Routing oder Projektstruktur es zwingend erfordern (z.B. abweichende Routen-Pfade).

*(Hier fügst du exakt den von dir geposteten „Codex Patch — Terminal Shell Layout + 420px Action Panel“ Block ein.)*
