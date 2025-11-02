# Settings Page — Mobile Wireframe (375px)

**Screen:** SettingsPage (`/settings`)  
**TL;DR:** Configuration hub for theme, AI, data management, telemetry, and PWA controls

---

## State 1: Full Settings View (Scrollable)

```
┌─────────────────────────────────────────┐
│  [Header: Einstellungen]           [⚙️]  │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────────┐│ // Display Settings
│  │ 🎨 Display                          ││ // border-zinc-800 rounded-xl
│  │                                     ││ // bg-zinc-900/40 p-4
│  │ Theme                [System    ⌄] ││ // Row: label + dropdown/toggle
│  │ ───────────────────────────────────  ││ // border-b separator
│  │ Snap-to-OHLC         [ON]          ││ // Toggle button
│  │ ───────────────────────────────────  ││
│  │ Replay Speed         [2x        ⌄] ││ // Dropdown
│  │ ───────────────────────────────────  ││
│  │ HUD anzeigen         [ON]          ││
│  │ ───────────────────────────────────  ││
│  │ Timeline anzeigen    [OFF]         ││
│  │ ───────────────────────────────────  ││
│  │ Mini-Map anzeigen    [ON]          ││
│  └─────────────────────────────────────┘│
│  sparkfined.settings.v1                 │ // text-xs text-zinc-500
│                                         │
│  ┌─────────────────────────────────────┐│ // Data Export/Import
│  │ 💾 Daten — Export / Import          ││
│  │                                     ││
│  │ Wähle Bereiche für Export:          ││ // text-xs text-zinc-400
│  │ ┌─────────────────────────────────┐ ││ // Checkboxes grid
│  │ │ [x] settings  [x] watchlist     │ ││ // 2-3 columns
│  │ │ [x] alerts    [x] alertTriggers │ ││
│  │ │ [x] sessions  [x] bookmarks     │ ││
│  │ │ [x] events    [x] journal       │ ││
│  │ └─────────────────────────────────┘ ││
│  │                                     ││
│  │ [Export JSON] [Import JSON (Merge)]││ // Action buttons
│  │                                     ││
│  │ Import erfolgreich: settings, ...   ││ // Success message (if shown)
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│ // Danger Zone
│  │ ⚠️ Danger Zone                      ││ // border-rose-900
│  │                                     ││ // bg-rose-950/30 p-4
│  │ Gezieltes Löschen:                  ││
│  │ [Clear settings][Clear watchlist]  ││ // Grid of buttons
│  │ [Clear alerts][Clear sessions]     ││ // border-rose-900 text-rose-100
│  │ [Clear bookmarks][Clear events]    ││
│  │                                     ││
│  │ [Factory Reset]                     ││ // Prominent button
│  │ Löscht ALLE sparkfined.* Daten!    ││ // Warning text
│  └─────────────────────────────────────┘│
│                                         │
│  [AI Settings...] (scroll down)         │
│  [Telemetry...] (scroll down)           │
│  [PWA Controls...] (scroll down)        │
│                                         │
├─────────────────────────────────────────┤
│  📊 Analyze  │  📝 Journal  │  ⏮️ Replay │
└─────────────────────────────────────────┘
```

**Annotations:**
- **Settings Rows**: Label (left) + Control (right), separated by border-b
- **Toggle**: [ON] / [OFF] button style
- **Dropdown**: Select element with chevron
- **Danger Zone**: Rose color scheme for destructive actions

---

## State 2: AI Configuration

```
┌─────────────────────────────────────────┐
│  [Header: Einstellungen]           [⚙️]  │
├─────────────────────────────────────────┤
│  [Display Settings above...] (scrolled) │
│                                         │
│  ┌─────────────────────────────────────┐│ // AI Settings
│  │ 🤖 AI                               ││ // border-zinc-800 rounded-xl
│  │                                     ││ // bg-zinc-900/40 p-4 text-xs
│  │ Provider   [Anthropic       ⌄]     ││ // Dropdown
│  │ Model      [gpt-4o-mini     ]      ││ // Input (optional override)
│  │                                     ││
│  │ maxOutputTokens  [800      ]       ││ // Number input
│  │ maxCostUsd / Call [0.15    ]       ││ // Number input (step 0.01)
│  │                                     ││
│  │ Server setzt zusätzlich globale    ││ // Info note
│  │ Obergrenze via AI_MAX_COST_USD.    ││ // text-[11px] text-zinc-500
│  │                                     ││
│  │ Keys bleiben serverseitig (.env).  ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│ // AI Token Budget
│  │ 📊 AI Token Budget                  ││
│  │                                     ││
│  │ Used: 12,345 / 1,000,000            ││ // text-xs
│  │                                1.2% ││ // Percentage
│  │                                     ││
│  │ ╔═══╗─────────────────────────────  ││ // Progress bar
│  │ ╚═══╝                               ││ // bg-emerald-500 (green < 70%)
│  │                                     ││
│  │ Active Context: Idea ab12cd34...    ││ // text-[11px] text-zinc-500
│  │                                     ││
│  │ [Reset Counter]                     ││ // Button
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│ // Risk & Playbook Defaults
│  │ 💰 Risk & Playbook Defaults         ││
│  │                                     ││
│  │ Default-Balance  [1000      ]      ││ // Number input
│  │ Default-Preset   [Balanced  ⌄]     ││ // Dropdown
│  │   • Conservative · 1% · ATR×1.5    ││ // Preset descriptions
│  │   • Balanced · 1.5% · ATR×2        ││
│  │   • Aggressive · 2% · ATR×2.5      ││
│  └─────────────────────────────────────┘│
│                                         │
├─────────────────────────────────────────┤
│  📊 Analyze  │  📝 Journal  │  ⏮️ Replay │
└─────────────────────────────────────────┘
```

**Annotations:**
- **Provider Dropdown**: anthropic / openai / xai
- **Model Input**: Optional override (blank = default per provider)
- **Token Budget**: Progress bar with color (green/amber/red)
- **Reset Button**: Resets usage counter (not budget limit)

---

## State 3: Telemetry & Monitoring

```
┌─────────────────────────────────────────┐
│  [Header: Einstellungen]           [⚙️]  │
├─────────────────────────────────────────┤
│  [Sections above...] (scrolled)         │
│                                         │
│  ┌─────────────────────────────────────┐│ // Monitoring & Tokens
│  │ 📈 Monitoring & Tokens              ││
│  │                                     ││
│  │ [x] Enabled                         ││ // Checkboxes (flex grid)
│  │ [x] API Timings                     ││
│  │ [ ] Canvas/FPS                      ││
│  │ [x] User Events                     ││
│  │ [x] Token-Overlay                   ││
│  │                                     ││
│  │ Sampling  [0.50]                    ││ // Slider (0-1, step 0.05)
│  │ ├─────────○──────────┤              ││ // Range input
│  │                                     ││
│  │ [Jetzt senden (3)]                  ││ // Button (buffer count)
│  │ Batch alle 15s & beim Tab-Wechsel  ││ // Info text
│  └─────────────────────────────────────┘│
│                                         │
├─────────────────────────────────────────┤
│  📊 Analyze  │  📝 Journal  │  ⏮️ Replay │
└─────────────────────────────────────────┘
```

**Annotations:**
- **Checkboxes**: Enable/disable telemetry features
- **Sampling Slider**: 0-1 range (0% to 100% sampling rate)
- **Send Button**: Shows buffer count, manual drain trigger

---

## State 4: PWA Controls

```
┌─────────────────────────────────────────┐
│  [Header: Einstellungen]           [⚙️]  │
├─────────────────────────────────────────┤
│  [Sections above...] (scrolled)         │
│                                         │
│  ┌─────────────────────────────────────┐│ // PWA Section
│  │ 📱 PWA                              ││
│  │                                     ││
│  │ [SW-Update anstoßen]               ││ // Buttons
│  │ [Caches leeren]                    ││
│  │                                     ││
│  │ Version: 0.1.0                      ││ // text-[11px] text-zinc-500
│  │ Build: production                   ││
│  │ VAPID pub: set                      ││
│  │                                     ││
│  │ Update angestoßen                   ││ // Status message (if shown)
│  └─────────────────────────────────────┘│
│                                         │
├─────────────────────────────────────────┤
│  📊 Analyze  │  📝 Journal  │  ⏮️ Replay │
└─────────────────────────────────────────┘
```

**Annotations:**
- **SW-Update**: Calls pokeServiceWorker() → sends SKIP_WAITING message
- **Caches leeren**: Clears all caches via clearCaches()
- **Version Info**: Shows app version, build mode, VAPID status

---

## COMPONENT BREAKDOWN

| Component | Event | Action | Animation |
|-----------|-------|--------|-----------|
| Dropdown: Theme | onChange | setSettings({ theme: value }) | instant |
| Toggle: Snap-to-OHLC | onClick | setSettings({ snapDefault: !value }) | toggle |
| Dropdown: Replay Speed | onChange | setSettings({ replaySpeed: value }) | instant |
| Toggle: HUD/Timeline/Minimap | onClick | setSettings({ show*: !value }) | toggle |
| Checkbox: Export Namespaces | onChange | setPick({ [ns]: !value }) | check |
| Button: Export JSON | onClick | exportAppData() → downloadJson() | download |
| Input: File (hidden) | onChange | importAppData(file) | load + merge |
| Button: Import JSON | onClick | fileRef.current.click() | file picker |
| Button: Clear [Namespace] | onClick | confirm() → clearNs(ns) | alert |
| Button: Factory Reset | onClick | confirm() → clearAll() → alert | alert |
| Dropdown: AI Provider | onChange | setAI({ provider: value }) | instant |
| Input: AI Model | onChange | setAI({ model: value }) | instant |
| Input: maxOutputTokens | onChange | setAI({ maxOutputTokens: value }) | instant |
| Input: maxCostUsd | onChange | setAI({ maxCostUsd: value }) | instant |
| Button: Reset Counter | onClick | ctx.reset() | counter reset |
| Input: Default Balance | onChange | setSettings({ defaultBalance: value }) | instant |
| Dropdown: Default Preset | onChange | setSettings({ defaultPlaybookId: value }) | instant |
| Checkbox: Telemetry Flags | onChange | setFlags({ [flag]: value }) | check |
| Slider: Sampling | onChange | setFlags({ sampling: value }) | slide |
| Button: Jetzt senden | onClick | drain() → POST /api/telemetry | batch send |
| Button: SW-Update | onClick | pokeServiceWorker() → alert | message |
| Button: Caches leeren | onClick | clearCaches() → alert | message |

---

## USER FLOWS

### Flow 1: Change Theme
1. User on Settings
2. Clicks Theme dropdown
3. Selects "Dark"
4. Theme updates instantly (useDarkMode hook)

### Flow 2: Export App Data
1. User selects namespaces (checkboxes)
2. Clicks "Export JSON"
3. exportAppData(selected) → JSON blob
4. Download triggered: sparkfined-backup-{date}.json

### Flow 3: Import App Data
1. User clicks "Import JSON (Merge)"
2. File picker opens
3. User selects backup .json
4. importAppData(file, "merge") → merges into localStorage
5. Success message shown

### Flow 4: Factory Reset
1. User clicks "Factory Reset"
2. Confirm dialog: "Alle sparkfined.* Daten werden gelöscht!"
3. User confirms
4. All namespaces cleared
5. Alert: "Alle App-Daten gelöscht. Bitte Seite neu laden."

### Flow 5: Configure AI Provider
1. User changes Provider dropdown to "OpenAI"
2. Optionally overrides model: "gpt-4"
3. Adjusts maxOutputTokens: 1200
4. Settings saved to localStorage instantly

### Flow 6: Manage PWA
1. User clicks "SW-Update anstoßen"
2. pokeServiceWorker() → sends message to SW
3. Alert: "Update angestoßen"
4. SW checks for updates, installs if available

---

## RESPONSIVE BEHAVIOR

### Mobile (<768px)
- Settings rows: Single column
- Checkboxes: 2-3 per row
- Inputs: Full width

### Desktop (>1024px)
- Max-width: 768px (max-w-3xl)
- Checkboxes: 3-4 per row
- Wider inputs

---

## ACCESSIBILITY

- **Labels**: Could add explicit `<label>` (currently inline text)
- **Toggles**: Keyboard accessible (Space/Enter)
- **File Input**: Native picker (accessible)
- **Confirm Dialogs**: Native confirm() (accessible)
- **Color Contrast**: Passes WCAG AA

---

## DATA PERSISTENCE

| Setting | Storage | Sync |
|---------|---------|------|
| **Display Settings** | localStorage (sparkfined.settings.v1) | Instant |
| **AI Config** | localStorage (sparkfined.ai.v1) | Instant |
| **Telemetry Flags** | localStorage (sparkfined.telemetry.v1) | Instant |
| **Export Data** | Download only (not persistent) | One-time |
| **Import Data** | Merges into localStorage | On import |

---

## EDGE CASES

- **Invalid Import JSON**: Error alert
- **Factory Reset**: Requires confirmation
- **Service Worker Unavailable**: Alert "Kein Service Worker gefunden"
- **Caches leeren Fails**: Alert with error
- **Token Budget Exceeded**: Warning indicator (red bar)

---

## FUTURE ENHANCEMENTS

1. **Grouped Settings**: Collapsible sections for cleaner UI
2. **Search**: Search box for settings (if list grows)
3. **Presets**: Save/load setting profiles
4. **Cloud Sync**: Sync settings across devices
5. **Advanced Mode**: Hide complex settings by default

---

**Storybook Variants:** Default, AI Config Expanded, Token Budget High Usage, PWA Update Success, Factory Reset Confirm
