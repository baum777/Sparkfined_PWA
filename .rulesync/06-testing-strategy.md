---
mode: SYSTEM
id: "06-testing-strategy"
priority: 3
version: "0.1.0"
last_review: "2025-11-12"
targets: ["cursor", "claudecode"]
globs: ["**/*.test.ts", "**/*.test.tsx", "**/*.spec.ts", "tests/**/*", "playwright.config.ts", "vitest.config.ts"]
description: "Testing strategy: Vitest unit tests, Playwright E2E, coverage targets, and test conventions for Sparkfined"
---

# 06 – Testing Strategy

## 1. Test Pyramid

Sparkfined folgt der **klassischen Test-Pyramide** mit Fokus auf Unit-Tests + kritische E2E-Flows:

```
        /\
       /  \        E2E (Playwright)
      /    \       ~ 10-15 Tests
     /------\      - Critical User-Flows
    /        \     - Happy-Path + Edge-Cases
   /  Integration \ 
  /    (planned)   \
 /------------------\
/    Unit (Vitest)   \  ~ 100+ Tests
/----------------------\ - Components, Hooks, Utils
         BASE            - Business-Logic, Adapters
```

### Test-Verteilung (Target)

| Layer | Tool | Count-Target | Coverage-Target | Rationale |
|-------|------|--------------|-----------------|-----------|
| **Unit** | Vitest | 100+ | 80% lines, 80% branches | Schnelle Feedback-Loop, isolierte Logic |
| **Integration** | Vitest (geplant) | 20+ | 70% | API-Adapter + Hook-Integration |
| **E2E** | Playwright | 10-15 | Happy-Path + 2-3 Edge-Cases | User-kritische Flows (Journal, Chart, Analyze) |

---

## 2. What to Test

### MUST-Test (Kritisch für App-Funktion)

**Business-Logic:**
- ✅ KPI-Berechnungen (`src/lib/analysis/kpiCalculator.ts`)
- ✅ Trading-Indikatoren (SMA, EMA, RSI, Bollinger-Bands)
- ✅ Journal-Entry-Validation
- ✅ Signal-Rule-Evaluation
- ✅ Price-Adapter-Fallback-Logic (Moralis → DexPaprika → Dexscreener)

**Adapters:**
- ✅ Moralis-Adapter (Token-Metadata, Error-Handling)
- ✅ DexPaprika-Adapter (OHLC-Fetch, Retry-Logic)
- ✅ AI-Orchestrator (Provider-Routing, Cost-Tracking)

**Hooks:**
- ✅ useJournal (CRUD-Operations, Offline-Sync)
- ✅ useBoardKPIs (Cache-Hit/Miss, Online/Offline)
- ✅ useSignals (Rule-Evaluation, Alert-Trigger)

**Utils:**
- ✅ fetchWithRetry (Exponential-Backoff, Timeout-Handling)
- ✅ RateLimiter (Request-Throttling)
- ✅ Date/Time-Formatters
- ✅ Hash-Functions (sha256 für Entry-IDs)

### SHOULD-Test (Wichtig, aber nicht kritisch)

**Components:**
- ⚠️ KPITile (Props-Rendering, Sentiment-Colors)
- ⚠️ Button (Variants, Disabled-State)
- ⚠️ Modal (Focus-Trap, Keyboard-Close)

**State-Management:**
- ⚠️ Settings-Context (Theme-Toggle, Persistence)
- ⚠️ Access-Store (Cache-Invalidation)

### MAY-Test (Low-Priority)

**UI-Primitives:**
- 🔵 Input (Basic-Rendering, wird via Storybook validiert)
- 🔵 Skeleton (Pure-Visual-Component)

**Pages:**
- 🔵 BoardPage (E2E deckt ab, Unit-Test redundant)
- 🔵 AnalyzePage (E2E deckt ab)

### MUST-NOT-Test (Verschwendung)

- ❌ Third-Party-Libraries (React, Dexie, etc.)
- ❌ Type-Definitions (TS-Compiler prüft das)
- ❌ Pure-CSS/Styling (Visuelles Testing via Playwright-Screenshots)
- ❌ Mocks von Mocks (Test-Code-Smell)

---

## 3. Coverage Targets

### Global-Coverage-Budget

**Minimum-Ziele (CI-Check):**
- **Lines:** ≥ 80%
- **Branches:** ≥ 80%
- **Functions:** ≥ 75%
- **Statements:** ≥ 80%

**Aktuelle Coverage (2025-11-12):**
- Lines: ~65% (Ziel: 80%)
- Branches: ~60% (Ziel: 80%)

**Gap-Analyse:** Fehlende Tests für:
- `src/lib/adapters/*` (aktuell ~40% Coverage)
- `src/sections/chart/*` (Canvas-Logic schwer zu testen, aktuell ~30%)
- `api/**` (Serverless-Functions, aktuell ~50%)

### Critical-Modules (Higher-Target)

**MUST ≥ 90% Coverage:**
- `src/lib/analysis/kpiCalculator.ts` (Trading-Logic)
- `src/lib/journal.ts` (Journal-Core-Logic)
- `src/lib/adapters/priceAdapter.ts` (Fallback-Chain)
- `src/lib/net/fetchWithRetry.ts` (Retry-Logic)

**SHOULD ≥ 85% Coverage:**
- `src/hooks/useJournal.ts`
- `src/hooks/useBoardKPIs.ts`
- `src/lib/offline-sync.ts`

**MAY < 70% Coverage (akzeptabel):**
- `src/sections/chart/ChartCanvas.tsx` (Canvas-Rendering schwer zu mocken)
- `src/components/ui/*` (Pure-Visual, Storybook statt Unit-Tests)

---

## 4. Conventions

### File-Naming & Location

**[MUST]** Nutze `.test.ts` / `.test.tsx` für Unit-Tests

```
src/lib/journal.ts
src/lib/journal.test.ts  ← Test-File neben Source

src/components/KPITile.tsx
src/components/KPITile.test.tsx  ← Test-File neben Component
```

**[MUST]** Nutze `.spec.ts` für E2E-Tests (Playwright)

```
tests/
  ├── journal.spec.ts
  ├── analyze.spec.ts
  └── chart.spec.ts
```

**Rationale:** `.test.*` = Unit/Integration (Vitest), `.spec.*` = E2E (Playwright)

### Test-Structure (AAA-Pattern)

**[MUST]** Folge Arrange-Act-Assert-Pattern

```tsx
// ✅ Good: AAA-Pattern
test('calculates RSI correctly', () => {
  // Arrange
  const prices = [44, 44.34, 44.09, 43.61, 44.33, 44.83];
  
  // Act
  const rsi = calculateRSI(prices, 14);
  
  // Assert
  expect(rsi).toBeCloseTo(70.53, 2);
});

// ❌ Avoid: Unklare Struktur
test('rsi works', () => {
  expect(calculateRSI([44, 44.34, 44.09], 14)).toBe(70.53);
});
```

### Test-Naming

**[SHOULD]** Nutze beschreibende Test-Namen (Sentence-Case)

```tsx
// ✅ Good: Klar, was getestet wird
test('returns cached KPIs when offline', async () => { ... });
test('retries API call 3 times on 500 error', async () => { ... });
test('throws error when RSI period < 2', () => { ... });

// ❌ Avoid: Zu generisch
test('works', () => { ... });
test('kpis', () => { ... });
test('test1', () => { ... });
```

### Test-Data & Fixtures

**[SHOULD]** Nutze Fixtures für komplexe Test-Daten

```tsx
// tests/fixtures/ohlc.ts
export const mockOHLCData: OHLCData[] = [
  { timestamp: 1699999200000, open: 50000, high: 51000, low: 49500, close: 50500, volume: 1000 },
  { timestamp: 1699999260000, open: 50500, high: 50800, low: 50200, close: 50600, volume: 1200 },
  // ...
];

// Usage in test
import { mockOHLCData } from '../fixtures/ohlc';

test('calculates SMA from OHLC data', () => {
  const sma = calculateSMA(mockOHLCData, 20);
  expect(sma).toHaveLength(mockOHLCData.length - 19);
});
```

**[MUST]** Fixtures in `tests/fixtures/` oder `__fixtures__/`

```
tests/
  ├── fixtures/
  │   ├── ohlc.ts
  │   ├── journal-entries.ts
  │   └── tokens.ts
  └── journal.spec.ts
```

---

## 5. Vitest (Unit & Integration)

### vitest.config.ts

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,  // describe, test, expect global verfügbar
    environment: 'jsdom',  // Für React-Component-Tests
    setupFiles: ['./tests/setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '**/*.config.ts',
        '**/*.test.ts',
        '**/*.spec.ts',
      ],
      thresholds: {
        lines: 80,
        branches: 80,
        functions: 75,
        statements: 80,
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
```

### Setup-File (tests/setup.ts)

```ts
// tests/setup.ts
import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { cleanup } from '@testing-library/react';

// Cleanup nach jedem Test
afterEach(() => {
  cleanup();
});

// Mock window.matchMedia (für Dark-Mode-Tests)
beforeAll(() => {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    }),
  });
});
```

### Component-Testing (React-Testing-Library)

**[SHOULD]** Teste Component-Behavior, nicht Implementation-Details

```tsx
// src/components/KPITile.test.tsx
import { render, screen } from '@testing-library/react';
import { KPITile } from './KPITile';

test('displays KPI label and value', () => {
  const data = {
    label: 'Market Cap',
    value: '$1.2M',
    sentiment: 'positive',
  };

  render(<KPITile data={data} />);

  // ✅ Good: Test sichtbares Verhalten
  expect(screen.getByText('Market Cap')).toBeInTheDocument();
  expect(screen.getByText('$1.2M')).toBeInTheDocument();

  // ❌ Avoid: Test Implementation-Details
  // expect(component.state.sentiment).toBe('positive');
});

test('applies correct sentiment color', () => {
  const data = { label: 'RSI', value: '75', sentiment: 'negative' };

  render(<KPITile data={data} />);

  const valueElement = screen.getByText('75');
  expect(valueElement).toHaveClass('text-red-500');  // Sentiment-Color
});
```

### Hook-Testing

**[SHOULD]** Nutze `renderHook` für Custom-Hook-Tests

```tsx
// src/hooks/useJournal.test.ts
import { renderHook, waitFor } from '@testing-library/react';
import { useJournal } from './useJournal';

test('loads journal entries from IndexedDB', async () => {
  const { result } = renderHook(() => useJournal());

  // Initial-State
  expect(result.current.isLoading).toBe(true);

  // Warte auf Daten-Load
  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  expect(result.current.entries).toHaveLength(3);
});

test('adds new journal entry', async () => {
  const { result } = renderHook(() => useJournal());

  await waitFor(() => {
    expect(result.current.isLoading).toBe(false);
  });

  const initialCount = result.current.entries.length;

  // Act
  await result.current.addEntry({
    content: 'Test entry',
    tags: ['setup'],
  });

  // Assert
  expect(result.current.entries).toHaveLength(initialCount + 1);
});
```

---

## 6. Playwright (E2E)

### playwright.config.ts

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30 * 1000,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  reporter: [
    ['html'],
    ['list'],
  ],
  
  use: {
    baseURL: 'http://localhost:4173',  // Preview-Build
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Mobile-Tests (optional)
    // {
    //   name: 'mobile-chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
  ],
  
  webServer: {
    command: 'pnpm preview',
    port: 4173,
    reuseExistingServer: !process.env.CI,
  },
});
```

### Critical-User-Flows (E2E-Coverage)

**MUST-Test-Flows:**

1. **Journal-Flow:** Create Entry → Edit Entry → Delete Entry
2. **Analyze-Flow:** Enter-Token-Address → Fetch-KPIs → Save-to-Journal
3. **Chart-Flow:** Load-Chart → Change-Timeframe → Add-Indicator
4. **Access-Flow:** Connect-Wallet → Check-Status → View-Premium-Feature
5. **Offline-Flow:** Go-Offline → Read-Journal → Go-Online → Sync

**Example E2E-Test:**

```ts
// tests/journal.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Journal Flow', () => {
  test('creates, edits, and deletes entry', async ({ page }) => {
    await page.goto('/journal');

    // Create Entry
    await page.click('button:has-text("New Entry")');
    await page.fill('textarea[name="content"]', 'Test trade setup');
    await page.fill('input[name="tags"]', 'scalp, long');
    await page.click('button:has-text("Save")');

    // Verify Entry visible
    await expect(page.locator('text=Test trade setup')).toBeVisible();

    // Edit Entry
    await page.click('article:has-text("Test trade setup") button[aria-label="Edit"]');
    await page.fill('textarea[name="content"]', 'Updated trade setup');
    await page.click('button:has-text("Save")');

    await expect(page.locator('text=Updated trade setup')).toBeVisible();

    // Delete Entry
    await page.click('article:has-text("Updated trade setup") button[aria-label="Delete"]');
    await page.click('button:has-text("Confirm")');

    await expect(page.locator('text=Updated trade setup')).not.toBeVisible();
  });

  test('persists entry after page reload', async ({ page }) => {
    await page.goto('/journal');

    // Create Entry
    await page.click('button:has-text("New Entry")');
    await page.fill('textarea[name="content"]', 'Persistent entry');
    await page.click('button:has-text("Save")');

    // Reload Page
    await page.reload();

    // Entry still visible
    await expect(page.locator('text=Persistent entry')).toBeVisible();
  });
});
```

### Accessibility-Tests (via @axe-core)

**[SHOULD]** Integriere A11y-Checks in E2E-Tests

```ts
// tests/accessibility.spec.ts
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test.describe('Accessibility', () => {
  test('homepage has no a11y violations', async ({ page }) => {
    await page.goto('/');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('journal page has no a11y violations', async ({ page }) => {
    await page.goto('/journal');

    const accessibilityScanResults = await new AxeBuilder({ page }).analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});
```

---

## 7. CI Integration

### GitHub Actions (Beispiel)

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  unit-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm test
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info

  e2e-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - run: pnpm install
      - run: pnpm build
      - run: npx playwright install --with-deps
      - run: pnpm test:e2e
      
      - name: Upload Playwright Report
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

### Pre-Commit-Hooks (Husky, geplant)

```json
// package.json
{
  "scripts": {
    "test:pre-commit": "vitest run --changed"
  }
}
```

---

## 8. Examples

### ✅ Good – Complete Unit-Test

```tsx
// src/lib/analysis/rsi.test.ts
import { calculateRSI } from './rsi';

describe('calculateRSI', () => {
  test('calculates RSI correctly for standard dataset', () => {
    // Arrange: Real BTC price data (simplified)
    const prices = [
      44.00, 44.34, 44.09, 43.61, 44.33, 44.83, 45.10, 45.42,
      45.84, 46.08, 45.89, 46.03, 45.61, 46.28, 46.28, 46.00,
    ];

    // Act
    const rsi = calculateRSI(prices, 14);

    // Assert: Expected RSI ~70.53 (standard calculation)
    expect(rsi).toBeCloseTo(70.53, 1);
  });

  test('returns null for insufficient data', () => {
    const prices = [44, 45, 46];  // < 14 periods

    const rsi = calculateRSI(prices, 14);

    expect(rsi).toBeNull();
  });

  test('handles all-equal prices (no volatility)', () => {
    const prices = Array(20).fill(50);

    const rsi = calculateRSI(prices, 14);

    expect(rsi).toBe(50);  // Neutral RSI bei keine Bewegung
  });

  test('throws error for invalid period', () => {
    const prices = [44, 45, 46, 47];

    expect(() => calculateRSI(prices, 0)).toThrow('Period must be >= 2');
    expect(() => calculateRSI(prices, -5)).toThrow('Period must be >= 2');
  });
});
```

### ❌ Avoid – Anti-Patterns

```tsx
// ❌ Bad: Keine AAA-Struktur
test('rsi', () => {
  expect(calculateRSI([44, 45, 46], 14)).toBe(70);  // Unklare Erwartung
});

// ❌ Bad: Test-Code-Duplizierung
test('rsi for dataset 1', () => {
  const prices = [44, 45, 46, 47, 48];
  expect(calculateRSI(prices, 14)).toBeCloseTo(70, 1);
});

test('rsi for dataset 2', () => {
  const prices = [44, 45, 46, 47, 48];  // Selbe Daten!
  expect(calculateRSI(prices, 10)).toBeCloseTo(65, 1);
});
// → Nutze describe + beforeEach für shared Setup

// ❌ Bad: Test hängt von externen Services ab
test('fetches token price', async () => {
  const price = await fetch('https://api.moralis.io/...');  // Real-API-Call!
  expect(price).toBeGreaterThan(0);
});
// → Mock externe Calls

// ❌ Bad: Zu granular (testet Implementation)
test('RSI calls calculateAverage internally', () => {
  const spy = vi.spyOn(utils, 'calculateAverage');
  calculateRSI([44, 45, 46], 14);
  expect(spy).toHaveBeenCalled();  // Implementation-Detail!
});
```

---

## Related

- `00-project-core.md` – Projekt-Übersicht & Tech-Stack
- `02-frontend-arch.md` – Component-Struktur für Tests
- `05-api-integration.md` – Adapter-Mocking-Patterns
- `vitest.config.ts` – Vitest-Config
- `playwright.config.ts` – Playwright-Config
- `tests/` – Test-Dateien

---

## Revision History

- **2025-11-12:** Initial creation, Phase 3 Batch 3 (Vitest + Playwright strategy)
