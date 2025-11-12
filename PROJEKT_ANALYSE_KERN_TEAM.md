# Sparkfined PWA - Detaillierte Projekt-Analyse für das Kern-Team

**Datum:** 2025-11-12  
**Status:** Production-Ready (mit Einschränkungen)  
**Ziel:** Soft Launch Vorbereitung

---

## 🎯 Was ist Sparkfined?

Sparkfined ist eine **Progressive Web App (PWA)** für Crypto-Trading-Analyse mit KI-Unterstützung. Die App funktioniert vollständig im Browser, ist offline-fähig und kann wie eine native App installiert werden.

**Kernversprechen:** Professionelles Trading-Research-Tool mit KI-Assistenz, das ohne App-Store auskommt und auch ohne Internet funktioniert.

---

## 🔍 Besondere Eigenheiten des Projekts

### 1. **Offline-First Architektur**

Die App speichert alles lokal im Browser (IndexedDB) und synchronisiert optional mit dem Server. Das bedeutet:
- Nutzer verlieren keine Daten, auch wenn die Internetverbindung abbricht
- Charts, Journal-Einträge und Analysen sind sofort verfügbar
- Service Worker cached alle wichtigen Dateien für vollständige Offline-Nutzung
- **Besonderheit:** Die App läuft auch komplett ohne Backend-Zugriff (mit Mock-Daten)

### 2. **Progressive Web App (PWA) statt Native App**

Kein App Store nötig - die App kann direkt aus dem Browser installiert werden:
- Funktioniert auf Desktop, Tablet und Smartphone
- Installierbar über Browser-Prompt (iOS Safari, Android Chrome, Desktop)
- Push-Benachrichtigungen auch ohne native App
- Updates laufen automatisch - kein manueller Download
- **Besonderheit:** Vollständige App-Erfahrung ohne Store-Abhängigkeit

### 3. **Multi-Provider-Datenarchitektur**

Die App nutzt mehrere Datenanbieter parallel mit automatischem Fallback:
- **Primär:** DexPaprika (OHLC-Daten, Token-Info)
- **Sekundär:** Moralis (On-Chain-Daten, Wallet-Info)
- **Fallbacks:** Dexscreener, Pump.fun, lokale Caches
- **Besonderheit:** Wenn ein Provider ausfällt, wechselt das System automatisch zum nächsten

### 4. **KI-Integration mit Kostensteuerung**

Zwei KI-Provider arbeiten zusammen:
- **OpenAI (GPT-4o-mini):** Marktanalyse, Trading-Bullets (4-7 Stichpunkte)
- **Grok (xAI):** Social-Sentiment-Analyse, Narrative-Erkennung
- **Besonderheit:** Eingebaute Kostenkontrolle (max. $0.25 pro Request, Cache für 1 Stunde)
- KI-Features sind optional und können per Umgebungsvariable aktiviert/deaktiviert werden

### 5. **Solana-basiertes Access Gating (in Vorbereitung)**

Zugriffskontrolle über NFT-Holdings oder Token-Lock:
- OG-NFT-Holder bekommen Vollzugriff
- Token-Lock-Tiers schalten Features frei
- Wallet-Anbindung über Solana Web3.js
- **Aktueller Stand:** Mock-Implementation vorhanden, On-Chain-Integration steht noch aus
- **Für Soft Launch:** Access Gating wird deaktiviert (offener Zugang)

### 6. **Canvas-basiertes Charting**

Eigene Chart-Engine statt externe Bibliothek:
- 60 FPS Canvas-Rendering für flüssige Performance
- 5+ Indikatoren (SMA, EMA, RSI, Bollinger, Volume)
- Replay-Modus für Backtesting
- Zeichentools für Markierungen
- **Besonderheit:** Läuft komplett clientseitig, keine externe Chart-Library-Abhängigkeit

### 7. **Event-Sourcing für Signals**

Signal-Orchestrator mit Learning-Layer:
- Jedes Trading-Signal wird als Event-Kette gespeichert
- Action Graph: Signal → Trade Plan → Outcome → Lesson
- Lessons werden aus vergangenen Trades extrahiert
- **Aktueller Stand:** Architektur vorhanden, UI-Integration teilweise implementiert

### 8. **Dual-Environment-Struktur**

Die App kann in zwei Modi laufen:
- **Development:** Mit Mocks (keine API-Keys nötig)
- **Production:** Mit echten Provider-Anbindungen
- **Besonderheit:** `DEV_USE_MOCKS=true` erlaubt lokales Arbeiten ohne Kosten

---

## ✅ Implementierte Features (IST-Stand)

### **A. Core Trading Features**

#### 1. **Board (Command Center)**
- **Was:** Dashboard mit KPI-Übersicht und Activity-Feed
- **Komponenten:**
  - Overview: 6-8 KPI-Tiles (24h Change, Volume, Risk Score, Sentiment)
  - Focus: "Now Stream" mit letzten Aktivitäten
  - Quick Actions: Shortcuts zu Chart, Journal, Analyze
  - Feed: Chronologischer Event-Stream
- **Besonderheiten:**
  - Onboarding-System mit Welcome-Modal und interaktiver Tour (Driver.js)
  - Persona-basierte Einführung (Beginner, Intermediate, Advanced)
  - Progressive Hints nach Tour-Abschluss
  - Responsive Grid (1-col mobile → 3-col desktop)

#### 2. **Analyze (Token-Analyse)**
- **Was:** Technische Analyse für einzelne Tokens
- **Features:**
  - OHLC-Daten laden (15m, 1h, 4h, 1d)
  - KPI-Berechnung (25+ Metriken)
  - Signal-Matrix (Heatmap mit Momentum, Volatilität, Volume)
  - AI-Bullets (4-7 Stichpunkte via GPT)
  - One-Click Trade-Idea-Paket (erstellt Rule + Journal + Watchlist auf einmal)
- **Datenfluss:**
  - Frontend → `/api/data/ohlc` → DexPaprika/Moralis
  - AI-Analyse → `/api/ai/assist` → OpenAI
  - Trade-Idea → `/api/rules` + `/api/journal` + `/api/ideas`

#### 3. **Chart (Interactive Charting)**
- **Was:** Vollwertiger Trading-Chart mit Indikatoren
- **Features:**
  - Canvas-basiertes Rendering (60 FPS)
  - Multi-Timeframe (1m bis 1w)
  - 5 Indikatoren: SMA, EMA, RSI, Bollinger Bands, Volume
  - Zeichentools: Trendlines, Horizontal Lines, Fibonacci
  - Screenshot-Funktion für Journal
  - Replay-Modus (Backtest auf historischen Daten)
- **Performance:**
  - Lazy-Loading von Indikator-Bibliotheken
  - Web Worker für schwere Berechnungen (geplant)
  - Precaching der letzten 100 Charts

#### 4. **Journal (Trading-Tagebuch)**
- **Was:** Notizen-System mit AI-Komprimierung
- **Features:**
  - Rich-Text-Editor mit Markdown-Support
  - Trade-Lifecycle: Idea → Entered → Running → Winner/Loser
  - Pricing-Felder: Entry, Exit, Stop, Target, Position Size
  - Automatische PnL-Berechnung (%, $, R:R-Ratio)
  - Screenshot-Anhang (via DropZone oder Chart-Export)
  - Tag-System (#momentum, #breakout, etc.)
  - AI-Condense: Komprimiert lange Notizen auf 4-6 Bullets
  - Server-Sync mit lokaler Persistenz (Offline-First)
- **Datenfluss:**
  - Lokaler Store: IndexedDB (Dexie)
  - Server: `/api/journal` (POST für create/update, GET für sync)
  - AI: `/api/ai/assist` Template "v1/journal_condense"

#### 5. **Signals (Trading-Signale)**
- **Was:** Dashboard für erkannte Trading-Muster
- **Features:**
  - Pattern-Filter (Momentum, Breakout, Reversal, Range-Bounce)
  - Direction-Filter (Long/Short)
  - Confidence-Threshold-Slider (60-95%)
  - Signal-Cards mit Confidence-Badge und R:R-Ratio
  - Signal-Review-Modal mit Trade-Plan-Details
- **Architektur:**
  - Signal Detection: `detectSignal()` analysiert Market-Snapshot
  - Trade Planning: `generateTradePlan()` berechnet Entry/Stop/Targets
  - Action Graph: Event-Sourcing-Knoten (in Entwicklung)

#### 6. **Replay (Backtesting)**
- **Was:** Zeitlupen-Modus für Charts
- **Features:**
  - Session Timeline Viewer
  - Schritt-für-Schritt-Durchlauf historischer Daten
  - AI-Commentary-Overlay (optional)
  - Export als Video/GIF (geplant)
- **Use Cases:**
  - Strategie-Backtesting ohne Hindsight-Bias
  - Trade-Review mit Frame-by-Frame-Analyse

#### 7. **Access (Zugriffskontrolle)**
- **Was:** NFT/Token-basiertes Gating-System
- **Features (Mock-Stand):**
  - Wallet-Status-Anzeige
  - Hold-Check (OG NFT, Staking Balance)
  - Lock-Calculator (Token-Lock-Tiers)
  - Leaderboard (Community-Rankings)
- **Technischer Stand:**
  - Mock-Wallet-Provider implementiert
  - API-Endpunkt `/api/access/status` vorhanden
  - Solana-Integration vorbereitet, aber nicht aktiviert
- **Für Soft Launch:** Access-Gate wird deaktiviert (alle Features offen)

#### 8. **Notifications (Alert-Center)**
- **Was:** Push-Benachrichtigungen und Alert-Verwaltung
- **Features:**
  - Rule-Editor (Price Cross, Volume Spike, RSI Levels)
  - Server-seitige Evaluation (Cron-Job `/api/cron/cleanup-temp-entries`)
  - Push-Benachrichtigungen (Web Push API + VAPID)
  - Alert-Historie mit Timestamps
  - Batch-Actions (Mark All Read, Clear)
- **Architektur:**
  - Client: Push-Subscription über `navigator.serviceWorker`
  - Server: `/api/push/subscribe` registriert Subscriptions
  - Worker: `/api/alerts/worker` evaluiert Rules alle 5 Minuten

#### 9. **Settings (Konfiguration)**
- **Was:** App-Einstellungen und Präferenzen
- **Features:**
  - Theme: Dark/Light (aktuell nur Dark)
  - AI-Provider-Auswahl (OpenAI, Anthropic, xAI)
  - Daten-Provider-Reihenfolge (Primary, Secondary, Fallbacks)
  - Telemetrie Opt-In/Out
  - Cache-Reset (IndexedDB löschen)
  - PWA-Update-Check
- **Persistenz:** localStorage für Präferenzen

#### 10. **Lessons (Learning-Archiv)**
- **Was:** Wissensdatenbank aus vergangenen Trades
- **Features:**
  - Lesson-Extraktion aus Trade-Outcomes
  - Setup-Rankings (welche Patterns funktionieren?)
  - AI-generierte Playbooks
  - Lesson-Cards mit Tags und Confidence
- **Architektur:**
  - Lessons werden aus Action-Graph extrahiert
  - IndexedDB-Tabelle: `lessons` mit Referenzen zu Signals/Plans

### **B. Infrastructure & PWA**

#### 11. **PWA-Installation**
- **Features:**
  - Web App Manifest (`/manifest.webmanifest`)
  - 14 Icons (32px bis 1024px)
  - Service Worker mit Precaching (35 Assets, ~2.3 MB)
  - Custom Offline-Seite (`/offline.html`)
  - Install-Prompt (iOS, Android, Desktop)
  - Update-Banner bei neuer Version

#### 12. **Offline-Sync**
- **Strategie:**
  - Cache-First für statische Assets (JS, CSS, Fonts)
  - Network-First für API-Calls mit Cache-Fallback
  - Background-Sync für pendende Writes (geplant)
- **Caching-Layer:**
  - IndexedDB: `kpiCache`, `feedCache`, Charts, Journal
  - Cache Storage: Service Worker Precache
  - localStorage: Settings, Onboarding-Status

#### 13. **Telemetrie & Diagnostics**
- **Features:**
  - Client-seitige Metriken (Page Load, API Latency)
  - Crash-Reporting (Opt-In)
  - Token-Usage-Tracking für AI
  - Performance-Metriken (LCP, FID, CLS)
- **Endpoints:**
  - `/api/telemetry` (Batch-Upload via `sendBeacon`)
  - Telemetry-JSONL: `telemetry/ai/events.jsonl`

### **C. AI-Features**

#### 14. **AI-Bullets (Marktanalyse)**
- **Template:** `v1/analyze_bullets`
- **Input:** Token-Adresse, Timeframe, KPI-Objekt
- **Output:** 4-7 kurze Stichpunkte (deutsch)
- **Provider:** OpenAI GPT-4o-mini
- **Kosten:** ~$0.02-0.05 pro Anfrage

#### 15. **AI-Journal-Condense**
- **Template:** `v1/journal_condense`
- **Input:** Lange Journal-Notiz
- **Output:** 4-6 komprimierte Bullets (Kontext, Beobachtung, Plan, Risiko)
- **Provider:** OpenAI GPT-4o-mini

#### 16. **Social-Sentiment-Analyse (Grok)**
- **Template:** `v1/social_sentiment`
- **Input:** Social-Media-Posts (Twitter, Telegram)
- **Output:** Sentiment-Score, Narrative-Zusammenfassung, Bot-Ratio
- **Provider:** xAI Grok
- **Sampling:** 10% der Anfragen (opt-in via `includeSocial=true`)

---

## 📋 Separate Liste: Alle Features im Überblick

### **Live & Production-Ready**

1. **Board Command Center** - Dashboard mit KPIs, Feed, Quick Actions, Onboarding
2. **Token Analyze** - Technische Analyse mit KPIs, Signal-Matrix, AI-Bullets
3. **Interactive Chart** - Canvas-Chart mit 5 Indikatoren, Replay-Modus, Zeichentools
4. **Trading Journal** - Rich-Text-Editor, Trade-Lifecycle, AI-Condense, Server-Sync
5. **Signal Dashboard** - Pattern-Filter, Confidence-Threshold, Signal-Review
6. **Replay Lab** - Backtest-Modus mit Session-Timeline
7. **Notifications Center** - Alert-Rules, Push-Benachrichtigungen, Historie
8. **Settings** - Theme, AI-Provider, Daten-Provider, Cache-Management
9. **Lessons Archive** - Trading-Learnings, Setup-Rankings, Playbooks
10. **PWA-Installation** - Offline-fähig, Installierbar, Update-Management
11. **Offline-Sync** - IndexedDB-Persistenz, Cache-Fallbacks
12. **Telemetrie** - Performance-Tracking, Token-Usage, Crash-Reports
13. **AI-Bullets** - Marktanalyse via OpenAI GPT-4o-mini
14. **AI-Journal-Condense** - Notizen-Komprimierung via OpenAI
15. **Social-Sentiment** - Grok-basierte Narrative-Analyse (Sampling)
16. **Multi-Provider-Fallback** - DexPaprika → Moralis → Dexscreener
17. **Watchlist** - Token-Favoriten mit localStorage-Persistenz
18. **Tag-System** - Hashtag-Filter für Journal und Signals
19. **Screenshot-Tool** - Chart-Export als PNG für Journal-Anhänge
20. **Keyboard-Shortcuts** - `?` für Help-Modal, weitere Shortcuts geplant

### **Mock-Implementation / In Entwicklung**

21. **Access Gating** - Solana-Wallet-Check für NFT/Token-Holdings (Mock vorhanden)
22. **OG-NFT-Hold-Check** - Berechtigung via NFT-Besitz (Mock)
23. **Token-Lock-Tiers** - Feature-Freischaltung via Staking (Mock)
24. **Leaderboard** - Community-Rankings (Mock-Daten)
25. **Signal Orchestrator** - Event-Sourcing für Trade-Outcomes (Architektur steht, UI teilweise)
26. **Action Graph** - Kausalkette: Signal → Plan → Outcome (Backend-Layer vorhanden)
27. **Lesson Extraction** - Automatische Insights aus Trade-Historie (Logik vorhanden, UI-Integration offen)

---

## 🔮 Geplante Features & Konzepte (für späteren Zeitpunkt)

### **Q1 2025 - Phase R1 (Public Beta)**

1. **Moralis Cortex Integration**
   - Token Risk Score (KPI-Tile + Detailmodal)
   - Whale Activity Alerts
   - Pattern Recognition (AI-basierte Chart-Muster-Erkennung)
   - **Aufwand:** 4-8h pro Feature

2. **Signal Orchestrator - Vollständige UI-Integration**
   - Signal-Review-Cards mit Trade-Plan-Details
   - Action-Graph-Visualisierung (Node-Diagramm)
   - Lesson-Feed im Board
   - **Aufwand:** 2-3 Tage

3. **Chart-Verbesserungen**
   - 20+ Indikatoren (Ichimoku, Stochastic, ATR, MACD, etc.)
   - Multi-Chart-Layout (2x2 Grid)
   - Indicator-Library-Lazy-Loading (Bundle-Size-Optimierung)
   - **Aufwand:** 5 Tage

4. **AI-Features - Erweitert**
   - Voice Commands ("Zeige mir BTC Chart auf 4H")
   - Predictive Alerts (ML-basierte Preis-Forecasts)
   - Automated Trade Journaling (OCR → strukturierte Daten)
   - **Aufwand:** 3-6 Tage pro Feature

5. **Push-Notification-Erweiterungen**
   - Action Buttons in Notifications ("Journal öffnen", "Alert snooze")
   - Deep Links zu spezifischen Trades
   - Analytics für Notification-Interactions
   - **Aufwand:** 2 Tage

6. **Performance-Optimierungen**
   - Web Vitals Tracking (LCP <1.5s, FID <50ms)
   - Font Subsetting (Latin-only, -50% Load)
   - Image Optimization (WebP für Screenshots)
   - Lighthouse CI (Score >90 Pflicht)
   - **Aufwand:** 3 Tage

### **Q2 2025 - Phase R2 (Production Alpha)**

7. **Solana-On-Chain-Integration**
   - OG-NFT-Check via Solana RPC
   - Token-Lock Smart Contract Anbindung
   - Wallet-Adapter (Phantom, Solflare, Backpack)
   - **Aufwand:** 5 Tage (inkl. Smart Contract Tests)

8. **Subscription & Monetarisierung**
   - Stripe-Integration für Non-Holder
   - Token-Lock-Tiers mit Feature-Gates
   - Revenue-Dashboard (Tracking MRR)
   - **Aufwand:** 3 Tage

9. **Journal-Cloud-Sync**
   - Optional Backend-Sync für Journal-Notizen
   - Conflict-Resolution bei Offline-Änderungen
   - Cross-Device-Sync (Desktop ↔ Mobile)
   - **Aufwand:** 5 Tage

10. **Backtesting-Engine**
    - Rule-Performance-Simulation auf historischen Daten
    - Monte-Carlo-Analyse
    - Walk-Forward-Optimization
    - **Aufwand:** 5-7 Tage

11. **Webhook-Integrationen**
    - TradingView Alerts → Sparkfined Notifications
    - Discord Bot für Alert-Posting
    - Telegram Bot (Community-Benachrichtigungen)
    - **Aufwand:** 3 Tage

12. **Analytics & Monitoring**
    - User Analytics (Umami/Plausible)
    - Funnel-Analyse (Landing → Install → Trade)
    - Cohort-Retention (D1, D7, D30)
    - API-Cost-Tracking (OpenAI, Moralis, DexPaprika)
    - **Aufwand:** 2-3 Tage

### **Q3-Q4 2025 - Future Concepts**

13. **Mobile Native Apps**
    - React Native Port für iOS/Android
    - Native Push Notifications (APNs, FCM)
    - Biometric Auth (Face ID, Fingerprint)
    - Home-Screen-Widgets
    - **Aufwand:** 2-3 Monate

14. **White-Label für Trading Firms**
    - Multi-Workspace-Support (Team-Collaboration)
    - Custom Branding
    - Admin-Dashboard
    - **Aufwand:** 1 Monat

15. **Custom Indicator Scripting**
    - Pine-Script-ähnliche DSL
    - Custom-Indicator-Editor
    - Community-Indicator-Library
    - **Aufwand:** 2 Monate

16. **Advanced Security**
    - Encrypted Cache Storage (Web Crypto API)
    - 2FA für High-Value-Actions
    - Audit-Log für alle Trades
    - **Aufwand:** 1 Woche

---

## 🛠️ Technische Architektur - Kurzfassung

### **Tech Stack**

- **Frontend:** React 18.3, TypeScript 5.6, Tailwind CSS 4.1, Vite 5.4
- **State:** Zustand (global), React Context (scoped)
- **Routing:** React Router 6.26
- **Persistenz:** Dexie (IndexedDB), localStorage
- **UI-Komponenten:** Eigene Komponenten (kein UI-Framework), Lucide Icons
- **Charts:** Canvas API (eigene Engine)
- **PWA:** Vite-Plugin-PWA, Workbox 7.1
- **Testing:** Vitest 1.6, Playwright 1.48, Testing Library
- **AI:** OpenAI SDK 4.0, xAI Grok (via REST)
- **Blockchain:** Solana Web3.js 1.95, SPL-Token 0.4
- **Build:** Vite mit Rollup, Bundle-Size-Check, TypeScript Project References

### **Deployment**

- **Platform:** Vercel (Serverless Functions)
- **API-Layer:** Edge Functions (`/api/*`)
- **Crons:** Vercel Cron Jobs (z.B. Alert-Evaluation alle 5min)
- **CDN:** Vercel Edge Network
- **Environment:** `.env.local` für lokale Entwicklung, Vercel Secrets für Production

### **Datenfluss-Architektur (5 Layer)**

1. **External Services** - Moralis, DexPaprika, Solana RPC, OpenAI/xAI
2. **Serverless Backend** - Vercel Edge Functions (`/api/*`)
3. **Persistence Layer** - IndexedDB (Dexie), Cache Storage, localStorage
4. **State & Hooks** - Zustand, Custom Hooks (`useJournal`, `useAssist`, `useSignals`)
5. **UI Components** - React Pages, Sections, Components

### **Besonderheiten der Architektur**

- **Offline-First:** Alle Daten werden zuerst lokal gespeichert, dann optional synchronisiert
- **Multi-Provider:** Automatischer Fallback zwischen Datenanbietern
- **Edge Functions:** API-Routes laufen als Serverless Functions (keine Backend-Server)
- **Event-Sourcing:** Signal-Orchestrator nutzt Action-Graph für Trade-History
- **Lazy-Loading:** AI-Features werden nur bei Bedarf geladen
- **Progressive Enhancement:** App funktioniert auch ohne JavaScript (Offline-Seite)

---

## ⚠️ Bekannte Einschränkungen & Risiken

### **Kritische Issues (müssen vor Launch behoben werden)**

1. **TypeScript Strict Mode deaktiviert** (RISK T-001)
   - `strictNullChecks: false` in `tsconfig.build.json`
   - 22 Fehler werden ignoriert
   - **Risiko:** Null/Undefined-Crashes in Production
   - **Lösung:** Strict Mode aktivieren, alle Fehler fixen (~4h)

2. **E2E-Tests nicht in CI** (RISK T-002)
   - Playwright-Tests laufen nur lokal
   - Keine Regression-Detection vor Deployment
   - **Risiko:** Breaking Changes unbemerkt live
   - **Lösung:** `pnpm test:e2e` zu Vercel Build hinzufügen (~30min)

3. **Fehlende Runtime-Environment-Validierung** (RISK O-007)
   - App startet auch ohne API-Keys
   - Nutzer sehen kryptische Fehler
   - **Risiko:** Schlechte User-Experience bei fehlender Konfiguration
   - **Lösung:** Env-Validator + UI-Banner (~1h)

### **Mittlere Risiken (sollten in Phase R1 behoben werden)**

4. **Keine Fehler-Monitoring** (RISK O-009)
   - Crashes werden nicht erfasst
   - Keine Metriken für Error-Rate
   - **Lösung:** Sentry-Integration (~1 Tag)

5. **Bundle-Size nicht überwacht** (RISK T-003)
   - Aktuell 428 KB precached (OK), aber keine Limits
   - **Lösung:** Bundle-Size-CI-Check (~1 Tag)

6. **Performance nicht gemessen** (RISK T-004)
   - LCP, FID, CLS werden nicht getrackt
   - **Lösung:** Lighthouse CI + Web Vitals (~2 Tage)

### **Niedrige Risiken (Backlog)**

7. **Tesseract.js blockiert Main Thread** (RISK T-006)
   - OCR-Library (2MB) wird synchron geladen
   - **Lösung:** Web Worker für OCR (~3 Tage)

8. **iOS PWA-Installation nicht getestet** (RISK O-010)
   - Safari hat spezielle Quirks
   - **Lösung:** iOS 15-17 Testing (~2 Tage)

9. **Keine IndexedDB-Backups** (RISK S-017)
   - Datenverlust bei Browser-Reset möglich
   - **Lösung:** Export/Import-Feature (~2 Tage)

### **Akzeptierte Risiken**

10. **API-Keys im Frontend** (RISK S-014)
    - Moralis/DexPaprika-Keys sind eingeschränkt (IP-Whitelist)
    - Kosten sind überschaubar bei Missbrauch
    - **Mitigation:** Backend-Proxy für sensible Calls vorhanden

---

## 📊 Performance-Metriken (Aktueller Stand)

- **Bundle Size:** 428 KB (precached), ~1.6 MB total
- **Lighthouse PWA Score:** 90+ (Ziel erreicht)
- **Build Time:** ~1.6 Sekunden
- **Test Coverage:** 20% (Ziel: 50% für R1, 80% für R2)
- **TypeScript Errors:** 22 (suppressed via `strictNullChecks: false`)
- **Precached Assets:** 35 Dateien (~2.3 MB)
- **IndexedDB Stores:** 8 Tabellen (Board, Journal, Signals, Lessons, etc.)

---

## 🎯 Dokumentations-Struktur

Das Projekt ist sehr gut dokumentiert mit 36 Markdown-Dateien:

### **Aktive Dokumentation**
- `/README.md` - Projekt-Übersicht, Quick Start
- `/IMPROVEMENT_ROADMAP.md` - Feature-Roadmap (R0 → R1 → R2)
- `/RISK_REGISTER.md` - Risiko-Matrix mit Mitigations
- `/docs/README.md` - Navigations-Guide
- `/docs/process/` - Produkt-Strategie, Onboarding-Blueprint
- `/docs/concepts/` - Journal-System, Signal-Orchestrator, AI-Roadmap
- `/docs/guides/` - Access-Tabs-Verbesserungen
- `/docs/setup/` - Environment-Vars, Build-Scripts, Deployment
- `/docs/pwa-audit/` - Feature-Katalog, Flows, Security, Tests
- `/wireframes/` - 12 Mobile + Desktop Wireframes, 12 User Flows

### **Archivierte Dokumentation**
- `/docs/archive/` - 27 historische Dokumente (Phasen-Berichte, Audits)

---

## 🚀 Empfohlene nächste Schritte für Soft Launch

**Siehe separate Todo-Liste: `SOFT_PRODUCTION_TODO.md`**

---

**Erstellt:** 2025-11-12  
**Analyst:** KI Agent  
**Dokumentations-Basis:** 36 MD-Dateien, 400+ Source-Dateien analysiert
