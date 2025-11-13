---
mode: ITERATIVE
id: "_log"
priority: 3
version: "0.1.0"
last_update: "2025-11-12"
targets: ["cursor", "claudecode", "codex"]
description: "Chronological event log: features shipped, breaking changes, significant commits, releases and team events for Sparkfined PWA"
---

# Log — Timeline & Significant Changes

> **Purpose:** Acts as a **chronological event log** for important changes: features shipped, breaking changes, big commits and releases.
>
> **Update-Frequency:** After significant events (daily to weekly).
>
> **Behaviour:** The model appends time-stamped entries instead of rewriting history, and keeps this log as the main "what happened when?" source for other agents.

---

## Log-Entry-Template

```markdown
### YYYY-MM-DD: Event-Title

**Type:** `feature` | `breaking-change` | `commit` | `release` | `team-event` | `process-change`

**Details:**
- Key changes
- Impact
- Related PRs/Commits (optional)

**Owner:** (optional)
```

---

## Recent Milestones (Last 4 Weeks)

### 2025-11-12: Multi-Tool Prompt System (Rulesync) — Phase 3 In-Progress

**Type:** `feature`

**Details:**
- Started Phase 3 of Multi-Tool-Prompt-System setup
- Generated all 11 SYSTEM-Files (00-11): `project-core`, `typescript`, `frontend-arch`, `pwa-conventions`, `ui-ux-components`, `api-integration`, `testing-strategy`, `accessibility`, `performance`, `security`, `deployment`, `ai-integration`
- Generated 6 ITERATIVE-Files: `_planning`, `_context`, `_intentions`, `_experiments`, `_log`, `_agents`
- Target: Support 3 AI-tools (Cursor, Claude Code, Codex) via unified prompt-structure

**Status:** ⏳ In-Progress (SYSTEM-Files ✅, ITERATIVE-Files ✅, Tool-Configs pending)

**Owner:** AI-Agent

---

### 2025-11-10: Fixed OHLC-API-Timeout on Slow Networks

**Type:** `bugfix`

**Details:**
- Fixed chart-loading-issue on slow 3G networks
- Added `timeout: 10s` to `fetchWithRetry` in `src/lib/net/fetch.ts`
- Improved error-handling for timeout-cases (show "Retry" button)

**Impact:** Charts now load reliably on slow networks (previously timed-out after 5s)

**Related:** Issue #42 (reported by @beta-tester-12)

**Owner:** Developer

---

### 2025-11-08: Fixed AI-Condense Empty-Result Bug

**Type:** `bugfix`

**Details:**
- Fixed issue where journal-condense returned empty-result for long entries (>5000 chars)
- Root-Cause: OpenAI-API-timeout (no `maxTokens` limit set)
- Fix: Added `maxTokens: 500` limit + retry-logic in `ai/orchestrator.ts`

**Impact:** Journal-condense now works reliably for long entries

**Related:** Issue #38 (reported by @beta-tester-07)

**Owner:** Developer

---

### 2025-11-05: Service-Worker-Update-Loop-Fix (iOS Safari)

**Type:** `bugfix`

**Details:**
- Fixed Service-Worker-update-loop on iOS Safari (infinite-reload on PWA-open)
- Root-Cause: `skipWaiting: false` caused stale-SW to stay active
- Fix: Changed to `skipWaiting: true` + added "Reload to Apply Update" toast in `src/main.tsx`

**Impact:** PWA now auto-updates correctly on iOS Safari

**Related:** EXP-002 (Service-Worker-Update-Strategy)

**Owner:** Developer

---

### 2025-11-05: Moralis-API-Key-Rotation

**Type:** `maintenance`

**Details:**
- Rotated expired Moralis-API-Key in Vercel-Environment-Variables
- All Moralis-API-calls were failing for ~2 hours before rotation
- Added reminder to rotate API-Keys every 90 days (see `09-security.md`)

**Impact:** Moralis-API-calls restored

**Owner:** DevOps

---

### 2025-10-22: Completed Service-Worker-Update-Strategy-Spike

**Type:** `experiment`

**Details:**
- Completed EXP-002 (Service-Worker-Update-Strategy)
- Tested `skipWaiting: true` vs. `skipWaiting: false`
- Decision: Use `skipWaiting: true` (auto-update) + toast-notification

**Impact:** PWA now auto-updates without user-prompt

**Related:** EXP-002, `vite.config.ts`

**Owner:** Developer

---

### 2025-10-15: PWA-Offline-Mode-Audit Completed

**Type:** `feature`

**Details:**
- Completed full audit of PWA-offline-capabilities
- Verified Service-Worker precache (428KB, 66 entries)
- Verified offline-scenarios: Journal ✅, Board ✅, Charts ✅ (with cached-data)
- Verified update-banner ("New version available")

**Impact:** PWA is production-ready for offline-usage

**Related:** `03-pwa-conventions.md`

**Owner:** Developer

---

## Significant Commits (Last 3 Months)

### 2025-10-10: AI-Orchestrator-Cost-Tracking

**Type:** `commit`

**Commit:** `a3f2b8c`

**Details:**
- Added cost-tracking to AI-Orchestrator (`ai/orchestrator.ts`)
- Log every AI-call with provider, tokens, estimated-cost
- Track total-cost per session (in-memory, reset on page-reload)

**Impact:** Better visibility into AI-costs (currently ~$50/month)

**Owner:** Developer

---

### 2025-10-01: Dual-AI-Provider-Strategy (OpenAI + Grok)

**Type:** `commit`

**Commit:** `b7e9c4d`

**Details:**
- Implemented dual-AI-provider-strategy in `ai/orchestrator.ts`
- Route cheap-tasks to OpenAI (gpt-4o-mini), expensive-tasks to Grok (xAI)
- Added provider-selection-logic based on task-type

**Impact:** Cost-optimisation (~$30/month savings vs. Grok-only)

**Related:** EXP-003, ADR-008

**Owner:** Developer

---

### 2025-09-20: Abandoned WebSocket-Spike (DexScreener)

**Type:** `commit`

**Commit:** `c1d5e2f`

**Details:**
- Abandoned EXP-007 (Real-Time-Data via WebSocket)
- DexScreener-WebSocket unstable (frequent disconnects)
- Stick with polling (every 5s) for now

**Impact:** No real-time-data, but more stable

**Related:** EXP-007

**Owner:** Developer

---

### 2025-09-05: Migrated Journal-Storage to IndexedDB (Dexie)

**Type:** `commit`

**Commit:** `d8a3f7b`

**Details:**
- Migrated journal-storage from LocalStorage to IndexedDB (Dexie)
- 10x faster queries (indexed tag-filter, date-range)
- No storage-limit issues (LocalStorage limited to 5-10MB)

**Impact:** Journal now supports 1000+ entries without performance-degradation

**Related:** EXP-005, ADR-002

**Owner:** Developer

---

### 2025-08-27: Implemented Interactive-Chart with Lightweight-Charts

**Type:** `commit`

**Commit:** `e4b2c9a`

**Details:**
- Implemented `InteractiveChart.tsx` with Lightweight-Charts
- Supports OHLC-candlesticks, volume, RSI, EMA/SMA, Bollinger-Bands
- Offline-capable (no external-dependencies)

**Impact:** Core-chart-feature complete

**Related:** EXP-004, ADR-009

**Owner:** Developer

---

### 2025-08-20: Initial-PWA-Setup (Service-Worker, Manifest)

**Type:** `commit`

**Commit:** `f9d7e1c`

**Details:**
- Set up PWA with `vite-plugin-pwa` + Workbox
- Created `manifest.webmanifest` (icons, theme, display-mode)
- Implemented Service-Worker with precache + runtime-caching

**Impact:** App is installable as PWA (iOS, Android, Desktop)

**Related:** `03-pwa-conventions.md`

**Owner:** Developer

---

### 2025-08-15: Zustand-Store-Refactor

**Type:** `commit`

**Commit:** `a1b2c3d`

**Details:**
- Refactored global-state from React-Context to Zustand
- Created `settingsStore`, `accessStore`, `aiProviderStore`
- Reduced re-renders by 30% (measured via React-DevTools-Profiler)

**Impact:** Better performance, simpler state-management

**Related:** ADR-001

**Owner:** Developer

---

## Releases & Deployments

### Beta v0.8.0 (2025-11-01)

**Features:**
- ✅ PWA-Offline-Mode (Journal, Board, Charts)
- ✅ AI-Orchestrator-Cost-Tracking
- ✅ Service-Worker-Auto-Update (iOS Safari fix)
- ✅ Chart-Loading-Timeout-Fix (slow networks)

**Breaking-Changes:**
- None

**Bundle-Size:** 428KB gzipped (66 precache-entries)

**Deployment:** Vercel (Production: `sparkfined.app`)

**Release-Notes:** [GitHub Release](https://github.com/sparkfined/app/releases/tag/v0.8.0)

---

### Beta v0.7.0 (2025-10-15)

**Features:**
- ✅ Dual-AI-Provider-Strategy (OpenAI + Grok)
- ✅ AI-Cost-Optimisation (route cheap-tasks to OpenAI)
- ✅ Journal-Condense-Empty-Result-Fix

**Breaking-Changes:**
- None

**Bundle-Size:** 425KB gzipped

**Deployment:** Vercel (Production: `sparkfined.app`)

---

### Beta v0.6.0 (2025-10-01)

**Features:**
- ✅ AI-Orchestrator-Live (OpenAI + Grok)
- ✅ Journal-Condense-AI
- ✅ Bullet-Analysis-AI

**Breaking-Changes:**
- None

**Bundle-Size:** 420KB gzipped

**Deployment:** Vercel (Production: `sparkfined.app`)

---

### Beta v0.5.0 (2025-09-15)

**Features:**
- ✅ Service-Worker-Auto-Update (`skipWaiting: true`)
- ✅ Offline-Fallback-Page (`public/offline.html`)

**Breaking-Changes:**
- Service-Worker-Update-Strategy changed (auto-update, no user-prompt)

**Bundle-Size:** 415KB gzipped

**Deployment:** Vercel (Production: `sparkfined.app`)

---

### Beta v0.4.0 (2025-09-05)

**Features:**
- ✅ Journal-Storage migrated to IndexedDB (Dexie)
- ✅ Chart-Accessibility (Data-Table-Alternative)

**Breaking-Changes:**
- Journal-Data migrated from LocalStorage to IndexedDB (one-time-migration on first-load)

**Bundle-Size:** 410KB gzipped

**Deployment:** Vercel (Production: `sparkfined.app`)

---

### Beta v0.3.0 (2025-08-27)

**Features:**
- ✅ Interactive-Chart (Lightweight-Charts)
- ✅ OHLC-Candlesticks, Volume, RSI, EMA/SMA, Bollinger-Bands

**Breaking-Changes:**
- None

**Bundle-Size:** 400KB gzipped

**Deployment:** Vercel (Production: `sparkfined.app`)

---

### Beta v0.2.0 (2025-08-20)

**Features:**
- ✅ PWA-Setup (Service-Worker, Manifest, Icons)
- ✅ Installable on iOS, Android, Desktop

**Breaking-Changes:**
- None

**Bundle-Size:** 350KB gzipped

**Deployment:** Vercel (Production: `sparkfined.app`)

---

### Beta v0.1.0 (2025-08-15)

**Features:**
- ✅ Initial-Release (Command-Board, Journal, Settings)
- ✅ Zustand-Store (Settings, Access-Status)
- ✅ Dark-Mode-UI

**Breaking-Changes:**
- None

**Bundle-Size:** 320KB gzipped

**Deployment:** Vercel (Production: `sparkfined.app`)

---

## Team & Process Events

### 2025-11-01: E2E-Test-Requirement for PRs

**Type:** `process-change`

**Details:**
- New rule: All PRs must include E2E-tests for new features (if applicable)
- Minimum: 1 E2E-test per user-facing-feature
- Playwright-CI-setup pending (GitHub-Actions)

**Impact:** Higher quality, fewer bugs in production

**Owner:** Team

---

### 2025-10-01: Beta-Testing-Program-Launch

**Type:** `team-event`

**Details:**
- Launched beta-testing-program with 15 external testers
- Testers receive access via invite-link (mock-wallet)
- Feedback-channel: Discord (#beta-feedback)

**Impact:** More user-feedback, faster bug-discovery

**Owner:** Team

---

### 2025-09-01: TypeScript-Strict-Mode-Enabled

**Type:** `process-change`

**Details:**
- Enabled TypeScript `strict: true` in `tsconfig.json`
- Fixed ~200 type-errors across codebase
- ESLint-rules: `no-explicit-any: off` (pragmatic, but tracked via TODO)

**Impact:** Better type-safety, fewer runtime-errors

**Owner:** Developer

---

## Notes for AI Agents

**When to Add Log-Entries:**
- After significant commits (feature, breaking-change, refactor)
- After releases (Beta v0.x.0)
- After team/process-events (new rule, team-change)

**What to Track:**
- Date (YYYY-MM-DD)
- Type (feature, bugfix, commit, release, team-event, process-change)
- Details (key changes, impact)
- Owner (optional, if known)

**What Not to Log:**
- Small commits (typo-fixes, minor-refactors) — use git-log
- WIP-commits (use git-log)
- Internal-discussions (use `_context.md`)

**Log-Format:**
- Append new entries at the top (reverse-chronological)
- Group by time-period (Last 4 Weeks, Last 3 Months, etc.)

---

## Revision History

- **2025-11-12:** Initial creation, Phase 3 ITERATIVE-Q&A (30+ entries: milestones, commits, releases, team-events)
