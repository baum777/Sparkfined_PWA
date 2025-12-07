# App-Sitemap 
inklusive der **erweiterten Journal-Struktur** (Journal 2.0 mit Insights, Journey, Social, Export etc.).

---

## 1. Top-Level App-Routen

```txt
/
├─ /landing              (Marketing / Einstieg, optional getrenntes Projekt)
├─ /app                  (Shell für die PWA – Auth-Guard)
│  ├─ /app/dashboard
│  ├─ /app/markets
│  ├─ /app/journal
│  ├─ /app/replay
│  ├─ /app/alerts
│  ├─ /app/watchlists
│  ├─ /app/analysis
│  ├─ /app/settings
│  └─ /app/help
└─ /api/...              (Backend / edge routes)
```

---

## 2. Dashboard & Markets

```txt
/app/dashboard
  ├─ Hero KPI Strip (Equity Curve, Winrate, R-Multiple, Streaks)
  ├─ Quick Actions (Neue Journal-Notiz, Replay starten, Analyse starten)
  ├─ Recent Activity (letzte Trades / Notizen / Alerts)
  └─ AI Teaser / Daily Oracle Preview

/app/markets
  ├─ /app/markets/spot
  ├─ /app/markets/favorites
  └─ /app/markets/search
      ├─ Token-Suche
      └─ Token-Detail → AdvancedChart + Journal-Quicklink
```

---

## 3. **Journal – erweiterte Sitemap (Journal 2.0)**

### 3.1 Journal-Hauptseite

```txt
/app/journal
  ├─ Tab: Entries
  ├─ Tab: Insights
  ├─ Tab: Journey
  ├─ Tab: Social
  ├─ Tab: Templates
  └─ Tab: Settings
```

> UI: `JournalPageV2` mit Tab-Navigation + Filterleiste (Token, Setup-Typ, Tag, Zeitraum).

---

### 3.2 Entries (CRUD & Views)

```txt
/app/journal                (Tab: Entries – Standard)
  ├─ /app/journal/new
  │    ├─ /app/journal/new/quick
  │    ├─ /app/journal/new/advanced
  │    └─ /app/journal/new/import    (Screenshot/OCR in Zukunft)
  ├─ /app/journal/:entryId
  │    ├─ Overview (Kerndaten + Tags + Screenshot / Chartref)
  │    ├─ Trade-Block (Entry, Mgmt, Exit, Result)
  │    ├─ Emotion & Mindset
  │    ├─ Fehler & Learnings
  │    └─ Link zu Insights & Journey
  └─ /app/journal/bulk
       ├─ Multi-Select (Taggen, Löschen, Mergen)
       └─ Export-Auswahl
```

**Funktionalitäten in Entries:**

* Filter:

  * Zeitraum, Token, Setup, Tag, R-Multiple, Emotionen
* Sort:

  * Datum, PnL, R-Multiple, „Pain/Glory“-Score
* Aktionen:

  * „Clone as Draft“
  * „Mark as Key Trade“
  * „Send to Insights“ (explizite AI-Analyse triggern)

---

### 3.3 Insights (AI-Auswertung)

```txt
/app/journal/insights       (Tab: Insights)
  ├─ /app/journal/insights/list
  │    ├─ Karten mit Insight-Kategorien (BEHAVIOR_LOOP, FOMO, RISK, EXECUTION, etc.)
  │    └─ Filter nach Kategorie, Severity, Zeitraum
  ├─ /app/journal/insights/:insightId
  │    ├─ Titel + Summary
  │    ├─ Kategorie + Severity-Badge
  │    ├─ Evidence (verlinkte Journaleinträge)
  │    ├─ Empfehlung & Nächste Aktion
  │    └─ CTA: „Recall in Journey“, „Pin on Dashboard“
  └─ /app/journal/insights/history
       └─ Historie der AI-Runs (Input, Kosten, Timestamps)
```

**Backendschnittstelle:**

* nutzt intern `/api/journal/insights` + `/api/ai/assist` mit `v1/journal_condense` & `v1/analyze_bullets`.

---

### 3.4 Journey (Transformation / Meta-Ebene)

```txt
/app/journal/journey        (Tab: Journey)
  ├─ /app/journal/journey/timeline
  │    ├─ Phasen: Degen → Seeker → Warrior → Master …
  │    ├─ Milestones: First 50 Logs, First 10 R>2 Trades, „Max Pain Lesson“ etc.
  │    └─ Badges / XP
  ├─ /app/journal/journey/snapshots
  │    ├─ Monatliche „Journey Snapshot“ Karten
  │    └─ Vergleich: aktueller Monat vs. letzter Monat (KPIs, Fehler, Patterns)
  └─ /app/journal/journey/goals
       ├─ Ziel-Board (z.B. „1R max daily loss“, „max 2 aktive Trades“)
       └─ Link zu passenden Insights & Regeln
```

---

### 3.5 Social (Preview & Share)

```txt
/app/journal/social         (Tab: Social)
  ├─ /app/journal/social/previews
  │    ├─ Auto-generierte Social-Preview-Cards
  │    └─ Auswahl: „Win-Tagebuch“, „Lessons Learned“, „Void Bear Story“
  ├─ /app/journal/social/templates
  │    └─ Text-Templates für Tweets/Posts (ohne PII, ohne sens. Daten)
  └─ /app/journal/social/export
       └─ Export einer anonymisierten Story (Bild + Text)
```

---

### 3.6 Templates (Strukturbausteine)

```txt
/app/journal/templates      (Tab: Templates)
  ├─ /app/journal/templates/list
  ├─ /app/journal/templates/:templateId
  └─ /app/journal/templates/new
```

* Beispiele:

  * „Scalp Setup“
  * „Swing Breakout Setup“
  * „News-Driven Trade“
* Definieren Felder, Default-Tags, Standard-Fragen.

---

### 3.7 Journal Settings

```txt
/app/journal/settings       (Tab: Settings)
  ├─ Tag-Manager
  │    ├─ Fehler-Tags (FOMO, Revenge, Overtrade, …)
  │    ├─ Setup-Tags (Breakout, Mean Reversion, News, …)
  │    └─ Emotion-Tags (Angst, Gier, Langeweile)
  ├─ Privacy & Sync
  │    ├─ Lokal vs. Cloud (IndexedDB + optional Server-Backup)
  │    └─ Anonymisierungsregeln für Social-Exports
  ├─ AI-Settings
  │    ├─ Opt-in/Out für Insights
  │    └─ AI-Budget-Hinweise (Daily Cap Anzeige)
  └─ Export/Import
       ├─ Full Journal Export (JSON/CSV/zip)
       └─ Import aus CSV/anderen Tools
```

---

## 4. Replay, Alerts, Watchlists & Analysis

### 4.1 Replay

```txt
/app/replay
  ├─ /app/replay/sessions
  ├─ /app/replay/session/:id
  └─ /app/replay/journal-link
      └─ Jump von Replay-Event zur Journal-Notiz
```

### 4.2 Alerts

```txt
/app/alerts
  ├─ /app/alerts/list
  ├─ /app/alerts/new
  ├─ /app/alerts/:alertId
  └─ /app/alerts/history
```

### 4.3 Watchlists

```txt
/app/watchlists
  ├─ /app/watchlists/list
  ├─ /app/watchlists/:id
  └─ /app/watchlists/new
```

### 4.4 Analysis (Advanced Insights / Grok Pulse)

```txt
/app/analysis
  ├─ /app/analysis/token/:address
  │    ├─ AdvancedChart
  │    ├─ AI-Bullet-Analyse (v1/analyze_bullets)
  │    └─ Quicklink: „Neue Journal-Notiz zu diesem Token“
  ├─ /app/analysis/teaser-vision
  └─ /app/analysis/daily-oracle
```

---

## 5. Settings & Help

```txt
/app/settings
  ├─ Profile
  ├─ Theme & Layout
  ├─ Integrationen (CEX/DEX, Telegram, etc.)
  └─ Advanced (Experiments / Flags)

/app/help
  ├─ Onboarding-Guides
  ├─ „How to Journal“
  ├─ „How to Use AI Insights“
  └─ Changelog / Release Notes
```

---

## Kurz-Fazit

* Die **Journal-Erweiterung** hängt an `/app/journal` und splittet sich in:

  * `entries` (CRUD & Listen),
  * `insights` (AI),
  * `journey` (Transformation/Timeline),
  * `social` (Share-Previews),
  * `templates`,
  * `settings` (Tags, Privacy, Export).
* Alle anderen Bereiche (Dashboard, Markets, Replay, Alerts, Watchlists, Analysis) bleiben davon logisch getrennt, sind aber mit Deep-Links ins Journal verbunden (z.B. „Neue Notiz zu diesem Token“).

