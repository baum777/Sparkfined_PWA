# Codex Playbook: Terminal Shell Layout + 420px Action Panel

## Zweck
Dieses Playbook dient als System-Prompt für Codex, um den Terminal-Style App-Shell-Frame (Topbar + Rail + 420px Action Panel) konsistent aufzubauen und in den Router einzuhängen.

## Rolle & Leitplanken
- Nutze ausschließlich die bestehenden Design-Tokens (`--surface-*`, `--text-*`, `--brand`) und `@layer components` in `src/styles/index.css`.
- Keine zweite Shell behalten: Legacy `src/layout/*` muss entfernt werden, damit nur eine Quelle aktiv ist.
- Accessibility: `main#main-content` als Skip-Link-Ziel bereitstellen.
- Navigation darf keine 404s erzeugen – Rail-Links müssen auf existierende Routen zeigen.
- Qualitätstore: `pnpm typecheck`, `pnpm lint`, `CI=1 pnpm test -- --reporter=dot`, `CI=1 pnpm test:e2e` (Infra-Fail erlaubt, dokumentieren), `pnpm build`.

## Ausführungsschritte
1. Layout-Komponenten in `src/components/layout/` aktualisieren (`AppShell.tsx`, `Topbar.tsx`, `Rail.tsx`, `ActionPanel.tsx`).
2. CSS-Blöcke in `src/styles/index.css` innerhalb eines einzigen `@layer components` halten (keine Duplikate).
3. Router auf das neue Layout verdrahten (`src/routes/RoutesRoot.tsx`) und `main#main-content` sichern.
4. Legacy-Ordner `src/layout/` entfernen; Exporte in `src/components/layout/index.ts` ggf. ergänzen.
5. Navigation auf reale Routen mappen (z.B. `/dashboard`, `/analysis`, `/chart`, `/watchlist`, `/alerts`, `/journal`).
6. Alle oben genannten Quality Gates ausführen und Ergebnisse notieren.

## Codex Patch — Terminal Shell Layout + 420px Action Panel
- Ersetze `src/components/layout/AppShell.tsx` durch das 3-spaltige Grid (`sf-shell`) mit Topbar, Rail und fixem 420px Action Panel (xl+ sichtbar), `main#main-content` als Skip-Link-Ziel.
- Füge `Topbar.tsx`, `Rail.tsx`, `ActionPanel.tsx` unter `src/components/layout/` hinzu (Topbar mit Brand + Search-Knopf, Rail mit aktiven States, Action Panel mit Trade/Risk/Position-Module).
- Konsolidiere die Shell-Styles im bestehenden `@layer components` Block in `src/styles/index.css`.
- Router anpassen (`src/routes/RoutesRoot.tsx` → neues AppShell) und überflüssigen Ordner `src/layout/` löschen.
- Tests aktualisieren/ergänzen, damit Chrome-Elemente + `main#main-content` und Rail-Links abgedeckt sind.
