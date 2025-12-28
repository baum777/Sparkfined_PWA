# Kern-Module und “Must-have UI-Bausteine”.

## Primary Tabs

### 1) Dashboard

**Zweck:** “Command Surface” für den Tag: Snapshot + Quick Actions (Conversion/Usability).
**Must-have Inhalte:**

* Page Header + Meta (Entries/Alerts) + CTA “Log entry”
* KPI Strip (5 KPIs)
* Cards: Daily Bias, Holdings, Trade Log
* Secondary Cards: Insight Teaser, Journal Snapshot, Alerts Snapshot
* Bottom Grid: Recent Entries + Alerts Overview
* FAB + Quick Actions + Log Entry Overlay + Alert Create Entry Point

### 2) Journal

**Zweck:** Core Value: Trading Journal → Habit Builder (Degen → Mastery).
**Must-have Inhalte (V2 Layout):**

* Input Column: Emotional State (required), Market Context (optional), Thesis (required), Templates (Overwrite/Merge/Suggest), AI Notes, Trade Context Banner, Sticky Action Bar
* Output Column: Archetype + Score, 2×2 Metrics, 4 Insights Cards, History (5 latest)
* Contract: Validation + Autosave Semantik bleibt identisch

### 3) Learn (Route bleibt /lessons)

**Zweck:** Retention: Learning Path (Degen → Mastery).
**Must-have Inhalte:**

* Module list + progress indicator
* Lesson viewer (markdown/json)
* Quizzes/checkpoints optional
* AI summaries optional (nur wenn geplant)

### 4) Chart

**Zweck:** Analyse + Replay + Marker + Indicators (Power User).
**Must-have Inhalte (bestehende Chart-Sektionen):**

* TopBar: timeframes + replay controls + export + mobile actions
* Sidebar: Markets + Sessions
* Toolbar: Indicators / Drawings / Alerts (collapsible sections)
* Bottom Panel Tabs: Grok Pulse + Journal Notes
* Canvas: chart renderer + markers + responsive sheets
  **Replay:** kein eigener Tab, sondern **Chart Mode** (Route Alias /replay → Chart replay state)

### 5) Alerts

**Zweck:** Trigger → Return Loops (active usage).
**Must-have Inhalte:**

* Alerts list + filters
* Create flow (einheitlich, ideal: RightSheet)
* Empty states mit CTA
* URL-prefill semantics (wenn vorhanden)
* Stable testids

### 6) Settings

**Zweck:** Trust + Control: Data/Prefs/Diagnostics.
**Must-have Sektionen (identisch):**

* Appearance, Chart Preferences, Notifications, Connected Wallets, Monitoring, Token Usage, Risk Defaults, Data Export/Backup, Advanced/Diagnostics, Danger Zone (typed RESET)

---

## Secondary Tabs

### 7) Watchlist

**Zweck:** Schnellbeobachtung + Navigation in Chart.
**Must-have Inhalte:**

* List/Table of assets (symbol, price, change)
* Selection → detail panel (desktop split / mobile sheet)
* Open chart CTA
* Sort/Filter nur wenn bereits vorhanden (sonst als Missing markieren)

### 8) Oracle

**Zweck:** “Daily intel / narrative” + Score History (Insights).
**Must-have Inhalte (legacy blocks preserved):**

* Reward banner (wenn vorhanden)
* Full report block (oracle-pre)
* Theme filter + History chart + history list
  **Additive Loveable Insights:** nur wenn eure Policy es erlaubt (sonst weglassen)

---

## Dev-Only / Nicht-MVP Tabs (optional, nicht in Loveable erforderlich)

* Icon/Style Showcase
* Interne Debug/Diagnostics pages

---

### Kurzregel “Soll-Tab-Architektur”

* **Primary Tabs = tägliche Journey** (Dashboard → Journal → Learn → Chart → Alerts → Settings)
* **Secondary Tabs = optional tools** (Watchlist, Oracle)
* **Replay gehört zum Chart** (alias route ok, aber kein echter Tab)

