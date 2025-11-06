# 🎯 PHASE 3 – Tabs-Bearbeitungsreihenfolge

**Datum:** 2025-11-05  
**Branch:** cursor/scan-repository-and-understand-setup-0875  
**Strategie:** Minimiere Abhängigkeiten, maximiere MVP-Launch-Geschwindigkeit

---

## 📊 Empfohlene Reihenfolge (1–11)

| # | Page | Route | Priorität | Begründung | Abhängigkeiten | Geschätzte Zeit |
|---|------|-------|-----------|------------|----------------|-----------------|
| **1** | SettingsPage | `/settings` | 🔴 MVP | ✅ 90% fertig, keine Backend-Deps, essentiell für UX | useSettings, useTelemetry, useAISettings, datastore | 2h (Polish + Tests) |
| **2** | LandingPage | `/landing` | 🟢 MVP | ✅ 100% fertig, standalone, Marketing | Keine | 1h (Copy-Text-Review) |
| **3** | BoardPage | `/` | 🔴 MVP | Dashboard-Kern, zeigt App-Struktur, funktioniert mit Fallback-Daten | Overview, Focus, QuickActions, Feed Components | 6h (API-Fallbacks + Polish) |
| **4** | ChartPage | `/chart` | 🔴 MVP | ✅ 85% fertig, Kern-Feature, funktioniert mit Demo-Data | Canvas, Indicators, Drawing, Replay, Backtest Components | 8h (OHLC-Fallback + Export-PNG) |
| **5** | AnalyzePage | `/analyze` | 🔴 MVP | Kern-Feature, zeigt Value-Proposition, funktioniert mit Fallback | fetchOhlc, kpis, Heatmap, AI-Assist | 6h (API-Fallbacks + AI-Teaser) |
| **6** | JournalPage | `/journal` | 🟡 Alpha | ✅ 75% fertig, wichtig für UX, LocalStorage funktioniert | useJournal, JournalEditor, JournalList, AI-Assist | 5h (Server-Sync optional + OCR-Teaser) |
| **7** | NotificationsPage | `/notifications` | 🟡 Alpha | Alert-System, wichtig für Engagement, Local-Rules funktionieren | useAlertRules, RuleEditor, RuleWizard, Push | 7h (Server-Upload + Push-Teaser) |
| **8** | AccessPage | `/access` | 🟡 Alpha | Tokenomics-System, wichtig für Monetization | AccessComponents, Solana-Wallet, API-Endpoints | 8h (Solana-Connect + API-Mocks) |
| **9** | ReplayPage | `/replay` | 🟢 Alpha | Nice-to-have, Demo-Feature für Showcase | ReplayModal, db.ts, ReplayService | 4h (Playback-Engine + Canvas-Cursor) |
| **10** | SignalsPage | `/signals` | 🟢 Teaser | Showcase-Feature, funktioniert mit Mock-Data | useSignals, SignalCard, SignalReviewCard | 3h (Polish + Teaser-Banner) |
| **11** | LessonsPage | `/lessons` | 🟢 Teaser | Showcase-Feature, funktioniert mit Mock-Data | useLessons, LessonCard | 3h (Polish + Teaser-Banner) |

**Gesamtzeit (Schätzung):** ~53 Stunden (ca. 7 Arbeitstage)

---

## 🛤️ Kritischer Pfad (MVP-Launch)

### Slice 1: Essentials (1–2)
**Ziel:** App-Shell lauffähig + Marketing-Seite

**Pages:** Settings, Landing

**Deliverables:**
- ✅ Settings-Page: Theme-Toggle, Chart-Settings, Telemetry, AI-Keys, Data-Export
- ✅ Landing-Page: Hero, Features, Pricing, Testimonials, CTA

**Zeit:** ~3 Stunden

**Checks:**
- Settings speichern/laden funktioniert (LocalStorage)
- Landing-Page responsive (Mobile/Desktop)
- "Launch App"-Button navigiert zu `/board`

---

### Slice 2: MVP-Kern (3–5)
**Ziel:** 3 Kern-Features demonstrierbar (Board, Chart, Analyze)

**Pages:** Board, Chart, Analyze

**Deliverables:**
- ✅ Board-Page: KPIs (11 Tiles), Feed, QuickActions, Focus mit **Fallback-Daten**
- ✅ Chart-Page: Canvas-Rendering, Indicators, Drawing-Tools, Zoom/Pan mit **Demo-Data**
- ✅ Analyze-Page: KPI-Berechnung, Heatmap, AI-Bullets-Teaser mit **Fallback-Daten**

**Zeit:** ~20 Stunden

**Checks:**
- Board lädt ohne API (zeigt Mock-KPIs)
- Chart zeichnet mit Demo-OHLC-Data (hardcoded 100 Candles)
- Analyze berechnet KPIs aus Demo-Data
- Alle 3 Pages responsive (Mobile/Desktop)
- Navigation zwischen Pages funktioniert (Sidebar/BottomNav)

**API-Strategie:** 
- Fallback-Daten hardcoded in Components
- API-Calls mit `try/catch` → bei Fehler Fallback
- Teaser-Banner: "Connect API-Keys in Settings to unlock real-time data"

---

### Slice 3: Alpha-Features (6–8)
**Ziel:** Wichtige Features für Alpha-Tester (Journal, Notifications, Access)

**Pages:** Journal, Notifications, Access

**Deliverables:**
- ✅ Journal-Page: Editor, AI-Kompression-Teaser, LocalStorage-Sync
- ✅ Notifications-Page: Local-Rules-Editor, Server-Upload-Teaser, Push-Teaser
- ✅ Access-Page: Wallet-Connect-Teaser, Lock-Calculator-Demo, Leaderboard-Mock

**Zeit:** ~20 Stunden

**Checks:**
- Journal speichert Notes lokal (IndexedDB)
- Notifications zeigt Local-Rules, Edit/Delete funktioniert
- Access zeigt Demo-Leaderboard (Mock-Data)

**API-Strategie:**
- Journal: LocalStorage first, Server-Sync optional (Feature-Flag)
- Notifications: Local-Rules funktionieren, Server-Upload zeigt "Coming Soon"
- Access: Wallet-Connect zeigt "Connect Wallet" (ohne echte Solana-Integration)

---

### Slice 4: Showcase-Features (9–11)
**Ziel:** Demo-Features für Teaser (Replay, Signals, Lessons)

**Pages:** Replay, Signals, Lessons

**Deliverables:**
- ✅ Replay-Page: Session-List mit Mock-Data, Replay-Button zeigt Teaser
- ✅ Signals-Page: Signals-Grid mit Mock-Patterns, Filter funktioniert
- ✅ Lessons-Page: Lessons-Grid mit Mock-Lessons, Stats-Display

**Zeit:** ~10 Stunden

**Checks:**
- Replay zeigt "Feature coming soon" Banner
- Signals zeigt Mock-Signals (6–10 Items)
- Lessons zeigt Mock-Lessons (6–10 Items)
- Filter funktionieren (Pattern-Filter, Confidence-Slider)

**Teaser-Strategie:**
- Alle 3 Pages funktionieren mit Mock-Data
- Banner: "AI-Generated Signals & Lessons coming in Alpha Release"

---

## 🔄 Abhängigkeiten-Graph

```
LandingPage ────────────────────────┐
                                     │
SettingsPage ─────────────────────► BoardPage
                                     │
                ┌────────────────────┼────────────────┐
                │                    │                │
            ChartPage          AnalyzePage      JournalPage
                │                    │                │
                │                    └────────────────┤
                │                                     │
           ReplayPage                          NotificationsPage
                                                      │
                                                 AccessPage
                                                      │
                                        ┌─────────────┴──────────────┐
                                   SignalsPage              LessonsPage
```

**Legende:**
- → Direkte Abhängigkeit
- Keine Linie = Unabhängig (parallel bearbeitbar)

---

## 🚀 Sprint-Plan (Empfehlung)

### Sprint 1: MVP-Foundation (3 Tage)
**Ziel:** App-Shell + 3 Kern-Features demonstrierbar

| Tag | Tasks | Pages | Stunden |
|-----|-------|-------|---------|
| **1** | Settings-Polish + Landing-Copy | Settings, Landing | 3h |
| **2** | Board-Fallbacks + Chart-Demo-Data | Board, Chart | 14h |
| **3** | Analyze-Fallbacks + Navigation-Test | Analyze, All | 6h |

**Deliverable:** MVP-Demo (Board, Chart, Analyze funktionieren mit Fallback-Data)

---

### Sprint 2: Alpha-Features (3 Tage)
**Ziel:** Journal, Notifications, Access funktional (lokal)

| Tag | Tasks | Pages | Stunden |
|-----|-------|-------|---------|
| **4** | Journal-LocalStorage + AI-Teaser | Journal | 5h |
| **5** | Notifications-Local-Rules + Wizard | Notifications | 7h |
| **6** | Access-Wallet-Teaser + Lock-Calculator | Access | 8h |

**Deliverable:** Alpha-Build (7 Pages funktional)

---

### Sprint 3: Showcase-Features (1 Tag)
**Ziel:** Replay, Signals, Lessons mit Mock-Data

| Tag | Tasks | Pages | Stunden |
|-----|-------|-------|---------|
| **7** | Replay-Session-List + Signals/Lessons-Mock | Replay, Signals, Lessons | 10h |

**Deliverable:** Full-Build (11 Pages demonstrierbar)

---

## 📝 Per-Page-Checkliste (Template für PHASE 4)

Für jede Page in PHASE 4:

### UI/UX
- [ ] Mobile-optimiert (360px Breite)
- [ ] Tablet-optimiert (768px Breite)
- [ ] Desktop-optimiert (1440px Breite)
- [ ] Empty-States vorhanden
- [ ] Error-States vorhanden
- [ ] Loading-States vorhanden (Skeleton/Spinner)
- [ ] Transitions smooth (180ms ease-out)

### Functionality
- [ ] Daten laden (API oder Fallback)
- [ ] Daten anzeigen (Table/Grid/List)
- [ ] Filter/Sort funktionieren
- [ ] Navigation funktioniert (Back, Links)
- [ ] Actions funktionieren (Create, Edit, Delete)
- [ ] Keyboard-Navigation (Tab, Enter, Escape)

### Data
- [ ] API-Endpoint dokumentiert (oder Fallback)
- [ ] Mock-Data vorhanden (für Demo)
- [ ] LocalStorage/IndexedDB (für Offline)
- [ ] Error-Handling (try/catch, Fallback)
- [ ] Loading-States korrekt

### A11y
- [ ] ARIA-Labels vorhanden
- [ ] Focus-Visible korrekt
- [ ] Contrast WCAG AA (4.5:1)
- [ ] Screen-Reader-Test (VoiceOver/NVDA)

### Testing
- [ ] Manual-Test (Chrome, Safari, Firefox)
- [ ] Mobile-Test (iOS Safari, Android Chrome)
- [ ] Offline-Test (Service-Worker)
- [ ] Navigation-Test (alle Links klickbar)

---

## 🎨 Design-Konsistenz (Cross-Page)

### Colors
- **Primary:** Emerald-500 (#0fb34c) → Buttons, Links, Active-States
- **Surface:** Zinc-900 (#18181b) → Cards, Panels
- **Border:** Zinc-800 (#27272a) → Dividers, Outlines
- **Text-Primary:** Zinc-100 (#f4f4f5) → Headings, Body
- **Text-Secondary:** Zinc-400 (#a1a1aa) → Labels, Meta

### Typography
- **Headings:** System-UI, Bold, Tight-Tracking
- **Body:** System-UI, Regular, 1.45 Line-Height
- **Mono:** JetBrains-Mono (Contract-Addresses, Prices, Code)

### Spacing
- **Cards:** p-6 (1.5rem padding)
- **Grid-Gap:** gap-3 (Mobile), gap-6 (Desktop)
- **Section-Margin:** mt-4 (Mobile), mt-8 (Desktop)

### Animations
- **Duration:** 180ms (Default), 220ms (Slow)
- **Easing:** cubic-bezier(0, 0, 0.2, 1) (ease-out)
- **Hover:** scale-105, brightness-110
- **Active:** scale-98

---

## 🚨 Bekannte Risiken & Mitigation

### 1. API-Endpoints fehlen (Backend nicht implementiert)
**Risiko:** Pages können keine echten Daten laden.

**Mitigation:**
- ✅ Fallback-Daten hardcoded in Components
- ✅ API-Calls mit `try/catch` → bei Fehler Fallback
- ✅ Teaser-Banner: "Connect API-Keys to unlock real-time data"
- ✅ LocalStorage-First für Journal/Notifications

### 2. AI-Features nicht funktional (Keys fehlen)
**Risiko:** Analyze-AI-Bullets, Journal-AI-Kompression funktionieren nicht.

**Mitigation:**
- ✅ AI-Buttons zeigen "Configure API-Keys in Settings"
- ✅ Mock-AI-Response für Demo (hardcoded Bullets)
- ✅ Settings-Page: Key-Input vorhanden (wird lokal gespeichert)

### 3. Solana-Wallet-Connect fehlt (Access-Page)
**Risiko:** OG-System nicht funktional.

**Mitigation:**
- ✅ Wallet-Connect-Button zeigt "Feature coming soon"
- ✅ Lock-Calculator funktioniert mit Demo-MCAP
- ✅ Leaderboard zeigt Mock-Data (Top 10 OG-Locks)

### 4. Push-Notifications nicht funktional (VAPID-Keys fehlen)
**Risiko:** Alert-System nur lokal.

**Mitigation:**
- ✅ Local-Rules funktionieren (Client-Side-Eval)
- ✅ Push-Subscribe-Button zeigt "Server-Push coming soon"
- ✅ Triggers-Log funktioniert (LocalStorage)

---

## ✅ Launch-Gate-Kriterien (MVP)

**Mindestens 3 Pages vollständig funktional:**
- ✅ LandingPage (Marketing)
- ✅ BoardPage (Dashboard)
- ✅ ChartPage oder AnalyzePage (Kern-Feature)

**Plus:**
- ✅ SettingsPage (essentiell)
- ✅ Navigation funktioniert (Sidebar/BottomNav)
- ✅ PWA installierbar (PHASE 2 done)
- ✅ Offline-Fallback funktioniert
- ✅ Mobile-optimiert (360px Breite)

**Optional für MVP:**
- ⚠️ Journal, Notifications, Access (Alpha-Features)
- ⚠️ Replay, Signals, Lessons (Showcase-Features)

---

**Dokumentiert von:** Claude 4.5 (Sonnet) Cursor-Agent  
**Sprint-Strategie:** 3 Sprints à 7 Tage → MVP nach 21 Tagen  
**Nächster Schritt:** PHASE 4 → Per-Tab Iteration (Starting mit Settings)
