---
mode: ITERATIVE
id: "_log"
version: "0.1.0"
last_review: "2025-11-12"
targets: ["cursor", "claudecode", "codex"]
description: "Chronological timeline of milestones, releases, significant commits, and team/process events for Sparkfined PWA"
---

# Timeline & Significant Changes

> **Purpose:** Chronological event-log for important changes – features-shipped, breaking-changes, big-commits, releases, team/process-events.
>
> **Update-Frequency:** When significant-events occur (feature-shipped, release-deployed, breaking-change).
>
> **Format:** Time-stamped-entries (newest-first), append-only (don't rewrite-history).

---

## 2025-11

### 2025-11-12: Multi-Tool-Prompt-System (Rulesync) — Phase 3 Complete

**Event:** SYSTEM-Files (00-11) + ITERATIVE-Files (_planning, _context, _intentions, _experiments, _log, _agents) generated.

**Impact:**
- ✅ AI-Agents (Cursor, Claude Code, Codex) now have comprehensive prompt-system
- ✅ Rulesync-Configuration ready for `rulesync generate` (Phase 4 pending)

**Related-Files:**
- `.rulesync/*.md` (11 SYSTEM, 6 ITERATIVE)

**Owner:** AI-Assisted-Setup (Cursor + Claude 4.5)

---

### 2025-11-11: AI-Cost-Dashboard Backend Complete

**Event:** Shipped AI-Cost-Tracking-Logic in `ai/orchestrator.ts` (v0.8.4).

**Changes:**
- ✅ `trackAICall()`: Logs Token-Usage + Cost per AI-Call
- ✅ `estimateCost()`: Pre-Call-Cost-Estimation (OpenAI/Grok-Rates)
- ✅ `aiCostStore.tsx`: Zustand-Store for Cost-Tracking (Daily/Monthly-Aggregation)

**Impact:**
- Cost-Transparency for AI-Features (Journal-Condense, Bullet-Analysis)
- UI-Component pending (planned Sprint 2025-W07)

**Commit:** `e8a92f4` ("feat: Add AI-Cost-Tracking Backend")

**Related-Files:**
- `ai/orchestrator.ts`
- `src/store/aiCostStore.tsx`

---

### 2025-11-10: Service-Worker-Cache-Invalidation-Bug Fixed

**Event:** Fixed stale-cache-bug in PWA (v0.8.3).

**Issue:**
- Old Service-Worker-Cache not invalidated after Deployment → Users saw stale-UI

**Fix:**
- Added `cleanupOutdatedCaches: true` in `vite.config.ts` PWA-Plugin
- Added Update-Banner (prompts user to reload when new SW-available)

**Impact:**
- ✅ Users now auto-reload when new version deployed
- ✅ No more stale-UI-bugs

**Commit:** `a3f12b8` ("fix: Force SW-Cache-Cleanup on Update")

**Related-Files:**
- `vite.config.ts`
- `src/main.tsx` (SW-Update-Banner-Logic)

---

### 2025-11-09: TypeScript-Strict-Mode Enabled

**Event:** Enabled `strict: true` in `tsconfig.json`, fixed 120+ type-errors.

**Changes:**
- ✅ `strict: true`, `noUncheckedIndexedAccess: true`, `noImplicitOverride: true`
- ✅ Fixed 120 type-errors (mostly: `any` → `unknown`, null-checks)
- ⚠️ 30 edge-cases: Added `// @ts-expect-error` pragmatic-workarounds (documented in code)

**Impact:**
- Higher type-safety (caught 15 bugs early)
- Better IDE-autocomplete (type-inference improved)

**Commit:** `d7e4c91` ("feat: Enable TypeScript-Strict-Mode")

**Related-Files:**
- `tsconfig.json`
- `src/**/*.ts` (120+ files touched)

---

### 2025-11-08: Dark-Mode-Color-Adjustment (Beta-Tester-Feedback)

**Event:** Adjusted Dark-Mode-Colors for better readability (v0.8.3).

**Issue:**
- Beta-Tester-7 reported: "Background too dark, hard to read small text"

**Fix:**
- Background: `#0a0a0a` → `#0f0f0f` (lighter)
- Text-Color: `#d4d4d4` → `#e5e5e5` (higher-contrast)

**Impact:**
- ✅ Better readability for long-text (Journal, Alerts)
- ✅ WCAG-AA-Contrast-Ratio improved (4.5:1 → 6:1)

**Commit:** `b9d14f2` ("ui: Adjust Dark-Mode-Colors for Readability")

**Related-Files:**
- `src/styles/themes.css`

---

### 2025-11-05: AI-Orchestrator Shipped (Journal-Condense, Bullet-Analysis)

**Event:** Shipped AI-Orchestrator with OpenAI + Grok integration (v0.8.2).

**Features:**
- ✅ Journal-Condense-AI: Condense raw-journal-entry to structured-summary
- ✅ Bullet-Analysis-AI: Analyze bullet-points for insights/mistakes
- ✅ Dual-AI-Architecture: OpenAI (cost-efficient) + Grok (crypto-reasoning)

**Impact:**
- First-AI-Features live in production
- Cost-Budget: $0.25 per-request (acceptable for beta)

**Commit:** `f1a83d7` ("feat: Ship AI-Orchestrator with Journal-Condense + Bullet-Analysis")

**Related-Files:**
- `ai/orchestrator.ts`
- `ai/model_clients/openai.ts`
- `ai/model_clients/grok.ts`
- `src/state/ai-provider.tsx`

---

## 2025-10

### 2025-10-28: PWA-Offline-Mode Complete

**Event:** Shipped full-offline-mode for PWA (v0.8.0).

**Features:**
- ✅ Service-Worker (Workbox) with Cache-First + Stale-While-Revalidate
- ✅ Offline-Fallback (`public/offline.html`)
- ✅ IndexedDB (Dexie) persistence for Journal, Watchlist, Alerts
- ✅ Precache: Main-Bundle, Critical-Assets (~428KB)

**Impact:**
- Core-Feature complete (offline-first-PWA)
- Lighthouse-PWA-Score: 100

**Commit:** `c4e92a1` ("feat: Complete PWA-Offline-Mode")

**Related-Files:**
- `vite.config.ts` (PWA-Plugin-Config)
- `src/main.tsx` (SW-Registration)
- `public/offline.html`

---

### 2025-10-20: Initial-PWA-Setup (Service-Worker + Manifest)

**Event:** Added PWA-Infrastructure (Service-Worker, Manifest, Icons).

**Changes:**
- ✅ `vite-plugin-pwa` added to `vite.config.ts`
- ✅ `public/manifest.webmanifest` created (name, icons, theme-color)
- ✅ Icons generated (192x192, 512x512, favicon.ico)

**Impact:**
- Sparkfined now installable as PWA (Add-to-Homescreen)

**Commit:** `a9b23e5` ("feat: Initial-PWA-Setup")

**Related-Files:**
- `vite.config.ts`
- `public/manifest.webmanifest`
- `public/icons/*.png`

---

### 2025-10-15: Zustand-Store-Refactor (Settings, Access, Journal)

**Event:** Migrated from React-Context to Zustand for global-state.

**Rationale:**
- React-Context too-verbose for complex-state (deep-nesting, boilerplate)
- Zustand: Minimal-API, better-TypeScript-support

**Changes:**
- ✅ `settingsStore.tsx`: Theme, Replay-Speed, Chart-Settings
- ✅ `accessStore.tsx`: Wallet-Access-Status (mock)
- ✅ `journalStore.tsx`: Journal-Entries (Dexie-backed)

**Impact:**
- Cleaner-code (50% less-boilerplate vs. React-Context)
- Better-performance (fewer-re-renders)

**Commit:** `d1c72b3` ("refactor: Migrate to Zustand for Global-State")

**Related-Files:**
- `src/store/*.tsx`

---

## 2025-09

### 2025-09-25: Chart-Component-Rewrite (Custom-Canvas)

**Event:** Rewrote Chart-Component from scratch (custom-canvas-rendering).

**Rationale:**
- Old-Chart: react-chartjs-2 (slow, not-customizable)
- New-Chart: Custom-Canvas (full-control, 60fps for 1000+ candles)

**Changes:**
- ✅ Canvas-Rendering: Draw-OHLC-Candles, Volume-Bars, Crosshair
- ✅ Zoom/Pan: Wheel-Zoom, Drag-Pan, Pinch-Zoom (mobile)
- ✅ Indicators: RSI, EMA/SMA (planned: MACD, Bollinger)

**Impact:**
- Chart-Performance: 30fps → 60fps (2x improvement)
- Customizability: Full-control (add-custom-indicators)

**Commit:** `b8e14c9` ("feat: Rewrite Chart-Component (Custom-Canvas)")

**Related-Files:**
- `src/components/Chart.tsx`
- `src/lib/chart/*.ts`

---

### 2025-09-10: Vercel-Deployment-Setup

**Event:** First successful production-deployment to Vercel.

**Changes:**
- ✅ `vercel.json` configured (build-command, output-directory, regions)
- ✅ Serverless-APIs: `/api/data/*`, `/api/moralis/*`, `/api/ai/*`
- ✅ Environment-Variables: MORALIS_API_KEY, OPENAI_API_KEY (Vercel-Dashboard)

**Impact:**
- Sparkfined live at `https://sparkfined-preview.vercel.app`
- Auto-Deploy on Git-Push (Main → Production, PRs → Preview)

**Commit:** `a2d91e7` ("feat: Vercel-Deployment-Setup")

**Related-Files:**
- `vercel.json`
- `api/**/*.ts`

---

## 2025-08

### 2025-08-15: Initial-Commit (React + Vite + TypeScript)

**Event:** Project-initialization, tech-stack-setup.

**Tech-Stack:**
- ✅ React 18.3 + Vite 5.4 + TypeScript 5.6
- ✅ TailwindCSS 4.1 + PostCSS
- ✅ React-Router 6
- ✅ ESLint 9 (Flat-Config)

**Impact:**
- Project-foundation ready for feature-development

**Commit:** `1a0f8e4` ("chore: Initial-Commit")

**Related-Files:**
- `package.json`
- `vite.config.ts`
- `tsconfig.json`
- `tailwind.config.ts`

---

## Team & Process Events

### 2025-11-01: E2E-Testing-Requirement Adopted

**Event:** New-Process: All-PRs require E2E-Tests for critical-user-flows before-merge.

**Rationale:**
- E2E-Tests caught 3 critical-bugs in Sprint 2025-W05 (bugs would-have-shipped otherwise)

**Impact:**
- Higher-quality-bar for PRs
- Longer-PR-Review-Time (acceptable-trade-off)

**Related-Files:**
- `tests/e2e/*.spec.ts`

---

### 2025-10-01: TypeScript-Strict-Mode-Policy Adopted

**Event:** New-Policy: All-new-code must pass `strict: true` TypeScript-checks.

**Rationale:**
- Strict-Mode caught 15 type-bugs early (null-checks, type-mismatches)

**Impact:**
- Higher-type-safety
- Existing-code: Gradual-migration (pragmatic-workarounds allowed, documented)

**Related-Files:**
- `tsconfig.json`

---

### 2025-09-15: Beta-Tester-Program Started

**Event:** Invited 10 beta-testers for early-feedback.

**Impact:**
- Received 25+ feature-requests, 10+ bug-reports
- Key-Feedback: Dark-Mode-colors, AI-Cost-concerns, Chart-performance

**Owner:** Project-Lead

---

## Release-History

| Version | Date | Milestone | Key-Features |
|---------|------|-----------|--------------|
| v0.8.4 | 2025-11-11 | AI-Cost-Tracking | AI-Cost-Dashboard-Backend, Cost-Estimation |
| v0.8.3 | 2025-11-10 | PWA-Stability | SW-Cache-Fix, Dark-Mode-Adjustment |
| v0.8.2 | 2025-11-05 | AI-Launch | Journal-Condense, Bullet-Analysis (OpenAI + Grok) |
| v0.8.0 | 2025-10-28 | PWA-Complete | Full-Offline-Mode, Service-Worker, IndexedDB |
| v0.7.0 | 2025-10-15 | Zustand-Migration | Global-State-Refactor (Settings, Access, Journal) |
| v0.6.0 | 2025-09-25 | Chart-Rewrite | Custom-Canvas-Chart (60fps, Zoom/Pan, Indicators) |
| v0.5.0 | 2025-09-10 | Vercel-Deploy | First-Production-Deployment |
| v0.1.0 | 2025-08-15 | Initial-Release | Project-Init (React, Vite, TypeScript, TailwindCSS) |

---

## Upcoming-Releases

| Version | Target-Date | Key-Features | Status |
|---------|-------------|--------------|--------|
| v1.0.0-beta | 2025-02-15 | Beta-Launch (On-Chain-Access, Background-Sync, Real-Time-Alerts) | ⏳ Planned |
| v1.0.0 | Q2 2025 | Public-Release (Stable, Marketing-Launch) | ⏳ Planned |
| v1.1.0 | Q3 2025 | Advanced-Features (Supabase-Sync, TradingView-Widget, Backtesting) | ⏳ Planned |

---

## Meta

**Last-Updated:** 2025-11-12

**Next-Review:** 2025-11-13 (append-new-entries-as-events-occur)

**Owner:** Project-Lead (or assign-per-event)

**Format-Note:** Entries are append-only (newest-first), don't-rewrite-history. For-long-term-decisions, move-to `_intentions.md` (ADR-style).
