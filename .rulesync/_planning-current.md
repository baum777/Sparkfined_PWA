---
mode: ITERATIVE
id: "_planning-current"
priority: 3
version: "0.1.0"
last_update: "2025-11-12"
targets: ["cursor", "claudecode", "codex"]
globs: ["**/*"]
description: "Current sprint planning, feature roadmap, backlog and release milestones for Sparkfined PWA"
---

# Planning – Sprint & Roadmap (ITERATIVE)

**Last Update:** 2025-11-12  
**Mode:** ITERATIVE (updated per sprint/milestone)

---

## 1. Active Sprint / Milestone

**Current Milestone:** Beta Preparation (Q4 2024 / Q1 2025)

**Status:** 🟢 In Progress

**Active Tasks:**

| Task | Priority | Status | Owner |
|------|----------|--------|-------|
| Rulesync Multi-Tool Prompt System | `P0` | ✅ Done | AI/Docs |
| E2E Test Suite (Playwright) – Critical Flows | `P1` | 🟡 In Progress | Testing |
| Performance Optimization (Bundle <400KB) | `P1` | 🟡 In Progress | Frontend |
| AI Orchestrator Telemetry & Cost Tracking | `P2` | 🟡 In Progress | AI/Backend |
| Security Audit (Secrets, Rate-Limiting) | `P2` | 🔴 Planned | Security |

**Sprint Goal:**  
Stabilize core features (PWA, AI, Journal, Charts) for beta testers, ensure <400KB bundle, and pass accessibility/performance audits (Lighthouse ≥90).

---

## 2. Feature Roadmap (Next ~3 Months)

**Q1 2025 (Jan–Mar):**

- **On-Chain Access Gating (Solana NFT/Token)**
  - Priority: `P0`
  - Description: Replace mock access with real Solana RPC + wallet adapter (Phantom, Solflare).
  - Dependencies: Solana SDK, wallet-adapter-react, backend verification logic.
  - Status: 🔴 Planned

- **Background Sync (Workbox)**
  - Priority: `P1`
  - Description: Implement IndexedDB queue for offline actions (e.g., journal entries, alerts) and sync on reconnect.
  - Dependencies: Workbox Background Sync plugin, Dexie schema update.
  - Status: 🔴 Planned

- **Real-Time Alerts (WebSocket/Server-Sent Events)**
  - Priority: `P1`
  - Description: Replace polling-based alerts with WebSocket or SSE for price/volume alerts.
  - Dependencies: Vercel Edge Function with WebSocket support or SSE fallback.
  - Status: 🔴 Planned

- **Chart Library Evaluation (Lightweight-Charts vs TradingView)**
  - Priority: `P1`
  - Description: Spike to compare bundle size, performance, and customization for interactive charts.
  - Dependencies: None (spike phase).
  - Status: 🟡 In Progress (see `_experiments-active.md`)

**Q2 2025 (Apr–Jun):**

- **Supabase Migration (Backend Persistence)**
  - Priority: `P2`
  - Description: Migrate from client-side IndexedDB to Supabase for multi-device sync and server-side data persistence.
  - Dependencies: Supabase setup, schema design, migration scripts.
  - Status: 🔴 Planned

- **Advanced TA Indicators (Volume Profile, Market Profile, Heatmaps)**
  - Priority: `P2`
  - Description: Add advanced indicators for pro traders (beyond RSI/MACD/Bollinger).
  - Dependencies: Chart library decision (Lightweight-Charts or TradingView).
  - Status: 🔴 Planned

---

## 3. Backlog & Wishes

**Nice-to-Have (Not Currently Prioritized):**

- **Multi-Language Support (i18n)**
  - German/English UI for international users.
  - Dependency: react-i18next or similar.

- **Mobile App (React Native / Capacitor)**
  - Native iOS/Android apps using existing React codebase.
  - Dependency: Capacitor or React Native setup.

- **Social Features (Trade Sharing, Leaderboards)**
  - Share trade setups, follow other users, leaderboards for performance.
  - Dependency: Backend social graph, privacy model.

- **Voice Input for Journal (Web Speech API)**
  - Hands-free journaling via speech-to-text.
  - Dependency: Web Speech API, fallback for unsupported browsers.

**Known Tech Debt:**

- **ESLint `any` usage** – Pragmatic for speed, but should be reduced over time (especially in critical paths).
- **AI Orchestrator Queue** – Currently in-memory; should persist queue state to IndexedDB for crash recovery.
- **Rate-Limiting** – Client-side throttling only; add server-side rate-limiting middleware.
- **Error Boundaries** – Add more granular error boundaries (per section/page) instead of global fallback.
- **Bundle Size** – Main bundle still at ~428KB gzipped; target <400KB (requires code splitting, lazy loading, icon optimization).

---

## 4. Releases & Milestones

**Upcoming Releases:**

| Version | Target Date | Status | Key Features |
|---------|-------------|--------|--------------|
| **Beta v0.9** | 2025-01-15 | 🟡 In Progress | PWA Offline, AI Orchestrator, E2E Tests, <400KB Bundle |
| **Public v1.0** | 2025-03-01 | 🔴 Planned | On-Chain Access Gating, Real-Time Alerts, Background Sync |
| **v1.1** | 2025-06-01 | 🔴 Planned | Supabase Migration, Advanced TA Indicators |

**Beta v0.9 Acceptance Criteria:**

- ✅ PWA installable, offline-first for core features (Journal, Board, Watchlist).
- ✅ AI Orchestrator live (OpenAI + Grok), cost tracking, telemetry.
- 🟡 E2E test suite covers 10+ critical user flows (Playwright).
- 🟡 Lighthouse score ≥90 (Performance, Accessibility, Best Practices, SEO).
- 🟡 Bundle size <400KB gzipped (main bundle).
- 🔴 Security audit passed (no exposed secrets, rate-limiting active).
- 🔴 Accessibility audit passed (WCAG 2.1 AA, axe-core, manual keyboard/screenreader tests).

---

## 5. Notes

- **Rulesync System:** All 11 SYSTEM files + 6 ITERATIVE files now live. Multi-tool prompt system ready for Cursor, Claude Code, Codex.
- **Next Sprint:** Focus on E2E tests, bundle optimization, and security audit before Beta v0.9 release.
- **Blockers:** None currently; awaiting user feedback on Codex integration and testing strategy.

---

**Metadata:**
- **File Type:** ITERATIVE (Sprint Planning & Roadmap)
- **Update Frequency:** Per sprint (≈ every 2–4 weeks)
- **Owners:** Product, Engineering Lead
- **Related Files:** `_context-session.md` (current focus), `_log-timeline.md` (shipped milestones)
