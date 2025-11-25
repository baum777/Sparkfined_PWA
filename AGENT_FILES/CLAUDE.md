# Claude Code — Sparkfined PWA Rules

> **Auto-Generated from `.rulesync/`** (Phase 4 — Multi-Tool-Prompt-System)
>
> **Purpose:** Unified prompt-system for Claude Code (Anthropic), optimised for complex-refactoring, architecture-planning, and documentation-writing.
>
> **Last-Update:** 2025-11-12

---

## Quick-Reference

**Project:** Sparkfined PWA — Offline-first Trading Command Center (React + TypeScript + Vite + PWA)

**Tech-Stack:** React 18.3, TS 5.6, Vite 5.4, TailwindCSS 4.1, Zustand, Dexie, Vercel, OpenAI + Grok

**Architecture:** 5-Layer Model (UI → State → Persistence → Backend → External Services)

**Use-Claude-For:**
- ✅ Large-scale-refactoring (10+ files)
- ✅ Architecture-planning (design new feature, plan migrations)
- ✅ Documentation-writing (READMEs, ADRs, API-docs)
- ✅ Deep-debugging (complex bugs requiring multi-file-analysis)
- ✅ Code-reviews (review PRs, suggest improvements)

**Prefer-Cursor-For:**
- Daily-coding (new components, bug-fixes)
- Quick-refactors (rename-variable, extract-function)
- Testing (write Vitest/Playwright tests)

---

## System Index

Full `.rulesync/` structure (11 SYSTEM + 6 ITERATIVE files):

### SYSTEM-Files (Stable, Canonical Rules)

| ID | File | Priority | Topics |
|----|------|----------|--------|
| 00 | `project-core.md` | 1 | Vision, domain-map, tech-stack, system-index |
| 01 | `typescript.md` | 1 | TypeScript strict-mode, patterns, conventions |
| 02 | `frontend-arch.md` | 1 | React architecture, routing, state-management |
| 03 | `pwa-conventions.md` | 2 | Service-Worker, offline-mode, caching |
| 04 | `ui-ux-components.md` | 2 | Component-taxonomy, design-principles, Tailwind |
| 05 | `api-integration.md` | 2 | Serverless-APIs, fetchWithRetry, Result<T,E> |
| 06 | `testing-strategy.md` | 3 | Test-pyramid, Vitest, Playwright, coverage |
| 07 | `accessibility.md` | 3 | WCAG 2.1 AA, semantic-HTML, keyboard-nav |
| 08 | `performance.md` | 3 | Bundle-size, Core-Web-Vitals, optimisations |
| 09 | `security.md` | 2 | Secrets-management, input-validation, HTTPS |
| 10 | `deployment.md` | 2 | Vercel-config, CI/CD, rollback, health-checks |
| 11 | `ai-integration.md` | 2 | Dual-AI-provider, prompt-design, cost-management |

### ITERATIVE-Files (Dynamic, Updated Frequently)

| File | Purpose |
|------|---------|
| `_planning.md` | Current sprint, roadmap, backlog, releases |
| `_context.md` | Session-focus, open-questions, blockers |
| `_intentions.md` | Design-decisions, ADRs (11 documented) |
| `_experiments.md` | Tech-spikes, A/B-tests, prototypes (10 documented) |
| `_log.md` | Timeline, significant-commits, releases (30+ entries) |
| `_agents.md` | Multi-tool-routing-map (Cursor, Claude Code, Codex) |

---

## Core-Concepts (from 00-project-core.md)

### Vision

Sparkfined ist ein **offline-fähiges Trading Command Center** (PWA) für Crypto-Market-Research, Journaling, und Alerts. Primäres Ziel: Traders können auch ohne Internet arbeiten (Offline-First), AI-Powered-Insights nutzen, und ihre Trading-Performance systematisch verbessern.

### 7-Domain-Map

1. **Market-Data:** OHLC-Charts, Token-Prices, Volume, On-Chain-Metrics
2. **Technical-Analysis (TA):** RSI, EMA/SMA, MACD, Bollinger, Fibonacci
3. **Meme-Trading:** Wallet-Tracking, Social-Sentiment, GT-Score
4. **Journaling:** Trade-Logs, Tags, AI-Condense
5. **Alerts & Signals:** Price-Alerts, Confluence-Rules
6. **Access-Gating:** Solana-Wallet-Based (NFT-Check, mocked in Beta)
7. **AI-Orchestration:** OpenAI + Grok, Cost-Management, Prompt-Design

### Tech-Stack-Principles

- **Offline-First:** PWA (Service-Worker, IndexedDB, Precache)
- **Type-Safe:** TypeScript strict-mode, Result<T,E>-Pattern
- **Serverless:** Vercel Edge-Functions (no backend-server)
- **AI-Powered:** Dual-Provider (OpenAI for cost-efficiency, Grok for crypto-reasoning)

---

## TypeScript (from 01-typescript.md)

### Compiler-Config

```json
// tsconfig.json
{
  "compilerOptions": {
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitOverride": true,
    "baseUrl": ".",
    "paths": { "@/*": ["src/*"] }
  }
}
```

### Key-Patterns

**Result<T, E> for Error-Handling:**
```ts
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// Usage
async function fetchTokenData(address: string): Promise<Result<TokenData>> {
  try {
    const response = await fetch(`/api/token/${address}`);
    const data = await response.json();
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}
```

**Discriminated-Unions for State:**
```ts
type LoadingState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error };
```

### Pragmatic-Any

- ESLint: `@typescript-eslint/no-explicit-any: off` (pragmatic, not dogmatic)
- Use `any` for quick-prototyping, but track via TODO to replace later
- Prefer `any` over `unknown` (easier to work with, still tracked)

---

## React-Architecture (from 02-frontend-arch.md)

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
```

### State-Management

1. **Local-State** (useState) — Component-only (e.g. form-input)
2. **React-Context** — Feature-scoped (e.g. AI-Provider, Settings)
3. **Zustand** — Global-state (e.g. Access-Status, Theme)

**Why Zustand?** See `_intentions.md` (ADR-001: Zustand vs. Redux)

---

## PWA-Conventions (from 03-pwa-conventions.md)

### Offline-First-Features (MUST work offline)

- ✅ Journal (read, write, tag-filter)
- ✅ Board/Dashboard (KPI-tiles with cached-data)
- ✅ Charts (last cached OHLC-data)
- ✅ Watchlist (locally persisted)

### Service-Worker-Strategy

- **Precache:** All static-assets (JS, CSS, fonts, icons)
- **Cache-First:** Images, fonts
- **Network-First:** API-calls (with fallback to cache)
- **Stale-While-Revalidate:** OHLC-data

**Config:** `vite.config.ts` (vite-plugin-pwa + Workbox)

**Update-Strategy:** `skipWaiting: true` (auto-update, show toast-notification)

---

## UI/UX (from 04-ui-ux-components.md)

### Design-Principles

1. **Dark-Mode-First:** No Light-Mode yet (see ADR-005)
2. **Information-Density:** Dense-charts, compact-tables (trading-app style)
3. **Action-Proximity:** Actions near data (no modals for simple-actions)
4. **Mobile-First:** Tailwind `sm:`, `md:`, `lg:` breakpoints

### Component-Taxonomy

```
Level 1: UI-Primitives (Button, Input, Card)
Level 2: Composed-Components (ChartCard, TokenRow)
Level 3: Sections (ChartSection, SignalMatrix)
Level 4: Pages (MarketPage, JournalPage)
```

### UX-State-Patterns

```tsx
// Loading-State
if (isLoading) return <Spinner />;

// Error-State
if (error) return <ErrorBanner error={error} onRetry={refetch} />;

// Empty-State
if (data.length === 0) return <EmptyState message="No entries found" />;

// Success-State
return <DataTable data={data} />;
```

---

## API-Integration (from 05-api-integration.md)

### Serverless-API-Pattern

```ts
// api/data/ohlc.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Method-Check
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Input-Validation
  const { symbol } = req.query;
  if (!symbol || typeof symbol !== 'string') {
    return res.status(400).json({ error: 'Missing symbol' });
  }

  // 3. Call External-API (secret from env)
  try {
    const apiKey = process.env.DEXPAPRIKA_API_KEY;
    const response = await fetch(`https://api.dexpaprika.com/ohlc/${symbol}`, {
      headers: { 'X-API-Key': apiKey },
    });

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('[API] OHLC failed:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

### fetchWithRetry (Client-Side)

```ts
import { fetchWithRetry } from '@/lib/net/fetch';

const result = await fetchWithRetry('/api/data/ohlc?symbol=SOL', {
  retries: 3,
  baseDelay: 1000,
  timeout: 10000,
});
```

---

## Testing (from 06-testing-strategy.md)

### Test-Pyramid

```
        /\
       /  \        E2E (Playwright) — 10-15 Tests
      /----\       - Critical User-Flows
     /      \
    / Integration\  (Planned)
   /--------------\
  /   Unit (Vitest) \  100+ Tests
 /------------------\ - Components, Hooks, Utils
```

### Coverage-Targets

- **Overall:** 80%
- **Critical-Modules:** 90% (`src/lib/`, `api/`, `src/hooks/`)

### Vitest-Pattern (AAA)

```ts
describe('calculateRSI', () => {
  test('should return 70 for strong uptrend', () => {
    // Arrange
    const prices = [100, 105, 110, 115, 120];

    // Act
    const rsi = calculateRSI(prices);

    // Assert
    expect(rsi).toBeCloseTo(70, 1);
  });
});
```

---

## Security (from 09-security.md)

### Secrets-Management

**MUST:** Never expose secrets in client-bundle

```bash
# ✅ Good: Server-Side-Only (no VITE_ prefix)
MORALIS_API_KEY=sk-abc123...

# ❌ Avoid: Client-Side-Expose
VITE_MORALIS_API_KEY=sk-abc123...  # In bundle!
```

**MUST:** Use Serverless-Proxies

```ts
// Client calls proxy (no secret in client)
const response = await fetch('/api/moralis/token/SOL');

// Proxy adds secret server-side
const apiKey = process.env.MORALIS_API_KEY;
```

---

## Deployment (from 10-deployment.md)

### Pre-Deployment-Checklist

```bash
pnpm run typecheck
pnpm run lint
pnpm test
pnpm run build
pnpm run check:bundle-size
```

### Vercel-Config

```json
// vercel.json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "regions": ["fra1"]
}
```

### Rollback-Strategy

1. Vercel-Dashboard → Deployments
2. Select last-stable-deployment
3. "Promote to Production" (~5-10 seconds)

---

## AI-Integration (from 11-ai-integration.md)

### Dual-Provider-Strategy

- **OpenAI (gpt-4o-mini):** Cheap, fast (~$0.15/1M tokens), for high-volume
- **Grok (xAI):** Expensive (~$5/1M tokens), crypto-native, for high-value

### Cost-Management

```ts
const COST_LIMITS = {
  perRequest: 0.25,   // Max $0.25 per AI-call
  total: 100.0,       // Max $100/day
};
```

### Prompt-Design

```ts
const systemPrompt = await loadSystemPrompt('journal-condense');
const userPrompt = journalEntry.content;

const result = await callAI({
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ],
  maxTokens: 500,
});
```

---

## Current-Context (from _context.md)

### Session-Focus (2025-11-12)

**Primary-Task:** Multi-Tool-Prompt-System setup (Phase 4: Tool-Configs)

**Status:**
- ✅ Phase 1: Audit completed
- ✅ Phase 2: Rulesync-structure designed
- ✅ Phase 3: 11 SYSTEM + 6 ITERATIVE files generated
- ⏳ Phase 4: Tool-configs in progress

### Open-Questions

1. **Chart-Library:** Lightweight-Charts vs. TradingView? (Decision: End Q1 2025)
2. **Real-Time-Data:** WebSocket vs. Polling? (Decision: When Real-Time-Alerts goes live)
3. **Backend-DB:** Supabase vs. Stay-Client-Only? (Decision: After On-Chain-Access-Gating)
4. **AI-Provider:** Add Claude as third option? (Decision: Q2 2025)

---

## Design-Decisions (from _intentions.md)

### Key-ADRs

**ADR-001: Zustand for Global State (not Redux)**
- **Rationale:** Minimal-boilerplate, good TypeScript-support, flexible
- **Status:** ✅ Confirmed (2024-10)

**ADR-002: Dexie (IndexedDB) for Offline-Storage**
- **Rationale:** Offline-First-Priority, structured-queries, no 5-10MB-limit
- **Status:** ✅ Confirmed (2024-09)

**ADR-005: Dark-Mode-First (no Light-Mode yet)**
- **Rationale:** Trading-apps are typically dark, reduces eye-strain, faster-development
- **Status:** ✅ Confirmed (2024-08)

**ADR-008: OpenAI + Grok (Dual-AI-Provider)**
- **Rationale:** OpenAI cheap for high-volume, Grok better for crypto-reasoning
- **Status:** ✅ Confirmed (2024-10)

**See `_intentions.md` for all 11 ADRs.**

---

## Roadmap (from _planning.md)

### Active-Sprint: S0 — Foundation Cleanup (2025-11-12 → 2025-11-26)

**Tasks:**
- ✅ Multi-Tool-Prompt-System (SYSTEM-Files, ITERATIVE-Files)
- ⏳ PWA-Offline-Mode-Audit
- ⏳ Bundle-Size-Optimisation (<400KB)
- ⏳ E2E-Test-Coverage (15-20 tests)

### Q1 2025 Roadmap (P0)

1. **On-Chain-Access-Gating** (Solana-Wallet, NFT-Check)
2. **Real-Time-Alerts** (Push-Notifications)
3. **Background-Sync** (Offline-Queue)

---

## Usage-Tips for Claude Code

### Load-Key-Files-First

Before asking complex-questions, load 10-15 relevant files:

```
✅ Good: Load `.rulesync/02-frontend-arch.md` + `src/components/InteractiveChart.tsx` + `src/lib/indicators/*.ts`
✅ Good: Use "Add Context" → Select files by glob (src/components/**/*.tsx)
```

### Ask-for-Step-by-Step-Plans

```
✅ Good: "Plan refactor of InteractiveChart to Strategy-Pattern (step-by-step)"
✅ Good: "Generate migration-plan for LocalStorage → IndexedDB"
```

### Use-for-Documentation

```
✅ Good: "Generate README for src/lib/indicators/"
✅ Good: "Write ADR for Zustand vs. Redux decision"
```

### Review-Output-Carefully

⚠️ Claude sometimes hallucinates file-paths or API-names. Always verify suggestions against actual codebase.

---

## Related-Files

**Full-Context:**
- `.rulesync/` — 11 SYSTEM + 6 ITERATIVE files
- `_agents.md` — Multi-tool-routing-map (Cursor, Claude Code, Codex)
- `.cursor/rules/` — Cursor-specific simplified-hints

**Access:** All files in `/workspace/.rulesync/`

---

## Revision-History

- **2025-11-12:** Initial creation, Phase 4 (Auto-generated from `.rulesync/`, optimised for Claude Code)
