---
mode: ITERATIVE
id: "_intentions"
version: "0.1.0"
last_review: "2025-11-12"
targets: ["cursor", "claudecode", "codex"]
description: "Design decisions, rationale, trade-offs, and architectural choices for Sparkfined PWA"
---

# Design Decisions & Rationale

> **Purpose:** Documents **why** certain decisions were made – architecture, UI/UX, tech stack, and performance trade-offs.
>
> **Update-Frequency:** When major decisions are made or revisited.
>
> **Format:** Mini-ADR style: Decision → Context → Alternatives → Rationale → Status.

---

## 1. Architecture Decisions

### ADR-001: Zustand for State-Management (instead of Redux/Jotai)

**Decision:** Use Zustand as primary state-management library.

**Context:**
- React-Context too verbose for complex state (deep-nesting, boilerplate)
- Redux too heavy for small-to-medium app (action-creators, reducers, middleware)
- Jotai considered but less mature ecosystem (fewer examples, smaller community)

**Alternatives:**
- **Redux-Toolkit:** Full-featured, but overkill for Sparkfined's scope (~10 stores, no complex async-flows)
- **Jotai:** Atomic-state-management, interesting but steeper learning-curve for team
- **Zustand:** Minimal-API, easy-to-learn, good-TypeScript-support, sufficient for Sparkfined

**Rationale:**
- Zustand offers simplest API (one `create()` call, no boilerplate)
- Good TypeScript-inference (stores are fully-typed by default)
- Middleware available (persist, devtools) without complexity
- Team-familiarity: Similar mental-model to React-Context + Hooks

**Status:** ✅ Adopted (v0.1.0), stable, no regrets.

**Related-Files:** `src/store/*.tsx`, `02-frontend-arch.md`

---

### ADR-002: Dexie (IndexedDB) for Offline-Persistence (instead of LocalStorage)

**Decision:** Use Dexie.js for offline-data-persistence (Journal, Watchlist, Alerts).

**Context:**
- LocalStorage: 5-10MB limit, synchronous-API (blocks main-thread), no query-capabilities
- IndexedDB: 50MB+ limit (browser-dependent), asynchronous, supports indexes/queries
- Remote-DB (Supabase): Real-time-sync, but requires internet + privacy-concerns

**Alternatives:**
- **LocalStorage:** Simple-API, but insufficient for >5MB data (Journal + OHLC-Cache)
- **Remote-DB (Supabase):** Real-time-sync across devices, but offline-first suffers + privacy-risk
- **Dexie (IndexedDB):** Best-of-both-worlds (large-storage, offline-first, query-capable)

**Rationale:**
- Journal + Watchlist + Alerts + OHLC-Cache can exceed 10MB (LocalStorage insufficient)
- Offline-First is core-value-proposition → IndexedDB mandatory
- Dexie wraps IndexedDB with Promise-based-API + schema-versioning (better DX than raw-IndexedDB)
- Future: Hybrid-Model possible (Dexie-local, Supabase-cloud-backup)

**Status:** ✅ Adopted (v0.1.0), stable, works well for offline-first-use-cases.

**Trade-Offs:**
- No cross-device-sync (user must export/import manually)
- Browser-Storage-Quota-Issues on iOS-Safari (rare, but possible)

**Related-Files:** `src/lib/persistence/*.ts`, `02-frontend-arch.md`, `03-pwa-conventions.md`

---

### ADR-003: Vercel for Hosting + Serverless-APIs (instead of Netlify/AWS)

**Decision:** Deploy to Vercel (Static-Site + Edge-Functions).

**Context:**
- Need serverless-APIs for Secret-Management (Moralis/OpenAI-API-Keys)
- Vite-SPA + Serverless-APIs → JAMstack-Architecture
- Vercel, Netlify, Cloudflare-Pages all support this pattern

**Alternatives:**
- **Netlify:** Similar to Vercel, but slower build-times (reported by community)
- **Cloudflare-Pages:** Fastest-edge, but Edge-Functions limited (no Node.js-runtime for OpenAI-SDK)
- **AWS-Amplify:** Full-featured, but complex-setup (Cognito, Lambda, API-Gateway)

**Rationale:**
- Vercel: Best Vite-integration (zero-config), fast-builds (~30s), generous-free-tier
- Edge-Functions: Node.js-runtime (OpenAI-SDK works out-of-box)
- Git-Integration: Auto-deploy on push (Main → Production, PRs → Preview)
- Team-familiarity: Simple-UX, no complex AWS-config

**Status:** ✅ Adopted (v0.1.0), stable, happy with performance.

**Trade-Offs:**
- Vendor-Lock-In (Vercel-specific config in `vercel.json`)
- Edge-Function-Limits (10s timeout for Edge, 30s for Serverless) → acceptable for AI-calls

**Related-Files:** `vercel.json`, `api/**/*.ts`, `10-deployment.md`

---

## 2. UI/UX Decisions

### ADR-004: Dark-Mode-First (instead of Light-Mode-Default)

**Decision:** Default to Dark-Mode, Light-Mode optional (but secondary).

**Context:**
- Trading-Apps traditionally dark (TradingView, Binance, Coinbase-Pro)
- Dark-Mode reduces eye-strain for long-sessions (especially at night)
- Sparkfined-Target-Audience: Active-Traders (often night-owls)

**Alternatives:**
- **Light-Mode-Default:** Standard for most web-apps, but less common for trading-tools
- **Auto-Detect-System-Preference:** Respects user's OS-setting, but Dark-Mode-First better for brand

**Rationale:**
- Trading-Charts more readable on dark-background (candles/volume pop visually)
- Sparkfined-Brand-Identity: Dark, sleek, professional
- User-Preference: 90% of beta-testers prefer dark-mode (survey, 2024-12)

**Status:** ✅ Adopted (v0.1.0), Light-Mode available but not promoted.

**Trade-Offs:**
- Light-Mode less polished (fewer design-iterations, not all components optimized)
- Accessibility-Concern: Some users prefer light-mode for dyslexia → ensure light-mode remains functional

**Related-Files:** `src/styles/themes.css`, `04-ui-ux-components.md`

---

### ADR-005: Information-Density over Minimalism

**Decision:** Prioritize information-density (dense charts, tables, metrics) over minimalist-UI.

**Context:**
- Minimalist-UI (whitespace, large-fonts) popular in consumer-apps (Stripe, Linear)
- Trading-Apps need high-information-density (TradingView, Bloomberg-Terminal)
- Sparkfined-Target-Audience: Power-Users who want "all data on-screen"

**Alternatives:**
- **Minimalist-UI:** Cleaner, easier-to-learn, but requires more clicks to access data
- **Dense-UI:** More-info-per-screen, but steeper-learning-curve

**Rationale:**
- Traders want to see: Chart + KPIs + Watchlist + Alerts + Journal — all at once
- Minimize-clicks philosophy: "Everything within 1-2 clicks, no deep-navigation"
- Sparkfined-USP: "Command-Center" (all-in-one-dashboard, not multiple-pages)

**Status:** ✅ Adopted (v0.1.0), positive-feedback from power-users.

**Trade-Offs:**
- Overwhelming for beginners (mitigation: onboarding-tooltips, guided-tour planned)
- Accessibility-Concern: Dense-UI harder for low-vision-users (mitigation: WCAG-AA-contrast, zoom-support)

**Related-Files:** `04-ui-ux-components.md`, `07-accessibility.md`

---

### ADR-006: Accessibility-Trade-Off for Charts (Data-Table-Alternative instead of Full-A11y)

**Decision:** Provide Data-Table-Alternative for charts instead of full-keyboard-nav on canvas.

**Context:**
- Canvas-Charts inherently not A11y-friendly (no DOM-elements, keyboard-nav complex)
- Full-A11y requires ARIA-Live-Regions + complex keyboard-nav (zoom/pan via keys)
- Data-Table-Alternative: Render OHLC-Data as `<table>` (screen-reader-accessible)

**Alternatives:**
- **Full-A11y-Canvas:** Implement keyboard-zoom, ARIA-Live-Regions (high-effort, edge-cases)
- **Data-Table-Alternative:** Simpler, but less immersive for screen-reader-users
- **No-A11y:** Unacceptable (excludes vision-impaired-traders)

**Rationale:**
- Full-A11y-Canvas high-effort, maintenance-heavy (custom-keyboard-nav, focus-management)
- Data-Table-Alternative covers 90% of A11y-needs (screen-readers can read OHLC-values)
- Open-to-Revision: If user-feedback demands full-A11y, re-evaluate in v1.1.0

**Status:** ✅ Adopted (v0.8.0), monitoring user-feedback.

**Trade-Offs:**
- Less immersive for screen-reader-users (table vs. interactive-chart)
- Mitigation: Add ARIA-Live-Summary ("Last Close: $100, RSI: 45 (Oversold)")

**Related-Files:** `07-accessibility.md`, `src/components/Chart.tsx`

---

## 3. Tech Stack Choices

### ADR-007: React 18 + Vite (instead of Next.js/Remix)

**Decision:** Use React 18 + Vite for Client-Side-Rendering (CSR), no SSR/SSG.

**Context:**
- Sparkfined is PWA-first (offline-first, installable)
- SSR/SSG benefits (SEO, initial-load-speed) less critical for PWA (not search-engine-focused)
- Next.js/Remix add complexity (server-runtime, edge-functions, file-based-routing)

**Alternatives:**
- **Next.js:** SSR/SSG, file-based-routing, but overkill for PWA (no SEO-need, offline-first conflicts with SSR)
- **Remix:** Modern, data-loading-patterns, but server-runtime required (Sparkfined aims for static-deploy)
- **Vite + React-Router:** Simpler, CSR-only, perfect for PWA

**Rationale:**
- PWA-offline-first → CSR better (no server-dependency)
- Vite: Fast-HMR, simple-build, zero-config
- React-Router: Flexible, no file-based-routing-constraints

**Status:** ✅ Adopted (v0.1.0), no regrets.

**Trade-Offs:**
- Slower initial-load vs. SSR (mitigation: Code-Splitting, Lazy-Loading)
- No SEO-optimization (acceptable: Sparkfined is PWA, not marketing-site)

**Related-Files:** `vite.config.ts`, `02-frontend-arch.md`, `03-pwa-conventions.md`

---

### ADR-008: OpenAI (gpt-4o-mini) + xAI (Grok) for AI-Integration

**Decision:** Dual-AI-Architecture: OpenAI for standard-tasks, Grok for crypto-reasoning.

**Context:**
- AI-Use-Cases: Journal-Condense, Bullet-Analysis, Market-Reasoning, Social-Heuristics
- OpenAI (gpt-4o-mini): Cost-efficient ($0.15/1M-tokens), fast, good-quality
- xAI (Grok): Crypto-specialized, but expensive ($5/1M-tokens)

**Alternatives:**
- **OpenAI-Only:** Simpler, but less crypto-domain-knowledge (generic-responses)
- **Claude (Anthropic):** High-quality, but expensive (~$3/1M-tokens) + no crypto-specialization
- **Gemini (Google):** Free-tier attractive, but quality inconsistent (beta)

**Rationale:**
- OpenAI (gpt-4o-mini): 90% of use-cases (Journal-Condense, Bullet-Analysis) → cost-efficient
- Grok: 10% of use-cases (Market-Reasoning, Meme-Analysis) → crypto-expertise worth cost
- Dual-Architecture: Route tasks based on value (high-value → Grok, standard → OpenAI)

**Status:** ✅ Adopted (v0.8.0), cost-management working well.

**Trade-Offs:**
- Complexity: Manage 2 API-Keys, 2 Clients, 2 Cost-Models
- Mitigation: AI-Orchestrator-Layer abstracts complexity (`ai/orchestrator.ts`)

**Related-Files:** `ai/orchestrator.ts`, `ai/model_clients/*.ts`, `11-ai-integration.md`

---

### ADR-009: Lucide-Icons (instead of Heroicons/FontAwesome)

**Decision:** Use Lucide-Icons for all UI-Icons.

**Context:**
- Need icon-library for UI (buttons, navigation, status-indicators)
- Popular-options: Heroicons, FontAwesome, Lucide, Material-Icons

**Alternatives:**
- **Heroicons:** Tailwind-Labs-official, but no tree-shaking (imports all-icons → large-bundle)
- **FontAwesome:** Comprehensive, but large-bundle + commercial-license-concerns
- **Lucide:** Fork of Feather-Icons, tree-shakable, good-TypeScript-support

**Rationale:**
- Lucide: Best tree-shaking (only imported-icons in bundle)
- TypeScript-Support: Full type-inference for icon-names
- MIT-License: No licensing-concerns

**Status:** ✅ Adopted (v0.1.0), but tree-shaking-issue found (see `_context.md` blockers).

**Trade-Offs:**
- Smaller-ecosystem vs. FontAwesome (fewer icons, but 90% covered)
- Tree-Shaking-Bug: Need to use named-imports (`import { IconName }`) instead of wildcard (`import * as Icons`)

**Related-Files:** `src/components/ui/*.tsx`, `vite.config.ts`

---

## 4. Performance Trade-Offs

### ADR-010: Client-Side-Rendering for Charts (no SSR)

**Decision:** Render charts client-side (CSR) instead of SSR.

**Context:**
- Charts require Canvas-API (browser-only, no Node.js-equivalent)
- SSR-Charts possible (generate image server-side, send to client), but complex + slow

**Alternatives:**
- **SSR-Charts:** Generate static-image server-side (slow, no interactivity)
- **CSR-Charts:** Render in-browser (fast, interactive, but no SEO)

**Rationale:**
- Sparkfined-Charts interactive (zoom, pan, crosshair) → SSR-static-images insufficient
- Offline-First: Charts must work offline → CSR mandatory (no server-dependency)
- SEO not critical (Sparkfined is PWA, not marketing-site)

**Status:** ✅ Adopted (v0.1.0), correct-choice for PWA-use-case.

**Trade-Offs:**
- Slower initial-load (chart-data fetched client-side)
- Mitigation: Precache OHLC-Data in Service-Worker (offline-first)

**Related-Files:** `src/components/Chart.tsx`, `03-pwa-conventions.md`

---

### ADR-011: Bundle-Size-Target <400KB (instead of "as small as possible")

**Decision:** Target bundle-size <400KB (gzipped), not <100KB.

**Context:**
- Current bundle: ~428KB (gzipped)
- Ultra-Small-Bundle (<100KB) possible, but requires aggressive-tree-shaking (removes features)
- Trading-Apps typically large-bundles (TradingView: ~2MB, Bloomberg-Terminal: n/a)

**Alternatives:**
- **Ultra-Small (<100KB):** Aggressive-tree-shaking, remove-dependencies (e.g. Chart-Library → CSS-only)
- **Medium (<400KB):** Balanced (all-features, reasonable-tree-shaking)
- **Large (>1MB):** No optimization (acceptable for desktop-app, not PWA)

**Rationale:**
- PWA-Target: Mobile-users on 4G/5G (400KB = ~1-2s load on 4G)
- Feature-vs-Size-Trade-Off: Sparkfined is feature-rich → 400KB reasonable
- Performance-Budget: Lighthouse-Score ≥ 90 (achievable with <400KB)

**Status:** ✅ Adopted (v0.1.0), currently 428KB (need 28KB reduction).

**Trade-Offs:**
- Not as fast as <100KB-apps (Linear, Stripe-Dashboard)
- Mitigation: Code-Splitting (lazy-load non-critical-routes), Icon-Tree-Shaking

**Related-Files:** `vite.config.ts`, `08-performance.md`, `scripts/check-bundle-size.mjs`

---

## 5. Decision-Backlog (To-Be-Decided)

### Open: Chart-Library-Choice (Lightweight-Charts vs. Custom-Canvas)

**Context:**
- Current: Custom-Canvas (flexible, but maintenance-heavy)
- Alternative: Lightweight-Charts (battle-tested, TradingView-library, less-customizable)

**Decision-Deadline:** Sprint 2025-W09 (after Tech-Spike)

**Related:** `_context.md` (Open-Questions), `_experiments.md` (Tech-Spike)

---

### Open: Supabase-Migration (worth the effort?)

**Context:**
- Current: Dexie (offline-first, no-cross-device-sync)
- Alternative: Supabase (real-time-sync, but privacy-concerns + complexity)

**Decision-Deadline:** Q2 2025 (after v1.0.0-beta-launch)

**Related:** `_context.md` (Open-Questions), `_planning.md` (Roadmap)

---

## Meta

**Last-Updated:** 2025-11-12

**Next-Review:** 2025-12-01 (quarterly-review of major-decisions)

**Owner:** Project-Lead (or Architecture-Lead if team grows)
