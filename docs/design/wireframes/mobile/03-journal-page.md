# Journal Page — Mobile Wireframe (375px)

**Screen:** JournalPage (`/journal`)  
**TL;DR:** Note-taking with AI compression, server sync, and markdown export

---

## State 1: Empty Draft

```
┌─────────────────────────────────────────┐
│  [Header: Journal]                 [⚙️]  │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐│ // Search + Tag filters + New button
│  │ [Search…] [#tag] [Neu]             ││ // flex justify-between gap-2
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│ // Draft Editor (JournalEditor)
│  │ 📝 Neuer Eintrag                    ││ // border-zinc-800 bg-zinc-900/40
│  │                                     ││ // rounded-xl p-4
│  │ [Title]                             ││
│  │ ┌───────────────────────────────┐   ││ // Input: title
│  │ │ placeholder: "Titel..."       │   ││ // border-zinc-700 bg-zinc-900
│  │ └───────────────────────────────┘   ││ // px-2 py-1 text-sm rounded
│  │                                     ││
│  │ [Body]                              ││
│  │ ┌───────────────────────────────┐   ││ // Textarea: body
│  │ │ placeholder: "Notiz (MD)..."  │   ││ // min-h-32, resize-vertical
│  │ │                               │   ││
│  │ │                               │   ││
│  │ └───────────────────────────────┘   ││
│  │                                     ││
│  │ [Optional: Address, TF, RuleId]    ││ // Collapsible metadata fields
│  │                                     ││
│  │ [Auf Server speichern]             ││ // Primary button
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│ // AI Assist Panel
│  │ 🤖 AI-Assist: Notiz straffen        ││ // border-emerald-900
│  │                                     ││ // bg-emerald-950/20 p-3 rounded-xl
│  │ [Verdichten]                        ││ // Button
│  │                                     ││
│  │ Lass dir prägnante Bullet-Notizen  ││ // Placeholder text
│  │ aus deinem Entwurf vorschlagen.    ││ // text-emerald-300/70 text-xs
│  │                                     ││
│  │ [AI-Analyse anhängen & speichern]  ││ // Disabled until AI result
│  │ [Server-Notizen laden]             ││
│  │ [Exportieren]                      ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│ // Server Notes Section (empty)
│  │ 📄 Server-Notizen                   ││
│  │                                     ││
│  │ (Keine Notizen geladen)            ││ // Empty state
│  │                                     ││
│  │ Klicke "Server-Notizen laden"      ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│ // Local Notes (IndexedDB)
│  │ 💾 Lokale Notizen                   ││
│  │                                     ││
│  │ (Keine lokalen Notizen)            ││
│  │                                     ││
│  └─────────────────────────────────────┘│
│                                         │
├─────────────────────────────────────────┤
│  📊 Analyze  │  📝 Journal  │  ⏮️ Replay │ // Active: Journal
└─────────────────────────────────────────┘
```

**Annotations:**
- **Editor**: Simple form (title + body textarea)
- **AI Panel**: Initially empty, fills after AI call
- **Server Notes**: Loaded on demand (not auto-loaded)
- **Local Notes**: Auto-loaded from IndexedDB (useJournal hook)

---

## State 2: Draft Pre-filled from Chart

```
┌─────────────────────────────────────────┐
│  [Header: Journal]                 [⚙️]  │
├─────────────────────────────────────────┤
│  [Search…] [#tag] [Neu]                 │
│                                         │
│  ┌─────────────────────────────────────┐│ // Draft Editor (pre-filled)
│  │ 📝 Eintrag bearbeiten               ││
│  │                                     ││
│  │ [Title]                             ││
│  │ ┌───────────────────────────────┐   ││
│  │ │ Chart Snapshot                │   ││ // Auto-filled from event
│  │ └───────────────────────────────┘   ││
│  │                                     ││
│  │ [Body]                              ││
│  │ ┌───────────────────────────────┐   ││
│  │ │ # Analysis 7xKF...abc         │   ││ // Body with context
│  │ │ TF: 15m                       │   ││ // Address + TF from Chart
│  │ │                               │   ││
│  │ │ [Screenshot Data URL hidden]  │   ││ // screenshotDataUrl in state
│  │ │                               │   ││
│  │ │ Permalink: /chart?chart=...   │   ││ // Permalink included
│  │ └───────────────────────────────┘   ││
│  │                                     ││
│  │ 💡 Entwurf aus Chart erhalten      ││ // Info note
│  │                                     ││
│  │ [Auf Server speichern]             ││
│  └─────────────────────────────────────┘│
│                                         │
│  [AI Assist + Server Notes...]          │
│                                         │
├─────────────────────────────────────────┤
│  📊 Analyze  │  📝 Journal  │  ⏮️ Replay │
└─────────────────────────────────────────┘
```

**Annotations:**
- **Event Listener**: `journal:draft` event from Chart triggers draft population
- **Screenshot**: dataUrl stored in draft but not shown (could be rendered as img)
- **Permalink**: Clickable link to return to Chart state

---

## State 3: AI Compression Result

```
┌─────────────────────────────────────────┐
│  [Header: Journal]                 [⚙️]  │
├─────────────────────────────────────────┤
│  [Draft Editor - collapsed for space]   │
│                                         │
│  ┌─────────────────────────────────────┐│ // AI Panel (with result)
│  │ 🤖 AI-Assist: Notiz straffen        ││
│  │                                     ││
│  │ [Verdichten]                        ││
│  │                                     ││
│  │ ┌─────────────────────────────────┐ ││ // AI Result Box
│  │ │ • Kontext: 7xKF...abc · 15m     │ ││ // border-emerald-800/60
│  │ │ • Beobachtung: Bullish momentum │ ││ // bg-black/30 p-3 rounded
│  │ │ • Hypothese: Breakout @ 0.0048  │ ││ // text-emerald-100 text-xs
│  │ │ • Plan: Monitor SMA20 support   │ ││ // whitespace-pre-wrap
│  │ │ • Risiko: Rejection below 0.0045│ ││
│  │ │ • Nächste Aktion: Set alert     │ ││
│  │ └─────────────────────────────────┘ ││
│  │                                     ││
│  │ Provider: openai · gpt-4o-mini      ││ // text-xs text-zinc-500
│  │ 189 ms · ~$0.0008                   ││
│  │                                     ││
│  │ [AI-Analyse an Notiz anhängen]     ││ // Primary CTA (enabled)
│  │ [Server-Notizen laden]             ││
│  │ [Exportieren]                      ││
│  └─────────────────────────────────────┘│
│                                         │
├─────────────────────────────────────────┤
│  📊 Analyze  │  📝 Journal  │  ⏮️ Replay │
└─────────────────────────────────────────┘
```

**Annotations:**
- **AI Result**: Compressed bullet points from draft body
- **Attach Button**: Appends AI text to body + saves to server
- **Cost Info**: Shows provider, model, latency, cost

---

## State 4: Server Notes Loaded

```
┌─────────────────────────────────────────┐
│  [Header: Journal]                 [⚙️]  │
├─────────────────────────────────────────┤
│  [Draft Editor + AI Panel above...]     │
│                                         │
│  ┌─────────────────────────────────────┐│ // Server Notes Grid
│  │ 📄 Server-Notizen                   ││
│  │                                     ││
│  │ ┌─────────────────────────────────┐ ││ // Note Card 1
│  │ │ Chart Analysis                  │ ││ // border-zinc-800 bg-black/30
│  │ │ 2025-11-02 14:32               │ ││ // p-2 rounded text-xs
│  │ │                                 │ ││
│  │ │ 7xKF...abc · 15m · rule:ab12... │ ││ // Metadata line
│  │ │                                 │ ││
│  │ │ • Kontext: Bullish momentum...  │ ││ // Body preview (line-clamp-4)
│  │ │ • Beobachtung: SMA20 support... │ ││
│  │ │ • Plan: Monitor...              │ ││
│  │ │ ...                             │ ││
│  │ │                                 │ ││
│  │ │ [In Editor laden] [Löschen]    │ ││ // Action buttons
│  │ └─────────────────────────────────┘ ││
│  │                                     ││
│  │ ┌─────────────────────────────────┐ ││ // Note Card 2
│  │ │ Trade Idea: SOL/USDT            │ ││
│  │ │ 2025-11-01 09:15               │ ││
│  │ │ ...                             │ ││
│  │ │ [In Editor laden] [Löschen]    │ ││
│  │ └─────────────────────────────────┘ ││
│  │                                     ││
│  │ (2 Notizen geladen)                ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│ // Local Notes (if any)
│  │ 💾 Lokale Notizen                   ││
│  │ [List similar to server notes]     ││
│  └─────────────────────────────────────┘│
│                                         │
├─────────────────────────────────────────┤
│  📊 Analyze  │  📝 Journal  │  ⏮️ Replay │
└─────────────────────────────────────────┘
```

**Annotations:**
- **Grid Layout**: Single column on mobile, 2 columns on desktop (`md:grid-cols-2`)
- **Card Preview**: Body text truncated to 4 lines (`line-clamp-4`)
- **Load Button**: Populates draft editor with note data for editing
- **Delete**: Confirmation prompt before deletion

---

## State 5: Export Dialog

```
┌─────────────────────────────────────────┐
│  [Header: Journal]                 [⚙️]  │
├─────────────────────────────────────────┤
│  [AI Panel with "Exportieren" clicked]  │
│                                         │
│  ┌─────────────────────────────────────┐│ // Modal/Prompt (browser)
│  │ 🗂️ Exportformat wählen              ││ // JavaScript prompt()
│  │                                     ││
│  │ json oder md?                       ││
│  │                                     ││
│  │ [Input: json]                       ││ // User types format
│  │                                     ││
│  │ [OK] [Abbrechen]                    ││
│  └─────────────────────────────────────┘│
│                                         │
│  → GET /api/journal/export?fmt=json     │ // API call after prompt
│  → Downloads: journal-export.json       │ // File download triggered
│                                         │
├─────────────────────────────────────────┤
│  📊 Analyze  │  📝 Journal  │  ⏮️ Replay │
└─────────────────────────────────────────┘
```

**Annotations:**
- **Export**: Browser prompt() for format selection (json or md)
- **Download**: Blob created on server, downloaded via anchor click
- **Formats**:
  - JSON: Array of note objects
  - MD: Markdown-formatted document (# Title, ## Date, Body...)

---

## COMPONENT BREAKDOWN

| Component | Event | Action | Animation |
|-----------|-------|--------|-----------|
| Input: Title | onChange | setDraft({ title: value }) | none |
| Textarea: Body | onChange | setDraft({ body: value }) | none |
| Input: Search | onChange | setSearch(value) | filters notes |
| Input: Tag | onChange | setTag(value) | filters notes |
| Button: Neu | onClick | setDraft({}) → reset form | none |
| Button: Speichern | onClick | saveServer() → POST /api/journal | loading state |
| Button: Verdichten | onClick | runAIOnDraft() → POST /api/ai/assist | loading text |
| Button: AI Anhängen | onClick | attachAI() → saves with AI text | alert |
| Button: Server Laden | onClick | loadServer() → GET /api/journal | loading state |
| Button: Exportieren | onClick | prompt() → GET /api/journal/export | download |
| Button: In Editor laden | onClick | setDraft(note) → populate form | scroll to top |
| Button: Löschen | onClick | confirm() → delServer(id) → POST /api/journal | confirm dialog |
| Note Card | onClick (optional) | Could open detail modal (not impl) | none |

---

## USER FLOWS (Key Scenarios)

### Scenario 1: Quick Chart Snapshot
1. User on Chart page, draws analysis
2. Clicks "→ Journal (Snapshot)"
3. Chart exports PNG + broadcasts `journal:draft` event
4. User switches to Journal tab
5. Draft pre-filled with screenshot + permalink
6. User clicks "Speichern" → saved to server
7. Note appears in server notes list

### Scenario 2: AI-Assisted Note Compression
1. User writes long-form note in body
2. Clicks "Verdichten"
3. AI processes note → returns 4-6 bullet points
4. User reviews AI output
5. Clicks "AI-Analyse anhängen & speichern"
6. AI text appended to body → saved to server

### Scenario 3: Review & Edit Server Notes
1. User clicks "Server-Notizen laden"
2. Grid populates with cards
3. User clicks "In Editor laden" on note
4. Draft editor fills with note data
5. User edits body
6. Clicks "Speichern" → updates server note (via id)

---

## RESPONSIVE BEHAVIOR

### Mobile (<768px)
- Editor: Full width
- Note Cards: 1 column
- Buttons: Flex-wrap, may stack

### Desktop (>1024px)
- Max-width: 1152px (max-w-6xl)
- Note Cards: 2 columns (`md:grid-cols-2`)
- Editor: Wider textarea

---

## ACCESSIBILITY

- **Labels**: Could add explicit `<label>` for title/body (currently placeholder-only)
- **Textarea Resize**: Vertical resize enabled
- **Keyboard Nav**: Tab through form fields
- **Color Contrast**: Passes WCAG AA on dark theme

---

## DATA PERSISTENCE

| Data | Storage | Sync |
|------|---------|------|
| **Draft State** | React state (ephemeral) | Lost on unmount |
| **Local Notes** | IndexedDB (Dexie) | Persistent, no sync |
| **Server Notes** | Server DB (inferred) | Manual sync via button |

**LocalStorage Keys:**
- None for Journal (uses IndexedDB for local, server API for remote)

---

## EDGE CASES

- **No title**: Saved as "(ohne Titel)" on server
- **Empty body**: Allowed but shows as blank in preview
- **AI error**: Error message in AI panel (not implemented in code, falls back to no result)
- **Server error**: Alert with error message
- **Offline**: Server sync fails, local notes still work (IndexedDB)

---

**Storybook Variants:** Empty Draft, Pre-filled from Chart, AI Result, Server Notes Loaded, Export Dialog
