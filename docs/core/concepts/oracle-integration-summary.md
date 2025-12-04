# Daily Oracle Subsystem – Integration Summary

**Status**: Architecture Finalized  
**Date**: 2025-12-04  
**Author**: Claude (Repo Navigator)  

---

## Executive Summary

The Daily Oracle Subsystem architecture has been **validated and harmonized** with the existing Sparkfined PWA repository structure. All implementation paths have been finalized based on actual patterns found in the codebase.

**Key Achievements:**
✅ Validated file paths against real repo structure  
✅ Extracted auth patterns from existing Edge Functions  
✅ Aligned Dexie DB strategy with existing databases  
✅ Mapped TypeScript types to existing conventions  
✅ Created 7-module implementation backlog with clear Done Criteria  

---

## Finalized Implementation Paths

### Backend Layer

| Component | Final Path | Pattern Source |
|-----------|------------|----------------|
| Oracle API | `/api/oracle.ts` | Edge Function (like `api/grok-pulse/cron.ts`) |
| Auth Secret | `ORACLE_CRON_SECRET` | Env var (pattern from `PULSE_CRON_SECRET`) |
| Grok API Key | `XAI_API_KEY` | Env var (used internally only) |

**Auth Pattern Validated:**
```typescript
// Extracted from api/grok-pulse/cron.ts
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

### Persistence Layer

| Component | Final Path | Pattern Source |
|-----------|------------|----------------|
| Oracle Database | `src/lib/db-oracle.ts` | Dexie class (like `src/lib/db-board.ts`) |
| Oracle Types | `src/types/oracle.ts` | Type definitions (like `src/types/journal.ts`) |

**Database Strategy:**
- **Separate Dexie DB**: `sparkfined-oracle` (follows existing pattern)
- **Rationale**: Repo already uses multiple DBs:
  - `sparkfined-ta-pwa` (journal, trades, replay)
  - `sparkfined-board` (charts, alerts, feed)
  - Oracle is a distinct domain → separate DB

**Schema Pattern:**
```typescript
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

### State Management

| Component | Final Path | Pattern Source |
|-----------|------------|----------------|
| Oracle Store | `src/store/oracleStore.ts` | Zustand (like `src/store/journalStore.ts`) |
| Gamification Store | `src/store/gamificationStore.ts` | Zustand + persist (new) |

**Store Pattern:**
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

| Component | Final Path | Pattern Source |
|-----------|------------|----------------|
| Oracle Page | `src/pages/OraclePage.tsx` | Lazy-loaded page (like `src/pages/JournalPageV2.tsx`) |
| Oracle Components | `src/components/oracle/` | Domain folder (like `src/components/journal/`) |
| Routing | `src/routes/RoutesRoot.tsx` | React Router v6 (modify) |
| Navigation | `src/components/layout/Sidebar.tsx` | NavLink array (modify) |

**Routing Integration:**
```typescript
const OraclePage = lazy(() => import("../pages/OraclePage"));

// Inside <Routes>:
<Route path="/oracle" element={<OraclePage />} />
```

**Sidebar Integration:**
```typescript
import { Eye } from '@/lib/icons';

const primaryNavItems: NavItem[] = [
  { path: '/dashboard-v2', label: 'Board', Icon: Home },
  { path: '/analysis-v2', label: 'Analyze', Icon: BarChart3 },
  { path: '/chart-v2', label: 'Chart', Icon: TrendingUp },
  { path: '/journal-v2', label: 'Journal', Icon: FileText },
  { path: '/oracle', label: 'Oracle', Icon: Eye }, // NEW
  { path: '/alerts-v2', label: 'Alerts', Icon: Bell },
];
```

---

## Type Definitions (Finalized)

**File**: `src/types/oracle.ts`

### Core Types

```typescript
export interface OracleReport {
  id?: number;           // Auto-increment
  date: string;          // YYYY-MM-DD
  score: number;         // 0-7
  topTheme: string;      // e.g., "Gaming"
  fullReport: string;    // Complete text
  read: boolean;         // XP guard flag
  notified: boolean;     // Notification guard flag
  timestamp: number;     // Unix ms (when fetched)
  createdAt: number;     // Unix ms (when created locally)
}

export interface OracleAPIResponse {
  report: string;    // Full combined report
  score: number;     // 0-7
  theme: string;     // Top theme
  timestamp: number; // Unix ms
  date: string;      // YYYY-MM-DD
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

### Gamification Types

```typescript
export type JourneyPhase = 'DEGEN' | 'SEEKER' | 'WARRIOR' | 'MASTER' | 'SAGE';

export interface Streaks {
  journal: number;
  oracle: number;
  analysis: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  unlockedAt: number;
}

export interface GamificationState {
  xpTotal: number;
  phase: JourneyPhase;
  streaks: Streaks;
  badges: Badge[];
  lastActivityAt: number;
}
```

---

## Implementation Backlog (7 Modules)

**Total Estimated Effort**: ~4 weeks (1 senior engineer)

### Module 1: Oracle Dexie DB & Types
- Create `src/types/oracle.ts`
- Create `src/lib/db-oracle.ts` (separate DB: `sparkfined-oracle`)
- Implement CRUD operations
- Write unit tests (`tests/lib/db-oracle.test.ts`)

### Module 2: Oracle Store & Gamification Store
- Create `src/store/oracleStore.ts` (Zustand)
- Create `src/store/gamificationStore.ts` (Zustand + persist)
- Wire `markAsRead` to trigger XP/Streak/Journal
- Write unit tests (`tests/store/`)

### Module 3: Edge Function /api/oracle
- Create `/api/oracle.ts` (Edge runtime)
- Implement Bearer token auth
- Integrate Grok API (3 prompts in parallel)
- Add Vercel Cron config to `vercel.json`
- Write API tests (`tests/api/oracle.test.ts`)

### Module 4: Oracle Page & Navigation
- Create `src/pages/OraclePage.tsx`
- Create `src/components/oracle/` components:
  - `OracleHeader.tsx`
  - `OracleReportPanel.tsx`
- Add route to `src/routes/RoutesRoot.tsx`
- Add nav item to `src/components/layout/Sidebar.tsx`

### Module 5: Notifications & Auto-Journal
- Implement high-score notification (score ≥ 6)
- Implement auto-journal entry on "Mark as Read"
- Test on desktop and mobile PWA
- Add notification assets to `public/icons/`

### Module 6: Analytics (Chart, Filter, History)
- Create `OracleHistoryChart.tsx` (Recharts)
- Create `OracleThemeFilter.tsx`
- Create `OracleHistoryList.tsx`
- Create `OracleReportModal.tsx`
- Wire components in `OraclePage.tsx`

### Module 7: Tests & E2E
- Write E2E tests (`tests/e2e/oracle/oracle.flows.spec.ts`)
- Add `data-testid` attributes
- Write component tests (`tests/components/oracle/`)
- Run Playwright E2E and fix flaky tests

---

## Key Architectural Decisions

### ✅ Approved Decisions

| Decision | Rationale |
|----------|-----------|
| **Separate Dexie DB** | Follows existing pattern (board DB is separate); Oracle is distinct domain |
| **Global Reports** | Simplifies backend, reduces costs, creates community pulse experience |
| **Zustand (no persist)** | Dexie is source of truth; store is just UI state |
| **Gamification Store** | Global XP/Streak/Badge tracking across all features (Journal, Oracle, Analysis) |
| **Edge Function** | Low latency, global distribution, same pattern as Grok Pulse |

### ⏸️ Deferred to Phase 2

| Decision | Reason |
|----------|--------|
| **Vercel KV Caching** | Not needed for MVP; add later if Cron reliability is critical |
| **Service Worker Push** | Local notifications sufficient for Phase 1; push requires backend infra |
| **Oracle → Alerts Integration** | Separate domains; can add "Meta-Shift Mode" in future |

### ❌ Rejected

| Decision | Reason |
|----------|--------|
| **Streak Freezes** | Strict streaks (like Duolingo) encourage daily engagement |
| **User-specific Reports** | Too complex; global reports create community pulse |

---

## Environment Variables

### Required

```bash
ORACLE_CRON_SECRET="<256-bit-random>"   # Bearer token for Cron auth
XAI_API_KEY="xai-..."                   # Grok API key (server-side only)
```

### How to Set

**Vercel Dashboard:**
1. Go to Project → Settings → Environment Variables
2. Add `ORACLE_CRON_SECRET` (256-bit random, e.g., `openssl rand -base64 32`)
3. Add `XAI_API_KEY` (from x.ai dashboard)
4. Set for: Production, Preview, Development

**Local Development:**
```bash
# .env.local
ORACLE_CRON_SECRET="your-secret-here"
XAI_API_KEY="xai-your-key-here"
```

---

## Cron Configuration

**File**: `vercel.json` (modify)

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

---

## Testing Strategy

### Unit Tests (Vitest)

| Test Suite | Path | Coverage |
|------------|------|----------|
| Dexie Operations | `tests/lib/db-oracle.test.ts` | CRUD, queries, flags |
| Oracle Store | `tests/store/oracleStore.test.ts` | Actions, API integration |
| Gamification Store | `tests/store/gamificationStore.test.ts` | XP, streaks, badges |

### E2E Tests (Playwright)

| Test Flow | Path | Coverage |
|-----------|------|----------|
| Oracle Flows | `tests/e2e/oracle/oracle.flows.spec.ts` | Load, read, notifications, history |

### API Tests

| Test Suite | Path | Coverage |
|------------|------|----------|
| Oracle API | `tests/api/oracle.test.ts` | Auth, response structure, errors |

---

## Pre-Implementation Checklist

### Validation
- [ ] Confirm `XAI_API_KEY` is available in Vercel env
- [ ] Create `ORACLE_CRON_SECRET` (256-bit random)
- [ ] Verify Grok API quota and rate limits
- [ ] Test Web Notification API in PWA context

### Dependencies
- [ ] Verify Recharts is installed (`pnpm list recharts`)
- [ ] Verify Dexie is installed (`pnpm list dexie`)
- [ ] Verify Lucide icons include `Eye` or appropriate Oracle icon

### Documentation
- [ ] Read full architecture: `docs/core/concepts/oracle-subsystem.md`
- [ ] Read journal integration: `docs/core/concepts/journal-system.md`
- [ ] Review guardrails: `CLAUDE.md`, `AGENTS.md`

---

## Post-Implementation Checklist

### Validation
- [ ] Run `pnpm typecheck` (no errors)
- [ ] Run `pnpm lint` (no errors)
- [ ] Run `pnpm test` (all unit tests pass)
- [ ] Run `pnpm test:e2e` (all E2E tests pass)

### Documentation
- [ ] Update `CHANGELOG.md` with Oracle feature
- [ ] Write user guide: `docs/core/guides/oracle-guide.md`
- [ ] Update `docs/index.md` with Oracle references

### Deployment
- [ ] Deploy to staging and test manually
- [ ] Test offline behavior (Service Worker caching)
- [ ] Test on iOS PWA and Android PWA
- [ ] Monitor Sentry for errors
- [ ] Soft launch (50% feature flag) for 1 week
- [ ] Full launch (100%) after validation

---

## Open Questions

**None.** All architectural decisions have been finalized.

**Minor Implementation Details** (to be resolved during coding):
1. **Icon Choice**: Use `Eye`, `Sparkles`, or `Zap` for Oracle nav item? → Suggest: `Eye` (mystery/vision)
2. **Notification Sound**: Use default or custom? → Suggest: Default (avoid PWA audio permission)
3. **Report Formatting**: Plain text or markdown? → Suggest: Markdown (richer UX)

---

## Success Metrics (Phase 1)

| Metric | Target (Month 1) | How to Measure |
|--------|------------------|----------------|
| Daily Active Oracle Readers | 60% of DAU | Track `read` flag in Dexie |
| Avg Oracle Streak | 7 days | Track `streaks.oracle` in gamificationStore |
| High-Score Notification CTR | 80% | Track notification clicks → page visits |
| Oracle → Journal Entry Rate | 50% | Track auto-entries created after Oracle read |

---

## Next Steps

1. **For Product Owner**:
   - Review this summary and full architecture: `docs/core/concepts/oracle-subsystem.md`
   - Approve architectural decisions
   - Set up `ORACLE_CRON_SECRET` and `XAI_API_KEY` in Vercel Dashboard

2. **For Engineer (Codex)**:
   - Start with Module 1 (Dexie DB & Types)
   - Follow 7-module backlog sequentially
   - Run tests after each module
   - Update docs after each module

3. **For QA**:
   - Prepare test devices (iOS PWA, Android PWA, Desktop)
   - Validate notification permissions on each platform
   - Test offline behavior (airplane mode)
   - Test Cron execution (staging environment)

---

**Document Status**: ✅ Complete  
**Reviewed By**: Claude (Repo Navigator)  
**Last Updated**: 2025-12-04  

For full details, see: `docs/core/concepts/oracle-subsystem.md`
