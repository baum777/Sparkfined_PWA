# Sparkfined PWA: V1/V2 Pages & Navigation Analysis

**Datum**: 2025-12-09
**Repository**: baum777/Sparkfined_PWA
**Branch**: `claude/analyze-pages-navigation-012SJx7Vqb5d4kFvS2xzzbAp`

---

## 📋 Überblick

Diese Analyse dokumentiert den aktuellen Stand der Page-Komponenten (V1/V2-Migration) und der Navigation im Sparkfined PWA. Das Ziel war:

1. ✅ **V1-Pages identifizieren und auf Verwendung prüfen**
2. ✅ **V2-Suffixe konsolidieren** (Umbenennung planen)
3. ✅ **Navigation analysieren** (fehlende Implementierung dokumentieren)

### Wichtigste Erkenntnisse

- ✅ **Es gibt KEINE veralteten V1-Pages**, die gelöscht werden müssen
- ⚠️ **Alle Pages nutzen bereits V2-Routen**, aber mit `-v2` Suffix in URLs und Dateinamen
- ⚠️ **2 Pages fehlen in der Navigation**: `SignalsPage` und `NotificationsPage`
- ✅ **Navigation ist vollständig implementiert** (BottomNav, Sidebar, NavigationDrawer)

---

## 1️⃣ V1-Page Analyse

### Zusammenfassung

**Es existieren KEINE veralteten V1-Pages, die entfernt werden müssen.**

Die einzige Page ohne V2-Suffix, die eine V2-Version hat, ist `SettingsPage.tsx`. Diese wird jedoch **aktiv von `SettingsPageV2.tsx` verwendet** (Komponentenwiederverwendung).

### Detaillierte Übersicht

| Page | Datei | V2-Version existiert? | Noch verwendet? | Status | Empfehlung |
|------|-------|----------------------|-----------------|--------|-----------|
| SettingsPage | `src/pages/SettingsPage.tsx` | ✅ Ja (`SettingsPageV2.tsx`) | ✅ Ja (von V2 importiert) | 🟢 In Nutzung | **Behalten** – wird von V2 wiederverwendet |

### Erläuterung: SettingsPage vs. SettingsPageV2

**Architektur:**

```
SettingsPageV2.tsx (Wrapper)
├── importiert: SettingsPage.tsx (Implementierung)
├── wraps in: DashboardShell (Layout)
└── Route: /settings-v2
```

**Dateien:**

- **`src/pages/SettingsPage.tsx`** (424 Zeilen)
  - Vollständige Implementierung aller Settings-Funktionen
  - Exportiert als default function mit Props `showHeading` und `wrapperClassName`
  - Wird von `SettingsPageV2.tsx` importiert

- **`src/pages/SettingsPageV2.tsx`** (18 Zeilen)
  - Wrapper-Komponente, die `SettingsPage` in `DashboardShell` einbettet
  - Setzt `showHeading={false}` und `wrapperClassName="space-y-6"`
  - Exportiert als default function

**Import in `SettingsPageV2.tsx:4`:**
```typescript
import SettingsPage from './SettingsPage';
```

**Verwendung in Routes (`src/routes/RoutesRoot.tsx:22,81`):**
```typescript
const SettingsPageV2 = lazy(() => import("../pages/SettingsPageV2"));
// ...
<Route path="/settings-v2" element={<SettingsPageV2 />} />
```

**Fazit:**
`SettingsPage.tsx` ist **KEINE veraltete V1-Page**, sondern die eigentliche Implementierung, die von V2 wiederverwendet wird. **Nicht löschen!**

---

### Vollständige Page-Inventar

**Pages mit V2-Suffix (7 Stück):**

1. `src/pages/AlertsPageV2.tsx` → Route: `/alerts-v2`
2. `src/pages/AnalysisPageV2.tsx` → Route: `/analysis-v2`
3. `src/pages/ChartPageV2.tsx` → Route: `/chart-v2`
4. `src/pages/DashboardPageV2.tsx` → Route: `/dashboard-v2`
5. `src/pages/JournalPageV2.tsx` → Route: `/journal-v2`
6. `src/pages/SettingsPageV2.tsx` → Route: `/settings-v2`
7. `src/pages/WatchlistPageV2.tsx` → Route: `/watchlist-v2`

**Pages ohne V2-Suffix (10 Stück):**

1. `src/pages/IconShowcase.tsx` → Route: `/icons`
2. `src/pages/LandingPage.tsx` → Route: `/landing`
3. `src/pages/LessonsPage.tsx` → Route: `/lessons`
4. `src/pages/NotificationsPage.tsx` → Route: `/notifications` ⚠️ **Nicht in Navigation**
5. `src/pages/OraclePage.tsx` → Route: `/oracle`
6. `src/pages/ReplayPage.tsx` → Route: `/replay`
7. `src/pages/SettingsPage.tsx` → **Wird von SettingsPageV2 verwendet**
8. `src/pages/SignalsPage.tsx` → Route: `/signals` ⚠️ **Nicht in Navigation**
9. `src/pages/StyleShowcasePage.tsx` → Route: `/styles` (dev only)
10. `src/pages/UXShowcasePage.tsx` → Route: `/ux` (dev only)

**Spezielle Pages:**

- `src/pages/_layout/GlobalInstruments.tsx` → Kein Page, sondern Layout-Komponente (in `AppShell` verwendet)
- `src/features/journal-v2/pages/JournalV2Page.tsx` → Route: `/journal/v2` (Alternative Journal-Implementierung)

---

## 2️⃣ V2-Konsolidierungsplan

### Ziel

Alle V2-Suffixe entfernen, sodass die finale Version ohne `-v2` in URLs und Dateinamen existiert.

**Aktuell:**
- Route: `/dashboard-v2`
- Datei: `src/pages/DashboardPageV2.tsx`
- Komponente: `DashboardPageV2`

**Nach Konsolidierung:**
- Route: `/dashboard`
- Datei: `src/pages/DashboardPage.tsx`
- Komponente: `DashboardPage`

---

### Konsolidierungsplan für jede V2-Page

#### 2.1 DashboardPageV2 → DashboardPage

**Umbenennung:**

| Alt | Neu |
|-----|-----|
| `src/pages/DashboardPageV2.tsx` | `src/pages/DashboardPage.tsx` |
| `export default function DashboardPageV2()` | `export default function DashboardPage()` |

**Betroffene Dateien:**

1. **Route-Definition** (`src/routes/RoutesRoot.tsx:14`)
   ```typescript
   // ALT
   const DashboardPageV2 = lazy(() => import("../pages/DashboardPageV2"));

   // NEU
   const DashboardPage = lazy(() => import("../pages/DashboardPage"));
   ```

2. **Route-Pfade** (`src/routes/RoutesRoot.tsx:59-61,73`)
   ```typescript
   // ALT
   <Route path="/" element={<Navigate to="/dashboard-v2" replace />} />
   <Route path="/dashboard" element={<Navigate to="/dashboard-v2" replace />} />
   <Route path="/board" element={<Navigate to="/dashboard-v2" replace />} />
   <Route path="/dashboard-v2" element={<DashboardPageV2 />} />

   // NEU
   <Route path="/" element={<Navigate to="/dashboard" replace />} />
   <Route path="/dashboard" element={<DashboardPage />} />
   <Route path="/board" element={<Navigate to="/dashboard" replace />} />
   // /dashboard-v2 Route kann entfernt werden (oder Redirect zu /dashboard)
   ```

3. **Navigation Links** (`src/components/layout/BottomNav.tsx:13`)
   ```typescript
   // ALT
   { path: '/dashboard-v2', label: 'Board', Icon: Home },

   // NEU
   { path: '/dashboard', label: 'Board', Icon: Home },
   ```

4. **Navigation Links** (`src/components/layout/Sidebar.tsx:40`)
   ```typescript
   // ALT
   { path: '/dashboard-v2', label: 'Board', Icon: Home },

   // NEU
   { path: '/dashboard', label: 'Board', Icon: Home },
   ```

**Checkliste:**
- [ ] Datei umbenennen: `DashboardPageV2.tsx` → `DashboardPage.tsx`
- [ ] Komponenten-Export anpassen
- [ ] Route-Import in `RoutesRoot.tsx` aktualisieren
- [ ] Route-Pfade in `RoutesRoot.tsx` aktualisieren (entferne `-v2` Suffix)
- [ ] Navigation Links in `BottomNav.tsx` aktualisieren
- [ ] Navigation Links in `Sidebar.tsx` aktualisieren
- [ ] Tests aktualisieren (falls vorhanden)
- [ ] Prüfen: Keine `dashboard-v2` Referenzen mehr im Repo

---

#### 2.2 AnalysisPageV2 → AnalysisPage

**Umbenennung:**

| Alt | Neu |
|-----|-----|
| `src/pages/AnalysisPageV2.tsx` | `src/pages/AnalysisPage.tsx` |
| `export default function AnalysisPageV2()` | `export default function AnalysisPage()` |

**Betroffene Dateien:**

1. **Route-Definition** (`src/routes/RoutesRoot.tsx:15`)
2. **Route-Pfade** (`src/routes/RoutesRoot.tsx:62-63,75`)
3. **BottomNav** (`src/components/layout/BottomNav.tsx:14`)
4. **Sidebar** (`src/components/layout/Sidebar.tsx:41`)

**Checkliste:**
- [ ] Datei umbenennen: `AnalysisPageV2.tsx` → `AnalysisPage.tsx`
- [ ] Komponenten-Export anpassen
- [ ] Route-Import in `RoutesRoot.tsx` aktualisieren
- [ ] Route-Pfade in `RoutesRoot.tsx` aktualisieren (`/analyze` und `/analysis`)
- [ ] Navigation Links in `BottomNav.tsx` aktualisieren
- [ ] Navigation Links in `Sidebar.tsx` aktualisieren
- [ ] Tests aktualisieren (falls vorhanden)
- [ ] Prüfen: Keine `analysis-v2` Referenzen mehr im Repo

---

#### 2.3 ChartPageV2 → ChartPage

**Umbenennung:**

| Alt | Neu |
|-----|-----|
| `src/pages/ChartPageV2.tsx` | `src/pages/ChartPage.tsx` |
| `export default function ChartPageV2()` | `export default function ChartPage()` |

**Betroffene Dateien:**

1. **Route-Definition** (`src/routes/RoutesRoot.tsx:21`)
2. **Route-Pfade** (`src/routes/RoutesRoot.tsx:64,80`)
3. **BottomNav** (`src/components/layout/BottomNav.tsx:15`)
4. **Sidebar** (`src/components/layout/Sidebar.tsx:42`)

**Checkliste:**
- [ ] Datei umbenennen: `ChartPageV2.tsx` → `ChartPage.tsx`
- [ ] Komponenten-Export anpassen
- [ ] Route-Import in `RoutesRoot.tsx` aktualisieren
- [ ] Route-Pfade in `RoutesRoot.tsx` aktualisieren (`/chart`)
- [ ] Navigation Links in `BottomNav.tsx` aktualisieren
- [ ] Navigation Links in `Sidebar.tsx` aktualisieren
- [ ] Tests aktualisieren (falls vorhanden)
- [ ] Prüfen: Keine `chart-v2` Referenzen mehr im Repo

---

#### 2.4 JournalPageV2 → JournalPage

**Umbenennung:**

| Alt | Neu |
|-----|-----|
| `src/pages/JournalPageV2.tsx` | `src/pages/JournalPage.tsx` |
| `export default function JournalPageV2()` | `export default function JournalPage()` |

**Betroffene Dateien:**

1. **Route-Definition** (`src/routes/RoutesRoot.tsx:16`)
2. **Route-Pfade** (`src/routes/RoutesRoot.tsx:65,77`)
3. **BottomNav** (`src/components/layout/BottomNav.tsx:16`)
4. **Sidebar** (`src/components/layout/Sidebar.tsx:43`)
5. **E2E Tests** (`tests/e2e/journal/**/*.spec.ts`)

**Besonderheit:**
Es existiert auch `src/features/journal-v2/pages/JournalV2Page.tsx` mit Route `/journal/v2`. Diese scheint eine alternative Implementierung zu sein. Klären, ob beide behalten werden sollen oder ob eine davon entfernt werden kann.

**Checkliste:**
- [ ] Datei umbenennen: `JournalPageV2.tsx` → `JournalPage.tsx`
- [ ] Komponenten-Export anpassen
- [ ] Route-Import in `RoutesRoot.tsx` aktualisieren
- [ ] Route-Pfade in `RoutesRoot.tsx` aktualisieren (`/journal`)
- [ ] Navigation Links in `BottomNav.tsx` aktualisieren
- [ ] Navigation Links in `Sidebar.tsx` aktualisieren
- [ ] E2E Tests aktualisieren (data-testid, URLs)
- [ ] Prüfen: Keine `journal-v2` Referenzen mehr im Repo
- [ ] Klären: Status von `JournalV2Page` (`/journal/v2` Route)

---

#### 2.5 AlertsPageV2 → AlertsPage

**Umbenennung:**

| Alt | Neu |
|-----|-----|
| `src/pages/AlertsPageV2.tsx` | `src/pages/AlertsPage.tsx` |
| `export default function AlertsPageV2()` | `export default function AlertsPage()` |

**Betroffene Dateien:**

1. **Route-Definition** (`src/routes/RoutesRoot.tsx:20`)
2. **Route-Pfade** (`src/routes/RoutesRoot.tsx:67,79`)
3. **NavigationDrawer** (`src/components/layout/NavigationDrawer.tsx:38`)
4. **Sidebar** (`src/components/layout/Sidebar.tsx:44`)

**Checkliste:**
- [ ] Datei umbenennen: `AlertsPageV2.tsx` → `AlertsPage.tsx`
- [ ] Komponenten-Export anpassen
- [ ] Route-Import in `RoutesRoot.tsx` aktualisieren
- [ ] Route-Pfade in `RoutesRoot.tsx` aktualisieren (`/alerts`)
- [ ] Navigation Links in `NavigationDrawer.tsx` aktualisieren
- [ ] Navigation Links in `Sidebar.tsx` aktualisieren
- [ ] Tests aktualisieren (falls vorhanden)
- [ ] Prüfen: Keine `alerts-v2` Referenzen mehr im Repo

---

#### 2.6 WatchlistPageV2 → WatchlistPage

**Umbenennung:**

| Alt | Neu |
|-----|-----|
| `src/pages/WatchlistPageV2.tsx` | `src/pages/WatchlistPage.tsx` |
| `export default function WatchlistPageV2()` | `export default function WatchlistPage()` |

**Betroffene Dateien:**

1. **Route-Definition** (`src/routes/RoutesRoot.tsx:19`)
2. **Route-Pfade** (`src/routes/RoutesRoot.tsx:66,74`)
3. **NavigationDrawer** (`src/components/layout/NavigationDrawer.tsx:37`)
4. **Sidebar** (`src/components/layout/Sidebar.tsx:50`)

**Checkliste:**
- [ ] Datei umbenennen: `WatchlistPageV2.tsx` → `WatchlistPage.tsx`
- [ ] Komponenten-Export anpassen
- [ ] Route-Import in `RoutesRoot.tsx` aktualisieren
- [ ] Route-Pfade in `RoutesRoot.tsx` aktualisieren (`/watchlist`)
- [ ] Navigation Links in `NavigationDrawer.tsx` aktualisieren
- [ ] Navigation Links in `Sidebar.tsx` aktualisieren
- [ ] Tests aktualisieren (falls vorhanden)
- [ ] Prüfen: Keine `watchlist-v2` Referenzen mehr im Repo

---

#### 2.7 SettingsPageV2 → SettingsPage (Sonderfall)

**Besonderheit:**
`SettingsPageV2` ist ein Wrapper um `SettingsPage`. Es gibt zwei Ansätze:

**Option A: Wrapper behalten (empfohlen)**
- `SettingsPageV2.tsx` umbenennen zu `SettingsPage.tsx`
- Alte `SettingsPage.tsx` umbenennen zu `SettingsContent.tsx` oder `SettingsCore.tsx`
- Vorteil: Klare Trennung zwischen Layout (Wrapper) und Logik (Content)

**Option B: Wrapper auflösen**
- `SettingsPageV2.tsx` löschen
- `SettingsPage.tsx` direkt mit `DashboardShell` erweitern
- Nachteil: Mischung von Layout und Logik in einer Datei

**Empfohlene Umbenennung (Option A):**

| Alt | Neu |
|-----|-----|
| `src/pages/SettingsPageV2.tsx` | `src/pages/SettingsPage.tsx` |
| `src/pages/SettingsPage.tsx` | `src/pages/SettingsContent.tsx` |
| Import: `import SettingsPage from './SettingsPage'` | `import SettingsContent from './SettingsContent'` |

**Betroffene Dateien:**

1. **Route-Definition** (`src/routes/RoutesRoot.tsx:22`)
2. **Route-Pfade** (`src/routes/RoutesRoot.tsx:81`)
3. **BottomNav** (`src/components/layout/BottomNav.tsx:17`)
4. **Sidebar** (`src/components/layout/Sidebar.tsx:58`)

**Checkliste:**
- [ ] Alte `SettingsPage.tsx` umbenennen zu `SettingsContent.tsx`
- [ ] `SettingsPageV2.tsx` umbenennen zu `SettingsPage.tsx`
- [ ] Import in neuem `SettingsPage.tsx` anpassen (`SettingsContent`)
- [ ] Route-Import in `RoutesRoot.tsx` aktualisieren
- [ ] Route-Pfade in `RoutesRoot.tsx` aktualisieren (`/settings`)
- [ ] Navigation Links in `BottomNav.tsx` aktualisieren
- [ ] Navigation Links in `Sidebar.tsx` aktualisieren
- [ ] Tests aktualisieren (falls vorhanden)
- [ ] Prüfen: Keine `settings-v2` Referenzen mehr im Repo

---

### Globale Änderungen nach V2-Konsolidierung

Nach Abschluss aller Umbenennungen müssen folgende **globale Checks** durchgeführt werden:

1. **Redirects in RoutesRoot.tsx aufräumen**
   - Alle `-v2` Redirects können entfernt oder angepasst werden
   - Beispiel: `<Route path="/dashboard" element={<Navigate to="/dashboard-v2" replace />} />`
   - Wird zu: `<Route path="/dashboard" element={<DashboardPage />} />`

2. **Alte V2-Routen als Redirects beibehalten (Optional)**
   - Falls Nutzer Bookmarks zu `/dashboard-v2` haben, können Redirects beibehalten werden:
   ```typescript
   <Route path="/dashboard-v2" element={<Navigate to="/dashboard" replace />} />
   ```

3. **Globale Code-Suche**
   ```bash
   # Suche nach allen verbleibenden -v2 Referenzen
   grep -r "dashboard-v2\|analysis-v2\|chart-v2\|journal-v2\|alerts-v2\|watchlist-v2\|settings-v2" src/
   grep -r "DashboardPageV2\|AnalysisPageV2\|ChartPageV2\|JournalPageV2\|AlertsPageV2\|WatchlistPageV2\|SettingsPageV2" src/
   ```

4. **Tests aktualisieren**
   - E2E Tests: URLs ohne `-v2`
   - Unit Tests: Komponenten-Imports
   - data-testid: Falls diese `-v2` enthalten

5. **Dokumentation aktualisieren**
   - `README.md`
   - `/docs/**/*.md`
   - Confluence/Jira/andere externe Docs

---

## 3️⃣ Navigation-Analyse

### Navigationskomponenten

Die App nutzt drei Navigationskomponenten:

1. **BottomNav** (`src/components/layout/BottomNav.tsx`)
   - Mobile Navigation (< lg Breakpoint)
   - 5 primäre Tabs + 1 "More" Button (öffnet NavigationDrawer)
   - Position: Fixed bottom

2. **Sidebar** (`src/components/layout/Sidebar.tsx`)
   - Desktop Navigation (>= lg Breakpoint)
   - 3 Sektionen: "Trading Workflow", "Knowledge Base", "System"
   - Collapsible (gespeichert in localStorage)

3. **NavigationDrawer** (`src/components/layout/NavigationDrawer.tsx`)
   - Mobile Drawer (slide-out von rechts)
   - Sekundäre Navigation Items
   - Öffnet sich via "More" Button in BottomNav

### Navigations-Items Übersicht

#### BottomNav (5 primäre Tabs)

| Label | Route | Icon | data-testid |
|-------|-------|------|-------------|
| Board | `/dashboard-v2` | Home | `nav-board` |
| Analyze | `/analysis-v2` | BarChart3 | `nav-analyze` |
| Chart | `/chart-v2` | TrendingUp | `nav-chart` |
| Journal | `/journal-v2` | FileText | `nav-journal` |
| Settings | `/settings-v2` | Settings | `nav-settings` |
| **More** | (öffnet Drawer) | Menu | `nav-drawer-trigger` |

**Quelle:** `src/components/layout/BottomNav.tsx:12-18`

---

#### NavigationDrawer (6 sekundäre Items)

| Label | Route | Icon | data-testid |
|-------|-------|------|-------------|
| Watchlist | `/watchlist-v2` | BookmarkPlus | `nav-watchlist` |
| Alerts | `/alerts-v2` | Bell | `nav-alerts` |
| Oracle | `/oracle` | Sparkles | `nav-oracle` |
| Replay | `/replay` | RefreshCw | `nav-replay` |
| Learning | `/lessons` | GraduationCap | `nav-lessons` |
| Showcase | `/icons` | Star | `nav-showcase` |

**Quelle:** `src/components/layout/NavigationDrawer.tsx:36-43`

---

#### Sidebar (Desktop - 3 Sektionen)

**Trading Workflow:**

| Label | Route | Icon | data-testid |
|-------|-------|------|-------------|
| Board | `/dashboard-v2` | Home | `nav-board` |
| Analyze | `/analysis-v2` | BarChart3 | `nav-analyze` |
| Chart | `/chart-v2` | TrendingUp | `nav-chart` |
| Journal | `/journal-v2` | FileText | `nav-journal` |
| Alerts | `/alerts-v2` | Bell | `nav-alerts` |

**Knowledge Base:**

| Label | Route | Icon | data-testid |
|-------|-------|------|-------------|
| Watchlist | `/watchlist-v2` | BookmarkPlus | `nav-watchlist` |
| Oracle | `/oracle` | Sparkles | `nav-oracle` |
| Learning | `/lessons` | GraduationCap | `nav-lessons` |
| Showcase | `/icons` | Star | `nav-showcase` |

**System:**

| Label | Route | Icon | data-testid |
|-------|-------|------|-------------|
| Settings | `/settings-v2` | Settings | `nav-settings` |

**Quelle:** `src/components/layout/Sidebar.tsx:36-60`

---

### Fehlende Pages in Navigation

Die folgenden Pages existieren und sind in den Routes definiert, **fehlen aber in der Navigation**:

#### 1. SignalsPage

- **Datei:** `src/pages/SignalsPage.tsx`
- **Route:** `/signals` (definiert in `RoutesRoot.tsx:71`)
- **Beschreibung:** Trading Signals Dashboard mit Pattern-Filter, Richtungsfilter und Confidence-Threshold
- **Komponente:** Vollständig implementiert (nutzt `DashboardShell`, `useSignals` Hook, `SignalCard`)

**Warum fehlt es in der Navigation?**

Mögliche Gründe:
1. **Absichtlich versteckt:** Feature noch nicht produktionsreif oder wird über andere Einstiegspunkte erreicht (z.B. Alert → Signal)
2. **Vergessen:** Page wurde implementiert, aber Navigation wurde nicht aktualisiert
3. **Platzmangel:** Drawer ist bereits mit 6 Items gefüllt

**Technische Ursache:**

- `SignalsPage` ist **nicht** in `drawerItems` Array (`NavigationDrawer.tsx:36-43`) enthalten
- `SignalsPage` ist **nicht** in `navSections` Array (`Sidebar.tsx:36-60`) enthalten

**Wo sollte es eingefügt werden?**

Empfehlung: **Knowledge Base** Sektion in Sidebar, **NavigationDrawer** für Mobile

```typescript
// src/components/layout/NavigationDrawer.tsx:36
const drawerItems: DrawerNavItem[] = [
  { path: '/watchlist-v2', label: 'Watchlist', Icon: BookmarkPlus },
  { path: '/alerts-v2', label: 'Alerts', Icon: Bell },
  { path: '/signals', label: 'Signals', Icon: TrendingUp }, // NEU
  { path: '/oracle', label: 'Oracle', Icon: Sparkles },
  { path: '/replay', label: 'Replay', Icon: RefreshCw },
  { path: '/lessons', label: 'Learning', Icon: GraduationCap },
  { path: '/icons', label: 'Showcase', Icon: Star },
]
```

```typescript
// src/components/layout/Sidebar.tsx:48
{
  title: 'Knowledge Base',
  items: [
    { path: '/watchlist-v2', label: 'Watchlist', Icon: BookmarkPlus },
    { path: '/signals', label: 'Signals', Icon: TrendingUp }, // NEU
    { path: '/oracle', label: 'Oracle', Icon: Sparkles },
    { path: '/lessons', label: 'Learning', Icon: GraduationCap },
    { path: '/icons', label: 'Showcase', Icon: Star },
  ],
}
```

---

#### 2. NotificationsPage

- **Datei:** `src/pages/NotificationsPage.tsx`
- **Route:** `/notifications` (definiert in `RoutesRoot.tsx:70`)
- **Beschreibung:** Alert Rules Management, Push Notifications, Idea Packets (sehr umfangreich)
- **Komponente:** Vollständig implementiert

**Warum fehlt es in der Navigation?**

Mögliche Gründe:
1. **Ersetzt durch AlertsPageV2:** Die Funktionalität könnte in `AlertsPageV2` migriert worden sein
2. **Legacy-Page:** Könnte eine alte Implementierung sein, die durch neuere Pages ersetzt wurde
3. **Entwickler-Tool:** Möglicherweise nur für interne Zwecke gedacht

**Technische Ursache:**

- `NotificationsPage` ist **nicht** in `drawerItems` Array (`NavigationDrawer.tsx:36-43`) enthalten
- `NotificationsPage` ist **nicht** in `navSections` Array (`Sidebar.tsx:36-60`) enthalten

**Klärungsbedarf:**

1. **Ist NotificationsPage == AlertsPageV2?**
   - Wenn ja: Route `/notifications` kann entfernt werden oder redirecten zu `/alerts-v2`
   - Wenn nein: In Navigation einfügen

2. **Soll NotificationsPage behalten werden?**
   - Wenn ja: In Navigation einfügen (z.B. als "Notifications" neben "Alerts")
   - Wenn nein: Route entfernen und Page löschen

**Falls behalten:**

```typescript
// src/components/layout/NavigationDrawer.tsx:36
const drawerItems: DrawerNavItem[] = [
  { path: '/watchlist-v2', label: 'Watchlist', Icon: BookmarkPlus },
  { path: '/alerts-v2', label: 'Alerts', Icon: Bell },
  { path: '/notifications', label: 'Notifications', Icon: Bell }, // NEU (oder anderes Icon)
  { path: '/oracle', label: 'Oracle', Icon: Sparkles },
  // ...
]
```

---

### Zusammenfassung: Fehlende Navigation-Items

| Page | Route | Wo fehlt es? | Empfehlung |
|------|-------|--------------|-----------|
| SignalsPage | `/signals` | BottomNav, Sidebar, NavigationDrawer | **Hinzufügen** – vollständiges Feature |
| NotificationsPage | `/notifications` | BottomNav, Sidebar, NavigationDrawer | **Klären** – möglicherweise Legacy |

---

### Navigation ist vollständig implementiert

Die Navigation selbst ist **technisch vollständig implementiert** und in `AppShell` korrekt eingebunden:

**AppShell.tsx (`src/components/layout/AppShell.tsx:22-60`):**

```typescript
export default function AppShell() {
  return (
    <div className="relative min-h-screen bg-app-gradient text-text-primary">
      <Sidebar />  {/* Desktop Navigation */}

      <div className="flex min-h-screen flex-col lg:pl-[var(--sidebar-width,5rem)]">
        <Header />

        <main id="main-content">
          <Outlet />  {/* Page Content */}
        </main>

        <GlobalInstruments />
      </div>

      <BottomNav />  {/* Mobile Navigation */}
    </div>
  );
}
```

**Einbindung in Routes (`src/routes/RoutesRoot.tsx:58`):**

```typescript
<Route element={<AppShell />}>
  {/* Alle App-Pages werden hier gerendert */}
</Route>
```

**Fazit:**

Die Navigation ist **korrekt implementiert und integriert**. Es fehlen lediglich 2 Pages in der Navigationsliste (siehe oben).

---

## 4️⃣ Handlungsempfehlungen

### Sofortige Maßnahmen

1. **SignalsPage zur Navigation hinzufügen**
   - [ ] `NavigationDrawer.tsx` aktualisieren (Mobile)
   - [ ] `Sidebar.tsx` aktualisieren (Desktop)
   - [ ] Icon wählen (z.B. `TrendingUp`, `Activity`, oder `Zap`)
   - [ ] data-testid hinzufügen (`nav-signals`)

2. **NotificationsPage klären**
   - [ ] Prüfen: Ist Funktionalität in `AlertsPageV2` enthalten?
   - [ ] Entscheiden: Behalten oder entfernen?
   - [ ] Falls behalten: Zur Navigation hinzufügen
   - [ ] Falls entfernen: Route löschen, Page löschen

### Mittelfristige Maßnahmen (V2-Konsolidierung)

3. **V2-Suffixe entfernen (empfohlen)**
   - [ ] Plan für jede Page durcharbeiten (siehe Abschnitt 2)
   - [ ] Umbenennungen in Feature-Branch durchführen
   - [ ] Tests ausführen (Unit + E2E)
   - [ ] PR erstellen mit Checkliste

4. **Alternative: V2-Suffixe beibehalten (nicht empfohlen)**
   - Wenn `-v2` als permanente Versionierung gedacht ist
   - Begründung dokumentieren
   - Konsistent durchziehen (dann auch z.B. `OraclePage` → `OraclePageV2`)

### Langfristige Maßnahmen

5. **Doppelte Journal-Implementierung klären**
   - [ ] `JournalPageV2.tsx` (`/journal-v2`)
   - [ ] `JournalV2Page.tsx` (`/journal/v2`)
   - [ ] Entscheiden: Welche ist die finale Version?
   - [ ] Andere entfernen oder klare Trennung dokumentieren

6. **Dokumentation aktualisieren**
   - [ ] `README.md` mit finalen Routen
   - [ ] `/docs/` aktualisieren
   - [ ] Navigation-Struktur dokumentieren

---

## 5️⃣ Technische Details

### Dateistruktur

```
src/
├── components/
│   └── layout/
│       ├── AppShell.tsx          # Main Layout Wrapper
│       ├── BottomNav.tsx         # Mobile Navigation (5 tabs + More)
│       ├── NavigationDrawer.tsx  # Mobile Drawer (6 items)
│       └── Sidebar.tsx           # Desktop Navigation (3 sections)
├── pages/
│   ├── AlertsPageV2.tsx          # V2: Alerts Management
│   ├── AnalysisPageV2.tsx        # V2: Analysis Dashboard
│   ├── ChartPageV2.tsx           # V2: Chart View
│   ├── DashboardPageV2.tsx       # V2: Main Dashboard
│   ├── JournalPageV2.tsx         # V2: Journal Page
│   ├── SettingsPageV2.tsx        # V2: Settings Wrapper
│   ├── WatchlistPageV2.tsx       # V2: Watchlist
│   ├── SettingsPage.tsx          # Settings Implementation (used by V2)
│   ├── IconShowcase.tsx          # Icon Library
│   ├── LandingPage.tsx           # Landing Page (no layout)
│   ├── LessonsPage.tsx           # Learning/Lessons
│   ├── NotificationsPage.tsx     # ⚠️ NOT IN NAVIGATION
│   ├── OraclePage.tsx            # Oracle/AI Assistant
│   ├── ReplayPage.tsx            # Replay Mode
│   ├── SignalsPage.tsx           # ⚠️ NOT IN NAVIGATION
│   ├── StyleShowcasePage.tsx     # (dev only)
│   └── UXShowcasePage.tsx        # (dev only)
└── routes/
    └── RoutesRoot.tsx            # Route Definitions
```

---

### Route-Mapping (Aktuell)

| Route | Page | In Navigation? | Typ |
|-------|------|----------------|-----|
| `/` | → `/dashboard-v2` | (Redirect) | - |
| `/landing` | LandingPage | Nein (Standalone) | Extern |
| `/dashboard` | → `/dashboard-v2` | (Redirect) | - |
| `/dashboard-v2` | DashboardPageV2 | ✅ Ja (Board) | V2 |
| `/board` | → `/dashboard-v2` | (Redirect) | - |
| `/analyze` | → `/analysis-v2` | (Redirect) | - |
| `/analysis` | → `/analysis-v2` | (Redirect) | - |
| `/analysis-v2` | AnalysisPageV2 | ✅ Ja (Analyze) | V2 |
| `/chart` | → `/chart-v2` | (Redirect) | - |
| `/chart-v2` | ChartPageV2 | ✅ Ja (Chart) | V2 |
| `/journal` | → `/journal-v2` | (Redirect) | - |
| `/journal-v2` | JournalPageV2 | ✅ Ja (Journal) | V2 |
| `/journal/v2` | JournalV2PipelinePage | ❓ Unklar | Alternative? |
| `/watchlist` | → `/watchlist-v2` | (Redirect) | - |
| `/watchlist-v2` | WatchlistPageV2 | ✅ Ja (Watchlist) | V2 |
| `/alerts` | → `/alerts-v2` | (Redirect) | - |
| `/alerts-v2` | AlertsPageV2 | ✅ Ja (Alerts) | V2 |
| `/settings-v2` | SettingsPageV2 | ✅ Ja (Settings) | V2 |
| `/oracle` | OraclePage | ✅ Ja (Oracle) | Standard |
| `/replay` | ReplayPage | ✅ Ja (Replay) | Standard |
| `/replay/:sessionId` | ReplayPage | ✅ Ja (Replay) | Standard |
| `/lessons` | LessonsPage | ✅ Ja (Learning) | Standard |
| `/icons` | IconShowcase | ✅ Ja (Showcase) | Standard |
| `/signals` | SignalsPage | ❌ **FEHLT** | Standard |
| `/notifications` | NotificationsPage | ❌ **FEHLT** | Standard |
| `/styles` | StyleShowcasePage | Nein (dev only) | Dev |
| `/ux` | UXShowcasePage | Nein (dev only) | Dev |

---

### Navigation-Verteilung

**BottomNav (Mobile - 5 Primary Tabs):**
- Board (Dashboard)
- Analyze
- Chart
- Journal
- Settings

**NavigationDrawer (Mobile - 6 Secondary Items):**
- Watchlist
- Alerts
- Oracle
- Replay
- Learning
- Showcase

**Sidebar Desktop - Trading Workflow (5 Items):**
- Board
- Analyze
- Chart
- Journal
- Alerts

**Sidebar Desktop - Knowledge Base (4 Items):**
- Watchlist
- Oracle
- Learning
- Showcase

**Sidebar Desktop - System (1 Item):**
- Settings

**NICHT in Navigation (2 Pages):**
- ❌ Signals (`/signals`)
- ❌ Notifications (`/notifications`)

---

## 6️⃣ Code-Beispiele

### Beispiel: SignalsPage zur Navigation hinzufügen

#### 1. NavigationDrawer erweitern (Mobile)

**Datei:** `src/components/layout/NavigationDrawer.tsx:36-43`

```typescript
// ALT
const drawerItems: DrawerNavItem[] = [
  { path: '/watchlist-v2', label: 'Watchlist', Icon: BookmarkPlus },
  { path: '/alerts-v2', label: 'Alerts', Icon: Bell },
  { path: '/oracle', label: 'Oracle', Icon: Sparkles },
  { path: '/replay', label: 'Replay', Icon: RefreshCw },
  { path: '/lessons', label: 'Learning', Icon: GraduationCap },
  { path: '/icons', label: 'Showcase', Icon: Star },
]

// NEU
import { /* ... */, TrendingUp } from '@/lib/icons' // Icon importieren

const drawerItems: DrawerNavItem[] = [
  { path: '/watchlist-v2', label: 'Watchlist', Icon: BookmarkPlus },
  { path: '/alerts-v2', label: 'Alerts', Icon: Bell },
  { path: '/signals', label: 'Signals', Icon: TrendingUp }, // ← NEU
  { path: '/oracle', label: 'Oracle', Icon: Sparkles },
  { path: '/replay', label: 'Replay', Icon: RefreshCw },
  { path: '/lessons', label: 'Learning', Icon: GraduationCap },
  { path: '/icons', label: 'Showcase', Icon: Star },
]
```

#### 2. Test-ID hinzufügen

**Datei:** `src/components/layout/NavigationDrawer.tsx:45-55`

```typescript
// ALT
const getTestId = (label: string) => {
  const testIdMap: Record<string, string> = {
    Alerts: 'nav-alerts',
    Watchlist: 'nav-watchlist',
    Oracle: 'nav-oracle',
    Replay: 'nav-replay',
    Learning: 'nav-lessons',
    Showcase: 'nav-showcase',
  }
  return testIdMap[label] || ''
}

// NEU
const getTestId = (label: string) => {
  const testIdMap: Record<string, string> = {
    Alerts: 'nav-alerts',
    Watchlist: 'nav-watchlist',
    Signals: 'nav-signals', // ← NEU
    Oracle: 'nav-oracle',
    Replay: 'nav-replay',
    Learning: 'nav-lessons',
    Showcase: 'nav-showcase',
  }
  return testIdMap[label] || ''
}
```

#### 3. Sidebar erweitern (Desktop)

**Datei:** `src/components/layout/Sidebar.tsx:48-55`

```typescript
// ALT
{
  title: 'Knowledge Base',
  items: [
    { path: '/watchlist-v2', label: 'Watchlist', Icon: BookmarkPlus },
    { path: '/oracle', label: 'Oracle', Icon: Sparkles },
    { path: '/lessons', label: 'Learning', Icon: GraduationCap },
    { path: '/icons', label: 'Showcase', Icon: Star },
  ],
}

// NEU
import { /* ... */, TrendingUp } from '@/lib/icons' // Icon importieren

{
  title: 'Knowledge Base',
  items: [
    { path: '/watchlist-v2', label: 'Watchlist', Icon: BookmarkPlus },
    { path: '/signals', label: 'Signals', Icon: TrendingUp }, // ← NEU
    { path: '/oracle', label: 'Oracle', Icon: Sparkles },
    { path: '/lessons', label: 'Learning', Icon: GraduationCap },
    { path: '/icons', label: 'Showcase', Icon: Star },
  ],
}
```

#### 4. Test-ID Map in Sidebar aktualisieren

**Datei:** `src/components/layout/Sidebar.tsx:103-117`

```typescript
// ALT
const getNavIds = (label: string) => {
  const idMap: Record<string, { tour: string; testid: string }> = {
    'Board': { tour: 'board-link', testid: 'nav-board' },
    'Analyze': { tour: 'analyze-link', testid: 'nav-analyze' },
    'Chart': { tour: 'chart-link', testid: 'nav-chart' },
    'Journal': { tour: 'journal-link', testid: 'nav-journal' },
    'Alerts': { tour: 'notifications-link', testid: 'nav-alerts' },
    'Watchlist': { tour: '', testid: 'nav-watchlist' },
    'Oracle': { tour: 'oracle-link', testid: 'nav-oracle' },
    'Learning': { tour: '', testid: 'nav-lessons' },
    'Showcase': { tour: '', testid: 'nav-showcase' },
    'Settings': { tour: 'settings-link', testid: 'nav-settings' },
  };
  return idMap[label] || { tour: '', testid: '' };
};

// NEU
const getNavIds = (label: string) => {
  const idMap: Record<string, { tour: string; testid: string }> = {
    'Board': { tour: 'board-link', testid: 'nav-board' },
    'Analyze': { tour: 'analyze-link', testid: 'nav-analyze' },
    'Chart': { tour: 'chart-link', testid: 'nav-chart' },
    'Journal': { tour: 'journal-link', testid: 'nav-journal' },
    'Alerts': { tour: 'notifications-link', testid: 'nav-alerts' },
    'Watchlist': { tour: '', testid: 'nav-watchlist' },
    'Signals': { tour: '', testid: 'nav-signals' }, // ← NEU
    'Oracle': { tour: 'oracle-link', testid: 'nav-oracle' },
    'Learning': { tour: '', testid: 'nav-lessons' },
    'Showcase': { tour: '', testid: 'nav-showcase' },
    'Settings': { tour: 'settings-link', testid: 'nav-settings' },
  };
  return idMap[label] || { tour: '', testid: '' };
};
```

---

### Beispiel: DashboardPageV2 → DashboardPage konsolidieren

#### 1. Datei umbenennen

```bash
mv src/pages/DashboardPageV2.tsx src/pages/DashboardPage.tsx
```

#### 2. Komponenten-Export anpassen

**Datei:** `src/pages/DashboardPage.tsx`

```typescript
// ALT
export default function DashboardPageV2() {
  // ...
}

// NEU
export default function DashboardPage() {
  // ...
}
```

#### 3. Route-Import aktualisieren

**Datei:** `src/routes/RoutesRoot.tsx:14`

```typescript
// ALT
const DashboardPageV2 = lazy(() => import("../pages/DashboardPageV2"));

// NEU
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
```

#### 4. Route-Pfade aktualisieren

**Datei:** `src/routes/RoutesRoot.tsx:59-61,73`

```typescript
// ALT
<Route path="/" element={<Navigate to="/dashboard-v2" replace />} />
<Route path="/dashboard" element={<Navigate to="/dashboard-v2" replace />} />
<Route path="/board" element={<Navigate to="/dashboard-v2" replace />} />
<Route path="/dashboard-v2" element={<DashboardPageV2 />} />

// NEU
<Route path="/" element={<Navigate to="/dashboard" replace />} />
<Route path="/dashboard" element={<DashboardPage />} />
<Route path="/board" element={<Navigate to="/dashboard" replace />} />
{/* Optional: Redirect für alte Bookmarks */}
<Route path="/dashboard-v2" element={<Navigate to="/dashboard" replace />} />
```

#### 5. Navigation aktualisieren

**Datei:** `src/components/layout/BottomNav.tsx:13`

```typescript
// ALT
const primaryNavItems: NavItem[] = [
  { path: '/dashboard-v2', label: 'Board', Icon: Home },
  // ...
]

// NEU
const primaryNavItems: NavItem[] = [
  { path: '/dashboard', label: 'Board', Icon: Home },
  // ...
]
```

**Datei:** `src/components/layout/Sidebar.tsx:40`

```typescript
// ALT
items: [
  { path: '/dashboard-v2', label: 'Board', Icon: Home },
  // ...
]

// NEU
items: [
  { path: '/dashboard', label: 'Board', Icon: Home },
  // ...
]
```

#### 6. Globale Suche nach Referenzen

```bash
grep -r "dashboard-v2" src/
grep -r "DashboardPageV2" src/
```

Alle Treffer müssen aktualisiert werden.

---

## 7️⃣ Anhang

### Verwendete Tools

- `Glob`: Pattern-basierte Dateisuche
- `Grep`: Code-Suche nach Imports und Referenzen
- `Read`: Dateiinhalte analysieren
- `Bash`: Dateisystem-Operationen

### Dateien analysiert

- `src/routes/RoutesRoot.tsx`
- `src/components/layout/AppShell.tsx`
- `src/components/layout/BottomNav.tsx`
- `src/components/layout/Sidebar.tsx`
- `src/components/layout/NavigationDrawer.tsx`
- `src/pages/SettingsPage.tsx`
- `src/pages/SettingsPageV2.tsx`
- `src/pages/SignalsPage.tsx`
- `src/pages/NotificationsPage.tsx`
- Alle Page-Komponenten via `src/pages/**/*Page*.tsx`

### Nächste Schritte

1. **Dieses Dokument reviewen** mit Team/Stakeholder
2. **Entscheidung treffen:**
   - V2-Konsolidierung durchführen? (Ja/Nein)
   - SignalsPage zur Navigation hinzufügen? (Ja)
   - NotificationsPage behalten oder entfernen? (Klären)
3. **Tasks in Jira/Tickets erstellen** basierend auf diesem Dokument
4. **Implementation in Feature-Branch**
5. **Testing** (E2E, Unit)
6. **Pull Request erstellen**

---

**Ende der Analyse**
