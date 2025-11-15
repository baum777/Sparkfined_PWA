# Journal-Page — Detaillierte Wireframes

> **Seite:** Journal (Trading-Tagebuch)
> **Route:** `/journal`
> **Zweck:** Trading-Einträge dokumentieren, filtern, AI-Condense
> **Priorität:** P0 (Core-Feature, Offline-First)

---

## Inhaltsverzeichnis

1. [Desktop-Layout](#1-desktop-layout)
2. [Sidebar-Filter-Spezifikation](#2-sidebar-filter-spezifikation)
3. [Entry-List-Spezifikation](#3-entry-list-spezifikation)
4. [Entry-Card-Spezifikation](#4-entry-card-spezifikation)
5. [Editor-Modal-Spezifikation](#5-editor-modal-spezifikation)
6. [AI-Condense-Flow](#6-ai-condense-flow)
7. [Mobile-Layout](#7-mobile-layout)
8. [Interaktions-States](#8-interaktions-states)

---

## 1. Desktop-Layout

### 1.1 Gesamt-Layout (≥1024px)

```
┌─────────────────────────────────────────────────────────────────────────┐
│ Header: "Journal" + [+ New Entry] Button                               │
├───────────────┬─────────────────────────────────────────────────────────┤
│               │                                                         │
│  Sidebar      │  Main Content (Entry-List)                             │
│  (280px)      │                                                         │
│               │  ┌───────────────────────────────────────────────────┐  │
│  🔍 Search    │  │ Entry-Card 1 (Most Recent)                        │  │
│  ─────────    │  │ ┌──────────────────────────────────────────────┐ │  │
│               │  │ │ Title: "SOL Long Entry - Breakout Pattern"   │ │  │
│  📅 Filters   │  │ │ Date: 2025-11-15 14:30                       │ │  │
│  ☐ Today      │  │ │ Tags: [Long] [SOL] [Breakout]                │ │  │
│  ☐ This Week  │  │ │ ──────────────────────────────────────────── │ │  │
│  ☐ This Month │  │ │ Content-Preview (2 lines, clamp)             │ │  │
│  ☐ Custom     │  │ │ "Entered SOL at $125.34 after clean..."     │ │  │
│               │  │ │ ──────────────────────────────────────────── │ │  │
│  🏷️ Tags      │  │ │ [AI Condense] [Edit] [Delete]                │ │  │
│  • Long (23)  │  │ └──────────────────────────────────────────────┘ │  │
│  • Short (15) │  └───────────────────────────────────────────────────┘  │
│  • SOL (18)   │                                                         │
│  • BTC (12)   │  ┌───────────────────────────────────────────────────┐  │
│  • Win (20)   │  │ Entry-Card 2                                      │  │
│  • Loss (18)  │  └───────────────────────────────────────────────────┘  │
│  + 12 more    │                                                         │
│               │  ┌───────────────────────────────────────────────────┐  │
│  📊 Stats     │  │ Entry-Card 3                                      │  │
│  Total: 38    │  └───────────────────────────────────────────────────┘  │
│  Win: 20      │                                                         │
│  Loss: 18     │  (Infinite-Scroll or Pagination)                        │
│  Win-Rate:    │                                                         │
│  52.6%        │                                                         │
│               │                                                         │
└───────────────┴─────────────────────────────────────────────────────────┘
```

**Layout-Details:**
- **Sidebar-Width:** 280px (fixed, left-aligned)
- **Main-Content:** flex-1, pl-6 (24px offset from sidebar)
- **Gap:** gap-6 (24px) between sidebar and main
- **Entry-Cards:** Stack vertical, gap-4 (16px)

---

## 2. Sidebar-Filter-Spezifikation

### 2.1 Wireframe

```
┌───────────────────────────┐
│ 🔍 [Search Entries...]    │  ← Input-Field, full-width
├───────────────────────────┤
│                           │  ← 16px gap
│ Filters                   │  ← Section-Header (text-sm, zinc-400)
│ ─────────                 │  ← Divider (1px, zinc-800)
│                           │
│ ☐ Today (3)               │  ← Checkbox + Label + Count
│ ☐ This Week (12)          │
│ ☐ This Month (25)         │
│ ☐ Custom Date Range       │  ← Opens Date-Picker
│                           │
├───────────────────────────┤  ← 24px gap
│ Tags                      │  ← Section-Header
│ ─────────                 │
│                           │
│ • Long (23)               │  ← Tag-Item: Dot + Label + Count
│ • Short (15)              │    Click to toggle filter
│ • SOL (18)                │    Active: emerald-500 dot + text
│ • BTC (12)                │    Inactive: zinc-500 dot + text
│ • ETH (8)                 │
│ • Win (20)                │
│ • Loss (18)               │
│ • Breakout (5)            │
│ [+ 12 more]               │  ← Expandable (Accordion)
│                           │
├───────────────────────────┤  ← 24px gap
│ Statistics                │  ← Section-Header
│ ─────────                 │
│                           │
│ Total Entries: 38         │  ← text-sm, zinc-400
│ Wins: 20                  │    text-emerald-500 (green)
│ Losses: 18                │    text-rose-500 (red)
│ ──────────────────        │  ← Thin divider
│ Win Rate: 52.6%           │  ← text-base, font-semibold
│                           │    Dynamic color (>50% = green)
│                           │
│ Avg. R/R: 2.3             │  ← Risk-Reward-Ratio
│ Best Day: +$4,230         │
│ Worst Day: -$1,850        │
│                           │
└───────────────────────────┘
```

### 2.2 Search-Input-Spezifikation

```
┌───────────────────────────────┐
│ 🔍  Search entries...         │  ← Placeholder-Text (zinc-500)
└───────────────────────────────┘
```

**Maße & Styling:**
- **Width:** w-full (100% of sidebar)
- **Height:** h-10 (40px)
- **Padding:** pl-10 pr-4 (Icon-Inset: 40px left, 16px right)
- **Background:** bg-zinc-900, border border-zinc-800
- **Border-Radius:** rounded-md (8px)
- **Focus:** ring-2 ring-emerald-500, border-emerald-500
- **Icon:** 20×20px, absolute left-3, text-zinc-500

**Funktion:**
- Suche nach Title, Content, Tags
- Debounced (300ms)
- Clear-Button (X) wenn Input nicht leer

### 2.3 Filter-Checkbox-Spezifikation

```
☐ This Week (12)
```

**Maße & Styling:**
- **Checkbox-Size:** 18×18px
- **Gap:** gap-2 (8px) zwischen Checkbox und Label
- **Label:** text-sm (14px), text-zinc-300
- **Count:** text-xs (12px), text-zinc-500, ml-auto
- **Hover:** bg-zinc-850 (full row)
- **Active:** Checkbox: emerald-500, Label: text-emerald-500

**Checkbox-States:**
- **Unchecked:** border-zinc-700, bg-transparent
- **Checked:** bg-emerald-500, border-emerald-500, checkmark (white)

### 2.4 Tag-Item-Spezifikation

```
• SOL (18)
```

**Maße & Styling:**
- **Dot-Size:** 8×8px, rounded-full
- **Gap:** gap-2 (8px) zwischen Dot und Label
- **Label:** text-sm (14px), font-medium (500)
- **Count:** text-xs (12px), text-zinc-500, ml-auto
- **Hover:** bg-zinc-850 (full row), cursor-pointer

**States:**
- **Inactive:** Dot: bg-zinc-600, Label: text-zinc-400
- **Active:** Dot: bg-emerald-500, Label: text-emerald-500, font-semibold (600)

**Multi-Select:**
- Klick toggles Tag-Filter
- Multiple Tags = AND-Filter (zeige nur Entries mit allen Tags)

### 2.5 Statistics-Section

**Text-Hierarchie:**
- **Section-Header:** text-sm (14px), font-medium (500), text-zinc-400, uppercase
- **Stat-Label:** text-sm (14px), text-zinc-400
- **Stat-Value:** text-sm (14px), font-semibold (600), dynamic color
  - Wins: text-emerald-500
  - Losses: text-rose-500
  - Win-Rate: emerald-500 if >50%, rose-500 if <50%, zinc-300 if =50%
- **Win-Rate:** text-base (16px), font-bold (700), standout

---

## 3. Entry-List-Spezifikation

### 3.1 Layout

```
┌─────────────────────────────────────────────────┐
│ Entry-Card 1 (Most Recent)                      │
├─────────────────────────────────────────────────┤
│ Entry-Card 2                                    │
├─────────────────────────────────────────────────┤
│ Entry-Card 3                                    │
├─────────────────────────────────────────────────┤
│ Entry-Card 4                                    │
├─────────────────────────────────────────────────┤
│ (Infinite-Scroll)                               │
│ [Loading Spinner...]                            │
└─────────────────────────────────────────────────┘
```

**Layout-Details:**
- **Container:** flex flex-col gap-4 (16px gap)
- **Sorting:** Neueste zuerst (createdAt DESC)
- **Pagination:** Infinite-Scroll (load 20 items at a time)
- **Empty-State:** "No entries found" + CTA "Create First Entry"

### 3.2 Empty-State

```
┌─────────────────────────────────────────┐
│                                         │
│            [📝 Icon]                    │
│                                         │
│        No Journal Entries               │
│                                         │
│   Start documenting your trades to      │
│   build consistency and improve your    │
│   trading edge.                         │
│                                         │
│      [+ Create First Entry]             │
│                                         │
└─────────────────────────────────────────┘
```

**Styling:**
- **Container:** flex flex-col items-center justify-center, p-12
- **Icon:** 96×96px, text-zinc-600
- **Title:** text-xl (20px), font-semibold (600), text-zinc-300, mb-3
- **Description:** text-sm (14px), text-zinc-500, max-w-md, text-center, mb-6
- **Button:** Primary-Variant, px-6 py-3

---

## 4. Entry-Card-Spezifikation

### 4.1 Wireframe

```
┌───────────────────────────────────────────────────────────────┐
│ Header-Row (flex justify-between items-start)                │
│ ┌─────────────────────────────────────┬─────────────────────┐ │
│ │ Title (text-lg, font-semibold)      │ Date (text-sm)      │ │
│ │ "SOL Long Entry - Breakout Pattern" │ Nov 15, 14:30       │ │
│ └─────────────────────────────────────┴─────────────────────┘ │
├───────────────────────────────────────────────────────────────┤
│ Tags-Row (flex gap-2, mt-2)                                   │
│ [Long] [SOL] [Breakout] [Win]                                 │
├───────────────────────────────────────────────────────────────┤
│ Content-Preview (text-sm, line-clamp-2, mt-3)                 │
│ "Entered SOL at $125.34 after clean breakout above resistance │
│  zone. Volume spike confirmed momentum..."                    │
├───────────────────────────────────────────────────────────────┤
│ Metadata-Row (flex gap-4, text-xs, mt-3)                      │
│ Entry: $125.34  •  Exit: $132.50  •  P&L: +$720 (+5.7%)       │
├───────────────────────────────────────────────────────────────┤
│ Action-Row (flex gap-2, mt-4)                                 │
│ [✨ AI Condense] [✏️ Edit] [🗑️ Delete]                        │
└───────────────────────────────────────────────────────────────┘
```

### 4.2 Maße & Styling

**Container:**
- **Padding:** p-5 (20px all sides)
- **Background:** bg-zinc-900, border border-zinc-800
- **Border-Radius:** rounded-lg (12px)
- **Hover:** border-zinc-700, shadow-card-subtle
- **Cursor:** cursor-pointer (full card clickable → opens detail-view)

**Header-Row:**
- **Title:** text-lg (18px), font-semibold (600), text-zinc-100
  - Line-Clamp: 1 (single-line, ellipsis)
- **Date:** text-sm (14px), text-zinc-500
  - Format: "Nov 15, 14:30" (MMM DD, HH:mm)

**Tags-Row:**
- **Tag-Badge:** px-2.5 py-1, rounded-md (8px), text-xs (12px), font-medium (500)
- **Background:** Dynamic per Tag-Type:
  - Long: bg-emerald-500/10, text-emerald-500
  - Short: bg-rose-500/10, text-rose-500
  - Win: bg-emerald-500/20, text-emerald-400
  - Loss: bg-rose-500/20, text-rose-400
  - Token (SOL, BTC): bg-cyan-500/10, text-cyan-400
  - Strategy (Breakout): bg-zinc-700, text-zinc-300

**Content-Preview:**
- **Text:** text-sm (14px), text-zinc-400
- **Line-Clamp:** 2 (max 2 lines, ellipsis)
- **Margin-Top:** mt-3 (12px)

**Metadata-Row:**
- **Text:** text-xs (12px), text-zinc-500
- **Separator:** " • " (bullet, zinc-600)
- **P&L-Color:** Dynamic:
  - Positive: text-emerald-500
  - Negative: text-rose-500
  - Neutral: text-zinc-400

**Action-Row:**
- **Buttons:** Secondary-Variant, size-sm
  - **AI-Condense:** Primary-Variant (emerald), icon + text
  - **Edit:** Secondary-Variant (zinc), icon + text
  - **Delete:** Ghost-Variant (transparent), icon + text (rose on hover)
- **Gap:** gap-2 (8px)

### 4.3 Card-States

**Default:**
- Border: border-zinc-800
- Background: bg-zinc-900

**Hover:**
- Border: border-zinc-700
- Shadow: shadow-card-subtle
- Transform: translateY(-2px), transition 150ms

**Active (Clicked):**
- Border: border-emerald-500/50
- Shadow: shadow-emerald-glow

---

## 5. Editor-Modal-Spezifikation

### 5.1 Wireframe (Modal-Overlay)

```
┌─────────────────────────────────────────────────────────────────┐
│ Backdrop (bg-black/70, backdrop-blur-sm)                        │
│                                                                 │
│   ┌───────────────────────────────────────────────────────┐     │
│   │ Modal-Header (flex justify-between, p-6)             │     │
│   │ ┌─────────────────────────────────────────────────┐   │     │
│   │ │ [New Entry] | [Edit Entry]               [X]    │   │     │
│   │ └─────────────────────────────────────────────────┘   │     │
│   ├───────────────────────────────────────────────────────┤     │
│   │ Modal-Body (p-6, max-h-screen-80%, overflow-y-auto)  │     │
│   │                                                       │     │
│   │ Title:                                                │     │
│   │ ┌───────────────────────────────────────────────┐     │     │
│   │ │ [Entry title...]                              │     │     │
│   │ └───────────────────────────────────────────────┘     │     │
│   │                                                       │     │
│   │ Tags:                                                 │     │
│   │ ┌───────────────────────────────────────────────┐     │     │
│   │ │ [Long] [SOL] + Add Tag                        │     │     │
│   │ └───────────────────────────────────────────────┘     │     │
│   │                                                       │     │
│   │ Content:                                              │     │
│   │ ┌───────────────────────────────────────────────┐     │     │
│   │ │ [Markdown-Textarea]                           │     │     │
│   │ │                                               │     │     │
│   │ │ Min-Height: 300px                             │     │     │
│   │ │ Supports: Bold, Italic, Lists, Links          │     │     │
│   │ │                                               │     │     │
│   │ └───────────────────────────────────────────────┘     │     │
│   │                                                       │     │
│   │ Trade-Metrics (Optional):                             │     │
│   │ ┌──────────┬──────────┬──────────┬──────────┐         │     │
│   │ │ Entry    │ Exit     │ Size     │ P&L      │         │     │
│   │ │ $125.34  │ $132.50  │ 100 SOL  │ +$720    │         │     │
│   │ └──────────┴──────────┴──────────┴──────────┘         │     │
│   │                                                       │     │
│   ├───────────────────────────────────────────────────────┤     │
│   │ Modal-Footer (flex justify-end gap-3, p-6)           │     │
│   │ [Cancel] [Save Entry]                                │     │
│   └───────────────────────────────────────────────────────┘     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2 Maße & Styling

**Modal-Container:**
- **Width:** max-w-2xl (672px)
- **Max-Height:** max-h-[80vh] (80% viewport height)
- **Background:** bg-zinc-900, border border-zinc-800
- **Border-Radius:** rounded-xl (16px)
- **Shadow:** shadow-2xl
- **Animation:** scale-in (150ms)

**Modal-Header:**
- **Padding:** p-6 (24px)
- **Border-Bottom:** border-b border-zinc-800
- **Title:** text-xl (20px), font-semibold (600), text-zinc-100
- **Close-Button:** w-8 h-8, text-zinc-500, hover:text-zinc-300, hover:bg-zinc-800

**Modal-Body:**
- **Padding:** p-6 (24px)
- **Overflow:** overflow-y-auto (scrollable if content too long)
- **Gap:** gap-5 (20px) between form-fields

**Form-Fields:**

**Title-Input:**
- **Label:** text-sm (14px), font-medium (500), text-zinc-300, mb-2
- **Input:** w-full, h-11 (44px), px-4, bg-zinc-800, border border-zinc-700
- **Focus:** ring-2 ring-emerald-500, border-emerald-500
- **Placeholder:** "Enter title for this trade..."

**Tags-Input:**
- **Container:** flex flex-wrap gap-2
- **Tag-Badge:** Same as Entry-Card (px-2.5 py-1, with [X] remove button)
- **Add-Tag-Input:** Inline-Input (auto-complete dropdown)

**Content-Textarea:**
- **Min-Height:** min-h-[300px]
- **Padding:** p-4
- **Background:** bg-zinc-800, border border-zinc-700
- **Font:** font-mono, text-sm (14px)
- **Placeholder:** "Document your trade setup, execution, and learnings..."

**Trade-Metrics (Optional-Grid):**
- **Grid:** grid grid-cols-4 gap-4
- **Label:** text-xs (12px), text-zinc-500, mb-1
- **Input:** h-10 (40px), text-center, font-mono

**Modal-Footer:**
- **Padding:** p-6 (24px)
- **Border-Top:** border-t border-zinc-800
- **Buttons:**
  - **Cancel:** Secondary-Variant, px-6 py-2.5
  - **Save:** Primary-Variant (emerald), px-6 py-2.5

### 5.3 Keyboard-Shortcuts

- **Cmd/Ctrl + S:** Save Entry
- **Cmd/Ctrl + Enter:** Save & Close
- **Escape:** Close Modal (with confirmation if unsaved changes)

---

## 6. AI-Condense-Flow

### 6.1 User-Flow

```
1. User clicks [✨ AI Condense] on Entry-Card
   ↓
2. Modal opens with Entry-Content (read-only)
   ┌─────────────────────────────────────┐
   │ AI Condense: "SOL Long Entry..."    │
   │ ──────────────────────────────────  │
   │ Original Content (read-only):       │
   │ [Long text content...]              │
   │ ──────────────────────────────────  │
   │ [Generate AI Summary] [Cancel]      │
   └─────────────────────────────────────┘
   ↓
3. User clicks [Generate AI Summary]
   ↓
4. Loading-State (Spinner on button)
   ↓
5. AI-Response received
   ┌─────────────────────────────────────┐
   │ AI Summary:                         │
   │ "Entered SOL long at $125.34 on     │
   │  breakout confirmation. Exit at     │
   │  $132.50 for +5.7% gain. Key        │
   │  takeaway: Volume spike validated   │
   │  momentum."                         │
   │ ──────────────────────────────────  │
   │ [Append to Entry] [Replace Entry]   │
   │ [Regenerate] [Cancel]               │
   └─────────────────────────────────────┘
   ↓
6. User chooses action:
   - Append: Adds summary to end of entry
   - Replace: Replaces full entry with summary
   - Regenerate: Calls AI again
   - Cancel: Closes modal
```

### 6.2 AI-Condense-Modal

**Maße & Styling:**
- **Width:** max-w-xl (576px)
- **Structure:** Same as Editor-Modal
- **Original-Content:** Scrollable, max-h-60 (240px), bg-zinc-800, p-4, rounded-md, text-sm
- **AI-Summary:** bg-emerald-500/10, border border-emerald-500/30, p-4, rounded-md, text-sm

**Loading-State:**
- **Button:** Disabled, with Spinner-Icon (animate-spin)
- **Text:** "Generating summary..." (text-zinc-500)

**Error-State:**
- **Banner:** bg-rose-500/10, border border-rose-500/30, p-3, rounded-md
- **Text:** "AI summarization failed. Please try again." (text-rose-400)
- **Retry-Button:** [Retry] (secondary-variant)

---

## 7. Mobile-Layout

### 7.1 Mobile-Wireframe (<768px)

```
┌─────────────────────────────┐
│ Header: "Journal"           │
│ [+ New Entry]               │
├─────────────────────────────┤
│ 🔍 [Search...]              │  ← Full-width search
│ [Filters ▼] [Tags ▼]        │  ← Collapsed Accordions
├─────────────────────────────┤
│ Entry-Card 1 (Compact)      │
│ ┌─────────────────────────┐ │
│ │ Title (1-line clamp)    │ │
│ │ Nov 15, 14:30           │ │
│ │ [Long] [SOL] [Win]      │ │
│ │ Preview (1-line)        │ │
│ └─────────────────────────┘ │
├─────────────────────────────┤
│ Entry-Card 2                │
├─────────────────────────────┤
│ Entry-Card 3                │
├─────────────────────────────┤
│ (Infinite-Scroll)           │
└─────────────────────────────┘
```

**Responsive-Changes:**
- **Sidebar:** Hidden, replaced by Accordion-Filters
- **Search:** Full-width, mb-3
- **Filters/Tags:** Collapsible Buttons (opens Bottom-Sheet)
- **Entry-Card:** Compact-Variant (reduced padding, 1-line preview)
- **Action-Buttons:** Hidden, swipe-left to reveal actions

### 7.2 Filter-Bottom-Sheet (Mobile)

```
┌─────────────────────────────┐
│ Filters                 [X] │  ← Sheet-Header
├─────────────────────────────┤
│ ☐ Today (3)                 │
│ ☐ This Week (12)            │
│ ☐ This Month (25)           │
│ ─────────────────────────   │
│ Tags:                       │
│ ☐ Long (23)                 │
│ ☐ Short (15)                │
│ ☐ SOL (18)                  │
│ ... (scrollable)            │
│ ─────────────────────────   │
│ [Clear All] [Apply]         │
└─────────────────────────────┘
```

**Bottom-Sheet-Specs:**
- **Height:** max-h-[70vh] (70% viewport height)
- **Animation:** slide-up (250ms)
- **Backdrop:** bg-black/50, backdrop-blur-sm
- **Scrollable-Body:** overflow-y-auto

---

## 8. Interaktions-States

### 8.1 Entry-Card-Hover-Interactions

**Desktop:**
- **Hover:** Border-color brightens (zinc-700), shadow appears, translateY(-2px)
- **Click (full-card):** Opens Entry-Detail-View (Modal or Dedicated-Page)
- **Action-Buttons:** Stop-propagation (don't trigger card-click)

**Mobile:**
- **Tap:** Opens Entry-Detail-View
- **Swipe-Left:** Reveals Action-Buttons (Edit, Delete)
- **Swipe-Right:** (Future: Archive)

### 8.2 Editor-Modal-Interactions

**Open:**
- **Trigger:** [+ New Entry] Button, or [Edit] on Entry-Card
- **Animation:** scale-in (150ms), backdrop-fade-in
- **Focus:** Auto-focus Title-Input

**Close:**
- **Trigger:** [X] Button, [Cancel] Button, Escape-Key, Backdrop-Click
- **Confirmation:** If unsaved changes: "Discard changes?" modal
- **Animation:** scale-out (150ms), backdrop-fade-out

**Save:**
- **Trigger:** [Save Entry] Button, Cmd/Ctrl+S
- **Validation:** Title required (min 3 chars), Content optional
- **Loading:** Button shows spinner, disabled
- **Success:** Close modal, show toast "Entry saved", refresh entry-list
- **Error:** Show error-banner, keep modal open

### 8.3 Tag-Interactions

**Add-Tag:**
- **Input:** Type tag-name, auto-complete from existing tags
- **Enter-Key:** Adds tag to entry
- **Click-Suggestion:** Adds tag from dropdown

**Remove-Tag:**
- **Click [X]:** Removes tag from entry
- **No-Confirmation:** Immediate removal

**Filter-by-Tag (Sidebar):**
- **Click-Tag:** Toggles filter (multi-select)
- **Active-Visual:** Emerald-dot, emerald-text, font-semibold
- **Logic:** AND-filter (show entries with all selected tags)

---

## 9. Component-Mapping

### 9.1 Existierende Components

- **JournalPageV2.tsx:** Page-Container
- **JournalEditor.tsx:** Editor-Modal
- **JournalList.tsx:** Entry-List-Container
- **JournalStats.tsx:** Sidebar-Stats-Section
- **JournalBadge.tsx:** Tag-Badge
- **Input.tsx:** Search-Input, Title-Input
- **Textarea.tsx:** Content-Textarea
- **Button.tsx:** Action-Buttons
- **Modal.tsx:** Modal-Wrapper
- **EmptyState.tsx:** No-Entries-State

### 9.2 Missing/TODO

- **Tag-Auto-Complete:** Dropdown for tag-suggestions
- **Bottom-Sheet:** Mobile-Filter-Sheet
- **Swipe-Actions:** Mobile-Swipe-to-Delete
- **Entry-Detail-View:** Dedicated-Page or Modal for full-entry-view
- **AI-Condense-Modal:** Separate modal for AI-workflow

---

**Status:** ✅ Wireframe-Spezifikation komplett
**Nächste-Schritte:** Chart-Page-Wireframes
