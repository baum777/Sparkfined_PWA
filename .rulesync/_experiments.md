---
mode: ITERATIVE
id: "_experiments"
version: "0.1.0"
last_review: "2025-11-12"
targets: ["cursor", "claudecode", "codex"]
description: "Active and past experiments, tech spikes, prototypes, and A/B tests for Sparkfined PWA"
---

# Experiments, Prototypes & Tech Spikes

> **Purpose:** Tracks active/past experiments, spikes, prototypes, and A/B-tests – what was learned, what was chosen, what was dropped.
>
> **Update-Frequency:** When experiments start/finish, or when results are significant.
>
> **Format:** Micro-template per experiment: Name → Goal → Setup → Result → Decision → Learnings.

---

## 1. Active Experiments

### EXP-001: WebSocket-Real-Time-Data-Spike

**Status:** 🔄 In-Progress (Started 2025-11-12)

**Goal:**
Evaluate WebSocket-connection for Real-Time-Alerts (Price/Volume-Triggers) vs. Polling.

**Setup:**
- **Provider:** Dexscreener-WebSocket-API (wss://api.dexscreener.com/ws)
- **Test-Scope:** Connect to WebSocket, subscribe to 5 tokens, measure latency + reconnect-stability
- **Metrics:** Latency (time-to-first-message), Reconnect-Success-Rate, Cost-Estimation

**Hypothesis:**
WebSocket-Latency <1s (vs. Polling 10s), but reconnect-logic complex + cost-unknown.

**Current-Results:**
- ⏳ Pending (spike-planned for Sprint 2025-W09)

**Decision-Deadline:** 2025-11-24 (End of Sprint 2025-W09)

**Owner:** TBD

---

### EXP-002: Chart-Library-Evaluation (Lightweight-Charts vs. Custom-Canvas)

**Status:** 🔄 In-Progress (Started 2025-11-10)

**Goal:**
Decide: Stick with custom-canvas-chart or migrate to Lightweight-Charts (TradingView-Library).

**Setup:**
- **Test-Scope:** Build prototype with Lightweight-Charts (same features as custom-canvas)
- **Metrics:**
  - Performance: 60fps with 1000+ candles? (Benchmark: react-window + canvas-rendering)
  - Customizability: Can we add custom-indicators (RSI, Fibonacci)?
  - Bundle-Size: Current ~50KB (custom), Lightweight-Charts ~120KB
  - Maintainability: Time-to-fix-bug (custom: 2h, Lightweight-Charts: community-support?)

**Hypothesis:**
Lightweight-Charts faster-to-ship (less-maintenance), but less-customizable. Custom-canvas flexible, but high-maintenance.

**Current-Results:**
- ✅ Lightweight-Charts-Prototype built (`/tests/prototypes/lightweight-charts-demo.tsx`)
- ✅ Performance: 60fps with 5000+ candles (better than custom-canvas)
- ⚠️ Customizability: No built-in-Fibonacci-Retracements (need custom-plugin)
- ⚠️ Bundle-Size: +70KB (120KB vs. 50KB custom) → acceptable if performance-gain worth it

**Decision-Deadline:** 2025-11-18 (Mid-Sprint Check-In)

**Owner:** TBD

**Next-Steps:**
- Test Fibonacci-Retracements-Plugin (check if community-plugin available)
- Compare maintenance-effort: custom-canvas-bug-fix-time vs. Lightweight-Charts-issue-lookup

---

### EXP-003: Supabase-Realtime-Spike (Cross-Device-Sync)

**Status:** ⏳ Planned (Start: Q1 2025)

**Goal:**
Evaluate Supabase-Realtime for cross-device-sync (Journal, Watchlist, Alerts) vs. Manual-Export/Import.

**Setup:**
- **Test-Scope:** Prototype Journal-Sync via Supabase-Realtime (2 devices, real-time-updates)
- **Metrics:**
  - Latency: Time-to-sync (Device-A writes → Device-B sees update)
  - Cost: Supabase-Free-Tier sufficient? (Monthly-Active-Users, Data-Transfer)
  - Privacy: User-Data on Supabase-Cloud → GDPR-compliant?
  - Migration-Effort: Dexie → Supabase-Schema-Migration (estimated dev-time)

**Hypothesis:**
Supabase-Realtime enables "magical" cross-device-sync (write on phone, see on desktop), but adds complexity + privacy-concerns.

**Decision-Deadline:** Q2 2025 (after v1.0.0-beta-launch, based on user-demand)

**Owner:** TBD

---

## 2. Completed Experiments

### EXP-004: Redux-Toolkit vs. Zustand for State-Management

**Status:** ✅ Completed (2024-11-20)

**Goal:**
Decide: Redux-Toolkit (full-featured) vs. Zustand (minimal) for global-state-management.

**Setup:**
- **Test-Scope:** Build prototype with both (Settings-Store, Journal-Store)
- **Metrics:**
  - Boilerplate: Lines-of-Code (Redux-Toolkit: action-creators, reducers, slices vs. Zustand: one `create()` call)
  - TypeScript-Support: Type-Inference-Quality
  - DevTools: Redux-DevTools vs. Zustand-DevTools
  - Learning-Curve: Time-to-onboard-new-dev (estimated)

**Result:**
- **Redux-Toolkit:** 150 lines-of-code (action-creators, reducers, slices)
- **Zustand:** 50 lines-of-code (one `create()` call, no boilerplate)
- **TypeScript:** Both good, Zustand slightly better-inference (no manual-action-types)
- **DevTools:** Redux-DevTools more-powerful, but Zustand-DevTools sufficient for Sparkfined's-scope

**Decision:** ✅ **Zustand** chosen (minimal-API, sufficient-features, easy-to-learn)

**Rationale:**
- Sparkfined's state-management simple (~10 stores, no complex-async-flows)
- Redux-Toolkit overkill (100 lines boilerplate vs. 50 lines Zustand)
- Team-familiarity: Zustand closer to React-Context + Hooks (easier-onboarding)

**Learnings:**
- Redux-Toolkit great for large-apps (100+ actions, complex-middleware)
- Zustand perfect for small-to-medium-apps (Sparkfined's-scope)

**Related:** `_intentions.md` (ADR-001: Zustand-Choice)

---

### EXP-005: Service-Worker-Cache-Strategies (Network-First vs. Cache-First)

**Status:** ✅ Completed (2024-12-05)

**Goal:**
Decide: Cache-First (offline-first, stale-data-risk) vs. Network-First (fresh-data, no-offline-support).

**Setup:**
- **Test-Scope:** Test both strategies for API-Endpoints (`/api/data/ohlc`, `/api/moralis/*`)
- **Metrics:**
  - Offline-Support: Does app-work-offline? (Cache-First: yes, Network-First: no)
  - Data-Freshness: Stale-data-risk? (Cache-First: high, Network-First: none)
  - Latency: Cache-First faster? (yes, ~50ms vs. 200-500ms network)

**Result:**
- **Cache-First:** Works-offline ✅, but stale-data-risk ⚠️ (OHLC-data can be hours-old)
- **Network-First:** Always-fresh ✅, but no-offline ❌ (app-breaks-without-internet)
- **Hybrid (Stale-While-Revalidate):** Best-of-both (serve-cache immediately, update-in-background)

**Decision:** ✅ **Stale-While-Revalidate** chosen (Cache-First for static-assets, Stale-While-Revalidate for APIs)

**Rationale:**
- Offline-First is core-value-proposition → Cache-First for static-assets mandatory
- APIs (OHLC, Moralis): Serve-cache-immediately (offline-works), update-in-background (fresh-data-when-online)
- User-Experience: No-loading-spinner (instant-cache), but data-updates-seamlessly-when-online

**Learnings:**
- Stale-While-Revalidate perfect for PWA-APIs (offline + fresh-data)
- Network-First only for critical-fresh-data (e.g. Payment-APIs, not applicable for Sparkfined)

**Related:** `03-pwa-conventions.md` (Cache-Strategies)

---

## 3. Failed Experiments (Dropped)

### EXP-006: TradingView-Widget-Embed (iframe)

**Status:** ❌ Dropped (2024-12-10)

**Goal:**
Embed TradingView-Chart-Widget (iframe) for advanced-TA-tools.

**Setup:**
- **Test-Scope:** Iframe-embed of TradingView-Widget, test symbol-mapping (Solana-Token → TradingView-Symbol)
- **Metrics:**
  - Load-Time: Iframe-load-time (3-5s)
  - Offline-Support: Does iframe-work-offline? (No)
  - Symbol-Mapping: Can we map Solana-Tokens to TradingView-Symbols? (Partial: only top-100-tokens)

**Result:**
- ❌ Iframe-Load-Time: 3-5s (slow, blocks-UI)
- ❌ Offline-Support: None (TradingView-requires-internet)
- ⚠️ Symbol-Mapping: Only top-100-tokens have TradingView-symbols (long-tail not-covered)

**Decision:** ❌ **Dropped** (iframe-too-slow + offline-first-conflicts)

**Rationale:**
- Offline-First is core-value-proposition → TradingView-Iframe breaks-offline
- Load-Time 3-5s unacceptable (Sparkfined-target: <2s LCP)
- Symbol-Mapping incomplete (long-tail-tokens not-covered)

**Learnings:**
- TradingView-Widget great for web-apps with internet-dependency
- For PWA-offline-first, custom-charts mandatory (or Lightweight-Charts)

**Alternative:**
- Keep custom-canvas-chart (or migrate to Lightweight-Charts)
- TradingView-Embed optional-feature (user-opts-in, disabled-by-default)

**Related:** `_intentions.md` (ADR-010: CSR-Charts)

---

### EXP-007: Redux-DevTools-Performance-Impact

**Status:** ❌ Dropped (2024-11-25)

**Goal:**
Measure Redux-DevTools performance-impact on Sparkfined (before deciding Redux vs. Zustand).

**Setup:**
- **Test-Scope:** Enable Redux-DevTools, measure FPS-drop during heavy-state-updates (chart-zoom, watchlist-scroll)
- **Metrics:**
  - FPS-Drop: 60fps → ? (with/without DevTools)
  - Memory-Usage: DevTools-Memory-Overhead

**Result:**
- ⚠️ FPS-Drop: 60fps → 45fps (with Redux-DevTools enabled during heavy-state-updates)
- ⚠️ Memory-Usage: +50MB (DevTools stores action-history)

**Decision:** ❌ **Redux-DevTools dropped** (Zustand-chosen instead, lighter DevTools)

**Rationale:**
- Redux-DevTools performance-impact unacceptable for production (FPS-drop)
- Zustand-DevTools lighter (no action-history, just state-snapshot)

**Learnings:**
- Redux-DevTools great for debug, but disable-in-production (performance-cost)
- Zustand-DevTools sufficient for Sparkfined's-debugging-needs

**Related:** `_intentions.md` (ADR-001: Zustand-Choice)

---

## 4. Planned Experiments (Backlog)

### EXP-008: List-Virtualization for Large-Watchlists (react-window)

**Status:** ⏳ Planned (Start: Q1 2025)

**Goal:**
Test react-window for virtualizing large-watchlists (1000+ tokens) → reduce-render-time.

**Setup:**
- **Test-Scope:** Prototype Watchlist-Component with react-window (virtual-scrolling)
- **Metrics:**
  - Render-Time: Time-to-render 1000-tokens (current: ~2s, target: <500ms)
  - FPS: Scroll-FPS (current: ~30fps, target: 60fps)
  - Memory-Usage: DOM-Nodes (current: 1000, target: ~50 visible-nodes-only)

**Hypothesis:**
react-window reduces-render-time by 75% (only-render-visible-rows).

**Decision-Deadline:** Q1 2025 (Sprint 2025-W11)

**Owner:** TBD

---

### EXP-009: AI-Prompt-Caching (OpenAI-Caching-Beta)

**Status:** ⏳ Planned (Start: Q1 2025)

**Goal:**
Test OpenAI-Prompt-Caching (beta-feature) for repeated-AI-calls (Journal-Condense).

**Setup:**
- **Test-Scope:** Enable OpenAI-Prompt-Caching for Journal-Condense-System-Prompt (reuse-cached-prompt for 1h)
- **Metrics:**
  - Cost-Reduction: Cached-Prompt-Cost vs. Full-Prompt-Cost (estimated 50% reduction)
  - Latency: Cached-Prompt-Latency vs. Full-Prompt-Latency

**Hypothesis:**
Prompt-Caching reduces-cost by 50% for repeated-calls (same-system-prompt, different-user-input).

**Decision-Deadline:** Q1 2025 (when OpenAI-Caching exits-beta)

**Owner:** TBD

---

## 5. Experiment-Log (Chronological)

| Date | Experiment | Status | Decision | Notes |
|------|-----------|--------|----------|-------|
| 2024-11-20 | EXP-004: Redux vs. Zustand | ✅ Done | Zustand | Zustand-chosen (minimal-API, sufficient) |
| 2024-11-25 | EXP-007: Redux-DevTools-Perf | ❌ Dropped | Zustand-DevTools | Redux-DevTools too-heavy (FPS-drop) |
| 2024-12-05 | EXP-005: Cache-Strategies | ✅ Done | Stale-While-Revalidate | Best-of-both (offline + fresh) |
| 2024-12-10 | EXP-006: TradingView-Embed | ❌ Dropped | Custom-Charts | TradingView-Iframe too-slow + no-offline |
| 2025-11-10 | EXP-002: Chart-Library-Eval | 🔄 In-Progress | TBD (2025-11-18) | Lightweight-Charts-prototype built |
| 2025-11-12 | EXP-001: WebSocket-Spike | 🔄 In-Progress | TBD (2025-11-24) | Spike-planned for Sprint 2025-W09 |
| Q1 2025 | EXP-003: Supabase-Realtime | ⏳ Planned | TBD (Q2 2025) | Cross-device-sync evaluation |
| Q1 2025 | EXP-008: List-Virtualization | ⏳ Planned | TBD (Q1 2025) | react-window for large-watchlists |
| Q1 2025 | EXP-009: AI-Prompt-Caching | ⏳ Planned | TBD (Q1 2025) | OpenAI-Caching-Beta test |

---

## Meta

**Last-Updated:** 2025-11-12

**Next-Review:** 2025-11-18 (Mid-Sprint Check-In for active-experiments)

**Owner:** Experiment-Specific (assign-per-experiment)
