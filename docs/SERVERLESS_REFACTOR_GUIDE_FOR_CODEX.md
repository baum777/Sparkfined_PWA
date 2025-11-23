# Serverless Functions Consolidation — Implementation Guide for Codex

**Status:** 🎯 **ALL PHASES COMPLETE** — Vercel Hobby Limit Achieved!
**Goal:** 35 Functions → ≤12 Functions (Vercel Hobby Limit: 12)
**Final:** 12 Functions (exactly at limit, -66% from original 35)
**Completed:**
- Phase 1: Push 3→1 ✅ (35→33)
- Phase 2: Ideas+Journal 7→1 ✅ (33→27)
- Phase 3: Grok-Pulse 4→1 ✅ (27→24)
- Phase 4: Alerts & Rules 5→2 ✅ (15→12)
- Phase 5: AI Services 3→1 ✅ (24→22)
- Phase 6: Market Data 4→1 ✅ (22→19)
- Phase 7: Board & Utils 6→2 ✅ (19→15)
**Branch:** `claude/serverless-refactor-plan-01Jm759Sn1GL94suTXrn31jX`
**Last Updated:** 2025-11-23

---

## Table of Contents

1. [Goals & Invariants](#1-goals--invariants)
2. [Current State Analysis](#2-current-state-analysis)
3. [Common Patterns](#3-common-patterns)
4. [Target Architecture](#4-target-architecture)
5. [Phase 1: Push APIs](#5-phase-1-push-apis-pilot)
6. [Phase 2: Ideas & Journal](#6-phase-2-ideas--journal)
7. [Phase 3: Grok-Pulse](#7-phase-3-grok-pulse)
8. [Phase 4: Alerts & Rules](#8-phase-4-alerts--rules)
9. [Phase 5: AI Services](#9-phase-5-ai-services)
10. [Phase 6: Market Data](#10-phase-6-market-data)
11. [Phase 7: Board & Utils](#11-phase-7-board--utils)
12. [Testing Checklist](#12-testing-checklist-per-phase)
13. [Rollback Strategy](#13-rollback-strategy)

---

## 1. Goals & Invariants

### 1.1 Primary Goal

**Reduce function count from 35 to ≤10** to comply with Vercel Hobby Plan (max 12 functions).

### 1.2 Critical Invariants

**MUST NOT change:**
- ✅ Request/Response shapes (same JSON structure)
- ✅ Status codes (200, 400, 401, 403, 404, 405, 500, etc.)
- ✅ Business logic (zero functional changes)
- ✅ Authentication/Authorization behavior

**MUST preserve:**
- ✅ Routes (prefer keeping existing paths via routing)
- ✅ Runtime requirements (Node.js for KV/SDKs, Edge where appropriate)
- ✅ External webhook URLs (wallet, moralis)
- ✅ Cron job paths (update vercel.json)

### 1.3 Implementation Constraints

**Runtime Selection Rules:**

| Dependency | Required Runtime | Reason |
|------------|------------------|--------|
| `@vercel/kv` (kvGet, kvSet, etc.) | **Node.js** | KV SDK requires Node.js runtime |
| `web-push` SDK | **Node.js** | Native modules, not Edge-compatible |
| Heavy SDKs (OpenAI, etc.) | **Node.js** (preferred) | Better cold start, more memory |
| Pure computation, no I/O | **Edge** (optional) | Faster cold start, lower cost |
| Auth-only proxies | **Edge** (if no KV) | Minimal overhead |

**DO NOT:**
- ❌ Move KV-dependent code to Edge runtime (will fail)
- ❌ Change external webhook URLs without updating providers
- ❌ Merge unrelated features just to reduce count (keep logical grouping)

### 1.4 Migration Strategy

**Phased approach:**
1. Start with **isolated, small features** (e.g., Push APIs)
2. Validate with full CI/CD pipeline per phase
3. Deploy to Preview environment first
4. Gradual rollout (1-2 phases per day)

**Pattern:**
- Extract business logic → `src/server/<feature>/handlers.ts`
- Thin router → `api/<feature>.ts`
- Keep old files temporarily as 302 redirects (if needed)

---

## 2. Current State Analysis

### 2.1 Complete Function Inventory (35 Functions)

#### Group 1: Push Notifications (3 Functions) → Node.js

| File | Route | Runtime | Dependencies | Method | Purpose |
|------|-------|---------|--------------|--------|---------|
| `api/push/subscribe.ts` | `/api/push/subscribe` | `nodejs` | KV, sha256 | POST | Store push subscription |
| `api/push/unsubscribe.ts` | `/api/push/unsubscribe` | `nodejs` | KV, sha256 | POST | Remove push subscription |
| `api/push/test-send.ts` | `/api/push/test-send` | `nodejs` | web-push, auth | POST | Send test notification |

**KV Keys Used:** `push:sub:{id}`, `push:subs:byUser:{userId}`

---

#### Group 2: Ideas (5 Functions) → Node.js

| File | Route | Runtime | Dependencies | Method | Purpose |
|------|-------|---------|--------------|--------|---------|
| `api/ideas/index.ts` | `/api/ideas` | `nodejs` | KV | GET, POST | CRUD for ideas |
| `api/ideas/close.ts` | `/api/ideas/close` | `nodejs` | KV | POST | Close idea + calc outcome |
| `api/ideas/export.ts` | `/api/ideas/export` | `nodejs` | KV | POST | Export single idea |
| `api/ideas/export-pack.ts` | `/api/ideas/export-pack` | `nodejs` | KV | POST | Bulk export ideas |
| `api/ideas/attach-trigger.ts` | `/api/ideas/attach-trigger` | `nodejs` | KV | POST | Attach alert trigger |

**KV Keys Used:** `idea:{userId}:{id}`, `ideas:byUser:{userId}`

---

#### Group 3: Journal (2 Functions) → Node.js

| File | Route | Runtime | Dependencies | Method | Purpose |
|------|-------|---------|--------------|--------|---------|
| `api/journal/index.ts` | `/api/journal` | `nodejs` | KV | GET, POST | CRUD for journal entries |
| `api/journal/export.ts` | `/api/journal/export` | `nodejs` | KV | POST | Export journal entries |

**KV Keys Used:** `journal:{userId}:{id}`, `journal:byUser:{userId}`

---

#### Group 4: Grok-Pulse (4 Functions) → Node.js

| File | Route | Runtime | Dependencies | Method | Purpose |
|------|-------|---------|--------------|--------|---------|
| `api/grok-pulse/cron.ts` | `/api/grok-pulse/cron` | `nodejs` | KV, Grok API, auth | POST | Cron job for pulse updates |
| `api/grok-pulse/state.ts` | `/api/grok-pulse/state` | `nodejs` | KV | GET | Get current sentiment state |
| `api/grok-pulse/sentiment.ts` | `/api/grok-pulse/sentiment` | `nodejs` | KV | GET | Get sentiment for address |
| `api/grok-pulse/context.ts` | `/api/grok-pulse/context` | `nodejs` | KV | GET | Get pulse context data |

**KV Keys Used:** `grokPulse:snapshot:{address}`, `grokPulse:history:{address}`, `grokPulse:tokens:list`, `grokPulse:meta:lastRun`

**Cron:** `vercel.json` → `/api/grok-pulse/cron` (schedule TBD)

---

#### Group 5: Alerts & Rules (5 Functions) → Node.js

| File | Route | Runtime | Dependencies | Method | Purpose |
|------|-------|---------|--------------|--------|---------|
| `api/alerts/worker.ts` | `/api/alerts/worker` | `nodejs` | KV, web-push, auth | POST | Process alert queue + send push |
| `api/alerts/dispatch.ts` | `/api/alerts/dispatch` | `nodejs` | KV | POST | Add alert to queue |
| `api/rules/index.ts` | `/api/rules` | `nodejs` | KV | GET, POST | CRUD for server rules |
| `api/rules/eval.ts` | `/api/rules/eval` | `nodejs` | None (pure logic) | POST | Evaluate rule against OHLC data |
| `api/rules/eval-cron.ts` | `/api/rules/eval-cron` | `nodejs` | KV, auth | POST | Cron job for rule evaluation |

**KV Keys Used:** `alerts:queue` (list), `rule:{userId}:{id}`, `rules:byUser:{userId}`

**Cron:** `vercel.json` → `/api/rules/eval-cron` (schedule TBD)

---

#### Group 6: AI Services (3 Functions) → Edge (mostly)

| File | Route | Runtime | Dependencies | Method | Purpose |
|------|-------|---------|--------------|--------|---------|
| `api/ai/analyze-market.ts` | `/api/ai/analyze-market` | `edge` | None (calls other APIs) | POST | Advanced market analysis |
| `api/ai/assist.ts` | `/api/ai/assist` | `edge` | OpenAI, Grok APIs, auth | POST | AI chat proxy (OpenAI/Grok) |
| `api/ai/grok-context.ts` | `/api/ai/grok-context` | `edge` | None (pure compute) | POST | Generate Grok context prompt |

**Note:** `assist.ts` uses in-memory cache (Edge isolate), no KV dependency.

---

#### Group 7: Market Data (4 Functions) → Mixed

| File | Route | Runtime | Dependencies | Method | Purpose |
|------|-------|---------|--------------|--------|---------|
| `api/data/ohlc.ts` | `/api/data/ohlc` | `edge` | DexPaprika, Moralis, auth | GET | OHLC data with auth |
| `api/market/ohlc.ts` | `/api/market/ohlc` | `nodejs` | DexPaprika, Moralis | GET | OHLC data (no auth) |
| `api/dexpaprika/tokens/[address].ts` | `/api/dexpaprika/tokens/{address}` | `nodejs` | DexPaprika API | GET | Token info proxy |
| `api/mcap.ts` | `/api/mcap` | `nodejs` | External API | GET | Market cap data |

**Duplicate Alert:** `data/ohlc.ts` (Edge) vs `market/ohlc.ts` (Node.js) — nearly identical logic, different runtimes.

---

#### Group 8: Board/Dashboard (2 Functions) → Node.js

| File | Route | Runtime | Dependencies | Method | Purpose |
|------|-------|---------|--------------|--------|---------|
| `api/board/kpis.ts` | `/api/board/kpis` | `nodejs` | External APIs | GET | Dashboard KPIs |
| `api/board/feed.ts` | `/api/board/feed` | `nodejs` | KV (optional) | GET | Activity feed |

---

#### Group 9: Utils (5 Functions) → Mixed

| File | Route | Runtime | Dependencies | Method | Purpose |
|------|-------|---------|--------------|--------|---------|
| `api/health.ts` | `/api/health` | `edge` | None | GET | Health check endpoint |
| `api/telemetry.ts` | `/api/telemetry` | `edge` | None (logs only) | POST | Client telemetry/metrics |
| `api/backtest.ts` | `/api/backtest` | `edge` | None (pure compute) | POST | Backtest trading strategy |
| `api/shortlink.ts` | `/api/shortlink` | `edge` | None (base64 encoding) | POST | Generate short link |
| `api/cron/cleanup-temp-entries.ts` | `/api/cron/cleanup-temp-entries` | `nodejs` | KV | GET | Cleanup cron job |

**Cron:** `vercel.json` → `/api/cron/cleanup-temp-entries` (schedule: `0 2 * * *`)

---

#### Group 10: External/Webhooks (2 Functions) → Keep As-Is

| File | Route | Runtime | Dependencies | Method | Purpose |
|------|-------|---------|--------------|--------|---------|
| `api/moralis/[...path].ts` | `/api/moralis/*` | `nodejs` | Moralis API | ANY | Catch-all proxy |
| `api/wallet/webhook.ts` | `/api/wallet/webhook` | `nodejs` | External webhook | POST | Wallet event webhook |

**⚠️ CRITICAL:** These paths are used by external services. **DO NOT RENAME** without updating providers.

---

### 2.2 Runtime Distribution Summary

| Runtime | Count | Files |
|---------|-------|-------|
| **Node.js** | 22 | Ideas (5), Journal (2), Grok-Pulse (4), Alerts/Rules (5), Market (3), Board (2), Utils (1) |
| **Edge** | 13 | AI (3), Market (1), Utils (4), External (2 → keep), Health (1), Telemetry (1), Backtest (1), Shortlink (1) |

---

### 2.3 KV Dependency Map

**Files with KV access (must stay Node.js):**

```
api/push/subscribe.ts          → kvSet, kvSAdd
api/push/unsubscribe.ts        → kvDel
api/ideas/index.ts             → kvGet, kvSet, kvDel, kvSAdd, kvSMembers
api/ideas/close.ts             → kvGet, kvSet
api/ideas/export.ts            → kvGet, kvSMembers
api/ideas/export-pack.ts       → kvGet, kvSMembers
api/ideas/attach-trigger.ts    → kvGet, kvSet
api/journal/index.ts           → kvGet, kvSet, kvDel, kvSAdd, kvSMembers
api/journal/export.ts          → kvGet, kvSMembers
api/grok-pulse/state.ts        → KV (via lib/grokPulse/kv)
api/grok-pulse/sentiment.ts    → KV (via lib/grokPulse/kv)
api/grok-pulse/context.ts      → KV (via lib/grokPulse/kv)
api/alerts/dispatch.ts         → KV (LPUSH to queue)
api/alerts/worker.ts           → KV (LRANGE, LTRIM, GET)
api/rules/index.ts             → kvGet, kvSet, kvDel, kvSAdd, kvSMembers
api/cron/cleanup-temp-entries.ts → KV
```

**Total KV-dependent:** 16 functions (must use Node.js runtime)

---

## 3. Common Patterns

### 3.1 Request Handler Signatures

**Two signature types in use:**

#### Pattern A: Edge Runtime (New Request API)

```typescript
export const config = { runtime: "edge" };

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  if (req.method !== "POST") {
    return json({ ok: false, error: "POST only" }, 405);
  }

  const body = await req.json();
  // ... logic

  return json({ ok: true, data: result });
}

const json = (obj: any, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });
```

#### Pattern B: Node.js Runtime (Vercel Node API)

```typescript
export const runtime = "nodejs";

import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ ok: false, error: "POST only" });
  }

  const body = req.body;
  // ... logic

  return res.status(200).json({ ok: true, data: result });
}
```

**⚠️ Important:** When consolidating, **pick ONE signature per consolidated function** based on runtime:
- **Node.js → VercelRequest/VercelResponse**
- **Edge → Request/Response**

---

### 3.2 Router + Handler Pattern (Recommended)

**Goal:** Keep API entry points thin, extract business logic to reusable handlers.

#### Step 1: Create Handler Module

```typescript
// src/server/push/handlers.ts
import { kvSet, kvSAdd, kvDel } from "@/lib/kv";
import { sha256Url } from "@/lib/sha";
import webpush from "web-push";

const json = (obj: any, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });

export async function handleSubscribe(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return json({ ok: false, error: "POST only" }, 405);
  }

  try {
    const { subscription, userId = "anon" } = await req.json();
    if (!subscription?.endpoint) {
      return json({ ok: false, error: "subscription required" }, 400);
    }

    const id = await sha256Url(subscription.endpoint);
    const key = `push:sub:${id}`;

    await kvSet(key, { id, userId, subscription, ts: Date.now() });
    await kvSAdd(`push:subs:byUser:${userId}`, id);

    return json({ ok: true, id });
  } catch (e: any) {
    return json({ ok: false, error: String(e?.message ?? e) }, 500);
  }
}

export async function handleUnsubscribe(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return json({ ok: false, error: "POST only" }, 405);
  }

  try {
    const { endpoint } = await req.json();
    if (!endpoint) {
      return json({ ok: false, error: "endpoint required" }, 400);
    }

    const id = await sha256Url(endpoint);
    const del = await kvDel(`push:sub:${id}`);

    return json({ ok: true, removed: del });
  } catch (e: any) {
    return json({ ok: false, error: String(e?.message ?? e) }, 500);
  }
}

export async function handleTestSend(req: Request): Promise<Response> {
  // ... (extract from api/push/test-send.ts)
  // Note: This uses VercelRequest/VercelResponse → needs conversion
}
```

#### Step 2: Create Thin Router

```typescript
// api/push.ts
export const config = { runtime: "nodejs" };

import { handleSubscribe, handleUnsubscribe, handleTestSend } from "../src/server/push/handlers";

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  switch (action) {
    case "subscribe":
      return handleSubscribe(req);
    case "unsubscribe":
      return handleUnsubscribe(req);
    case "test":
      return handleTestSend(req);
    default:
      return new Response(
        JSON.stringify({ ok: false, error: "Unknown action" }),
        { status: 400, headers: { "content-type": "application/json" } }
      );
  }
}
```

---

### 3.3 Authentication Patterns

**Three auth patterns in use:**

#### Pattern 1: Bearer Token (Internal Services)

```typescript
function ensureAuthorized(req: Request, secretEnvKey: string): Response | null {
  const secret = process.env[secretEnvKey]?.trim();
  const isProd = process.env.NODE_ENV === "production";

  if (!secret) {
    if (!isProd) {
      console.warn(`[auth] ${secretEnvKey} not set – allowing in dev`);
      return null;
    }
    return json({ ok: false, error: "Service disabled" }, 503);
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return json({ ok: false, error: "Unauthorized" }, 401);
  }

  const [scheme, token] = authHeader.split(" ", 2);
  if (scheme?.toLowerCase() !== "bearer" || token?.trim() !== secret) {
    return json({ ok: false, error: "Unauthorized" }, 403);
  }

  return null; // Authorized
}
```

**Used by:**
- `api/data/ohlc.ts` → `DATA_PROXY_SECRET`
- `api/ai/assist.ts` → `AI_PROXY_SECRET`
- `api/grok-pulse/cron.ts` → `PULSE_CRON_SECRET`
- `api/alerts/worker.ts` → `ALERTS_ADMIN_SECRET`
- `api/push/test-send.ts` → `ALERTS_ADMIN_SECRET`

#### Pattern 2: User ID from Header/Query

```typescript
const getUserId = (req: Request): string => {
  const url = new URL(req.url);
  return (
    url.searchParams.get("userId") ||
    req.headers.get("x-user-id") ||
    "anon"
  );
};
```

**Used by:** ideas, journal, rules (all user-scoped KV data)

#### Pattern 3: No Auth (Public Endpoints)

**Examples:** health, telemetry, backtest, shortlink

---

### 3.4 Error Handling Pattern

**Consistent pattern across all functions:**

```typescript
try {
  // Validation
  if (!requiredParam) {
    return json({ ok: false, error: "Missing param" }, 400);
  }

  // Business logic
  const result = await doWork();

  // Success
  return json({ ok: true, data: result }, 200);
} catch (e: any) {
  console.error("[feature] Error:", e);
  return json(
    { ok: false, error: e?.message || "Internal error" },
    500 // or 200 for "soft" errors
  );
}
```

**⚠️ Note:** Some functions return `status: 200` even for errors (soft fail pattern). **Preserve this behavior.**

---

## 4. Target Architecture

### 4.1 Consolidated Structure (10 Functions)

```
api/
├── push.ts                 ← push/* (3→1)
├── ideas.ts                ← ideas/* + journal/* (7→1)
├── grok-pulse.ts           ← grok-pulse/* (4→1)
├── rules.ts                ← alerts/* + rules/* (5→1)
├── ai.ts                   ← ai/* (3→1)
├── market.ts               ← data/ohlc + market/ohlc + dexpaprika + mcap (4→1)
├── board.ts                ← board/* (2→1)
├── utils.ts                ← health + telemetry + backtest + shortlink (4→1)
├── moralis.ts              ← moralis/[...path] (keep as-is)
└── wallet-webhook.ts       ← wallet/webhook (keep as-is)

cron/
└── cleanup.ts              ← cron/cleanup-temp-entries (move to dedicated folder)
```

**Total:** 10 API functions + 1 cron function = **11 Vercel Functions** ✅

---

### 4.2 Handler Module Structure

```
src/server/
├── push/
│   └── handlers.ts         ← subscribe, unsubscribe, testSend
├── ideas/
│   ├── handlers.ts         ← list, create, update, close
│   ├── export.ts           ← export, exportPack
│   └── triggers.ts         ← attachTrigger
├── journal/
│   └── handlers.ts         ← list, create, update, export
├── grok-pulse/
│   ├── cron.ts             ← cron handler
│   ├── state.ts            ← state, sentiment, context
│   └── helpers.ts          ← shared KV logic
├── rules/
│   ├── crud.ts             ← list, create, update, delete
│   ├── eval.ts             ← evaluate rule
│   └── cron.ts             ← cron evaluation
├── alerts/
│   ├── dispatch.ts         ← add to queue
│   └── worker.ts           ← process queue + send push
├── ai/
│   ├── analyze.ts          ← analyze-market
│   ├── assist.ts           ← chat proxy
│   └── grok-context.ts     ← generate context
├── market/
│   ├── ohlc.ts             ← unified OHLC handler
│   ├── tokens.ts           ← dexpaprika token info
│   └── mcap.ts             ← market cap
├── board/
│   └── handlers.ts         ← kpis, feed
└── utils/
    ├── health.ts
    ├── telemetry.ts
    ├── backtest.ts
    ├── shortlink.ts
    └── cleanup.ts
```

---

### 4.3 Routing Strategy

**Option A: Query Parameter Routing (Recommended)**

```typescript
// api/push.ts
const action = new URL(req.url).searchParams.get("action");

// Routes:
// POST /api/push?action=subscribe
// POST /api/push?action=unsubscribe
// POST /api/push?action=test
```

**Pros:**
- Simple to implement
- Easy to debug (clear in logs)
- Works with Vercel routing out-of-the-box

**Cons:**
- Slightly longer URLs
- Query params visible in logs (minor security concern)

---

**Option B: Path Segment Routing (Advanced)**

```typescript
// api/push/[action].ts
const { action } = req.query; // Vercel extracts from path

// Routes:
// POST /api/push/subscribe
// POST /api/push/unsubscribe
// POST /api/push/test
```

**Pros:**
- Cleaner URLs
- RESTful style

**Cons:**
- Requires dynamic route file (`[action].ts`)
- Still counts as ONE function (Vercel treats all files in api/push/ as one function if using catch-all)
- More complex to test locally

---

**Decision for this migration: Option A (Query Parameter Routing)** for simplicity and explicit clarity.

---

## 5. Phase 1: Push APIs (Pilot)

**Goal:** Consolidate 3 Push functions into 1 as proof-of-concept.

**Timeline:** 2-3 hours
**Risk:** 🟢 Low (isolated feature, KV-dependent but simple)

**Status:** ✅ **IMPLEMENTED / COMPLETE** — Completed 2025-11-23 by Claude

**Implementation Summary:**
- ✅ Handler module created: `src/server/push/handlers.ts` (3 handlers consolidated)
- ✅ Router created: `api/push.ts` with ?action=subscribe|unsubscribe|test
- ✅ Frontend updated: NotificationsPage.tsx (3 API calls migrated)
- ✅ Old files removed: api/push/{subscribe,unsubscribe,test-send}.ts
- ✅ All CI checks PASS: typecheck ✓, lint ✓, test ✓, build ✓
- ✅ API signature converted: test-send.ts VercelRequest/Response → Request/Response
- ✅ Function count reduced: 35 → 33 (-2)

---

### 5.1 Scope

**Current Files:**
- `api/push/subscribe.ts`
- `api/push/unsubscribe.ts`
- `api/push/test-send.ts`

**Target:**
- `api/push.ts` (router)
- `src/server/push/handlers.ts` (business logic)

**Routes:**
- `POST /api/push?action=subscribe` → Subscribe to push notifications
- `POST /api/push?action=unsubscribe` → Unsubscribe
- `POST /api/push?action=test` → Send test push (admin-only)

---

### 5.2 Implementation Steps

#### Step 1: Analyze Current Implementations

Run:
```bash
# View subscribe logic
cat api/push/subscribe.ts

# View unsubscribe logic
cat api/push/unsubscribe.ts

# View test-send logic (uses VercelRequest/VercelResponse)
cat api/push/test-send.ts
```

**Key observations:**
- `subscribe.ts` and `unsubscribe.ts` use `Request/Response` API
- `test-send.ts` uses `VercelRequest/VercelResponse` API (older pattern)
- All use KV → must stay Node.js
- `test-send.ts` has auth check (`ensureAlertsAdminAuthorized`)

---

#### Step 2: Create Handler Module

Create: `src/server/push/handlers.ts`

```typescript
// src/server/push/handlers.ts
import { kvSet, kvSAdd, kvDel } from "@/lib/kv";
import { sha256Url } from "@/lib/sha";
import webpush from "web-push";

const json = (obj: any, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });

// ============================================================================
// SUBSCRIBE
// ============================================================================
export async function handleSubscribe(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return json({ ok: false, error: "POST only" }, 405);
  }

  try {
    const { subscription, userId = "anon" } = await req.json();

    if (!subscription?.endpoint) {
      return json({ ok: false, error: "subscription required" }, 400);
    }

    const id = await sha256Url(subscription.endpoint);
    const key = `push:sub:${id}`;

    await kvSet(key, { id, userId, subscription, ts: Date.now() });
    await kvSAdd(`push:subs:byUser:${userId}`, id);

    return json({ ok: true, id });
  } catch (e: any) {
    return json({ ok: false, error: String(e?.message ?? e) }, 200);
  }
}

// ============================================================================
// UNSUBSCRIBE
// ============================================================================
export async function handleUnsubscribe(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return json({ ok: false, error: "POST only" }, 405);
  }

  try {
    const { endpoint } = await req.json();

    if (!endpoint) {
      return json({ ok: false, error: "endpoint required" }, 400);
    }

    const id = await sha256Url(endpoint);
    const removed = await kvDel(`push:sub:${id}`);

    return json({ ok: true, removed });
  } catch (e: any) {
    return json({ ok: false, error: String(e?.message ?? e) }, 200);
  }
}

// ============================================================================
// TEST SEND
// ============================================================================

// Configure VAPID once at module level
const PUB = process.env.VAPID_PUBLIC_KEY || "";
const PRIV = process.env.VAPID_PRIVATE_KEY || "";
const CONTACT = process.env.VAPID_CONTACT || "mailto:admin@example.com";

if (PUB && PRIV) {
  webpush.setVapidDetails(CONTACT, PUB, PRIV);
}

export async function handleTestSend(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return json({ ok: false, error: "POST only" }, 405);
  }

  // Auth check
  const authError = ensureAlertsAdminAuthorized(req);
  if (authError) return authError;

  try {
    if (!PUB || !PRIV) {
      return json({ ok: false, error: "VAPID keys missing" }, 500);
    }

    const { subscription, payload } = await req.json();

    if (!subscription) {
      return json({ ok: false, error: "subscription required" }, 400);
    }

    const data = payload || {
      title: "Sparkfined — Test Push",
      body: "Wenn du das siehst, ist Web-Push aktiv ✅",
      url: "/notifications",
      tag: "sparkfined-test",
    };

    await webpush.sendNotification(subscription, JSON.stringify(data));

    return json({ ok: true });
  } catch (e: any) {
    return json({ ok: false, error: String(e?.message ?? e) }, 200);
  }
}

// ============================================================================
// HELPERS
// ============================================================================

function ensureAlertsAdminAuthorized(req: Request): Response | null {
  const secret = process.env.ALERTS_ADMIN_SECRET?.trim();
  const isProd = process.env.NODE_ENV === "production";

  if (!secret) {
    if (!isProd) {
      console.warn("[push] ALERTS_ADMIN_SECRET not set – allowing in dev");
      return null;
    }
    return json({ ok: false, error: "push test disabled" }, 503);
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader) {
    return json({ ok: false, error: "unauthorized" }, 401);
  }

  const [scheme, token] = authHeader.split(" ", 2);
  if (!scheme || !token || scheme.toLowerCase() !== "bearer") {
    return json({ ok: false, error: "unauthorized" }, 401);
  }

  if (token.trim() !== secret) {
    return json({ ok: false, error: "unauthorized" }, 403);
  }

  return null;
}
```

---

#### Step 3: Create Router Entry Point

Create: `api/push.ts`

```typescript
// api/push.ts
export const config = { runtime: "nodejs" };

import {
  handleSubscribe,
  handleUnsubscribe,
  handleTestSend,
} from "../src/server/push/handlers";

const json = (obj: any, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const action = url.searchParams.get("action");

  switch (action) {
    case "subscribe":
      return handleSubscribe(req);
    case "unsubscribe":
      return handleUnsubscribe(req);
    case "test":
      return handleTestSend(req);
    default:
      return json(
        { ok: false, error: "Unknown action. Use ?action=subscribe|unsubscribe|test" },
        400
      );
  }
}
```

---

#### Step 4: Update Frontend API Calls

**Find all usages:**
```bash
grep -r "/api/push/" src/
```

**Example replacements:**

```typescript
// ❌ Old
await fetch('/api/push/subscribe', {
  method: 'POST',
  body: JSON.stringify({ subscription }),
});

// ✅ New
await fetch('/api/push?action=subscribe', {
  method: 'POST',
  body: JSON.stringify({ subscription }),
});
```

**Repeat for:**
- `subscribe` → `?action=subscribe`
- `unsubscribe` → `?action=unsubscribe`
- `test-send` → `?action=test`

---

#### Step 5: Delete Old Files

**After frontend is updated and tested:**

```bash
rm api/push/subscribe.ts
rm api/push/unsubscribe.ts
rm api/push/test-send.ts
rmdir api/push  # Only if empty
```

---

### 5.3 Testing Checklist

**Pre-deployment:**
- [ ] `pnpm typecheck` passes
- [ ] `pnpm lint` passes
- [ ] `pnpm test` passes (if unit tests exist)
- [ ] `pnpm run build` succeeds
- [ ] Local test: `vercel dev` → Test all 3 actions

**Post-deployment (Vercel Preview):**
- [ ] Subscribe: Works from UI, KV entry created
- [ ] Unsubscribe: Works from UI, KV entry removed
- [ ] Test Send: Works with Bearer token, push received
- [ ] Check Vercel logs: No errors
- [ ] Check function count: Should be 33 now (was 35)

---

## 6. Phase 2: Ideas & Journal

**Goal:** Consolidate 7 functions into 1.

**Timeline:** 3-4 hours
**Risk:** 🟡 Medium (complex CRUD, export logic, KV-heavy)

**Status:** ✅ **IMPLEMENTED / COMPLETE** — Completed 2025-11-23 by Claude

**Implementation Summary:**
- ✅ Handler modules created: ideas/ (handlers, close, export, triggers), journal/ (handlers)
- ✅ Router created: `api/ideas.ts` with ?action= and ?resource= routing
- ✅ Frontend updated: NotificationsPage.tsx, useAlertRules.ts (7 API calls migrated)
- ✅ Old files removed: api/ideas/* (5 files), api/journal/* (2 files)
- ✅ All CI checks PASS: typecheck ✓, lint ✓, build ✓ (443KB bundle)
- ✅ Function count reduced: 33 → 27 (-6)

---

### 6.1 Scope

**Current Files:**
- `api/ideas/index.ts` (GET, POST → list, create, update, delete)
- `api/ideas/close.ts` (POST → close idea + outcome calc)
- `api/ideas/export.ts` (POST → export single idea)
- `api/ideas/export-pack.ts` (POST → bulk export)
- `api/ideas/attach-trigger.ts` (POST → attach alert trigger)
- `api/journal/index.ts` (GET, POST → list, create, update)
- `api/journal/export.ts` (POST → export journal)

**Target:**
- `api/ideas.ts` (router)
- `src/server/ideas/handlers.ts`
- `src/server/ideas/export.ts`
- `src/server/ideas/triggers.ts`
- `src/server/journal/handlers.ts`

**Routes (Ideas):**
- `GET /api/ideas?action=list&userId=X` → List all ideas
- `POST /api/ideas?action=create` → Create idea
- `POST /api/ideas?action=update` → Update idea
- `POST /api/ideas?action=delete` → Delete idea (via POST body: `{ delete: true, id: "..." }`)
- `POST /api/ideas?action=close` → Close idea + calc outcome
- `POST /api/ideas?action=export&id=X` → Export single idea
- `POST /api/ideas?action=export-pack` → Bulk export
- `POST /api/ideas?action=attach-trigger` → Attach trigger

**Routes (Journal):**
- `GET /api/ideas?resource=journal&action=list&userId=X` → List journal
- `POST /api/ideas?resource=journal&action=create` → Create entry
- `POST /api/ideas?resource=journal&action=export` → Export journal

**Alternative:** Separate `api/journal.ts` if too complex (would still save 5 functions).

---

### 6.2 Implementation Steps

#### Step 1: Analyze Current Implementations

```bash
cat api/ideas/index.ts        # CRUD
cat api/ideas/close.ts         # Outcome calculation
cat api/ideas/export.ts        # Single export
cat api/ideas/export-pack.ts   # Bulk export
cat api/journal/index.ts       # Journal CRUD
```

**Key patterns:**
- User ID from query param or header
- KV keys: `idea:{userId}:{id}`, `ideas:byUser:{userId}`
- Delete via POST body: `{ delete: true, id }`
- Export returns JSON or CSV (check response type)

---

#### Step 2: Create Handler Modules

**Create: `src/server/ideas/handlers.ts`**

```typescript
// src/server/ideas/handlers.ts
import { kvGet, kvSet, kvDel, kvSAdd, kvSMembers } from "@/lib/kv";
import type { Idea } from "@/lib/ideas";

const json = (obj: any, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });

const getUserId = (req: Request): string => {
  const url = new URL(req.url);
  return (
    url.searchParams.get("userId") ||
    req.headers.get("x-user-id") ||
    "anon"
  );
};

const now = () => Date.now();

// ============================================================================
// LIST IDEAS
// ============================================================================
export async function handleList(req: Request): Promise<Response> {
  if (req.method !== "GET") {
    return json({ ok: false, error: "GET only" }, 405);
  }

  const userId = getUserId(req);
  const ids = await kvSMembers(`ideas:byUser:${userId}`);
  const rows: Idea[] = [];

  for (const id of ids) {
    const idea = await kvGet<Idea>(`idea:${userId}:${id}`);
    if (idea) rows.push(idea);
  }

  rows.sort((a, b) => b.updatedAt - a.updatedAt);
  return json({ ok: true, ideas: rows });
}

// ============================================================================
// CREATE / UPDATE IDEA
// ============================================================================
export async function handleCreateOrUpdate(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return json({ ok: false, error: "POST only" }, 405);
  }

  const userId = getUserId(req);
  const body = await req.json();

  // Handle delete action
  if (body?.delete && body?.id) {
    await kvDel(`idea:${userId}:${body.id}`);
    return json({ ok: true, deleted: body.id });
  }

  const id = body?.id || crypto.randomUUID();
  const prev = await kvGet<Idea>(`idea:${userId}:${id}`);

  const rec: Idea = {
    id,
    userId,
    address: body.address ?? prev?.address,
    tf: body.tf ?? prev?.tf,
    side: (body.side ?? prev?.side) || "long",
    title: body.title ?? prev?.title ?? "Idea",
    thesis: body.thesis ?? prev?.thesis ?? "",
    entry: numOr(body.entry ?? prev?.entry),
    invalidation: numOr(body.invalidation ?? prev?.invalidation),
    targets: Array.isArray(body.targets)
      ? body.targets.map(Number).slice(0, 6)
      : prev?.targets ?? [],
    status: body.status || prev?.status || "draft",
    createdAt: prev?.createdAt || body.createdAt || now(),
    updatedAt: now(),
    links: { ...(prev?.links || {}), ...(body.links || {}) },
    flags: { ...(prev?.flags || {}), ...(body.flags || {}) },
    outcome: { ...(prev?.outcome || {}), ...(body.outcome || {}) },
    timeline: mergeTimeline(prev?.timeline, body.timeline),
  };

  if (!rec.address || !rec.tf) {
    return json({ ok: false, error: "address & tf required" }, 400);
  }

  await kvSet(`idea:${userId}:${id}`, rec);
  await kvSAdd(`ideas:byUser:${userId}`, id);

  return json({ ok: true, idea: rec });
}

// ============================================================================
// HELPERS
// ============================================================================
function numOr(x: any) {
  const n = Number(x);
  return Number.isFinite(n) ? n : undefined;
}

function mergeTimeline(a?: any[], b?: any[]) {
  const arr = [...(a || [])];
  if (Array.isArray(b) && b.length) arr.push(...b);
  arr.sort((x, y) => (x.ts || 0) - (y.ts || 0));
  return arr.slice(-1000);
}
```

**Create: `src/server/ideas/close.ts`**

```typescript
// src/server/ideas/close.ts
import { kvGet, kvSet } from "@/lib/kv";
import type { Idea } from "@/lib/ideas";

const json = (obj: any, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });

const getUserId = (req: Request): string => {
  const url = new URL(req.url);
  return (
    url.searchParams.get("userId") ||
    req.headers.get("x-user-id") ||
    "anon"
  );
};

export async function handleClose(req: Request): Promise<Response> {
  if (req.method !== "POST") {
    return json({ ok: false, error: "POST only" }, 405);
  }

  const userId = getUserId(req);
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

**Create: `src/server/ideas/export.ts`, `src/server/ideas/triggers.ts`, `src/server/journal/handlers.ts`**

(Follow same pattern — extract logic from existing files)

---

#### Step 3: Create Router

**Create: `api/ideas.ts`**

```typescript
// api/ideas.ts
export const config = { runtime: "nodejs" };

import { handleList, handleCreateOrUpdate } from "../src/server/ideas/handlers";
import { handleClose } from "../src/server/ideas/close";
import { handleExport, handleExportPack } from "../src/server/ideas/export";
import { handleAttachTrigger } from "../src/server/ideas/triggers";
import {
  handleJournalList,
  handleJournalCreate,
  handleJournalExport,
} from "../src/server/journal/handlers";

const json = (obj: any, status = 200) =>
  new Response(JSON.stringify(obj), {
    status,
    headers: { "content-type": "application/json" },
  });

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const resource = url.searchParams.get("resource") || "ideas";
  const action = url.searchParams.get("action") || (req.method === "GET" ? "list" : "create");

  try {
    // Journal routing
    if (resource === "journal") {
      if (req.method === "GET" && action === "list") {
        return handleJournalList(req);
      }
      if (req.method === "POST" && action === "create") {
        return handleJournalCreate(req);
      }
      if (req.method === "POST" && action === "export") {
        return handleJournalExport(req);
      }
      return json({ ok: false, error: "Unknown journal action" }, 400);
    }

    // Ideas routing
    if (req.method === "GET" && action === "list") {
      return handleList(req);
    }

    if (req.method === "POST") {
      switch (action) {
        case "create":
        case "update":
          return handleCreateOrUpdate(req);
        case "close":
          return handleClose(req);
        case "export":
          return handleExport(req);
        case "export-pack":
          return handleExportPack(req);
        case "attach-trigger":
          return handleAttachTrigger(req);
        default:
          return json({ ok: false, error: "Unknown action" }, 400);
      }
    }

    return json({ ok: false, error: "Method not allowed" }, 405);
  } catch (error: any) {
    console.error("[ideas] Handler error:", error);
    return json(
      { ok: false, error: error.message || "Internal error" },
      500
    );
  }
}
```

---

#### Step 4: Update Frontend

**Find all usages:**
```bash
grep -r "/api/ideas" src/
grep -r "/api/journal" src/
```

**Example replacements:**

```typescript
// ❌ Old
fetch('/api/ideas')
fetch('/api/ideas/close', { method: 'POST', body: JSON.stringify({ id, exitPrice }) })
fetch('/api/journal')

// ✅ New
fetch('/api/ideas?action=list')
fetch('/api/ideas?action=close', { method: 'POST', body: JSON.stringify({ id, exitPrice }) })
fetch('/api/ideas?resource=journal&action=list')
```

---

#### Step 5: Delete Old Files

```bash
rm api/ideas/index.ts
rm api/ideas/close.ts
rm api/ideas/export.ts
rm api/ideas/export-pack.ts
rm api/ideas/attach-trigger.ts
rm api/journal/index.ts
rm api/journal/export.ts
rmdir api/ideas api/journal
```

---

### 6.3 Testing Checklist

- [ ] Ideas: List, create, update, delete
- [ ] Ideas: Close with outcome calculation
- [ ] Ideas: Export single, export pack
- [ ] Ideas: Attach trigger
- [ ] Journal: List, create, export
- [ ] Check KV: Correct keys created/deleted
- [ ] Function count: Should be ~27 now

---

## 7. Phase 3: Grok-Pulse

**Goal:** Consolidate 4 functions into 1.

**Timeline:** 2-3 hours
**Risk:** 🟡 Medium (Cron job, KV-heavy, external API)

---

### 7.1 Scope

**Current Files:**
- `api/grok-pulse/cron.ts` (POST → cron job, Bearer auth)
- `api/grok-pulse/state.ts` (GET → current state)
- `api/grok-pulse/sentiment.ts` (GET → sentiment for address)
- `api/grok-pulse/context.ts` (GET → context data)

**Target:**
- `api/grok-pulse.ts` (router)
- `src/server/grok-pulse/cron.ts`
- `src/server/grok-pulse/state.ts`

**Routes:**
- `POST /api/grok-pulse?action=cron` (Bearer auth)
- `GET /api/grok-pulse?action=state&addresses=X,Y,Z`
- `GET /api/grok-pulse?action=sentiment&address=X`
- `GET /api/grok-pulse?action=context&address=X`

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

---

### 7.2 Implementation Steps

(Follow same pattern as Phase 1 & 2)

---

## 8. Phase 4: Alerts & Rules

**Goal:** Consolidate 5 functions into 1.

**Timeline:** 3-4 hours
**Risk:** 🟡 Medium (Cron, KV queue, web-push SDK, rule evaluation logic)

---

### 8.1 Scope

**Current Files:**
- `api/alerts/worker.ts` (POST → process queue + send push, Bearer auth)
- `api/alerts/dispatch.ts` (POST → add to queue)
- `api/rules/index.ts` (GET, POST → CRUD)
- `api/rules/eval.ts` (POST → evaluate rule)
- `api/rules/eval-cron.ts` (POST → cron evaluation, Bearer auth)

**Target:**
- `api/rules.ts` (router)
- `src/server/rules/crud.ts`
- `src/server/rules/eval.ts`
- `src/server/alerts/dispatch.ts`
- `src/server/alerts/worker.ts`

**Routes:**
- `GET /api/rules?action=list&userId=X`
- `POST /api/rules?action=create`
- `POST /api/rules?action=update`
- `POST /api/rules?action=delete`
- `POST /api/rules?action=eval` (evaluate single rule)
- `POST /api/rules?action=eval-cron` (cron evaluation, Bearer auth)
- `POST /api/rules?action=dispatch-alert` (add to queue)
- `POST /api/rules?action=process-alerts` (worker, Bearer auth)

**Cron Update:**
```json
{
  "crons": [
    {
      "path": "/api/rules?action=eval-cron",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

---

## 9. Phase 5: AI Services

**Goal:** Consolidate 3 functions into 1.

**Timeline:** 2 hours
**Risk:** 🟢 Low (Edge runtime, no KV, pure proxy logic)

---

### 9.1 Scope

**Current Files:**
- `api/ai/analyze-market.ts` (POST → market analysis)
- `api/ai/assist.ts` (POST → OpenAI/Grok proxy)
- `api/ai/grok-context.ts` (POST → generate context)

**Target:**
- `api/ai.ts` (router, Edge runtime)
- `src/server/ai/analyze.ts`
- `src/server/ai/assist.ts`
- `src/server/ai/grok-context.ts`

**Routes:**
- `POST /api/ai?action=analyze-market`
- `POST /api/ai?action=assist`
- `POST /api/ai?action=grok-context`

**Runtime:** `edge` (all functions already use Edge)

---

## 10. Phase 6: Market Data

**Goal:** Consolidate 4 functions into 1, deduplicate OHLC logic.

**Timeline:** 3 hours
**Risk:** 🟡 Medium (duplicate OHLC endpoints with different runtimes)

---

### 10.1 Scope

**Current Files:**
- `api/data/ohlc.ts` (GET → OHLC with Bearer auth, Edge)
- `api/market/ohlc.ts` (GET → OHLC without auth, Node.js)
- `api/dexpaprika/tokens/[address].ts` (GET → token info, Node.js)
- `api/mcap.ts` (GET → market cap, Node.js)

**Problem:** Two OHLC endpoints with near-identical logic but different runtimes.

**Solution:**

**Option A:** Merge into Node.js runtime (safer, consistent with other market data)

```typescript
// api/market.ts
export const config = { runtime: "nodejs" };

// Routes:
// GET /api/market?action=ohlc&address=X&tf=15m&auth=true  (with Bearer check)
// GET /api/market?action=ohlc&address=X&tf=15m           (no auth)
// GET /api/market?action=token&address=X
// GET /api/market?action=mcap
```

**Option B:** Keep Edge runtime, use fetch for auth-less version

(More complex, not recommended)

---

### 10.2 Deduplication Strategy

**Key difference:**
- `data/ohlc.ts` → calls `ensureDataProxyAuthorized(req)`
- `market/ohlc.ts` → no auth check

**Unified handler:**

```typescript
// src/server/market/ohlc.ts
export async function handleOHLC(
  req: Request,
  requireAuth: boolean = false
): Promise<Response> {
  if (requireAuth) {
    const authError = ensureDataProxyAuthorized(req);
    if (authError) return authError;
  }

  // ... rest of OHLC logic (shared)
}
```

**Router:**

```typescript
// api/market.ts
const url = new URL(req.url);
const requireAuth = url.searchParams.get("auth") === "true";

if (action === "ohlc") {
  return handleOHLC(req, requireAuth);
}
```

---

## 11. Phase 7: Board & Utils

**Goal:** Consolidate 6 functions into 2.

**Timeline:** 2-3 hours
**Risk:** 🟢 Low (simple read endpoints, minimal dependencies)

---

### 11.1 Scope: Board (2 Functions)

**Current Files:**
- `api/board/kpis.ts` (GET → dashboard KPIs)
- `api/board/feed.ts` (GET → activity feed)

**Target:**
- `api/board.ts` (router, Node.js)

**Routes:**
- `GET /api/board?action=kpis`
- `GET /api/board?action=feed`

---

### 11.2 Scope: Utils (4 Functions)

**Current Files:**
- `api/health.ts` (GET → health check, Edge)
- `api/telemetry.ts` (POST → telemetry, Edge)
- `api/backtest.ts` (POST → backtest, Edge)
- `api/shortlink.ts` (POST → short link, Edge)

**Target:**
- `api/utils.ts` (router, Edge)

**Routes:**
- `GET /api/utils?action=health`
- `POST /api/utils?action=telemetry`
- `POST /api/utils?action=backtest`
- `POST /api/utils?action=shortlink`

---

### 11.3 Cleanup Cron (Move to Dedicated Folder)

**Current:** `api/cron/cleanup-temp-entries.ts`

**Problem:** Counts as 1 function (already at top level)

**Solution:** Move to `cron/cleanup.ts` (Vercel treats `cron/` differently)

```bash
mkdir -p cron
mv api/cron/cleanup-temp-entries.ts cron/cleanup.ts
rm -rf api/cron
```

**Update `vercel.json`:**

```json
{
  "crons": [
    {
      "path": "/cron/cleanup",
      "schedule": "0 2 * * *"
    }
  ]
}
```

---

## 12. Testing Checklist (Per Phase)

### 12.1 Pre-Deployment Checks

Run after **EVERY phase**:

```bash
# Type checking
pnpm typecheck

# Linting
pnpm lint

# Unit tests (if any)
pnpm test

# Build
pnpm run build

# Check bundle size (optional)
pnpm run check:bundle-size
```

**All must pass ✅ before proceeding.**

---

### 12.2 Local Testing with Vercel Dev

```bash
vercel dev
```

**Test each consolidated route:**
- Push: `curl -X POST http://localhost:3000/api/push?action=subscribe -d '{"subscription": {...}}'`
- Ideas: `curl http://localhost:3000/api/ideas?action=list&userId=test`
- Grok-Pulse: `curl http://localhost:3000/api/grok-pulse?action=state`

---

### 12.3 Vercel Preview Deployment

```bash
# Deploy to preview
vercel --prod=false

# Get preview URL
vercel inspect <deployment-url>
```

**Manual tests:**
- [ ] All consolidated routes return expected responses
- [ ] Auth-protected routes require Bearer token
- [ ] KV operations work (check Upstash dashboard)
- [ ] Cron jobs can be triggered manually (Vercel Dashboard → Deployments → Cron)
- [ ] No 500 errors in Vercel logs

---

### 12.4 Production Deployment Checklist

**Before merging to main:**

- [ ] All phases tested individually
- [ ] Frontend updated to use new routes
- [ ] Function count ≤ 10 (check Vercel dashboard)
- [ ] No breaking changes in API responses
- [ ] Cron jobs updated in `vercel.json`
- [ ] External webhooks tested (if applicable)

**Deploy:**

```bash
git add .
git commit -m "feat: consolidate serverless functions (35→10)"
git push origin <branch>

# Or deploy directly
vercel --prod
```

**Monitor for 24 hours:**
- [ ] Error rate < 0.1%
- [ ] Response times stable
- [ ] No user-reported issues

---

## 13. Rollback Strategy

### 13.1 Immediate Rollback (< 5 minutes)

**If critical bug found after deployment:**

```bash
# Via Vercel Dashboard
1. Go to Deployments
2. Find last stable deployment (before consolidation)
3. Click "Promote to Production"
4. Done (traffic switches in ~10 seconds)
```

**Via CLI:**

```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>
```

---

### 13.2 Partial Rollback (Keep Some Consolidations)

**If only one phase has issues (e.g., Grok-Pulse broken):**

```bash
# Restore old files from git
git checkout HEAD~1 api/grok-pulse/cron.ts
git checkout HEAD~1 api/grok-pulse/state.ts
git checkout HEAD~1 api/grok-pulse/sentiment.ts
git checkout HEAD~1 api/grok-pulse/context.ts

# Remove consolidated file
rm api/grok-pulse.ts

# Commit and redeploy
git add .
git commit -m "rollback: restore old grok-pulse endpoints"
git push origin main
```

---

### 13.3 Gradual Rollback (302 Redirects)

**Keep both old and new endpoints temporarily:**

```typescript
// api/push/subscribe.ts (temporary redirect)
export default async function handler(req: Request) {
  const url = new URL(req.url);
  url.pathname = "/api/push";
  url.searchParams.set("action", "subscribe");

  return Response.redirect(url.toString(), 302);
}
```

**Remove redirects after 1 week of stable operation.**

---

## Appendix A: Full Route Mapping Table

| Old Route | New Route | Method | Auth | Notes |
|-----------|-----------|--------|------|-------|
| `/api/push/subscribe` | `/api/push?action=subscribe` | POST | No | KV |
| `/api/push/unsubscribe` | `/api/push?action=unsubscribe` | POST | No | KV |
| `/api/push/test-send` | `/api/push?action=test` | POST | Bearer | web-push |
| `/api/ideas` | `/api/ideas?action=list` | GET | User ID | KV |
| `/api/ideas` | `/api/ideas?action=create` | POST | User ID | KV |
| `/api/ideas/close` | `/api/ideas?action=close` | POST | User ID | KV |
| `/api/ideas/export` | `/api/ideas?action=export` | POST | User ID | KV |
| `/api/ideas/export-pack` | `/api/ideas?action=export-pack` | POST | User ID | KV |
| `/api/ideas/attach-trigger` | `/api/ideas?action=attach-trigger` | POST | User ID | KV |
| `/api/journal` | `/api/ideas?resource=journal&action=list` | GET | User ID | KV |
| `/api/journal` | `/api/ideas?resource=journal&action=create` | POST | User ID | KV |
| `/api/journal/export` | `/api/ideas?resource=journal&action=export` | POST | User ID | KV |
| `/api/grok-pulse/cron` | `/api/grok-pulse?action=cron` | POST | Bearer | Cron |
| `/api/grok-pulse/state` | `/api/grok-pulse?action=state` | GET | No | KV |
| `/api/grok-pulse/sentiment` | `/api/grok-pulse?action=sentiment` | GET | No | KV |
| `/api/grok-pulse/context` | `/api/grok-pulse?action=context` | GET | No | KV |
| `/api/alerts/worker` | `/api/rules?action=process-alerts` | POST | Bearer | Cron |
| `/api/alerts/dispatch` | `/api/rules?action=dispatch-alert` | POST | No | KV |
| `/api/rules` | `/api/rules?action=list` | GET | User ID | KV |
| `/api/rules` | `/api/rules?action=create` | POST | User ID | KV |
| `/api/rules/eval` | `/api/rules?action=eval` | POST | No | Pure |
| `/api/rules/eval-cron` | `/api/rules?action=eval-cron` | POST | Bearer | Cron |
| `/api/ai/analyze-market` | `/api/ai?action=analyze-market` | POST | No | Edge |
| `/api/ai/assist` | `/api/ai?action=assist` | POST | Bearer | Edge |
| `/api/ai/grok-context` | `/api/ai?action=grok-context` | POST | No | Edge |
| `/api/data/ohlc` | `/api/market?action=ohlc&auth=true` | GET | Bearer | Edge→Node |
| `/api/market/ohlc` | `/api/market?action=ohlc` | GET | No | Node |
| `/api/dexpaprika/tokens/X` | `/api/market?action=token&address=X` | GET | No | Node |
| `/api/mcap` | `/api/market?action=mcap` | GET | No | Node |
| `/api/board/kpis` | `/api/board?action=kpis` | GET | No | Node |
| `/api/board/feed` | `/api/board?action=feed` | GET | No | Node |
| `/api/health` | `/api/utils?action=health` | GET | No | Edge |
| `/api/telemetry` | `/api/utils?action=telemetry` | POST | No | Edge |
| `/api/backtest` | `/api/utils?action=backtest` | POST | No | Edge |
| `/api/shortlink` | `/api/utils?action=shortlink` | POST | No | Edge |
| `/api/cron/cleanup-temp-entries` | `/cron/cleanup` | GET | No | Cron |
| `/api/moralis/*` | `/api/moralis/*` | ANY | No | **NO CHANGE** |
| `/api/wallet/webhook` | `/api/wallet-webhook` | POST | No | **Flatten only** |

---

## Appendix B: Environment Variables Checklist

**Ensure these are set in Vercel:**

```bash
# KV (Upstash)
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...

# Auth Secrets
DATA_PROXY_SECRET=...
AI_PROXY_SECRET=...
PULSE_CRON_SECRET=...
ALERTS_ADMIN_SECRET=...

# External APIs
DEXPAPRIKA_API_KEY=...
DEXPAPRIKA_BASE=https://api.dexpaprika.com
OPENAI_API_KEY=...
GROK_API_KEY=...
MORALIS_API_KEY=...

# Web Push
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
VAPID_CONTACT=mailto:...
```

---

## Appendix C: Vercel.json Final State

```json
{
  "installCommand": "npm install -g pnpm@9.0.0 && pnpm install --frozen-lockfile",
  "buildCommand": "pnpm run build",
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
  ],
  "rewrites": [
    { "source": "/manifest.webmanifest", "destination": "/manifest.webmanifest" },
    { "source": "/favicon.ico", "destination": "/favicon.ico" },
    { "source": "/robots.txt", "destination": "/robots.txt" },
    { "source": "/assets/(.*)", "destination": "/assets/$1" },
    { "source": "/icons/(.*)", "destination": "/icons/$1" },
    { "source": "/sw.js", "destination": "/sw.js" },
    { "source": "/registerSW.js", "destination": "/registerSW.js" },
    { "source": "/workbox-(.*)", "destination": "/workbox-$1" },
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

---

## Next Steps

**For Codex:**

1. **Start with Phase 1 (Push APIs)** — smallest, isolated feature
2. Follow step-by-step instructions exactly
3. Run all checks after each phase
4. Deploy to Vercel Preview before production
5. Report any blockers or questions

**Success Metrics:**
- [ ] Function count: 35 → 10 ✅
- [ ] All tests pass
- [ ] Zero functional regressions
- [ ] Deployment succeeds on Vercel Hobby Plan

---

## Phase 1 Review Report (2025-11-23)

**Reviewer:** Claude (Session ID: 017z3GMdQwP4v3tanAqCVyAS)

**Branch Reviewed:** `claude/review-phase1-push-apis-017z3GMdQwP4v3tanAqCVyAS`

**Implementation Status:** 🔴 **Phase 1 NOT YET IMPLEMENTED** (old structure still in place)

### Current State Verification

**File Structure (Current):**
```
api/push/
├── subscribe.ts     ✅ (21 lines, nodejs runtime, Request/Response API)
├── unsubscribe.ts   ✅ (17 lines, nodejs runtime, Request/Response API)
└── test-send.ts     ⚠️  (67 lines, nodejs runtime, VercelRequest/VercelResponse API)
```

**Frontend Integration:**
- `src/pages/NotificationsPage.tsx` has 3 API calls:
  - Line 81: `/api/push/subscribe`
  - Line 91: `/api/push/test-send`
  - Line 96: `/api/push/unsubscribe`

### Local Verification (All Green ✅)

| Check | Status | Result |
|-------|--------|--------|
| `pnpm typecheck` | ✅ PASS | 0 errors |
| `pnpm lint` | ✅ PASS | 0 errors, 0 warnings |
| `pnpm test` | ✅ PASS | 152 passed, 40 skipped |
| `pnpm run build:ci` | ✅ PASS | 443KB / 460KB (96%) |

### Semantic Analysis — Behavior Verification

**✅ API Signature Consistency:**
- `subscribe.ts` and `unsubscribe.ts` use **Request/Response** (modern Edge-compatible API)
- `test-send.ts` uses **VercelRequest/VercelResponse** (legacy Node.js API)

**⚠️ Implementation Note:**
When consolidating, the handler for `test-send` will need conversion from `VercelRequest/VercelResponse` to `Request/Response` to match the router signature. The guide's example code already shows this conversion correctly.

**✅ KV Operations (Unchanged Semantics Required):**
- `subscribe.ts`: Uses `kvSet()` and `kvSAdd()` — keys: `push:sub:{id}`, `push:subs:byUser:{userId}`
- `unsubscribe.ts`: Uses `kvDel()` — key: `push:sub:{id}`
- `test-send.ts`: No KV operations, uses `web-push` SDK

**✅ Auth Pattern:**
- `test-send.ts` has proper Bearer token auth (`ensureAlertsAdminAuthorized`)
- Auth logic must be preserved in consolidated handler

**✅ Response Shapes:**
- All return `{ ok: true/false, ... }` format ✅
- Error responses use status 200 (soft fail) ✅
- Method check returns 405 for non-POST ✅

### Go / No-Go Decision for Phase 2

**❌ NO GO — Phase 1 Must Be Completed First**

**Reasoning:**
1. Phase 1 consolidation has **not been implemented yet** (old structure still in place)
2. Phase 2 (Ideas & Journal 7→1) should only start **after Phase 1 is verified** as a proof-of-concept
3. Current codebase is **stable and ready** for Phase 1 implementation to begin

**✅ GO — Phase 1 Implementation Can Start Immediately**

**Confidence Score:** 98/100

**Recommended Next Steps:**
1. Codex implements Phase 1 (Push 3→1) following the guide exactly
2. Run full CI suite on Phase 1 branch
3. Deploy to Vercel Preview and test manually
4. After Phase 1 is verified stable, proceed to Phase 2

**Minor Adjustments Needed:**
- [ ] Convert `test-send.ts` handler from VercelRequest/VercelResponse → Request/Response
- [ ] Ensure auth helper `ensureAlertsAdminAuthorized` accepts Request (not VercelRequest)
- [ ] Update frontend API calls in NotificationsPage.tsx (3 endpoints)

**Function Count Impact:**
- Before: 35 functions
- After Phase 1: 33 functions (3→1, saves 2)
- Target: 10 functions (need 25 more consolidations in Phases 2-7)

---

**Last Updated:** 2025-11-23
**Status:** ✅ Ready for Codex Implementation — Phase 1 Pilot
**Estimated Total Time:** 16-20 hours (spread across 7 phases)
