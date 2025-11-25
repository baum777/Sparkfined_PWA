---
mode: ITERATIVE
id: "_experiments"
priority: 3
version: "0.1.0"
last_update: "2025-11-12"
targets: ["cursor", "claudecode", "codex"]
description: "Active and past experiments, tech spikes, prototypes, A/B tests and learnings for Sparkfined PWA"
---

# Experiments — Prototypes & Tech Spikes

> **Purpose:** Tracks **active and past experiments**: spikes, prototypes, A/B tests and what was learned.
>
> **Update-Frequency:** When starting/completing experiments (weekly to monthly).
>
> **Behaviour:** The model uses a consistent micro-template per experiment: **Name, Goal, Setup, Result, Decision, Learnings**, and ensures that longer-term decisions from experiments flow into `_intentions.md` or SYSTEM docs.

---

## Experiment-Template

```markdown
### EXP-XXX: Experiment-Name

**Status:** `active` | `completed` | `failed` | `abandoned`

**Goal:** What are we trying to learn or validate?

**Setup:**
- Approach/Method
- Tools/Libraries used
- Duration/Scope

**Result:**
- Key findings
- Data/Metrics collected

**Decision:** What did we decide based on this experiment?

**Learnings:** What did we learn that's useful for future work?

**Date:** YYYY-MM-DD (Start → End)
```

---

## Active Experiments

### EXP-001: Multi-Tool Prompt System (Rulesync)

**Status:** `active`

**Goal:** Set up unified prompt-system for 3 AI-tools (Cursor, Claude Code, Codex) using Rulesync.

**Setup:**
- **Approach:** Create 11 SYSTEM-files (stable rules) + 6 ITERATIVE-files (dynamic context)
- **Tools:** Rulesync CLI (planned), Markdown-based config
- **Duration:** 2025-11-12 → 2025-11-26 (2 weeks)
- **Scope:**
  - Generate `.rulesync/` structure (11 SYSTEM + 6 ITERATIVE)
  - Generate `.cursor/rules/` (Cursor-specific hints)
  - Generate `CLAUDE.md` (Claude Code config)
  - Generate `AGENTS.md` (Codex instructions)

**Result:**
- ✅ SYSTEM-Files: 11/11 completed (00-11)
- ⏳ ITERATIVE-Files: 6/6 completed (this file included)
- ⏳ Tool-Configs: 0/3 completed (pending Phase 4)

**Decision:** TBD (after validation in Phase 4)

**Learnings:** TBD

**Date:** 2025-11-12 → (ongoing)

---

## Completed Experiments

### EXP-002: Service-Worker Update-Strategy (skipWaiting vs. Manual)

**Status:** `completed`

**Goal:** Determine best update-strategy for PWA Service-Worker (auto-update vs. user-prompt).

**Setup:**
- **Approach:** Test 2 strategies on iOS Safari + Chrome Android
  1. `skipWaiting: true` — Auto-update on new SW (no user-prompt)
  2. `skipWaiting: false` — Manual-update via "Update Available" banner
- **Tools:** `vite-plugin-pwa`, Workbox
- **Duration:** 2025-10-15 → 2025-10-22 (1 week)

**Result:**
- **Option 1 (skipWaiting: true):**
  - ✅ Faster updates (no user-action required)
  - ❌ Risk: Can interrupt active-sessions (e.g. journal-editing)
- **Option 2 (skipWaiting: false):**
  - ✅ User-controlled (no interruptions)
  - ❌ Slower adoption (many users ignore "Update Available" banner)

**Decision:** Use `skipWaiting: true` (auto-update) + add "Reload to Apply Update" toast-notification.

**Learnings:**
- Auto-update is preferred for trading-app (users need latest-data fast)
- Add telemetry-event for SW-update to track adoption-rate
- iOS Safari requires `clientsClaim: true` to avoid stale-content

**Date:** 2025-10-15 → 2025-10-22

**Migrated-to:** `vite.config.ts` (Production-Config since Beta v0.5.0)

---

### EXP-003: AI-Provider-Cost-Comparison (OpenAI vs. Grok vs. Claude)

**Status:** `completed`

**Goal:** Compare cost/quality of 3 AI-providers for journal-condense task.

**Setup:**
- **Approach:** Run same prompt (100 journal-entries) on 3 providers
  1. OpenAI `gpt-4o-mini` (~$0.15/1M tokens)
  2. xAI `grok-beta` (~$5/1M tokens)
  3. Anthropic `claude-3-haiku` (~$0.25/1M tokens)
- **Metrics:**
  - Cost-per-request
  - Latency (p50, p95)
  - Quality-score (subjective, 1-5)
- **Duration:** 2025-10-01 → 2025-10-10 (10 days)

**Result:**

| Provider | Cost/Request | Latency (p50) | Quality | Notes |
|----------|--------------|---------------|---------|-------|
| OpenAI (gpt-4o-mini) | $0.003 | 600ms | 4/5 | Fast, cheap, good-enough |
| Grok (xAI) | $0.12 | 1500ms | 5/5 | Best crypto-context, but 40x more expensive |
| Claude (Haiku) | $0.005 | 800ms | 4.5/5 | Good balance, but not crypto-native |

**Decision:** Use **dual-provider-strategy**:
- OpenAI (gpt-4o-mini) for high-volume tasks (journal-condense, bullet-analysis)
- Grok (xAI) for high-value tasks (market-reasoning, social-heuristics)
- Skip Claude (not enough benefit over OpenAI to justify 2nd integration)

**Learnings:**
- Grok is 40x more expensive, but quality-gain is only +20% → not worth for all tasks
- OpenAI (gpt-4o-mini) is "good-enough" for 80% of tasks
- Can save ~$30/month by routing cheap-tasks to OpenAI

**Date:** 2025-10-01 → 2025-10-10

**Migrated-to:** `ai/orchestrator.ts` (Dual-Provider-Logic since Beta v0.6.0)

---

### EXP-004: Chart-Library-Evaluation (Lightweight-Charts vs. TradingView-Widget)

**Status:** `completed`

**Goal:** Choose chart-library for OHLC-candlestick-charts with indicators.

**Setup:**
- **Approach:** Build prototype with 2 libraries
  1. Lightweight-Charts (by TradingView, open-source)
  2. TradingView-Widget (official, free-tier)
- **Metrics:**
  - Bundle-size
  - Offline-capability
  - Feature-richness (indicators, drawing-tools)
  - Rendering-performance (FPS on real-time-data)
- **Duration:** 2025-08-20 → 2025-08-27 (1 week)

**Result:**

| Library | Bundle-Size | Offline | Features | Performance | Notes |
|---------|-------------|---------|----------|-------------|-------|
| Lightweight-Charts | ~50KB | ✅ Yes | Medium (OHLC, Volume, 5 Indicators) | 60fps | Good for PWA |
| TradingView-Widget | ~5KB | ❌ No | High (100+ Indicators, Drawing-Tools) | 60fps | Requires internet |

**Decision:** Use **Lightweight-Charts** (Offline-First-Priority > Feature-Richness).

**Learnings:**
- Offline-capability is critical for PWA (TradingView-Widget fails without internet)
- Lightweight-Charts is "good-enough" for MVP (can add more indicators manually)
- TradingView-Widget has better UX, but Offline-First is non-negotiable

**Date:** 2025-08-20 → 2025-08-27

**Migrated-to:** `src/components/InteractiveChart.tsx` (Production since Beta v0.1.0)

**Future:** Re-evaluate in Q1 2025 (Spike planned in Sprint S2) — TradingView now offers offline-capable version?

---

### EXP-005: IndexedDB vs. LocalStorage for Journal-Storage

**Status:** `completed`

**Goal:** Choose client-side storage for journal-entries (large-data, offline-capable).

**Setup:**
- **Approach:** Benchmark 2 options with 1000 journal-entries (avg 500 chars each)
  1. LocalStorage (JSON-stringify)
  2. IndexedDB (via Dexie)
- **Metrics:**
  - Write-performance (1000 entries)
  - Read-performance (1000 entries)
  - Query-performance (filter by tag, date-range)
  - Storage-limit
- **Duration:** 2025-09-01 → 2025-09-05 (5 days)

**Result:**

| Storage | Write (1000 entries) | Read (1000 entries) | Query (tag-filter) | Limit | Notes |
|---------|---------------------|---------------------|-------------------|-------|-------|
| LocalStorage | 2.5s | 1.8s | 500ms (full-scan) | 5-10MB | Slow, no indexes |
| IndexedDB (Dexie) | 800ms | 300ms | 50ms (indexed) | ~50MB+ | Fast, structured |

**Decision:** Use **IndexedDB (via Dexie)** (10x faster queries, no storage-limit issues).

**Learnings:**
- LocalStorage is too slow for 1000+ entries (full-scan required for queries)
- IndexedDB supports indexes (fast tag-filter, date-range-queries)
- Dexie-API is much simpler than raw-IndexedDB (Promise-based, typed)

**Date:** 2025-09-01 → 2025-09-05

**Migrated-to:** `src/lib/persistence/db.ts` (Production since Beta v0.3.0)

---

## Failed Experiments

### EXP-006: Redux-Toolkit for Global-State

**Status:** `failed`

**Goal:** Use Redux-Toolkit for global-state-management (settings, access-status).

**Setup:**
- **Approach:** Implement Redux-Toolkit for `settingsStore` and `accessStore`
- **Tools:** `@reduxjs/toolkit`, `react-redux`
- **Duration:** 2024-10-10 → 2024-10-15 (5 days)

**Result:**
- ✅ Redux-Toolkit works well, good TypeScript-support
- ❌ Too much boilerplate for small app (actions, reducers, slices)
- ❌ ~20KB bundle-overhead vs. Zustand (~1KB)

**Decision:** Abandon Redux-Toolkit, switch to **Zustand** (simpler, smaller).

**Learnings:**
- Redux-Toolkit is overkill for apps with <10 global-state-slices
- Boilerplate (actions, reducers) slows down development
- Zustand provides 90% of Redux benefits with 10% of complexity

**Date:** 2024-10-10 → 2024-10-15

**Migrated-to:** `_intentions.md` (ADR-001: Zustand for Global State)

---

### EXP-007: Real-Time-Data via WebSocket (DexScreener)

**Status:** `abandoned`

**Goal:** Use WebSocket for real-time OHLC-data (instead of polling).

**Setup:**
- **Approach:** Connect to DexScreener WebSocket-API for real-time token-prices
- **Tools:** Native WebSocket-API, `reconnecting-websocket` library
- **Duration:** 2025-09-15 → 2025-09-20 (5 days)

**Result:**
- ✅ WebSocket works, real-time updates every 1s (vs. polling every 5s)
- ❌ DexScreener WebSocket is unstable (frequent disconnects, no reconnect-support)
- ❌ Complex connection-management (reconnect-logic, heartbeat, error-handling)
- ❌ Not offline-capable (WebSocket requires internet)

**Decision:** Abandon WebSocket, stick with **polling (every 5s)** for now.

**Learnings:**
- WebSocket is more complex than polling (connection-lifecycle, error-handling)
- DexScreener WebSocket is unstable (not production-ready)
- Polling is simpler and offline-capable (can use cached-data)
- May revisit WebSocket when building Real-Time-Alerts (Q1 2025)

**Date:** 2025-09-15 → 2025-09-20

---

## Planned Experiments

### EXP-008: Supabase-Realtime for Alerts (Q1 2025)

**Status:** `planned`

**Goal:** Evaluate Supabase-Realtime for push-notifications and real-time-alert-triggers.

**Setup:**
- **Approach:** Prototype alert-system with Supabase-Realtime + Postgres
- **Tools:** Supabase (Free-Tier), `@supabase/supabase-js`
- **Duration:** Planned for Sprint S3 (2025-12-10 → 2025-12-20)
- **Scope:**
  - Store alerts in Supabase-DB
  - Listen to price-changes via Supabase-Realtime
  - Trigger push-notifications when alert-condition met

**Metrics:**
- Latency (how fast are alerts triggered after price-change?)
- Cost (Supabase Free-Tier limits: 500MB storage, 2GB bandwidth)
- Complexity (vs. Vercel-Cron polling)

**Expected-Outcome:** If Supabase-Realtime is fast (<1s latency) and cheap, migrate alerts to Supabase.

---

### EXP-009: Lightweight-Charts vs. Recharts (Q1 2025)

**Status:** `planned`

**Goal:** Re-evaluate chart-library choice (Lightweight-Charts vs. Recharts).

**Setup:**
- **Approach:** Build prototype with Recharts (React-native charting-library)
- **Metrics:**
  - Bundle-size (current: ~50KB for Lightweight-Charts)
  - Rendering-performance (FPS on real-time-data)
  - A11y-support (SVG-based, easier a11y than Canvas)
- **Duration:** Planned for Sprint S2 (2025-11-26 → 2025-12-05)

**Decision-Criteria:**
- If Recharts is <100KB and has good a11y-support → consider migration
- If Recharts is >100KB or slow → stick with Lightweight-Charts

---

### EXP-010: AI-Prompt-Caching (Q1 2025)

**Status:** `planned`

**Goal:** Implement prompt-caching to reduce AI-costs for repeated-prompts.

**Setup:**
- **Approach:** Cache AI-responses in IndexedDB (Dexie) with 1h TTL
- **Metrics:**
  - Cache-hit-rate (% of requests served from cache)
  - Cost-savings ($ saved per month)
- **Duration:** Planned for Sprint S4 (2025-12-20 → 2026-01-05)

**Expected-Outcome:** Save ~$10-15/month by caching journal-condense results.

---

## Notes for AI Agents

**When to Add Experiments:**
- Tech-spikes (evaluate new library/tool)
- A/B-tests (compare 2 implementations)
- Prototypes (build MVP of new feature)

**What to Track:**
- Goal, Setup, Result, Decision, Learnings (use template above)
- Metrics (cost, performance, quality, bundle-size)
- Date-range (start → end)

**What to Move Out:**
- Completed-Experiments → `_intentions.md` (if decision is important ADR)
- Failed-Experiments → Keep here (learnings are valuable)
- Long-Term-Decisions → SYSTEM-Files (if becomes canonical-rule)

---

## Revision History

- **2025-11-12:** Initial creation, Phase 3 ITERATIVE-Q&A (10 experiments documented: 1 active, 5 completed, 2 failed, 3 planned)
