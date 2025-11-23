# Notifications Page — Mobile Wireframe (375px)

**Screen:** NotificationsPage (`/notifications`)  
**TL;DR:** Alert rule management, push notifications, server rules, and trade ideas dashboard

---

## State 1: Default View

```
┌─────────────────────────────────────────┐
│  [Header: Alert Center]            [⚙️]  │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐│ // Action buttons row
│  │ [Browser Notif.][Subscribe Push]   ││ // flex-wrap gap-2 text-xs
│  │ [Test Push][Unsubscribe]           ││
│  │ [Test-Trigger]                     ││ // Manual trigger for testing
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│ // Rule Wizard (RuleWizard)
│  │ ✨ Rule Wizard                      ││ // border-zinc-800 bg-zinc-900/40
│  │                                     ││ // rounded-xl p-3
│  │ Quick Presets:                      ││
│  │ [Price Cross >] [% Change 24h >]   ││ // Preset buttons
│  │ [Volume Spike >] [Custom]          ││
│  │                                     ││
│  │ Create rule from preset or custom   ││ // text-xs text-zinc-400
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│ // Server Rules Section
│  │ 🔧 Server-Rules (persistiert)       ││ // border-zinc-800 rounded-xl
│  │                                     ││ // bg-zinc-900/40 p-3
│  │ [Laden][Hochladen][Evaluieren]     ││ // Action buttons
│  │                                     ││
│  │ ┌─────────────────────────────────┐ ││ // Rule Card 1
│  │ │ price-cross        [x] aktiv    │ ││ // font-medium + checkbox
│  │ │ 7xKF...abc · 15m               │ ││ // text-zinc-400 text-xs
│  │ │ id: ab12cd34… · 01.11.25 14:32 │ ││ // text-zinc-500 text-[11px]
│  │ └─────────────────────────────────┘ ││
│  │                                     ││
│  │ ┌─────────────────────────────────┐ ││ // Rule Card 2
│  │ │ pct-change-24h     [ ] aktiv    │ ││
│  │ │ xyz9...def · 1h                │ ││
│  │ │ id: cd34ef56… · 02.11.25 09:15 │ ││
│  │ └─────────────────────────────────┘ ││
│  │                                     ││
│  │ (2 server rules)                    ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│ // Trade Ideas Section
│  │ 💡 Trade-Ideas                      ││
│  │                                     ││
│  │ [Aktualisieren][Export Case Studies]││
│  │                                     ││
│  │ ┌─────────────────────────────────┐ ││ // Idea Card 1
│  │ │ Idea 7xKF…          [active]    │ ││
│  │ │ 7xKF...abc · 15m · long         │ ││
│  │ │ Rule: ab12… · Journal: cd34…    │ ││
│  │ │                                 │ ││
│  │ │ ⚡ Risk: Stop 0.00452           │ ││ // Risk details (if present)
│  │ │ Size 1.23u · Risk $45.67        │ ││ // bg-emerald-950/20 p-2
│  │ │ Targets: 1.5R→0.00489 · 3R→…    │ ││ // border-emerald-800/50
│  │ │                                 │ ││
│  │ │ [Export Pack][Copy Chart Link] │ ││
│  │ │ [Schließen][Outcome-Notiz]     │ ││
│  │ │                                 │ ││
│  │ │ [Apply Playbook]                │ ││ // Embedded Playbook component
│  │ └─────────────────────────────────┘ ││
│  │                                     ││
│  │ (1 active idea)                     ││
│  └─────────────────────────────────────┘│
│                                         │
│  [Local Rules Table...] (collapsed)     │
│  [Trigger History...] (collapsed)       │
│                                         │
├─────────────────────────────────────────┤
│  📊 Analyze  │  📝 Journal  │  ⏮️ Replay │
└─────────────────────────────────────────┘
```

**Annotations:**
- **Push Buttons**: Disabled if VITE_VAPID_PUBLIC_KEY missing
- **Rule Wizard**: Preset buttons create pre-configured rules
- **Server Rules**: Cards with toggle for active/inactive
- **Trade Ideas**: Expanded cards showing full idea details + risk breakdown

---

## State 2: Wizard — Price Cross Preset

```
┌─────────────────────────────────────────┐
│  [Header: Alert Center]            [⚙️]  │
├─────────────────────────────────────────┤
│  [Action buttons...]                    │
│                                         │
│  ┌─────────────────────────────────────┐│ // Rule Wizard (expanded)
│  │ ✨ Rule Wizard: Price Cross         ││
│  │                                     ││
│  │ [Address]                           ││
│  │ ┌───────────────────────────────┐   ││ // Input: CA
│  │ │ 7xKF...abc123                 │   ││
│  │ └───────────────────────────────┘   ││
│  │                                     ││
│  │ [Timeframe]  [Operator]  [Value]   ││
│  │ ┌─────┐ ┌─────┐ ┌───────────────┐  ││ // TF dropdown, Op dropdown, Value input
│  │ │15m ⌄│ │ > ⌄ │ │ 0.00450       │  ││
│  │ └─────┘ └─────┘ └───────────────┘  ││
│  │                                     ││
│  │ Trigger when price crosses above    ││ // Description
│  │ 0.00450 on 15m chart.               ││
│  │                                     ││
│  │ [Create Rule]                       ││ // Primary CTA
│  └─────────────────────────────────────┘│
│                                         │
├─────────────────────────────────────────┤
│  📊 Analyze  │  📝 Journal  │  ⏮️ Replay │
└─────────────────────────────────────────┘
```

**Annotations:**
- **Preset Form**: Pre-filled with default values for selected preset
- **Operator Dropdown**: `>`, `<`, `>=`, `<=`, `==`
- **Create Button**: Adds rule to local storage + telemetry event

---

## State 3: Trade Idea — Closed

```
┌─────────────────────────────────────────┐
│  [Header: Alert Center]            [⚙️]  │
├─────────────────────────────────────────┤
│  [Sections above...]                    │
│                                         │
│  ┌─────────────────────────────────────┐│ // Trade Ideas (with closed idea)
│  │ 💡 Trade-Ideas                      ││
│  │                                     ││
│  │ ┌─────────────────────────────────┐ ││ // Closed Idea Card
│  │ │ Idea 7xKF…        [closed] ✅    │ ││ // Status: closed
│  │ │ 7xKF...abc · 15m · long         │ ││
│  │ │                                 │ ││
│  │ │ Exit: 0.00485 · P/L: +7.65%     │ ││ // Outcome (emerald text)
│  │ │ Outcome: "Hit TP1, runner kept" │ ││ // text-emerald-300
│  │ │                                 │ ││
│  │ │ [Export Pack][Copy Chart Link] │ ││ // Actions still available
│  │ └─────────────────────────────────┘ ││
│  │                                     ││
│  └─────────────────────────────────────┘│
│                                         │
├─────────────────────────────────────────┤
│  📊 Analyze  │  📝 Journal  │  ⏮️ Replay │
└─────────────────────────────────────────┘
```

**Annotations:**
- **Closed Status**: Checkmark + gray out
- **Exit Price**: Shown with P/L percentage
- **Outcome Note**: User-entered text describing result

---

## State 4: Local Rules Table

```
┌─────────────────────────────────────────┐
│  [Header: Alert Center]            [⚙️]  │
├─────────────────────────────────────────┤
│  [Sections above...] (scrolled down)    │
│                                         │
│  ┌─────────────────────────────────────┐│ // Rule Editor (collapsed by default)
│  │ 📝 Manual Rule Editor               ││
│  │ [Expand to create custom rule]     ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│ // Local Rules Table
│  │ 📋 Regeln (localStorage)            ││
│  │                                     ││
│  │ ┌───────────────────────────────┐   ││ // Table (scrollable horizontal)
│  │ │Kind    Op Val   CA    TF  En.│   ││ // Header row (text-[12px])
│  │ ├───────────────────────────────┤   ││
│  │ │price-c  > 0.045 7xK.. 15m [ON]│   ││ // Row 1
│  │ │pct-ch.. > 5     abc.. 1h  [ON]│   ││ // Row 2
│  │ │volume.. > 1000  xyz.. 5m  [OFF]│  ││ // Row 3
│  │ └───────────────────────────────┘   ││
│  │                                     ││
│  │ Last Trigger: 01.11.25 14:32        ││ // Per row
│  │ [Probe] [Löschen]                   ││ // Action buttons per row
│  │                                     ││
│  │ (3 local rules)                     ││
│  └─────────────────────────────────────┘│
│                                         │
├─────────────────────────────────────────┤
│  📊 Analyze  │  📝 Journal  │  ⏮️ Replay │
└─────────────────────────────────────────┘
```

**Annotations:**
- **Table**: Compact, horizontal scroll on mobile
- **Toggle Button**: [ON] / [OFF] per row
- **Probe Button**: Manually trigger test alert
- **Delete Button**: Removes rule from localStorage

---

## State 5: Trigger History

```
┌─────────────────────────────────────────┐
│  [Header: Alert Center]            [⚙️]  │
├─────────────────────────────────────────┤
│  [Sections above...] (scrolled far down)│
│                                         │
│  ┌─────────────────────────────────────┐│ // Trigger History
│  │ 🔔 Trigger-History              [Leeren]││
│  │                                     ││
│  │ ┌───────────────────────────────┐   ││ // Table (max-h-72 overflow)
│  │ │ Zeit         Rule  Kind   Close│   ││ // Header
│  │ ├───────────────────────────────┤   ││
│  │ │ 01.11 14:32 ab12  price  0.045│   ││ // Trigger 1
│  │ │ 01.11 09:15 cd34  pct-ch 0.052│   ││ // Trigger 2
│  │ │ 31.10 16:42 ef56  volume 1205 │   ││ // Trigger 3
│  │ │ ...                           │   ││
│  │ └───────────────────────────────┘   ││
│  │                                     ││
│  │ (12 triggers)                       ││
│  └─────────────────────────────────────┘│
│                                         │
├─────────────────────────────────────────┤
│  📊 Analyze  │  📝 Journal  │  ⏮️ Replay │
└─────────────────────────────────────────┘
```

**Annotations:**
- **History Table**: Shows recent triggers (localStorage)
- **Clear Button**: Empties trigger history
- **Scrollable**: Max height 288px (max-h-72)

---

## COMPONENT BREAKDOWN

| Component | Event | Action | Animation |
|-----------|-------|--------|-----------|
| Button: Browser Notif. | onClick | Notification.requestPermission() | prompt |
| Button: Subscribe Push | onClick | subscribePush() → POST /api/push?action=subscribe | state update |
| Button: Test Push | onClick | POST /api/push?action=test-send | notification |
| Button: Unsubscribe | onClick | unsubscribePush() → POST /api/push?action=unsubscribe | state update |
| Button: Test-Trigger | onClick | addManualTrigger() | adds to history |
| Preset Button | onClick | Pre-fill wizard form | form expand |
| Button: Create Rule | onClick | create(draft) → adds to localStorage | telemetry |
| Button: Laden (Server Rules) | onClick | GET /api/rules | loading + populate |
| Button: Hochladen | onClick | Loop POST /api/rules | batch upload |
| Button: Evaluieren | onClick | POST /api/rules/eval-cron | alert with stats |
| Checkbox: aktiv (Server Rule) | onChange | POST /api/rules (update active) | toggle |
| Button: Aktualisieren (Ideas) | onClick | GET /api/ideas | reload ideas |
| Button: Export Case Studies | onClick | GET /api/ideas/export → download | blob |
| Button: Export Pack | onClick | GET /api/ideas/export-pack?id=... | download |
| Button: Copy Chart Link | onClick | clipboard.writeText() | alert |
| Button: Schließen | onClick | prompt() → POST /api/ideas/close | outcome form |
| Button: Outcome-Notiz | onClick | prompt() → POST /api/ideas (update) | save note |
| Button: Apply Playbook | onClick | Open Playbook component | modal/inline |
| Toggle: ON/OFF (Local Rule) | onClick | update(id, {enabled}) | toggle |
| Button: Probe | onClick | addManualTrigger() | test trigger |
| Button: Löschen (Rule) | onClick | remove(id) | delete row |
| Button: Leeren (History) | onClick | clearTriggers() | empty table |

---

## USER FLOWS

### Flow 1: Create Alert Rule (Wizard)
1. User on Notifications page
2. Clicks "Price Cross >" preset
3. Wizard expands with pre-filled form
4. User enters CA, TF, operator, value
5. Clicks "Create Rule"
6. Rule added to local storage
7. Telemetry event logged

### Flow 2: Upload Rules to Server
1. User has local rules created
2. Clicks "Hochladen"
3. Loop through local rules → POST /api/rules
4. Server rules grid updates
5. Success message (or error per rule)

### Flow 3: Close Trade Idea
1. User views active idea
2. Clicks "Schließen"
3. Prompt: "Exit-Preis eingeben"
4. User enters price
5. POST /api/ideas/close with { id, exitPrice }
6. P/L calculated server-side
7. Idea status → closed, P/L shown

### Flow 4: Test Push Notification
1. User clicks "Subscribe Push"
2. Browser prompts for permission
3. User allows
4. Service worker registers subscription
5. POST /api/push?action=subscribe
6. User clicks "Test Push"
7. POST /api/push?action=test-send
8. Notification appears: "Test notification"

---

## RESPONSIVE BEHAVIOR

### Mobile (<768px)
- Rule Cards: Single column
- Idea Cards: Single column
- Tables: Horizontal scroll (small text)

### Desktop (>1024px)
- Rule Cards: 2 columns (`md:grid-cols-2`)
- Idea Cards: 2 columns
- Tables: Full width, no scroll

---

## ACCESSIBILITY

- **Push Permission**: Browser-native prompt (accessible)
- **Checkboxes**: Keyboard accessible
- **Tables**: Screen reader announces headers
- **Buttons**: Clear labels (aria-label where needed)

---

## EDGE CASES

- **VAPID Missing**: Push buttons hidden, error message shown
- **Permission Denied**: State updates to "denied", error shown
- **No Server Rules**: Empty grid with message
- **No Ideas**: Empty grid
- **Trigger History Empty**: "Keine Trigger" message

---

**Storybook Variants:** Default, Wizard Expanded, Trade Idea Closed, Local Rules, Trigger History
