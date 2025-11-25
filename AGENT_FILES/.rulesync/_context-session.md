---
mode: ITERATIVE
id: "_context-session"
priority: 3
version: "0.1.0"
last_update: "2025-11-12"
targets: ["cursor", "claudecode", "codex"]
globs: ["**/*"]
description: "Current working session context, open questions, blockers and recent user feedback for Sparkfined PWA"
---

# Context – Session & Open Questions (ITERATIVE)

**Last Update:** 2025-11-12  
**Mode:** ITERATIVE (updated per working session)

---

## 1. Current Focus

**Active Work:**

**Status:**
- ✅ Frontend: AdvancedInsightCard + Store + Telemetry + Tests
- ✅ Backend: buildAdvancedInsight + /api/ai/analyze-market + Heuristik-TS-Hardening
- ✅ CI: typecheck, build, lint laufen green (Lint nur noch mit Warnungen)

**Next-Steps:**
- Optional: Lint-Warnings-Cleanup-Loop (unused vars, JSX-a11y anchor hints)
- Vorbereitung nächster Loop: z.B. Replay/Journal-Flow oder Wallet/Token-Lock-Verbindung

---

## 2. Recent User Requests

**From Beta Testers / Internal Feedback:**

- **Request:** "Chart zoom/pan feels sluggish on mobile Safari."
  - **Status:** 🟡 Investigating
  - **Next:** Profile chart rendering, test with Lightweight-Charts vs current custom solution.

- **Request:** "Journal AI condense sometimes loses bullet structure."
  - **Status:** 🟡 Investigating
  - **Next:** Review prompt design (`ai/prompts/journal-condense.md`), add examples for bullet preservation.

- **Request:** "Offline mode works great, but sync on reconnect is not obvious to users."
  - **Status:** 🔴 Planned
  - **Next:** Add sync status banner, implement Workbox Background Sync with UI feedback.

- **Request:** "Dark mode is great, but some users want light mode toggle."
  - **Status:** 🔴 Backlog
  - **Decision:** Dark-mode-first is core to UX; light-mode support planned for v1.1 (low priority).

**From E2E Tests / QA:**

- **Bug:** Access gating mock allows expired tokens.
  - **Status:** 🔴 Open
  - **Priority:** P2
  - **Next:** Add expiry check to `mockAccessValidation` in `lib/access/mock.ts`.

- **Bug:** Chart tooltip sometimes renders outside viewport on small screens.
  - **Status:** 🔴 Open
  - **Priority:** P2
  - **Next:** Add boundary-detection logic to tooltip component.

---

## 3. Open Questions

**Technical Decisions:**

- **Q:** Should we use Lightweight-Charts or TradingView widget for interactive charts?
  - **Context:** Lightweight-Charts is lighter (~50KB), TradingView has more features but heavier (~200KB+) and less customizable.
  - **Status:** 🟡 Active experiment (see `_experiments-active.md`)
  - **Decision Deadline:** Before Beta v0.9 (2025-01-15)

- **Q:** WebSocket vs Server-Sent Events (SSE) for real-time alerts?
  - **Context:** Vercel Edge Functions support both, but WebSocket requires more complex client/server logic. SSE is simpler but one-way.
  - **Status:** 🔴 Open
  - **Next:** Run spike to test Vercel Edge Function WebSocket support, compare latency/reliability.

- **Q:** Should we migrate to Supabase before or after Beta v1.0?
  - **Context:** Supabase enables multi-device sync but adds complexity. Current IndexedDB works well for single-device.
  - **Status:** 🔴 Open
  - **Decision:** Likely after v1.0 (Q2 2025) to avoid delaying beta.

**Design Decisions:**

- **Q:** How to handle accessibility for complex interactive charts?
  - **Context:** Canvas-based charts are hard to make fully accessible. Alternative: Provide data table view for screenreaders.
  - **Status:** 🟡 In Discussion
  - **Next:** Document approach in `07-accessibility.md` (already drafted, needs validation).

- **Q:** Should AI-powered features have a "cost preview" for users?
  - **Context:** OpenAI/Grok cost ≈ $0.001–$0.01 per request. Users might want transparency.
  - **Status:** 🔴 Open
  - **Next:** Add cost estimation to AI Orchestrator, show in UI (optional, privacy-friendly).

---

## 4. Blockers

**Current Blockers:**

- **None** (as of 2025-11-12)

**Recently Resolved:**

- ✅ **Rulesync structure unclear** → Resolved via detailed Q&A with user, all 11 SYSTEM + 6 ITERATIVE files now defined.
- ✅ **Codex vs Copilot target strategy** → Clarified: Codex gets high-level context (00, _planning, _context, _intentions, 09–11), not granular implementation rules (01–08).

**Potential Future Blockers:**

- **Vercel Edge Function WebSocket support** – If WebSocket proves unreliable, fallback to SSE or polling.
- **Solana RPC rate limits** – On-chain access gating will need careful rate-limiting and fallback logic.
- **Bundle size plateau** – If code-splitting and lazy-loading don't get us to <400KB, we may need to drop features or switch libraries.

---

## 5. Notes

- **Session Type:** Rulesync system generation (Q&A → SYSTEM files → ITERATIVE files → Validation).
- **Next Session:** Validation checklist, rulesync CLI run, AGENTS.md generation for Codex.
- **User Preferences:** German language for interaction, compact spec format, third-person meta-instructions.

---

**Metadata:**
- **File Type:** ITERATIVE (Session Context & Open Questions)
- **Update Frequency:** Per working session (daily or per major task)
- **Owners:** Engineering, Product
- **Related Files:** `_planning-current.md` (roadmap), `_intentions-decisions.md` (rationale), `_experiments-active.md` (spikes)
