# Mobile Wireframe: BoardPage (375px)

**Route:** `/board`  
**Purpose:** Command Center Dashboard - Overview, Focus, Actions, Feed  
**Complexity:** ⭐⭐⭐⭐ High (Multiple sections, onboarding system, responsive grid)  
**Status:** ✅ Production Ready with Onboarding

---

## State 1: FIRST VISIT - Welcome Modal

```
┌─────────────────────────────────┐
│  [OVERLAY: Semi-transparent     │
│   backdrop (bg-black/60)]       │
│                                 │
│   ┌─────────────────────────┐  │
│   │  🎉 Welcome to          │  │
│   │    Sparkfined!          │  │ ← Modal Header
│   │                         │  │
│   │  Choose your level:     │  │
│   │                         │  │
│   │  ┌───────────────────┐  │  │
│   │  │ 🌱 Beginner       │  │  │ ← Persona buttons
│   │  └───────────────────┘  │  │
│   │  ┌───────────────────┐  │  │
│   │  │ 📈 Intermediate   │  │  │
│   │  └───────────────────┘  │  │
│   │  ┌───────────────────┐  │  │
│   │  │ 🚀 Advanced       │  │  │
│   │  └───────────────────┘  │  │
│   │                         │  │
│   │  Each level customizes  │  │
│   │  your tour & hints      │  │ ← Explanation text
│   │                         │  │
│   │  [ Skip for now ]       │  │ ← Skip button
│   └─────────────────────────┘  │
│                                 │
└─────────────────────────────────┘
```

**Behavior:**
- Shows on first visit (checked via `useOnboardingStore`)
- 500ms delay after page load
- Persona selection triggers product tour
- Skip closes modal without tour

---

## State 2: NORMAL VIEW (Post-Onboarding)

```
┌─────────────────────────────────┐
│ ┌─────────────────────────────┐ │
│ │ 💡 Quick Tip                │ │ ← Progressive Hint Banner
│ │ Click any KPI tile to see   │ │   (dismissible)
│ │ detailed breakdowns...  [✕] │ │
│ └─────────────────────────────┘ │
│                                 │
│ ╔═══════════════════════════════╗
│ ║  OVERVIEW SECTION (KPIs)     ║ ← Full-width
│ ╠═══════════════════════════════╣
│ ║                               ║
│ ║  ┌──────┐ ┌──────┐ ┌──────┐  ║
│ ║  │ Risk │ │ Sent │ │ P&L  │  ║ ← 3-column grid
│ ║  │ 7.2  │ │ 82%  │ │+12.5%│  ║   KPI tiles
│ ║  └──────┘ └──────┘ └──────┘  ║
│ ║                               ║
│ ║  ┌──────┐ ┌──────┐ ┌──────┐  ║
│ ║  │ Win  │ │Alert │ │Active│  ║ ← Second row
│ ║  │ 68%  │ │  12  │ │  3   │  ║
│ ║  └──────┘ └──────┘ └──────┘  ║
│ ║                               ║
│ ╚═══════════════════════════════╝
│                                 │
│ ╔═══════════════════════════════╗
│ ║  FOCUS ZONE (Now Stream)     ║ ← Recent activity
│ ╠═══════════════════════════════╣
│ ║  📊 Analyzed SOL/USD         ║
│ ║     2 minutes ago            ║ ← Activity card
│ ║  ───────────────────────     ║
│ ║  📝 Created journal entry    ║
│ ║     5 minutes ago            ║
│ ║  ───────────────────────     ║
│ ║  🔔 Alert triggered: BTC...  ║
│ ║     8 minutes ago            ║
│ ╚═══════════════════════════════╝
│                                 │
│ ╔═══════════════════════════════╗
│ ║  QUICK ACTIONS               ║
│ ╠═══════════════════════════════╣
│ ║  ┌─────────┐ ┌─────────┐    ║
│ ║  │  📊    │ │  📝    │    ║ ← 2x2 grid
│ ║  │Analyze │ │Journal │    ║   of action buttons
│ ║  └─────────┘ └─────────┘    ║
│ ║  ┌─────────┐ ┌─────────┐    ║
│ ║  │  📈    │ │  🔔    │    ║
│ ║  │ Chart  │ │ Alerts │    ║
│ ║  └─────────┘ └─────────┘    ║
│ ╚═══════════════════════════════╝
│                                 │
│ ╔═══════════════════════════════╗
│ ║  ACTIVITY FEED               ║ ← Event log
│ ╠═══════════════════════════════╣
│ ║  • Rule "BTC > 45k" hit      ║
│ ║    10:32 AM                  ║
│ ║  • Signal detected: Breakout ║
│ ║    10:15 AM                  ║
│ ║  • Journal synced (3 notes)  ║
│ ║    09:58 AM                  ║
│ ╚═══════════════════════════════╝
│                                 │
│ [Navigation Bar - Bottom]       │ ← Standard bottom nav
└─────────────────────────────────┘
```

**Layout:**
- **Mobile:** 1 column, stacked sections
- **Sections:** Overview → Focus → Actions → Feed
- **Spacing:** gap-3 (12px) between sections
- **Padding:** px-3 py-4 (12px horizontal, 16px vertical)

---

## State 3: PRODUCT TOUR ACTIVE

```
┌─────────────────────────────────┐
│  [SPOTLIGHT: Overview Section]  │ ← Highlight with overlay
│                                 │
│  ┌──────────────────────────┐  │
│  │ 👋 This is your Overview │  │ ← Tour tooltip
│  │                          │  │
│  │ These KPI tiles give you │  │
│  │ a snapshot of your       │  │
│  │ trading health.          │  │
│  │                          │  │
│  │ [ Next (1/7) ]  [Skip]   │  │ ← Tour controls
│  └──────────────────────────┘  │
│                                 │
│  [REST OF PAGE DIMMED]          │
└─────────────────────────────────┘
```

**Tour Stops (7 total):**
1. **Overview** - KPI tiles explanation
2. **Focus** - Now Stream activity feed
3. **Quick Actions** - Navigation shortcuts
4. **Feed** - Event history
5. **Bottom Nav** - Main navigation
6. **Keyboard Shortcuts** - Press `?` to view shortcuts
7. **Onboarding Checklist** - Track progress (opens checklist)

**Implementation:** `createProductTour()` from `@/lib/productTour`

---

## State 4: ONBOARDING CHECKLIST (Overlay)

```
┌─────────────────────────────────┐
│  ┌──────────────────────────┐  │
│  │ 🎯 Getting Started       │  │ ← Checklist modal
│  │                          │  │
│  │ ✅ Complete first tour   │  │
│  │ ☐ Analyze a token        │  │ ← Checklist items
│  │ ☐ Create journal entry   │  │   (checkboxes)
│  │ ☐ Set up first alert     │  │
│  │ ☐ Explore chart tools    │  │
│  │                          │  │
│  │ Progress: 1/5 (20%)      │  │ ← Progress bar
│  │ ████░░░░░░░░░░░░░░░░     │  │
│  │                          │  │
│  │ [ Close ]                │  │
│  └──────────────────────────┘  │
└─────────────────────────────────┘
```

**Trigger:** Click checklist button (bottom-right corner) or end of tour

---

## Component Breakdown

### 1. Overview Section (`<Overview />`)
```
┌───────────────────────────────┐
│ KPI Tiles (3x2 Grid)          │
├───────────────────────────────┤
│ ┌──────┐ ┌──────┐ ┌──────┐   │
│ │ TILE │ │ TILE │ │ TILE │   │
│ └──────┘ └──────┘ └──────┘   │
│ ┌──────┐ ┌──────┐ ┌──────┐   │
│ │ TILE │ │ TILE │ │ TILE │   │
│ └──────┘ └──────┘ └──────┘   │
└───────────────────────────────┘
```
**Props:** None (self-contained, fetches own data)  
**File:** `@/components/board/Overview`  
**Data Source:** Mock/localStorage (KPI calculations)

**KPI Tiles:**
1. **Risk Score** - Calculated from open positions
2. **Sentiment** - Market sentiment percentage
3. **P&L (24h)** - Daily profit/loss
4. **Win Rate** - Success rate of closed trades
5. **Active Alerts** - Count of enabled rules
6. **Active Trades** - Count of open positions

### 2. Focus Zone (`<Focus />`)
```
┌───────────────────────────────┐
│ "Now Stream" - Recent Actions │
├───────────────────────────────┤
│ [Activity Card 1]             │
│ [Activity Card 2]             │
│ [Activity Card 3]             │
│ ...                           │
└───────────────────────────────┘
```
**Props:** None  
**File:** `@/components/board/Focus`  
**Max Items:** 5 most recent activities  
**Data Source:** Aggregates from telemetry/events

### 3. Quick Actions (`<QuickActions />`)
```
┌───────────────────────────────┐
│ 2x2 Grid of Action Buttons    │
├───────────────────────────────┤
│ ┌──────────┐ ┌──────────┐    │
│ │  📊      │ │  📝      │    │
│ │ Analyze  │ │ Journal  │    │
│ └──────────┘ └──────────┘    │
│ ┌──────────┐ ┌──────────┐    │
│ │  📈      │ │  🔔      │    │
│ │ Chart    │ │ Alerts   │    │
│ └──────────┘ └──────────┘    │
└───────────────────────────────┘
```
**Props:** None  
**File:** `@/components/board/QuickActions`  
**Behavior:** Each button navigates to respective page

### 4. Activity Feed (`<Feed />`)
```
┌───────────────────────────────┐
│ Event Log (Chronological)     │
├───────────────────────────────┤
│ • Event 1 (timestamp)         │
│ • Event 2 (timestamp)         │
│ • Event 3 (timestamp)         │
│ ...                           │
└───────────────────────────────┘
```
**Props:** None  
**File:** `@/components/board/Feed`  
**Max Items:** 10 most recent events  
**Data Source:** Telemetry events

---

## Responsive Grid Behavior

**Mobile (< 768px):**
```
[Overview]    ← Full width
[Focus]       ← Full width
[Actions]     ← Full width
[Feed]        ← Full width
```
- Grid: `grid-cols-1`
- All sections stacked vertically

**Tablet (768px - 1024px):**
```
[Overview]          ← Full width (span 2)
[Focus]  [Actions]  ← 2 columns
[Feed]              ← Full width (span 2)
```
- Grid: `md:grid-cols-2`
- Focus + Actions side-by-side

**Desktop (> 1024px):**
```
[Overview]                    ← Full width (span 3)
[Focus]    [Actions]  [Feed]  ← 3 columns (5fr, 3fr, 4fr)
```
- Grid: `lg:grid-cols-[5fr_3fr_4fr]`
- Three-column layout with weighted widths

---

## Onboarding System

### Components Involved:
1. **WelcomeModal** - Persona selection
2. **OnboardingChecklist** - Progress tracking
3. **KeyboardShortcuts** - Shortcut reference (triggered by `?` key)
4. **HintBanner** - Progressive contextual hints
5. **Product Tour** - Guided walkthrough (driver.js)

### Flow:
```
First Visit
    ↓
Welcome Modal (500ms delay)
    ↓
Select Persona (Beginner/Intermediate/Advanced)
    ↓
Product Tour Starts (7 stops)
    ↓
Tour Complete → Checklist Opens
    ↓
Progressive Hints Appear (based on completed steps)
```

### Persistence:
- **Store:** Zustand (`useOnboardingStore`)
- **Keys:**
  - `firstVisit` (boolean)
  - `tourCompleted` (boolean)
  - `userLevel` (UserLevel enum)
  - `dismissedHints` (array of hint IDs)
  - `checklistProgress` (array of completed tasks)

---

## Accessibility

| Criterion | Status | Implementation |
|-----------|--------|----------------|
| **Semantic Sections** | ✅ | `<section aria-label="...">` for each zone |
| **Keyboard Shortcuts** | ✅ | `?` opens shortcuts modal, Esc closes modals |
| **Focus Management** | ✅ | Modal focus trap (in tour & checklist) |
| **Skip Links** | ⚠️ | Not implemented (add for keyboard users) |
| **Screen Reader** | ✅ | All sections have ARIA labels |
| **Color Contrast** | ✅ | Text meets WCAG AA on dark background |

**Improvements Needed:**
- Add skip link to main content (bypass tour/hints)
- Ensure all interactive elements have visible focus rings
- Test with screen reader for tour navigation

---

## Animations

**Page Load:**
- Stagger animation on grid sections (via `stagger` class)
- Fade-in on hint banner
- Slide-up on overview section

**Tour:**
- Spotlight fade-in (via driver.js)
- Tooltip slide animation
- Rest of page dim transition

**Implementation:**
```css
.animate-fade-in {
  animation: fadeIn 0.3s ease-in;
}

.animate-slide-up {
  animation: slideUp 0.4s ease-out;
}

.stagger > * {
  animation: fadeIn 0.3s ease-in;
  animation-delay: calc(var(--index) * 0.1s);
}
```

---

## Edge Cases

| Scenario | Behavior |
|----------|----------|
| **Return Visit** | No modal, no tour (skips directly to dashboard) |
| **Skip Tour** | Closes modal, sets `tourCompleted = false`, no checklist opens |
| **Hint Dismissed** | Stores hint ID in `dismissedHints`, never shows again |
| **Keyboard Shortcuts** | Press `?` at any time to view shortcuts (works even during tour) |
| **No Data** | KPIs show 0 or "N/A", Focus/Feed show empty states |

---

## Related Flows

| Flow | Link |
|------|------|
| **First-Time Onboarding** | User Flows → Onboarding Flow |
| **Navigation to Pages** | Quick Actions → Analyze/Chart/Journal/Alerts |
| **Keyboard Shortcuts** | `?` key → Shortcuts modal |
| **Progress Tracking** | Checklist → Task completion triggers hints |

---

## Implementation Notes

**Key Dependencies:**
- `driver.js` - Product tour library
- `zustand` - Onboarding state management
- `@/components/onboarding` - WelcomeModal, Checklist, etc.
- `@/lib/productTour` - Tour configuration

**File:** `src/pages/BoardPage.tsx`  
**Lines:** 140 lines  
**Complexity:** High (multiple systems integrated)

---

**Status:** ✅ Complete - Production ready with full onboarding system
