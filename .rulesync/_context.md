---
mode: ITERATIVE
id: "_context"
version: "0.1.0"
last_review: "2025-11-12"
targets: ["cursor", "claudecode", "codex"]
description: "Current session context, open questions, blockers, and recent user requests for Sparkfined PWA"
---

# Session Context & Open Questions

> **Purpose:** Current working context for active sessions – what's being worked on *right now*, plus open questions and blockers.
>
> **Update-Frequency:** Per-Session (daily or when context shifts significantly).

---

## 1. Current Focus

### Active-Work (2025-11-12)

**Primary-Feature:** Multi-Tool-Prompt-System (Rulesync-Configuration)

- **Scope:** Generate `.rulesync/` configuration (11 SYSTEM-Files + 6 ITERATIVE-Files) for Cursor, Claude Code, Codex
- **Status:** Phase 3 Complete (SYSTEM-Files ✅ 11/11, ITERATIVE-Files 🔄 In-Progress)
- **Files-Touched:** `.rulesync/*.md`, `README.md` (planned)

**Secondary-Features:**

- **AI-Cost-Dashboard:** Backend logic for cost-tracking complete, UI-Component pending
  - **Files:** `ai/orchestrator.ts`, `src/components/AICostDashboard.tsx` (to be created)
- **PWA-Bundle-Size-Optimization:** Investigating Lucide-Icons tree-shaking issue
  - **Files:** `vite.config.ts`, `src/components/ui/*.tsx` (icon-imports)

---

### Recent Bug-Fixes (Last 7 Days)

1. **Service-Worker-Cache-Invalidation-Bug** (Fixed 2025-11-10)
   - **Issue:** Old SW-Cache not invalidated after Deployment → Users saw stale UI
   - **Fix:** Added `cleanupOutdatedCaches: true` in `vite.config.ts` PWA-Plugin
   - **Commit:** `a3f12b8` ("fix: Force SW-Cache-Cleanup on Update")

2. **TypeScript-Error in `useAccessStore`** (Fixed 2025-11-09)
   - **Issue:** `status` property possibly `null`, but code assumed non-null
   - **Fix:** Added null-check + optional-chaining (`status?.hasAccess`)
   - **Commit:** `d7e4c91` ("fix: Handle null-status in AccessStore")

3. **Chart-Performance-Lag on 1000+ Candles** (In-Progress)
   - **Issue:** Chart lags when zooming/panning with 1000+ OHLC-Candles
   - **Investigation:** Profiling shows Canvas-Rendering bottleneck (redraw-entire-canvas on every frame)
   - **Planned-Fix:** Implement Viewport-Culling (only render visible candles) + Debounce zoom/pan
   - **Status:** ⏳ Pending (scheduled for next sprint)

---

## 2. Recent User Requests

### From Beta-Testers (Last 2 Weeks)

1. **"Add Keyboard-Shortcuts for Journal-Navigation"** (Requested 2025-11-05)
   - **User:** Beta-Tester-3
   - **Details:** Arrow-Keys to navigate between Journal-Entries, `Cmd+N` for New-Entry
   - **Priority:** P2 (Nice-to-Have)
   - **Status:** ⏳ Backlog (planned for v1.1.0)

2. **"Dark-Mode too dark, hard to read small text"** (Requested 2025-11-07)
   - **User:** Beta-Tester-7
   - **Details:** Background `#0a0a0a` too dark, text-contrast not sufficient for long-reading
   - **Action:** Adjusted background to `#0f0f0f`, increased text-color from `#d4d4d4` to `#e5e5e5`
   - **Status:** ✅ Shipped in v0.8.3 (2025-11-08)

3. **"AI-Cost too high for Journal-Condense"** (Requested 2025-11-10)
   - **User:** Beta-Tester-12
   - **Details:** Journal-Condense costs $0.05 per entry (perceived as expensive)
   - **Action:** Reduced `maxTokens` from 1000 to 500 (output still sufficient), cost now ~$0.02
   - **Status:** ✅ Shipped in v0.8.4 (2025-11-11)

---

### From E2E-Tests / User-Testing

1. **Accessibility-Issue:** Focus-Trap not working in Modal (E2E-Test-Failure)
   - **Test:** `tests/e2e/modal.spec.ts` fails on `Tab` key-navigation
   - **Root-Cause:** `useFocusTrap` hook not applied to all Modals
   - **Status:** ✅ Fixed in v0.8.3 (2025-11-08)

2. **Performance-Issue:** Chart-First-Load takes 3-5s on Mobile
   - **Test:** Manual-Test on iPhone 12 (Safari)
   - **Root-Cause:** Chart-Component loads all OHLC-Data (10,000+ candles) before rendering
   - **Planned-Fix:** Lazy-Load candles (initial: 500, on-demand: load more on zoom-out)
   - **Status:** ⏳ Pending (scheduled for Q1 2025)

---

## 3. Open Questions

### Technical Decisions (Unresolved)

1. **Chart-Library-Choice: Lightweight-Charts vs. Custom-Canvas?**
   - **Context:** Current custom-canvas implementation flexible but maintenance-heavy. Lightweight-Charts is battle-tested, but less customizable.
   - **Alternatives:**
     - **Option A:** Stick with custom-canvas, optimize performance (Viewport-Culling, Offscreen-Canvas)
     - **Option B:** Migrate to Lightweight-Charts, accept less customization
     - **Option C:** Hybrid: Lightweight-Charts for basic charts, custom-canvas for advanced features
   - **Decision-Deadline:** Sprint 2025-W09 (after Tech-Spike)
   - **Owner:** TBD

2. **Real-Time-Data: WebSocket vs. Polling?**
   - **Context:** Real-Time-Alerts require live price-data. Moralis/Dexscreener offer WebSocket (complex, cost?) vs. Polling (simple, higher latency).
   - **Alternatives:**
     - **Option A:** WebSocket (lower latency, real-time, but complex reconnect-logic + cost-unknown)
     - **Option B:** Polling every 10s (simple, predictable cost, but 10s-latency)
     - **Option C:** Hybrid: WebSocket for active-session, Polling for background
   - **Decision-Deadline:** Sprint 2025-W09 (after WebSocket-Spike)
   - **Owner:** TBD

3. **Supabase-Migration: Worth the effort?**
   - **Context:** Current Dexie (IndexedDB) is offline-first, but no cross-device-sync. Supabase offers Realtime-Sync, but adds complexity + privacy-concerns.
   - **Alternatives:**
     - **Option A:** Keep Dexie, add manual-export/import for cross-device-sync (low-effort, no real-time)
     - **Option B:** Migrate to Supabase, enable real-time-sync (high-effort, privacy-concerns)
     - **Option C:** Hybrid: Dexie for offline, Supabase for optional-cloud-backup (best-of-both-worlds)
   - **Decision-Deadline:** Q2 2025 (after v1.0.0-beta-launch)
   - **Owner:** TBD

---

### Design Decisions (Unresolved)

1. **AI-Cost-Dashboard: Show to all users or only power-users?**
   - **Context:** Cost-Dashboard useful for transparency, but may confuse casual-users ("Why do I pay for AI?").
   - **Alternatives:**
     - **Option A:** Show to all users (transparency-first)
     - **Option B:** Show only to users who opt-in (Settings → Advanced → AI-Cost-Dashboard)
     - **Option C:** Show simplified version (Budget-Bar only), hide detailed cost-breakdown
   - **Decision-Deadline:** Sprint 2025-W07 (before UI-Implementation)
   - **Owner:** TBD

2. **Accessibility-Trade-Off for Charts: Full-A11y or Data-Table-Alternative?**
   - **Context:** Canvas-Charts inherently not A11y-friendly. Full-A11y requires ARIA-Live-Regions + complex keyboard-nav. Data-Table-Alternative simpler but less immersive.
   - **Decision:** Data-Table-Alternative chosen (see `07-accessibility.md`), but open for revision if user-feedback demands full-A11y.
   - **Status:** Decision made, monitor user-feedback

---

## 4. Blockers

### Active Blockers (High-Priority)

1. **On-Chain-Access-Gating: NFT-Contract-Design not finalized**
   - **Blocker:** Need to decide: Custom-NFT-Contract vs. existing-NFT (e.g. SMB Gen2)?
   - **Impact:** Blocks On-Chain-Access-Gating-Prototype (scheduled Sprint 2025-W09)
   - **Owner:** Project-Lead
   - **ETA:** 2025-11-15 (Decision-Meeting planned)

2. **Moralis-API-Rate-Limits unclear for Real-Time-Alerts**
   - **Blocker:** Moralis-Docs vague on WebSocket-Rate-Limits. Need clarification to estimate cost.
   - **Impact:** Blocks Real-Time-Alerts-WebSocket-Spike (scheduled Sprint 2025-W09)
   - **Action:** Email Moralis-Support for clarification
   - **ETA:** 2025-11-13 (Support-Response expected within 48h)

---

### Resolved Blockers (Archived)

1. **Vercel-Deployment-Failure on Service-Worker-Build** (Resolved 2025-11-06)
   - **Blocker:** Vercel-Build failed due to Workbox-Webpack-Plugin-Version-Conflict
   - **Resolution:** Updated to `vite-plugin-pwa@0.17.0` (Workbox 7.x compatible)

2. **TypeScript-Strict-Mode-Errors** (Resolved 2025-11-05)
   - **Blocker:** Enabling `strict: true` caused 150+ Type-Errors across codebase
   - **Resolution:** Fixed 120 errors, added `// @ts-expect-error` pragmatic-workarounds for 30 edge-cases

---

## 5. Session-Notes (Temporary, per working-session)

### Session: 2025-11-12 (Multi-Tool-Prompt-System)

**What I'm doing:**
- Generating `.rulesync/` configuration (SYSTEM + ITERATIVE files)
- Validating files against Meta-Checkliste
- Preparing for Phase 4 (Tool-Config-Generation)

**Discoveries:**
- SYSTEM-Files should target cursor+claudecode (granular rules)
- ITERATIVE-Files should target all tools (dynamic context)
- Codex-Target should receive high-level context only (00, _planning, _context, _intentions, 09-11)

**Next-Steps:**
- Complete ITERATIVE-Files generation
- Generate `AGENTS.md` with Codex-Specific-Instructions
- Phase 4: Validation + README + VERIFY-Checklist

---

### Session: 2025-11-10 (AI-Cost-Dashboard Backend)

**What I did:**
- Implemented `trackAICall()` in `ai/orchestrator.ts`
- Added Cost-Estimation-Logic (`estimateCost()`, `calculateActualCost()`)
- Created Zustand-Store for AI-Cost-Tracking (`src/store/aiCostStore.tsx`)

**Blockers:**
- UI-Component pending (need designer-input on layout)

**Next-Steps:**
- Create `AICostDashboard.tsx` component (Budget-Bar, Daily/Monthly-Aggregation-Chart)
- Add Settings-Toggle: "Show AI-Cost-Dashboard" (default: hidden)

---

## Meta

**Last-Updated:** 2025-11-12 (Session: Multi-Tool-Prompt-System)

**Next-Review:** 2025-11-13 (or when context shifts)

**Owner:** Session-Specific (update per active-session)
