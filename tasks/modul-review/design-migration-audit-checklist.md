# Sparkfined – Design Migration Audit Checklist

---

## 📋 Instructions for Claude (do not remove)

You are Claude, acting as **Audit & Review Assistant** for the Sparkfined PWA design migration.

Your job:

1. **Systematically go through this checklist** – Punkt für Punkt, Modul für Modul.
2. Für jede Abweichung / jeden Mangel:
   - Finde den **konkreten Ursprung im Code** (Datei, Komponente, Stelle).
   - Beschreibe **klar**, was nicht zur Checkliste / zum Design-System / zu den Instruktionen passt.
   - Schlage **nur** in Textform vor, wie es behoben werden könnte (z. B. „hier sollte Token X statt bg-slate-900 verwendet werden").
3. **Wichtig:**
   - Du nimmst **keine eigenen Code-Änderungen** vor.
   - Du erzeugst **keine Commits, keine Patches, keine Auto-Fixes**.
   - Deine Aufgabe ist ausschließlich **Analyse & Dokumentation**.

Empfohlenes Format für deine Dokumentation:

- Pro Checklist-Punkt, bei dem du ein Problem findest:
  - `Checklist Item:` (z. B. „Modul 2 – Dashboard – KPI-Strip nutzt Tokens")
  - `Status:` OK / 🔴 Issue
  - `Details:` kurze Beschreibung des Problems
  - `Location:` Datei(en), Komponente(n), relevante Code-Snippets (kurz)
  - `Suggested Fix (text only):` deine Empfehlung, wie der Code angepasst werden sollte

---

# ✅ Globale Checkliste (für alle Module)

### Design-System & Code-Qualität

- [ ] In allen angefassten Dateien werden **nur** Design-Tokens / Variablen aus `tailwind.config` & `./docs/design/**` verwendet (Farben, Radii, Shadows, Spacing, Typography).
- [ ] Es existieren **keine** Klassen mehr mit Roh-Palette wie
      `zinc-*`, `slate-*`, `gray-*`, `blue-*`, `red-*`, `green-*`, `yellow-*`.
      (z.B. via `rg -n --pcre2 "(?<![A-Za-z0-9_-])(zinc|slate|gray|blue|red|green|yellow)-[0-9]" src` geprüft.)
- [ ] Keine unnötigen `style={{ ... }}` oder Inline-Styles, wo es passende Tokens / Utility-Klassen gibt.
- [ ] Keine toten Imports oder unbenutzten Komponenten nach Refactor.

### Architektur & Logik

- [ ] **Keine** Änderungen an Business-Logik, Zustand-Stores, Services oder `src/lib/**`.
- [ ] Alle Refactors sind rein **UI/Layout/Styling** (JSX-Struktur, Komponenten-Komposition).

### Tests

- [ ] `pnpm typecheck` erfolgreich.
- [ ] `pnpm lint` erfolgreich.
- [ ] `pnpm test` erfolgreich.
- [ ] E2E-Status ist dokumentiert (z.B. Playwright-Infra-Probleme als Kommentar im PR – nicht still ignoriert).
- [ ] Alle bisher verwendeten `data-testid` bleiben erhalten oder wurden bewusst & konsistent migriert (und E2E entsprechend angepasst).

### UX & Responsiveness

- [ ] Alle Seiten funktionieren sinnvoll auf **Desktop, Tablet & Mobile** (kein Layout-Bruch, keine überlaufenden Bereiche).
- [ ] Interaktive Elemente (Buttons, Nav-Items) sind groß genug (mind. ~44px Tap-Target).
- [ ] `prefers-reduced-motion` wird respektiert, wenn Animations-Komponenten (Transitions) genutzt werden.

---

# 🧱 Modul 1 – App Shell & Navigation (Frame Layer)

### AppShell & Routing

- [ ] Es existiert eine zentrale `AppShell`-Komponente, die:
  - [ ] Header, Sidebar, BottomNav, NavigationDrawer, UpdateBanner, OfflineIndicator und PageTransition beherbergt.
  - [ ] Einen `Outlet` (oder Äquivalent) für die gerouteten Pages bereitstellt.
- [ ] `RoutesRoot` verwendet `AppShell` als Layout-Route für alle **authentifizierten** Hauptseiten (Dashboard, Analysis, Journal, Watchlist, Alerts, Oracle, usw.).
- [ ] Standalone-Routen (Landing, ggf. Auth, Replay falls so geplant, Showcases) sind korrekt **außerhalb** der Shell konfiguriert, falls im Design so vorgesehen.

### PageLayout & Header

- [ ] Ein gemeinsamer `PageLayout` / `DashboardShell` übernimmt:
  - [ ] 12-Column Grid (Desktop) + passende Stacking-Strategie (Tablet/Mobile).
  - [ ] Konsistente Innenabstände (z.B. `px-6 sm:px-8 lg:px-10`, `py-8`) gemäß Design-Doku.
  - [ ] Page Header Cluster (Titel, optional Subtitel, Actions).
- [ ] Header-Komponente sitzt sauber in der Shell: voller Breite, Glass-Surface, kein „Springen" beim Anzeigen von Bannern.

### Navigation (Sidebar / BottomNav / Drawer)

- [ ] **Sidebar (Desktop)**:
  - [ ] Verwendet die richtigen Hauptlinks (Board/Dashboard, Analyze, Chart, Journal, Alerts, Oracle, Settings/Learning je nach Spez).
  - [ ] Zeigt aktive Route klar über Tokens (keine Rohfarben).
  - [ ] Sektionen/Bereichsüberschriften nutzen konsistente Typografie (Section-Header).
- [ ] **BottomNav (Mobile)**:
  - [ ] Besitzt exakt die definierten Tabs (z.B. Board, Analyze, Chart, Journal, Settings).
  - [ ] Alerts/weitere Routen wandern in den „More"/Drawer wie spezifiziert.
  - [ ] Aktive/Inactive-Zustände stimmen visuell mit Sidebar überein.
- [ ] **NavigationDrawer**:
  - [ ] Enthält die sekundären Routen (Watchlist, Alerts, Oracle, Replay, Learning, Showcases, …).
  - [ ] Ist als GlassSurface mit klaren Fokus-States umgesetzt.
- [ ] Desktop & Mobile zeigen nie gleichzeitig Sidebar **und** BottomNav.

### System-Elemente

- [ ] `UpdateBanner` ist in `AppShell` integriert (nicht mehr separat in `App.tsx` o.ä.) und nutzt Glass/Tokens statt `bg-slate-*`.
- [ ] `OfflineIndicator` ist optisch dezent (Warnfarbe per Token), positioniert ohne Layout-Breaks und ohne Dashboard zu überdecken.
- [ ] `PageTransition` respektiert `prefers-reduced-motion` und wird korrekt um den `<Outlet>` gelegt.

### Tests & TestIDs

- [ ] Alle Hauptseitenrender passieren innerhalb `AppShell`.
- [ ] Alte Tests für `BottomNav`, `Sidebar`, `NavigationDrawer` laufen oder wurden angepasst (z.B. neue Tab-Bezeichnungen).
- [ ] `data-testid` für page root wrapper existieren (z.B. `dashboard-page`, `analysis-page`, `journal-page`, …).

---

# 📊 Modul 2 – Discover & Decide
*(Dashboard, Analysis, Oracle, Signals)*

### Dashboard

- [ ] `DashboardPageV2` nutzt `PageLayout` / Shell aus Modul 1.
- [ ] Es existiert ein **Dashboard Header Cluster** mit Titel, optional Subtitel, und Actions (z.B. Filter, Quick Actions).
- [ ] KPI-Strip:
  - [ ] KPIs als konsistente MetricTiles (GlassCard/MetricTile) mit Tokens für positive/negative Werte.
  - [ ] Responsiv: 4 Tiles (Desktop), 2x2 (Tablet), 1–2 pro Reihe (Mobile).
- [ ] Main Grid:
  - [ ] InsightTeaser, JournalSnapshot, AlertsSnapshot sind in GlassCards mit Section-Headern organisiert.
  - [ ] Layout: 3-Column (Desktop), 2-Column (Tablet), stacked (Mobile).
- [ ] Loading/Empty/Error:
  - [ ] nutzt `Skeleton`, `EmptyState`, `ErrorBanner`/`StateView` statt Ad-hoc-Text/Spinner.

### Analysis

- [ ] `AnalysisPageV2` hat Header Cluster mit Titel, Subtitel und z.B. Timeframe-/Universe-Filter.
- [ ] Layout:
  - [ ] Summary-Karten oben (AI Bias, Volatilität, Session).
  - [ ] Hauptbereich für Heatmaps/Charts in GlassCards.
  - [ ] Optionaler Filter/Sidebar-Bereich.
- [ ] Tabs/Segmented Controls für Analyse-Modi sind über `Tabs`/Chips konsistent.
- [ ] Status (loading/empty/error) je Bereich klar sichtbar.

### Oracle

- [ ] Oracle-Page hat eigenen Header mit aktuellem Bias + Last-Update-Info.
- [ ] Oracle-Hauptkarte (Score/Bias) nutzt AI/Accent-Tokens (nicht Danger-Farbskala).
- [ ] Historien/Trend-Anzeige in einem GlassCard-Chart/Tabelle.
- [ ] Keine Rohfarben & konsistente Insight-Sprache wie Analysis.

### Signals

- [ ] Signals-Page zeigt Signals als Cards oder List mit:
  - [ ] Symbol, Richtung, Timeframe, Confidence, Begründung.
- [ ] Filter (Timeframe/Type/Confidence) per Chips/Buttons/Tabs.
- [ ] Sentiment (bullish/bearish/neutral) über Sentiment-Tokens visualisiert, nicht über harte Rohfarben.

### Tests & TestIDs

- [ ] `data-testid="dashboard-page"`, `"analysis-page"`, `"oracle-page"`, `"signals-page"` vorhanden.
- [ ] E2E-Szenarien (z.B. „Dashboard lädt", „Analysis-Filter setzen") passen zu neuen Layouts.

---

# 📈 Modul 3 – Execute & Monitor
*(Watchlist, Chart, Replay, Alerts, Notifications)*

### Watchlist

- [ ] `WatchlistPageV2` nutzt Shell + Header Cluster („Watchlist" + Actions).
- [ ] Desktop-Layout:
  - [ ] Linke Fläche: Watchlist-Tabelle/-Liste als GlassSurface.
  - [ ] Rechte Fläche: DetailPanel in GlassCard (Instrument-Infos, Mini-Chart, Alerts).
- [ ] Mobile:
  - [ ] Stacked Layout (Filter → Liste → Detail / Detail als Drawer/Sheet).
- [ ] Tabelle:
  - [ ] Spalten klar (Symbol, Preis, %Change, Volumen/Volatilität, Alerts).
  - [ ] Hover/Selection mit Tokens (kein `bg-slate-*`).
- [ ] Loading/Empty/Error mit Skeleton/EmptyState/StateView umgesetzt.

### Chart

- [ ] `ChartPageV2` hat Header mit Symbol/Timeframe-Controls.
- [ ] AssetContextBar zeigt aktuelle Kennzahlen (Symbol, Preis, Change, Session) konsistent.
- [ ] Chart in einer GlassSurface, Farben/Ticks/Gridlines per Tokens (wenn konfigurierbar).
- [ ] Placeholder/EmptyState bei „kein Symbol gewählt"; Skeleton beim Laden.

### Replay

- [ ] Replay-Page hat Header („Replay") mit Basisinfos (Symbol, Zeitraum).
- [ ] Hauptbereich: Replay-Chart/-Player, darunter/seitlich:
  - [ ] Playback-Control-Bar (Play/Pause, Speed, Step).
  - [ ] Pattern-/Statistik-Karten in GlassCards.
- [ ] Loading/Empty/Error analog zu anderen Surfaces.

### Alerts

- [ ] Alerts-Page nutzt Header („Alerts") + Action („New alert") + Filterchips (Status, Symbol, …).
- [ ] Alert-Liste:
  - [ ] Card/List-Pattern, Status per Badges (Active/Armed/Triggered/Paused).
  - [ ] Klarer Zugriff auf Edit/Delete/Toggle.
- [ ] Alert-Formulare mit Design-Formkomponenten (Input/Select/Switch).
- [ ] Validation-Stati per Tokens (nicht `text-red-500` o.ä.).

### Notifications

- [ ] Notifications-Page zeigt Liste in GlassSurface:
  - [ ] Titel, Text-Snippet, Timestamp, Typ (Alert/System/Info).
  - [ ] Read/Unread unterscheidbar über Opazität/Typographie/Tokens.
- [ ] Filter (All/Alerts/System) + „Mark all as read"-Action.

### Tests & TestIDs

- [ ] `data-testid="watchlist-page"`, `"chart-page"`, `"replay-page"`, `"alerts-page"`, `"notifications-page"` vorhanden.
- [ ] Bestehende E2E-Cases (z.B. Alert anlegen, Watchlist filtern) funktionieren.

---

# 🧠 Modul 4 – Reflect & Learn
*(Journal, Journey, Lessons)*

### Journal

- [ ] `JournalPageV2` nutzt Shell + Header Cluster („Journal").
- [ ] Header-Actions: Datumsbereich, Tag-Filter, Suche, Button „New entry".
- [ ] Layout Desktop:
  - [ ] Filterbereich (Seitenspalte oder obere Zeile).
  - [ ] JournalList in GlassSurface.
  - [ ] JournalDetailPanel + JourneyPanel rechts oder darunter.
- [ ] JournalList:
  - [ ] Cards/Zeilen mit Datum, Titel, Richtung, Ergebnis, Tags.
  - [ ] Richtungs-/Ergebnis-Badges nutzen Tokens.
- [ ] JournalDetailPanel:
  - [ ] GlassCard mit sauberer Typografie (Titel, Meta, Body, Aktionen).

### Journal Editor / NewEntry

- [ ] Form mit `Input`, `Textarea`, `Select`, Chips (Richtung/Tags) entsprechend Design-System.
- [ ] Primary Button (Speichern) + sekundäre Aktionen (Abbrechen etc.).
- [ ] Fehlerzustände konsistent (Error-Tokens, konsistente Texte).

### Journey / Progress

- [ ] JourneyPanel/Seite zeigt:
  - [ ] Level/Phase, Fortschrittsbalken, Streaks, Meilensteine.
- [ ] Optik: „Growth"-Stimmung (nicht Alarm-Farben), konsistent mit Lessons.

### Lessons / Learning

- [ ] Lessons-Page mit Header („Lessons" o.ä.) + Filter (Level, Topic, Progress).
- [ ] LessonsList mit LessonCards:
  - [ ] Titel, Beschreibung, Level-Badge, Dauer, Progress-Status.
- [ ] LessonDetail:
  - [ ] Überschrift, Meta, Content im typografisch konsistenten Layout.
  - [ ] Action „Mark as completed" / „Continue".

### States

- [ ] Loading: Skeletons für Listen & Detail.
- [ ] Empty: sinnvolle EmptyStates (z.B. „Noch keine Journal-Einträge").
- [ ] Error: StateView/ErrorBanner mit Retry.

### Tests & TestIDs

- [ ] `data-testid="journal-page"`, `"journal-list"`, `"journal-detail"`, `"journal-journey-panel"`, `"lessons-page"` o.ä.
- [ ] Tests für Journal-CRUD & Lessons-Navigation laufen.

---

# ⚙️ Modul 5 – System & Meta
*(Settings, Landing, Auth/Onboarding-Flows, Showcases)*

### Settings

- [ ] Settings-Page nutzt Shell + Header („Settings").
- [ ] Layout Desktop:
  - [ ] Section-Navigation (Sidebar oder Tabs).
  - [ ] SettingsSections in GlassCards mit `SettingsFormRow`-ähnlichem Pattern (Label, Helper, Control).
- [ ] Controls nutzen ausschließlich Design-Komponenten (Switch, Select, Input, Checkbox, Radio).
- [ ] Loading/Save-States sind sichtbar, Fehlermeldungen konsistent.

### Landing / Marketing

- [ ] LandingPage nutzt Marketing-Shell (mit oder ohne AppShell, je nach Design), aber Tokens & Typografie sind konsistent.
- [ ] Hero-Sektion: klarer Claim, Subline, Primary/Secondary CTA.
- [ ] Feature-Grid, „How it works", ggf. Trust/Stats – alles in Glass/Surface-Pattern.

### Auth / Onboarding-Flows (Pages)

- [ ] Login/Register/Reset-Seiten nutzen ein einheitliches AuthLayout (z.B. zentrierte Card oder Split-Layout).
- [ ] Formulare mit Design-Komponenten, konsistenten Fehlermeldungen, Fokuszuständen.
- [ ] Onboarding/Setup-Wizard (falls eigene Seite) mit Stepper/Progress-Indikator & klarer Navigation (Back/Next/Skip).

### Showcases (Icons, Styles, UX)

- [ ] IconShowcase zeigt Icons in einem über Tokens definierten Grid.
- [ ] StyleShowcase zeigt echte Tokens (Farben, Typo, Spacing, Components) – kein „Fake-Styleguide".
- [ ] UXShowcase nutzt reale Komponenten/Patterns, keine harten Inline-Styles.

### Tests & TestIDs

- [ ] `data-testid="settings-page"`, `"landing-page"`, `"login-page"` / `"auth-page"`, `"onboarding-page"` (falls Seite), `"icon-showcase-page"`, `"style-showcase-page"`, `"ux-showcase-page"` vorhanden.
- [ ] Bestehende Tests zu Settings/Onboarding/Auth laufen.

---

# 🎯 Onboarding-Overlay / Gate (Spezial-Checkliste)

### Overlay-Verhalten

- [ ] Wenn Onboarding-Flag aktiv ist (`!hasCompletedOnboarding` o.ä.), erscheint **immer** das Overlay beim App-Start.
- [ ] Overlay verwendet:
  - [ ] Vollflächigen Scrim (`fixed inset-0`, hoher `z-index`).
  - [ ] Dimmed Background (`bg-background/70` o.ä. Token) + `backdrop-blur-*`.
  - [ ] zentrierte Onboarding-Card in `glass-heavy`/höherer Deckkraft.
- [ ] Hintergrund (Dashboard etc.) ist sichtbar, aber klar zurückgenommen.

### Interaktion & A11y

- [ ] Klicks/Taps hinter dem Overlay sind **nicht** möglich (Scrim fängt Events ab).
- [ ] Onboarding-Overlay hat sinnvolle Semantik:
  - [ ] `role="dialog"` und `aria-modal="true"` (wenn praktikabel).
  - [ ] Fokus springt auf das erste interaktive Element im Overlay.
- [ ] Es existiert `data-testid="onboarding-overlay"` oder ein klar definierter Test-ID für E2E.

### Flows

- [ ] „Weiter" / „Fertig"-Flow setzt den bestehenden Onboarding-Completion-Flag.
- [ ] „Skip" (falls vorhanden) schließt Overlay ebenfalls und aktualisiert den Flag entsprechend.
- [ ] Nach Abschluss/Skip:
  - [ ] Overlay erscheint nach Reload **nicht** erneut.
  - [ ] User landet normal im Dashboard/AppShell.

### Design

- [ ] Onboarding-Card nutzt Tokens (kein `bg-slate-*` etc.).
- [ ] Titel, Beschreibung, ggf. Bullet-Points sind klar lesbar trotz Glass.
- [ ] Primary/Secondary Buttons optisch klar unterscheidbar und im Button-System verankert.

### Tests

- [ ] Unit/Component-Tests existieren oder sind aktualisiert, um das Overlay zu prüfen (z.B. Flag → Overlay sichtbar).
- [ ] E2E-Flow „First run → sieht Onboarding → schließt → Dashboard" ist abgedeckt (oder zumindest eingeplant).
