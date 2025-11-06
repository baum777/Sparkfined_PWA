# 🗺️ PHASE 3 – Tabs/Pages-Map

**Datum:** 2025-11-05  
**Branch:** cursor/scan-repository-and-understand-setup-0875  
**Status:** 13 Pages identifiziert (11 in Routes, 2 ohne Route)

---

## 📊 Tabs-Übersicht (Table)

| # | Route | Page Component | Zweck/Beschreibung | Status | Datenquellen | Abhängigkeiten | Priorität |
|---|-------|----------------|-------------------|--------|--------------|----------------|-----------|
| 1 | `/landing` | LandingPage | Marketing/Onboarding (standalone, kein Layout) | ✅ Done | Static Content | - | 🟢 MVP |
| 2 | `/` | BoardPage | Command Center (KPIs, Feed, QuickActions, "Now Stream") | ⚠️ 80% | `/api/board/kpis`, `/api/board/feed` | Overview, Focus, QuickActions, Feed Components | 🔴 MVP |
| 3 | `/analyze` | AnalyzePage | Token-Analyse (25+ KPIs, Heatmap, Signal-Matrix, AI-Bullets) | ⚠️ 70% | `/api/data/ohlc`, AI-Proxy (`/api/ai/assist`) | fetchOhlc, kpis(), signalMatrix(), Heatmap, Playbook | 🔴 MVP |
| 4 | `/chart` | ChartPage | Advanced Charting (Canvas-Candlesticks, 60fps, Indicators, Drawing-Tools, Replay, Backtest) | ⚠️ 85% | `/api/data/ohlc` | CandlesCanvas, IndicatorBar, DrawToolbar, ReplayBar, BacktestPanel, Timeline, MiniMap | 🔴 MVP |
| 5 | `/journal` | JournalPage | Trading-Journal (Rich-Text-Editor, AI-Kompression, Server-Sync, Screenshot-OCR) | ⚠️ 75% | `/api/journal`, AI-Proxy, IndexedDB | useJournal Hook, JournalEditor, JournalList, AI-Assist | 🟡 Alpha |
| 6 | `/replay` | ReplayPage | Session-Replay (Mouse-Tracking aus IndexedDB, Playback-Controls) | ⚠️ 60% | IndexedDB (`getAllEvents`) | ReplayModal, initDB, db.ts | 🟢 Alpha |
| 7 | `/access` | AccessPage | OG-System (Solana-Wallet-Connect, MCAP-Lock, Hold-Check, Leaderboard, NFT-Mint) | ⚠️ 65% | `/api/access/status`, `/api/access/lock`, `/api/access/mint-nft`, Solana RPC | AccessStatusCard, LockCalculator, HoldCheck, LeaderboardList, @solana/web3.js | 🟡 Alpha |
| 8 | `/settings` | SettingsPage | App-Settings (Theme, Snap-Default, Replay-Speed, HUD-Toggle, Telemetry, AI-Keys, Data-Export/Import) | ⚠️ 90% | LocalStorage, IndexedDB | useSettings, useTelemetry, useAISettings, datastore.ts | 🟢 MVP |
| 9 | `/notifications` | NotificationsPage | Alert-Rules-Editor (Visual-Rule-Builder, Server-Rule-Upload, Push-Notification-Subscribe, Triggers-Log) | ⚠️ 70% | `/api/rules`, `/api/rules/eval`, `/api/push/subscribe`, `/api/ideas` | useAlertRules, RuleEditor, RuleWizard, Playbook, subscribePush() | 🟡 Alpha |
| 10 | `/signals` | SignalsPage | Trading-Signals (Pattern-Filter, Confidence-Threshold, Quick-Stats, Signal-Review) | ⚠️ 60% | useSignals Hook (Mock/Fake-Data) | SignalCard, SignalReviewCard, StateView | 🟢 Teaser |
| 11 | `/lessons` | LessonsPage | Trading-Lessons (Pattern-Based-Filtering, Win-Rate-Stats, DOs/DONTs) | ⚠️ 55% | useLessons Hook (Mock/Fake-Data) | LessonCard, StateView | 🟢 Teaser |
| - | - | HomePage | Beta-Shell (Logo, Dark-Mode-Toggle, Feature-List) | ✅ Done | Static | Logo Component | ⚠️ Unused (nicht in Routes) |
| - | - | FontTestPage | Font-Rendering-Test (JetBrains Mono, System-Font, Contract-Addresses) | ✅ Done | Static | - | ⚠️ Unused (nicht in Routes) |

---

## 📝 Detaillierte Analysen

### 1. LandingPage (`/landing`)
**Zweck:** Marketing-Seite für Neukunden, Produkt-Features, Pricing, Testimonials.

**Features:**
- Hero-Section mit Grid-Background
- Features-Grid (6 Features mit Icons)
- Pricing-Section
- Testimonials (Auto-Rotation)
- CTA: "Launch App" → navigiert zu `/board`

**Datenquellen:** Static Content (kein API)

**Status:** ✅ **Done** (484 Zeilen, vollständig implementiert)

**Abhängigkeiten:** Keine (standalone, nutzt kein Layout)

**Priorität:** 🟢 **MVP** (Landing-Page für Public-Test/Launch)

---

### 2. BoardPage (`/`)
**Zweck:** Command Center / Dashboard mit Echtzeit-Übersicht (KPIs, Feed, QuickActions, "Now Stream").

**Features:**
- Overview-Zone: 11 KPI-Tiles (Watchlist-Count, Open-Positions, Heute-PnL, etc.)
- Focus-Zone: "Now Stream" (Recent Activities)
- QuickActions: Shortcut-Cards (New-Chart, Analyze-Token, Quick-Journal, Scan-Market)
- Feed-Zone: Activity-Events (Price-Alerts, Journal-Entries, etc.)
- Responsive-Grid: 1col (Mobile) → 2col (Tablet) → 3col (Desktop)

**Datenquellen:**
- `/api/board/kpis` → KPI-Daten
- `/api/board/feed` → Activity-Events
- LocalStorage/IndexedDB → Watchlist, Positions

**Status:** ⚠️ **80% Done**
- ✅ Layout/Grid funktioniert
- ✅ Components vorhanden (Overview, Focus, QuickActions, Feed)
- ⚠️ API-Endpoints `/api/board/kpis` + `/api/board/feed` benötigen Backend-Implementierung
- ⚠️ KPIs aktuell mit Mock/Fallback-Daten

**Abhängigkeiten:**
- `components/board/Overview.tsx` (11 KPI-Tiles)
- `components/board/Focus.tsx` ("Now Stream")
- `components/board/QuickActions.tsx` (4 Shortcut-Cards)
- `components/board/Feed.tsx` (Activity-Feed)

**Priorität:** 🔴 **MVP** (Kern-Dashboard, kritischer Pfad)

---

### 3. AnalyzePage (`/analyze`)
**Zweck:** Token-Analyse mit 25+ KPIs, Heatmap, Signal-Matrix, AI-Bullet-Summary.

**Features:**
- Token-Address-Input + Timeframe-Selector
- OHLC-Chart-Data-Fetcher
- 25+ Technical-KPIs (Volatility, Momentum, Volume-Profiles)
- Heatmap (Pattern-Recognition)
- Signal-Matrix (Bullish/Bearish-Signals)
- AI-Bullet-Generator (3–5 Spiegelstriche via OpenAI/Anthropic)
- One-Click-Idea-Packet (erstellt Idea + Rule + Journal + Watchlist)
- URL-State-Encoding (Shareable-Links)

**Datenquellen:**
- `/api/data/ohlc` → OHLC-Daten (Moralis/Dexpaprika)
- `/api/ai/assist` → AI-Proxy (OpenAI/Anthropic)
- `/api/rules` → Server-Rule-Creation
- `/api/ideas` → Idea-Creation
- `/api/journal` → Journal-Broadcast

**Status:** ⚠️ **70% Done**
- ✅ UI vollständig (Input, KPIs, Heatmap, Buttons)
- ✅ KPI-Berechnung funktioniert (kpis(), signalMatrix())
- ⚠️ `/api/data/ohlc` benötigt Backend-Proxy (Moralis/Dexpaprika)
- ⚠️ AI-Proxy benötigt OpenAI/Anthropic-Key (Server-Side)
- ⚠️ One-Click-Idea-Packet benötigt API-Endpoints

**Abhängigkeiten:**
- `sections/chart/marketOhlc.ts` (fetchOhlc)
- `sections/analyze/analytics.ts` (kpis, signalMatrix)
- `sections/analyze/Heatmap.tsx`
- `sections/ai/useAssist.ts` (AI-Hook)
- `sections/ideas/Playbook.tsx`
- `lib/urlState.ts`, `lib/shortlink.ts`

**Priorität:** 🔴 **MVP** (Kern-Feature, kritischer Pfad)

---

### 4. ChartPage (`/chart`)
**Zweck:** Advanced Charting mit Canvas-Rendering (60fps), Indicators, Drawing-Tools, Replay, Backtest.

**Features:**
- Canvas-Candlestick-Renderer (Custom, kein Library)
- 10+ Technical-Indicators (SMA, EMA, RSI, MACD, Bollinger-Bands, VWAP)
- Drawing-Tools (Trendlines, Fibonacci-Retracements, Support/Resistance)
- Zoom/Pan-Controls
- Mini-Map (Chart-Overview)
- Replay-Mode (Backtest-Simulation)
- Bookmarks (Save-Chart-States)
- Event-Timeline (Mark-Events)
- Backtest-Panel (Rule-Test mit Historical-Data)
- Export (PNG mit Annotations, JSON-State)
- URL-State-Encoding (Shareable-Links)

**Datenquellen:**
- `/api/data/ohlc` → OHLC-Daten
- LocalStorage → Shapes, Bookmarks
- IndexedDB → Replay-Events

**Status:** ⚠️ **85% Done**
- ✅ Canvas-Renderer funktioniert (60fps)
- ✅ Indicators funktionieren (SMA, EMA, VWAP)
- ✅ Drawing-Tools funktionieren (Trendlines, Fibonacci)
- ✅ Zoom/Pan funktioniert
- ✅ Replay-Mode funktioniert
- ⚠️ `/api/data/ohlc` benötigt Backend-Proxy
- ⚠️ Backtest-Engine benötigt `/api/backtest` (optional)
- ⚠️ Export-PNG mit HUD benötigt Canvas-to-Blob-Logic

**Abhängigkeiten:**
- `sections/chart/CandlesCanvas.tsx` (Canvas-Renderer)
- `sections/chart/IndicatorBar.tsx`
- `sections/chart/draw/DrawToolbar.tsx`
- `sections/chart/ZoomPanBar.tsx`
- `sections/chart/MiniMap.tsx`
- `sections/chart/ReplayBar.tsx`
- `sections/chart/BacktestPanel.tsx`
- `sections/chart/Timeline.tsx`
- `sections/chart/marketOhlc.ts` (fetchOhlc)
- `lib/urlState.ts`, `lib/shortlink.ts`, `lib/ruleToken.ts`

**Priorität:** 🔴 **MVP** (Kern-Feature, kritischer Pfad)

---

### 5. JournalPage (`/journal`)
**Zweck:** Trading-Journal mit Rich-Text-Editor, AI-Kompression, Server-Sync.

**Features:**
- Rich-Text-Editor (Title, Body, Tags, Address, TF)
- AI-Kompression (4–6 Spiegelstriche: Kontext, Beobachtung, Hypothese, Plan, Risiko, Nächste-Aktion)
- Server-Sync (`/api/journal`)
- LocalStorage-Fallback (IndexedDB via useJournal-Hook)
- Journal-List (Filterable by Search, Tags)
- Screenshot-OCR (Tesseract.js, optional)
- Export to JSON/Markdown (`/api/journal/export`)

**Datenquellen:**
- `/api/journal` → Server-CRUD
- IndexedDB → Local-Fallback (useJournal-Hook)
- `/api/ai/assist` → AI-Kompression

**Status:** ⚠️ **75% Done**
- ✅ Editor funktioniert (Title, Body, Tags)
- ✅ LocalStorage-Fallback funktioniert (useJournal-Hook)
- ✅ AI-Kompression funktioniert (runAssist)
- ⚠️ `/api/journal` benötigt Backend-Implementierung (CRUD)
- ⚠️ `/api/journal/export` benötigt Export-Logic
- ⚠️ Screenshot-OCR nicht implementiert (Tesseract.js-Integration fehlt)

**Abhängigkeiten:**
- `sections/journal/useJournal.ts` (Local-CRUD-Hook)
- `sections/journal/JournalEditor.tsx`
- `sections/journal/JournalList.tsx`
- `sections/ai/useAssist.ts`
- `lib/journal.ts` (Types)

**Priorität:** 🟡 **Alpha** (Wichtig, aber nicht kritisch für MVP)

---

### 6. ReplayPage (`/replay`)
**Zweck:** Session-Replay mit Mouse-Tracking aus IndexedDB.

**Features:**
- Session-List (gruppiert nach Session-ID)
- Session-Metadata (Event-Count, First-Event, Last-Event, Duration)
- Replay-Modal mit Playback-Controls (Play, Pause, Speed)
- Mouse-Cursor-Replay (Canvas-Overlay)

**Datenquellen:**
- IndexedDB → getAllEvents() (Mouse-Tracking-Events)

**Status:** ⚠️ **60% Done**
- ✅ Session-List funktioniert (gruppiert, sortiert)
- ✅ Replay-Modal vorhanden
- ⚠️ Mouse-Cursor-Replay benötigt Canvas-Logic (ReplayModal.tsx)
- ⚠️ Playback-Controls (Play/Pause/Speed) benötigen Event-Playback-Engine

**Abhängigkeiten:**
- `components/ReplayModal.tsx`
- `lib/db.ts` (getAllEvents, initDB)
- `lib/ReplayService.ts` (Mouse-Playback-Logic)

**Priorität:** 🟢 **Alpha** (Nice-to-have, nicht kritisch)

---

### 7. AccessPage (`/access`)
**Zweck:** OG-System (Solana-Wallet-Connect, MCAP-Lock, Hold-Check, Leaderboard, NFT-Mint).

**Features:**
- 4 Tabs: Status, Lock, Hold, Leaderboard
- Status-Tab: Wallet-Connect, Access-Status (OG / Holder / None)
- Lock-Tab: MCAP-Lock-Calculator (Token-Amount → Lock-Value)
- Hold-Tab: Token-Hold-Verification (Snapshot-Check)
- Leaderboard-Tab: Top 333 OG-Locks (Public-List)
- NFT-Mint: Soulbound-NFT-Minting (on-chain)

**Datenquellen:**
- `/api/access/status` → Access-Status
- `/api/access/lock` → MCAP-Lock-Berechnung
- `/api/access/mint-nft` → NFT-Mint-Endpoint
- Solana-RPC → On-Chain-Data (Token-Balance, NFT-Mint)

**Status:** ⚠️ **65% Done**
- ✅ UI vollständig (4 Tabs, Components)
- ⚠️ `/api/access/*` Endpoints benötigen Backend-Implementierung
- ⚠️ Solana-Wallet-Connect benötigt @solana/wallet-adapter (nicht installiert)
- ⚠️ NFT-Mint benötigt Metaplex-Setup

**Abhängigkeiten:**
- `components/access/AccessStatusCard.tsx`
- `components/access/LockCalculator.tsx`
- `components/access/HoldCheck.tsx`
- `components/access/LeaderboardList.tsx`
- `@solana/web3.js` (Solana-SDK)
- `store/AccessProvider.tsx` (Zustand-Store)

**Priorität:** 🟡 **Alpha** (Wichtig für Tokenomics, nicht kritisch für MVP)

---

### 8. SettingsPage (`/settings`)
**Zweck:** App-Einstellungen (Theme, Snap-Default, Replay-Speed, HUD-Toggle, Telemetry, AI-Keys, Data-Export/Import).

**Features:**
- Theme-Toggle (System, Dark, Light)
- Chart-Settings (Snap-to-OHLC, HUD-anzeigen, Timeline-anzeigen, Mini-Map-anzeigen)
- Replay-Speed-Default
- Telemetry-Toggle
- AI-Settings (OpenAI-Key, Anthropic-Key, Model-Selection)
- Data-Export/Import (Backup-Funktion)
- Clear-Cache/Namespaces

**Datenquellen:**
- LocalStorage → Settings (via useSettings-Hook)
- IndexedDB → Data-Export/Import

**Status:** ⚠️ **90% Done**
- ✅ Settings-UI vollständig
- ✅ Theme-Toggle funktioniert
- ✅ Chart-Settings funktionieren
- ✅ Telemetry-Toggle funktioniert
- ✅ AI-Settings (Key-Input)
- ✅ Data-Export/Import funktioniert
- ⚠️ AI-Key-Eingabe wird nur lokal gespeichert (sollte Server-Side sein)

**Abhängigkeiten:**
- `state/settings.tsx` (useSettings-Hook)
- `state/telemetry.tsx` (useTelemetry-Hook)
- `state/ai.tsx` (useAISettings-Hook)
- `lib/datastore.ts` (Export/Import-Logic)

**Priorität:** 🟢 **MVP** (Settings essentiell, UI fertig)

---

### 9. NotificationsPage (`/notifications`)
**Zweck:** Alert-Rules-Editor (Visual-Rule-Builder, Server-Rule-Upload, Push-Notification-Subscribe).

**Features:**
- Local-Rules-Editor (Client-Side-Rules)
- Server-Rules-Panel (Upload to `/api/rules`)
- Rule-Wizard (Visual-Rule-Builder)
- Push-Notification-Subscribe (VAPID)
- Triggers-Log (Alert-History)
- Eval-Now-Button (Manueller-Rule-Eval)
- Ideas-Export (Case-Studies-Markdown)

**Datenquellen:**
- LocalStorage → Local-Rules (via useAlertRules-Hook)
- `/api/rules` → Server-Rules (CRUD)
- `/api/rules/eval` → Rule-Evaluation
- `/api/rules/eval-cron` → Cron-Eval
- `/api/push/subscribe` → Push-Subscribe
- `/api/ideas` → Ideas-List
- `/api/ideas/export` → Ideas-Export

**Status:** ⚠️ **70% Done**
- ✅ Rules-Editor funktioniert (Local)
- ✅ Rule-Wizard vorhanden
- ⚠️ `/api/rules` benötigt Backend-Implementierung (CRUD)
- ⚠️ `/api/rules/eval` benötigt Eval-Engine
- ⚠️ Push-Notification-Subscribe benötigt VAPID-Keys (Server-Side)
- ⚠️ Ideas-Export benötigt `/api/ideas/export` (Markdown-Generator)

**Abhängigkeiten:**
- `sections/notifications/useAlertRules.ts` (Local-Rules-Hook)
- `sections/notifications/RuleEditor.tsx`
- `sections/notifications/RuleWizard.tsx`
- `lib/push.ts` (subscribePush, unsubscribePush)
- `lib/serverRules.ts` (Types)
- `sections/ideas/Playbook.tsx`

**Priorität:** 🟡 **Alpha** (Alerts wichtig, aber nicht kritisch für MVP)

---

### 10. SignalsPage (`/signals`)
**Zweck:** Trading-Signals (Pattern-Filter, Confidence-Threshold, Quick-Stats).

**Features:**
- Signals-Grid (Pattern-Based)
- Pattern-Filter (Momentum, Breakout, Reversal, Range-Bounce, Mean-Reversion, Continuation)
- Confidence-Slider (Min-Threshold)
- Quick-Stats (Total, High-Confidence, Long/Short)
- Signal-Review-Card (Detail-View)

**Datenquellen:**
- `hooks/useSignals.ts` → **Mock/Fake-Data** (keine echte API)

**Status:** ⚠️ **60% Done**
- ✅ UI vollständig (Filter, Grid, Stats)
- ✅ Fake-Data funktioniert (useSignals-Hook)
- ⚠️ **Keine echten Signals** (benötigt AI-Model oder Signal-Generator)
- ⚠️ Signal-Review-Card benötigt Detail-Logic

**Abhängigkeiten:**
- `hooks/useSignals.ts` (Signal-Hook, aktuell Mock-Data)
- `components/signals/SignalCard.tsx`
- `components/signals/SignalReviewCard.tsx`
- `components/ui/StateView.tsx`
- `types/signal.ts` (Signal-Type)

**Priorität:** 🟢 **Teaser** (Showcase-Feature, nicht funktional für MVP)

---

### 11. LessonsPage (`/lessons`)
**Zweck:** Trading-Lessons (Pattern-Based-Filtering, Win-Rate-Stats, DOs/DONTs).

**Features:**
- Lessons-Grid (Pattern-Based)
- Pattern-Filter (Unique-Patterns aus Lessons)
- Score-Slider (Min-Threshold)
- Quick-Stats (Total, High-Score, Avg-Win-Rate, Total-Trades)
- Lesson-Detail-Card (DOs, DONTs, Stats)

**Datenquellen:**
- `hooks/useSignals.ts` (useLessons) → **Mock/Fake-Data**

**Status:** ⚠️ **55% Done**
- ✅ UI vollständig (Filter, Grid, Stats)
- ✅ Fake-Data funktioniert (useLessons-Hook)
- ⚠️ **Keine echten Lessons** (benötigt ML-Model oder Lesson-Extractor)
- ⚠️ Lesson-Detail-Card benötigt Stats-Integration

**Abhängigkeiten:**
- `hooks/useSignals.ts` (useLessons, aktuell Mock-Data)
- `components/signals/LessonCard.tsx`
- `components/ui/StateView.tsx`

**Priorität:** 🟢 **Teaser** (Showcase-Feature, nicht funktional für MVP)

---

### 12. HomePage (Unused)
**Zweck:** Beta-Shell (Logo, Dark-Mode-Toggle, Feature-List).

**Status:** ✅ **Done** (47 Zeilen, vollständig)

**Notiz:** ⚠️ **Nicht in Routes** → Entweder `/` Route hinzufügen oder löschen.

**Priorität:** ⚠️ **Unused** (Optional als Fallback)

---

### 13. FontTestPage (Unused)
**Zweck:** Font-Rendering-Test (JetBrains Mono vs. System-Font).

**Status:** ✅ **Done** (115 Zeilen, vollständig)

**Notiz:** ⚠️ **Nicht in Routes** → Nur für Dev-Testing, nicht für Prod.

**Priorität:** ⚠️ **Unused** (Dev-Tool, nicht deployen)

---

## 🔗 Abhängigkeiten-Matrix

### Shared-Components (Cross-Page)
| Component | Used By | Zweck |
|-----------|---------|-------|
| `components/ui/StateView.tsx` | Signals, Lessons, Notifications | Empty/Error/Loading-States |
| `components/ui/Button.tsx` | Alle | Primary/Secondary/Ghost-Buttons |
| `components/ui/EmptyState.tsx` | Board, Journal, Notifications | Leere-Zustände |
| `components/ui/LoadingSkeleton.tsx` | Board, Analyze, Chart | Lade-Skeletons |
| `sections/ideas/Playbook.tsx` | Analyze, Notifications | Idea-Cards |
| `sections/ai/useAssist.ts` | Analyze, Journal | AI-Proxy-Hook |
| `lib/urlState.ts` | Analyze, Chart | URL-State-Encoding |
| `lib/shortlink.ts` | Analyze, Chart | URL-Shortening |

### Data-Layer (Backend-APIs)
| API-Endpoint | Used By | Status |
|--------------|---------|--------|
| `/api/board/kpis` | BoardPage | ⚠️ Backend fehlt |
| `/api/board/feed` | BoardPage | ⚠️ Backend fehlt |
| `/api/data/ohlc` | AnalyzePage, ChartPage | ⚠️ Backend fehlt (Moralis/Dexpaprika-Proxy) |
| `/api/ai/assist` | AnalyzePage, JournalPage | ⚠️ Backend fehlt (OpenAI-Proxy) |
| `/api/journal` | JournalPage | ⚠️ Backend fehlt (CRUD) |
| `/api/rules` | AnalyzePage, NotificationsPage | ⚠️ Backend fehlt (CRUD) |
| `/api/access/*` | AccessPage | ⚠️ Backend fehlt (Status, Lock, Mint) |
| `/api/push/subscribe` | NotificationsPage | ⚠️ Backend fehlt (VAPID) |
| `/api/ideas` | AnalyzePage, NotificationsPage | ⚠️ Backend fehlt (CRUD) |

---

## 📈 Status-Zusammenfassung

| Status | Count | Pages |
|--------|-------|-------|
| ✅ **Done** (100%) | 3 | Landing, HomePage, FontTestPage |
| ⚠️ **85-90% Done** | 2 | ChartPage, SettingsPage |
| ⚠️ **70-80% Done** | 3 | BoardPage, AnalyzePage, JournalPage, NotificationsPage |
| ⚠️ **60-70% Done** | 2 | ReplayPage, AccessPage |
| ⚠️ **55-60% Done** | 2 | SignalsPage, LessonsPage |

**Gesamtfortschritt:** ~72% (UI weitgehend fertig, Backend-APIs fehlen)

---

## 🚨 Kritische Blocker (für MVP)

### Frontend-Blocker
1. ⚠️ **Keine echten API-Daten** → Board/Analyze/Chart nutzen Mock-Data oder fallback zu leeren Zuständen
2. ⚠️ **AI-Features nicht funktional** → OpenAI/Anthropic-Keys + Server-Proxy fehlen
3. ⚠️ **Push-Notifications nicht funktional** → VAPID-Keys + Backend fehlen

### Backend-Blocker
1. 🔴 `/api/board/kpis` + `/api/board/feed` fehlen
2. 🔴 `/api/data/ohlc` fehlt (Moralis/Dexpaprika-Proxy)
3. 🔴 `/api/ai/assist` fehlt (OpenAI-Proxy)
4. 🟡 `/api/journal`, `/api/rules`, `/api/ideas` fehlen (CRUD)
5. 🟡 `/api/access/*` fehlen (Solana-Integration)

---

**Dokumentiert von:** Claude 4.5 (Sonnet) Cursor-Agent  
**Nächster Schritt:** TABS_ORDER.md → Reihenfolge der Bearbeitung festlegen
