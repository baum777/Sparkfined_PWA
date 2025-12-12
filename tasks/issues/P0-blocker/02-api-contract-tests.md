# API Contract Tests für Backend Endpoints

**Priorität**: 🔴 P0 BLOCKER
**Aufwand**: 2-3 Tage
**Dringlichkeit**: SOFORT
**Abhängigkeiten**: Keine

---

## Problem

Kritische Backend-Endpoints haben **KEINE Contract-Tests**:
- `/api/journal` - Journal CRUD & Metric Normalization
- `/api/rules` - Alert Rule Management
- `/api/ideas` - Idea Packet Creation

## Checkliste (Repo-Abgleich – Stand: 2025-12-12)

- [x] Journal-API-Verträge abgedeckt – `tests/api/journal.api.test.ts` und `journal.contract.test.ts` prüfen CRUD, PnL-Normalisierung, Query-Filter und Migration.
- [x] Rules-API getestet – `tests/api/rules.api.test.ts`, `rules.contract.test.ts` und `rules.eval.test.ts` validieren Payload-Validation, Trigger-Evaluierung und Fehlerpfade.
- [x] Ideas-API vollständig – `tests/api/ideas.api.test.ts`, `ideas.contract.test.ts` und `ideas.one-click-packet.test.ts` decken Create/Update mit Journal- und Rule-Linking ab.
- [x] Push- und Cost-Guards mit abgedeckt – Suite nutzt `tests/api/setup.ts` für env/bootstrap, sodass API-Routen im CI lauffähig sind.

## Zusätzliche Beobachtungen aus dem Code

- API-Routen liegen unter `api/` (z. B. `api/journal/index.ts`, `api/rules/index.ts`), nutzen gemeinsam `lib/withApiHandler` und sind in Tests mit Mocks für externe Provider verdrahtet.

## Nächste Schritte aus Repo-Sicht

- Bei neuen Feldern in Journal/Ideas/Rules die Contract-Snapshots erweitern.
- Smoke-E2E für zentrale Flows (`tests/e2e/journal/journal-crud.spec.ts`, `tests/e2e/alerts/alerts-crud.spec.ts`) als Regressionsschutz in den Task aufnehmen.

**Risiken**:
- Breaking Changes unbemerkt deployed
- Payload Validation fehlt
- Metric Recomputation nicht validiert
- Error Handling ungetestet

---

## Betroffene Endpoints

### 1. `/api/journal` (KRITISCH)
```typescript
POST /api/journal       // Create journal entry
PUT /api/journal/:id    // Update entry + recompute metrics
DELETE /api/journal/:id // Delete entry
GET /api/journal        // List entries
```

**Ungetestet**:
- Mixed numeric strings in notes (z.B. "bought at $0.05")
- Metric Recomputation (PnL, RR, Win Rate)
- Server Sync nach Save
- AI Attach Toggle Persistenz

### 2. `/api/rules` (KRITISCH)
```typescript
POST /api/rules         // Create alert rule
PUT /api/rules/:id      // Update rule
DELETE /api/rules/:id   // Delete rule
GET /api/rules/eval     // Evaluate rules (cron)
```

**Ungetestet**:
- Rule Validation (missing fields, invalid operators)
- Condition Parsing (price > $100, volume spike)
- Cron Evaluation Logic

### 3. `/api/ideas` (WICHTIG)
```typescript
POST /api/ideas         // Create idea packet
PUT /api/ideas/:id      // Update idea + link to journal/rules
```

**Ungetestet**:
- Idea → Journal Link
- Idea → Rule Link
- One-Click Packet Creation

---

## Tasks

### Phase 1: `/api/journal` Tests (1 Tag)

#### Test 1: Create Journal Entry
```typescript
it('POST /api/journal - should create entry with valid payload', async () => {
  const payload = {
    title: 'SOL Long Trade',
    direction: 'long',
    notes: 'Entry at $95.50',
    tags: ['breakout', 'trend']
  };

  const res = await fetch('/api/journal', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  expect(res.status).toBe(201);
  const data = await res.json();
  expect(data.id).toBeDefined();
  expect(data.title).toBe(payload.title);
});
```

#### Test 2: Update Entry & Recompute Metrics
```typescript
it('PUT /api/journal/:id - should recompute PnL metrics', async () => {
  const entryId = 'test-entry-123';

  const updatePayload = {
    entryPrice: 95.50,
    exitPrice: 102.30,
    size: 100
  };

  const res = await fetch(`/api/journal/${entryId}`, {
    method: 'PUT',
    body: JSON.stringify(updatePayload)
  });

  const data = await res.json();
  expect(data.pnl).toBeCloseTo(680); // (102.30 - 95.50) * 100
  expect(data.winRate).toBeDefined();
});
```

#### Test 3: Delete Entry
```typescript
it('DELETE /api/journal/:id - should return 200 OK', async () => {
  const res = await fetch('/api/journal/test-entry-123', {
    method: 'DELETE'
  });

  expect(res.status).toBe(200);
});
```

#### Test 4: Numeric String Parsing
```typescript
it('should parse mixed numeric strings in notes', async () => {
  const payload = {
    title: 'Test',
    notes: 'bought at $0.05, sold at 0.08'
  };

  const res = await fetch('/api/journal', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  // Should extract prices from notes
  expect(data.parsedEntry).toBeDefined();
  expect(data.parsedExit).toBeDefined();
});
```

---

### Phase 2: `/api/rules` Tests (1 Tag)

#### Test 1: Create Rule with Validation
```typescript
it('POST /api/rules - should validate required fields', async () => {
  const invalidPayload = {
    // Missing 'symbol' field
    condition: 'price > 100'
  };

  const res = await fetch('/api/rules', {
    method: 'POST',
    body: JSON.stringify(invalidPayload)
  });

  expect(res.status).toBe(400);
  const error = await res.json();
  expect(error.message).toContain('symbol is required');
});
```

#### Test 2: Rule Evaluation (Cron)
```typescript
it('GET /api/rules/eval - should evaluate active rules', async () => {
  // Seed rules in DB
  await seedRules([
    { symbol: 'SOL', condition: 'price > 100', active: true },
    { symbol: 'BTC', condition: 'volume > 1M', active: false }
  ]);

  const res = await fetch('/api/rules/eval');
  const data = await res.json();

  expect(data.evaluated).toBe(1); // Only active rule
  expect(data.triggered).toHaveLength(0); // No triggers
});
```

---

### Phase 3: `/api/ideas` Tests (1 Tag)

#### Test 1: Create Idea Packet
```typescript
it('POST /api/ideas - should create idea with journal link', async () => {
  const payload = {
    title: 'SOL Breakout Setup',
    description: 'Bullish flag pattern on 4H',
    linkedJournalId: 'journal-123',
    linkedRuleId: 'rule-456'
  };

  const res = await fetch('/api/ideas', {
    method: 'POST',
    body: JSON.stringify(payload)
  });

  expect(res.status).toBe(201);
  const data = await res.json();
  expect(data.linkedJournalId).toBe(payload.linkedJournalId);
});
```

#### Test 2: One-Click Packet
```typescript
it('should create journal + rule + idea in one request', async () => {
  const packetPayload = {
    mode: 'one-click-packet',
    symbol: 'SOL',
    setup: 'breakout',
    entry: 95.50,
    stop: 92.00,
    target: 105.00
  };

  const res = await fetch('/api/ideas', {
    method: 'POST',
    body: JSON.stringify(packetPayload)
  });

  const data = await res.json();
  expect(data.journalId).toBeDefined();
  expect(data.ruleId).toBeDefined();
  expect(data.ideaId).toBeDefined();
});
```

---

## Test Setup

### Vitest Config (MSW Mocking)
```typescript
// tests/api/setup.ts
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export const server = setupServer(
  http.post('/api/journal', async ({ request }) => {
    const body = await request.json();
    // Mock response
    return HttpResponse.json({ id: 'mock-id', ...body });
  })
);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
```

---

## Acceptance Criteria

✅ `/api/journal` - 5+ Contract Tests (Create, Update, Delete, Metrics, Parsing)
✅ `/api/rules` - 4+ Contract Tests (CRUD, Validation, Eval)
✅ `/api/ideas` - 3+ Contract Tests (Create, Link, One-Click)
✅ `pnpm test` - Alle API Tests grün
✅ Error Cases abgedeckt (400, 401, 500)

---

## Validation

```bash
# Run API Tests
pnpm vitest --run tests/api/

# Check Coverage
pnpm vitest --coverage --testPathPattern="api"

# Typecheck
pnpm typecheck
```

---

## Related

- Siehe: `docs/tickets/market-analyze-todo.md` (F-02)
- Siehe: `docs/tickets/journal-workspace-todo.md` (F-04)
- Blocker für: R0 Launch

---

**Owner**: Backend Team
**Status**: ✅ DONE (siehe `tests/api/*.contract.test.ts`, `tests/api/*.api.test.ts`)
**Deadline**: Woche 1 (Sprint 1)
