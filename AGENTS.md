# Codex Instructions — Sparkfined PWA

> **Auto-Generated from `.rulesync/`** (Phase 4 — Multi-Tool-Prompt-System)
>
> **Purpose:** High-level context for Codex (GitHub Copilot successor) — optimised for code-reviews, security-checks, and quick-fixes.
>
> **Last-Update:** 2025-11-12

---

## About This File

**Codex** receives **high-level context** (vision, current-focus, design-decisions, security, deployment, AI-architecture), but **NOT granular implementation-rules** (TypeScript-patterns, React-component-structure).

**Why?** Codex excels at:
- ✅ High-level code-reviews (scan repo for patterns, anti-patterns)
- ✅ Security-checks (scan for secret-leaks, unsafe-patterns)
- ✅ Quick-bug-fixes (simple fixes, no deep-context required)
- ✅ Onboarding-questions (explain repo-structure, get high-level-overview)

**Codex does NOT get:**
- ❌ 01-08 SYSTEM-Files (TypeScript, React, PWA, UI/UX, API, Testing, A11y, Performance)
- ❌ `_experiments.md`, `_log.md` (too detailed, not relevant for reviews)

**For daily-coding:** Use **Cursor** (full `.rulesync/` context) or **Claude Code** (full context + deep-reasoning).

---

## Project: Sparkfined PWA

### Vision

**Sparkfined** ist ein **offline-fähiges Trading Command Center** (PWA) für Crypto-Market-Research, Journaling, und Alerts. Primäres Ziel: Traders können auch ohne Internet arbeiten (Offline-First), AI-Powered-Insights nutzen, und ihre Trading-Performance systematisch verbessern.

### Core-Value-Propositions

1. **Offline-First:** Journal, Charts, Watchlist funktionieren ohne Internet
2. **AI-Powered:** Journal-Condense, Bullet-Analysis, Market-Reasoning (OpenAI + Grok)
3. **Self-Improvement:** Trading-Journal, KPI-Tracking, Lessons-Learned
4. **Crypto-Native:** Solana-Wallet-Based-Access-Gating, On-Chain-Metrics
5. **PWA-Deployment:** Installierbar auf iOS, Android, Desktop

### Target-Users

- **Crypto-Traders** (Main-Focus: Day-Trading, Swing-Trading, Meme-Coins)
- **Self-Improvement-Oriented** (want to learn from mistakes, track progress)
- **Tech-Savvy** (comfortable with Crypto-Wallets, understand on-chain-concepts)

---

## Tech-Stack

**Frontend:**
- React 18.3, TypeScript 5.6, Vite 5.4
- TailwindCSS 4.1 (Dark-Mode-First)
- Zustand (Global-State), Dexie (IndexedDB)

**Backend:**
- Vercel Edge Functions (Serverless, Node 18)
- Moralis, DexPaprika, Dexscreener (Market-Data)
- OpenAI (gpt-4o-mini) + xAI (Grok) for AI

**PWA:**
- `vite-plugin-pwa`, Workbox (Service-Worker)
- Precache ~428KB, Cache-First + Network-First strategies

**Testing:**
- Vitest (Unit), Playwright (E2E)
- Target: 80% coverage overall, 90% for critical-modules

---

## Architecture

### 5-Layer-Model

```
┌─────────────────────────────────────────────────────────┐
│ Layer 5: UI (Pages, Sections, Components)              │
├─────────────────────────────────────────────────────────┤
│ Layer 4: State & Hooks (Zustand, Context, Hooks)       │
├─────────────────────────────────────────────────────────┤
│ Layer 3: Persistence (Dexie/IndexedDB)                 │
├─────────────────────────────────────────────────────────┤
│ Layer 2: Backend (Vercel Edge Functions)               │
├─────────────────────────────────────────────────────────┤
│ Layer 1: External Services (Moralis, OpenAI, etc.)     │
└─────────────────────────────────────────────────────────┘
```

**Rule:** UI-Layer never imports from Backend-Layer directly (use Hooks/State-Layer).

### File-Structure

```
src/
  pages/          — Full-page components (Market.tsx, Journal.tsx)
  sections/       — Page-sections (ChartSection, SignalMatrix)
  components/
    ui/           — Primitives (Button, Input, Card)
  hooks/          — Custom hooks (useTokenData, useAccessGate)
  lib/            — Pure utilities (fetch, format, calculate)
  state/          — React-Context (settings, ai-provider)
  store/          — Zustand stores (accessStore)
  types/          — Type definitions

api/
  data/           — Market-data-proxies (OHLC, Token-Metadata)
  ai/             — AI-proxies (OpenAI, Grok)
  alerts/         — Alert-endpoints
  access/         — Access-gating-endpoints

ai/
  orchestrator.ts — AI-task-queue, cost-budget, provider-selection
  model_clients/  — OpenAI/Grok-wrappers
  prompts/        — System-prompts (Markdown)
```

---

## Current-Focus (from `_context.md`)

### Session: 2025-11-12

**Primary-Task:** Multi-Tool-Prompt-System setup (Phase 4: Tool-Configs)

**Status:**
- ✅ Phase 1: Audit completed
- ✅ Phase 2: Rulesync-structure designed (11 SYSTEM + 6 ITERATIVE)
- ✅ Phase 3: All files generated
- ⏳ Phase 4: Tool-configs in progress (this file)

**Next-Steps:**
1. Generate Cursor-Rules, CLAUDE.md, AGENTS.md
2. Generate README_RULESYNC.md, VERIFY_RULESYNC.md
3. Validation & sample-task-test

### Open-Questions

1. **Chart-Library:** Lightweight-Charts vs. TradingView? (Decision-Deadline: End Q1 2025)
2. **Real-Time-Data:** WebSocket vs. Polling? (Decision-Deadline: When Real-Time-Alerts goes live)
3. **Backend-DB:** Supabase vs. Stay-Client-Only? (Decision-Deadline: After On-Chain-Access-Gating)
4. **AI-Provider:** Add Claude (Anthropic) as third option? (Decision-Deadline: Q2 2025)

---

## Design-Decisions (from `_intentions.md`)

### Key-ADRs

**ADR-001: Zustand for Global State (instead of Redux)**
- **Decision:** Use Zustand for settings, access-status, ai-provider
- **Rationale:** Minimal-boilerplate, good TypeScript-support, small-bundle (~1KB)
- **Status:** ✅ Confirmed (2024-10)

**ADR-002: Dexie (IndexedDB) for Offline-Storage**
- **Decision:** Use Dexie for journal, watchlist, settings
- **Rationale:** Offline-First-Priority, structured-queries, 10x faster than LocalStorage
- **Status:** ✅ Confirmed (2024-09)

**ADR-003: Vercel for Hosting**
- **Decision:** Deploy on Vercel (Edge-Functions + Static-Hosting)
- **Rationale:** Best DX, fast Edge-Functions, good Git-integration
- **Status:** ✅ Confirmed (2024-08)

**ADR-005: Dark-Mode-First (no Light-Mode yet)**
- **Decision:** Design for Dark-Mode only (Light-Mode planned for Q2 2025)
- **Rationale:** Trading-apps are typically dark, reduces eye-strain, faster-development
- **Status:** ✅ Confirmed (2024-08)

**ADR-008: OpenAI + Grok (Dual-AI-Provider)**
- **Decision:** Use OpenAI for cheap-tasks, Grok for crypto-reasoning
- **Rationale:** OpenAI ~$0.15/1M tokens (cheap), Grok ~$5/1M tokens (crypto-native)
- **Status:** ✅ Confirmed (2024-10)

**See `.rulesync/_intentions.md` for all 11 ADRs.**

---

## Roadmap (from `_planning.md`)

### Active-Sprint: S0 — Foundation Cleanup (2025-11-12 → 2025-11-26)

**Tasks:**
- ✅ Multi-Tool-Prompt-System (SYSTEM + ITERATIVE files)
- ⏳ Bundle-Size-Optimisation (<400KB, currently 428KB)
- ⏳ E2E-Test-Coverage (target: 15-20 tests, currently 3)

### Q1 2025 Roadmap (High-Priority)

1. **On-Chain-Access-Gating** (P0)
   - Replace mock-wallet with real Solana-NFT-based access-control
   - Estimated-Effort: 2 sprints (4 weeks)

2. **Real-Time-Alerts** (P0)
   - Browser-push-notifications for price-alerts and signal-triggers
   - Estimated-Effort: 2 sprints (4 weeks)

3. **Background-Sync** (P0)
   - Queue offline-actions (journal-entries, alert-creation), sync when online
   - Estimated-Effort: 1 sprint (2 weeks)

---

## Security (from `09-security.md`)

### Secrets-Management

**[MUST]** Never expose secrets in client-bundle

```bash
# ✅ Good: Server-Side-Only (no VITE_ prefix)
MORALIS_API_KEY=sk-abc123...
OPENAI_API_KEY=sk-openai...

# ❌ Avoid: Client-Side-Expose (VITE_ prefix)
VITE_MORALIS_API_KEY=sk-abc123...  # In bundle!
```

**[MUST]** Use Serverless-Proxies for API-calls

```ts
// Client calls proxy (no secret in client)
const response = await fetch('/api/moralis/token/SOL');

// Proxy adds secret server-side (api/moralis/[...path].ts)
const apiKey = process.env.MORALIS_API_KEY;
const moralisResponse = await fetch(`https://moralis.io/...`, {
  headers: { 'X-API-Key': apiKey },
});
```

### Common-Security-Checks for Codex

**When reviewing code, check for:**

1. **Hardcoded-Secrets:**
   - Search for patterns: `API_KEY=`, `sk-`, `xai-`, `Bearer `
   - Check `.env.local`, `vercel.json`, `*.ts` files

2. **Client-Side-Secret-Exposure:**
   - Search for `VITE_` prefix in env-vars
   - Check if secrets are imported in `src/**/*.ts` (client-side)

3. **Unsafe-Fetch-Calls:**
   - Check if `fetch()` has timeout (should use `fetchWithRetry`)
   - Check if API-errors are handled (should use `Result<T,E>`)

4. **Missing-Input-Validation:**
   - Check if API-handlers validate inputs (type, length, format)
   - Check if user-inputs are sanitized (especially journal-content)

5. **CORS-Wildcards:**
   - Search for `Access-Control-Allow-Origin: *` (should be restrictive)

---

## Deployment (from `10-deployment.md`)

### Vercel-Configuration

```json
// vercel.json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "regions": ["fra1"]  // Frankfurt (EU)
}
```

### Pre-Deployment-Checklist

**[MUST] Run before every production-deploy:**

```bash
pnpm run typecheck   # TypeScript-check
pnpm run lint        # ESLint
pnpm test            # Vitest unit-tests
pnpm run build       # Build-test
pnpm run check:bundle-size  # Bundle-size-check
```

### Environment-Variables

**Setup in Vercel-Dashboard:**
- Production: `MORALIS_API_KEY`, `OPENAI_API_KEY`, `XAI_API_KEY`, `DATA_PROXY_SECRET`
- Preview (PR-Previews): Same keys or separate sandbox-keys
- Development: `.env.local` (not committed, see `.gitignore`)

### Rollback-Strategy

**Instant-Rollback (Vercel):**
1. Vercel-Dashboard → Deployments
2. Select last-stable-deployment
3. "Promote to Production" (~5-10 seconds)

### Health-Checks

**After deployment:**
```bash
curl https://sparkfined.app/api/health
curl https://sparkfined.app/sw.js
```

---

## AI-Integration (from `11-ai-integration.md`)

### Dual-Provider-Strategy

- **OpenAI (gpt-4o-mini):** Cheap (~$0.15/1M tokens), fast, for high-volume-tasks (journal-condense, bullet-analysis)
- **Grok (xAI):** Expensive (~$5/1M tokens), crypto-native, for high-value-tasks (market-reasoning, social-heuristics)

### Cost-Management

```ts
// ai/orchestrator.ts
const COST_LIMITS = {
  perRequest: 0.25,   // Max $0.25 per AI-call
  perUser: 10.0,      // Max $10 per user/day (planned)
  total: 100.0,       // Max $100 total/day
};

export async function executeTask(task: AITask): Promise<AIResult> {
  const estimatedCost = estimateCost(task);

  if (estimatedCost > COST_LIMITS.perRequest) {
    throw new Error(`Cost-limit exceeded: ${estimatedCost}`);
  }

  // Execute...
}
```

### Prompt-Design

**System + User-Message-Pattern:**
```ts
const systemPrompt = await loadSystemPrompt('journal-condense');
const userPrompt = journalEntry.content;

const result = await callAI({
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ],
  maxTokens: 500,  // Limit output to prevent cost-explosion
});
```

### Common-AI-Issues for Codex

**When reviewing AI-code, check for:**

1. **Cost-Explosion-Risk:**
   - Check if `maxTokens` is set (should be <1000 for most tasks)
   - Check if cost-estimation is called before `executeTask()`

2. **Missing-Retry-Logic:**
   - Check if AI-calls use `withRetry()` (transient-errors are common)

3. **Prompt-Injection:**
   - Check if user-inputs are validated before adding to prompt
   - Check if prompts have length-limits (max 5000 chars)

4. **No-Caching:**
   - Check if identical-requests are cached (1h TTL recommended)

---

## Usage-Tips for Codex

### High-Level-Questions (Good)

```
✅ "What is the architecture of Sparkfined PWA?"
✅ "Where are API-secrets stored?"
✅ "How does the AI-Orchestrator work?"
✅ "Scan repo for hardcoded-API-keys"
✅ "Check if any VITE_ env-vars expose secrets"
```

### Granular-Implementation-Questions (Avoid)

```
❌ "Refactor InteractiveChart.tsx to use Strategy-Pattern"
   → Too granular, Codex doesn't have 01-08 SYSTEM-Files
   → Use Cursor or Claude Code for this

❌ "Add TypeScript-types to src/lib/fetch.ts"
   → Codex doesn't have TypeScript-conventions
   → Use Cursor for this
```

### Security-Scans (Good)

```
✅ "Scan repo for hardcoded-API-keys"
✅ "Check if any fetch() calls are missing error-handling"
✅ "Find all instances of Access-Control-Allow-Origin: *"
✅ "Check if any API-handlers are missing input-validation"
```

### Quick-Fixes (Good)

```
✅ "Fix typo in README.md line 42"
✅ "Add missing import in api/health.ts"
✅ "Update package.json version to 0.9.0"
```

---

## What Codex Does NOT Have

**Codex receives ONLY high-level context:**
- ✅ 00-project-core.md (Vision, domain-map, tech-stack)
- ✅ _planning.md (Sprint, roadmap, backlog)
- ✅ _context.md (Session-focus, open-questions)
- ✅ _intentions.md (Design-decisions, ADRs)
- ✅ _agents.md (Multi-tool-routing-map)
- ✅ 09-security.md (Security-principles)
- ✅ 10-deployment.md (Deployment-process)
- ✅ 11-ai-integration.md (AI-architecture)

**Codex does NOT have:**
- ❌ 01-typescript.md (TypeScript-conventions, patterns)
- ❌ 02-frontend-arch.md (React-architecture, routing)
- ❌ 03-pwa-conventions.md (Service-Worker, offline-mode)
- ❌ 04-ui-ux-components.md (Component-taxonomy, Tailwind-patterns)
- ❌ 05-api-integration.md (fetchWithRetry, Result<T,E>)
- ❌ 06-testing-strategy.md (Vitest, Playwright, coverage)
- ❌ 07-accessibility.md (WCAG, semantic-HTML)
- ❌ 08-performance.md (Bundle-size, Core-Web-Vitals)
- ❌ _experiments.md (Tech-spikes, A/B-tests)
- ❌ _log.md (Timeline, significant-commits)

**Why?** Codex excels at high-level-reviews, not granular-implementation. For daily-coding, use Cursor or Claude Code.

---

## Related-Files

**Full-Context:** `/workspace/.rulesync/` (11 SYSTEM + 6 ITERATIVE files)

**Codex-Relevant:**
- `.rulesync/00-project-core.md`
- `.rulesync/_planning.md`
- `.rulesync/_context.md`
- `.rulesync/_intentions.md`
- `.rulesync/_agents.md`
- `.rulesync/09-security.md`
- `.rulesync/10-deployment.md`
- `.rulesync/11-ai-integration.md`

**For-Cursor/Claude-Code:** `.cursor/rules/`, `CLAUDE.md`

---

## Revision-History

- **2025-11-12:** Initial creation, Phase 4 (Auto-generated from `.rulesync/`, optimised for Codex — high-level-context only)
