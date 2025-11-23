# Migration Plan: Serverless Function Consolidation

**Status:** 🔴 **35 Functions** → **12 Functions** (Vercel Hobby Limit)
**Goal:** Reduce to **10 Functions** (buffer of 2)
**Timeline:** 4 Phases, ~8-12 hours total
**Risk Level:** 🟡 Medium (requires careful testing, breaking changes for frontend)

---

## Executive Summary

**Problem:**
Vercel Hobby Plan allows max 12 Serverless Functions. Current deployment has 35 functions → **+192% over limit** → deployment fails.

**Solution:**
Consolidate related functions into feature-based routers using URL-based routing (query params, path segments).

**Impact:**
- ✅ **Backend:** No logic changes, only file structure reorganization
- ⚠️ **Frontend:** API endpoints change (breaking changes)
- ⚠️ **Cron Jobs:** Update `vercel.json` cron paths
- ✅ **External Webhooks:** Update webhook URLs (Wallet, Moralis)

---

## Current State Analysis

### Function Count by Category

| Category | Functions | Current Paths |
|----------|-----------|---------------|
| **Ideas/Journal** | 7 | `ideas/index`, `ideas/close`, `ideas/export`, `ideas/export-pack`, `ideas/attach-trigger`, `journal/index`, `journal/export` |
| **Grok-Pulse** | 4 | `grok-pulse/cron`, `grok-pulse/state`, `grok-pulse/sentiment`, `grok-pulse/context` |
| **Alerts/Rules** | 5 | `alerts/worker`, `alerts/dispatch`, `rules/index`, `rules/eval`, `rules/eval-cron` |
| **AI Services** | 3 | `ai/analyze-market`, `ai/assist`, `ai/grok-context` |
| **Push Notifications** | 3 | `push/subscribe`, `push/unsubscribe`, `push/test-send` |
| **Market Data** | 4 | `data/ohlc`, `market/ohlc`, `dexpaprika/tokens/[address]`, `mcap` |
| **Board/Dashboard** | 2 | `board/kpis`, `board/feed` |
| **External Proxies** | 2 | `moralis/[...path]`, `wallet/webhook` |
| **Utilities** | 5 | `health`, `telemetry`, `backtest`, `shortlink`, `cron/cleanup-temp-entries` |

**Total:** 35 functions

---

## Target Architecture (10 Functions)

### Consolidated Structure

```
api/
├── ideas.ts              ← ideas/* + journal/* (7→1)
├── grok-pulse.ts         ← grok-pulse/* (4→1)
├── rules.ts              ← alerts/* + rules/* (5→1)
├── ai.ts                 ← ai/* (3→1)
├── push.ts               ← push/* (3→1)
├── market-data.ts        ← data/ohlc + market/ohlc + dexpaprika + mcap (4→1)
├── board.ts              ← board/* (2→1)
├── moralis.ts            ← moralis/[...path] (keep as-is, catch-all)
├── wallet-webhook.ts     ← wallet/webhook (keep as-is, external webhook)
└── utils.ts              ← health + telemetry + backtest + shortlink (4→1)

cron/
└── cleanup.ts            ← cron/cleanup-temp-entries (moved to separate folder)
```

**Result:** 10 functions (under 12 limit) ✅

---

## Phase 1: Ideas & Journal Consolidation (P0 - Critical)

### 1.1 Technical Design

**New File:** `api/ideas.ts`

**Routing Strategy:** Action-based query parameter

```typescript
// New routing pattern
GET  /api/ideas?action=list&userId=123
GET  /api/ideas?action=list&resource=journal&userId=123
POST /api/ideas?action=create
POST /api/ideas?action=update
POST /api/ideas?action=close
POST /api/ideas?action=export&format=json
POST /api/ideas?action=export&format=pack
POST /api/ideas?action=attach-trigger
POST /api/ideas?action=journal-export
```

**Implementation Pattern:**

```typescript
export const config = { runtime: "nodejs" };

import { kvGet, kvSet, kvDel, kvSAdd, kvSMembers } from "../src/lib/kv";
import type { Idea } from "../src/lib/ideas";

// Import existing logic as pure functions
import { handleIdeasList } from "../src/lib/api-handlers/ideas/list";
import { handleIdeasCreate } from "../src/lib/api-handlers/ideas/create";
import { handleIdeasClose } from "../src/lib/api-handlers/ideas/close";
import { handleIdeasExport } from "../src/lib/api-handlers/ideas/export";
import { handleIdeasExportPack } from "../src/lib/api-handlers/ideas/export-pack";
import { handleIdeasAttachTrigger } from "../src/lib/api-handlers/ideas/attach-trigger";
import { handleJournalList } from "../src/lib/api-handlers/journal/list";
import { handleJournalExport } from "../src/lib/api-handlers/journal/export";

const json = (o: any, s = 200) =>
  new Response(JSON.stringify(o), {
    status: s,
    headers: { "content-type": "application/json" },
  });

const getUserId = (req: Request) =>
  new URL(req.url).searchParams.get("userId") ||
  req.headers.get("x-user-id") ||
  "anon";

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "list";
  const resource = url.searchParams.get("resource") || "ideas";
  const userId = getUserId(req);

  // Route to appropriate handler
  try {
    if (resource === "journal") {
      if (req.method === "GET" && action === "list") {
        return handleJournalList(req, userId);
      }
      if (req.method === "POST" && action === "export") {
        return handleJournalExport(req, userId);
      }
    }

    // Ideas routing
    if (req.method === "GET" && action === "list") {
      return handleIdeasList(req, userId);
    }

    if (req.method === "POST") {
      switch (action) {
        case "create":
        case "update":
          return handleIdeasCreate(req, userId);
        case "close":
          return handleIdeasClose(req, userId);
        case "export":
          return handleIdeasExport(req, userId);
        case "export-pack":
          return handleIdeasExportPack(req, userId);
        case "attach-trigger":
          return handleIdeasAttachTrigger(req, userId);
        default:
          return json({ ok: false, error: "Unknown action" }, 400);
      }
    }

    return json({ ok: false, error: "Method not allowed" }, 405);
  } catch (error: any) {
    console.error("[ideas] Handler error:", error);
    return json({ ok: false, error: error.message || "Internal error" }, 500);
  }
}
```

### 1.2 Refactor Strategy (Extract Logic)

**Step 1:** Create handler functions in `src/lib/api-handlers/ideas/`

```
src/lib/api-handlers/
├── ideas/
│   ├── list.ts          ← extract from api/ideas/index.ts (GET logic)
│   ├── create.ts        ← extract from api/ideas/index.ts (POST logic)
│   ├── close.ts         ← extract from api/ideas/close.ts
│   ├── export.ts        ← extract from api/ideas/export.ts
│   ├── export-pack.ts   ← extract from api/ideas/export-pack.ts
│   └── attach-trigger.ts ← extract from api/ideas/attach-trigger.ts
└── journal/
    ├── list.ts          ← extract from api/journal/index.ts (GET logic)
    └── export.ts        ← extract from api/journal/export.ts
```

**Example Extraction:**

```typescript
// src/lib/api-handlers/ideas/close.ts
import { kvGet, kvSet } from "../../kv";
import type { Idea } from "../../ideas";

const json = (o: any, s = 200) =>
  new Response(JSON.stringify(o), {
    status: s,
    headers: { "content-type": "application/json" },
  });

export async function handleIdeasClose(
  req: Request,
  userId: string
): Promise<Response> {
  if (req.method !== "POST") {
    return json({ ok: false, error: "POST only" }, 405);
  }

  const body = await req.json();
  const { id, exitPrice, note } = body || {};

  if (!id) {
    return json({ ok: false, error: "id required" }, 400);
  }

  const rec = await kvGet<Idea>(`idea:${userId}:${id}`);
  if (!rec) {
    return json({ ok: false, error: "idea not found" }, 404);
  }

  const entryPrice = rec.entry ?? exitPrice;
  const pnlPct =
    entryPrice && exitPrice
      ? ((exitPrice - entryPrice) / entryPrice) *
        100 *
        (rec.side === "short" ? -1 : 1)
      : undefined;

  const outcome = {
    exitPrice,
    entryPrice,
    pnlPct,
    durationMs: Date.now() - (rec.createdAt || Date.now()),
    exitAt: Date.now(),
    note: note || "",
  };

  const timeline = [
    ...(rec.timeline || []),
    { ts: Date.now(), type: "closed", meta: { exitPrice, pnlPct } },
  ].slice(-1000);

  const updated = {
    ...rec,
    status: "closed",
    outcome: { ...(rec.outcome || {}), ...outcome },
    updatedAt: Date.now(),
    timeline,
  };

  await kvSet(`idea:${userId}:${id}`, updated);
  return json({ ok: true, idea: updated });
}
```

### 1.3 Frontend Migration

**Old Endpoints:**
```typescript
// ❌ Old (before migration)
await fetch('/api/ideas', { method: 'GET' });
await fetch('/api/ideas', { method: 'POST', body: JSON.stringify(idea) });
await fetch('/api/ideas/close', { method: 'POST', body: JSON.stringify({ id, exitPrice }) });
await fetch('/api/ideas/export', { method: 'POST' });
await fetch('/api/journal', { method: 'GET' });
```

**New Endpoints:**
```typescript
// ✅ New (after migration)
await fetch('/api/ideas?action=list');
await fetch('/api/ideas?action=create', { method: 'POST', body: JSON.stringify(idea) });
await fetch('/api/ideas?action=close', { method: 'POST', body: JSON.stringify({ id, exitPrice }) });
await fetch('/api/ideas?action=export&format=json', { method: 'POST' });
await fetch('/api/ideas?action=list&resource=journal');
```

**Update Locations (use Grep to find all usages):**
```bash
grep -r "/api/ideas" src/
grep -r "/api/journal" src/
```

### 1.4 Testing Strategy

**Unit Tests:**
```typescript
// tests/api-handlers/ideas/close.test.ts
import { describe, test, expect, beforeEach } from 'vitest';
import { handleIdeasClose } from '@/lib/api-handlers/ideas/close';

describe('handleIdeasClose', () => {
  test('should close idea and calculate PnL', async () => {
    const req = new Request('http://localhost/api/ideas?action=close', {
      method: 'POST',
      body: JSON.stringify({ id: '123', exitPrice: 150 }),
    });

    const response = await handleIdeasClose(req, 'user-123');
    const data = await response.json();

    expect(data.ok).toBe(true);
    expect(data.idea.status).toBe('closed');
    expect(data.idea.outcome.pnlPct).toBeCloseTo(50, 1);
  });
});
```

**Integration Test (E2E):**
```typescript
// tests/e2e/ideas-api.test.ts
test('Ideas API consolidation', async () => {
  // Create idea
  const createRes = await fetch('/api/ideas?action=create', {
    method: 'POST',
    body: JSON.stringify({ address: 'SOL', tf: '1h', entry: 100 }),
  });
  const { idea } = await createRes.json();

  // Close idea
  const closeRes = await fetch('/api/ideas?action=close', {
    method: 'POST',
    body: JSON.stringify({ id: idea.id, exitPrice: 150 }),
  });
  const { idea: closed } = await closeRes.json();

  expect(closed.status).toBe('closed');
  expect(closed.outcome.pnlPct).toBeCloseTo(50, 1);
});
```

### 1.5 Rollback Plan

**Quick Rollback (if migration fails):**
1. Revert git commit: `git revert HEAD`
2. Redeploy: `git push origin main`
3. Vercel auto-deploys previous version (~30 seconds)

**Partial Rollback (keep new file, restore old endpoints):**
1. Re-add old files: `git checkout HEAD~1 api/ideas/close.ts`
2. Update `vercel.json` to include both old and new endpoints temporarily
3. Gradual frontend migration

---

## Phase 2: Grok-Pulse, Alerts, Rules (P0 - Critical)

### 2.1 Grok-Pulse Consolidation

**New File:** `api/grok-pulse.ts`

**Routing:**
```typescript
GET  /api/grok-pulse?action=state
GET  /api/grok-pulse?action=sentiment
GET  /api/grok-pulse?action=context
POST /api/grok-pulse?action=cron  (with Bearer auth)
```

**Cron Update:**
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/grok-pulse?action=cron",
      "schedule": "*/15 * * * *"
    }
  ]
}
```

### 2.2 Alerts & Rules Consolidation

**New File:** `api/rules.ts`

**Routing:**
```typescript
GET  /api/rules?action=list
POST /api/rules?action=create
POST /api/rules?action=eval
POST /api/rules?action=eval-cron
POST /api/rules?action=dispatch-alert
GET  /api/rules?action=worker-status
```

**Complexity:** Medium (5 functions → 1)

---

## Phase 3: AI, Push, Market-Data (P1 - High Priority)

### 3.1 AI Services Consolidation

**New File:** `api/ai.ts`

**Routing:**
```typescript
POST /api/ai?action=analyze-market
POST /api/ai?action=assist
POST /api/ai?action=grok-context
```

**Runtime Config:**
```typescript
// Note: analyze-market uses Edge Runtime, assist uses Node.js
// Solution: Use Edge Runtime for all (lowest common denominator)
export const config = { runtime: "edge" };
```

### 3.2 Push Notifications Consolidation

**New File:** `api/push.ts`

**Routing:**
```typescript
POST /api/push?action=subscribe
POST /api/push?action=unsubscribe
POST /api/push?action=test-send
```

### 3.3 Market-Data Consolidation

**New File:** `api/market-data.ts`

**Problem:** Two OHLC endpoints exist:
- `api/data/ohlc.ts` (Edge Runtime, with auth)
- `api/market/ohlc.ts` (Node.js Runtime, no auth)

**Solution:** Merge into one with feature flags

**Routing:**
```typescript
GET /api/market-data?action=ohlc&address=SOL&tf=1h
GET /api/market-data?action=token-info&address=SOL
GET /api/market-data?action=mcap
```

**Deduplicated Logic:**
```typescript
export const config = { runtime: "edge" };

export default async function handler(req: Request) {
  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "ohlc";

  // Auth check for data/ohlc (originally had ensureDataProxyAuthorized)
  const requiresAuth = action === "ohlc" && url.searchParams.get("auth") === "true";
  if (requiresAuth) {
    const authError = ensureDataProxyAuthorized(req);
    if (authError) return authError;
  }

  switch (action) {
    case "ohlc":
      return handleOhlc(req);
    case "token-info":
      return handleTokenInfo(req);
    case "mcap":
      return handleMcap(req);
    default:
      return json({ ok: false, error: "Unknown action" }, 400);
  }
}
```

---

## Phase 4: Board, Utils, External (P2 - Medium Priority)

### 4.1 Board Consolidation

**New File:** `api/board.ts`

**Routing:**
```typescript
GET /api/board?action=kpis
GET /api/board?action=feed
```

### 4.2 Utils Consolidation

**New File:** `api/utils.ts`

**Routing:**
```typescript
GET /api/utils?action=health
POST /api/utils?action=telemetry
POST /api/utils?action=backtest
POST /api/utils?action=shortlink
```

**Cleanup Cron:** Move to separate folder

```
cron/cleanup.ts  ← api/cron/cleanup-temp-entries.ts
```

### 4.3 External Endpoints (Keep As-Is)

**No Changes:**
- `api/moralis.ts` (catch-all proxy `[...path]`)
- `api/wallet-webhook.ts` (external webhook, must stay at fixed URL)

**External Update Required:**
- Update Moralis webhook URL in Moralis Dashboard (if URL changes)
- Update Wallet provider webhook URL

---

## Migration Execution Plan

### Timeline (4 Phases)

| Phase | Duration | Risk | Blockers |
|-------|----------|------|----------|
| **Phase 1: Ideas & Journal** | 3-4 hours | 🟡 Medium | Frontend API calls update |
| **Phase 2: Grok-Pulse, Alerts** | 2-3 hours | 🟢 Low | Cron job path update |
| **Phase 3: AI, Push, Market** | 2-3 hours | 🟡 Medium | Runtime config merge (Edge vs Node) |
| **Phase 4: Board, Utils** | 1-2 hours | 🟢 Low | Minimal frontend impact |

**Total:** 8-12 hours

### Execution Order

**Day 1: Phase 1 (Critical Path)**
1. ✅ Create `src/lib/api-handlers/ideas/` structure
2. ✅ Extract logic from 7 functions into handlers
3. ✅ Create new `api/ideas.ts` router
4. ✅ Write unit tests for handlers
5. ⚠️ Update frontend API calls (grep all usages)
6. ✅ Deploy to Vercel Preview (test branch)
7. ✅ Run E2E tests
8. ✅ Merge to main if tests pass
9. ✅ Delete old `api/ideas/*` and `api/journal/*` files

**Day 2: Phase 2 & 3**
1. Repeat process for Grok-Pulse, Alerts, AI, Push, Market-Data
2. Update `vercel.json` cron paths
3. Deploy to Preview
4. Test cron jobs manually (trigger via Vercel Dashboard)
5. Merge to main

**Day 3: Phase 4 & Cleanup**
1. Consolidate Board, Utils
2. Move cleanup cron to `cron/` folder
3. Update all frontend references
4. Final deployment
5. Monitor Vercel logs for 24h

---

## Testing Checklist

### Pre-Deployment Tests

- [ ] All unit tests pass (`pnpm test`)
- [ ] TypeScript compiles without errors (`pnpm typecheck`)
- [ ] ESLint passes (`pnpm lint`)
- [ ] Build succeeds (`pnpm build`)
- [ ] Preview deployment works (Vercel Preview URL)

### Post-Deployment Tests (Production)

- [ ] Ideas CRUD works (create, read, update, close)
- [ ] Journal export works
- [ ] Grok-Pulse cron runs successfully (check Vercel logs)
- [ ] Alerts dispatch correctly
- [ ] AI analyze-market returns data
- [ ] Push notifications subscribe/unsubscribe
- [ ] Market data OHLC fetches correctly
- [ ] Board KPIs load
- [ ] Health check returns 200
- [ ] Moralis proxy still works
- [ ] Wallet webhook receives events

### Monitoring (24h Post-Deploy)

- [ ] Check Vercel Function Invocations (should be ~same as before)
- [ ] Check Error Rates (Vercel Dashboard)
- [ ] Check Response Times (should be <500ms for most endpoints)
- [ ] User feedback (no reports of broken features)

---

## Risk Mitigation

### Risk 1: Frontend Breaking Changes

**Likelihood:** 🔴 High
**Impact:** 🔴 High
**Mitigation:**
- Use regex search to find all API calls: `grep -r "fetch\(\s*['\"]\/api\/(ideas|journal|grok-pulse)" src/`
- Create migration guide for frontend team
- Deploy to staging first, test all features
- Keep old endpoints for 1 week (302 redirects to new endpoints)

### Risk 2: Cron Jobs Fail

**Likelihood:** 🟡 Medium
**Impact:** 🟡 Medium
**Mitigation:**
- Test cron jobs manually via Vercel Dashboard "Run Now" button
- Add monitoring/alerting for cron failures (Vercel Integrations → Slack)
- Keep old cron endpoint as fallback for 48h

### Risk 3: Runtime Config Conflicts (Edge vs Node)

**Likelihood:** 🟡 Medium
**Impact:** 🟡 Medium
**Mitigation:**
- Prefer Edge Runtime (faster, cheaper) unless Node.js-specific APIs required
- Test locally with `vercel dev` to catch runtime errors early
- Use feature detection: `typeof process !== 'undefined'` for Node.js-only code

### Risk 4: External Webhooks Break

**Likelihood:** 🟢 Low
**Impact:** 🔴 High
**Mitigation:**
- Do NOT rename `api/wallet-webhook.ts` or `api/moralis.ts`
- If must rename, set up 301 redirects in `vercel.json`
- Test webhook delivery after deployment (trigger test event)

---

## Cost/Benefit Analysis

### Benefits

✅ **Deploy to Vercel:** Unblocks deployment (currently failing)
✅ **Reduced Cold Starts:** Fewer functions = fewer cold starts
✅ **Better Code Organization:** Related logic grouped together
✅ **Easier Debugging:** Single log stream per feature
✅ **Future-Proof:** Easy to add new actions without hitting limit

### Costs

⚠️ **Breaking Changes:** All frontend API calls must be updated
⚠️ **Testing Effort:** ~8-12 hours of testing
⚠️ **Migration Risk:** Small risk of bugs during migration
⚠️ **External Dependencies:** Webhook URLs must be updated

### ROI Calculation

**Time Investment:** 12 hours (1.5 dev days)
**Time Saved (Long-Term):** ~2 hours/month (easier debugging, no function limit issues)
**Break-Even:** 6 months

---

## Rollback Strategy

### Immediate Rollback (< 5 minutes)

**If deployment fails or critical bug found:**

```bash
# 1. Revert commit
git revert HEAD

# 2. Force push (if already deployed)
git push origin main --force

# 3. Vercel auto-redeploys previous version
# (No manual action needed)
```

### Partial Rollback (Keep some consolidations)

**If only one phase has issues (e.g., Ideas API broken):**

```bash
# 1. Restore old files
git checkout HEAD~1 api/ideas/index.ts
git checkout HEAD~1 api/ideas/close.ts
# ... restore all old ideas/* files

# 2. Commit and push
git add api/ideas/
git commit -m "Rollback: Restore old ideas API endpoints"
git push origin main

# 3. Update frontend to use old endpoints again
# (Regex replace new → old)
```

---

## Success Metrics

### Deployment Metrics

- ✅ Vercel deployment succeeds (no function limit error)
- ✅ All 10 functions deploy successfully
- ✅ Build time < 3 minutes (same as before)

### Performance Metrics (24h Post-Deploy)

- ✅ P95 Response Time < 500ms (same as before)
- ✅ Error Rate < 0.1% (same as before)
- ✅ Cold Start Time < 200ms (improved due to fewer functions)

### User Metrics (7 days Post-Deploy)

- ✅ Zero user-reported bugs related to API changes
- ✅ Feature usage same as before (no drop in Ideas/Journal usage)

---

## Appendix A: Full File Mapping

### Before → After

| Before | After | Change |
|--------|-------|--------|
| `api/ideas/index.ts` | `api/ideas.ts?action=list\|create` | Merged |
| `api/ideas/close.ts` | `api/ideas.ts?action=close` | Merged |
| `api/ideas/export.ts` | `api/ideas.ts?action=export` | Merged |
| `api/ideas/export-pack.ts` | `api/ideas.ts?action=export-pack` | Merged |
| `api/ideas/attach-trigger.ts` | `api/ideas.ts?action=attach-trigger` | Merged |
| `api/journal/index.ts` | `api/ideas.ts?resource=journal&action=list` | Merged |
| `api/journal/export.ts` | `api/ideas.ts?resource=journal&action=export` | Merged |
| `api/grok-pulse/cron.ts` | `api/grok-pulse.ts?action=cron` | Merged |
| `api/grok-pulse/state.ts` | `api/grok-pulse.ts?action=state` | Merged |
| `api/grok-pulse/sentiment.ts` | `api/grok-pulse.ts?action=sentiment` | Merged |
| `api/grok-pulse/context.ts` | `api/grok-pulse.ts?action=context` | Merged |
| `api/alerts/worker.ts` | `api/rules.ts?action=worker` | Merged |
| `api/alerts/dispatch.ts` | `api/rules.ts?action=dispatch` | Merged |
| `api/rules/index.ts` | `api/rules.ts?action=list\|create` | Merged |
| `api/rules/eval.ts` | `api/rules.ts?action=eval` | Merged |
| `api/rules/eval-cron.ts` | `api/rules.ts?action=eval-cron` | Merged |
| `api/ai/analyze-market.ts` | `api/ai.ts?action=analyze-market` | Merged |
| `api/ai/assist.ts` | `api/ai.ts?action=assist` | Merged |
| `api/ai/grok-context.ts` | `api/ai.ts?action=grok-context` | Merged |
| `api/push/subscribe.ts` | `api/push.ts?action=subscribe` | Merged |
| `api/push/unsubscribe.ts` | `api/push.ts?action=unsubscribe` | Merged |
| `api/push/test-send.ts` | `api/push.ts?action=test-send` | Merged |
| `api/data/ohlc.ts` | `api/market-data.ts?action=ohlc` | Merged |
| `api/market/ohlc.ts` | `api/market-data.ts?action=ohlc` | Merged (deduplicated) |
| `api/dexpaprika/tokens/[address].ts` | `api/market-data.ts?action=token&address=X` | Merged |
| `api/mcap.ts` | `api/market-data.ts?action=mcap` | Merged |
| `api/board/kpis.ts` | `api/board.ts?action=kpis` | Merged |
| `api/board/feed.ts` | `api/board.ts?action=feed` | Merged |
| `api/health.ts` | `api/utils.ts?action=health` | Merged |
| `api/telemetry.ts` | `api/utils.ts?action=telemetry` | Merged |
| `api/backtest.ts` | `api/utils.ts?action=backtest` | Merged |
| `api/shortlink.ts` | `api/utils.ts?action=shortlink` | Merged |
| `api/cron/cleanup-temp-entries.ts` | `cron/cleanup.ts` | Moved |
| `api/moralis/[...path].ts` | `api/moralis.ts` | **No change** |
| `api/wallet/webhook.ts` | `api/wallet-webhook.ts` | Renamed (flattened) |

---

## Appendix B: Frontend Migration Script

**Automated Regex Replace (use with caution):**

```bash
# Ideas API
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i "s|/api/ideas/close|/api/ideas?action=close|g"
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i "s|/api/ideas/export|/api/ideas?action=export|g"
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i "s|/api/ideas/export-pack|/api/ideas?action=export-pack|g"
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i "s|/api/ideas/attach-trigger|/api/ideas?action=attach-trigger|g"
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i "s|/api/journal|/api/ideas?resource=journal|g"

# Grok-Pulse API
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i "s|/api/grok-pulse/state|/api/grok-pulse?action=state|g"
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i "s|/api/grok-pulse/sentiment|/api/grok-pulse?action=sentiment|g"
find src -type f -name "*.ts" -o -name "*.tsx" | xargs sed -i "s|/api/grok-pulse/context|/api/grok-pulse?action=context|g"

# (Continue for other APIs...)
```

**Verify Changes:**
```bash
git diff src/
pnpm typecheck
pnpm test
```

---

## Appendix C: Vercel.json Updates

**Before:**
```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-temp-entries",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**After:**
```json
{
  "crons": [
    {
      "path": "/cron/cleanup",
      "schedule": "0 2 * * *"
    },
    {
      "path": "/api/grok-pulse?action=cron",
      "schedule": "*/15 * * * *"
    },
    {
      "path": "/api/rules?action=eval-cron",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

---

## Next Steps

1. **Review Plan:** Team review (30 min)
2. **Approval:** Get sign-off from tech lead
3. **Phase 1 Execution:** Start with Ideas & Journal (highest impact)
4. **Deploy to Preview:** Test in Vercel Preview environment
5. **Gradual Rollout:** Phase 1 → 2 → 3 → 4 over 3-4 days
6. **Monitor:** Watch Vercel logs, error rates, user feedback for 7 days

---

**Questions? Contact:** [Tech Lead / DevOps]

**Last Updated:** 2025-11-23
**Status:** 📋 **Ready for Review**
