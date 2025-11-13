---
mode: SYSTEM
id: "09-security"
priority: 2
version: "0.1.0"
last_review: "2025-11-12"
targets: ["cursor", "claudecode", "codex"]
globs: ["api/**/*.ts", "src/**/*.ts", "vercel.json", ".env.example"]
description: "Security standards: secrets management, authentication, secure defaults, and threat mitigation for Sparkfined"
---

# 09 – Security & Secrets

## 1. Threat Model (Kurz)

Sparkfined operiert in einem **vertrauenswürdigen, aber öffentlich zugänglichen Kontext**:

### Primäre Bedrohungen

1. **API-Key-Leaks:** Moralis/DexPaprika/OpenAI-Keys im Client-Bundle → Missbrauch, Cost-Explosion
2. **Wallet-Private-Key-Exposure:** User-Seeds im LocalStorage → Wallet-Drain
3. **XSS (Cross-Site-Scripting):** Injection via Journal-Content → Session-Hijack
4. **CSRF (Cross-Site-Request-Forgery):** Unauthorized-Actions via gefälschte Requests
5. **Rate-Limit-Abuse:** Spam auf AI-Endpoints → Cost-Explosion
6. **Solana-Transaction-Manipulation:** Man-in-the-Middle bei Wallet-Signaturen

### Risiko-Assessment

| Bedrohung | Wahrscheinlichkeit | Impact | Mitigation-Status |
|-----------|-------------------|--------|-------------------|
| API-Key-Leak | Mittel | Hoch (Cost) | ✅ Serverless-Proxy |
| Wallet-Private-Key-Exposure | Niedrig | Kritisch (Funds) | ⚠️ Keine Private-Keys gespeichert (Mock-Wallet) |
| XSS | Niedrig | Mittel | ✅ React-Auto-Escaping, CSP geplant |
| CSRF | Niedrig | Mittel | ⚠️ Keine CSRF-Tokens (Stateless-API) |
| Rate-Limit-Abuse | Mittel | Hoch (Cost) | ⚠️ Client-Side-Throttling, Server-Side geplant |
| Solana-Transaction-Manipulation | Niedrig | Hoch | 🔮 On-Chain-Verification geplant |

---

## 2. Secrets Management

### Environment-Variables

**[MUST]** Secrets niemals im Client-Bundle exposen

```bash
# ✅ Good: Server-Side-Only (kein VITE_ Prefix)
MORALIS_API_KEY=sk-abc123...
DEXPAPRIKA_API_KEY=dp-xyz789...
OPENAI_API_KEY=sk-openai...
ANTHROPIC_API_KEY=sk-ant...
DATA_PROXY_SECRET=random-secret-xyz

# ❌ Avoid: Client-Side-Expose (VITE_ Prefix)
VITE_MORALIS_API_KEY=sk-abc123...  # Im Bundle sichtbar!
```

**[MUST]** Nutze Serverless-Proxies für API-Calls mit Secrets

```ts
// ✅ Good: Secret bleibt Server-Side
// api/moralis/[...path].ts
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const apiKey = process.env.MORALIS_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API not configured' });
  }

  const moralisUrl = `https://deep-index.moralis.io/api/v2.2${req.url}`;
  const response = await fetch(moralisUrl, {
    headers: { 'X-API-Key': apiKey },  // Secret bleibt im Backend
  });

  return res.status(response.status).json(await response.json());
}

// ❌ Avoid: Client-Side-API-Call mit Secret
const MORALIS_KEY = import.meta.env.VITE_MORALIS_API_KEY;  // Im Bundle!
fetch('https://moralis.io/...', { headers: { 'X-API-Key': MORALIS_KEY } });
```

### .env.example Template

**[MUST]** Pflege `.env.example` mit Placeholder-Werten

```bash
# .env.example (committed to repo)

# === Data Providers (Server-Side) ===
MORALIS_API_KEY=YOUR_MORALIS_KEY_HERE
MORALIS_BASE_URL=https://deep-index.moralis.io/api/v2.2
DEXPAPRIKA_API_KEY=YOUR_DEXPAPRIKA_KEY_HERE
DEXPAPRIKA_BASE=https://api.dexpaprika.com

# === AI Providers (Server-Side) ===
OPENAI_API_KEY=sk-YOUR_OPENAI_KEY_HERE
XAI_API_KEY=xai-YOUR_GROK_KEY_HERE
AI_MAX_COST_USD=0.25
AI_CACHE_TTL_SEC=3600

# === Security (Server-Side) ===
DATA_PROXY_SECRET=CHANGE_ME_FOR_DATA_PROXY
AI_PROXY_SECRET=CHANGE_ME_FOR_AI_PROXY
MORALIS_WEBHOOK_SECRET=CHANGE_ME_FOR_MORALIS_WEBHOOK

# === Client-Side (VITE_ Prefix) ===
VITE_APP_VERSION=1.0.0-beta
VITE_SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

**[MUST NOT]** Committe echte `.env.local` ins Repo

```bash
# .gitignore
.env.local
.env.production
.env.*.local
```

### Secret-Rotation

**[SHOULD]** Rotiere Secrets regelmäßig (alle 90 Tage)

```bash
# Secret-Rotation-Checklist (manuell, alle 90 Tage)
☐ Generiere neue API-Keys bei Providern (Moralis, DexPaprika, OpenAI)
☐ Update Vercel-Environment-Variables (Production, Preview, Development)
☐ Update lokale .env.local
☐ Teste alle API-Endpoints nach Rotation
☐ Dokumentiere Rotation-Datum in CHANGELOG
```

---

## 3. Auth & Permissions

### Access-Gating (Wallet-Based)

**Aktuell: Mock-Wallet (kein echtes On-Chain-Auth)**

```ts
// src/store/accessStore.tsx (Mock-Implementation)
export const useAccessStore = create<AccessState>((set) => ({
  status: null,
  
  checkAccess: async () => {
    // Mock: Simuliert NFT-Check
    const mockStatus: AccessStatus = {
      hasAccess: true,
      tier: 'premium',
      expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,  // 30 days
    };
    set({ status: mockStatus });
  },
}));
```

**[FUTURE]** On-Chain-Verification (geplant Q1 2025)

```ts
// Geplant: Solana-Wallet-Adapter + On-Chain-NFT-Check
import { useWallet } from '@solana/wallet-adapter-react';

export async function checkNFTOwnership(walletAddress: string): Promise<boolean> {
  const response = await fetch('/api/access/verify', {
    method: 'POST',
    body: JSON.stringify({ walletAddress }),
  });

  const { hasNFT } = await response.json();
  return hasNFT;
}
```

### Protected-Routes

**[SHOULD]** Implementiere Client-Side-Route-Guards

```tsx
// src/components/ProtectedRoute.tsx
import { Navigate } from 'react-router-dom';
import { useAccessStore } from '@/store/accessStore';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { status } = useAccessStore();

  if (!status?.hasAccess) {
    return <Navigate to="/access" replace />;
  }

  return <>{children}</>;
}

// Usage in Routes
<Route
  path="/signals"
  element={
    <ProtectedRoute>
      <SignalsPage />
    </ProtectedRoute>
  }
/>
```

**[MUST]** Server-Side-Validation für kritische Endpoints

```ts
// api/signals/create.ts
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Check Access-Token (z.B. JWT oder Wallet-Signature)
  const accessToken = req.headers['x-access-token'];

  if (!accessToken) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // 2. Validate Token (via Database oder On-Chain)
  const isValid = await validateAccessToken(accessToken);

  if (!isValid) {
    return res.status(403).json({ error: 'Access denied' });
  }

  // 3. Proceed with business logic
  // ...
}
```

---

## 4. Secure Defaults

### HTTPS-Only

**[MUST]** Erzwinge HTTPS in Production

```json
// vercel.json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=63072000; includeSubDomains; preload"
        }
      ]
    }
  ]
}
```

**[MUST]** Redirect HTTP zu HTTPS (Vercel automatisch)

### CORS-Policy

**[SHOULD]** Restriktive CORS-Headers für APIs

```ts
// api/data/ohlc.ts
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ✅ Good: Nur eigene Domain erlaubt
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://sparkfined.app',
    'https://preview.sparkfined.app',
  ];

  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }

  // ❌ Avoid: Wildcard-CORS
  // res.setHeader('Access-Control-Allow-Origin', '*');  // Unsicher!

  // ...
}
```

### Content-Security-Policy (Geplant)

**[FUTURE]** CSP-Header für XSS-Mitigation

```json
// vercel.json (geplant)
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https://api.moralis.io https://api.dexpaprika.com;"
        }
      ]
    }
  ]
}
```

**Rationale:** `'unsafe-inline'` / `'unsafe-eval'` aktuell nötig für Vite-HMR und Third-Party-Scripts. Langfristig: Nonce-based-CSP.

### Input-Validation

**[MUST]** Validiere alle User-Inputs Server-Side

```ts
// api/journal/create.ts
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { content, tags } = req.body;

  // ✅ Good: Input-Validation
  if (!content || typeof content !== 'string') {
    return res.status(400).json({ error: 'Invalid content' });
  }

  if (content.length > 10000) {
    return res.status(400).json({ error: 'Content too long (max 10000 chars)' });
  }

  if (tags && !Array.isArray(tags)) {
    return res.status(400).json({ error: 'Tags must be array' });
  }

  if (tags && tags.some(t => typeof t !== 'string' || t.length > 50)) {
    return res.status(400).json({ error: 'Invalid tag format' });
  }

  // Proceed...
}
```

**[SHOULD]** Sanitize HTML-Input (für Journal-Rich-Text)

```ts
// Geplant: DOMPurify für Rich-Text-Sanitization
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeJournalContent(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'a', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target'],
  });
}
```

---

## 5. Dependencies & Updates

### Dependency-Scanning

**[SHOULD]** Nutze `npm audit` regelmäßig

```bash
# Run bei jedem pnpm install
pnpm audit

# Fix automatische Vulnerabilities
pnpm audit fix

# CI-Check (fails bei High/Critical)
pnpm audit --audit-level=high
```

**[SHOULD]** Dependabot für automatische Updates (GitHub)

```yaml
# .github/dependabot.yml (geplant)
version: 2
updates:
  - package-ecosystem: "npm"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    ignore:
      - dependency-name: "*"
        update-types: ["version-update:semver-major"]  # Major-Updates manuell
```

### Known-Vulnerabilities

**[MUST]** Patche Critical-Vulnerabilities innerhalb 7 Tagen

**Aktueller Status (2025-11-12):**
- `pnpm audit`: 0 Critical, 0 High, 3 Moderate (akzeptabel)

**Moderate-Vulnerabilities (aktuell ignoriert):**
- `ws` (Transitive-Dependency via Playwright, nicht in Production-Bundle)

---

## 6. Rate-Limiting

### Client-Side-Throttling

**[SHOULD]** Verhindere Spam via Client-Side-Rate-Limiter

```ts
// src/lib/net/RateLimiter.ts
export class RateLimiter {
  private requests: number[] = [];
  private readonly limit: number;
  private readonly window: number;

  constructor(limit: number, windowMs: number) {
    this.limit = limit;
    this.window = windowMs;
  }

  async acquire(): Promise<void> {
    const now = Date.now();
    this.requests = this.requests.filter(t => t > now - this.window);

    if (this.requests.length >= this.limit) {
      const waitTime = this.requests[0] + this.window - now;
      throw new Error(`Rate limit exceeded. Retry in ${waitTime}ms`);
    }

    this.requests.push(now);
  }
}

// Usage
const aiLimiter = new RateLimiter(10, 60 * 1000);  // 10 req/min

export async function callAI(prompt: string) {
  await aiLimiter.acquire();
  return fetch('/api/ai/assist', { method: 'POST', body: JSON.stringify({ prompt }) });
}
```

### Server-Side-Rate-Limiting (Geplant)

**[FUTURE]** Vercel-Edge-Middleware für Rate-Limiting

```ts
// middleware.ts (geplant, Vercel Edge Middleware)
import { NextRequest, NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 m'),  // 10 req/min
});

export async function middleware(request: NextRequest) {
  const ip = request.ip ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 });
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/ai/:path*',  // Nur AI-Endpoints rate-limiten
};
```

---

## 7. Logging & Monitoring

### Security-Event-Logging

**[SHOULD]** Logge Security-relevante Events

```ts
// src/lib/security-logger.ts
export function logSecurityEvent(event: {
  type: 'access-denied' | 'invalid-token' | 'rate-limit' | 'suspicious-input';
  details: Record<string, any>;
}) {
  console.warn('[Security]', event.type, event.details);

  // In Production: Send to Sentry/Datadog
  if (import.meta.env.PROD) {
    // Sentry.captureMessage(`Security Event: ${event.type}`, { extra: event.details });
  }
}

// Usage
if (!isValidToken) {
  logSecurityEvent({
    type: 'invalid-token',
    details: { endpoint: '/api/signals', ip: req.ip },
  });
  return res.status(401).json({ error: 'Unauthorized' });
}
```

### Sensitive-Data-Redaction

**[MUST]** Redakte Secrets in Logs

```ts
// ✅ Good: Redacted-Logging
console.log('[API] Moralis-Call', {
  url: '/token/metadata',
  apiKey: '***REDACTED***',  // Nie echten Key loggen
});

// ❌ Avoid: Secret im Log
console.log('[API] Moralis-Call', {
  apiKey: process.env.MORALIS_API_KEY,  // Leak in Logs!
});
```

---

## 8. Examples

### ✅ Good – Secure API-Handler

```ts
// api/ai/assist.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. Method-Check
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 2. Auth-Check (Proxy-Secret)
  const proxySecret = req.headers['x-proxy-secret'];
  
  if (proxySecret !== process.env.AI_PROXY_SECRET) {
    console.warn('[Security] Invalid AI-Proxy-Secret', { ip: req.headers['x-forwarded-for'] });
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // 3. Input-Validation
  const { provider, prompt } = req.body;

  if (!provider || !['openai', 'grok'].includes(provider)) {
    return res.status(400).json({ error: 'Invalid provider' });
  }

  if (!prompt || typeof prompt !== 'string' || prompt.length > 5000) {
    return res.status(400).json({ error: 'Invalid prompt (max 5000 chars)' });
  }

  // 4. Rate-Limit-Check (geplant)
  // const { success } = await ratelimit.limit(req.ip);
  // if (!success) return res.status(429).json({ error: 'Rate limit exceeded' });

  // 5. Business-Logic (mit Secret aus Env)
  try {
    const apiKey = provider === 'openai' 
      ? process.env.OPENAI_API_KEY
      : process.env.XAI_API_KEY;

    if (!apiKey) {
      console.error('[Config] Missing API-Key for provider:', provider);
      return res.status(500).json({ error: 'Provider not configured' });
    }

    const response = await fetch(`https://api.${provider}.com/...`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
      body: JSON.stringify({ prompt }),
    });

    const data = await response.json();

    // 6. Success-Response (keine Secrets leaken)
    return res.status(200).json({
      result: data.result,
      model: data.model,
      // KEINE API-Key, keine internen Details
    });
  } catch (error) {
    console.error('[AI] Assist failed:', error);
    return res.status(500).json({ error: 'AI request failed' });
  }
}
```

### ❌ Avoid – Security-Violations

```ts
// ❌ Bad: Secret im Client
const API_KEY = import.meta.env.VITE_OPENAI_KEY;  // Im Bundle sichtbar!
fetch('https://api.openai.com/...', { headers: { 'Authorization': `Bearer ${API_KEY}` } });

// ❌ Bad: Keine Input-Validation
export default async function handler(req, res) {
  const { userId, amount } = req.body;
  await db.transferFunds(userId, amount);  // Keine Validation! Injection-Risk!
}

// ❌ Bad: CORS Wildcard
res.setHeader('Access-Control-Allow-Origin', '*');  // Jeder kann API aufrufen!

// ❌ Bad: Secret in Logs
console.log('API-Key:', process.env.MORALIS_API_KEY);  // Leak in Logs!

// ❌ Bad: Kein HTTPS-Redirect
fetch('http://api.sparkfined.app/...');  // Unsichere Connection!
```

---

## Related

- `00-project-core.md` – Security als Core-Principle
- `05-api-integration.md` – Serverless-Proxy-Pattern
- `10-deployment.md` – Secret-Management in Vercel
- `.env.example` – Environment-Variables-Template
- `vercel.json` – Security-Headers

---

## Revision History

- **2025-11-12:** Initial creation, Phase 3 Batch 4 (Secrets-Management, Auth, Secure-Defaults)
