---
mode: ITERATIVE
id: "_planning"
version: "0.1.0"
last_review: "2025-11-12"
targets: ["cursor", "claudecode", "codex"]
description: "Active sprint, feature roadmap, backlog, and upcoming releases for Sparkfined PWA"
---

# Sprint Planning & Roadmap

> **Purpose:** Current planning state, near-term roadmap (~3 months), backlog highlights, and release targets.
>
> **Update-Frequency:** Weekly (Sprint-Start) or when major planning changes occur.

---

## 1. Active Sprint / Milestone

### Current Sprint: **Sprint 2025-W07** (2025-11-11 to 2025-11-24)

**Theme:** "AI-Powered-Workflows + PWA-Performance-Optimization"

**Status:** ✅ 60% Complete (4/7 tasks done)

### Tasks in Progress

| Task | Priority | Status | Owner | Notes |
|------|----------|--------|-------|-------|
| Journal-Condense-AI-Integration | P0 | ✅ Done | – | Shipped in v0.8.2 |
| Bullet-Analysis-AI-Integration | P0 | ✅ Done | – | Shipped in v0.8.2 |
| AI-Cost-Budget-Dashboard | P1 | 🔄 In-Progress | – | UI draft done, backend pending |
| PWA-Bundle-Size-Optimization | P1 | 🔄 In-Progress | – | Target: <400KB (current: 428KB) |
| Service-Worker-Cache-Strategy-Refinement | P2 | ⏳ Pending | – | Blocked by Bundle-Size-Task |
| Accessibility-Audit-A11y-Tests | P2 | ⏳ Pending | – | Planned for next sprint |
| E2E-Test-Coverage-Expansion | P2 | ⏳ Pending | – | Add Signal-Matrix E2E tests |

**Next-Sprint-Preview (Sprint 2025-W09):**
- On-Chain-Access-Gating-Prototype (Solana-Wallet-Adapter)
- Real-Time-Alerts-WebSocket-Spike
- Chart-Performance-Optimization (List-Virtualization)

---

## 2. Feature Roadmap (Next ~3 Months)

### Q1 2025 (Jan–Mar) — Big Features

#### 🎯 P0 – Must-Have

1. **On-Chain-Access-Gating** (Q1 2025)
   - **Goal:** Replace Mock-Wallet with real Solana-NFT-Access-Check
   - **Scope:** Wallet-Adapter-Integration (Phantom, Solflare), On-Chain-NFT-Verification, Access-Control-Flow
   - **Blockers:** NFT-Contract-Design, Solana-RPC-Rate-Limits
   - **Status:** Prototype planned for Sprint 2025-W09

2. **Background-Sync** (Q1 2025)
   - **Goal:** Sync Journal/Watchlist/Alerts when User comes back online
   - **Scope:** Workbox-Background-Sync-Plugin, Queue-Management, Conflict-Resolution
   - **Blockers:** None (PWA-Infra ready)
   - **Status:** Design-Phase

3. **Real-Time-Alerts** (Q1 2025)
   - **Goal:** Push-Notifications + In-App-Alerts für Price/Volume-Triggers
   - **Scope:** WebSocket-Connection (Dexscreener/Moralis), Notification-Permission-Flow, Alert-Rule-Engine
   - **Blockers:** WebSocket-Stability, Cost-Estimation für Real-Time-Data
   - **Status:** WebSocket-Spike planned for Sprint 2025-W09

#### 🔧 P1 – Should-Have

4. **Chart-Performance-Optimization** (Q1 2025)
   - **Goal:** Smooth 60fps for 1000+ Candles, reduce Memory-Usage
   - **Scope:** List-Virtualization (react-window), Canvas-Rendering-Optimization, Debounced-Zoom/Pan
   - **Status:** Tech-Spike planned

5. **AI-Cost-Dashboard** (Q1 2025)
   - **Goal:** User-Visible-Dashboard für AI-Token-Usage + Cost-Budget
   - **Scope:** Cost-Tracking-Store, UI-Component (Charts, Budget-Bar), Daily/Monthly-Aggregation
   - **Status:** Backend 50% done, UI pending

6. **Supabase-Migration** (Q1–Q2 2025, Exploratory)
   - **Goal:** Evaluate Supabase-Realtime für Cross-Device-Sync (Journal, Watchlist)
   - **Scope:** Spike: Supabase-Auth, Realtime-Subscriptions, Migration-Path von Dexie
   - **Blockers:** Cost-Estimation, Privacy-Concerns (User-Data on Supabase)
   - **Status:** Not-Started (Exploratory)

#### 🎨 P2 – Nice-to-Have

7. **TradingView-Chart-Widget-Integration** (Q2 2025)
   - **Goal:** Optional TradingView-Embed für Advanced-TA-Tools
   - **Scope:** Iframe-Embed, Symbol-Mapping (Solana-Token → TradingView-Symbol)
   - **Blockers:** TradingView-API-Limits, Bundle-Size-Impact
   - **Status:** Not-Started

---

### Planned Refactors / Architecture Changes

| Refactor | Priority | Timeline | Rationale |
|----------|----------|----------|-----------|
| **Chart-Library-Evaluation** | P1 | Q1 2025 | Evaluate Lightweight-Charts vs. current custom-canvas (Performance + Maintainability) |
| **TypeScript-Strict-Mode-Full-Adoption** | P2 | Q1 2025 | Currently `strict: true`, but some `any`-usages remain (pragmatic) → Clean up gradually |
| **API-Client-Refactor** | P2 | Q2 2025 | Consolidate `fetchWithRetry` + `RateLimiter` into unified API-Client-Class |
| **Zustand-Store-Split** | P2 | Q2 2025 | Split large stores (e.g. `settingsStore`) into domain-specific slices (reduce re-renders) |

---

## 3. Backlog & Wishes

### Nice-to-Have Features (Not-Prioritized)

- **Social-Features:** Share-Journal-Entries via Short-Link (Low-Priority, Privacy-Concerns)
- **Advanced-Backtesting:** Full-Strategy-Backtester with Monte-Carlo-Simulations (High-Effort, niche)
- **Mobile-Native-App:** React-Native-Port for iOS/Android (PWA-First-Strategy, Native nice-to-have)
- **Multi-Language-Support:** i18n for German/English (Currently English-Only, Low-Demand)
- **Theming-System:** User-Custom-Themes beyond Dark/Light (Low-Priority, Complexity)

### Known Tech Debt

| Item | Priority | Timeline | Notes |
|------|----------|----------|-------|
| **ESLint-Warnings-Cleanup** | P2 | Q1 2025 | ~50 warnings (jsx-a11y, unused-vars) → Clean up gradually |
| **Vitest-Coverage-Gaps** | P1 | Q1 2025 | Current: ~70%, Target: 80% (critical modules: 90%) |
| **Playwright-E2E-Stability** | P1 | Q1 2025 | Flaky tests on CI (Timing-Issues) → Add explicit waits |
| **Bundle-Size-Bloat** | P0 | Q1 2025 | Current: 428KB, Target: <400KB (Icon-Tree-Shaking, Code-Splitting) |
| **Dexie-Migration-Strategy** | P2 | Q2 2025 | No migration system yet (breaking IndexedDB-Schema-Changes risky) |

---

## 4. Releases & Milestones

### Next Release: **v1.0.0-beta (Beta-Launch)**

**Target-Date:** 2025-02-15 (±1 week)

**Acceptance-Criteria:**

- ✅ All P0-Features shipped (On-Chain-Access, Background-Sync, Real-Time-Alerts)
- ✅ PWA-Lighthouse-Score ≥ 90 (Performance, Accessibility, Best-Practices, SEO)
- ✅ Bundle-Size <400KB (gzipped)
- ✅ E2E-Test-Coverage for all critical user-flows (Login, Journal, Chart, Alerts)
- ✅ Accessibility-Audit passed (WCAG 2.1 AA, axe-core automated tests)
- ✅ Security-Audit passed (No exposed API-Keys, HTTPS-Only, CORS-Policy)
- ✅ Documentation complete (README, API-Docs, Deployment-Checklist)

**Release-Plan:**

1. **2025-01-15:** Feature-Freeze (no new features, bugfixes only)
2. **2025-01-20:** Beta-Tester-Invites (10-20 users)
3. **2025-02-01:** Beta-Testing-Phase (2 weeks, collect feedback)
4. **2025-02-10:** Final-Bugfixes, Documentation-Polish
5. **2025-02-15:** Beta-Launch (Production-Deployment)

---

### Future-Milestones

| Milestone | Target-Date | Key-Features |
|-----------|-------------|--------------|
| **v1.0.0 (Public-Release)** | Q2 2025 | Stable, Public-Facing, Marketing-Launch |
| **v1.1.0 (Advanced-Features)** | Q3 2025 | Supabase-Sync, TradingView-Widget, Advanced-Backtesting |
| **v2.0.0 (Mobile-Native)** | Q4 2025 | React-Native-App (iOS/Android) |

---

## 5. Sprint-Retrospective (Last Sprint: 2025-W05)

**What Went Well:**
- ✅ AI-Orchestrator shipped on-time (Journal-Condense, Bullet-Analysis)
- ✅ PWA-Offline-Mode stable (no reported bugs from testers)
- ✅ TypeScript-Strict-Mode enabled (found 15 type-bugs early)

**What Could Be Improved:**
- ⚠️ Bundle-Size increased by 50KB (Lucide-Icons-Import not tree-shaken correctly)
- ⚠️ E2E-Tests flaky on CI (3/10 tests failed randomly)
- ⚠️ No Accessibility-Tests yet (should be added in next sprint)

**Action-Items for Next Sprint:**
- Fix Lucide-Icons-Import (use named-imports instead of wildcard)
- Add explicit waits in E2E-Tests (reduce flakiness)
- Start Accessibility-Audit (axe-core, manual-keyboard-nav-test)

---

## Meta

**Last-Updated:** 2025-11-12 (Sprint 2025-W07 Start)

**Next-Review:** 2025-11-18 (Mid-Sprint Check-In)

**Owner:** Project-Lead (or assign Sprint-Owner if team grows)
