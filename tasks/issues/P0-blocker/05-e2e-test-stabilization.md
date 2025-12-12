# E2E Test Suite Stabilisierung

**Priorität**: 🔴 P0 BLOCKER
**Aufwand**: 2 Tage
**Dringlichkeit**: VOR R0 LAUNCH
**Abhängigkeiten**: Journal CRUD Tests, API Contract Tests

**Status**: ✅ DONE (Analyze + Idea Packet Flows mit stabilen E2E-Mocks abgedeckt)

**Neue E2E Specs**:
- `tests/e2e/analyze/analyze.page.spec.ts` – Analyze-Snapshot mit deterministischen Mock-Kerndaten (Bias/Range/Price/Change Stats)
- `tests/e2e/ideas/idea-packets.spec.ts` – Idea-Packet erstellen, persistieren (LocalStorage) und bearbeiten

**Selectors/Testbarkeit**:
- Analyze: `analysis-page-root`, `analysis-overview-stats`, `analysis-stat-*`, `analysis-trend-block`
- Ideas: `idea-title-input`, `idea-thesis-input`, `idea-save-button`, `idea-packet-list`, `idea-edit-button`

---

## Problem

E2E Test-Suite hat kritische Lücken:
- 🔴 **Replay E2E Suite** komplett geskippt
- 🟡 **Analyze Page** Tests nur mit CI-Seed
- 🟡 **Journal Flow** Tests instabil (Dialog Overflow Issues)
- 🟡 Viele Tests mit `test.skip()` maskiert

**Betroffene Test Files**:
- `tests/e2e/replay.spec.ts` - KOMPLETT GESKIPPT
- `tests/e2e/analyze.spec.ts` - Nur CI Mode
- `tests/e2e/journal/journal.flows.spec.ts` - Flaky
- `tests/cases/analyze-bullets-ai/ABA-INTEG-010.test.ts` - Geskippt

**Aktueller Stand**:
- ✅ `tests/e2e/replay.spec.ts` reaktiviert mit OHLC-Mocks
- ✅ Journal Flows stabilisiert (Scroll/DB-Cleanup in `tests/e2e/journal/journal.flows.spec.ts`)
- ⚠️ Analyze Page/Idea-Packet E2E weiterhin fehlend

## Checkliste (Repo-Abgleich – Stand: 2025-12-12)

- [x] Replay-Lab-E2E aktiv mit deterministischen OHLC-Fixtures
- [x] Journal CRUD/Flows stabilisiert (Scroll/Wartezeiten/DB-Cleanup in Tests)
- [x] Analyze-Page E2E vorhanden (`tests/e2e/analyze/analyze.page.spec.ts`)
- [x] Idea-Packet E2E vorhanden (`tests/e2e/ideas/idea-packets.spec.ts`)
- [ ] Live-Provider-E2E fehlt – Replay nutzt weiterhin Mock-Candles; echtes Provider-Muxing nicht abgedeckt.

## Nächste Schritte aus Repo-Sicht

- Falls Live-Daten-Provider priorisiert werden, eigenen E2E-Run mit realen Endpoints ergänzen (Feature-Flag/Mock-Toggle berücksichtigen).
- Prüfen, ob weitere Flaky-Tests im CI auftauchen und in diese Checkliste übernehmen.

---

## Test Status Overview

| Test Suite | Status | Problem |
|------------|--------|---------|
| Journal CRUD | 🟢 Green | Stabilisiert (Scroll/DB Cleanup) |
| Replay Lab | 🟡 Partial | OHLC Mock weiterhin erforderlich |
| Analyze Page | 🟢 Green | Mock-Snapshot via Playwright Fixtures |
| Idea Packets | 🟢 Green | Create/Persist/Edit via Notifications UI |
| Alert Flows | 🟢 Green | OK |
| Chart Navigation | 🟢 Green | OK |
| Watchlist | 🟢 Green | OK |
| Dashboard KPIs | 🟢 Green | OK |

---

## Tasks

### Phase 1: Journal Flow Stabilisierung (1 Tag)

#### Problem: Dialog Overflow
**Symptom**: Save Button nicht sichtbar, Click fails
```typescript
// BEFORE (Flaky)
await page.getByTestId('journal-save-button').click();
// Error: Element not visible

// AFTER (Stable)
const saveButton = page.getByTestId('journal-save-button');
await saveButton.scrollIntoViewIfNeeded();
await expect(saveButton).toBeEnabled();
await saveButton.click();
```

#### Fix 1: Scroll Before Click
```typescript
// tests/e2e/journal/journal.flows.spec.ts
test('create journal entry - stable', async ({ page }) => {
  await page.goto('/journal-v2');

  // Open dialog
  await page.getByTestId('journal-new-entry-button').click();

  // Fill form
  await page.getByTestId('journal-title-input').fill('Test Entry');
  await page.getByTestId('journal-notes-textarea').fill('Notes here');

  // CRITICAL: Scroll button into view
  const saveButton = page.getByTestId('journal-save-entry-button');
  await saveButton.scrollIntoViewIfNeeded();
  await expect(saveButton).toBeVisible();
  await expect(saveButton).toBeEnabled();

  await saveButton.click();

  // Wait for dialog to close
  await expect(page.getByTestId('journal-new-entry-dialog')).not.toBeVisible();

  // Verify entry in list
  await expect(page.getByTestId('journal-list-item').first()).toContainText('Test Entry');
});
```

#### Fix 2: Stable Locators
```typescript
// BEFORE (Fragile)
await page.locator('.journal-item:first-child').click();

// AFTER (Stable)
await page.getByTestId('journal-list-item').first().click();
```

#### Fix 3: Proper Waits
```typescript
// BEFORE (Hard timeout)
await page.waitForTimeout(500);

// AFTER (Condition-based)
await expect(page.getByTestId('journal-detail-panel')).toBeVisible();
await page.waitForLoadState('networkidle');
```

---

### Phase 2: Replay E2E Unskippen (1 Tag)

#### Aktuelles Problem
```typescript
// tests/e2e/replay.spec.ts
test.skip('replay lab flows', () => {
  // Entire suite skipped because OHLC fetch is mocked
});
```

**Dependency**: Erst nach "Replay OHLC Live-Daten Integration" (P1 Task)

#### Approach: Mock API Response
```typescript
// tests/e2e/replay.spec.ts
import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // Mock /api/market/ohlc endpoint
  await page.route('**/api/market/ohlc**', (route) => {
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        symbol: 'SOL',
        data: [
          { time: 1701388800, open: 95, high: 98, low: 94, close: 97 },
          { time: 1701475200, open: 97, high: 102, low: 96, close: 101 }
        ]
      })
    });
  });
});

test('should load replay session with mock OHLC', async ({ page }) => {
  await page.goto('/replay');

  // Select symbol
  await page.getByTestId('replay-symbol-input').fill('SOL');
  await page.getByTestId('replay-load-button').click();

  // Wait for chart to load
  await expect(page.getByTestId('replay-chart')).toBeVisible();

  // Verify candles rendered
  const candles = await page.locator('.tv-lightweight-charts canvas').count();
  expect(candles).toBeGreaterThan(0);

  // Test playback controls
  await page.getByTestId('replay-play-button').click();
  await expect(page.getByTestId('replay-current-time')).not.toBeEmpty();
});
```

#### Test Coverage für Replay
- [ ] Load session with symbol
- [ ] Play/Pause controls
- [ ] Speed adjustment (1x, 2x, 4x)
- [ ] Skip forward/backward
- [ ] Save replay session
- [ ] Resume saved session

---

### Phase 3: Analyze Page Tests mit Mocks (4h)

#### Mock Market Data API
```typescript
// tests/e2e/analyze.spec.ts
test.beforeEach(async ({ page }) => {
  // Mock KPI data
  await page.route('**/api/board/kpis**', (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        totalPnL: 1250.50,
        winRate: 68.5,
        avgRR: 2.3,
        sharpeRatio: 1.8
      })
    });
  });

  // Mock AI bullet analysis
  await page.route('**/api/ai/assist**', (route) => {
    route.fulfill({
      status: 200,
      body: JSON.stringify({
        bullets: [
          'Strong uptrend on 4H timeframe',
          'Volume confirms bullish momentum',
          'RSI shows healthy pullback'
        ]
      })
    });
  });
});

test('should display KPI cards with mocked data', async ({ page }) => {
  await page.goto('/analysis-v2');

  // Verify KPI tiles
  await expect(page.getByTestId('kpi-total-pnl')).toContainText('$1,250.50');
  await expect(page.getByTestId('kpi-win-rate')).toContainText('68.5%');

  // Verify AI bullets
  await expect(page.getByTestId('ai-bullet-list')).toBeVisible();
  const bullets = page.getByTestId('ai-bullet-item');
  await expect(bullets).toHaveCount(3);
});
```

#### Test: One-Click Idea Packet
```typescript
test('should create idea packet (rule + journal + idea)', async ({ page }) => {
  // Mock idea packet creation
  await page.route('**/api/ideas**', (route) => {
    route.fulfill({
      status: 201,
      body: JSON.stringify({
        ideaId: 'idea-123',
        journalId: 'journal-456',
        ruleId: 'rule-789'
      })
    });
  });

  await page.goto('/analysis-v2?symbol=SOL');

  // Click "Create Idea Packet"
  await page.getByTestId('create-idea-packet-button').click();

  // Verify success notification
  await expect(page.getByText('Idea packet created')).toBeVisible();

  // Verify links created
  await expect(page.getByTestId('idea-journal-link')).toHaveAttribute('href', '/journal-v2?entry=journal-456');
  await expect(page.getByTestId('idea-rule-link')).toHaveAttribute('href', '/alerts-v2?rule=rule-789');
});
```

---

### Phase 4: Test Isolation & State Cleanup (2h)

#### Problem: State Pollution Between Tests
```typescript
// BEFORE (Flaky - State persists)
test('create entry', async ({ page }) => {
  // Creates entry in IndexedDB
  // Other tests see this entry!
});

// AFTER (Isolated)
test.beforeEach(async ({ page }) => {
  // Clean IndexedDB before each test
  await page.evaluate(() => {
    indexedDB.deleteDatabase('sparkfined-db');
    indexedDB.deleteDatabase('board-db');
    indexedDB.deleteDatabase('oracle-db');
    indexedDB.deleteDatabase('signals-db');
  });

  await page.goto('/');
  await page.waitForLoadState('networkidle');
});
```

#### Seed Test Data (Optional)
```typescript
// Helper function
async function seedJournalEntries(page, count = 5) {
  await page.evaluate((n) => {
    const db = window.db; // Access Dexie instance

    const entries = Array.from({ length: n }, (_, i) => ({
      id: `test-entry-${i}`,
      title: `Test Entry ${i}`,
      direction: i % 2 === 0 ? 'long' : 'short',
      notes: `Test notes ${i}`,
      createdAt: Date.now() - i * 86400000 // Spread over days
    }));

    return db.journalEntries.bulkAdd(entries);
  }, count);
}

// Usage
test('filter journal by direction', async ({ page }) => {
  await seedJournalEntries(page, 10);

  await page.goto('/journal-v2');

  // Test filter
  await page.getByTestId('journal-direction-filter').selectOption('long');

  const items = page.getByTestId('journal-list-item');
  await expect(items).toHaveCount(5); // Half are long
});
```

---

## Common Playwright Patterns (Best Practices)

### ✅ DO: Use data-testid
```typescript
await page.getByTestId('save-button').click();
```

### ❌ DON'T: Use CSS selectors
```typescript
await page.locator('.btn-primary:first-child').click(); // FRAGILE
```

### ✅ DO: Wait for conditions
```typescript
await expect(page.getByTestId('dialog')).not.toBeVisible();
```

### ❌ DON'T: Use hard waits
```typescript
await page.waitForTimeout(500); // FLAKY
```

### ✅ DO: Scroll before click
```typescript
const button = page.getByTestId('submit');
await button.scrollIntoViewIfNeeded();
await button.click();
```

### ❌ DON'T: Assume visibility
```typescript
await page.getByTestId('submit').click(); // May be off-screen!
```

---

## Acceptance Criteria

✅ **Journal Flows**: Alle Tests grün, kein `test.skip()`
✅ **Replay E2E**: Suite unskipped, >3 Tests grün
✅ **Analyze Page**: Mocked API Tests grün
✅ **State Isolation**: `beforeEach` cleanup implementiert
✅ **No Flaky Tests**: 3 consecutive runs mit 100% pass rate
✅ `pnpm test:e2e` - Alle Tests grün in <5 Minuten

---

## Validation

```bash
# Run all E2E tests
pnpm test:e2e

# Run 3 times to check for flakiness
for i in {1..3}; do
  echo "Run $i/3"
  pnpm test:e2e || break
done

# Run specific suite
pnpm test:e2e tests/e2e/journal/journal.flows.spec.ts

# UI Mode (debugging)
pnpm test:e2e:ui
```

---

## Related

- Siehe: `.claude/memories/playwright-e2e-health.md` (E2E Guardrails)
- Siehe: `docs/tickets/replay-lab-todo.md` (F-06)
- **BLOCKER** für: R0 Launch

---

**Owner**: QA + Frontend Team
**Status**: 🟡 TEILWEISE ERLEDIGT (Replay/Journal Flows stabilisiert, Analyze-E2E noch offen)
**Deadline**: Woche 2 (Sprint 2)

---

## Abschluss
- [x] Analyze Page Basisflow mit Mock-Snapshot (`tests/e2e/analyze/analyze.page.spec.ts`)
- [x] Idea Packet erstellen/persistieren/bearbeiten über Notifications UI (`tests/e2e/ideas/idea-packets.spec.ts`)
- [ ] Replay Lab bleibt teil-offen (Mock-Feed weiter nötig)
