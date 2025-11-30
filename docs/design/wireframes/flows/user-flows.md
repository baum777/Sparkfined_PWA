# STEP 3: USER FLOWS (Detailed)

---

## Flow 1: Analyze Page — Token Analysis

**TL;DR:** User enters contract address, views KPIs/heatmap, generates AI analysis, creates trade idea

### User Journey Steps

```
1. USER LANDS ON ANALYZE PAGE (/)
   ├─ Empty state: "Gib eine Contract-Adresse ein..."
   └─ Input field focused (auto-focus implied)

2. USER INPUTS CONTRACT ADDRESS
   ├─ Paste from clipboard (typical: Solana CA = 44 chars)
   ├─ Select timeframe (dropdown: 1m/5m/15m/1h/4h/1d)
   └─ Default TF: 15m

3. USER CLICKS "ANALYSIEREN"
   ├─ Loading state: Button shows "Lade…"
   ├─ API call: GET /api/data/ohlc?address={CA}&tf={TF}
   └─ Data loaded → render KPIs + Heatmap

4. DISPLAY KPIs (6 Cards, 3-column grid on desktop)
   ├─ Close (last)
   ├─ Change (24h) — with tone color (green/red)
   ├─ Volatility (24h)
   ├─ ATR(14)
   ├─ High/Low Range (24h)
   └─ Volume (24h)

5. DISPLAY HEATMAP
   ├─ Matrix: SMA 9/20/50/200
   ├─ Colors: Bull (green) / Bear (red) / Flat (gray)
   └─ Tooltip: "Bull = Preis über Indikator..."

6. USER CLICKS "AI GENERIEREN"
   ├─ Loading: "Generiere…"
   ├─ API call: POST /api/ai/assist with template "v1/analyze_bullets"
   ├─ Context: { address, tf, metrics, matrixRows }
   └─ AI result displayed (pre-formatted text)

7. USER REVIEWS AI BULLETS
   ├─ Cost info: "Provider: openai · Model: gpt-4o-mini · 234 ms · ~$0.0012"
   ├─ Option 1: "In Journal einfügen" → broadcasts event to Journal
   └─ Option 2: "One-Click Trade-Idea anlegen"

8. USER CLICKS "ONE-CLICK TRADE-IDEA"
   ├─ Creates ServerRule (price-cross example)
   │   └─ POST /api/rules → returns ruleId
   ├─ Creates Journal Note with seed text
   │   └─ POST /api/journal → returns journalId
   ├─ Appends AI bullets to journal (if available)
   ├─ Creates Idea object
   │   └─ POST /api/ideas → returns ideaId
   ├─ Adds to Watchlist (localStorage)
   └─ Alert: "Trade-Idea Paket angelegt (Rule + Journal + Idea + Watchlist)"

9. USER EXPORTS DATA (Optional)
   ├─ "Export JSON" → downloads analyze-{CA}-{TF}.json (metrics + raw data)
   └─ "Export CSV" → downloads ohlc-{CA}-{TF}.csv (t,o,h,l,c,v format)

10. USER NAVIGATES TO CHART
    ├─ Click "→ Chart" button
    ├─ Permalink generated: /chart?chart={encodedState}
    └─ Opens in new tab (target="_blank")

EDGE CASES:
├─ No address → "Analysieren" button disabled
├─ API error → Red banner with error message
├─ No AI result yet → Placeholder text shown
└─ Empty OHLC data → "Keine OHLC-Daten für diese Adresse..."
```

---

## Flow 2: Chart Page — Advanced Charting & Replay

**TL;DR:** Load OHLC data, draw shapes, replay candles, run backtest, export charts

### User Journey Steps

```
1. USER LANDS ON CHART PAGE (/chart)
   ├─ Auto-load if URL params present (?chart= or ?short=)
   ├─ Empty state: "Tipp: Füge eine CA ein..."
   └─ Input field in ChartHeader

2. USER ENTERS CA + TIMEFRAME
   ├─ Input CA (or paste from Analyze permalink)
   ├─ Select TF dropdown
   ├─ Click "Load" or press Enter
   └─ API call: GET /api/market/ohlc?address={CA}&tf={TF}

3. CHART CANVAS RENDERS
   ├─ Candlestick chart in zinc-900 border + dark background
   ├─ Default view: Full range (start=0, end=data.length)
   ├─ HUD overlay (if enabled): Title, TF, current bar info
   └─ Replay cursor at position 0

4. USER TOGGLES INDICATORS
   ├─ Checkbox bar above chart: SMA20, EMA20, VWAP
   ├─ On toggle → recalculate + overlay on chart
   └─ Lines rendered in distinct colors (implied from code)

5. USER SELECTS DRAWING TOOL
   ├─ Toolbar: Cursor (default), HLine, Trend, Fib
   ├─ Hotkeys: H (hline), T (trend), F (fib), Esc (cursor)
   ├─ Click canvas → start drawing
   └─ Shape persisted to localStorage (sparkfined.draw.v1)

6. USER ZOOMS & PANS
   ├─ Zoom In/Out buttons → adjust view window by 15%
   ├─ Reset → full range
   ├─ Scroll wheel → zoom at cursor (implied)
   └─ View state in URL: ?chart={...view:{start, end}}

7. USER ACTIVATES REPLAY MODE
   ├─ Click "Play" → replay.start()
   ├─ Speed selector: 1x, 2x, 4x, 8x, 10x
   ├─ Cursor advances → view follows cursor
   ├─ Hotkeys: Space (play/pause), Left/Right arrows (step)
   └─ Shift+Arrows → step by 10 bars

8. USER ADDS BOOKMARKS
   ├─ Click "Add Bookmark" during replay
   ├─ Optional label input
   ├─ Bookmark stored: { id, t, label, createdAt }
   └─ Hotkeys: 1-6 → jump to bookmark N

9. USER RUNS BACKTEST
   ├─ "Run Backtest (Client)" → local eval with localStorage rules
   ├─ "Run Backtest (Server)" → POST /api/backtest
   ├─ Results panel shows:
   │   ├─ Total hits count
   │   ├─ Per-rule breakdown
   │   └─ Timeline markers (clickable)
   └─ Pagination: Next/Prev (500 hits per page)

10. USER EXPORTS CHART
    ├─ "Export PNG (HUD)" → canvas with header overlay
    ├─ "Copy PNG (HUD)" → clipboard (requires HTTPS)
    ├─ "Copy Shortlink" → compressed URL token
    ├─ "→ Journal (Snapshot)" → broadcasts draft to Journal
    └─ "Export Session (JSON)" → full state dump

11. USER IMPORTS SESSION
    ├─ Click "Import Session (JSON)"
    ├─ File picker → select .json
    ├─ State restored: CA, TF, view, shapes, indicators
    └─ Chart re-renders with imported state

EDGE CASES:
├─ No CA → empty canvas with tip
├─ API error → red banner below header
├─ Offline → cached data (if available) or error
├─ Test mode (?test=<token>) → auto-runs backtest on load
└─ Clipboard API unavailable → fallback to download
```

---

## Flow 3: Journal Page — Note-Taking & AI Compression

**TL;DR:** Create note, compress with AI, sync to server, export as MD/JSON

### User Journey Steps

```
1. USER LANDS ON JOURNAL PAGE (/journal)
   ├─ Draft editor at top (empty by default)
   ├─ Server notes list (empty until loaded)
   └─ Local notes list at bottom

2. USER RECEIVES DRAFT FROM CHART (Optional Path)
   ├─ Event listener: "journal:draft"
   ├─ Draft pre-filled: { screenshotDataUrl, permalink, address, tf }
   ├─ Title auto-set: "Chart Snapshot"
   └─ Page scrolls to top

3. USER RECEIVES AI TEXT FROM ANALYZE (Optional Path)
   ├─ Event listener: "journal:insert"
   ├─ Text appended to draft.body
   └─ Alert: "AI-Bullets in Zwischenablage + an Journal gesendet"

4. USER WRITES NOTE MANUALLY
   ├─ Title input (text)
   ├─ Body textarea (markdown-style)
   ├─ Optional: Address, TF, RuleId fields
   └─ Tags input (#tag format)

5. USER CLICKS "AI VERDICHTEN"
   ├─ System prompt: "Du reduzierst Chart-Notizen... 4–6 Spiegelstriche"
   ├─ Context: title, address, tf, body
   ├─ API call: POST /api/ai/assist
   └─ AI result displayed in emerald panel

6. USER REVIEWS AI OUTPUT
   ├─ Pre-formatted bullets shown
   ├─ Option 1: "AI-Analyse an Notiz anhängen & speichern"
   └─ Option 2: Manual copy-paste into body

7. USER SAVES TO SERVER
   ├─ Click "Save Server" (in editor or attach button)
   ├─ POST /api/journal with { id?, title, body, address, tf, ruleId, tags }
   └─ Success: draft updated with server ID + timestamps

8. USER LOADS SERVER NOTES
   ├─ Click "Server-Notizen laden"
   ├─ GET /api/journal
   └─ Grid of cards (2 columns on desktop)

9. USER EDITS EXISTING NOTE
   ├─ Click "In Editor laden" on server note card
   ├─ Draft populated with note data
   ├─ Edit → Save Server (updates via id)
   └─ Or delete with confirmation prompt

10. USER EXPORTS JOURNAL
    ├─ Click "Exportieren"
    ├─ Prompt: "json oder md"
    ├─ GET /api/journal/export?fmt={fmt}
    └─ Downloads journal-export.{json|md}

11. USER MANAGES LOCAL NOTES (IndexedDB)
    ├─ List below server notes (useJournal hook)
    ├─ Click to open → populates draft
    ├─ Save → updates local DB
    └─ Delete with confirmation

EDGE CASES:
├─ No title → "(ohne Titel)" shown
├─ No server notes → empty grid with message
├─ No AI result → placeholder text
├─ Export error → alert with error message
└─ Offline → server sync fails, local still works
```

---

## Flow 4: Replay Page — Session Timeline Viewer

**TL;DR:** View recorded sessions, play timeline, inspect events

### User Journey Steps

```
1. USER LANDS ON REPLAY PAGE (/replay)
   ├─ Auto-loads sessions from IndexedDB
   └─ Empty state: "No recorded sessions yet" with icon

2. SESSIONS GRID DISPLAYS
   ├─ 2-column grid on desktop
   ├─ Each card shows:
   │   ├─ SessionId (first 20 chars)
   │   ├─ Event count badge
   │   ├─ Started timestamp
   │   └─ Duration (formatted: Xm Ys)
   └─ Sorted by most recent first

3. USER CLICKS "WATCH REPLAY"
   ├─ Opens ReplayModal component
   ├─ Loads all events for sessionId from DB
   └─ Timeline renders events chronologically

4. MODAL SHOWS TIMELINE (Static Preview)
   ├─ Header: "Static Preview Mode" banner
   ├─ Event list: timestamp, type, details
   ├─ Color-coded by event type (inferred)
   └─ Scroll to navigate events

5. USER INSPECTS EVENTS
   ├─ Click event → expands details (if implemented)
   ├─ Event types visible:
   │   ├─ user.rule.create
   │   ├─ user.bookmark.add
   │   ├─ chart.draw
   │   └─ page.view (etc.)
   └─ Metadata shown: attrs, timestamp

6. USER CLOSES MODAL
   ├─ Click close button
   └─ Returns to session list

7. USER REFRESHES SESSIONS
   ├─ Click "🔄 Refresh" button
   └─ Re-queries IndexedDB

EDGE CASES:
├─ No sessions → "No recorded sessions yet" empty state
├─ Session load error → console.error (no UI feedback yet)
└─ Full playback controls → "coming in future phases" note

NOTE: Current implementation is "Proof-of-concept timeline viewer"
      Full features (scrubbing, playback controls, chart snapshots) are planned.
```

---

## Flow 5: Access Page — OG Gating System

**TL;DR:** Check access status, calculate lock requirements, verify holdings, view leaderboard

### User Journey Steps

```
1. USER LANDS ON ACCESS PAGE (/access)
   ├─ Header: "Sparkfiend Access Pass"
   ├─ Tagline: "Fair OG-Gating • 333 Slots • MCAP-Dynamic Lock • Soulbound NFT"
   └─ Tab bar: Status | Lock | Hold | Leaderboard

2. TAB: STATUS (Default)
   ├─ Component: AccessStatusCard
   ├─ Shows current status:
   │   ├─ OG (with NFT indicator)
   │   ├─ Holder (token balance shown)
   │   └─ None (prompt to lock/hold)
   └─ Action buttons based on status

3. TAB: LOCK
   ├─ Component: LockCalculator
   ├─ Input: Current MCAP
   ├─ Calculation logic: dynamic based on MCAP tier
   ├─ Output: Required lock amount + lock duration
   └─ Button: "Lock Tokens" → triggers Solana TX

4. TAB: HOLD
   ├─ Component: HoldCheck
   ├─ Input: Wallet address (or connect wallet)
   ├─ API call: GET /api/access/status?wallet={address}
   ├─ Shows: Token balance, hold duration, eligibility
   └─ Action: "Verify" → checks on-chain balance

5. TAB: LEADERBOARD
   ├─ Component: LeaderboardList
   ├─ Table: Rank, Wallet (truncated), Lock Amount, Lock Date
   ├─ Top 333 slots shown
   ├─ Current user highlighted (if in list)
   └─ Updates every 30s (implied polling)

6. USER LOCKS TOKENS (Lock Tab)
   ├─ Click "Lock Tokens"
   ├─ Wallet connect prompt (Phantom, Solflare, etc.)
   ├─ Transaction preview: Amount, Duration, Fee
   ├─ User confirms TX in wallet
   ├─ POST /api/access/lock with { wallet, amount, duration }
   └─ Success → mints Soulbound NFT

7. USER MINTS NFT (After Lock Confirmation)
   ├─ Automatic trigger or manual button
   ├─ POST /api/access/mint-nft with { wallet }
   ├─ NFT minted on-chain (Solana)
   └─ Status updates to "OG" with NFT badge

EDGE CASES:
├─ Wallet not connected → "Connect Wallet" prompt
├─ Insufficient balance → "Insufficient tokens" error
├─ Lock failed → retry button + error message
├─ Already OG → status shows NFT + lock details
└─ Leaderboard full (333) → "Waitlist" indicator
```

---

## Flow 6: Notifications Page — Alert Center

**TL;DR:** Create alert rules, manage server rules, view trade ideas, export packs

### User Journey Steps

```
1. USER LANDS ON NOTIFICATIONS PAGE (/notifications)
   ├─ Header: "Alert Center"
   ├─ Buttons: Browser Permission, Push Subscribe, Test Push
   └─ Sections: Wizard, Server Rules, Trade Ideas, Local Rules, Triggers

2. USER CREATES RULE (Wizard)
   ├─ Component: RuleWizard
   ├─ Presets:
   │   ├─ Price Cross (> threshold)
   │   ├─ % Change 24h (> X%)
   │   ├─ Volume Spike (> Y%)
   │   └─ Custom (manual config)
   ├─ Inputs: Address, TF, Rule params
   └─ Click "Create" → adds to local rules

3. USER UPLOADS RULES TO SERVER
   ├─ Click "Alle lokalen Regeln hochladen"
   ├─ Loop through localStorage rules
   ├─ POST /api/rules for each
   └─ Success → loads server rules

4. USER MANAGES SERVER RULES
   ├─ Grid of rule cards
   ├─ Toggle "aktiv" checkbox → POST /api/rules (update)
   ├─ Shows: kind, address, tf, id, updatedAt
   └─ Click "Jetzt evaluieren" → POST /api/rules/eval-cron

5. USER SUBSCRIBES TO PUSH
   ├─ Click "Subscribe Push"
   ├─ Browser prompts for permission
   ├─ Service Worker registers push subscription
   ├─ POST /api/push/subscribe with { subscription, userId }
   └─ State updates to "on"

6. USER TESTS PUSH
   ├─ Click "Test Push"
   ├─ POST /api/push/test-send with current subscription
   └─ Notification appears: "Test notification"

7. USER VIEWS TRADE IDEAS
   ├─ Grid below server rules
   ├─ Each card shows:
   │   ├─ Title, status (active/closed)
   │   ├─ Address, TF, side (long/short)
   │   ├─ Rule + Journal links
   │   └─ Risk breakdown (if present)
   └─ Actions: Export Pack, Copy Chart Link, Close, Outcome Note

8. USER EXPORTS EXECUTION PACK
   ├─ Click "Export Pack (MD)"
   ├─ GET /api/ideas/export-pack?id={ideaId}
   └─ Downloads execution-pack-{id}.md with full context

9. USER CLOSES TRADE IDEA
   ├─ Click "Schließen" on active idea
   ├─ Prompt: "Exit-Preis eingeben"
   ├─ POST /api/ideas/close with { id, exitPrice }
   └─ Calculates P/L% → displays in card

10. USER VIEWS TRIGGER HISTORY
    ├─ Table at bottom: Zeit, Rule, Kind, Close, Note
    ├─ Shows recent alert triggers (localStorage)
    ├─ Click "Leeren" → clears history
    └─ Probe button → manual test trigger

EDGE CASES:
├─ VAPID key missing → "VITE_VAPID_PUBLIC_KEY fehlt" error
├─ Permission denied → state "denied", error message shown
├─ No server rules → empty grid
├─ No ideas → empty grid
└─ Push not supported → fallback to browser notifications only
```

---

## Flow 7: Settings Page — Configuration Hub

**TL;DR:** Configure theme, AI, data management, PWA controls

### User Journey Steps

```
1. USER LANDS ON SETTINGS PAGE (/settings)
   ├─ Header: "Einstellungen"
   └─ Sections: Display, Data, Danger Zone, AI, Risk, Monitoring, PWA

2. USER CHANGES THEME
   ├─ Dropdown: System / Dark / Light
   ├─ onChange → setSettings({ theme })
   └─ Immediate visual update (useDarkMode hook)

3. USER CONFIGURES CHART DEFAULTS
   ├─ Toggle: Snap-to-OHLC (Default)
   ├─ Dropdown: Replay Speed (1x, 2x, 4x, 8x, 10x)
   ├─ Toggles: Show HUD, Show Timeline, Show Mini-Map
   └─ Saved to localStorage (sparkfined.settings.v1)

4. USER EXPORTS APP DATA
   ├─ Checkboxes: Select namespaces (settings, watchlist, alerts, etc.)
   ├─ Click "Export JSON"
   ├─ exportAppData(selected) → JSON blob
   └─ Downloads sparkfined-backup-{date}.json

5. USER IMPORTS APP DATA
   ├─ Click "Import JSON (Merge)"
   ├─ File picker → select backup .json
   ├─ importAppData(file, "merge") → merges into localStorage
   └─ Success message: "Import erfolgreich: {namespaces}"

6. USER CONFIGURES AI PROVIDER
   ├─ Dropdown: Anthropic / OpenAI / xAI
   ├─ Input: Model (optional override)
   ├─ Inputs: maxOutputTokens, maxCostUsd
   └─ Note: "Keys bleiben serverseitig (.env)"

7. USER VIEWS AI TOKEN BUDGET
   ├─ Progress bar: Used / Total tokens
   ├─ Color: Green (<70%), Amber (70-90%), Red (>90%)
   ├─ Shows active context (if any)
   └─ Click "Reset Counter" → resets usage

8. USER CONFIGURES RISK DEFAULTS
   ├─ Input: Default Balance (for Playbook)
   ├─ Dropdown: Default Preset (Conservative / Balanced / Aggressive)
   └─ Used in Analyze page Playbook component

9. USER TOGGLES TELEMETRY FLAGS
   ├─ Checkboxes: Enabled, API Timings, Canvas/FPS, User Events, Token Overlay
   ├─ Slider: Sampling rate (0-1)
   ├─ Click "Jetzt senden" → drains buffer to server
   └─ Note: "Batch alle 15s & beim Tab-Wechsel"

10. USER MANAGES PWA
    ├─ Click "SW-Update anstoßen" → pokeServiceWorker()
    ├─ Click "Caches leeren" → clearCaches()
    ├─ Version info shown: APP_VERSION, MODE, VAPID status
    └─ Alerts with operation result

11. USER FACTORY RESETS (Danger Zone)
    ├─ Click "Clear {namespace}" → deletes specific localStorage key
    ├─ Or "Factory Reset" → confirms + deletes ALL sparkfined.* keys
    └─ Alert: "Alle App-Daten gelöscht. Bitte Seite neu laden."

EDGE CASES:
├─ Import invalid JSON → error message
├─ No VAPID key → push features hidden
├─ Service worker unavailable → "Kein Service Worker gefunden"
└─ Telemetry disabled → buffer not sent
```

---

**Next:** Mobile & Desktop Wireframes for each screen.
