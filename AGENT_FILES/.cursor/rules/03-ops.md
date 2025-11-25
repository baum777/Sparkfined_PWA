Hier ist dein **aktualisiertes Regelwerk** für `03-ops.md`, leicht gestrafft, sprachlich konsistent (Englisch für Agent-Regeln) und mit ein paar Best-Practice-Klarstellungen für den Codex-AI-P0-Agenten.

Du kannst den Inhalt so in `.cursor/rules/03-ops.md` übernehmen:

````md
# Cursor Rules — Ops (Security + Deployment + AI)

> **Source:** `.rulesync/09-security.md` + `.rulesync/10-deployment.md` + `.rulesync/11-ai-integration.md`
>
> **Purpose:** Security best practices, deployment process, and AI-integration patterns for ops/infrastructure work.

---

## Security

### Secrets Management

**MUST:** Never expose secrets in the client bundle

```bash
# ✅ Good: Server-side-only (no VITE_ prefix)
MORALIS_API_KEY=sk-abc123...
OPENAI_API_KEY=sk-openai...

# ❌ Avoid: Client-side-exposed (VITE_ prefix)
VITE_MORALIS_API_KEY=sk-abc123...  # ends up in bundle
````

**MUST:** Use serverless proxies for API calls

```ts
// Client calls proxy (no secret in client)
const response = await fetch('/api/moralis/token/SOL');

// Proxy adds secret server-side (api/moralis/[...path].ts)
const apiKey = process.env.MORALIS_API_KEY;
const moralisResponse = await fetch(`https://moralis.io/...`, {
  headers: { 'X-API-Key': apiKey },
});
```

### Input Validation

**MUST:** Validate all user inputs server-side

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

### Pre-deployment checklist

```bash
# MUST run before every production deploy
pnpm run typecheck          # TypeScript check
pnpm run lint               # ESLint
pnpm test                   # Vitest unit tests
pnpm run build              # Build test
pnpm run check:bundle-size  # Bundle size check (if available)
```

### Vercel configuration

```json
// vercel.json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "regions": ["fra1"]  // Frankfurt (EU)
}
```

### Environment variables

**Setup in Vercel dashboard:**

```
Settings → Environment Variables

Production:
  MORALIS_API_KEY=sk-prod-...
  OPENAI_API_KEY=sk-prod-...

Preview (PR previews):
  MORALIS_API_KEY=sk-preview-...
  OPENAI_API_KEY=sk-preview-...
```

**Local development:**

```bash
# 1. Copy template
cp .env.example .env.local

# 2. Fill in secrets
MORALIS_API_KEY=YOUR_KEY_HERE
OPENAI_API_KEY=YOUR_KEY_HERE

# 3. Test
pnpm run dev
```

### Rollback strategy

**Instant rollback (Vercel):**

1. Vercel dashboard → Deployments
2. Select last stable deployment
3. “Promote to Production” (~5–10 seconds)

### Health check

```bash
# After deployment, verify:
curl https://sparkfined.app/api/health
curl https://sparkfined.app/sw.js
```

---

## AI Integration

### Dual-provider strategy

* **OpenAI (gpt-4o-mini):** cheap, fast, good for high-volume tasks.
* **Grok (xAI):** more expensive, crypto-native, reserved for high-value tasks.

### Provider selection logic

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

### Cost management

**MUST:** Enforce cost limits

```ts
const COST_LIMITS = {
  perRequest: 0.25,   // Max $0.25 per AI call
  perUser: 10.0,      // Max $10 per user/day (planned)
  total: 100.0,       // Max $100 total/day
};

export async function executeTask(task: AITask): Promise<AIResult> {
  const estimatedCost = estimateCost(task);

  if (estimatedCost > COST_LIMITS.perRequest) {
    throw new Error(`Cost limit exceeded: ${estimatedCost}`);
  }

  // Execute...
}
```

### Prompt design

**MUST:** Use system + user message pattern

```ts
const systemPrompt = await loadSystemPrompt('journal-condense');
const userPrompt = journalEntry.content;

const result = await callAI({
  messages: [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userPrompt },
  ],
  maxTokens: 500,  // Limit output to prevent cost explosion
});
```

### Error handling

**MUST:** Use retry logic for AI calls

```ts
import { withRetry } from '@/ai/retry';

const result = await withRetry(
  () => callAI({ prompt, provider: 'openai' }),
  { maxRetries: 3, baseDelay: 1000 }
);
```

### Response caching

**SHOULD:** Cache identical AI requests

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

* Full rules: `.rulesync/09-security.md`, `.rulesync/10-deployment.md`, `.rulesync/11-ai-integration.md`

---

## Ops Agents

### Agent: Codex – AI P0 Integration & Cleanup Agent

**Targets:** `codex`
**Patterns (conceptual scope):**

* `src/types/ai.ts`
* `src/types/index.ts`
* `src/lib/ai/**/*.{ts,tsx}`
* `docs/ai/**/*.md`
* `CODEX_HANDOVER_CHECKLIST.md`

#### Role & Focus

* You are Codex, a senior TypeScript/React engineer for the Sparkfined PWA.
* In these paths your focus is to:

  * Implement the P0 tasks from `CODEX_HANDOVER_CHECKLIST.md`,
  * Integrate AI types and heuristics cleanly,
  * Keep CI (lint/test/build/typecheck) stable and green.

#### Behaviour

When you work in these files/areas:

1. **Read & plan**

   * First, open (if they exist):

     * `CLEANUP_COMPLETE.md`
     * `REPO_CLEANUP_SUMMARY.md`
     * `REPO_CLEANUP_DECISIONS.md`
     * `REPO_CLEANUP_INVENTORY.md`
     * `CODEX_HANDOVER_CHECKLIST.md`
   * Extract the P0 tasks, especially:

     * Update legacy AI type imports → `@/types/ai` or `@/types`.
     * Wire `computeBotScore` into the social analysis flow.
     * Wire `sanityCheck` into the AI pipeline.
   * Write a short plan (3–7 bullet points) before proposing patches.

2. **Update imports**

   * Find all imports that still reference old AI type paths (`ai/types`, legacy `ai_types` paths, etc.).
   * Replace them minimally with `@/types/ai` or `@/types`, using the consolidated types in `src/types/ai.ts`.
   * Avoid unrelated refactors in the same files.

3. **Integrate `computeBotScore`**

   * Use `computeBotScore` from `src/lib/ai/heuristics/**`.
   * Integrate it into the social analysis flow (e.g. the `grok`/social endpoint or associated pipeline).
   * Attach the bot score to the social analysis response in a type-safe way, following the shapes defined in `src/types/ai.ts`.

4. **Integrate `sanityCheck`**

   * Use `sanityCheck` from `src/lib/ai/heuristics/**`.
   * Apply it in the AI orchestrator on generated bullets/insights before returning them.
   * Keep structures consistent with `AnalyzeMarketResult` and `AdvancedInsightCard` from `src/types/ai.ts`.

5. **Tests & CI in mind**

   * Prefer small, focused `apply_patch` blocks.
   * Ensure your changes are logically compatible with:

     * `pnpm run typecheck`
     * `pnpm run lint`
     * `pnpm test`
     * `pnpm run build`
   * Update or add tests only where necessary to confirm the new integration points (botScore, sanityCheck) are exercised.

6. **Constraints**

   * Do **not** change the rules/agent system itself (.rulesync, `.cursor/rules`, `AGENTS.md`).
   * Do **not** introduce large refactors or new features outside the defined P0 tasks.
   * Explain each patch group in 1–2 sentences (what changed and why).
   * Follow existing coding style and TypeScript strictness.

```

::contentReference[oaicite:0]{index=0}
```
