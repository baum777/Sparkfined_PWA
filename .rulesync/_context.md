---
mode: ITERATIVE
id: "_context"
priority: 1
version: "0.1.0"
last_update: "2025-11-12"
targets: ["cursor", "claudecode", "codex"]
description: "Current working context, session focus, open questions, blockers and recent user requests for Sparkfined PWA"
---

# Context — Session Focus & Open Questions

> **Purpose:** Captures the **current working context** for ongoing sessions: what we're doing *right now*, plus open questions and blockers.
>
> **Update-Frequency:** Per working session (multiple times per day).
>
> **Behaviour:** The model updates this per session, keeps entries short, and moves resolved issues or historical notes to `_log.md` or SYSTEM docs if they become long-term knowledge.

---

## Current Focus

### Session: 2025-11-12 (Multi-Tool Prompt System Setup)

**Primary-Task:** Set up Rulesync-based multi-tool prompt system (Cursor, Claude Code, Codex)

**Current-Step:** Generate ITERATIVE-Files (`_planning`, `_context`, `_intentions`, `_experiments`, `_log`, `_agents`)

**Status:**
- ✅ Phase 1: Audit completed (no existing AI-configs found)
- ✅ Phase 2: Rulesync-structure designed (11 SYSTEM + 6 ITERATIVE files)
- ✅ Phase 3 SYSTEM-Files: 11/11 completed
- ⏳ Phase 3 ITERATIVE-Files: 0/6 completed (in progress)

**Next-Steps:**
1. Generate all 6 ITERATIVE-Files with initial content
2. Generate `AGENTS.md` with Codex-specific instructions
3. Phase 4: Validation & Tool-Config generation (README, VERIFY-Checklist)

---

### Recent-Feature-Work (Last 2 Weeks)

**Completed:**
- PWA-Offline-Mode-Audit (Service-Worker stable, 428KB precache)
- Documentation-Consolidation (`docs/` cleanup, `README.md` update)
- AI-Orchestrator-Cost-Tracking (log AI-calls with cost-metrics)

**In-Progress:**
- Multi-Tool-Prompt-System (this session)

**Blocked:**
- E2E-Test-Coverage-Expansion (waiting for Playwright-CI-setup)

---

### Specific Bug/Performance Issue (if any)

**None currently active.**

**Recently-Fixed:**
- Service-Worker update-loop on iOS Safari (fixed via `skipWaiting: true` in `vite.config.ts`)
- Chart-rendering-glitch on low-DPI screens (fixed via `devicePixelRatio` adjustment in `InteractiveChart.tsx`)

---

## Recent User Requests

### From Beta-Testers (Last 4 Weeks)

1. **"Add Dark/Light-Mode-Toggle"** (Priority: Low)
   - **User:** @beta-tester-01
   - **Rationale:** "I prefer Light-Mode during day-trading"
   - **Status:** Backlog (P2, not prioritised — Dark-Mode-First is design-principle)

2. **"Offline-Journal-Sync not working on iOS"** (Priority: High)
   - **User:** @beta-tester-03
   - **Issue:** Service-Worker not registering on iOS Safari
   - **Status:** Fixed (2025-11-05, `skipWaiting: true`)

3. **"AI-Condense sometimes returns empty result"** (Priority: Medium)
   - **User:** @beta-tester-07
   - **Issue:** OpenAI API timeout on long journal-entries (>5000 chars)
   - **Status:** Fixed (2025-11-08, added `maxTokens: 500` limit + retry-logic)

4. **"Add Push-Notifications for Alerts"** (Priority: High)
   - **User:** Multiple testers
   - **Rationale:** "I want to be notified when price-alert triggers, even when app is closed"
   - **Status:** Planned for Q1 2025 (P0, Real-Time-Alerts roadmap)

5. **"Chart not loading on mobile (slow 3G)"** (Priority: Medium)
   - **User:** @beta-tester-12
   - **Issue:** OHLC-API-timeout on slow networks
   - **Status:** Partially-Fixed (2025-11-10, added `timeout: 10s` to `fetchWithRetry`)

---

### Feedback from E2E-Tests

**Last-Run:** 2025-11-10

**Results:**
- ✅ 3/3 tests passed (Command-Board, Journal-Create, Chart-Load)
- ⚠️ Low-Coverage: Only 3 tests, target is 15-20 critical flows

**Known-Gaps:**
- No tests for: AI-Assist, Alerts, Replay-Lab, Settings, Access-Gating
- No mobile-viewport tests (all tests run on desktop-viewport)

**Action-Items:**
- Add E2E-tests for AI-Assist (`tests/e2e/ai.spec.ts`)
- Add mobile-viewport tests (`viewport: { width: 375, height: 667 }`)

---

## Open Questions

### Technical Decisions

**1. Chart-Library: Lightweight-Charts vs. TradingView?**
- **Context:** Lightweight-Charts ist aktuell stabil, offline-capable, kleiner Bundle
- **Issue:** TradingView hat mehr Features (mehr Indicators, bessere Drawing-Tools)
- **Trade-Off:** TradingView erfordert Internet-Connection (nicht Offline-First)
- **Decision-Deadline:** End of Q1 2025 (after Chart-Library-Spike in Sprint S2)
- **Status:** `open`

**2. Real-Time-Data: WebSocket vs. Polling?**
- **Context:** Aktuell Polling (alle 5s für OHLC-Data)
- **Issue:** WebSocket wäre effizienter (weniger API-Calls), aber komplexer (Connection-Management, Reconnect-Logic)
- **Trade-Off:** Polling ist simpler, aber höhere API-Costs bei vielen Users
- **Decision-Deadline:** When Real-Time-Alerts goes live (Q1 2025)
- **Status:** `open`

**3. Backend-DB: Supabase vs. Neon vs. Stay-Client-Only?**
- **Context:** Aktuell alles in Dexie (IndexedDB, Client-Only)
- **Pros-Supabase:** Cross-Device-Sync, Real-Time-Subscriptions, Auth-out-of-the-box
- **Cons-Supabase:** Additional-Dependency, Cost (~$25/month), Complexity
- **Decision-Deadline:** After On-Chain-Access-Gating (Q1 2025)
- **Status:** `open`

**4. AI-Provider: Add Claude (Anthropic) as third option?**
- **Context:** Aktuell OpenAI (gpt-4o-mini) + Grok (xAI)
- **Pros-Claude:** Best-in-Class for Code-Analysis, günstiger als Grok
- **Cons-Claude:** Additional-Provider-Integration, mehr Complexity
- **Decision-Deadline:** Q2 2025 (after AI-Cost-Optimisation)
- **Status:** `open`

---

### Design Decisions

**1. Should we support Light-Mode?**
- **Current:** Dark-Mode-First, Light-Mode nicht implementiert
- **User-Demand:** Low (nur 2 von 15 Beta-Testern)
- **Effort:** Medium (2-3 days, Tailwind-Theme-Variants)
- **Decision:** Backlog (P2, not prioritised)
- **Status:** `open`

**2. Mobile-First vs. Desktop-First?**
- **Current:** Responsive-Mobile-First (Tailwind `sm:`, `md:`, `lg:`)
- **Usage-Stats:** 60% Desktop, 40% Mobile (Beta-Testers)
- **Decision:** Keep Mobile-First (PWA-Installability wichtiger als Desktop-Optimisation)
- **Status:** `closed` (confirmed)

---

## Blockers

### Current Blockers

**1. Playwright-CI-Setup (GitHub-Actions)**
- **Issue:** E2E-Tests laufen nur lokal, nicht in CI
- **Impact:** Kann nicht automatisch testen bei PRs
- **Owner:** TBD
- **ETA:** Sprint S1 (2025-11-26)

**2. Solana-Devnet-NFT-Minting**
- **Issue:** Brauchen Test-NFTs für On-Chain-Access-Gating-Development
- **Impact:** Kann nicht On-Chain-Verification testen
- **Owner:** TBD
- **ETA:** Sprint S1 (2025-11-26)

### Recently-Resolved Blockers

**1. Moralis-API-Key-Expiration** (Resolved: 2025-11-05)
- **Issue:** API-Key expired, alle Moralis-Calls failed
- **Resolution:** Rotiert API-Key in Vercel-Environment-Variables

**2. TypeScript-Build-Error (Circular-Dependency)** (Resolved: 2025-11-08)
- **Issue:** Circular-Import zwischen `src/lib/fetch.ts` und `src/lib/retry.ts`
- **Resolution:** Extracted shared-types to `src/types/net.ts`

---

## Notes for AI Agents

**When to Update:**
- Start of new working session (update "Current Focus")
- When new open-questions arise (add to "Open Questions")
- When blockers are discovered or resolved (update "Blockers")
- When user-feedback comes in (add to "Recent User Requests")

**What to Move Out:**
- Resolved questions → `_intentions.md` (if decision is important)
- Resolved blockers → `_log.md` (if significant)
- Historical requests → `_log.md` (after 4 weeks)

**Session-Duration:**
- Typical: 2-4 hours
- Context should be updated at start/end of session
- If session spans multiple days, keep entries timestamped

---

## Revision History

- **2025-11-12:** Initial creation, Phase 3 ITERATIVE-Q&A (Multi-Tool-Prompt-System-Session)
