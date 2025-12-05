# AI Cost Guards & Budget Enforcement Tests

**Priorität**: 🔴 P0 BLOCKER
**Aufwand**: 1 Tag
**Dringlichkeit**: VOR PRODUCTION DEPLOYMENT
**Abhängigkeiten**: Keine

---

## Problem

AI-Features (Journal Insights, Bullet Analysis, Vision OCR) haben **Cost Guards im Code**, aber diese sind **NICHT GETESTET**.

**Risiken**:
- 💸 API Cost Overrun (OpenAI/Grok ohne Limit)
- 💸 Budget Cap wird nicht enforced
- 🔐 Secret Handling (401/503 Branches) ungetestet
- ⚡ Cache Hit Path nicht validiert

**Betroffene Files**:
- `api/ai/assist.ts` - AI Proxy mit Cost Guards
- `src/lib/ai/buildAdvancedInsight.ts` - Budget Tracking
- `src/hooks/useAdvancedInsight.ts` - Client-Side Budgets

---

## Cost Guard Logik (Aktueller Code)

### Backend: `api/ai/assist.ts`
```typescript
const MAX_COST_USD = parseFloat(process.env.AI_MAX_COST_USD || '10');

if (cumulativeCost > MAX_COST_USD) {
  return new Response(
    JSON.stringify({ error: 'Budget exceeded' }),
    { status: 429 }
  );
}
```

**UNGETESTET**:
- ❌ Budget Cap Rejection (429 Response)
- ❌ Cumulative Cost Tracking
- ❌ Per-User Budget Limits

### Cache Layer
```typescript
const cacheKey = hashRequest(prompt, model);
const cached = await cache.get(cacheKey);
if (cached) return cached;
```

**UNGETESTET**:
- ❌ Cache Hit → No API Call
- ❌ Cache Miss → API Call + Store

### Secret Enforcement
```typescript
if (!process.env.OPENAI_API_KEY) {
  return new Response('Missing API key', { status: 503 });
}
```

**UNGETESTET**:
- ❌ 503 wenn Secret fehlt
- ❌ 401 wenn Secret invalid

---

## Tasks

### Phase 1: Budget Enforcement Tests (3h)

#### Test 1: Budget Cap Rejection
```typescript
it('should reject request when budget exceeded', async () => {
  // Set budget cap
  process.env.AI_MAX_COST_USD = '5';

  // Mock cumulative cost tracker
  vi.spyOn(costTracker, 'getCurrent').mockReturnValue(5.50);

  const res = await fetch('/api/ai/assist', {
    method: 'POST',
    body: JSON.stringify({ prompt: 'Analyze this trade' })
  });

  expect(res.status).toBe(429);
  const data = await res.json();
  expect(data.error).toContain('Budget exceeded');
});
```

#### Test 2: Cumulative Cost Tracking
```typescript
it('should track cumulative cost across requests', async () => {
  const tracker = new CostTracker();

  // First request: $0.50
  await tracker.track({ tokens: 1000, model: 'gpt-4o-mini' });
  expect(tracker.getCurrent()).toBeCloseTo(0.50, 2);

  // Second request: +$0.30 = $0.80
  await tracker.track({ tokens: 600, model: 'gpt-4o-mini' });
  expect(tracker.getCurrent()).toBeCloseTo(0.80, 2);
});
```

#### Test 3: Per-User Budget Limits
```typescript
it('should enforce per-user budget limits', async () => {
  const userId = 'user-123';
  process.env.AI_MAX_COST_PER_USER = '2';

  // Seed user with $1.90 spent
  await seedUserCost(userId, 1.90);

  const res = await fetch('/api/ai/assist', {
    headers: { 'x-user-id': userId },
    body: JSON.stringify({
      prompt: 'Long prompt...',  // Costs ~$0.15
    })
  });

  expect(res.status).toBe(200); // Still under limit

  // Next request pushes over $2
  const res2 = await fetch('/api/ai/assist', {
    headers: { 'x-user-id': userId },
    body: JSON.stringify({ prompt: 'Another long prompt...' })
  });

  expect(res2.status).toBe(429); // Budget exceeded
});
```

---

### Phase 2: Cache Layer Tests (2h)

#### Test 1: Cache Hit Path (No API Call)
```typescript
it('should return cached response without API call', async () => {
  const prompt = 'Analyze SOL trade';
  const cachedResponse = { bullets: ['Point 1', 'Point 2'] };

  // Seed cache
  await cache.set(hashRequest(prompt), cachedResponse);

  const apiSpy = vi.spyOn(openai, 'createChatCompletion');

  const res = await fetch('/api/ai/assist', {
    method: 'POST',
    body: JSON.stringify({ prompt })
  });

  expect(res.status).toBe(200);
  expect(apiSpy).not.toHaveBeenCalled(); // No API call!

  const data = await res.json();
  expect(data).toEqual(cachedResponse);
});
```

#### Test 2: Cache Miss (API Call + Store)
```typescript
it('should call API and cache response on cache miss', async () => {
  const prompt = 'New unique prompt';

  const res = await fetch('/api/ai/assist', {
    method: 'POST',
    body: JSON.stringify({ prompt })
  });

  expect(res.status).toBe(200);

  // Check cache was populated
  const cached = await cache.get(hashRequest(prompt));
  expect(cached).toBeDefined();
});
```

---

### Phase 3: Secret Handling Tests (1h)

#### Test 1: Missing Secret (503)
```typescript
it('should return 503 when OPENAI_API_KEY missing', async () => {
  delete process.env.OPENAI_API_KEY;

  const res = await fetch('/api/ai/assist', {
    method: 'POST',
    body: JSON.stringify({ prompt: 'Test' })
  });

  expect(res.status).toBe(503);
  const data = await res.json();
  expect(data.error).toContain('Missing API key');
});
```

#### Test 2: Invalid Secret (401)
```typescript
it('should return 401 when API key is invalid', async () => {
  process.env.OPENAI_API_KEY = 'invalid-key';

  // Mock OpenAI API rejection
  vi.spyOn(openai, 'createChatCompletion').mockRejectedValue(
    new Error('Incorrect API key')
  );

  const res = await fetch('/api/ai/assist', {
    method: 'POST',
    body: JSON.stringify({ prompt: 'Test' })
  });

  expect(res.status).toBe(401);
});
```

---

### Phase 4: PII Sanitization (AI Condense) (2h)

#### Test 1: Phone Number Redaction
```typescript
it('should redact phone numbers from journal notes', async () => {
  const notesWithPhone = `
    Trade setup looks good.
    Contact me at +1-555-123-4567 for details.
  `;

  const res = await fetch('/api/ai/condense', {
    method: 'POST',
    body: JSON.stringify({ notes: notesWithPhone })
  });

  const data = await res.json();
  expect(data.condensed).toContain('[redacted-phone]');
  expect(data.condensed).not.toContain('555-123-4567');
});
```

#### Test 2: Email Redaction
```typescript
it('should redact email addresses', async () => {
  const notesWithEmail = 'Sent details to trader@example.com';

  const res = await fetch('/api/ai/condense', {
    method: 'POST',
    body: JSON.stringify({ notes: notesWithEmail })
  });

  const data = await res.json();
  expect(data.condensed).toContain('[redacted-email]');
  expect(data.condensed).not.toContain('trader@example.com');
});
```

#### Test 3: Latency Budget (<=350ms)
```typescript
it('should complete condense within 350ms', async () => {
  const startTime = Date.now();

  await fetch('/api/ai/condense', {
    method: 'POST',
    body: JSON.stringify({
      notes: 'Long trade notes here...'
    })
  });

  const duration = Date.now() - startTime;
  expect(duration).toBeLessThanOrEqual(350);
});
```

---

## Test Setup

### Environment Variables für Tests
```bash
# .env.test
AI_MAX_COST_USD=10
AI_MAX_COST_PER_USER=2
OPENAI_API_KEY=test-key-for-mocking
XAI_API_KEY=test-grok-key
```

### Mock OpenAI API
```typescript
// tests/mocks/openai.ts
import { vi } from 'vitest';

export const mockOpenAI = {
  createChatCompletion: vi.fn().mockResolvedValue({
    choices: [{ message: { content: 'Mock AI response' } }],
    usage: { total_tokens: 100 }
  })
};
```

---

## Acceptance Criteria

✅ Budget Cap Tests: 3 Tests (Global, Per-User, Tracking)
✅ Cache Layer Tests: 2 Tests (Hit, Miss)
✅ Secret Handling: 2 Tests (503, 401)
✅ PII Sanitization: 3 Tests (Phone, Email, Latency)
✅ `pnpm vitest --run --testNamePattern="ai cost"` → Alle grün
✅ Coverage für `api/ai/assist.ts` >80%

---

## Validation

```bash
# Run AI Cost Tests
pnpm vitest --run tests/api/ai-cost-guards.test.ts

# Check Coverage
pnpm vitest --coverage --testPathPattern="ai"

# Integration Test (Real API with $0.01 budget)
AI_MAX_COST_USD=0.01 pnpm vitest --run tests/integration/ai.test.ts
```

---

## Related

- Siehe: `docs/tickets/market-analyze-todo.md` (F-02 - AI Guardrails)
- Siehe: `docs/tickets/journal-workspace-todo.md` (F-04 - AI Condense Flow)
- **BLOCKER** für: Production Deployment

---

## Cost Monitoring (Post-Launch)

Nach Launch überwachen:
- Daily OpenAI/Grok Spend
- Top 10 User Costs
- Cache Hit Rate (Target: >60%)

---

**Owner**: Backend Team
**Status**: 🔴 KRITISCH - NICHT GESTARTET
**Deadline**: Vor Production Deploy (Woche 2)
