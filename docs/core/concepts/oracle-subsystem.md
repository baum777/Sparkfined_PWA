# Daily Oracle Subsystem – Architecture & Integration Plan

**Status**: Concept / Planning Phase  
**Created**: 2025-12-04  
**Owner**: Sparkfined Team  
**Related**: Journal System, XP/Gamification, Grok Integration

---

## Executive Summary

The **Daily Oracle** is a curated meta-market intelligence system that delivers daily trading environment assessments at 09:00 UTC. It combines Grok-powered analysis across 7 crypto-market parameters (liquidity, volume, volatility, sentiment, trend strength, whale activity, CEX inflows) with thematic meta-shift predictions and early alpha discovery.

**Key Value Proposition:**
- **Ritual-based engagement**: Daily check-in becomes a habitual touchpoint
- **Context before trades**: Users understand the broader meta before taking positions
- **Behavioral signal**: Oracle consumption feeds into the Journal's AI analysis layer
- **Gamification bridge**: XP, streaks, badges tie Oracle reading to the Hero's Journey progression

This document outlines the complete integration plan for embedding the Oracle subsystem into the Sparkfined PWA.

---

## 1. System Overview

### 1.1 Core Components

```
┌─────────────────────────────────────────────────────────────┐
│                     DAILY ORACLE SUBSYSTEM                  │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────┐   │
│  │   Backend    │   │  Persistence │   │   Frontend   │   │
│  │  (Edge API)  │──▶│   (Dexie)    │──▶│  (Page/UI)   │   │
│  │              │   │              │   │              │   │
│  │  - Grok x3   │   │  - Reports   │   │  - Display   │   │
│  │  - Score     │   │  - History   │   │  - Charts    │   │
│  │  - Theme     │   │  - Flags     │   │  - Filter    │   │
│  └──────────────┘   └──────────────┘   └──────────────┘   │
│         │                   │                   │          │
│         └───────────────────┴───────────────────┘          │
│                             │                              │
│                             ▼                              │
│         ┌───────────────────────────────────┐              │
│         │  Integrations:                    │              │
│         │  - Journal (auto-entries)         │              │
│         │  - XP/Streaks (gamification)      │              │
│         │  - Notifications (high-score)     │              │
│         │  - Analytics (30-day chart)       │              │
│         └───────────────────────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

### 1.2 Data Flow

```
09:00 UTC Daily Cron
       │
       ▼
┌──────────────────┐
│  /api/oracle     │  (Vercel Function)
│                  │
│  1. Grok: Score  │  (7 params → 0-7)
│  2. Grok: Theme  │  (Meta probabilities)
│  3. Grok: Alpha  │  (Early signals)
│                  │
│  → Combine       │
└────────┬─────────┘
         │
         ▼
    { report, score, theme }
         │
         ├──────────────────────────────┐
         │                              │
         ▼                              ▼
  Server Storage              Client Request
  (Optional KV)               (On-demand)
         │                              │
         └──────────────────────────────┘
                       │
                       ▼
              ┌─────────────────┐
              │  Dexie: oracle  │
              │  Table          │
              │                 │
              │  - date         │
              │  - score        │
              │  - topTheme     │
              │  - fullReport   │
              │  - read         │
              │  - notified     │
              └─────────────────┘
                       │
         ┌─────────────┼─────────────┐
         │             │             │
         ▼             ▼             ▼
     UI Display   Notifications   Analytics
```

---

## 2. Backend Layer

### 2.1 API Endpoint: `/api/oracle`

**Location**: `/api/oracle.ts`  
**Runtime**: `edge` (low latency, global distribution)  
**Trigger**: 
- Daily Cron (09:00 UTC)
- On-demand (user refresh)

#### Request Flow

```typescript
export const config = { runtime: "edge" };

interface OracleResponse {
  report: string;    // Full combined report
  score: number;     // 0-7
  theme: string;     // e.g., "Gaming", "RWA"
  timestamp: number; // Unix ms
  date: string;      // YYYY-MM-DD
}

export default async function handler(req: Request): Promise<Response> {
  // 1. Auth check (Bearer token for Cron)
  const isAuthorized = validateAuth(req);
  if (!isAuthorized) {
    return json({ error: "Unauthorized" }, 401);
  }

  // 2. Execute 3 Grok prompts in parallel
  const [scoreResult, themeResult, alphaResult] = await Promise.all([
    grokScoreAnalysis(),   // 7-parameter score
    grokThemeAnalysis(),   // Meta-shift probabilities
    grokAlphaAnalysis(),   // Early CA discoveries
  ]);

  // 3. Combine reports
  const fullReport = combineReports(scoreResult, themeResult, alphaResult);
  const score = extractScore(scoreResult);
  const theme = extractTopTheme(themeResult);

  // 4. Return structured response
  return json({
    report: fullReport,
    score,
    theme,
    timestamp: Date.now(),
    date: new Date().toISOString().split('T')[0],
  });
}
```

#### Grok Prompts

**Prompt 1: Score Analysis**
```
Analyze the current crypto market across 7 parameters:
1. Liquidity (DEX depth, slippage)
2. Volume (24h trends, velocity)
3. Volatility (ATR, Bollinger bands)
4. Sentiment (Fear/Greed, CT vibe)
5. Trend Strength (momentum, breakout quality)
6. Whale Activity (large transfers, accumulation)
7. CEX Inflows (exchange net flows)

Output format:
SCORE: X/7
BREAKDOWN: [concise 1-2 line per parameter]
```

**Prompt 2: Theme Analysis**
```
Estimate meta-shift probabilities for the next 48h across:
- Gaming (play-to-earn, gaming tokens)
- RWA (real-world assets)
- AI Agents (autonomous agents, AI tokens)
- DePIN (decentralized physical infrastructure)
- Privacy/ZK (zero-knowledge, privacy coins)
- Collectibles/TCG (NFTs, trading card games)
- Stablecoin Yield (yield farms, stablecoin pairs)

Output format:
NEXT META PROBABILITIES:
- Gaming: 35%
- RWA: 25%
- AI Agents: 20%
...

TOP THEME: [highest probability theme]
```

**Prompt 3: Alpha Analysis**
```
Identify 2-3 early-stage contract addresses showing:
- Growing social momentum (Twitter mentions)
- Liquidity additions
- Holder concentration changes
- Low market cap (<$5M)

Output format:
EARLY ALPHA CAs:
1. [CA] - [Ticker] - [Brief thesis]
2. ...
```

### 2.2 Cron Configuration

**File**: `vercel.json`

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-temp-entries",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/oracle",
      "schedule": "0 9 * * *"
    }
  ]
}
```

**Schedule**: `0 9 * * *` = Daily at 09:00 UTC

**Auth**: Cron request includes `Authorization: Bearer <ORACLE_CRON_SECRET>` header.

### 2.3 Environment Variables

```bash
# .env.local (or Vercel Environment)
ORACLE_CRON_SECRET="<random-secret-256-bit>"
GROK_API_KEY="<grok-api-key>"
```

---

## 3. Persistence Layer (Dexie)

### 3.1 Database Schema

**New Database**: `sparkfined-oracle` (separate from `sparkfined-board` and `sparkfined-ta-pwa`)

**Rationale**: Oracle is a distinct domain with its own lifecycle, avoiding schema conflicts.

**Schema Definition** (`src/lib/db-oracle.ts`):

```typescript
import Dexie, { type Table } from 'dexie';

export interface OracleReport {
  id?: number;           // Auto-increment
  date: string;          // YYYY-MM-DD (logical primary key)
  score: number;         // 0-7
  topTheme: string;      // e.g., "Gaming"
  fullReport: string;    // Complete text
  read: boolean;         // XP guard flag
  notified: boolean;     // Notification guard flag
  timestamp: number;     // Unix ms (when fetched)
  createdAt: number;     // Unix ms (when created locally)
}

export class OracleDatabase extends Dexie {
  reports!: Table<OracleReport, number>;

  constructor() {
    super('sparkfined-oracle');

    this.version(1).stores({
      reports: '++id, date, score, topTheme, read, timestamp',
    });
  }
}

export const oracleDB = new OracleDatabase();
```

### 3.2 Data Operations

```typescript
// Save or update today's report
export async function putTodayReport(
  report: Omit<OracleReport, 'id'>
): Promise<number> {
  const existing = await oracleDB.reports
    .where('date')
    .equals(report.date)
    .first();

  if (existing) {
    await oracleDB.reports.update(existing.id!, {
      score: report.score,
      topTheme: report.topTheme,
      fullReport: report.fullReport,
      timestamp: report.timestamp,
    });
    return existing.id!;
  }

  return await oracleDB.reports.add({
    ...report,
    createdAt: Date.now(),
  });
}

// Load today's report
export async function getTodayReport(): Promise<OracleReport | undefined> {
  const today = new Date().toISOString().split('T')[0];
  return await oracleDB.reports
    .where('date')
    .equals(today)
    .first();
}

// Load last 30 days for chart
export async function getLast30DaysReports(): Promise<OracleReport[]> {
  const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
  return await oracleDB.reports
    .where('timestamp')
    .aboveOrEqual(thirtyDaysAgo)
    .toArray();
}

// Mark as read (XP trigger)
export async function markReportAsRead(date: string): Promise<void> {
  const report = await oracleDB.reports.where('date').equals(date).first();
  if (report && !report.read) {
    await oracleDB.reports.update(report.id!, { read: true });
  }
}

// Mark as notified (notification trigger)
export async function markReportAsNotified(date: string): Promise<void> {
  const report = await oracleDB.reports.where('date').equals(date).first();
  if (report && !report.notified) {
    await oracleDB.reports.update(report.id!, { notified: true });
  }
}
```

---

## 4. Frontend Layer

### 4.1 Navigation Integration

**File**: `src/components/layout/Sidebar.tsx`

**Modification**: Add Oracle nav item between Journal and Settings.

```typescript
import { Eye } from '@/lib/icons'; // Oracle icon

const primaryNavItems: NavItem[] = [
  { path: '/dashboard-v2', label: 'Board', Icon: Home },
  { path: '/analysis-v2', label: 'Analyze', Icon: BarChart3 },
  { path: '/chart-v2', label: 'Chart', Icon: TrendingUp },
  { path: '/journal-v2', label: 'Journal', Icon: FileText },
  { path: '/oracle', label: 'Oracle', Icon: Eye }, // NEW
  { path: '/alerts-v2', label: 'Alerts', Icon: Bell },
];
```

### 4.2 Routing

**File**: `src/routes/RoutesRoot.tsx`

```typescript
const OraclePage = lazy(() => import("../pages/OraclePage"));

// Inside <Routes>:
<Route path="/oracle" element={<OraclePage />} />
```

### 4.3 Oracle Page

**File**: `src/pages/OraclePage.tsx`

#### Structure

```
┌──────────────────────────────────────────────────────────┐
│ DashboardShell (title="Oracle")                          │
├──────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │  OracleHeader                                  │     │
│  │  - Score Badge (6/7)                           │     │
│  │  - Theme Badge (Gaming)                        │     │
│  │  - Refresh Button                              │     │
│  │  - Mark as Read Button                         │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │  OracleReportPanel                             │     │
│  │  - Full Report (Markdown or formatted text)    │     │
│  │  - Expandable sections:                        │     │
│  │    • Score Breakdown                           │     │
│  │    • Meta Themes                               │     │
│  │    • Early Alpha CAs                           │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │  OracleHistoryChart (30 days)                  │     │
│  │  - Line chart: Date → Score                    │     │
│  │  - Color-coded by Theme                        │     │
│  │  - Tooltip: Date, Score, Theme                 │     │
│  │  - Click to view full report for that day      │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │  OracleThemeFilter                             │     │
│  │  - Dropdown: All / Gaming / RWA / AI / ...     │     │
│  │  - Filters history chart and list below        │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
│  ┌────────────────────────────────────────────────┐     │
│  │  OracleHistoryList                             │     │
│  │  - Table/List of past reports (filtered)       │     │
│  │  - Columns: Date | Score | Theme | Actions     │     │
│  │  - Actions: View Full Report                   │     │
│  └────────────────────────────────────────────────┘     │
│                                                          │
└──────────────────────────────────────────────────────────┘
```

#### Implementation

```typescript
import React, { useEffect, useState, useMemo } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import { useOracleStore } from '@/store/oracleStore';
import { OracleHeader } from '@/components/oracle/OracleHeader';
import { OracleReportPanel } from '@/components/oracle/OracleReportPanel';
import { OracleHistoryChart } from '@/components/oracle/OracleHistoryChart';
import { OracleThemeFilter } from '@/components/oracle/OracleThemeFilter';
import { OracleHistoryList } from '@/components/oracle/OracleHistoryList';

export default function OraclePage() {
  const currentReport = useOracleStore((state) => state.currentReport);
  const history = useOracleStore((state) => state.history);
  const isLoading = useOracleStore((state) => state.isLoading);
  const error = useOracleStore((state) => state.error);
  const fetchTodayReport = useOracleStore((state) => state.fetchTodayReport);
  const fetchHistory = useOracleStore((state) => state.fetchHistory);
  const markAsRead = useOracleStore((state) => state.markAsRead);

  const [selectedTheme, setSelectedTheme] = useState<string>('All');

  useEffect(() => {
    // Load today's report and history on mount
    fetchTodayReport();
    fetchHistory();
  }, [fetchTodayReport, fetchHistory]);

  // Check for high score notification
  useEffect(() => {
    if (currentReport && currentReport.score >= 6 && !currentReport.notified) {
      // Trigger notification
      if (Notification.permission === 'granted') {
        new Notification('Meta-Shift incoming!', {
          body: currentReport.topTheme,
          icon: '/icon-192.png',
        });
      }
      // Mark as notified in DB
      useOracleStore.getState().markAsNotified(currentReport.date);
    }
  }, [currentReport]);

  const filteredHistory = useMemo(() => {
    if (selectedTheme === 'All') return history;
    return history.filter((report) => report.topTheme === selectedTheme);
  }, [history, selectedTheme]);

  const handleMarkAsRead = async () => {
    if (currentReport && !currentReport.read) {
      await markAsRead(currentReport.date);
      // Trigger XP/Streak/Journal integration (handled in store)
    }
  };

  return (
    <DashboardShell
      title="Oracle"
      description="Daily meta-market intelligence at 09:00 UTC"
    >
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6">
        {isLoading && <p className="text-text-tertiary">Loading Oracle...</p>}
        {error && <p className="text-warn">{error}</p>}

        {currentReport && (
          <>
            <OracleHeader
              report={currentReport}
              onRefresh={() => fetchTodayReport(true)}
              onMarkAsRead={handleMarkAsRead}
            />
            <OracleReportPanel report={currentReport} />
          </>
        )}

        <OracleHistoryChart data={filteredHistory} />

        <OracleThemeFilter
          selected={selectedTheme}
          onChange={setSelectedTheme}
        />

        <OracleHistoryList data={filteredHistory} />
      </div>
    </DashboardShell>
  );
}
```

### 4.4 Zustand Store

**File**: `src/store/oracleStore.ts`

```typescript
import { create } from 'zustand';
import {
  getTodayReport,
  putTodayReport,
  markReportAsRead,
  markReportAsNotified,
  getLast30DaysReports,
} from '@/lib/db-oracle';
import { useJournalStore } from '@/store/journalStore';
import type { OracleReport } from '@/lib/db-oracle';

interface OracleState {
  currentReport: OracleReport | null;
  history: OracleReport[];
  isLoading: boolean;
  error: string | null;
  
  fetchTodayReport: (forceRefresh?: boolean) => Promise<void>;
  fetchHistory: () => Promise<void>;
  markAsRead: (date: string) => Promise<void>;
  markAsNotified: (date: string) => Promise<void>;
}

export const useOracleStore = create<OracleState>((set, get) => ({
  currentReport: null,
  history: [],
  isLoading: false,
  error: null,

  fetchTodayReport: async (forceRefresh = false) => {
    set({ isLoading: true, error: null });
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Try to load from Dexie first
      if (!forceRefresh) {
        const cached = await getTodayReport();
        if (cached) {
          set({ currentReport: cached, isLoading: false });
          return;
        }
      }

      // Fetch from API
      const response = await fetch('/api/oracle', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Oracle report');
      }

      const data = await response.json();

      // Save to Dexie
      const reportId = await putTodayReport({
        date: data.date,
        score: data.score,
        topTheme: data.theme,
        fullReport: data.report,
        read: false,
        notified: false,
        timestamp: data.timestamp,
        createdAt: Date.now(),
      });

      // Reload from Dexie to get full record
      const savedReport = await getTodayReport();
      set({ currentReport: savedReport || null, isLoading: false });

    } catch (error) {
      console.error('[OracleStore] Failed to fetch report', error);
      
      // Fallback: Load last available report
      const fallback = await getTodayReport();
      set({
        currentReport: fallback || null,
        error: 'Could not load today\'s report. Showing cached data.',
        isLoading: false,
      });
    }
  },

  fetchHistory: async () => {
    try {
      const reports = await getLast30DaysReports();
      set({ history: reports });
    } catch (error) {
      console.error('[OracleStore] Failed to fetch history', error);
    }
  },

  markAsRead: async (date: string) => {
    try {
      await markReportAsRead(date);
      
      // Trigger XP/Streak/Journal integration
      const report = get().currentReport;
      if (report && report.date === date && !report.read) {
        // Grant XP
        useJournalStore.getState().addXP?.(50); // Assuming addXP exists
        
        // Increment Oracle streak
        // (This would be tracked in a gamification store or journalStore)
        
        // Create auto journal entry
        useJournalStore.getState().addEntry?.({
          id: `oracle-${date}`,
          title: `Oracle ${report.score}/7 → ${report.topTheme}`,
          date: new Date().toISOString(),
          direction: 'long', // Default
          notes: `Read Oracle report. Next meta-shift likely: ${report.topTheme}`,
          tags: ['meta-shift', report.topTheme.toLowerCase()],
          isAuto: true,
        });

        // Reload current report to reflect read flag
        get().fetchTodayReport();
      }
    } catch (error) {
      console.error('[OracleStore] Failed to mark as read', error);
    }
  },

  markAsNotified: async (date: string) => {
    try {
      await markReportAsNotified(date);
      // Reload current report
      get().fetchTodayReport();
    } catch (error) {
      console.error('[OracleStore] Failed to mark as notified', error);
    }
  },
}));
```

---

## 5. XP, Streaks & Gamification Integration

### 5.1 Current State Analysis

**Findings:**
- `JournalJourneyMeta` exists in `src/types/journal.ts` with `xpTotal`, `streak`, `phase`
- No global XP/Streak system outside of Journal entries
- Each journal entry can have its own `journeyMeta`

### 5.2 Proposed Gamification Store

**File**: `src/store/gamificationStore.ts` (NEW)

```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type JourneyPhase = 'DEGEN' | 'SEEKER' | 'WARRIOR' | 'MASTER' | 'SAGE';

interface Streaks {
  journal: number;      // Consecutive journal entries
  oracle: number;       // Consecutive Oracle reads
  analysis: number;     // Consecutive analysis sessions
}

interface Badge {
  id: string;
  name: string;
  description: string;
  unlockedAt: number;
}

interface GamificationState {
  xpTotal: number;
  phase: JourneyPhase;
  streaks: Streaks;
  badges: Badge[];
  lastActivityAt: number;

  // Actions
  addXP: (amount: number) => void;
  incrementStreak: (type: keyof Streaks) => void;
  resetStreak: (type: keyof Streaks) => void;
  unlockBadge: (badge: Badge) => void;
  computePhase: () => JourneyPhase;
}

// Phase thresholds
const PHASE_THRESHOLDS = {
  DEGEN: 0,
  SEEKER: 500,
  WARRIOR: 2000,
  MASTER: 5000,
  SAGE: 10000,
};

export const useGamificationStore = create<GamificationState>()(
  persist(
    (set, get) => ({
      xpTotal: 0,
      phase: 'DEGEN',
      streaks: {
        journal: 0,
        oracle: 0,
        analysis: 0,
      },
      badges: [],
      lastActivityAt: Date.now(),

      addXP: (amount: number) => {
        set((state) => {
          const newTotal = state.xpTotal + amount;
          const newPhase = computePhaseFromXP(newTotal);
          return {
            xpTotal: newTotal,
            phase: newPhase,
            lastActivityAt: Date.now(),
          };
        });
      },

      incrementStreak: (type: keyof Streaks) => {
        set((state) => ({
          streaks: {
            ...state.streaks,
            [type]: state.streaks[type] + 1,
          },
          lastActivityAt: Date.now(),
        }));

        // Check for streak badges
        const { streaks } = get();
        if (type === 'oracle' && streaks.oracle === 7 && !get().badges.find(b => b.id === 'oracle-week')) {
          get().unlockBadge({
            id: 'oracle-week',
            name: 'Oracle Devotee',
            description: 'Read Oracle 7 days in a row',
            unlockedAt: Date.now(),
          });
        }
        if (type === 'oracle' && streaks.oracle === 21 && !get().badges.find(b => b.id === 'oracle-master')) {
          get().unlockBadge({
            id: 'oracle-master',
            name: 'Oracle Master',
            description: 'Read Oracle 21 days in a row',
            unlockedAt: Date.now(),
          });
        }
      },

      resetStreak: (type: keyof Streaks) => {
        set((state) => ({
          streaks: {
            ...state.streaks,
            [type]: 0,
          },
        }));
      },

      unlockBadge: (badge: Badge) => {
        set((state) => {
          if (state.badges.find((b) => b.id === badge.id)) {
            return state; // Already unlocked
          }
          return {
            badges: [...state.badges, badge],
          };
        });
      },

      computePhase: () => {
        const { xpTotal } = get();
        return computePhaseFromXP(xpTotal);
      },
    }),
    {
      name: 'sparkfined-gamification',
    }
  )
);

function computePhaseFromXP(xp: number): JourneyPhase {
  if (xp >= PHASE_THRESHOLDS.SAGE) return 'SAGE';
  if (xp >= PHASE_THRESHOLDS.MASTER) return 'MASTER';
  if (xp >= PHASE_THRESHOLDS.WARRIOR) return 'WARRIOR';
  if (xp >= PHASE_THRESHOLDS.SEEKER) return 'SEEKER';
  return 'DEGEN';
}
```

### 5.3 Integration with Oracle Store

**Modified `markAsRead` in `oracleStore.ts`**:

```typescript
markAsRead: async (date: string) => {
  try {
    await markReportAsRead(date);
    
    const report = get().currentReport;
    if (report && report.date === date && !report.read) {
      // Grant XP via gamification store
      useGamificationStore.getState().addXP(50);
      
      // Increment Oracle streak
      useGamificationStore.getState().incrementStreak('oracle');
      
      // Create auto journal entry
      const { createQuickJournalEntry } = await import('@/store/journalStore');
      await createQuickJournalEntry({
        title: `Oracle ${report.score}/7`,
        notes: `Read Oracle report. Next meta-shift likely: ${report.topTheme}`,
      });

      // Reload current report
      get().fetchTodayReport();
    }
  } catch (error) {
    console.error('[OracleStore] Failed to mark as read', error);
  }
},
```

---

## 6. Notifications

### 6.1 High-Score Notification (Score ≥ 6)

**Trigger**: When a report with `score >= 6` is loaded and `notified === false`.

**Implementation** (in `OraclePage.tsx`):

```typescript
useEffect(() => {
  if (currentReport && currentReport.score >= 6 && !currentReport.notified) {
    // Request permission if not granted
    if (Notification.permission === 'default') {
      Notification.requestPermission();
    }
    
    // Send notification
    if (Notification.permission === 'granted') {
      new Notification('Meta-Shift incoming!', {
        body: `Oracle score: ${currentReport.score}/7 → ${currentReport.topTheme}`,
        icon: '/icon-192.png',
        badge: '/icon-96.png',
        tag: `oracle-${currentReport.date}`,
      });
    }
    
    // Mark as notified
    markReportAsNotified(currentReport.date);
  }
}, [currentReport]);
```

### 6.2 Service Worker Push (Future Enhancement)

**Goal**: Send push notifications even when the app is not open.

**Requirements**:
- Service Worker registration
- Push subscription (via Push API)
- Backend push server (e.g., Vercel KV + Web Push)

**Out of scope for Phase 1**, but architecture supports future integration.

---

## 7. Analytics & Exploration

### 7.1 30-Day Score Chart

**Component**: `OracleHistoryChart.tsx`

**Library**: Recharts (already used in Sparkfined)

```typescript
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface OracleHistoryChartProps {
  data: OracleReport[];
}

export function OracleHistoryChart({ data }: OracleHistoryChartProps) {
  const chartData = data.map((report) => ({
    date: report.date,
    score: report.score,
    theme: report.topTheme,
  }));

  return (
    <div className="rounded-3xl border border-border bg-surface p-6">
      <h3 className="mb-4 text-lg font-semibold text-text-primary">
        Oracle Score History (30 days)
      </h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <XAxis 
            dataKey="date" 
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
          />
          <YAxis 
            domain={[0, 7]}
            stroke="#64748b"
            tick={{ fill: '#94a3b8', fontSize: 12 }}
          />
          <Tooltip 
            contentStyle={{
              backgroundColor: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '12px',
              color: '#e2e8f0',
            }}
            formatter={(value: number, name: string, props: any) => {
              return [`Score: ${value}/7`, `Theme: ${props.payload.theme}`];
            }}
          />
          <Line 
            type="monotone" 
            dataKey="score" 
            stroke="#10b981" 
            strokeWidth={2}
            dot={{ fill: '#10b981', r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### 7.2 Theme Filter

**Component**: `OracleThemeFilter.tsx`

```typescript
interface OracleThemeFilterProps {
  selected: string;
  onChange: (theme: string) => void;
}

const THEMES = [
  'All',
  'Gaming',
  'RWA',
  'AI Agents',
  'DePIN',
  'Privacy/ZK',
  'Collectibles/TCG',
  'Stablecoin Yield',
];

export function OracleThemeFilter({ selected, onChange }: OracleThemeFilterProps) {
  return (
    <div className="flex items-center gap-3">
      <label className="text-sm font-medium text-text-secondary">
        Filter by Theme:
      </label>
      <div className="flex flex-wrap gap-2">
        {THEMES.map((theme) => (
          <button
            key={theme}
            onClick={() => onChange(theme)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              selected === theme
                ? 'border-brand bg-brand/10 text-brand'
                : 'border-border text-text-secondary hover:bg-surface-hover'
            }`}
          >
            {theme}
          </button>
        ))}
      </div>
    </div>
  );
}
```

### 7.3 History List

**Component**: `OracleHistoryList.tsx`

```typescript
interface OracleHistoryListProps {
  data: OracleReport[];
}

export function OracleHistoryList({ data }: OracleHistoryListProps) {
  const [selectedReport, setSelectedReport] = useState<OracleReport | null>(null);

  return (
    <div className="rounded-3xl border border-border bg-surface p-6">
      <h3 className="mb-4 text-lg font-semibold text-text-primary">
        Past Reports
      </h3>
      <div className="space-y-2">
        {data.map((report) => (
          <div
            key={report.id}
            className="flex items-center justify-between rounded-2xl border border-border bg-surface-subtle p-4 transition hover:bg-surface-hover"
          >
            <div className="flex items-center gap-4">
              <span className="text-sm text-text-tertiary">{report.date}</span>
              <span className="text-sm font-medium text-text-primary">
                Score: {report.score}/7
              </span>
              <span className="rounded-full bg-brand/10 px-3 py-1 text-xs font-medium text-brand">
                {report.topTheme}
              </span>
            </div>
            <button
              onClick={() => setSelectedReport(report)}
              className="text-sm font-medium text-brand hover:underline"
            >
              View Full Report
            </button>
          </div>
        ))}
      </div>

      {/* Modal for full report */}
      {selectedReport && (
        <OracleReportModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
        />
      )}
    </div>
  );
}
```

---

## 8. Testing Strategy

### 8.1 Unit Tests

**Files**:
- `tests/lib/db-oracle.test.ts` — Dexie operations
- `tests/store/oracleStore.test.ts` — Store logic
- `tests/store/gamificationStore.test.ts` — XP/Streak logic

**Coverage**:
- ✅ Save/Load reports from Dexie
- ✅ Mark as read/notified
- ✅ XP calculation
- ✅ Streak increment/reset
- ✅ Phase computation
- ✅ Badge unlocking

### 8.2 E2E Tests (Playwright)

**File**: `tests/e2e/oracle/oracle.flows.spec.ts`

**Test Cases**:

```typescript
test.describe('Oracle Flow', () => {
  test('should load today\'s Oracle report', async ({ page }) => {
    await page.goto('/oracle');
    await expect(page.getByTestId('oracle-score')).toBeVisible();
    await expect(page.getByTestId('oracle-theme')).toBeVisible();
  });

  test('should mark report as read and grant XP', async ({ page }) => {
    await page.goto('/oracle');
    await page.getByTestId('mark-as-read-button').click();
    
    // Check XP granted (assuming XP display in header)
    await expect(page.getByTestId('xp-display')).toContainText('+50');
  });

  test('should display 30-day history chart', async ({ page }) => {
    await page.goto('/oracle');
    await expect(page.getByTestId('oracle-history-chart')).toBeVisible();
  });

  test('should filter history by theme', async ({ page }) => {
    await page.goto('/oracle');
    await page.getByTestId('theme-filter-gaming').click();
    
    // Check filtered results
    const historyItems = page.getByTestId('history-item');
    const count = await historyItems.count();
    expect(count).toBeGreaterThan(0);
  });

  test('should send notification for high score', async ({ page, context }) => {
    // Mock notification permission
    await context.grantPermissions(['notifications']);
    
    await page.goto('/oracle');
    
    // Wait for notification (requires high score in test data)
    // This is tricky to test; consider mocking Notification API
  });
});
```

### 8.3 API Tests

**File**: `tests/api/oracle.test.ts`

**Coverage**:
- ✅ Unauthorized request (401)
- ✅ Valid Cron request (200)
- ✅ Response structure validation
- ✅ Grok API failure handling

---

## 9. Documentation & Handover

### 9.1 User-Facing Docs

**File**: `docs/core/guides/oracle-guide.md`

**Content**:
- What is the Oracle?
- How to read daily reports
- Understanding the score (0-7)
- Meta-themes explained
- How to earn XP and badges
- FAQ

### 9.2 Developer Docs

**File**: `docs/core/architecture/oracle-architecture.md` (this document)

**Content**:
- System overview
- Data flow diagrams
- API contracts
- Database schemas
- Integration points

### 9.3 Changelog

**File**: `CHANGELOG.md`

```markdown
## [Unreleased]

### Added
- **Oracle Subsystem**: Daily meta-market intelligence at 09:00 UTC
  - `/api/oracle` endpoint with Grok integration
  - Dexie persistence layer (`sparkfined-oracle` DB)
  - Oracle Page with 30-day history chart
  - Theme filtering and full report view
  - XP/Streak/Badge integration
  - High-score notifications (Score ≥ 6)
  - Auto-journal entries on Oracle read
```

---

## 10. Implementation Roadmap

### Phase 1: Core Infrastructure (Week 1)
- [x] Create Dexie schema (`src/lib/db-oracle.ts`) – verified via `tests/unit/oracle.db.test.ts`
- [x] Implement Zustand store (`src/store/oracleStore.ts`) – covered by `tests/unit/oracle.store.test.ts`
- [x] Build `/api/oracle` endpoint with mock Grok calls (`/api/oracle.ts`, `tests/api/oracle.test.ts`)
- [x] Add Oracle route to `RoutesRoot.tsx`
- [x] Add Oracle nav item to Sidebar
- [x] Create basic `OraclePage.tsx` with loading states (`tests/e2e/oracle/oracle.flows.spec.ts`)

### Phase 2: Grok Integration (Week 1-2)
- [x] Integrate real Grok API (score, theme, alpha prompts) via `callGrokPrompt` helper
- [x] Test prompt outputs and parsing in `tests/api/oracle.test.ts`
- [x] Add error handling for API failures (401/500 guardrails)
- [ ] Implement caching strategy (KV optional)

### Phase 3: UI Components (Week 2)
- [x] Build `OracleHeader` component (score badge, theme badge, buttons) – part of `src/pages/OraclePage.tsx`
- [x] Build `OracleReportPanel` (formatted report display)
- [x] Build `OracleHistoryChart` (Recharts line chart) – `src/components/oracle/OracleHistoryChart.tsx`
- [x] Build `OracleThemeFilter` (theme dropdown) – `src/components/oracle/OracleThemeFilter.tsx`
- [x] Build `OracleHistoryList` (past reports table + modal) – `src/components/oracle/OracleHistoryList.tsx`
- [x] Build `OracleReportModal` (full report viewer inside list modal)

### Phase 4: Gamification (Week 3)
- [x] Create `gamificationStore.ts` with XP/Streaks/Badges (`tests/unit/oracle.gamificationStore.test.ts`)
- [x] Integrate Oracle read → XP grant (`grantOracleReadRewards`)
- [x] Integrate Oracle read → Streak increment + badge unlocks (7/21 days)
- [x] Integrate Oracle read → Auto-journal entry (`createQuickJournalEntry`, `useJournalStore`)
- [ ] Display XP/Phase in UI (e.g., header widget)

### Phase 5: Notifications (Week 3)
- [ ] Implement local notification for high scores
- [ ] Add notification permission prompt
- [ ] Test notification on iOS/Android PWA
- [ ] (Optional) Implement Service Worker push

### Phase 6: Analytics (Week 4)
- [ ] Test 30-day chart with real data
- [ ] Add theme-based filtering
- [ ] Add tooltip with full report preview
- [ ] Optimize chart performance (virtualization if needed)

### Phase 7: Testing & QA (Week 4)
- [ ] Write unit tests for Dexie operations
- [ ] Write unit tests for stores
- [ ] Write E2E tests for Oracle flow
- [ ] Test API endpoint with load testing
- [ ] Test offline behavior (PWA)
- [ ] Accessibility audit (WCAG 2.1 AA)

### Phase 8: Documentation & Launch (Week 5)
- [ ] Write user guide (`oracle-guide.md`)
- [ ] Write developer docs (this document)
- [ ] Update `CHANGELOG.md`
- [ ] Create demo video / GIF for X announcement
- [ ] Soft launch to beta testers
- [ ] Public launch

---

## 11. Open Questions & Decisions

### Q1: Should Oracle reports be user-specific or global?

**Decision**: **Global** (same report for all users on a given day).

**Rationale**:
- Simplifies backend (one Grok call per day)
- Reduces API costs
- Creates a shared "community pulse" experience
- Users can discuss the same Oracle report on X

**Future**: Could add personalized recommendations based on user's Journal history.

---

### Q2: Should we cache Oracle reports in Vercel KV?

**Decision**: **Optional** (Phase 1: No; Phase 2: Yes if Cron reliability is critical).

**Rationale**:
- Phase 1: Dexie on client is sufficient for MVP
- Phase 2: If Cron fails or users join mid-day, KV provides a global cache
- KV enables "pre-warm" for all users at 09:00 UTC

**Implementation**:
```typescript
// In /api/oracle handler
const cached = await kv.get(`oracle:${today}`);
if (cached) return json(cached);

const report = await generateOracleReport();
await kv.set(`oracle:${today}`, report, { ex: 86400 }); // 24h TTL
return json(report);
```

---

### Q3: How to handle timezone differences for "daily" Oracle?

**Decision**: **All times UTC** (09:00 UTC = fixed global time).

**Rationale**:
- UTC is unambiguous
- Crypto markets are global
- Users can adjust their reading time, but the report is the same

**UX**: Show "Last updated: 09:15 UTC (2h ago)" in UI.

---

### Q4: Should Oracle score influence Alert priorities?

**Decision**: **No** (for Phase 1).

**Rationale**:
- Alerts and Oracle are separate domains
- Avoid over-complexity

**Future**: Could add "Meta-Shift Mode" where high Oracle scores trigger auto-enable of certain alerts.

---

### Q5: Should we allow users to "skip" days without breaking streak?

**Decision**: **No** (strict streaks, like Duolingo).

**Rationale**:
- Encourages daily engagement
- Clear rules (miss a day = reset)

**Alternative**: Add "Streak Freeze" badge (unlock at 30-day streak) that allows 1 skip.

---

## 12. Success Metrics

### KPIs (Key Performance Indicators)

| Metric | Target (Month 1) | How to Measure |
|--------|------------------|----------------|
| Daily Active Oracle Readers | 60% of DAU | Track `read` flag in Dexie |
| Avg Oracle Streak | 7 days | Track `streaks.oracle` in gamificationStore |
| High-Score Notification CTR | 80% | Track notification clicks → page visits |
| Oracle → Journal Entry Rate | 50% | Track auto-entries created after Oracle read |
| 21-Day Badge Unlocks | 20% of MAU | Track badge unlocks in gamificationStore |

### Qualitative Goals

- [ ] Users report Oracle helps them "set the tone" for their trading day
- [ ] Oracle discussions on X/Discord (community engagement)
- [ ] Users share Oracle reports as screenshots (social proof)

---

## 13. Rollout Plan

### Beta Phase (Week 5)
- Deploy to staging (`staging.sparkfined.com`)
- Invite 20-30 beta testers from Discord
- Collect feedback via in-app form
- Monitor errors (Sentry)
- Iterate on UX based on feedback

### Soft Launch (Week 6)
- Deploy to production
- Announce on X with teaser video
- Enable for 50% of users (feature flag via Vercel Edge Config)
- Monitor performance and engagement

### Full Launch (Week 7)
- Enable for 100% of users
- Announce full launch on X with case study / testimonials
- Publish blog post ("How Daily Oracle Changed My Trading Discipline")

---

## 14. Maintenance & Operations

### Daily Monitoring
- [ ] Check Cron execution logs (Vercel dashboard)
- [ ] Monitor Grok API latency and errors (Sentry)
- [ ] Track notification delivery rate (Web Push analytics)

### Weekly Review
- [ ] Review Oracle engagement metrics (Mixpanel/Plausible)
- [ ] Check for outlier scores (manual QA)
- [ ] Collect user feedback (Discord/support tickets)

### Monthly Optimization
- [ ] Refine Grok prompts based on user feedback
- [ ] Add new themes if meta shifts
- [ ] Update badge/XP thresholds if engagement drops

---

## 15. Appendix

### A. Type Definitions

**File**: `src/types/oracle.ts`

```typescript
export interface OracleReport {
  id?: number;
  date: string;          // YYYY-MM-DD
  score: number;         // 0-7
  topTheme: string;      // e.g., "Gaming"
  fullReport: string;    // Complete report text
  read: boolean;
  notified: boolean;
  timestamp: number;     // Unix ms
  createdAt: number;     // Unix ms
}

export interface OracleAPIResponse {
  report: string;
  score: number;
  theme: string;
  timestamp: number;
  date: string;
}

export const ORACLE_THEMES = [
  'Gaming',
  'RWA',
  'AI Agents',
  'DePIN',
  'Privacy/ZK',
  'Collectibles/TCG',
  'Stablecoin Yield',
] as const;

export type OracleTheme = typeof ORACLE_THEMES[number];
```

### B. Grok Prompt Templates

**File**: `src/lib/prompts/oracle.ts`

```typescript
export const SCORE_PROMPT = `
Analyze the current crypto market environment across 7 parameters:

1. **Liquidity**: DEX depth, slippage levels, available capital
2. **Volume**: 24h trading volume trends, velocity of capital
3. **Volatility**: ATR, Bollinger Band width, realized volatility
4. **Sentiment**: Fear & Greed Index, Crypto Twitter vibe, retail behavior
5. **Trend Strength**: Momentum indicators, breakout quality, follow-through
6. **Whale Activity**: Large wallet movements, accumulation/distribution patterns
7. **CEX Inflows**: Exchange net flows, funding rates

For each parameter, assign a rating:
- 0 = Extremely poor conditions
- 1 = Very unfavorable
- 2 = Unfavorable
- 3 = Neutral
- 4 = Favorable
- 5 = Very favorable
- 6 = Excellent
- 7 = Exceptional (rare)

Output format:
SCORE: X/7 (sum of all parameters)

BREAKDOWN:
1. Liquidity: X/7 - [1-2 sentence rationale]
2. Volume: X/7 - [1-2 sentence rationale]
...
7. CEX Inflows: X/7 - [1-2 sentence rationale]

OVERALL CONTEXT: [2-3 sentences summarizing the market environment]
`;

export const THEME_PROMPT = `
Based on the current market conditions, estimate the probability of a meta-shift towards each of these themes in the next 48 hours:

1. **Gaming**: Play-to-earn, gaming tokens (e.g., AXS, SAND, IMX)
2. **RWA**: Real-world assets, tokenized securities (e.g., ONDO, RIO)
3. **AI Agents**: Autonomous agents, AI-powered tokens (e.g., FET, AGIX)
4. **DePIN**: Decentralized physical infrastructure (e.g., HNT, RNDR)
5. **Privacy/ZK**: Zero-knowledge, privacy coins (e.g., ZK, ALEO)
6. **Collectibles/TCG**: NFTs, trading card games (e.g., BLUR, RARE)
7. **Stablecoin Yield**: Yield farms, stablecoin pairs (e.g., USDC/USDT farms)

Output format:
NEXT META PROBABILITIES:
- Gaming: XX%
- RWA: XX%
- AI Agents: XX%
- DePIN: XX%
- Privacy/ZK: XX%
- Collectibles/TCG: XX%
- Stablecoin Yield: XX%

TOP THEME: [Name of highest probability theme]

RATIONALE: [2-3 sentences explaining why this theme is most likely]
`;

export const ALPHA_PROMPT = `
Identify 2-3 early-stage Solana contract addresses (CAs) showing signs of potential:

Criteria:
- Market cap < $5M
- Growing social momentum (Twitter mentions, Telegram activity)
- Recent liquidity additions
- Holder concentration changes (whales accumulating)
- No obvious rug signals (locked liquidity, verified contract)

Output format:
EARLY ALPHA CAs:

1. **[CA]** - [Ticker]
   - MCap: $XXk
   - Thesis: [1-2 sentence pitch]
   - Risk: [High/Medium/Low]

2. **[CA]** - [Ticker]
   - MCap: $XXk
   - Thesis: [1-2 sentence pitch]
   - Risk: [High/Medium/Low]

DISCLAIMER: All are high-risk speculative plays. DYOR.
`;
```

### C. Component File Structure

```
src/
├── components/
│   ├── oracle/
│   │   ├── OracleHeader.tsx
│   │   ├── OracleReportPanel.tsx
│   │   ├── OracleHistoryChart.tsx
│   │   ├── OracleThemeFilter.tsx
│   │   ├── OracleHistoryList.tsx
│   │   └── OracleReportModal.tsx
│   └── ...
├── lib/
│   ├── db-oracle.ts
│   ├── prompts/
│   │   └── oracle.ts
│   └── ...
├── pages/
│   ├── OraclePage.tsx
│   └── ...
├── store/
│   ├── oracleStore.ts
│   ├── gamificationStore.ts
│   └── ...
├── types/
│   ├── oracle.ts
│   └── ...
└── ...

api/
├── oracle.ts
└── ...

tests/
├── e2e/
│   └── oracle/
│       └── oracle.flows.spec.ts
├── lib/
│   └── db-oracle.test.ts
└── store/
    ├── oracleStore.test.ts
    └── gamificationStore.test.ts
```

---

## 16. Related Documents

- [Journal System Architecture](./journal-system.md)
- [Signal Orchestrator](./signal-orchestrator.md)
- [Grok Pulse Integration](../ai/integration-recommendations.md)
- [PWA Offline Strategy](../architecture/pwa-audit/04_offline_sync_model.md)

---

## 17. Changelog

| Date | Author | Change |
|------|--------|--------|
| 2025-12-04 | Sparkfined Team | Initial draft |

---

---

## 18. Implementation Paths (Finalized)

**Status**: Validated against actual repository structure  
**Last Updated**: 2025-12-04

### Backend Layer

| Component | Path | Pattern | Notes |
|-----------|------|---------|-------|
| Oracle API Endpoint | `/api/oracle.ts` | Edge Function | Runtime: `edge`, Auth: Bearer token |
| Cron Secret Env Var | `ORACLE_CRON_SECRET` | Vercel Env | Validated in handler like `PULSE_CRON_SECRET` |
| Grok API Key Env Var | `XAI_API_KEY` | Vercel Env | Used internally by Edge Function only |

**Auth Pattern** (extracted from `api/grok-pulse/cron.ts`):
```typescript
const secret = process.env.ORACLE_CRON_SECRET?.trim();
const authHeader = req.headers.get("authorization") || "";
const [scheme, token] = authHeader.split(" ", 2);

if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
  return json({ ok: false, error: "Unauthorized" }, 401);
}

if (token.trim() !== secret) {
  return json({ ok: false, error: "Unauthorized" }, 401);
}
```

### Persistence Layer (Dexie)

| Component | Path | Pattern | Notes |
|-----------|------|---------|-------|
| Oracle Database | `src/lib/db-oracle.ts` | Separate Dexie DB | Database name: `sparkfined-oracle` |
| Oracle Types | `src/types/oracle.ts` | Type definitions | Exports: `OracleReport`, `OracleAPIResponse`, `OracleTheme` |

**Database Pattern** (follows `src/lib/db-board.ts`):
```typescript
import Dexie, { type Table } from 'dexie';

export class OracleDatabase extends Dexie {
  reports!: Table<OracleReport, number>;

  constructor() {
    super('sparkfined-oracle');

    this.version(1).stores({
      reports: '++id, date, score, topTheme, read, timestamp',
    });
  }
}

export const oracleDB = new OracleDatabase();
```

**Rationale for Separate Database**:
- Follows existing pattern: `sparkfined-ta-pwa` (journal/trades) and `sparkfined-board` (charts/alerts) are already separate
- Oracle is a distinct domain with its own lifecycle
- Avoids schema conflicts and version migrations across unrelated features
- Enables independent versioning and cleanup strategies

### State Management (Zustand)

| Component | Path | Pattern | Notes |
|-----------|------|---------|-------|
| Oracle Store | `src/store/oracleStore.ts` | Zustand store | No persistence (Dexie is source of truth) |
| Gamification Store | `src/store/gamificationStore.ts` | Zustand + persist | For XP/Streaks/Badges across all features |

**Store Pattern** (follows `src/store/journalStore.ts`):
```typescript
import { create } from 'zustand';

interface OracleState {
  currentReport: OracleReport | null;
  history: OracleReport[];
  isLoading: boolean;
  error: string | null;
  
  fetchTodayReport: (forceRefresh?: boolean) => Promise<void>;
  fetchHistory: () => Promise<void>;
  markAsRead: (date: string) => Promise<void>;
  markAsNotified: (date: string) => Promise<void>;
}

export const useOracleStore = create<OracleState>((set, get) => ({
  // ... implementation
}));
```

### Frontend Layer

| Component | Path | Pattern | Notes |
|-----------|------|---------|-------|
| Oracle Page | `src/pages/OraclePage.tsx` | Lazy-loaded page | Uses `DashboardShell` wrapper |
| Oracle Components | `src/components/oracle/` | Domain folder | All Oracle-specific UI components |
| - Header | `src/components/oracle/OracleHeader.tsx` | Sub-component | Score badge, theme badge, actions |
| - Report Panel | `src/components/oracle/OracleReportPanel.tsx` | Sub-component | Markdown/formatted report display |
| - History Chart | `src/components/oracle/OracleHistoryChart.tsx` | Sub-component | Uses Recharts (already in project) |
| - Theme Filter | `src/components/oracle/OracleThemeFilter.tsx` | Sub-component | Dropdown/button group |
| - History List | `src/components/oracle/OracleHistoryList.tsx` | Sub-component | Past reports table |
| - Report Modal | `src/components/oracle/OracleReportModal.tsx` | Sub-component | Full report viewer |

**Routing Integration** (modify `src/routes/RoutesRoot.tsx`):
```typescript
const OraclePage = lazy(() => import("../pages/OraclePage"));

// Inside <Routes>:
<Route path="/oracle" element={<OraclePage />} />
```

**Navigation Integration** (modify `src/components/layout/Sidebar.tsx`):
```typescript
import { Eye } from '@/lib/icons'; // Or appropriate icon

const primaryNavItems: NavItem[] = [
  { path: '/dashboard-v2', label: 'Board', Icon: Home },
  { path: '/analysis-v2', label: 'Analyze', Icon: BarChart3 },
  { path: '/chart-v2', label: 'Chart', Icon: TrendingUp },
  { path: '/journal-v2', label: 'Journal', Icon: FileText },
  { path: '/oracle', label: 'Oracle', Icon: Eye }, // NEW
  { path: '/alerts-v2', label: 'Alerts', Icon: Bell },
];
```

### Prompts & Templates

| Component | Path | Pattern | Notes |
|-----------|------|---------|-------|
| Grok Prompts | `src/lib/prompts/oracle.ts` | Template constants | `SCORE_PROMPT`, `THEME_PROMPT`, `ALPHA_PROMPT` |

### Testing

| Component | Path | Pattern | Notes |
|-----------|------|---------|-------|
| Dexie Tests | `tests/lib/db-oracle.test.ts` | Vitest unit tests | CRUD operations |
| Oracle Store Tests | `tests/store/oracleStore.test.ts` | Vitest unit tests | Store actions |
| Gamification Tests | `tests/store/gamificationStore.test.ts` | Vitest unit tests | XP/Streak logic |
| E2E Flow Tests | `tests/e2e/oracle/oracle.flows.spec.ts` | Playwright E2E | User flows |
| API Tests | `tests/api/oracle.test.ts` | Vitest unit tests | Endpoint validation |

---

## 19. Type Definitions (Finalized)

**File**: `src/types/oracle.ts`

### Core Types

```typescript
/**
 * Oracle Report - Persisted in Dexie
 */
export interface OracleReport {
  id?: number;           // Auto-increment (Dexie)
  date: string;          // YYYY-MM-DD (logical primary key)
  score: number;         // 0-7
  topTheme: string;      // e.g., "Gaming", "RWA"
  fullReport: string;    // Complete markdown text
  read: boolean;         // XP guard flag
  notified: boolean;     // Notification guard flag
  timestamp: number;     // Unix ms (when fetched from API)
  createdAt: number;     // Unix ms (when created locally)
}

/**
 * Oracle API Response - From /api/oracle
 */
export interface OracleAPIResponse {
  report: string;    // Full combined report
  score: number;     // 0-7
  theme: string;     // Top theme (e.g., "Gaming")
  timestamp: number; // Unix ms
  date: string;      // YYYY-MM-DD
}

/**
 * Oracle Themes - Supported meta-shift categories
 */
export const ORACLE_THEMES = [
  'Gaming',
  'RWA',
  'AI Agents',
  'DePIN',
  'Privacy/ZK',
  'Collectibles/TCG',
  'Stablecoin Yield',
] as const;

export type OracleTheme = typeof ORACLE_THEMES[number];
```

### Gamification Types

```typescript
/**
 * Journey Phase - Hero's Journey progression
 */
export type JourneyPhase = 'DEGEN' | 'SEEKER' | 'WARRIOR' | 'MASTER' | 'SAGE';

/**
 * Streaks - Consecutive activity tracking
 */
export interface Streaks {
  journal: number;      // Consecutive journal entries
  oracle: number;       // Consecutive Oracle reads
  analysis: number;     // Consecutive analysis sessions
}

/**
 * Badge - Unlockable achievement
 */
export interface Badge {
  id: string;           // Unique badge ID (e.g., "oracle-week")
  name: string;         // Display name (e.g., "Oracle Devotee")
  description: string;  // Badge description
  unlockedAt: number;   // Unix ms (when unlocked)
}

/**
 * Gamification State - Global XP/Streak/Badge tracking
 */
export interface GamificationState {
  xpTotal: number;
  phase: JourneyPhase;
  streaks: Streaks;
  badges: Badge[];
  lastActivityAt: number;
}
```

### Integration Types

```typescript
/**
 * Grok Prompt Result - Internal type for API processing
 */
export interface GrokPromptResult {
  raw: string;          // Raw Grok response
  parsed?: {            // Parsed structured data (if applicable)
    score?: number;
    theme?: string;
    alphas?: Array<{
      ca: string;
      ticker: string;
      thesis: string;
      risk: 'High' | 'Medium' | 'Low';
    }>;
  };
}

/**
 * Oracle Notification Payload - For Web Push / Service Worker
 */
export interface OracleNotification {
  title: string;
  body: string;
  icon: string;
  badge?: string;
  tag: string;
  data: {
    date: string;
    score: number;
    theme: string;
  };
}
```

---

## 20. Codex Implementation Backlog (Modules)

**Priority Order**: Sequential (each module builds on previous)  
**Total Estimated Effort**: ~4 weeks (1 senior engineer)

### Module 1: Oracle Dexie DB & Types

**Scope**:
- Create `src/types/oracle.ts` with all core types (`OracleReport`, `OracleAPIResponse`, `ORACLE_THEMES`)
- Create `src/lib/db-oracle.ts` with Dexie schema (separate database: `sparkfined-oracle`)
- Implement CRUD operations:
  - `putTodayReport(report)` → upsert by date
  - `getTodayReport()` → load today's report
  - `getLast30DaysReports()` → load history for chart
  - `markReportAsRead(date)` → flag for XP
  - `markReportAsNotified(date)` → flag for notification
- Write unit tests in `tests/lib/db-oracle.test.ts`:
  - Save/load reports
  - Date-based queries
  - Flag updates
  - Edge cases (no data, duplicate dates)

**Done Criteria**:
- ✅ All types exported from `src/types/oracle.ts`
- ✅ Dexie DB instantiated and versioned
- ✅ All CRUD operations tested with Vitest
- ✅ No TypeScript errors
- ✅ Coverage ≥ 80% for `db-oracle.ts`

---

### Module 2: Oracle Store & Gamification Store

**Scope**:
- Create `src/store/oracleStore.ts` with Zustand store:
  - State: `currentReport`, `history`, `isLoading`, `error`
  - Actions: `fetchTodayReport`, `fetchHistory`, `markAsRead`, `markAsNotified`
  - API integration (fetch from `/api/oracle`)
  - Dexie persistence (save fetched reports)
- Create `src/store/gamificationStore.ts` with Zustand + persist:
  - State: `xpTotal`, `phase`, `streaks`, `badges`, `lastActivityAt`
  - Actions: `addXP`, `incrementStreak`, `resetStreak`, `unlockBadge`, `computePhase`
  - Phase thresholds (DEGEN → SAGE)
  - Badge unlocking logic (7-day streak, 21-day streak)
- Wire `markAsRead` in `oracleStore` to trigger:
  - `gamificationStore.addXP(50)`
  - `gamificationStore.incrementStreak('oracle')`
  - Auto-journal entry (via `journalStore.createQuickJournalEntry`)
- Write unit tests in `tests/store/`:
  - Mock Dexie operations
  - Test XP calculation and phase transitions
  - Test streak increment/reset
  - Test badge unlocking

**Done Criteria**:
- ✅ Both stores fully implemented
- ✅ Oracle store fetches from API and persists to Dexie
- ✅ Gamification store persists to localStorage (via Zustand persist)
- ✅ `markAsRead` triggers XP/Streak/Journal integrations
- ✅ All store tests passing with ≥ 80% coverage
- ✅ No TypeScript errors

---

### Module 3: Edge Function /api/oracle

**Scope**:
- Create `/api/oracle.ts` with Edge Function runtime
- Implement Bearer token auth (pattern from `api/grok-pulse/cron.ts`)
  - Validate `ORACLE_CRON_SECRET` from env
  - Return 401 if unauthorized
- Implement Grok API integration:
  - Create `src/lib/prompts/oracle.ts` with 3 prompts (score, theme, alpha)
  - Call Grok API 3x in parallel (`Promise.all`)
  - Parse responses (regex or structured prompts)
  - Combine into full report
- Return structured response:
  - `{ report, score, theme, timestamp, date }`
- Add Vercel Cron config to `vercel.json`:
  - Path: `/api/oracle`
  - Schedule: `0 9 * * *` (09:00 UTC daily)
- Error handling:
  - Grok API failures (retry once, fallback to cached)
  - Rate limits (log and return 429)
  - Malformed responses (log and return 500)
- Write API tests in `tests/api/oracle.test.ts`:
  - Unauthorized request (401)
  - Valid Cron request (200)
  - Response structure validation
  - Grok API failure handling

**Done Criteria**:
- ✅ `/api/oracle.ts` endpoint deployed
- ✅ Auth working (401 for invalid token)
- ✅ Grok API calls successful (3 prompts)
- ✅ Response structure matches `OracleAPIResponse` type
- ✅ Cron config added to `vercel.json`
- ✅ API tests passing
- ✅ Manual test: `curl -H "Authorization: Bearer <token>" https://staging.sparkfined.com/api/oracle`

---

### Module 4: Oracle Page & Navigation

**Scope**:
- Create `src/pages/OraclePage.tsx`:
  - Use `DashboardShell` wrapper (title: "Oracle")
  - Load today's report on mount (`fetchTodayReport`)
  - Load history on mount (`fetchHistory`)
  - Handle loading/error states
  - Render `OracleHeader` and `OracleReportPanel`
- Create `src/components/oracle/OracleHeader.tsx`:
  - Display score badge (e.g., "6/7")
  - Display theme badge (e.g., "Gaming")
  - Refresh button (force fetch)
  - "Mark as Read" button (disabled if already read)
- Create `src/components/oracle/OracleReportPanel.tsx`:
  - Display full report (markdown or plain text)
  - Expandable sections (score breakdown, themes, alphas)
  - Copy-to-clipboard button
- Add Oracle route to `src/routes/RoutesRoot.tsx`:
  - Lazy-load `OraclePage`
  - Route: `/oracle`
- Add Oracle nav item to `src/components/layout/Sidebar.tsx`:
  - Icon: `Eye` (or appropriate)
  - Label: "Oracle"
  - Path: `/oracle`
  - Position: Between Journal and Alerts
- Style components with Tailwind (follow existing design tokens)

**Done Criteria**:
- ✅ Oracle page accessible at `/oracle`
- ✅ Sidebar shows Oracle nav item
- ✅ Page loads today's report
- ✅ Header displays score and theme badges
- ✅ Report panel shows full text
- ✅ "Mark as Read" button triggers XP/Streak/Journal
- ✅ Responsive design (mobile + desktop)
- ✅ No TypeScript errors

---

### Module 5: Notifications & Auto-Journal

**Scope**:
- Implement high-score notification in `OraclePage.tsx`:
  - `useEffect` to watch `currentReport`
  - If `score >= 6` and `!notified`:
    - Request notification permission (if default)
    - Send local notification (Web Notification API)
    - Mark as notified in DB
- Add notification click handler:
  - Focus app (if backgrounded)
  - Navigate to `/oracle` (if not already there)
- Implement auto-journal entry on "Mark as Read":
  - Call `journalStore.createQuickJournalEntry`
  - Title: `Oracle ${score}/7 → ${theme}`
  - Notes: `Read Oracle report. Next meta-shift likely: ${theme}`
  - Tags: `['meta-shift', theme.toLowerCase()]`
- Test notifications:
  - Desktop: Chrome, Firefox, Safari
  - Mobile PWA: iOS Safari, Android Chrome
  - Permission denied fallback (silent)
- Add notification icon/badge assets to `public/icons/`

**Done Criteria**:
- ✅ Notifications work on high score (≥ 6)
- ✅ Notifications only sent once per report
- ✅ Auto-journal entry created on "Mark as Read"
- ✅ Notification permission prompt shown (if needed)
- ✅ Notification click navigates to Oracle page
- ✅ Works offline (notification queued until online)
- ✅ No crashes if notifications blocked

---

### Module 6: Analytics (Chart, Filter, History)

**Scope**:
- Create `src/components/oracle/OracleHistoryChart.tsx`:
  - Use Recharts `LineChart` (already in project)
  - Data: Last 30 days of reports
  - X-axis: Date (YYYY-MM-DD)
  - Y-axis: Score (0-7)
  - Line: Color-coded by theme (e.g., Gaming = green, RWA = blue)
  - Tooltip: Show date, score, theme
  - Click on point: Open full report for that day
- Create `src/components/oracle/OracleThemeFilter.tsx`:
  - Dropdown or button group (All | Gaming | RWA | AI Agents | ...)
  - Filter state: `selectedTheme`
  - Apply filter to history chart and list
- Create `src/components/oracle/OracleHistoryList.tsx`:
  - Table/list of past reports (filtered by theme)
  - Columns: Date | Score | Theme | Actions
  - Actions: "View Full Report" button
  - Pagination (if > 30 items)
- Create `src/components/oracle/OracleReportModal.tsx`:
  - Modal overlay with full report
  - Close button (X)
  - Copy-to-clipboard button
  - Keyboard shortcuts (Esc to close)
- Wire components in `OraclePage.tsx`:
  - State: `selectedTheme`, `selectedReportForModal`
  - Filter history by theme
  - Pass filtered data to chart and list
  - Open modal when "View Full Report" clicked
- Optimize chart performance:
  - Virtualization (if needed for large datasets)
  - Debounce filter changes
  - Memoize filtered data

**Done Criteria**:
- ✅ Chart displays 30-day score history
- ✅ Theme filter works (filters chart and list)
- ✅ History list shows past reports
- ✅ Click on chart point opens full report modal
- ✅ Modal displays full report with markdown formatting
- ✅ No performance issues with 30+ reports
- ✅ Responsive design (chart resizes on mobile)
- ✅ No TypeScript errors

---

### Module 7: Tests & E2E

**Scope**:
- Write E2E tests in `tests/e2e/oracle/oracle.flows.spec.ts`:
  - **Test 1: Load Oracle page**
    - Navigate to `/oracle`
    - Verify page loads
    - Verify today's report displays
    - Verify score and theme badges visible
  - **Test 2: Mark as read**
    - Click "Mark as Read" button
    - Verify XP increased (check header/UI)
    - Verify streak incremented (check gamification state)
    - Verify auto-journal entry created (check journal page)
  - **Test 3: View history chart**
    - Verify chart displays
    - Click on a point
    - Verify modal opens with full report
  - **Test 4: Filter by theme**
    - Click theme filter button (e.g., "Gaming")
    - Verify history list filtered
    - Verify chart filtered
  - **Test 5: Notification (high score)**
    - Mock high-score report (score = 6)
    - Grant notification permission
    - Verify notification sent
    - Click notification
    - Verify navigates to Oracle page
- Add `data-testid` attributes to all components:
  - `oracle-score`, `oracle-theme`, `mark-as-read-button`, `oracle-history-chart`, `theme-filter-{theme}`, `history-item`, etc.
- Write integration tests in `tests/components/oracle/`:
  - Test each component in isolation
  - Mock store state and actions
  - Verify rendering and interactions
- Run Playwright E2E:
  - `pnpm test:e2e`
  - Fix flaky tests (use `waitFor` instead of `wait`)
  - Ensure all tests pass consistently

**Done Criteria**:
- ✅ All E2E tests passing
- ✅ All component tests passing
- ✅ E2E tests use stable `data-testid` selectors
- ✅ No flaky tests (run 10x consecutively)
- ✅ Coverage ≥ 80% for Oracle components
- ✅ CI pipeline green (GitHub Actions)

---

## 21. Open Decisions & Next Steps

### Decision Matrix

| Decision | Status | Rationale |
|----------|--------|-----------|
| Separate Dexie DB for Oracle? | ✅ **Approved** | Follows existing pattern (`sparkfined-board` is separate) |
| Global or user-specific reports? | ✅ **Global** | Simplifies backend, reduces costs, creates community pulse |
| Cache reports in Vercel KV? | ⏸️ **Phase 2** | Not needed for MVP; add later if Cron reliability is critical |
| Allow streak "freezes"? | ❌ **No** | Strict streaks (like Duolingo) encourage daily engagement |
| Oracle score influences Alerts? | ❌ **Phase 1: No** | Separate domains; can add "Meta-Shift Mode" in future |

### Integration Checklist

**Before starting implementation:**
- [ ] Validate `XAI_API_KEY` is available in Vercel env
- [ ] Create `ORACLE_CRON_SECRET` in Vercel env (256-bit random)
- [ ] Confirm Grok API quota and rate limits
- [ ] Verify Recharts is installed (`pnpm list recharts`)
- [ ] Test Web Notification API in PWA context (iOS/Android)

**During implementation:**
- [ ] Run `pnpm typecheck` after each module
- [ ] Run `pnpm lint` to catch style issues
- [ ] Update `docs/core/concepts/oracle-subsystem.md` after each module
- [ ] Test offline behavior (Service Worker caching)
- [ ] Test on staging environment before production deploy

**After implementation:**
- [ ] Update `CHANGELOG.md` with Oracle feature
- [ ] Write user-facing guide: `docs/core/guides/oracle-guide.md`
- [ ] Create demo video/GIF for X announcement
- [ ] Soft launch to beta testers (feature flag: 50% users)
- [ ] Monitor metrics (engagement, XP, streaks) for 1 week
- [ ] Full launch (100% users) after validation

---

## 22. Environment Variables (Complete List)

### Required

| Variable | Purpose | Example | Where to Set |
|----------|---------|---------|--------------|
| `ORACLE_CRON_SECRET` | Bearer token for Cron auth | `<256-bit-random>` | Vercel Dashboard → Environment Variables |
| `XAI_API_KEY` | Grok API key for report generation | `xai-...` | Vercel Dashboard → Environment Variables |

### Optional (Phase 2+)

| Variable | Purpose | Example | Where to Set |
|----------|---------|---------|--------------|
| `KV_REST_API_URL` | Vercel KV URL (if caching reports) | `https://...` | Vercel Dashboard → Storage |
| `KV_REST_API_TOKEN` | Vercel KV token | `...` | Vercel Dashboard → Storage |

### Local Development (.env.local)

```bash
# Oracle Subsystem
ORACLE_CRON_SECRET="your-secret-here"
XAI_API_KEY="xai-your-key-here"

# Optional (Phase 2)
# KV_REST_API_URL="https://..."
# KV_REST_API_TOKEN="..."
```

**Security Notes**:
- **NEVER** commit `.env.local` to git (already in `.gitignore`)
- **NEVER** expose `XAI_API_KEY` to client-side code
- Rotate `ORACLE_CRON_SECRET` every 90 days
- Use Vercel's "Preview" environment for staging tests

---

**End of Document**
