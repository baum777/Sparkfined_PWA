---
mode: ITERATIVE
id: "_planning"
priority: 1
version: "0.1.0"
last_update: "2025-11-12"
targets: ["cursor", "claudecode", "codex"]
description: "Current sprint planning, feature roadmap, backlog and release milestones for Sparkfined PWA"
---

# Planning — Sprint & Roadmap

> **Purpose:** Tracks active sprint, near-term roadmap (~3 months), backlog highlights and upcoming releases.
>
> **Update-Frequency:** Weekly (Sprint-Planning) or when priorities shift.
>
> **Behaviour:** The model updates this when planning changes (new sprint, feature reprioritisation), keeps it high-level and actionable, not as an issue tracker.

---

## Active Sprint / Milestone

### Current Sprint: **S0 — Foundation Cleanup (2025-11-12 → 2025-11-26)**

**Status:** `in_progress`

**Goal:** Stabilise core PWA features, improve documentation, set up multi-tool AI prompt system.

**Tasks:**

| Task | Priority | Status | Owner | Notes |
|------|----------|--------|-------|-------|
| Multi-Tool Prompt System (Rulesync) | `P0` | `in_progress` | AI-Agent | SYSTEM-Files komplett ✅, ITERATIVE-Files in Arbeit |
| PWA Offline-Mode Audit | `P1` | `completed` | — | Service-Worker stabil, Precache 428KB |
| Bundle-Size-Optimisation | `P1` | `pending` | — | Target: <400KB (aktuell: 428KB) |
| E2E-Test-Coverage | `P2` | `pending` | — | Playwright-Setup vorhanden, aber nur 3 Tests |
| Documentation-Consolidation | `P2` | `completed` | — | `docs/` aufgeräumt, `README.md` aktualisiert |

---

## Feature Roadmap (Next ~3 Months)

### Q1 2025 (Jan–Mar)

#### 🎯 High-Priority (P0)

**1. On-Chain Access Gating**
- **Goal:** Replace mock-wallet with real Solana-NFT-based access control
- **Scope:**
  - Integrate `@solana/wallet-adapter-react` (Phantom, Solflare)
  - Implement `/api/access/verify` endpoint (on-chain NFT-check)
  - Add wallet-connection UI (`ConnectWalletButton`, `WalletModal`)
  - Update `useAccessStore` with real on-chain verification
- **Estimated-Effort:** 2 sprints (4 weeks)
- **Dependencies:** Solana-Devnet-Testing, NFT-Minting-Setup

**2. Real-Time Alerts (Push-Notifications)**
- **Goal:** Enable browser-push-notifications for price-alerts and signal-triggers
- **Scope:**
  - Service-Worker push-event-handler
  - `/api/alerts/subscribe` endpoint (save push-subscription to DB)
  - Alert-triggering via Vercel-Cron or Webhook
  - UI: Alert-Settings-Page, Notification-Permission-Prompt
- **Estimated-Effort:** 2 sprints (4 weeks)
- **Dependencies:** Push-API-Browser-Support, Backend-DB (Supabase?)

**3. Background Sync (Offline-First-Writes)**
- **Goal:** Queue offline-actions (e.g. journal-entries, alert-creation) and sync when online
- **Scope:**
  - Service-Worker `sync` event-handler
  - Dexie-Queue for pending-actions
  - Retry-Logic + Conflict-Resolution
- **Estimated-Effort:** 1 sprint (2 weeks)
- **Dependencies:** Offline-Mode stable (✅), Dexie-Setup (✅)

#### 🔧 Mid-Priority (P1)

**4. Chart-Library-Migration (Lightweight-Charts → ?)**
- **Goal:** Evaluate alternative chart-libraries for better performance/features
- **Options:**
  - Keep Lightweight-Charts (current, stable, offline-capable)
  - TradingView Widget (more features, but requires internet)
  - Recharts (React-native, but heavy bundle)
- **Decision-Date:** End of Q1 2025
- **Spike:** Planned for Sprint S2 (Dec 2024)

**5. AI-Cost-Optimisation**
- **Goal:** Reduce AI-Costs from ~$50/month to ~$25/month
- **Tactics:**
  - Implement response-caching (1h TTL) ✅ (partially done)
  - Switch high-volume tasks from Grok to gpt-4o-mini ✅ (done)
  - Add per-user rate-limiting (20 requests/hour)
  - Implement prompt-compression for long contexts
- **Estimated-Effort:** 1 sprint (2 weeks)

**6. Supabase-Migration (Optional)**
- **Goal:** Add backend-DB for persistent user-data (alerts, watchlists, settings)
- **Rationale:** Dexie (IndexedDB) ist gut für Offline, aber kein Cross-Device-Sync
- **Scope:**
  - Supabase-Auth-Setup
  - Migrate `alerts`, `watchlist`, `settings` to Supabase
  - Keep `journal` in Dexie (Offline-First)
- **Decision:** Not yet confirmed (evaluate after On-Chain-Access-Gating)

#### 📦 Low-Priority (P2)

**7. Mobile-App-Wrapper (Capacitor)**
- **Goal:** Wrap PWA in native iOS/Android app for App-Store distribution
- **Effort:** 1 sprint (2 weeks)
- **Status:** Backlog (Nice-to-Have)

**8. Advanced-TA-Indicators (Ichimoku, Keltner, etc.)**
- **Goal:** Extend TA-Library with more indicators
- **Effort:** 1 sprint (2 weeks)
- **Status:** Backlog (Nice-to-Have)

---

## Planned Refactors / Architecture Changes

### 1. **TypeScript-Strict-Mode-Cleanup** (Q1 2025)
- **Goal:** Fix remaining `any`-Types in critical modules (reduce from ~50 to <10)
- **Scope:** `src/lib/`, `api/`, `src/hooks/`
- **Effort:** 1 sprint (2 weeks)

### 2. **ESLint-Rules-Tuning** (Q1 2025)
- **Goal:** Enable `@typescript-eslint/no-unsafe-*` rules as errors (not warnings)
- **Effort:** 1 sprint (2 weeks)
- **Blocker:** Requires TypeScript-Strict-Mode-Cleanup first

### 3. **Chart-Component-Rewrite** (Q2 2025, if Chart-Library changes)
- **Goal:** Rewrite `InteractiveChart.tsx` if switching from Lightweight-Charts
- **Effort:** 2 sprints (4 weeks)
- **Decision-Pending:** Chart-Library-Spike in S2

---

## Backlog & Wishes

### Nice-to-Have-Features (Not Prioritised)

- **Dark/Light-Mode-Toggle:** Currently Dark-Mode-First, Light-Mode not implemented (Low-User-Demand)
- **Multi-Language-Support (i18n):** Currently English-only (Low-Priority, mainly EU/US users)
- **Social-Sharing:** Share journal-entries or chart-screenshots to Twitter/Discord (Fun, but not core)
- **Portfolio-Tracker:** Track wallet-balances and P&L over time (Complex, needs backend-DB)
- **Copy-Trading:** Follow other users' trades (Very complex, legal concerns)

### Known Tech Debt

| Item | Priority | Effort | Notes |
|------|----------|--------|-------|
| **Reduce `any`-Types** | `P1` | 2 weeks | ~50 instances in `src/lib/`, `api/` |
| **E2E-Test-Coverage** | `P1` | 2 weeks | Only 3 tests, target: 15-20 critical flows |
| **Bundle-Size-Reduction** | `P1` | 1 week | Current: 428KB, Target: <400KB (Icon-Tree-Shaking, Code-Splitting) |
| **API-Error-Handling** | `P2` | 1 week | Inconsistent error-responses across endpoints |
| **A11y-Audit** | `P2` | 1 week | Run `axe-core` on all pages, fix critical issues |

---

## Releases & Milestones

### Next Release: **Beta v0.9.0** (Target: 2025-12-15)

**Acceptance Criteria:**

- ✅ PWA installable on iOS/Android (Manifest, Service-Worker, Icons)
- ✅ Offline-Mode functional (Journal, Board, Charts)
- ✅ AI-Assist available (Journal-Condense, Chat)
- ⏳ On-Chain-Access-Gating live (Solana-Devnet)
- ⏳ Push-Notifications functional (at least for Price-Alerts)
- ⏳ E2E-Test-Coverage ≥ 80% for critical flows
- ⏳ Bundle-Size <400KB gzipped

**Scope:**

- On-Chain-Access-Gating (P0)
- Real-Time-Alerts (P0)
- Background-Sync (P0)
- Bundle-Size-Optimisation (P1)
- E2E-Test-Coverage (P1)

**Release-Notes (Draft):**

```markdown
# Sparkfined Beta v0.9.0 (2025-12-15)

## 🎉 New Features
- **On-Chain Access Gating:** Connect your Solana-Wallet (Phantom, Solflare) to access premium features
- **Real-Time Alerts:** Get push-notifications for price-alerts and signal-triggers
- **Background Sync:** Create journal-entries and alerts offline, auto-sync when online

## 🚀 Improvements
- **Bundle-Size:** Reduced from 428KB to <400KB (faster load-times)
- **E2E-Test-Coverage:** 80% coverage for critical user-flows (more stable)

## 🐛 Bug Fixes
- Fixed Service-Worker update-loop on iOS Safari
- Fixed chart-rendering on low-DPI screens
- Fixed AI-Cost-Tracking inaccuracies
```

---

### Future Milestones

**Public v1.0.0** (Target: Q2 2025)
- On-Chain-Access-Gating (Mainnet)
- Supabase-Backend (Cross-Device-Sync)
- Mobile-App-Wrapper (Capacitor, App-Store)
- Advanced-TA-Indicators (Ichimoku, Keltner)

---

## Notes for AI Agents

**When to Update:**
- Start of new sprint (update "Active Sprint" section)
- Feature-Prioritisation changes (move P2 → P0, or vice versa)
- Completed milestones (move tasks to `_log.md`)

**What Not to Track Here:**
- Individual commits (use `_log.md`)
- Daily progress (use `_context.md`)
- Bug-Reports (use Issue-Tracker or `_context.md`)

---

## Revision History

- **2025-11-12:** Initial creation, Phase 3 ITERATIVE-Q&A (S0 Sprint, Q1 Roadmap)
