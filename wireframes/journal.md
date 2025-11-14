# Journal – UI Specification

## Purpose

**Goal:** Enable traders to log trades, reflect on decisions, and improve performance through AI-powered insights.

**User Actions:**
- Create new journal entries (manual text or structured trade log)
- View, edit, delete entries
- Filter/search entries by date, tags, token
- Use AI to condense entries into lessons learned
- Tag entries with emotions, strategies, outcomes

---

## Wireframe (Base Structure)

```
[Header]
  - Page Title: "Trading Journal"
  - Search Bar (filter by text, tags, tokens)
  - Filter Chips (All / Wins / Losses / Tags)
  - "New Entry" Button (Primary CTA)

[Main Content]
  [Left Sidebar - 25% width] (Desktop only)
    - Quick Filters
      - Date Range Picker
      - Tag Cloud (clickable tags)
      - Token Filter (dropdown)
    - Stats Summary
      - Total Entries
      - Win/Loss Ratio
      - Most Used Tags

  [Main Area - 75% width]
    [Entry List View]
      - Entry Cards (chronological, newest first)
        Each card:
          - Date/Time
          - Title (auto or manual)
          - Excerpt (first 2-3 lines)
          - Tags (colored chips)
          - Token (if applicable)
          - P&L Badge (if logged)
          - Quick Actions: Edit, Delete, AI Condense

    [Pagination or Infinite Scroll]
      - Load More / Page Numbers
```

---

## Entry Detail/Edit View

```
[Header]
  - Back Button
  - Entry Date/Time
  - Actions: Save, Delete, AI Condense

[Form]
  - Title Input (optional, auto-generated from date if empty)
  - Token Selector (optional)
  - Entry Type: Trade Log / Reflection / Lesson Learned
  - Content Textarea (rich text editor)
  - Trade Details (if Trade Log):
    - Entry Price, Exit Price
    - Position Size
    - P&L (auto-calculated)
  - Tags Input (multi-select or freeform)
  - Emotion Tags (optional: Confident, FOMO, Disciplined, etc.)

[AI Section]
  - "AI Condense" Button
  - AI-Generated Summary (appears after click)
  - "Save to Lessons" Button
```

---

## Components

### JournalEntryCard
- **Type:** Card (Elevated on hover)
- **Description:** Compact view of single journal entry
- **Props:**
  - `entry: { id, date, title, excerpt, tags, token?, pnl? }`
  - `onEdit: (id) => void`
  - `onDelete: (id) => void`
  - `onAICondense: (id) => void`
- **State:** Default, Hover (shows actions)
- **Events:** `onClick` → Navigate to detail view

### JournalEntryForm
- **Type:** Form
- **Description:** Full editor for creating/editing entries
- **Props:**
  - `entry?: JournalEntry` (for edit mode)
  - `onSave: (entry) => void`
  - `onCancel: () => void`
- **State:** Pristine, Dirty (unsaved changes), Saving, Error
- **Events:**
  - `onSave` → Validate + persist to IndexedDB
  - `onAICondense` → Call AI API + display result

### FilterSidebar
- **Type:** Sidebar Panel
- **Description:** Date, tag, token filters + stats
- **Props:**
  - `activeFilters: FilterState`
  - `onFilterChange: (filters) => void`
  - `stats: { totalEntries, winRate, topTags }`
- **State:** Static (controlled by parent)
- **Events:** User clicks filter → Parent updates entry list

### TagInput
- **Type:** Multi-Select Input with Autocomplete
- **Description:** Add/remove tags with suggestions
- **Props:**
  - `selectedTags: Array<string>`
  - `suggestions: Array<string>`
  - `onChange: (tags) => void`
- **State:** Focused, Typing (shows suggestions)
- **Events:** `onTagAdd`, `onTagRemove`

### AICondenseButton
- **Type:** Button (Secondary) with Loading State
- **Description:** Triggers AI to condense entry into key lessons
- **Props:**
  - `entryId: string`
  - `onSuccess: (summary: string) => void`
- **State:** Idle, Loading, Success, Error
- **Events:** `onClick` → Call `/api/ai/condense` → Show result

---

## Layout Variants

### Variant 1 – Classic List + Sidebar (Recommended)

**Layout:**
```
[Header with Search + New Entry]
[Sidebar (25%) | Entry List (75%)]
  Sidebar: Filters + Stats
  List: Cards in single column, infinite scroll
```

**Pros:**
- Familiar blog/note-taking layout
- Filters always visible (easy to switch)
- Stats provide motivational context
- Good for desktop (wide screen utilization)

**Cons:**
- Sidebar hidden on mobile (requires toggle)
- Less space for entry content in list view

**Best For:** Desktop users who filter frequently and want stats visible

---

### Variant 2 – Card Grid (Pinterest-style)

**Layout:**
```
[Header with Search + New Entry]
[Filter Bar (Horizontal) - Chips below header]
[Masonry Grid - 2-3 columns]
  Cards: Variable height based on content
  Each card: Date, Title, Full Content (no excerpt), Tags, Actions
```

**Pros:**
- Visual, scannable layout
- More content visible per card (less clicking)
- Modern, engaging UI
- Works well with rich content (images, charts in future)

**Cons:**
- Harder to scan chronologically (eyes jump around)
- Variable card heights can be disorienting
- Less space-efficient on mobile (single column anyway)

**Best For:** Users with short, visual entries; prefer browsing over searching

---

### Variant 3 – Timeline View

**Layout:**
```
[Header with Search + New Entry]
[Vertical Timeline - Center Line]
  Left Side: Date markers (grouped by day/week)
  Right Side: Entry cards (alternating left/right on desktop)
  Each card: Minimal design, expand on click
  
[Floating Filter Button - Opens modal]
```

**Pros:**
- Strong chronological narrative (story of learning)
- Visually distinctive (differentiates from generic list)
- Encourages reflection on progress over time

**Cons:**
- More vertical scrolling required
- Alternating layout may confuse some users
- Harder to implement filtering without breaking timeline

**Best For:** Users who value journaling as self-improvement journey; fewer entries (<50)

---

## Data & Parameters

### Incoming Data
- **Journal Entries:**
  - `id: string`
  - `userId: string`
  - `createdAt: Date`
  - `updatedAt: Date`
  - `title?: string`
  - `content: string` (markdown or plain text)
  - `tags: Array<string>`
  - `token?: string`
  - `entryType: 'trade' | 'reflection' | 'lesson'`
  - `tradeDetails?: { entryPrice, exitPrice, positionSize, pnl }`
  - `aiSummary?: string` (cached AI condense result)

### Filters/Parameters
- `dateRange: { start: Date, end: Date }`
- `tags: Array<string>` (selected tags)
- `token?: string`
- `entryType?: 'trade' | 'reflection' | 'lesson' | 'all'`
- `searchQuery?: string` (full-text search)

### Important IDs
- `userId` (for scoping entries)
- `entryId` (for CRUD operations)
- `tagId` (for tag management in future)

---

## Interactions & UX Details

### User Flows
1. **Quick Add Entry:** User clicks "New Entry" → Modal/page opens → Types content → Adds tags → Saves → Returns to list
2. **Filter by Tag:** User clicks tag in sidebar → List updates to show only entries with that tag
3. **AI Condense:** User opens entry → Clicks "AI Condense" → Loading spinner (2-3s) → Summary appears → User can save to separate "Lessons" section
4. **Search:** User types "FOMO" in search → Real-time filter shows entries containing "FOMO"

### Empty States
- **No Entries:** "Start your trading journal today" + "Create First Entry" button + Tips: "Reflect on wins and losses to improve"
- **No Results (Filtered):** "No entries match your filters" + "Clear Filters" button
- **No Tags:** "Add tags to organize your entries" (in tag input placeholder)

### Loading States
- **Entry List Loading:** 5-8 skeleton cards
- **AI Condense Loading:** Spinner in button + "Analyzing..." text
- **Saving Entry:** Button disabled + "Saving..." text

### Error States
- **Failed to Load Entries:** Error banner + "Retry" button
- **AI Condense Failed:** Toast notification: "AI service unavailable, try again" + Option to view raw content
- **Delete Confirmation:** Modal: "Delete entry? This cannot be undone." + Cancel/Delete buttons

---

## Mobile Considerations

- **Sidebar:** Convert to bottom sheet or modal (triggered by "Filter" button)
- **Entry Cards:** Full width, reduced padding
- **New Entry:** Full-screen form (not modal)
- **Tags:** Horizontal scroll for tag chips
- **AI Condense:** Sticky button at bottom of entry detail view

---

## Offline Support

- **Create/Edit:** All operations save to IndexedDB immediately
- **AI Condense:** Show "Requires internet connection" message if offline
- **Sync Indicator:** Show "X entries pending sync" banner when offline edits exist

---

## Accessibility

- **Keyboard Navigation:**
  - Tab through entry cards
  - Enter to open entry
  - Delete key (with confirmation) to delete
- **Screen Readers:**
  - Announce entry count: "Showing 12 entries"
  - Tag labels: "Tag: FOMO"
  - P&L values: "+$50 profit" / "-$20 loss"
- **Focus Management:**
  - After deleting entry, focus returns to list
  - After saving, focus on success message

---

## AI Integration Details

### AI Condense Feature
- **Trigger:** User clicks "AI Condense" button
- **Input:** Full entry content (max 5000 chars)
- **API Call:** `POST /api/ai/condense` with `{ entryId, content }`
- **Output:** 2-3 sentence summary + key lessons (max 500 chars)
- **Cache:** Store AI summary with entry (avoid re-calling for same content)

### Cost Management
- **Limit:** Max 1 AI condense per entry per day (prevent spam)
- **Token Estimate:** ~200-300 tokens per request (~$0.01-0.02 per condense)
- **Provider:** OpenAI (gpt-4o-mini) for cost efficiency

---

## Open Questions / Todos

1. **Rich Text Editor:** Simple textarea or full Markdown editor (with preview)? → Recommend: Start with textarea + Markdown support
2. **Image Uploads:** Support screenshot attachments for charts? (Future enhancement)
3. **Export Entries:** Allow export to PDF or CSV? (Low priority, nice-to-have)
4. **Shared Entries:** Enable sharing specific entries with community? (Future social feature)
5. **AI Suggestions:** Proactive AI suggestions (e.g. "Your last 3 entries mention FOMO - here's a tip")? (Advanced AI feature)

---

**Status:** ✅ Ready for implementation  
**Recommended Variant:** Variant 1 (Classic List + Sidebar)  
**Last Updated:** 2025-11-14
