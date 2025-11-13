# Cursor Rules — Ops (Security + Deployment + AI)

> **Source:** `.rulesync/09-security.md` + `.rulesync/10-deployment.md` + `.rulesync/11-ai-integration.md`
>
> **Purpose:** Security best-practices, deployment process, and AI-integration patterns for ops/infrastructure work.

---

## Security

### Secrets-Management

**MUST:** Never expose secrets in client-bundle
```bash
# ✅ Good: Server-Side-Only (no VITE_ prefix)
MORALIS_API_KEY=sk-abc123...
OPENAI_API_KEY=sk-openai...

# ❌ Avoid: Client-Side-Expose (VITE_ prefix)
VITE_MORALIS_API_KEY=sk-abc123...  # In bundle!
```

**MUST:** Use Serverless-Proxies for API-calls
```ts
// Client calls proxy (no secret in client)
const response = await fetch('/api/moralis/token/SOL');

// Proxy adds secret server-side (api/moralis/[...path].ts)
const apiKey = process.env.MORALIS_API_KEY;
const moralisResponse = await fetch(`https://moralis.io/...`, {
  headers: { 'X-API-Key': apiKey },
});
```

### Input-Validation

**MUST:** Validate all user-inputs server-side
```ts
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { content } = req.body;

  if (!content || typeof content !== 'string' || content.length > 10000) {
    return res.status(400).json({ error: 'Invalid content' });
  }

  // Proceed...
}
```

### HTTPS-Only
```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "Strict-Transport-Security", "value": "max-age=63072000" }
      ]
    }
  ]
}
```

---

## Deployment

### Pre-Deployment-Checklist
```bash
# MUST run before every production-deploy
pnpm run typecheck   # TypeScript-check
pnpm run lint        # ESLint
pnpm test            # Vitest unit-tests
pnpm run build       # Build-test
pnpm run check:bundle-size  # Bundle-size-check
```

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

### Environment-Variables

**Setup in Vercel-Dashboard:**
```
Settings → Environment Variables

Production:
  MORALIS_API_KEY=sk-prod-...
  OPENAI_API_KEY=sk-prod-...

Preview (PR-Previews):
  MORALIS_API_KEY=sk-preview-...
  OPENAI_API_KEY=sk-preview-...
```

**Local-Development:**
```bash
# 1. Copy template
cp .env.example .env.local

# 2. Fill in secrets
MORALIS_API_KEY=YOUR_KEY_HERE
OPENAI_API_KEY=YOUR_KEY_HERE

# 3. Test
pnpm run dev
```

### Rollback-Strategy

**Instant-Rollback (Vercel):**
1. Vercel-Dashboard → Deployments
2. Select last-stable-deployment
3. "Promote to Production" (~5-10 seconds)

### Health-Check
```bash
# After deployment, verify:
curl https://sparkfined.app/api/health
curl https://sparkfined.app/sw.js
```

---

## AI-Integration

### Dual-Provider-Strategy
- **OpenAI (gpt-4o-mini):** Cheap (~$0.15/1M tokens), fast, for high-volume-tasks
- **Grok (xAI):** Expensive (~$5/1M tokens), crypto-native, for high-value-tasks

### Provider-Selection-Logic
```ts
// ai/orchestrator.ts
export function selectProvider(taskType: string): 'openai' | 'grok' {
  // High-value → Grok
  if (taskType === 'market-reasoning' || taskType === 'social-heuristics') {
    return 'grok';
  }

  // Standard → OpenAI
  return 'openai';
}
```

### Cost-Management

**MUST:** Enforce cost-limits
```ts
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

**MUST:** Use system + user-message pattern
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

### Error-Handling

**MUST:** Use retry-logic for AI-calls
```ts
import { withRetry } from '@/ai/retry';

const result = await withRetry(
  () => callAI({ prompt, provider: 'openai' }),
  { maxRetries: 3, baseDelay: 1000 }
);
```

### Response-Caching

**SHOULD:** Cache identical AI-requests
```ts
const cacheKey = hashTask(task);
const cached = cache.get(cacheKey);

if (cached && Date.now() - cached.timestamp < 3600_000) {  // 1h TTL
  return cached;
}

// Execute + cache result
```

---

## Related

- Full rules: `.rulesync/09-security.md`, `.rulesync/10-deployment.md`, `.rulesync/11-ai-integration.md`
