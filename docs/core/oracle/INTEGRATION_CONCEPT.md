# Oracle Subsystem – Integration Concept & Architecture Plan

## 🎯 Executive Summary

Das **Oracle Subsystem** ist ein tägliches Meta-Shift-Radar, das via Grok drei Prompts orchestriert:
1. **7-Parameter Score** (Liquidität, Volumen, Social Momentum, etc.)
2. **Themen-Orakel** (Gaming, RWA, AI Agents, etc. mit Meta-Wahrscheinlichkeiten)
3. **Frühe Alpha-CAs** (Contract Addresses mit Early-Signal-Potenzial)

Ziel: Trader erhalten täglich um **09:00 UTC** einen strukturierten Report, der Meta-Shifts voraussagt und als **Daily Ritual** mit XP, Streaks, und Journal-Integration funktioniert.

---

## 📐 Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER INTERFACE                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Sidebar     │  │ Oracle Page  │  │ Score Chart  │         │
│  │  (Nav Link)  │  │ (Main View)  │  │ (Analytics)  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                      STATE MANAGEMENT                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  oracleStore (Zustand)                                   │  │
│  │  - entries[], activeEntry, isLoading, error              │  │
│  │  - loadTodayEntry(), markAsRead(), refreshReport()       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                       SERVICE LAYER                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  OracleService.ts (Dexie Wrapper)                        │  │
│  │  - createOrUpdateEntry(), getTodayEntry()                │  │
│  │  - getEntriesByDateRange(), getEntriesByTheme()          │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    PERSISTENCE LAYER                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  IndexedDB (sparkfined-ta-pwa)                           │  │
│  │  Table: oracle                                           │  │
│  │  Schema: ++id, date, score, topTheme, fullReport,        │  │
│  │          read, notified, createdAt                       │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↑
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND API                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  /api/oracle (Edge Function)                             │  │
│  │  - Orchestrates 3 Grok prompts                           │  │
│  │  - Returns: { report, score, theme }                     │  │
│  │  - Triggered: Cron (09:00 UTC) + on-demand (UI)         │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                    INTEGRATION POINTS                           │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  Journal     │  │  XP/Streaks  │  │ Notifications│         │
│  │  (Auto Entry)│  │  (Gamify)    │  │ (Score ≥ 6)  │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗂️ File Structure

### New Files to Create

```
src/
├── pages/
│   └── OraclePageV2.tsx              # Main Oracle Page
├── components/
│   └── oracle/
│       ├── OracleReportViewer.tsx    # Display fullReport with syntax highlighting
│       ├── OracleScoreCard.tsx       # Score display (0-7) with visual indicator
│       ├── OracleThemeBadge.tsx      # Theme badge (Gaming, RWA, etc.)
│       ├── OracleScoreChart.tsx      # 30-day score history (Recharts)
│       ├── OracleThemeFilter.tsx     # Dropdown filter for themes
│       └── OracleNotificationToggle.tsx # Enable/disable notifications
├── store/
│   └── oracleStore.ts                # Zustand store for Oracle state
├── lib/
│   └── OracleService.ts              # Dexie CRUD operations
├── types/
│   └── oracle.ts                     # TypeScript types
api/
└── oracle/
    └── index.ts                      # Edge function for Grok orchestration
docs/
└── core/
    └── oracle/
        ├── INTEGRATION_CONCEPT.md    # This file
        ├── API_SPEC.md               # API endpoint documentation
        └── DOMAIN_RULES.md           # Oracle-specific guardrails
```

### Files to Modify

```
src/
├── components/layout/
│   └── Sidebar.tsx                   # Add Oracle nav item
├── routes/
│   └── RoutesRoot.tsx                # Add /oracle route
├── lib/
│   ├── db.ts                         # Add oracle table to schema
│   └── icons.ts                      # Export oracle icon (Sparkles or Eye)
vercel.json                           # Add cron config
```

---

## 📊 Data Model

### Dexie Schema (oracle table)

```typescript
// In src/lib/db.ts (upgrade to DB_VERSION 5)

export interface OracleEntry {
  id?: number;                        // Auto-increment
  date: string;                       // YYYY-MM-DD (unique per day)
  score: number;                      // 0-7 from Grok
  topTheme: string;                   // "Gaming" | "RWA" | "AI Agents" | etc.
  fullReport: string;                 // Complete Grok response (markdown-ish)
  read: boolean;                      // XP-guard: only grant XP once
  notified: boolean;                  // Notification-guard: only notify once
  createdAt: number;                  // Unix timestamp
}

// Schema definition (in onupgradeneeded)
if (!db.objectStoreNames.contains('oracle')) {
  const oracleStore = db.createObjectStore('oracle', {
    keyPath: 'id',
    autoIncrement: true,
  });
  oracleStore.createIndex('date', 'date', { unique: true });
  oracleStore.createIndex('score', 'score', { unique: false });
  oracleStore.createIndex('topTheme', 'topTheme', { unique: false });
  oracleStore.createIndex('createdAt', 'createdAt', { unique: false });
}
```

### TypeScript Types

```typescript
// src/types/oracle.ts

export interface OracleEntry {
  id?: number;
  date: string;
  score: number;
  topTheme: OracleTheme;
  fullReport: string;
  read: boolean;
  notified: boolean;
  createdAt: number;
}

export type OracleTheme =
  | 'Gaming'
  | 'RWA'
  | 'AI Agents'
  | 'DePIN'
  | 'Privacy/ZK'
  | 'Collectibles/TCG'
  | 'Stablecoin Yield'
  | 'Other';

export interface OracleApiResponse {
  success: boolean;
  data?: {
    report: string;
    score: number;
    theme: OracleTheme;
  };
  error?: string;
}

export interface OracleStats {
  avgScore: number;
  highScoreDays: number;
  mostCommonTheme: OracleTheme;
  currentStreak: number;
}
```

---

## 🔌 API Design

### Endpoint: `/api/oracle`

**Method:** `GET`
**Runtime:** Edge
**Cron:** Daily at 09:00 UTC

**Response:**
```json
{
  "success": true,
  "data": {
    "report": "SCORE: 6/7\n\nMeta-Shift Probability: HIGH...",
    "score": 6,
    "theme": "Gaming"
  }
}
```

**Implementation Strategy:**
1. Call Grok API 3x (7-param score, themes, alpha CAs)
2. Parse responses to extract score and top theme
3. Combine into single `report` string
4. Return structured response

**Error Handling:**
- If Grok unavailable → return cached last report with warning
- If score parsing fails → default to score=3, theme="Other"

---

## 🎨 UI/UX Flow

### Oracle Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│  Oracle · Daily Meta-Shift Radar                            │
│  ┌───────────────┐  ┌──────────────────────────────────┐   │
│  │  Score: 6/7   │  │  [Refresh] [Mark as Read]        │   │
│  │  ⚡ HIGH       │  │  Theme: Gaming 🎮                 │   │
│  │  Shift Alert  │  │  Last Update: Today 09:00 UTC     │   │
│  └───────────────┘  └──────────────────────────────────┘   │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  Full Report (Pre-formatted)                          │ │
│  │                                                        │ │
│  │  SCORE: 6/7                                           │ │
│  │                                                        │ │
│  │  NEXT META PROBABILITIES:                             │ │
│  │  - Gaming: 72% (↑ from yesterday)                     │ │
│  │  - RWA: 45%                                           │ │
│  │  ...                                                  │ │
│  │                                                        │ │
│  │  EARLY ALPHA CONTRACT ADDRESSES:                      │ │
│  │  - 0xABC...DEF (Gaming category)                      │ │
│  │  ...                                                  │ │
│  └───────────────────────────────────────────────────────┘ │
│                                                              │
│  ┌───────────────────────────────────────────────────────┐ │
│  │  30-Day Score History                                 │ │
│  │  [LineChart: Score over time with theme colors]      │ │
│  │  Filter: [All | Gaming | RWA | AI Agents | ...]      │ │
│  └───────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### User Flows

1. **Daily Morning Flow (First Visit)**
   - User opens Oracle page or app auto-navigates
   - Page checks if today's entry exists in Dexie
   - If not → calls `/api/oracle`, stores result
   - If score ≥ 6 → shows notification
   - User reads report, clicks "Mark as Read"
   - Grants 50 XP, increments oracle streak, creates journal entry

2. **Refresh Flow (Re-fetch Today)**
   - User clicks "Refresh" button
   - Calls `/api/oracle` again
   - Overwrites today's entry in Dexie
   - Updates UI immediately

3. **Historical Analysis Flow**
   - User scrolls to 30-day chart
   - Filters by theme (e.g., "Gaming only")
   - Chart updates to show Gaming-filtered score history
   - User clicks on a specific day → loads that day's full report

---

## 🎮 Gamification Integration

### XP & Streaks

**Trigger:** User clicks "Mark as Read" on Oracle page (only if `read === false`)

**Actions:**
```typescript
// In src/store/oracleStore.ts or OraclePageV2.tsx

const handleMarkAsRead = async () => {
  const todayEntry = await OracleService.getTodayEntry();

  if (!todayEntry || todayEntry.read) {
    return; // Already read
  }

  // Update entry
  await OracleService.markAsRead(todayEntry.id);

  // Grant XP (via journalStore or dedicated gamificationStore)
  journalStore.addXP(50, 'oracle-read');

  // Increment streak
  journalStore.streaks.oracle += 1;

  // Check for badge unlock (21-day streak)
  if (journalStore.streaks.oracle >= 21 && !journalStore.badges.includes('oracle-master')) {
    journalStore.addBadge('oracle-master');
    showToast('🎖️ Unlocked: Oracle Master (21-day streak)');
  }

  // Create journal entry
  await createAutoJournalEntry(todayEntry);
};
```

### Auto Journal Entry

**Format:**
```typescript
// src/lib/OracleService.ts

export async function createAutoJournalEntry(entry: OracleEntry): Promise<void> {
  const journalEntry = {
    type: 'insight',
    content: `Oracle ${entry.score}/7 → Next shift likely: ${entry.topTheme}`,
    tags: ['meta-shift', entry.topTheme.toLowerCase().replace(/\s+/g, '-')],
    emotion: 'discipline',
    xp: 25,
    timestamp: Date.now(),
  };

  await JournalService.createEntry(journalEntry);
}
```

**Purpose:**
- Provides behavior signal: "User consumed Oracle daily"
- Allows AI analysis to correlate Oracle scores with user trades
- Example insight: "You read high-score Oracle reports but didn't trade Gaming tokens despite 72% meta-probability"

---

## 🔔 Notifications Strategy

### Web Notification API (Client-Side)

**Trigger:** Score ≥ 6 and `notified === false`

```typescript
// In OraclePageV2.tsx (after loading today's entry)

useEffect(() => {
  if (!todayEntry || todayEntry.notified) return;

  if (todayEntry.score >= 6) {
    const notifyUser = async () => {
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        new Notification('⚡ Meta-Shift Alert!', {
          body: `Score: ${todayEntry.score}/7 · Theme: ${todayEntry.topTheme}`,
          icon: '/icon-192.png',
          tag: 'oracle-high-score',
        });

        // Mark as notified
        await OracleService.updateEntry(todayEntry.id, { notified: true });
      }
    };

    notifyUser();
  }
}, [todayEntry]);
```

**Future Enhancement:** Service Worker Push Notifications
- Requires backend push service
- Can notify even when app is closed
- Out of scope for initial implementation

---

## 📈 Analytics & Exploration

### 30-Day Score Chart

**Component:** `OracleScoreChart.tsx`

**Data Source:**
```typescript
const thirtyDaysAgo = new Date();
thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
const dateStr = thirtyDaysAgo.toISOString().split('T')[0];

const entries = await OracleService.getEntriesByDateRange(dateStr, todayStr);
```

**Visualization:**
- **X-Axis:** Date (YYYY-MM-DD)
- **Y-Axis:** Score (0-7)
- **Color:** Segmented by `topTheme` (different colors per theme)
- **Tooltip:** Shows date, score, theme, and "View Report" button

**Chart Library:** Recharts (already in project dependencies)

### Theme Filter

**Component:** `OracleThemeFilter.tsx`

**Options:**
- All
- Gaming
- RWA
- AI Agents
- DePIN
- Privacy/ZK
- Collectibles/TCG
- Stablecoin Yield

**Behavior:**
```typescript
const filteredEntries = selectedTheme === 'All'
  ? entries
  : await OracleService.getEntriesByTheme(selectedTheme);
```

**Effect:** Chart updates to show only entries matching selected theme

---

## 🚀 Implementation Plan

### Phase 1: Foundation (Data + API)
**Priority:** Critical
**Duration:** ~2-3 days

- [ ] Update `src/lib/db.ts` with `oracle` table schema (DB_VERSION 5)
- [ ] Create `src/types/oracle.ts` with interfaces
- [ ] Create `src/lib/OracleService.ts` with CRUD functions:
  - `createOrUpdateEntry(entry: Omit<OracleEntry, 'id'>): Promise<number>`
  - `getTodayEntry(): Promise<OracleEntry | undefined>`
  - `getEntriesByDateRange(startDate: string, endDate: string): Promise<OracleEntry[]>`
  - `getEntriesByTheme(theme: OracleTheme): Promise<OracleEntry[]>`
  - `markAsRead(id: number): Promise<void>`
  - `updateEntry(id: number, updates: Partial<OracleEntry>): Promise<void>`
- [ ] Create `api/oracle/index.ts` with Grok orchestration
- [ ] Add Vercel cron config to `vercel.json`
- [ ] Write unit tests for OracleService

### Phase 2: State Management
**Priority:** Critical
**Duration:** ~1 day

- [ ] Create `src/store/oracleStore.ts` (Zustand store):
  - State: `entries`, `activeEntry`, `isLoading`, `error`, `stats`
  - Actions: `loadTodayEntry()`, `markAsRead()`, `refreshReport()`, `loadHistory()`
- [ ] Integrate with `journalStore` for XP/Streaks
- [ ] Add event emission for analytics (via eventBus)

### Phase 3: UI Components
**Priority:** Critical
**Duration:** ~2-3 days

- [ ] Create `src/pages/OraclePageV2.tsx` (main page with layout)
- [ ] Create `src/components/oracle/OracleReportViewer.tsx`
- [ ] Create `src/components/oracle/OracleScoreCard.tsx`
- [ ] Create `src/components/oracle/OracleThemeBadge.tsx`
- [ ] Create `src/components/oracle/OracleScoreChart.tsx` (with Recharts)
- [ ] Create `src/components/oracle/OracleThemeFilter.tsx`
- [ ] Create `src/components/oracle/OracleNotificationToggle.tsx`
- [ ] Add tests (E2E with Playwright, unit with Vitest)

### Phase 4: Navigation Integration
**Priority:** High
**Duration:** ~1 day

- [ ] Add Oracle icon to `src/lib/icons.ts` (Sparkles or Eye)
- [ ] Update `src/components/layout/Sidebar.tsx` with Oracle nav item
- [ ] Add `/oracle` route to `src/routes/RoutesRoot.tsx`
- [ ] Test navigation flow (mobile bottom nav + desktop sidebar)

### Phase 5: Gamification & Journal Integration
**Priority:** High
**Duration:** ~1-2 days

- [ ] Implement "Mark as Read" XP grant (50 XP)
- [ ] Implement Oracle streak tracking
- [ ] Add "Oracle Master" badge (21-day streak)
- [ ] Implement auto journal entry creation
- [ ] Add telemetry events (Oracle opened, read, refreshed)

### Phase 6: Notifications
**Priority:** Medium
**Duration:** ~1 day

- [ ] Implement Web Notification API integration
- [ ] Add notification permission request flow
- [ ] Test notification triggers (score ≥ 6)
- [ ] Add Settings toggle for notifications

### Phase 7: Analytics & Polish
**Priority:** Medium
**Duration:** ~1-2 days

- [ ] Implement 30-day score chart with theme filtering
- [ ] Add historical report viewer (click on chart point)
- [ ] Add empty states and error handling
- [ ] Performance optimization (lazy load chart, virtualize report)
- [ ] Accessibility audit (keyboard nav, screen reader)

### Phase 8: Documentation & Testing
**Priority:** High
**Duration:** ~1-2 days

- [ ] Write `docs/core/oracle/DOMAIN_RULES.md` (Oracle-specific guardrails)
- [ ] Write `docs/core/oracle/API_SPEC.md` (API documentation)
- [ ] Update CLAUDE.md with Oracle references
- [ ] Write E2E test suite:
  - Load today's oracle → Mark as read → Check XP/streak
  - Refresh report → Verify update
  - Filter chart by theme → Verify filtering
  - Notification trigger test (score ≥ 6)
- [ ] Write unit tests for all Oracle components

---

## 🧪 Testing Strategy

### Unit Tests (Vitest)

**Coverage:**
- `OracleService.ts`: All CRUD functions
- `oracleStore.ts`: State mutations and actions
- `OracleScoreCard.tsx`: Rendering logic for different scores
- `OracleThemeFilter.tsx`: Filter logic

**Example:**
```typescript
// tests/lib/OracleService.test.ts
describe('OracleService', () => {
  it('should create a new oracle entry', async () => {
    const entry = await OracleService.createOrUpdateEntry({
      date: '2025-12-03',
      score: 6,
      topTheme: 'Gaming',
      fullReport: 'Test report',
      read: false,
      notified: false,
      createdAt: Date.now(),
    });
    expect(entry).toHaveProperty('id');
  });

  it('should mark entry as read only once', async () => {
    const todayEntry = await OracleService.getTodayEntry();
    await OracleService.markAsRead(todayEntry.id);

    const updated = await OracleService.getTodayEntry();
    expect(updated.read).toBe(true);
  });
});
```

### E2E Tests (Playwright)

**Critical Flows:**
1. **Oracle Daily Flow**
   - Navigate to `/oracle`
   - Verify today's report loads or API is called
   - Click "Mark as Read"
   - Verify XP grant and journal entry creation
   - Check streak incremented

2. **Refresh Flow**
   - Load Oracle page
   - Click "Refresh" button
   - Verify API call and UI update

3. **Chart Filter Flow**
   - Load Oracle page
   - Select "Gaming" theme filter
   - Verify chart updates to show only Gaming entries

4. **Notification Flow**
   - Mock high score entry (≥ 6)
   - Load Oracle page
   - Verify notification permission request
   - Check notification displayed

**Example:**
```typescript
// tests/e2e/oracle/oracle.flows.spec.ts
import { test, expect } from '@playwright/test';

test('Oracle daily flow', async ({ page }) => {
  await page.goto('/oracle');

  // Wait for report to load
  await expect(page.getByTestId('oracle-report')).toBeVisible();

  // Mark as read
  await page.getByTestId('oracle-mark-read-button').click();

  // Verify XP notification
  await expect(page.getByText('50 XP')).toBeVisible();

  // Verify journal entry created
  await page.goto('/journal-v2');
  await expect(page.getByText(/Oracle.*meta-shift/i)).toBeVisible();
});
```

---

## ⚠️ Guardrails & Constraints

### Oracle-Specific Guardrails

1. **No Double XP Grant**
   - ✅ DO: Check `read` flag before granting XP
   - ❌ DON'T: Allow multiple XP grants per day

2. **API Rate Limiting**
   - ✅ DO: Cache today's report in Dexie, avoid excessive API calls
   - ❌ DON'T: Call `/api/oracle` on every page load

3. **Notification Spam Prevention**
   - ✅ DO: Check `notified` flag before showing notification
   - ❌ DON'T: Show notification multiple times for same entry

4. **Offline Fallback**
   - ✅ DO: If API fails, show last cached report
   - ❌ DON'T: Block UI or show hard error

5. **Score Validation**
   - ✅ DO: Validate score is 0-7, default to 3 if parsing fails
   - ❌ DON'T: Allow invalid scores to persist

6. **Theme Normalization**
   - ✅ DO: Normalize theme strings to OracleTheme type
   - ❌ DON'T: Allow arbitrary strings as themes

### Global Guardrails (from CLAUDE.md)

- **No CLI Commands**: Suggest commands, don't run them
- **No Config Weakening**: Fix root causes, don't mask errors
- **Type Safety First**: Use OracleTheme type, avoid `any`
- **Testing Required**: All features must have tests
- **Documentation First**: Update `/docs/` with changes

---

## 🔗 Integration Points Summary

### With Journal System
- **Auto Entry Creation**: When user marks Oracle as read
- **Tags**: `['meta-shift', normalizedTheme]`
- **Emotion**: `'discipline'` (ritual behavior)

### With Gamification
- **XP Grant**: 50 XP per day (via `markAsRead()`)
- **Streaks**: `journalStore.streaks.oracle` incremented daily
- **Badge**: "Oracle Master" unlocked at 21-day streak

### With Notifications
- **Web API**: Local notifications for score ≥ 6
- **Future**: Service Worker push (requires backend)

### With Event Bus
- **Events**:
  - `OracleReportLoaded` (telemetry)
  - `OracleMarkedAsRead` (behavior signal)
  - `OracleStreakMilestone` (gamification)

---

## 📚 Related Documentation

- **Global Overview**: `.rulesync/rules/overview.md`
- **Journal Domain**: `.claude/memories/journal-system.md`
- **API Specification**: `docs/core/oracle/API_SPEC.md` (to be created)
- **Domain Rules**: `docs/core/oracle/DOMAIN_RULES.md` (to be created)

---

## ✅ Definition of Done

This feature is considered **complete** when:

- [ ] All Phase 1-8 tasks are completed
- [ ] Unit test coverage ≥ 80% for Oracle modules
- [ ] E2E tests pass for all critical flows
- [ ] Documentation is complete and reviewed
- [ ] Code review completed by team
- [ ] Feature tested on mobile and desktop
- [ ] Accessibility audit passed (WCAG 2.1 Level AA)
- [ ] Performance metrics meet targets:
  - Oracle page loads in < 1s (cached)
  - API response time < 3s (Grok orchestration)
  - Chart renders in < 500ms (30-day data)
- [ ] Feature flag enabled for beta users
- [ ] Monitoring and telemetry configured

---

**Last Updated:** 2025-12-03
**Author:** Claude (AI Assistant)
**Status:** Planning Phase
**Next Step:** Phase 1 - Foundation Implementation
