---
mode: SYSTEM
id: "11-ai-integration"
priority: 2
version: "0.1.0"
last_review: "2025-11-12"
targets: ["cursor", "claudecode", "codex"]
globs: ["ai/**/*.ts", "api/ai/**/*.ts", "src/state/ai-provider.tsx"]
description: "AI orchestration architecture, prompt design, cost management, and OpenAI/Grok integration patterns"
---

# 11 – AI Integration & Orchestration

## 1. AI-Provider-Overview

Sparkfined nutzt **Dual-AI-Architecture** für verschiedene Use-Cases:

### Provider-Matrix

| Provider | Modell | Use-Case | Cost | Latency |
|----------|--------|----------|------|---------|
| **OpenAI** | `gpt-4o-mini` | Journal-Condense, Bullet-Analysis, Quick-Summaries | ~$0.15/1M tok | ~500-800ms |
| **xAI** | `grok-beta` | Market-Reasoning, Social-Heuristics, Meme-Analysis | ~$5/1M tok | ~1-2s |

**Rationale:**

- **OpenAI (gpt-4o-mini):** Cost-Efficient, fast, gut für strukturierte Tasks (Markdown-Output, Summaries)
- **Grok (xAI):** Spezialisiert auf Crypto/Trading-Context, aber teurer → nur für High-Value-Tasks

### Provider-Selection-Logic

```ts
// ai/orchestrator.ts
export async function selectProvider(task: AITask): Promise<'openai' | 'grok'> {
  // High-Value-Tasks → Grok (trotz höherer Kosten)
  if (task.type === 'market-reasoning' || task.type === 'social-heuristics') {
    return 'grok';
  }

  // Standard-Tasks → OpenAI (Cost-Efficient)
  if (task.type === 'journal-condense' || task.type === 'bullet-analysis') {
    return 'openai';
  }

  // Default: OpenAI
  return 'openai';
}
```

---

## 2. Architecture-Patterns

### Orchestrator-Layer

```
┌───────────────────────────────────────────────────────┐
│ React-UI (Chat-Component, Journal-Condense-Button)   │
└────────────────────────┬──────────────────────────────┘
                         │
┌────────────────────────▼──────────────────────────────┐
│ AI-Provider-State (React-Context, Zustand)           │
│ - assistChat() → Orchestrator                        │
│ - condenseJournalEntry() → Orchestrator              │
└────────────────────────┬──────────────────────────────┘
                         │
┌────────────────────────▼──────────────────────────────┐
│ AI-Orchestrator (ai/orchestrator.ts)                 │
│ - Task-Queue, Cost-Budget, Provider-Selection        │
└────────────────────────┬──────────────────────────────┘
                         │
        ┌────────────────┴────────────────┐
        │                                 │
┌───────▼──────────┐           ┌─────────▼────────┐
│ OpenAI-Client    │           │ Grok-Client      │
│ (model_clients)  │           │ (model_clients)  │
└───────┬──────────┘           └─────────┬────────┘
        │                                 │
┌───────▼──────────┐           ┌─────────▼────────┐
│ Serverless-Proxy │           │ Serverless-Proxy │
│ /api/ai/openai   │           │ /api/ai/grok     │
└───────┬──────────┘           └─────────┬────────┘
        │                                 │
┌───────▼──────────────────────────────────▼────────┐
│ External-APIs (api.openai.com, api.x.ai)        │
└──────────────────────────────────────────────────┘
```

**Key-Components:**

1. **AI-Provider-State:** React-Context + Zustand-Store, exposed via `useAIProvider()`
2. **AI-Orchestrator:** Task-Queue, Cost-Budget, Retry-Logic, Provider-Selection
3. **Model-Clients:** OpenAI/Grok-Wrapper (Prompt-Loading, Request-Building, Response-Parsing)
4. **Serverless-Proxies:** Vercel-Edge-Functions, Secret-Management, Rate-Limiting

---

## 3. Prompt-Design

### Prompt-Structure

**[MUST]** Nutze System + User-Message-Pattern

```ts
// ai/orchestrator.ts
export async function buildPrompt(task: AITask): Promise<Prompt> {
  const systemPrompt = await loadSystemPrompt(task.type);
  const userPrompt = task.input;

  return {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt },
    ],
  };
}
```

### Prompt-Files

**Location:** `ai/prompts/*.md`

**Example: Journal-Condense**

```markdown
<!-- ai/prompts/journal-condense.md -->
You are an expert trading journal assistant.

**Task:** Condense the user's raw journal entry into a structured summary.

**Output-Format (Markdown):**

## Summary
- 1-2 sentence overview

## Key-Insights
- Bullet-point list of actionable insights

## Mistakes
- List of identified mistakes or lessons

**Constraints:**
- Max 300 words
- Focus on actionable insights
- No generic advice
```

**[SHOULD]** Verwende Prompt-Loader für Wiederverwendbarkeit

```ts
// ai/promptLoader.ts
export async function loadSystemPrompt(type: string): Promise<string> {
  const promptPath = `ai/prompts/${type}.md`;
  const response = await fetch(promptPath);

  if (!response.ok) {
    throw new Error(`Prompt not found: ${type}`);
  }

  return await response.text();
}
```

### Prompt-Best-Practices

**[MUST]**

- Klare Task-Definition im System-Prompt
- Explizites Output-Format (Markdown, JSON, plain-text)
- Constraints (Max-Länge, Fokus, Verbote)

**[SHOULD]**

- Few-Shot-Examples für komplexe Tasks
- Chain-of-Thought-Prompts für Reasoning-Tasks (Grok)
- Fallback-Instructions bei unklaren Inputs

**[MUST NOT]**

- Keine Secrets im Prompt (API-Keys, User-Daten)
- Keine unbeschränkte Output-Länge (Cost-Explosion)
- Keine unvalidierten User-Inputs (Injection-Risk)

---

## 4. Cost-Management

### Cost-Budget

**[MUST]** Implementiere Per-Request-Cost-Limit

```ts
// ai/orchestrator.ts
const COST_LIMITS = {
  perRequest: 0.25,  // Max $0.25 per AI-Call
  perUser: 10.0,     // Max $10 per User/Day (geplant)
  total: 100.0,      // Max $100 Total/Day
};

export async function executeTask(task: AITask): Promise<AIResult> {
  const estimatedCost = estimateCost(task);

  if (estimatedCost > COST_LIMITS.perRequest) {
    throw new Error(`Cost-Limit exceeded: ${estimatedCost} > ${COST_LIMITS.perRequest}`);
  }

  // ... execute task
}
```

### Cost-Estimation

```ts
// ai/orchestrator.ts
export function estimateCost(task: AITask): number {
  const inputTokens = countTokens(task.input);
  const estimatedOutputTokens = task.maxTokens || 500;

  const provider = task.provider || 'openai';

  // OpenAI gpt-4o-mini: $0.15/1M input, $0.60/1M output
  // Grok: $5/1M input, $15/1M output
  const rates = {
    openai: { input: 0.15 / 1_000_000, output: 0.60 / 1_000_000 },
    grok: { input: 5 / 1_000_000, output: 15 / 1_000_000 },
  };

  const rate = rates[provider];

  return (inputTokens * rate.input) + (estimatedOutputTokens * rate.output);
}
```

### Cost-Tracking

**[SHOULD]** Logge AI-Calls mit Cost-Metrics

```ts
// ai/orchestrator.ts
export async function trackAICall(task: AITask, result: AIResult) {
  const cost = result.usage 
    ? calculateActualCost(result.usage, task.provider)
    : estimateCost(task);

  console.log('[AI-Cost]', {
    type: task.type,
    provider: task.provider,
    tokens: result.usage,
    cost: cost.toFixed(4),
  });

  // In Production: Send to Analytics/DB
  if (import.meta.env.PROD) {
    // await logToDatabase({ task, cost, timestamp: Date.now() });
  }
}
```

---

## 5. Error-Handling & Retry

### Retry-Logic

**[MUST]** Nutze Exponential-Backoff für transiente Fehler

```ts
// ai/retry.ts
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const maxRetries = options.maxRetries || 3;
  const baseDelay = options.baseDelay || 1000;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isLastAttempt = attempt === maxRetries - 1;

      // Non-Retriable-Errors (z.B. 400 Bad Request)
      if (isNonRetriable(error)) {
        throw error;
      }

      if (isLastAttempt) {
        throw error;
      }

      // Exponential-Backoff + Jitter
      const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
      await sleep(delay);
    }
  }

  throw new Error('Retry-Limit exceeded');
}

function isNonRetriable(error: any): boolean {
  const status = error?.response?.status;
  return status === 400 || status === 401 || status === 403;
}
```

### Graceful-Degradation

**[SHOULD]** Fallback bei AI-Unavailability

```ts
// src/state/ai-provider.tsx
export async function assistChat(message: string): Promise<string> {
  try {
    const result = await orchestrator.executeTask({
      type: 'chat',
      input: message,
      provider: 'openai',
    });

    return result.output;
  } catch (error) {
    console.error('[AI] Chat failed:', error);

    // Fallback: Statische Antwort statt Error-Screen
    return "Ich bin gerade nicht verfügbar. Bitte versuche es später erneut.";
  }
}
```

---

## 6. Caching & Deduplication

### Response-Caching

**[SHOULD]** Cache identische AI-Requests

```ts
// ai/orchestrator.ts
const cache = new Map<string, AIResult>();

export async function executeTask(task: AITask): Promise<AIResult> {
  const cacheKey = hashTask(task);

  // Check Cache
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < 3600_000) {  // 1h TTL
    console.log('[AI-Cache] Hit:', cacheKey);
    return cached;
  }

  // Execute Task
  const result = await callAI(task);

  // Store in Cache
  cache.set(cacheKey, { ...result, timestamp: Date.now() });

  return result;
}

function hashTask(task: AITask): string {
  return JSON.stringify({ type: task.type, input: task.input });
}
```

### Request-Deduplication

**[SHOULD]** Verhindere duplicate in-flight-requests

```ts
// ai/orchestrator.ts
const inFlight = new Map<string, Promise<AIResult>>();

export async function executeTask(task: AITask): Promise<AIResult> {
  const key = hashTask(task);

  // Check if already in-flight
  if (inFlight.has(key)) {
    console.log('[AI-Dedup] Waiting for in-flight request:', key);
    return await inFlight.get(key)!;
  }

  // Start new request
  const promise = callAI(task);
  inFlight.set(key, promise);

  try {
    const result = await promise;
    return result;
  } finally {
    inFlight.delete(key);
  }
}
```

---

## 7. Rate-Limiting

### Client-Side-Throttling

**[MUST]** Limit AI-Calls per User

```ts
// ai/orchestrator.ts
import { RateLimiter } from '@/lib/net/RateLimiter';

const aiLimiter = new RateLimiter(10, 60_000);  // 10 requests/minute

export async function executeTask(task: AITask): Promise<AIResult> {
  await aiLimiter.acquire();  // Throws if limit exceeded

  return await callAI(task);
}
```

### Server-Side-Rate-Limiting (Geplant)

**[FUTURE]** Vercel-Edge-Middleware für IP-based-Rate-Limiting

```ts
// api/ai/middleware.ts (geplant)
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, '1 h'),  // 20 requests/hour
});

export async function checkRateLimit(req: VercelRequest): Promise<boolean> {
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  const { success } = await ratelimit.limit(ip);

  return success;
}
```

---

## 8. Telemetry

### AI-Event-Logging

**[SHOULD]** Track AI-Calls für Analytics

```ts
// src/state/ai-provider.tsx
export async function assistChat(message: string): Promise<string> {
  const startTime = performance.now();

  try {
    const result = await orchestrator.executeTask({
      type: 'chat',
      input: message,
      provider: 'openai',
    });

    // Log Success
    trackEvent('ai_assist_success', {
      provider: 'openai',
      latency: performance.now() - startTime,
      tokens: result.usage?.total_tokens,
    });

    return result.output;
  } catch (error) {
    // Log Error
    trackEvent('ai_assist_error', {
      provider: 'openai',
      error: error.message,
      latency: performance.now() - startTime,
    });

    throw error;
  }
}
```

### Telemetry-Events

**AI-Related-Events (siehe `events/` Directory):**

- `ai_assist_invoked` – User startet AI-Chat
- `ai_assist_success` – AI-Response erfolgreich
- `ai_assist_error` – AI-Call failed
- `journal_condense_ai` – Journal-Entry via AI kondensiert
- `bullet_analyze_ai` – Bullet-Points via AI analysiert

**Schema-Location:** `telemetry_output/schemas/ai_assist_invoked.json`

---

## 9. Examples

### ✅ Good – AI-Orchestrator-Usage

```tsx
// src/components/ChatAssist.tsx
import { useAIProvider } from '@/state/ai-provider';

export function ChatAssist() {
  const { assistChat, isLoading } = useAIProvider();

  const handleSend = async (message: string) => {
    try {
      const response = await assistChat(message);
      console.log('[AI]', response);
    } catch (error) {
      console.error('[AI] Chat failed:', error);
      // Fallback-UI: "AI nicht verfügbar"
    }
  };

  return (
    <div>
      <input onSubmit={handleSend} disabled={isLoading} />
      {isLoading && <Spinner />}
    </div>
  );
}
```

### ✅ Good – Serverless-AI-Proxy

```ts
// api/ai/openai.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Method-Check
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Auth-Check (Proxy-Secret)
  const proxySecret = req.headers['x-proxy-secret'];

  if (proxySecret !== process.env.AI_PROXY_SECRET) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // 3. Input-Validation
  const { messages, maxTokens = 500 } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid messages' });
  }

  // 4. Call OpenAI (mit Secret aus Env)
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages,
        max_tokens: maxTokens,
      }),
    });

    const data = await response.json();

    return res.status(200).json({
      output: data.choices[0].message.content,
      usage: data.usage,
    });
  } catch (error) {
    console.error('[AI] OpenAI call failed:', error);
    return res.status(500).json({ error: 'AI request failed' });
  }
}
```

### ❌ Avoid – AI-Anti-Patterns

```ts
// ❌ Bad: Direct-API-Call mit Secret im Client
const OPENAI_KEY = import.meta.env.VITE_OPENAI_KEY;  // Im Bundle sichtbar!
fetch('https://api.openai.com/...', { headers: { 'Authorization': `Bearer ${OPENAI_KEY}` } });

// ❌ Bad: Keine Cost-Limit
const result = await callAI({ maxTokens: 10000 });  // Potenzielle Cost-Explosion!

// ❌ Bad: Keine Error-Handling
const response = await assistChat(message);  // Crashes bei Network-Error

// ❌ Bad: Unbeschränkter User-Input
const prompt = `Analyze this: ${userInput}`;  // Prompt-Injection-Risk!
await callAI({ input: prompt });

// ❌ Bad: Keine Rate-Limiting
for (let i = 0; i < 1000; i++) {
  await assistChat('test');  // API-Spam → Cost-Explosion
}
```

---

## 10. Testing

### Mock-AI-Responses

**[SHOULD]** Mocke AI-Calls in Tests

```ts
// tests/mocks/ai.ts
export const mockAIOrchestrator = {
  executeTask: vi.fn(async (task: AITask) => ({
    output: `Mock-Response for ${task.type}`,
    usage: { total_tokens: 100, prompt_tokens: 50, completion_tokens: 50 },
  })),
};

// Usage in Test
import { mockAIOrchestrator } from '../mocks/ai';

test('assistChat calls orchestrator', async () => {
  const result = await assistChat('test');
  expect(mockAIOrchestrator.executeTask).toHaveBeenCalledWith({
    type: 'chat',
    input: 'test',
    provider: 'openai',
  });
});
```

### E2E-AI-Tests (Geplant)

**[FUTURE]** Integration-Test mit echten AI-Providers (Staging)

```ts
// tests/e2e/ai.spec.ts
import { test, expect } from '@playwright/test';

test('AI-Chat responds to user message', async ({ page }) => {
  await page.goto('/');

  // Open AI-Chat
  await page.click('[data-testid="ai-chat-button"]');

  // Send Message
  await page.fill('[data-testid="ai-chat-input"]', 'What is RSI?');
  await page.click('[data-testid="ai-chat-send"]');

  // Wait for Response
  await expect(page.locator('[data-testid="ai-chat-response"]')).toContainText('RSI');
});
```

---

## Related

- `ai/README_AI.md` – AI-Orchestrator-Documentation
- `ai/orchestrator.ts` – Task-Queue, Cost-Budget, Provider-Selection
- `ai/model_clients/` – OpenAI/Grok-Wrapper
- `ai/prompts/` – System-Prompts (Markdown)
- `09-security.md` – Secret-Management, Proxy-Pattern
- `05-api-integration.md` – Serverless-API-Patterns

---

## Revision History

- **2025-11-12:** Initial creation, Phase 3 Batch 4 (AI-Orchestrator, Prompt-Design, Cost-Management)
