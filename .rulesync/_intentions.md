---
mode: ITERATIVE
id: "_intentions"
priority: 2
version: "0.1.0"
last_update: "2025-11-12"
targets: ["cursor", "claudecode", "codex"]
description: "Design decisions, rationale, trade-offs and architecture choices for Sparkfined PWA (Mini-ADR style)"
---

# Intentions — Design Decisions & Rationale

> **Purpose:** Documents **why** certain decisions were made: architecture choices, UX philosophy, tech stack and performance trade-offs.
>
> **Update-Frequency:** When important decisions are made (weekly to monthly).
>
> **Behaviour:** The model records decisions in a simple "mini ADR" style: **Decision – Context – Alternatives – Rationale – Status**, so later agents can see *why*, not just *what*.

---

## Architecture Decisions

### ADR-001: Zustand for Global State (instead of Redux/Jotai)

**Decision:** Use Zustand as primary global-state-management library.

**Context (2024-10):**
- Needed lightweight state-manager for settings, access-status, AI-provider
- Redux too complex (boilerplate, actions, reducers)
- Jotai interesting, but less mature ecosystem

**Alternatives:**
1. **Redux Toolkit** — Too much boilerplate for small app
2. **Jotai** — Atomic-state is elegant, but unfamiliar to team
3. **React Context only** — Too many re-renders for deeply-nested components
4. **Zustand** — Minimal-API, good TypeScript-support, flexible

**Rationale:**
- Zustand has minimal boilerplate (create-store, use-hook, done)
- Good TypeScript-support (typed selectors)
- Flexible: Can combine with React-Context for local-state
- Small bundle (~1KB gzipped)
- Well-maintained, good community

**Trade-Offs:**
- Less "opinionated" than Redux (can lead to inconsistent-patterns if not careful)
- No built-in DevTools (but Zustand-DevTools-middleware available)

**Status:** ✅ Confirmed (2024-10), in production since Beta v0.5.0

---

### ADR-002: Dexie (IndexedDB) for Offline-Storage (instead of LocalStorage/Remote-DB)

**Decision:** Use Dexie as primary client-side persistence layer (IndexedDB-wrapper).

**Context (2024-09):**
- PWA requires offline-capable storage for journal, watchlist, settings
- LocalStorage too limited (5-10MB, no structured-queries, no indexes)
- Remote-DB (Supabase) would require internet-connection (not Offline-First)

**Alternatives:**
1. **LocalStorage** — Too limited (5-10MB, no queries)
2. **Raw IndexedDB** — Too low-level, complex API
3. **PouchDB** — Heavier (~50KB), CouchDB-sync not needed
4. **Dexie** — Lightweight (~10KB), good TypeScript-support, Promise-based

**Rationale:**
- Dexie provides simple Promise-based API over IndexedDB
- Good TypeScript-support (typed tables)
- Supports indexes, queries, transactions
- Offline-First: Data always available, even without internet
- Future: Can add Supabase-sync on top of Dexie (Dexie-Cloud or custom-sync)

**Trade-Offs:**
- No built-in cross-device-sync (need to add Supabase later if required)
- IndexedDB can be cleared by browser (but rare, warn users)
- Async-API requires Promise-handling everywhere

**Status:** ✅ Confirmed (2024-09), in production since Beta v0.3.0

**Future:** May add Supabase-sync for alerts/watchlist (Q1 2025), but keep journal in Dexie (Offline-First-Priority)

---

### ADR-003: Vercel for Hosting (instead of Netlify/AWS)

**Decision:** Deploy Sparkfined PWA on Vercel (Edge-Functions + Static-Hosting).

**Context (2024-08):**
- Needed serverless-platform for API-proxies (Moralis, DexPaprika, OpenAI)
- Needed fast global-CDN for static-assets
- Team familiar with Vercel from other projects

**Alternatives:**
1. **Netlify** — Similar to Vercel, but slower Edge-Functions
2. **AWS (S3 + Lambda + CloudFront)** — More flexible, but complex-setup
3. **Cloudflare-Pages** — Fast Edge-Network, but less mature ecosystem
4. **Vercel** — Best DX, fast Edge-Functions, good Git-integration

**Rationale:**
- Vercel has best DX (zero-config, auto-preview-deployments)
- Fast Edge-Functions (Node 18, <50ms cold-start in fra1-region)
- Generous free-tier (100GB bandwidth, 100K function-invocations)
- Good Git-integration (auto-deploy on push, preview-per-PR)
- Built-in Analytics, Logs, Environment-Variables-UI

**Trade-Offs:**
- Vendor-Lock-In (harder to migrate to AWS/GCP later)
- Pricing scales fast after free-tier (but acceptable for MVP)

**Status:** ✅ Confirmed (2024-08), in production since Beta v0.1.0

---

### ADR-004: React + Vite (instead of Next.js/Remix)

**Decision:** Use React 18 + Vite for frontend (SPA, not SSR-framework).

**Context (2024-08):**
- Needed fast build-tool for PWA-development
- SSR not required (PWA is client-first, offline-capable)
- Vite has best DX for React-SPAs (fast HMR, simple-config)

**Alternatives:**
1. **Next.js** — Overkill for SPA, SSR not needed, more complex-config
2. **Remix** — Good, but less mature ecosystem, more opinionated
3. **Create-React-App** — Deprecated, slow builds, complex-eject
4. **Vite** — Fast builds, simple-config, great PWA-plugin

**Rationale:**
- Vite has fastest HMR (<50ms) for React-development
- Simple-config (`vite.config.ts` ~100 lines vs. Next.js ~200+ lines)
- Excellent PWA-plugin (`vite-plugin-pwa` with Workbox)
- No SSR overhead (not needed for trading-app, offline-first)
- Great TypeScript-support out-of-the-box

**Trade-Offs:**
- No SSR (but not needed for our use-case)
- No file-based-routing (but React-Router v6 is fine)
- Smaller ecosystem than Next.js (but growing fast)

**Status:** ✅ Confirmed (2024-08), in production since Beta v0.1.0

---

## UI/UX Decisions

### ADR-005: Dark-Mode-First (instead of Light-Mode-Default)

**Decision:** Design UI with Dark-Mode as primary/default theme, Light-Mode not implemented (yet).

**Context (2024-08):**
- Trading-apps are typically used in dark-environments (late-night trading)
- Dark-Mode reduces eye-strain for long sessions
- Most crypto-traders prefer Dark-Mode (subjective, but common)

**Alternatives:**
1. **Light-Mode-Default** — Standard for most apps, but not for trading
2. **Dark/Light-Toggle** — More flexible, but more effort (2x design, testing)
3. **Dark-Mode-First** — Focus on primary-use-case, add Light-Mode later

**Rationale:**
- Trading-apps (TradingView, Binance, Coinbase) are all Dark-Mode-First
- User-Feedback: 13 of 15 Beta-Testers prefer Dark-Mode
- Faster-Development: No need to design/test Light-Mode variants
- Better-Contrast for charts (white-candles on dark-background)

**Trade-Offs:**
- No Light-Mode (some users prefer it during day-trading)
- Harder to add later (need to audit all components for Light-Mode-support)

**Status:** ✅ Confirmed (2024-08), in production since Beta v0.1.0

**Future:** May add Light-Mode-Toggle in Q2 2025 (if user-demand increases)

---

### ADR-006: Information-Density (instead of Minimalist-UI)

**Decision:** Design UI with high information-density (dense-charts, compact-tables, multi-column-layouts).

**Context (2024-08):**
- Traders need to see many data-points at once (price, volume, indicators, signals)
- Minimalist-UI (whitespace, single-column) wastes screen-space

**Alternatives:**
1. **Minimalist-UI** — Trendy, but not suitable for trading-apps
2. **Medium-Density** — Balance between readability and data-density
3. **High-Density** — Maximise data-per-screen, like TradingView

**Rationale:**
- Trading-apps require high information-density (TradingView, Bloomberg-Terminal)
- Users have large screens (Desktop: 1920x1080+, Mobile: 390x844+)
- Compact-Tables/Charts allow side-by-side-comparisons
- Reduces scrolling (all KPIs visible in one screen)

**Trade-Offs:**
- Can feel "cramped" for non-traders (but not target-audience)
- Harder to design for small-screens (but PWA is mobile-optimised)
- Requires careful typography/spacing (avoid clutter)

**Status:** ✅ Confirmed (2024-08), in production since Beta v0.1.0

---

### ADR-007: Accessibility-Trade-Offs (Chart-A11y via Data-Table-Alternative)

**Decision:** Provide data-table-alternative for charts (instead of full-a11y in chart-canvas).

**Context (2024-09):**
- Charts (Lightweight-Charts) are Canvas-based (not DOM-based)
- Canvas-a11y is complex (ARIA-live-regions, keyboard-navigation, focus-management)
- WCAG 2.1 AA requires non-visual-alternative for charts

**Alternatives:**
1. **Full-Canvas-A11y** — Complex, requires custom-keyboard-navigation for every chart
2. **SVG-Charts** — DOM-based, easier a11y, but heavier bundle and slower rendering
3. **Data-Table-Alternative** — Simple, compliant, less effort

**Rationale:**
- Canvas-a11y is very complex (dozens of ARIA-attributes per chart)
- SVG-Charts are slower for real-time-data (many DOM-nodes)
- Data-Table-Alternative is WCAG-compliant (non-visual-access to chart-data)
- Screen-Reader-Users can read OHLC-data in table-format

**Trade-Offs:**
- Screen-Reader-Users don't get "chart-experience" (but get same data)
- Data-Table-Alternative needs to be kept in sync with chart

**Status:** ✅ Confirmed (2024-09), in production since Beta v0.4.0

---

## Tech Stack Choices

### ADR-008: OpenAI (gpt-4o-mini) + Grok (xAI) for AI-Orchestration

**Decision:** Use dual-AI-provider-strategy: OpenAI for cost-efficient tasks, Grok for high-value crypto-reasoning.

**Context (2024-10):**
- Needed AI for journal-condense, bullet-analysis, market-reasoning
- OpenAI (gpt-4o-mini) is cheap (~$0.15/1M tokens) but general-purpose
- Grok (xAI) is expensive (~$5/1M tokens) but better at crypto-context

**Alternatives:**
1. **OpenAI-only** — Cheapest, but less crypto-native
2. **Claude-only** — Best-in-class for code, but expensive for chat
3. **Grok-only** — Best crypto-context, but too expensive for all tasks
4. **OpenAI + Grok** — Best-of-both: cheap for simple, expensive for complex

**Rationale:**
- OpenAI (gpt-4o-mini) is 30x cheaper than Grok (good for high-volume tasks)
- Grok is better at crypto-specific reasoning (meme-coins, on-chain-heuristics)
- Dual-provider-strategy allows cost-optimisation (route cheap-tasks to OpenAI)

**Trade-Offs:**
- More complexity (2 API-integrations, 2 prompt-formats)
- Need to maintain provider-selection-logic in orchestrator
- Cost-tracking more complex (2 providers with different pricing)

**Status:** ✅ Confirmed (2024-10), in production since Beta v0.6.0

**Cost-Stats (Nov 2024):**
- OpenAI: ~80% of AI-calls, ~$15/month
- Grok: ~20% of AI-calls, ~$35/month
- Total: ~$50/month (acceptable for MVP, target: <$25/month after optimisation)

**Future:** May add Claude (Anthropic) as third option for code-analysis (Q2 2025)

---

### ADR-009: Lightweight-Charts for Charting (instead of TradingView)

**Decision:** Use Lightweight-Charts (by TradingView) for interactive-charts.

**Context (2024-08):**
- Needed chart-library for OHLC-candlestick-charts with indicators
- TradingView-Widget is feature-rich, but requires internet-connection
- Lightweight-Charts is open-source, offline-capable, smaller-bundle

**Alternatives:**
1. **TradingView-Widget** — Best features, but requires internet, not offline
2. **Recharts** — React-native, but heavy bundle (~100KB), slower for real-time
3. **Chart.js** — Good for simple-charts, but not for OHLC/trading
4. **Lightweight-Charts** — Optimised for trading, offline-capable, small-bundle

**Rationale:**
- Lightweight-Charts is by TradingView (trusted, well-maintained)
- Offline-capable (no external-dependencies)
- Small-bundle (~50KB gzipped)
- Good performance for real-time-data (Canvas-based, 60fps)
- Supports OHLC-candlesticks, volume, indicators (RSI, EMA, Bollinger)

**Trade-Offs:**
- Fewer features than TradingView-Widget (no drawing-tools, no alerts-UI)
- Canvas-based (harder a11y, but mitigated via data-table-alternative)

**Status:** ✅ Confirmed (2024-08), in production since Beta v0.1.0

**Future:** Re-evaluate in Q1 2025 (Chart-Library-Spike planned in Sprint S2)

---

## Performance Trade-Offs

### ADR-010: Client-Side-Rendering for Charts (no SSR)

**Decision:** Render charts client-side (CSR) with React, no Server-Side-Rendering (SSR).

**Context (2024-08):**
- Charts require real-time-data (OHLC updates every 5s)
- SSR not beneficial for dynamic-content (would need to re-render client-side anyway)
- Offline-First-PWA requires client-side-data-fetching

**Alternatives:**
1. **SSR (Next.js)** — Better initial-load, but not needed for charts
2. **CSR (React-SPA)** — Simpler, offline-capable, no SSR-overhead
3. **Hybrid (SSR + CSR)** — Complex, not needed for trading-app

**Rationale:**
- Charts are always dynamic (real-time-data), SSR provides no benefit
- Offline-First-PWA requires client-side-rendering anyway
- CSR is simpler (no SSR-hydration-bugs, no server-dependencies)
- Faster-Development (no need to handle SSR-edge-cases)

**Trade-Offs:**
- Slower initial-load (need to fetch chart-data after page-load)
- No SEO-benefit (but not needed for trading-app, no public-content)

**Status:** ✅ Confirmed (2024-08), in production since Beta v0.1.0

---

### ADR-011: Bundle-Size-Target <400KB (instead of <300KB)

**Decision:** Target bundle-size of <400KB gzipped (relaxed from initial <300KB goal).

**Context (2024-11):**
- Current bundle: 428KB gzipped (66 precache-entries)
- Initial-goal: <300KB (very aggressive for React + Chart-Library)
- After Icon-Tree-Shaking + Code-Splitting: Realistic-target is 380-400KB

**Alternatives:**
1. **<300KB** — Very aggressive, would require removing features
2. **<400KB** — Realistic, achievable with optimisations
3. **<500KB** — Too relaxed, slow on 3G-networks

**Rationale:**
- Lightweight-Charts alone is ~50KB (cannot be reduced)
- React + React-Router + Zustand + Dexie: ~150KB (core-dependencies)
- Remaining ~200KB for app-code (components, pages, sections)
- Icon-Tree-Shaking can save ~20KB (Lucide-Icons)
- Code-Splitting can save ~30KB (lazy-load pages)
- Target <400KB is realistic without removing features

**Trade-Offs:**
- Slower initial-load on 3G (~2-3s vs. <1s for <300KB)
- Higher precache-size (slower Service-Worker-install)

**Status:** ✅ Confirmed (2024-11), target adjusted to <400KB

**Action-Items:**
- Icon-Tree-Shaking (save ~20KB)
- Code-Splitting for pages (save ~30KB)
- Remove unused Tailwind-classes (save ~10KB)
- Target: 380KB by end of Q1 2025

---

## Notes for AI Agents

**When to Add New ADRs:**
- Important architectural decisions (state-management, database, hosting)
- Significant UX-decisions (Dark-Mode-First, Information-Density)
- Tech-Stack-choices (React vs. Next, Vite vs. Webpack)
- Performance-Trade-Offs (SSR vs. CSR, Bundle-Size-Targets)

**ADR-Format (Mini-ADR):**
```markdown
### ADR-XXX: Title (instead of Alternative)

**Decision:** One-sentence summary.

**Context (Date):** Why was this decision needed?

**Alternatives:**
1. Option A — Pros/Cons
2. Option B — Pros/Cons
3. **Chosen Option** — Pros/Cons

**Rationale:** Why was this option chosen?

**Trade-Offs:** What are we giving up?

**Status:** ✅ Confirmed / ⏳ In-Review / ❌ Rejected

**Future:** (Optional) What might change later?
```

**What Not to Document:**
- Small implementation-details (use code-comments)
- Temporary-experiments (use `_experiments.md`)
- Bug-fixes (use `_log.md`)

---

## Revision History

- **2025-11-12:** Initial creation, Phase 3 ITERATIVE-Q&A (11 ADRs documented)
