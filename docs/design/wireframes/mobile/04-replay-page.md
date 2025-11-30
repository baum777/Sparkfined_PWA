# Replay Page — Mobile Wireframe (375px)

**Screen:** ReplayPage (`/replay`)  
**TL;DR:** View recorded user sessions with event timeline (proof-of-concept preview mode)

---

## State 1: Empty (No Sessions)

```
┌─────────────────────────────────────────┐
│  [Header: Session Replay]          [⚙️]  │
├─────────────────────────────────────────┤
│                                         │
│                                         │
│         ┌─────────────────────┐         │ // Empty state (centered)
│         │                     │         │
│         │       🎬            │         │ // Icon (play symbol)
│         │                     │         │ // w-20 h-20 rounded-xl
│         │                     │         │ // bg-surface border-accent/20
│         └─────────────────────┘         │
│                                         │
│      Session Replay                     │ // text-display-sm font-bold
│                                         │ // text-text-primary
│                                         │
│    No recorded sessions yet.            │ // text-text-secondary
│    Watch your analysis journey.         │ // max-w-md mx-auto
│                                         │
│  ┌─────────────────────────────────────┐│ // Info banner
│  │ ⚡ Preview Mode:                    ││ // bg-brand/10 border-brand/20
│  │ Static timeline viewer.             ││ // p-4 rounded-lg text-sm
│  │ Full playback controls coming soon. ││
│  └─────────────────────────────────────┘│
│                                         │
│                                         │
│                                         │
│                                         │
├─────────────────────────────────────────┤
│  📊 Analyze  │  📝 Journal  │  ⏮️ Replay │ // Active: Replay
└─────────────────────────────────────────┘
```

**Annotations:**
- **Empty State**: Centered vertically (min-h-[calc(100vh-12rem)])
- **Icon**: Play symbol in rounded card (w-20 h-20)
- **Banner**: "Preview Mode" indicator (static viewer, not full playback)
- **No actions**: Only visual feedback

---

## State 2: Sessions List

```
┌─────────────────────────────────────────┐
│  [Header: Session Replay]          [⚙️]  │
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐│ // Header section
│  │ Session Replay                      ││ // text-display-sm font-bold
│  │                                     ││
│  │ Review your analysis sessions       ││ // text-sm text-secondary
│  │ and learning moments                ││
│  │                                     ││
│  │                            [🔄 Refresh]││ // Button (btn-ghost)
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│ // Info banner
│  │ ⚡ Static Preview Mode              ││
│  │ Proof-of-concept timeline viewer.   ││
│  │ Full replay features (scrubbing,    ││
│  │ playback controls, chart snapshots) ││
│  │ coming in future phases.            ││
│  └─────────────────────────────────────┘│
│                                         │
│  2 sessions recorded                    │ // text-xs font-mono text-tertiary
│                                         │
│  ┌─────────────────────────────────────┐│ // Session Card 1
│  │ 🎬 Session                          ││ // card-interactive (hover effect)
│  │ abc123def456789...                  ││ // sessionId (truncated)
│  │                           [12 events]││ // Badge: event count
│  │                                     ││ // bg-cyan/10 border-cyan text-cyan
│  │ Started: 02.11.2025, 14:32:15      ││ // text-xs font-mono
│  │ Duration: 5m 23s                    ││
│  │                                     ││
│  │ [Watch Replay →]                    ││ // btn-primary w-full
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│ // Session Card 2
│  │ 🎬 Session                          ││
│  │ xyz789abc123456...                  ││
│  │                           [8 events] ││
│  │                                     ││
│  │ Started: 01.11.2025, 09:15:42      ││
│  │ Duration: 2m 47s                    ││
│  │                                     ││
│  │ [Watch Replay →]                    ││
│  └─────────────────────────────────────┘│
│                                         │
├─────────────────────────────────────────┤
│  📊 Analyze  │  📝 Journal  │  ⏮️ Replay │
└─────────────────────────────────────────┘
```

**Annotations:**
- **Session Cards**: `card-interactive` class (hover scale/shadow effects)
- **Badge**: Event count in cyan (bg-cyan/10 border-cyan)
- **Duration**: Formatted as "Xm Ys" (minutes + seconds)
- **Sorted**: Most recent first (by lastEvent timestamp)

---

## State 3: Replay Modal (Timeline View)

```
┌─────────────────────────────────────────┐
│  [Modal: Session abc123...]         [X] │ // Full-screen modal overlay
├─────────────────────────────────────────┤
│  ┌─────────────────────────────────────┐│ // Modal header
│  │ 🎬 Session Replay                   ││
│  │ abc123def456789012345678            ││ // Full sessionId
│  │                                     ││
│  │ ⚡ Static Preview Mode              ││ // Banner
│  │ Timeline viewer only. Full playback ││
│  │ controls coming soon.               ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│ // Event Timeline (scrollable)
│  │ Event 1                             ││ // border-zinc-800 rounded p-2
│  │ 14:32:15.234                        ││ // timestamp
│  │ Type: page.view                     ││ // event.type
│  │ Path: /                             ││ // event.attrs (if present)
│  │                                     ││
│  │ Event 2                             ││
│  │ 14:32:18.567                        ││
│  │ Type: user.input                    ││
│  │ Value: 7xKF...abc123                ││
│  │                                     ││
│  │ Event 3                             ││
│  │ 14:32:20.123                        ││
│  │ Type: user.rule.create              ││
│  │ RuleId: ab12cd34...                 ││
│  │ Kind: price-cross                   ││
│  │                                     ││
│  │ Event 4                             ││
│  │ 14:32:25.456                        ││
│  │ Type: user.bookmark.add             ││
│  │ Timestamp: 1698765432               ││
│  │ Label: "Breakout signal"            ││
│  │                                     ││
│  │ ... (8 more events)                 ││
│  │                                     ││
│  └─────────────────────────────────────┘│
│                                         │
│  [Close]                                │ // btn-secondary
│                                         │
└─────────────────────────────────────────┘
```

**Annotations:**
- **Modal**: Full-screen overlay (z-50, bg-black/80)
- **Event List**: Vertical timeline, chronological order
- **Event Cards**: `border-zinc-800 rounded p-2 mb-2`
- **Color-Coded**: Event types could have different colors (not impl. yet)
- **Expandable**: Click event to see full attrs (not impl. yet)

---

## State 4: No Events in Session

```
┌─────────────────────────────────────────┐
│  [Modal: Session xyz789...]         [X] │
├─────────────────────────────────────────┤
│  🎬 Session Replay                      │
│  xyz789abc123456789012345678            │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │                                     ││ // Empty timeline
│  │       (No events recorded)          ││ // text-zinc-500 text-center
│  │                                     ││
│  │  This session has no tracked events.││
│  │                                     ││
│  └─────────────────────────────────────┘│
│                                         │
│  [Close]                                │
│                                         │
└─────────────────────────────────────────┘
```

**Annotations:**
- **Edge Case**: Session exists but events array is empty
- **Message**: Simple centered text

---

## COMPONENT BREAKDOWN

| Component | Event | Action | Animation |
|-----------|-------|--------|-----------|
| Button: Refresh | onClick | loadSessions() → query IndexedDB | loading spinner |
| Session Card | onClick | openReplay(sessionId) | modal opens |
| Button: Watch Replay | onClick | openReplay(sessionId) | modal opens |
| Modal: Close | onClick | setIsReplayOpen(false) | modal closes |
| Event Item | onClick (future) | Expand details | accordion |

---

## DATA MODEL

### Session Object (Derived)
```typescript
{
  sessionId: string;        // Unique session ID
  count: number;            // Total events in session
  firstEvent: number;       // Timestamp (ms) of first event
  lastEvent: number;        // Timestamp (ms) of last event
}
```

### SessionEvent Object (IndexedDB)
```typescript
{
  id: string;               // Event ID
  sessionId: string;        // Parent session
  timestamp: number;        // Event timestamp (ms)
  type: string;             // Event type (e.g., "user.bookmark.add")
  data: Record<string, any>;// Event-specific data
}
```

---

## USER FLOWS

### Flow 1: View Session Timeline
1. User lands on Replay page
2. Sessions auto-load from IndexedDB
3. User sees list of sessions (sorted by recency)
4. User clicks "Watch Replay →"
5. Modal opens with event timeline
6. User scrolls through events
7. User clicks "Close" → returns to list

### Flow 2: Refresh Sessions
1. User clicks "🔄 Refresh"
2. App re-queries IndexedDB
3. Session list updates (if new events recorded)

### Flow 3: Empty State
1. User on Replay page (first time)
2. No sessions in IndexedDB yet
3. Empty state shown with icon + message
4. User can leave or wait for sessions to accumulate

---

## RESPONSIVE BEHAVIOR

### Mobile (<768px)
- Session Cards: 1 column (full width)
- Modal: Full-screen overlay

### Desktop (>1024px)
- Session Cards: 2 columns (`md:grid-cols-2`)
- Modal: Centered with max-width (not full-screen)

---

## ACCESSIBILITY

- **Session Cards**: Clickable, keyboard accessible (Enter/Space)
- **Modal Close**: Esc key closes modal (not impl., could add)
- **Focus Management**: Modal traps focus (not impl., could add)
- **Screen Reader**: Event types + timestamps announced

---

## PERFORMANCE NOTES

- **IndexedDB Query**: Fast (< 50ms for typical session count)
- **Session Grouping**: Done in-memory (map reduce)
- **Sorting**: JavaScript sort (negligible cost)

---

## FUTURE FEATURES (Not Implemented)

- **Playback Controls**: Play/pause, scrubbing timeline
- **Chart Snapshots**: Show chart state at each event
- **Event Filtering**: Filter by type (user, api, canvas)
- **Export**: Export session as JSON
- **Delete**: Delete old sessions

---

## CURRENT LIMITATIONS

1. **Static Viewer Only**: No playback, just event list
2. **No Pagination**: All events shown (could be slow for large sessions)
3. **No Search**: Can't search events
4. **No Visualization**: Text-only, no timeline graph

---

**Storybook Variants:** Empty State, Sessions List, Modal Timeline, No Events in Session
