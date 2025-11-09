# Sparkfined TA-PWA — Tab Wireframes & Workflows

**Scope:** Consolidated, high-fidelity wireframes (mobile 375 px & desktop 1280 px) plus production-ready user workflows for every primary navigation tab of the Sparkfined Technical Analysis PWA.  
**Audience:** Designers, engineers, and PMs preparing Storybook stories, PR specs, or UX handoffs.  
**References:** Aligns with `Layout` (sticky header + responsive container), `BottomNav` (mobile), `Sidebar` (desktop), and current feature sets in `/src/pages`.

---

## 1. Board (Command Center)

### Purpose & KPIs
- **Goal:** Give traders a situational overview and direct them toward the next best action.
- **Primary success:** User clears onboarding, inspects Now Stream, and triggers at least one quick action.
- **Secondary signals:** KPI tile taps, feed scroll depth, checklist completion.

### Information Architecture (callouts used in wireframes)
- **[A] Header:** Brand + optional quick settings (future).
- **[1] Overview KPIs:** Carousel (mobile) / 2-row grid (desktop) summarising risk, sentiment, watchlist movers.
- **[2] Hint Banner:** Progressive education, dismissible per hint id.
- **[3] Now Stream:** Chronological digest of alerts, journal highlights, watchlist events.
- **[4] Quick Actions:** CTA shortcuts (Analyze, Chart, Journal, Replay, Access) with badges.
- **[5] Activity Feed:** Infinite scroll of event cards with filters (desktop expands to dedicated column).
- **[6] Onboarding Overlays:** Welcome modal, product tour trigger, keyboard shortcut sheet.

### Mobile Wireframe (375 px)
```
┌────────────────────────────────────────┐
│ [A] Sparkfined Header             [⋮]  │
├────────────────────────────────────────┤
│ [1] KPI Carousel (horizontal snap)     │
│ ┌─────┐ ┌─────┐ ┌─────┐                │
│ │Risk│ │PnL │ │Flow│ ... swipe→        │
│ └─────┘ └─────┘ └─────┘                │
│ [2] 💡 Hint: "Tip zu KPI Tiles" [x]     │
│ ┌────────────────────────────────────┐ │
│ │ [3] Now Stream                     │ │
│ │ ● 14:35  Idea SOL breakout         │ │
│ │   Tap → Journal note ID 8a2…       │ │
│ │ ● 14:18  Alert hit: ATR squeeze    │ │
│ └────────────────────────────────────┘ │
│ [4] Quick Actions (scrollable row)     │
│ ▢ Analyze │ ▢ Chart │ ▢ Journal │ …     │
│ [5] Activity Feed (stacked cards)      │
│ ┌─────────────┐                        │
│ │Board Event… │ CTA: “Open chart”      │
│ └─────────────┘                        │
│ [6] Floating Onboarding pill (FAB)     │
├────────────────────────────────────────┤
│ Bottom Nav: ▣ Board ▢ Analyze ▢ Journal│
│            ▢ Settings                  │
└────────────────────────────────────────┘
```

### Desktop Wireframe (1280 px, sidebar nav)
```
┌─Sidebar (lg)──────────────────────────────────────────────────────────────────────────────┐
│ ▣ Board │ ▢ Analyze │ ▢ Chart │ ▢ Journal │ ▢ Alerts │ ▢ Settings                         │
└──────────────────────────────────────────────────────────────────────────────────────────┘
┌──────────────────────────────────────────────────────────────────────────────────────────┐
│ [A] Header (brand, future user menu)                                                     │
├──────────────────────────────────────────────────────────────────────────────────────────┤
│ [1] KPI Grid ────────────────┬───────────────┬───────────────┐                            │
│ | Risk Score | PnL | Sentiment| Range Break | Funding       | Watchlist Heat             │
│ └────────────┴───────────────┴───────────────┴───────────────┴───────────────┴──────────┘
│ [2] Hint Banner (full width, dismissible)                                                │
│                                                                                          │
│ ┌───────────────┬───────────────┬──────────────────────────────┐                         │
│ │ [3] Now Stream│ [4] Quick     │ [5] Activity Feed            │                         │
│ │ • Timeline…   │ Actions Grid  │ • Feed Card (hover reveals   │                         │
│ │ • Inline CTA  │ • Replay prep │   “Open in Chart / Journal”) │                         │
│ └───────────────┴───────────────┴──────────────────────────────┘                         │
│ [6] Onboarding Checklist overlay (bottom-right)                                          │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

### States & Edge Cases
- Empty KPIs (no data) → shimmer skeleton, hint emphasises adding watchlist.
- First visit → Welcome modal + persona select, triggers guided tour.
- Tour running → overlays focus sequential sections (`data-tour` IDs).
- Feed fetch error → toast + inline retry card; board still shows cached KPIs.

### User Workflows
1. **First-Run Activation**
   1. User opens `/` → sees Welcome modal (`createProductTour` spawn).
   2. Select persona → modal closes → tour anchors highlight [1], [3], [4], [5].
   3. User completes checklist tasks (e.g. “Run Analyze once”) tracked via `useOnboardingStore`.
   4. Completion toggles hint `hint:board-kpi-tiles` to display optional tips.
2. **Daily Check-In Loop**
   1. User lands on Board (already authenticated or local state).
   2. Skims KPI tiles (swipes or hovers) for risk deltas.
   3. Taps latest Now Stream item with alert flag → deep link to `/notifications`.
   4. From Quick Actions triggers `Analyze` CTA → navigates to `/analyze` with optional prefilled address.
   5. Returns via browser back → sees feed card state updated (prevents duplicate).
3. **Respond to High Priority Alert**
   1. Activity Feed surfaces card tagged `severity:high`.
   2. User clicks `Open chart` action (desktop) / taps CTA (mobile) → pushes route `/chart?alertId=…`.
   3. After handling, user uses floating FAB to reopen checklist and mark “Alert processed”.

---

## 2. Analyze (Token Diagnostics)

### Purpose & KPIs
- **Goal:** Transform a contract address + timeframe into actionable analytics, AI insights, and exports.
- **Primary success:** User runs `Analysieren`, reviews KPIs + heatmap, generates AI bullets or idea packet.
- **Secondary signals:** Export actions, AI insertion to Journal, Playbook application.

### Information Architecture
- **[A] Address Bar:** Contract input, timeframe select, load & navigation actions.
- **[1] Action Row:** Buttons for Chart, Shortlink, Export JSON/CSV.
- **[2] KPI Grid:** Price, change, volatility, ATR, range, volume.
- **[3] Heatmap:** Indicator matrix with legend.
- **[4] AI Assist Panel:** Generative insights, provider metadata, CTA to Journal.
- **[5] Playbook Card:** Risk calculator presets, on-apply callback.
- **[6] Status Footer:** Sample count, timeframe, error messaging.

### Mobile Wireframe (375 px)
```
┌────────────────────────────────────────┐
│ [A] CA Input [__________________] [TF⌄] │
│     Button: [Analysieren] [→ Chart]     │
│     Actions: [Copy Shortlink][Export…]  │
│ [2] KPI Stack                           │
│ ┌────────────┐                         │
│ │Close (last)│ 0.004567 ₿              │
│ └────────────┘                         │
│ … (scroll for 6 cards)                 │
│ [3] Indicator Heatmap (4 columns)      │
│ ┌──┬──┬──┬──┐                          │
│ │🟢│🔴│⚪│🟢│ Row = SMA/EMA groups        │
│ └──┴──┴──┴──┘ Legend text              │
│ [4] AI Assist Panel                    │
│ 🤖 Header   [Generieren][→ Journal]    │
│ ┌────────────────────────────┐         │
│ │Bullet list output / empty  │         │
│ └────────────────────────────┘         │
│ [5] Playbook Card (collapsed)          │
│ [Expand] Risk Calculator ▾             │
│ [6] Samples: 96 · TF: 15m              │
├────────────────────────────────────────┤
│ Bottom Nav…                            │
└────────────────────────────────────────┘
```

### Desktop Wireframe (1280 px)
```
┌─Sidebar───────┬──────────────────────────────────────────────────────────────────────────┐
│ ▢ Board …     │                                                                          │
└───────────────┴──────────────────────────────────────────────────────────────────────────┘
│ [A] Address Bar: CA input | TF select | Analyze | → Chart | Exports                     │
│ [1] Action Row (single line, trailing shortlink status)                                 │
│ [2] KPI Grid ┌──────┬──────┬──────┐  (md:grid-cols-3)                                   │
│              │ Card │ Card │ Card │                                                     │
│ [3] Heatmap full-width (8 columns) with legend row                                      │
│ [4] AI Panel (2-column): Result left, controls + provider info right                    │
│ [5] Playbook expanded inline: inputs + results grid                                     │
│ [6] Footer info row (samples/timeframe/errors)                                          │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

### States & Edge Cases
- **Empty:** CTA disabled, ghost card instructs to input CA.
- **Loading:** Button label `Lade…`, ghost heatmap skeleton.
- **Success:** Renders KPIs, heatmap, AI prompt area.
- **AI Running:** `Generieren` disabled, spinner text.
- **Error:** Red banner with message; secondary actions still available.

### User Workflows
1. **Run Technical Snapshot & Export**
   1. Paste address + choose timeframe.
   2. Tap `Analysieren` → fetch OHLC → compute metrics.
   3. Review KPIs and heatmap; adjust timeframe if needed.
   4. Click `Export JSON` or `Export CSV`; downloads triggered.
2. **Generate AI Summary to Journal**
   1. After metrics available, press `Generieren`.
   2. Wait for `useAssist` response; preview bullet output.
   3. Tap `In Journal einfügen` → dispatch `journal:insert`, copy to clipboard.
   4. Navigate to Journal via bottom nav (mobile) or quick action (desktop) to confirm.
3. **One-Click Trade Idea Packet**
   1. With metrics loaded, press `One-Click Trade-Idea anlegen`.
   2. Backend chain creates server rule, journal seed, AI enrichment, idea entity, watchlist entry.
   3. Toast/alert confirms; Quick Action badge increments to reflect new idea count.

---

## 3. Chart (Pro Canvas & Replay Hub)

### Purpose & KPIs
- **Goal:** Deliver interactive charting with drawing tools, replay, backtests, and exports.
- **Primary success:** User loads data, manipulates view, runs backtest or replay, shares via snapshot.
- **Secondary signals:** Bookmarks created, shortlink copied, timeline toggled.

### Information Architecture
- **[A] Chart Header:** CA input, timeframe hotkeys, load button.
- **[1] Indicator Bar:** SMA/EMA/VWAP toggles.
- **[2] Draw Toolbar:** Tool selection, undo/redo, clear.
- **[3] Zoom/Pan Bar:** Zoom controls, snap toggle, range strings.
- **[4] Replay Bar:** Play/pause, speed, stepping, bookmark list (mobile collapses).
- **[5] Utility Actions:** Export PNG, copy, shortlink, journal snapshot, JSON import/export.
- **[6] MiniMap & Timeline:** Optional modules driven by settings toggles.
- **[7] Backtest Panel:** Local & server runs, paginated results.
- **[8] Chart Canvas:** Candlesticks, overlays, tool HUD, error overlays.

### Mobile Wireframe (375 px)
```
┌────────────────────────────────────────┐
│ [A] CA Field + TF chips (horizontal)    │
│ [1] Indicator toggles (wrap on 2 rows)  │
│ [2] Draw Toolbar (scrolling icon strip) │
│ [3] Zoom/Pan row (buttons + Snap toggle)│
│ [4] Replay Bar (collapsible)            │
│  ▶ ▌▌  Speed [1x⌄]  Step◀ ▶  [Bookmarks⌄]│
│ [5] Actions (2 columns, wrap)           │
│ [6] MiniMap (accordion)                 │
│ [6b] Timeline (accordion)               │
│ [7] Backtest Panel (accordion)          │
│ ┌──────────────────────────────┐        │
│ │Chart Canvas (aspect ~3:4)    │        │
│ │• HUD overlay top-left        │        │
│ │• Gesture instructions below  │        │
│ └──────────────────────────────┘        │
│ Error / empty states below canvas       │
├────────────────────────────────────────┤
│ Bottom Nav…                             │
└────────────────────────────────────────┘
```

### Desktop Wireframe (1280 px)
```
┌─Sidebar───────┬──────────────────────────────────────────────────────────────────────────┐
│ …             │                                                                          │
└───────────────┴──────────────────────────────────────────────────────────────────────────┘
│ [A] Header row: CA input | TF select | Load | Hotkey hints                               │
│ [1] Indicator Bar (single line toggles)                                                  │
│ [2] Draw Toolbar (icon row + undo/redo)                                                  │
│ [3] Zoom/Pan Bar (range readout right-aligned)                                           │
│ [4] Replay Bar (bookmarks list inline, add CTA)                                          │
│ [5] Utility Action Row (Export PNG, Copy PNG, Shortlink, →Journal, Export/Import JSON)   │
│ [6] MiniMap (left half) │ [6b] Event Timeline (right half)                               │
│ [7] Backtest Panel (full width, table + pagination controls)                             │
│ [8] Chart Canvas (wider aspect ~12:5)                                                    │
│    • HUD overlay top-left                                                                │
│    • TestOverlay banners if active                                                       │
│ Footer: Guidance text when no address / data not found                                   │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

### States & Edge Cases
- Empty address → helper text with hotkeys.
- Loading OHLC → spinner overlay + actions disabled.
- No data found → neutral message.
- Backtest results large → pagination & timeline injection.
- Replay session mode (from `/chart?replaySession=`) → loads cached data + sets view.

### User Workflows
1. **Deep Dive & Share Snapshot**
   1. Load CA/timeframe via header.
   2. Toggle indicators, draw tools, adjust view.
   3. Press `Export PNG (HUD)` to download share-ready image.
   4. Optionally send to journal using `→ Journal (Snapshot)` to broadcast draft.
2. **Create Replay Session Bookmarks**
   1. Start Replay (`▶`) at desired speed.
   2. While playing, tap `Add Bookmark`, optionally name.
   3. Use number hotkeys (desktop) to jump between top bookmarks.
   4. Use `Copy Shortlink` to share state with team.
3. **Backtest Alert Rules**
   1. Ensure local alert rules exist (`useAlertRules`).
   2. In Backtest Panel, click `Run Local` or `Run Server`.
   3. Inspect table results; click hit row to jump view to bar index.
   4. If satisfied, navigate to `/notifications` via quick action to publish rule.

---

## 4. Replay (Player & Pattern Dashboard)

### Purpose & KPIs
- **Goal:** Allow traders to replay sessions frame-by-frame and analyze pattern statistics.
- **Primary success:** User opens session, plays, bookmarks, or switches to pattern dashboard.
- **Secondary signals:** Session creation from journal, filters applied, exports triggered.

### Information Architecture
- **[A] Header:** Title, mode toggle (`Player` ↔ `Dashboard`), back to Journal.
- **[1] Player View:** Chart placeholder (until canvas integration), open-in-chart CTA.
- **[2] Replay Controls:** `ReplayPlayer` component with timeline, speed, bookmarks.
- **[3] Dashboard Cards:** Pattern stats, filters (setup/emotion), entry list.
- **[4] Empty State:** Encourages creating sessions via Journal.

### Mobile Wireframe (375 px)
```
┌────────────────────────────────────────┐
│ [A] 🎬 Replay Player  [📊 Dashboard]    │
│     Subtitle text                       │
│ Buttons: [Toggle View] [← Journal]      │
│ [1] Chart Panel                         │
│ ┌──────────────────────────────┐        │
│ │Frame 12/100 stats            │        │
│ │CTA: Open in Chart →          │        │
│ └──────────────────────────────┘        │
│ [2] Replay Controls (stacked)           │
│ ▶ ▌▌ │ Scrubber │ Speed [1x⌄]           │
│ [Bookmarks list accordion]              │
│ [Add Bookmark] [Delete] [Jump]          │
│ If no session → [4] Empty state card    │
│                                          │
│ (Switching to dashboard)                 │
│ [3] Pattern Stats cards grid             │
│ Filters dropdown(s)                      │
│ Entry list (accordion)                   │
└────────────────────────────────────────┘
```

### Desktop Wireframe (1280 px)
```
┌─Sidebar───────┬──────────────────────────────────────────────────────────────────────────┐
│ …             │                                                                          │
└───────────────┴──────────────────────────────────────────────────────────────────────────┘
│ [A] Header: Title + Description | Buttons: Dashboard/Player Toggle | ← Journal           │
│ Player Mode:                                                                             │
│ ┌──────────────────┬────────────────────────────────────────────────────────────────────┐ │
│ │ [1] Chart Panel  │ [2] Replay Controls                                                │ │
│ │ (2/3 width)      │ • Timeline slider                                                  │ │
│ │ CTA “Open in     │ • Speed buttons                                                    │ │
│ │ Chart →”         │ • Bookmark list with actions                                      │ │
│ └──────────────────┴────────────────────────────────────────────────────────────────────┘ │
│ Dashboard Mode:                                                                          │
│ [3] Metric Cards row | Filters row | Entries table with “Open Journal” links             │
│ [4] Empty state card (if stats unavailable)                                              │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

### States & Edge Cases
- Loading session → skeleton + spinner.
- Missing OHLC cache → triggers mock data fetch (`cacheOhlcData`) placeholder.
- Dashboard no data → “No Data Yet” card.
- Bookmark operations failure → inline toast.

### User Workflows
1. **Review Journal-Linked Session**
   1. From Journal entry, click “View Replay” (navigates to `/replay/:sessionId`).
   2. Session loads; user plays frames, adjusts speed.
   3. Adds bookmark at key moment; notes automatically saved via `addBookmark`.
   4. Uses `Open in Chart` CTA for advanced marking; returns via browser back.
2. **Pattern Discovery**
   1. Switch to Dashboard mode (`toggleViewMode`).
   2. Apply `Setup` filter (e.g., `Breakout`) and optional `Emotion`.
   3. Review updated stats, click entry to jump to Journal for context.
3. **Create Session from Scratch**
   1. Landing in player mode without session shows empty state.
   2. User taps “View Dashboard” to identify candidate entries, or `← Journal`.
   3. In Journal, creates replay session, returns with ID, reopens page to see player view.

---

## 5. Journal (Trade Notes HQ)

### Purpose & KPIs
- **Goal:** Capture, refine, and sync trade notes with AI assistance and server persistence.
- **Primary success:** User saves or updates note with context, attaches AI summary, exports or loads server data.
- **Secondary signals:** Search/tag usage, AI Verdichten adoption, server load frequency.

### Information Architecture
- **[A] Header Row:** Title, search field, tag filter, `Neu` button.
- **[1] Editor:** Title/body inputs, metadata (address, TF, ruleId), CTA `Speichern`.
- **[2] Stats Block:** `JournalStats` aggregate.
- **[3] AI Assist:** Verdichten button, result preview, attach & export actions.
- **[4] Server Notes Grid:** Synced notes with load/delete CTAs.
- **[5] Local List:** `JournalList` with filters & actions.

### Mobile Wireframe (375 px)
```
┌────────────────────────────────────────┐
│ [A] Header                             │
│ Journal | [Suche…][#tag][Neu]          │
│ [1] Editor                             │
│ Title ____________                     │
│ Body  ┌───────────────────────────┐    │
│       │ multi-line textarea       │    │
│       └───────────────────────────┘    │
│ Meta row: [Address][TF][RuleID]        │
│ Buttons: [Speichern] [Server Save]     │
│ [2] Stats summary (cards)              │
│ [3] AI Assist panel                    │
│ 🤖 Verdichten → result pre block       │
│ Buttons: [AI anhängen][Exportieren]    │
│ [4] Server Notes (stacked cards)       │
│ Card: title, tags, excerpt, CTA row    │
│ [5] Local Notes list                   │
│ Accordion entries with badges          │
└────────────────────────────────────────┘
```

### Desktop Wireframe (1280 px)
```
┌─Sidebar───────┬──────────────────────────────────────────────────────────────────────────┐
│ …             │                                                                          │
└───────────────┴──────────────────────────────────────────────────────────────────────────┘
│ [A] Header row (search/tag inputs aligned right)                                         │
│ [1] Editor (wider, two-column metadata row)                                              │
│ [2] Stats cards (multi-column)                                                           │
│ [3] AI Assist (2-column: output + controls)                                              │
│ [4] Server Notes Grid (md:grid-cols-2)                                                   │
│ [5] Journal List (table/list hybrid with filters)                                        │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

### States & Edge Cases
- `journal:draft` event → pre-fills editor, scrolls to top.
- AI error → inline message in assist panel.
- Server sync failure → toast + retains draft locally.
- Delete confirmation ensures no accidental wipe.

### User Workflows
1. **Create Fresh Note with AI Summary**
   1. Tap `Neu` to clear editor.
   2. Fill title/body, metadata if available.
   3. Click `Verdichten` → wait for AI bullets.
   4. Press `AI-Analyse an Notiz anhängen & speichern` to persist server-side.
2. **Import Chart Snapshot Draft**
   1. From Chart press `→ Journal (Snapshot)` (broadcast).
   2. Journal listens to `journal:draft` event, merges screenshot/permalink.
   3. User reviews draft, adds commentary, saves.
3. **Review & Export Server Notes**
   1. Hit `Server-Notizen laden`.
   2. Scroll grid, load note into editor for edits.
   3. Use `Exportieren` to download JSON/MD for archive.

---

## 6. Notifications / Alerts Center

### Purpose & KPIs
- **Goal:** Configure alert rules, manage push subscriptions, and review trigger history.
- **Primary success:** User creates rule (wizard or manual), ensures push active, reviews triggers/ideas.
- **Secondary signals:** Server rule sync, idea exports, trigger history purge.

### Information Architecture
- **[A] Header Controls:** Browser permission, push subscribe/test/unsubscribe, manual trigger.
- **[1] Rule Wizard:** Preset cards → inline form.
- **[2] Server Rules Panel:** Persisted rules grid with activation toggles.
- **[3] Trade Ideas Panel:** Auto-generated idea cards, export pack CTA.
- **[4] Rule Editor:** Manual rule builder.
- **[5] Rules Table:** Local rules with enable/probe/delete.
- **[6] Trigger History:** Scrollable log with clear action.

### Mobile Wireframe (375 px)
```
┌────────────────────────────────────────┐
│ [A] Alert Center                        │
│ Buttons: [Browser Notif][Subscribe…]    │
│          [Test Push][Hard Unsub][Probe] │
│ Error banner (if push fails)            │
│ [1] Rule Wizard                         │
│ ▢ Price Cross  ▢ % Change  ▢ Volume…    │
│ [2] Server Rules (cards list)           │
│ Card: kind, address, toggle, timestamps │
│ [3] Trade Ideas (cards list)            │
│ CTA row: [Aktualisieren][Export Pack]   │
│ [4] Rule Editor                         │
│ Form fields → [Speichern]               │
│ [5] Rules Table (stacked rows)          │
│ Each row: kind/op/value/address/TF ON/OFF│
│ Row actions: [Probe][Löschen]           │
│ [6] Trigger History (table, scrollable) │
│ [Leeren] button top-right               │
└────────────────────────────────────────┘
```

### Desktop Wireframe (1280 px)
```
┌─Sidebar───────┬──────────────────────────────────────────────────────────────────────────┐
│ …             │                                                                          │
└───────────────┴──────────────────────────────────────────────────────────────────────────┘
│ [A] Header row (controls inline, status chips right-aligned)                             │
│ [1] Rule Wizard (full width card)                                                        │
│ [2] Server Rules ────────────┬─────────────┐                                             │
│                              │ [3] Trade   │                                             │
│ Cards md:grid-cols-2         │ Ideas grid  │                                             │
│ [4] Rule Editor (two-column form)                                                         │
│ [5] Rules Table (full width, sticky header)                                              │
│ [6] Trigger History table (max height with scroll)                                      │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

### States & Edge Cases
- Push permission denied → `subState="denied"` → red info text.
- Missing VAPID key → yellow warning chip.
- Server rule fetch failure → inline message with retry button.
- Ideas panel empty → placeholder encouraging One-Click Idea in Analyze.

### User Workflows
1. **Subscribe to Push & Test**
   1. Click `Browser-Benachrichtigung` to request permission.
   2. Press `Subscribe Push`; on success, API call persists subscription.
   3. Tap `Test Push` to validate device receives sample alert.
2. **Create & Deploy Alert Rule**
   1. Select preset in Rule Wizard (e.g., Price Cross).
   2. Fill threshold, address/timeframe; click `Erstellen`.
   3. Rule appears in local table; click `Alle lokalen Regeln hochladen` to sync.
   4. Verify in Server Rules panel; toggle `aktiv` if needed.
3. **Investigate Trigger History**
   1. Scroll `Trigger-History` table to recent events.
   2. Use `Probe` on specific rule from table to reproduce.
   3. Clear history with `Leeren` after review.

---

## 7. Access (Sparkfiend Pass)

### Purpose & KPIs
- **Goal:** Communicate OG pass status, manage MCAP lock, verify holdings, and show leaderboard.
- **Primary success:** User understands their status, calculates lock requirements, or navigates to correct tab.
- **Secondary signals:** Switch between tabs, view leaderboard rows, run hold check.

### Information Architecture
- **[A] Hero Header:** Icon, gradient title, tagline.
- **[1] Tabs:** Status, Lock, Hold, Leaderboard.
- **[2] Status Card:** Current role, NFT info, explorer link.
- **[3] Lock Calculator:** Inputs for wallet balance, MCAP, outputs lock amount.
- **[4] Hold Check:** Wallet verification, state feedback.
- **[5] Leaderboard:** Top 333 list with ranks, badges.
- **[6] Cross-links:** Buttons to switch tabs (`onNavigate`).

### Mobile Wireframe (375 px)
```
┌────────────────────────────────────────┐
│ [A] 🎫 Sparkfiend Access Pass           │
│ Fair OG-Gating • 333 Slots…             │
│ [1] Tabs (scroll row)                   │
│ ▣ Status ▢ Lock ▢ Hold ▢ Leaderboard    │
│ ─────────────────────────────────────── │
│ Tab: Status                             │
│ [2] Card                                │
│ ┌────────────────────────────────────┐ │
│ │ Current Status: OG                 │ │
│ │ Soulbound NFT #042                 │ │
│ │ [View on Explorer]                 │ │
│ └────────────────────────────────────┘ │
│ CTA: View Lock → switch to Lock tab    │
│ ... other tab layouts stack similarly  │
└────────────────────────────────────────┘
```

### Desktop Wireframe (1280 px)
```
┌─Sidebar───────┬──────────────────────────────────────────────────────────────────────────┐
│ …             │                                                                          │
└───────────────┴──────────────────────────────────────────────────────────────────────────┘
│ [A] Header (icon + gradient title)                                                       │
│ [1] Horizontal tab bar (md:flex)                                                         │
│ Status Tab:                                                                              │
│ ┌────────────────────────────┬────────────────────────────┐                              │
│ │ [2] Status Summary         │ Lock Snapshot (feed)       │                              │
│ └────────────────────────────┴────────────────────────────┘                              │
│ Lock Tab: 2-column form (inputs left, result right)                                      │
│ Hold Tab: Verification flow (steps + checklist)                                          │
│ Leaderboard: Table w/ rank, holder, lock amount, minted at                               │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

### States & Edge Cases
- Unknown status → neutral card with CTA “Connect wallet”.
- Lock calculator missing data → show placeholder text.
- Hold check failure → red banner with retry instructions.
- Leaderboard empty → fallback message referencing upcoming mint.

### User Workflows
1. **Confirm OG Status**
   1. Land on Status tab (default).
   2. Review card; if missing data, click `Hold` CTA to verify wallet.
   3. Use `View on Explorer` for NFT details.
2. **Calculate Required Lock**
   1. Switch to Lock tab.
   2. Input wallet balance & desired tier.
   3. Calculator outputs MCAP lock amount; user taps CTA to create lock transaction (future).
3. **Check Leaderboard Ranking**
   1. Navigate to Leaderboard tab.
   2. Scroll list, optional search/filter (future).
   3. Tap entry to open detail (planned) or copy rank.

---

## 8. Settings (Control Center)

### Purpose & KPIs
- **Goal:** Provide comprehensive control over display, data management, AI, monitoring, and PWA behaviour.
- **Primary success:** User changes a setting, exports/imports data, or triggers maintenance operations.
- **Secondary signals:** Danger Zone usage, AI provider adjustments, telemetry toggles.

### Information Architecture
- **[A] Display Block:** Theme, snap defaults, replay speed, HUD/timeline toggles.
- **[1] Wallet Monitoring:** Address, enable toggle, auto Grok, status card.
- **[2] Data Export/Import:** Namespace picker, export/import buttons.
- **[3] Danger Zone:** Clear namespace buttons, Factory Reset.
- **[4] AI Settings:** Provider, model, token limits, cost limits.
- **[5] AI Token Budget:** Progress bar, reset button.
- **[6] Playbook Defaults:** Default balance, preset select.
- **[7] Telemetry Flags:** Checkboxes, sampling, drain buffer.
- **[8] PWA Controls:** Trigger SW update, clear caches, app info.

### Mobile Wireframe (375 px)
```
┌────────────────────────────────────────┐
│ [A] Einstellungen header               │
│ Card: Display                          │
│ Theme [System⌄]                        │
│ Snap Toggle [ON/OFF]                   │
│ Replay Speed [2x⌄]                     │
│ HUD/Timeline/MiniMap toggles           │
│ [1] Wallet Monitoring card             │
│ - Address input                        │
│ - Monitoring toggle                    │
│ - Auto Grok toggle                     │
│ - Status chip / paused banner          │
│ [2] Daten Export/Import                │
│ - Checkbox grid (scroll)               │
│ - [Export JSON][Import JSON]           │
│ [3] Danger Zone (red card)             │
│ Buttons grid: Clear ns…                │
│ [4] AI Settings (grid)                 │
│ [5] Token Budget progress              │
│ [6] Playbook defaults                  │
│ [7] Telemetry flags                    │
│ [8] PWA controls + App info            │
└────────────────────────────────────────┘
```

### Desktop Wireframe (1280 px)
```
┌─Sidebar───────┬──────────────────────────────────────────────────────────────────────────┐
│ …             │                                                                          │
└───────────────┴──────────────────────────────────────────────────────────────────────────┘
│ [A] Header + Display card (max-w-3xl centred)                                            │
│ [1] Wallet Monitoring card (same width)                                                  │
│ [2] Data Export/Import (grid of checkboxes, actions row)                                 │
│ [3] Danger Zone (red block, multi-column buttons)                                       │
│ [4] AI Settings (multi-column forms)                                                     │
│ [5] Token Budget (progress bar)                                                          │
│ [6] Playbook Defaults (3-column)                                                         │
│ [7] Monitoring & Tokens (flags grid)                                                     │
│ [8] PWA Controls (buttons + info panel)                                                  │
└──────────────────────────────────────────────────────────────────────────────────────────┘
```

### States & Edge Cases
- Import busy state → text feedback `Import…`.
- Danger zone confirm dialogs guard clears.
- Wallet monitoring active → green status card updates via interval.
- Telemetry drain shows buffer count; disabled flags grey out.

### User Workflows
1. **Adjust Chart Display Defaults**
   1. Modify Theme or Snap toggle.
   2. `useSettings` persists to local storage immediately.
   3. Navigate to Chart to confirm default applied (snap state pre-checked).
2. **Backup & Restore Data**
   1. Tick namespaces (settings, alerts, journal…).
   2. Click `Export JSON` → downloads backup.
   3. Later, choose `Import JSON (Merge)` → select file → success message lists namespaces.
3. **Trigger PWA Maintenance**
   1. Hit `SW-Update anstoßen` to prompt skip waiting.
   2. Press `Caches leeren`; success message shows counts.
   3. Confirm app info reflects updated VAPID/versions.

---

## Cross-Tab Considerations
- **Navigation Consistency:** Mobile bottom nav exposes `Board`, `Analyze`, `Journal`, `Settings`. Ensure flows referencing `Chart`, `Replay`, `Alerts`, `Access` provide explicit CTAs or Quick Actions.
- **State Broadcasts:** Analyze → Journal (`journal:insert`), Chart → Journal (`journal:draft`), Analyze → Alerts (rule creation), Alerts ↔ Chart (backtest).
- **Storybook Coverage:** For each tab include states: `Empty`, `Loading`, `Success`, and major error (align with existing stories in `wireframes/mobile` and `wireframes/desktop` docs).
- **Handoff Checklist:** Provide designers with spacing tokens (8 px grid), colors (Zinc + Emerald), and interactive states (hover, disabled). Engineers should map callouts to components in `/src/components` and `/src/sections`.

---

**Next Steps (Implementation Readiness)**
- Derive Storybook stories for each state per tab (desktop + mobile viewports).
- Update PRDs with workflow checklists above to validate QA acceptance.
- Align telemetry to capture key success metrics noted per tab.
