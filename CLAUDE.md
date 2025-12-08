Please also reference the following documents as needed:

@.claude/memories/journal-system.md description: "Journal system domain rules - Hero's Journey trading journal with AI insights" globs: "src/pages/JournalPageV2.tsx,src/components/journal/**/*.{ts,tsx},src/lib/JournalService.ts,src/lib/journal/**/*.ts,src/store/journalStore.ts,tests/e2e/journal/**/*.spec.ts,tests/e2e/journal-crud.spec.ts,tests/components/Journal*.test.tsx,tests/pages/JournalPageV2.test.tsx,docs/core/journal/**/*.md"
@.claude/memories/playwright-e2e-health.md description: "Playwright E2E test suite health and maintenance guardrails" globs: "tests/e2e/**/*.spec.ts,tests/e2e/**/*.ts,playwright.config.ts,src/**/*.{ts,tsx},.github/workflows/*.yml"

# Sparkfined PWA – Global AI Assistant Guardrails

## Project Overview

**Sparkfined PWA** is a progressive web app for crypto traders that provides:

- **Journal System**: Hero's journey-based trading journal with AI insights (offline-first, IndexedDB via Dexie)
- **Chart Analysis**: Multi-provider chart system with replay mode, indicators, and annotations
- **Market Data**: Orchestrated multi-provider fallback chain (CoinGecko → CoinCap → Moralis)
- **Alerts & Watchlist**: Real-time price alerts with custom triggers
- **Dashboard**: KPI snapshots and feed aggregation
- **Gamification**: XP system with journey phases (Degen → Seeker → Warrior → Master → Sage)

**Tech Stack**:
- React 18 + TypeScript
- Vite (build) + Vitest (unit) + Playwright (E2E)
- TailwindCSS + Design Tokens
- Zustand (state) + Dexie (IndexedDB)
- PWA with offline support

---

## 🚨 **Hard Guardrails for AI Assistants**

### 1. **Loop-Safety & Guardrails (STRICT)**

- **Keine Dirty-Fixes / Kein Config-Gefummel**
  - TS-/ESLint-/Vite-Konfiguration NICHT lockern, um Fehler verschwinden zu lassen.
  - Kein `// eslint-disable` oder `// @ts-ignore`, außer es ist absolut unvermeidbar UND du erklärst es explizit.
  - Keine neuen `any`-Casts nur zum „Beruhigen" von TypeScript.

- **Keine neuen Runtime-Loops**
  - Keine neuen `setInterval`/`setTimeout`-Polls ohne klaren Cleanup.
  - Keine neuen `useEffect`-/EventBus-Subscribes ohne:
    - klaren Guard (z.B. `useRef` für Mount-only),
    - und Cleanup/Unsubscribe.
  - URL-/State-Sync-Logik (Journal/Analysis) nur ändern, wenn der Canvas es explizit verlangt.

- **Fehlerbehandlung statt Eskalation**
  - Wenn nach einem Patch neue TS-/Lint-Fehler auftauchen:
    - Ursache lokal fixen,
    - keine globalen Regeln abschalten,
    - kein „Fixen durch Verschieben ins Nirvana" (z.B. Export löschen, statt Typ sauber zu machen).

### 2. **No Config Weakening**
- **DO NOT** relax TypeScript, ESLint, Vite, or Playwright configs to silence errors
- **DO NOT** add new `any` types or `@ts-ignore` without explicit justification
- If a config error appears, **fix the root cause**, don't mask it

### 3. **No Infinite Loops / Subscriptions**
- **DO NOT** create patterns that cause React error #185 (infinite re-renders)
- **ALWAYS** include cleanup in `useEffect` for subscriptions, timers, listeners
- **AVOID** state updates inside render logic

### 4. **Type Safety First**
- Use existing types from `src/types/`
- Prefer interfaces over inline types
- No unsafe casts (`as any`) without documented reason

### 5. **Testing Expectations**
- New features **MUST** include tests (unit or E2E)
- E2E tests use `data-testid` attributes (never fragile selectors)
- Tests should be deterministic (no flaky timing dependencies)

---

## 📂 **Documentation Management Rules**

### User-Defined Rules (Priority 1):
1. **No unnecessary documents**: Only create `.md` files when truly needed
2. **Root cleanliness**: Only `README.md` in root, all other docs → `/docs/`
3. **No duplicates**: Before creating new docs, check `/docs/` for existing files to update
4. **Track changes**: Every code change must be documented in `/docs/`

### Implementation:
- **Before writing**: Check `docs/` structure and update existing files
- **After writing**: Update `docs/index.md` or relevant domain doc
- **Commit message**: Include `docs:` prefix when updating documentation

---

## 🔄 **AI Agent Change Workflow**

When asked to make a change:

### Phase 1: **Context Gathering**
1. Read relevant source files (don't assume structure)
2. Check existing tests for the module
3. Scan `/docs/` for domain documentation
4. Identify related components/stores/libs

### Phase 2: **Planning**
1. Propose the change with file paths and diffs
2. Explain **why** (not just what)
3. Identify potential breaking changes
4. Suggest test coverage needed

### Phase 3: **Implementation**
1. Make minimal, focused changes
2. Preserve existing patterns and abstractions
3. Add/update tests
4. Update relevant docs in `/docs/`

### Phase 4: **Validation**
1. Run all validation commands and ensure they pass:
   - `pnpm typecheck` (TypeScript)
   - `pnpm lint` (ESLint)
   - `pnpm test` (Vitest unit tests)
   - `pnpm test:e2e` (Playwright E2E)
2. Fix any failures according to Loop-Safety Guardrails (see §1)
3. Highlight any remaining TODOs or manual steps
4. Update `/docs/` with implementation notes

---

## 🎨 **Design System Constraints**

### Use Design Tokens (src/styles/, tailwind.config.ts)
- **DO**: Use Tailwind utilities (`bg-slate-950`, `text-emerald-500`)
- **DON'T**: Hardcode hex colors or arbitrary values unless absolutely necessary

### Component Patterns
- Reuse components from `src/components/ui/`
- Follow existing component structure (e.g., `*PageV2.tsx` pattern)
- Keep components focused (single responsibility)

### Responsive Design
- Mobile-first approach
- Test breakpoints: `sm`, `md`, `lg`, `xl`
- Touch targets ≥ 44px

---

## 🧪 **Testing Guidelines**

### Unit Tests (Vitest)
- Location: `tests/components/`, `tests/lib/`
- Test business logic and edge cases
- Mock external dependencies (network, IndexedDB)

### E2E Tests (Playwright)
- Location: `tests/e2e/`
- Test critical user flows (journal entry, alert creation, chart navigation)
- Use `data-testid` for stable selectors
- Group related tests in `*.flows.spec.ts` files

### Common Pitfalls to Avoid:
- **Flaky locators**: Use `data-testid`, not CSS classes or nth-child
- **Timing issues**: Use Playwright's auto-waiting, avoid hard `wait()`
- **State pollution**: Ensure tests are isolated (fresh DB state)

---

## 📁 **Project Structure Reference**

```
Sparkfined_PWA/
├── src/
│   ├── pages/              # Top-level route pages (*PageV2.tsx)
│   ├── components/         # UI components (organized by domain)
│   ├── lib/                # Business logic, services, utilities
│   ├── store/              # Zustand state stores
│   ├── hooks/              # Custom React hooks
│   ├── types/              # TypeScript type definitions
│   ├── routes/             # React Router config (RoutesRoot.tsx)
│   └── db/                 # Dexie IndexedDB schemas
├── tests/
│   ├── e2e/                # Playwright E2E tests
│   ├── components/         # Component unit tests
│   └── lib/                # Library unit tests
├── docs/                   # 216 markdown docs (18 subdirectories)
│   ├── core/               # Core domain documentation
│   ├── architecture/       # System design
│   ├── design/             # UI/UX specs and wireframes
│   ├── tickets/            # TODOs and issues
│   └── process/            # Workflows and guidelines
├── .github/workflows/      # CI/CD pipelines
└── public/                 # Static assets
```

---

## 🔗 **Key Architecture Points**

### State Management
- **Zustand stores**: `src/store/*Store.ts` (alerts, journal, watchlist, etc.)
- **Event bus**: `src/store/eventBus.ts` for cross-component communication
- **Persistence**: Dexie for offline-first IndexedDB storage

### Data Orchestration
- **Market data**: `src/lib/data/marketOrchestrator.ts` (multi-provider fallback)
- **Adapters**: `src/lib/adapters/` for provider normalization
- **Telemetry**: Track provider health and latency

### Routing
- **Main router**: `src/routes/RoutesRoot.tsx`
- **Lazy loading**: All pages code-split via `React.lazy()`
- **URL state sync**: Journal/Alert selection synced with query params

---

## 🚀 **Commands Reference**

### Development
```bash
pnpm dev              # Start dev server (Vite)
pnpm typecheck        # Run TypeScript compiler
pnpm lint             # ESLint check
pnpm format           # Prettier format
```

### Testing
```bash
pnpm test             # Run Vitest unit tests
pnpm test:e2e         # Run Playwright E2E tests
pnpm test:e2e:ui      # Run E2E with UI mode
```

### Build
```bash
pnpm build            # Production build
pnpm preview          # Preview production build
```

### Rulesync (when updating rules)
```bash
npx rulesync generate              # Generate all target files
npx rulesync generate --dry-run    # Preview without writing
```

---

## 📖 **How to Use These Rules**

1. **When starting work**: Read this overview + any domain-specific rules (e.g., `journal-system.md`)
2. **When proposing changes**: Follow the Change Workflow above
3. **When stuck**: Check `/docs/` for domain documentation
4. **When updating rules**: Edit `.rulesync/rules/*.md`, then run `npx rulesync generate`

---

## 🧭 **Domain-Specific Rules**

This is the **global overview**. For domain-specific guardrails, see:
- `.rulesync/rules/journal-system.md` – Journal domain rules
- `.rulesync/rules/playwright-e2e-health.md` – Playwright E2E test suite maintenance
- (Future) `.rulesync/rules/market-orchestrator.md` – Market data rules

---

**Last updated**: 2025-12-05
**Maintained by**: Sparkfined Team
**Rulesync version**: Compatible with v1.x
