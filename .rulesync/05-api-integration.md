---
mode: SYSTEM
id: "05-api-integration"
priority: 2
version: "0.1.0"
last_review: "2025-11-12"
targets: ["cursor", "claudecode"]
globs: ["api/**/*.ts", "src/lib/adapters/**/*.ts", "src/lib/data/**/*.ts"]
description: "API integration patterns: serverless conventions, adapter abstraction, retry logic, and error handling for Sparkfined"
---

# 05 – API Integration & Data Flow

## 1. Data Sources

Sparkfined integriert **5 Haupt-Datenquellen** über Adapter-Pattern + Serverless-Proxies:

| Source | Purpose | Access-Pattern | Rate-Limit |
|--------|---------|----------------|------------|
| **Moralis** | Token-Metadata, NFT-Data, Wallet-Holdings | Serverless-Proxy (`/api/moralis/*`) | 3000 req/day (Free-Tier) |
| **DexPaprika** | OHLC-Data (primary), Token-Prices | Serverless-Proxy (`/api/dexpaprika/*`) | 10k req/day |
| **Dexscreener** | OHLC-Fallback, DEX-Liquidity | Direct-Fetch (CORS-enabled) | ~100 req/min |
| **Solana-RPC** | On-Chain-Reads, Transaction-Status | Direct-Fetch (Public-RPC) | Variable (Provider-abhängig) |
| **OpenAI/Grok** | AI-Market-Bullets, Social-Sentiment | Serverless-Proxy (`/api/ai/assist`) | Cost-Budget-Limited |

### Adapter-Architektur

**Prinzip:** *„Nie direkt externe APIs aufrufen, immer via Adapter oder Serverless-Proxy."*

```
┌──────────────┐
│ React-Component │
└──────┬───────┘
       │ useTokenData(address)
       ↓
┌──────────────┐
│ Custom-Hook  │
└──────┬───────┘
       │ fetchTokenData(address)
       ↓
┌──────────────────────┐
│ Adapter (Client)     │  ← Abstraktionsschicht
│ src/lib/adapters/*   │
└──────┬───────────────┘
       │ fetch('/api/moralis/...')
       ↓
┌──────────────────────┐
│ Serverless-Proxy     │  ← Secret-Management
│ api/moralis/*.ts     │
└──────┬───────────────┘
       │ fetch('https://moralis.io/...', { headers: { API-Key } })
       ↓
┌──────────────────────┐
│ External-API         │
│ Moralis, DexPaprika  │
└──────────────────────┘
```

**Vorteile:**
- **Secrets-Server-Side:** API-Keys niemals im Client-Bundle
- **Retry-Logik zentralisiert:** Alle Adapter nutzen gemeinsame Retry-Funktion
- **Provider-Switching:** Fallback von Moralis → DexPaprika transparent
- **Testbarkeit:** Adapter können gemockt werden

---

## 2. HTTP / Fetch Conventions

### Fetch-Wrapper mit Retry

**[MUST]** Nutze `fetchWithRetry` für alle externen API-Calls

```ts
// src/lib/net/fetchWithRetry.ts
interface FetchOptions extends RequestInit {
  retries?: number;
  retryDelay?: number;
  timeout?: number;
}

export async function fetchWithRetry(
  url: string,
  options: FetchOptions = {}
): Promise<Response> {
  const {
    retries = 3,
    retryDelay = 1000,
    timeout = 5000,
    ...fetchOptions
  } = options;

  for (let i = 0; i <= retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);

      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      // Erfolg oder nicht-retriable Error
      if (response.ok || response.status === 404 || response.status === 401) {
        return response;
      }

      // 5xx oder 429 → Retry
      if (i < retries && (response.status >= 500 || response.status === 429)) {
        const delay = retryDelay * Math.pow(2, i);  // Exponential-Backoff
        console.warn(`[Fetch] Retry ${i + 1}/${retries} after ${delay}ms`);
        await sleep(delay);
        continue;
      }

      return response;
    } catch (error) {
      if (i === retries) {
        throw error;
      }
      const delay = retryDelay * Math.pow(2, i);
      console.warn(`[Fetch] Network error, retry ${i + 1}/${retries} after ${delay}ms`);
      await sleep(delay);
    }
  }

  throw new Error('Max retries exceeded');
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

**Usage:**

```ts
// src/lib/adapters/MoralisAdapter.ts
import { fetchWithRetry } from '@/lib/net/fetchWithRetry';

export async function fetchTokenMetadata(address: string) {
  const response = await fetchWithRetry(`/api/moralis/token/${address}`, {
    retries: 3,
    timeout: 5000,
  });

  if (!response.ok) {
    throw new Error(`Moralis API error: ${response.status}`);
  }

  return response.json();
}
```

### API-Config-Zentralisierung

**[SHOULD]** Definiere API-Base-URLs + Headers zentral

```ts
// src/lib/api-config.ts
export const API_CONFIG = {
  moralis: {
    base: '/api/moralis',
    timeout: 5000,
  },
  dexpaprika: {
    base: '/api/dexpaprika',
    timeout: 3000,
  },
  ai: {
    base: '/api/ai',
    timeout: 30000,  // AI-Calls dauern länger
  },
} as const;

// Usage
import { API_CONFIG } from '@/lib/api-config';

const url = `${API_CONFIG.moralis.base}/token/${address}`;
```

---

## 3. Error Handling & Retries

### Standard-Error-Handling-Pattern

**[MUST]** Verwende `Result<T, E>`-Pattern für Fehler-Propagation

```ts
// src/types/index.ts
export type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

// Adapter-Implementation
export async function fetchOhlc(
  address: string,
  timeframe: string
): Promise<Result<OHLCData[]>> {
  try {
    const response = await fetchWithRetry(
      `${API_CONFIG.dexpaprika.base}/ohlc?address=${address}&timeframe=${timeframe}`,
      { timeout: API_CONFIG.dexpaprika.timeout }
    );

    if (!response.ok) {
      return {
        success: false,
        error: new Error(`API returned ${response.status}`),
      };
    }

    const data = await response.json();

    // Validation
    if (!Array.isArray(data) || data.length === 0) {
      return {
        success: false,
        error: new Error('Invalid OHLC data format'),
      };
    }

    return { success: true, data };
  } catch (error) {
    return {
      success: false,
      error: error as Error,
    };
  }
}

// Consumer
const result = await fetchOhlc(address, '1h');
if (result.success) {
  renderChart(result.data);
} else {
  showError(result.error.message);
}
```

### Retry-Strategien nach Status-Code

**[MUST]** Retriable vs. Non-Retriable-Errors unterscheiden

```ts
// Retriable (Retry mit Backoff):
// - 408: Request-Timeout
// - 429: Too-Many-Requests
// - 500-599: Server-Errors
// - Network-Errors (Timeout, Connection-Reset)

// Non-Retriable (Sofort-Fail):
// - 400: Bad-Request (Input-Fehler)
// - 401: Unauthorized (Fehlende/ungültige API-Key)
// - 403: Forbidden (Access-Denied)
// - 404: Not-Found (Resource existiert nicht)
// - 422: Unprocessable-Entity (Validation-Error)

function shouldRetry(status: number): boolean {
  return status === 408 || status === 429 || (status >= 500 && status < 600);
}
```

### Exponential-Backoff mit Jitter

**[SHOULD]** Nutze Jitter, um Thundering-Herd zu vermeiden

```ts
function calculateBackoff(attempt: number, baseDelay: number): number {
  const exponential = baseDelay * Math.pow(2, attempt);
  const jitter = Math.random() * 1000;  // 0-1000ms Jitter
  return exponential + jitter;
}

// Usage
for (let i = 0; i < retries; i++) {
  try {
    return await fetch(url);
  } catch (error) {
    if (i < retries - 1) {
      const delay = calculateBackoff(i, 1000);
      await sleep(delay);
    }
  }
}
```

---

## 4. Rate Limiting & Throttling

### Client-Side-Rate-Limiting

**[SHOULD]** Implementiere lokale Rate-Limits für teure APIs

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
      const oldestRequest = this.requests[0];
      const waitTime = oldestRequest + this.window - now;
      console.warn(`[RateLimiter] Limit reached, waiting ${waitTime}ms`);
      await sleep(waitTime);
      return this.acquire();  // Recursive retry
    }

    this.requests.push(now);
  }
}

// Usage
const moralisLimiter = new RateLimiter(50, 60 * 1000);  // 50 req/min

export async function fetchTokenData(address: string) {
  await moralisLimiter.acquire();
  return fetchWithRetry(`/api/moralis/token/${address}`);
}
```

### Throttle-Function für Burst-Prevention

**[SHOULD]** Nutze Throttle für User-Triggered-Requests

```ts
// src/lib/throttle.ts
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  let lastCall = 0;

  return function (this: any, ...args: Parameters<T>) {
    const now = Date.now();

    if (now - lastCall >= wait) {
      lastCall = now;
      func.apply(this, args);
    } else if (!timeout) {
      timeout = setTimeout(() => {
        lastCall = Date.now();
        timeout = null;
        func.apply(this, args);
      }, wait - (now - lastCall));
    }
  };
}

// Usage: Throttle-Search-Input
const throttledSearch = throttle(async (query: string) => {
  const results = await searchTokens(query);
  setResults(results);
}, 500);  // Max 1 Request pro 500ms

<input onChange={(e) => throttledSearch(e.target.value)} />
```

---

## 5. Typing & Validation

### Zod-Validation (Geplant, noch nicht implementiert)

**[FUTURE]** Nutze Zod für Runtime-Schema-Validation

```ts
// Geplant für Q1 2025
import { z } from 'zod';

const OHLCDataSchema = z.object({
  timestamp: z.number(),
  open: z.number(),
  high: z.number(),
  low: z.number(),
  close: z.number(),
  volume: z.number(),
});

export async function fetchOhlc(address: string) {
  const response = await fetch(`/api/ohlc?address=${address}`);
  const data = await response.json();

  // Runtime-Validation
  const parsed = z.array(OHLCDataSchema).safeParse(data);
  if (!parsed.success) {
    throw new Error('Invalid OHLC data structure');
  }

  return parsed.data;
}
```

### Manual-Validation (Aktuell)

**[MUST]** Validiere kritische API-Responses manuell

```ts
// src/lib/adapters/validation.ts
export function isValidOHLC(data: unknown): data is OHLCData[] {
  if (!Array.isArray(data)) return false;

  return data.every(item =>
    typeof item === 'object' &&
    item !== null &&
    typeof item.timestamp === 'number' &&
    typeof item.open === 'number' &&
    typeof item.high === 'number' &&
    typeof item.low === 'number' &&
    typeof item.close === 'number' &&
    typeof item.volume === 'number'
  );
}

// Usage
export async function fetchOhlc(address: string): Promise<Result<OHLCData[]>> {
  try {
    const response = await fetchWithRetry(`/api/ohlc?address=${address}`);
    const data: unknown = await response.json();

    if (!isValidOHLC(data)) {
      return {
        success: false,
        error: new Error('Invalid OHLC data structure'),
      };
    }

    return { success: true, data };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}
```

---

## 6. Serverless-API-Patterns (Vercel Edge Functions)

### Standard-API-Route-Structure

**[MUST]** Folge dieser Struktur für alle `/api/*`-Routes

```ts
// api/data/ohlc.ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { fetchOhlcFromDexpaprika } from '@/lib/adapters/dexpaprika';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // 1. CORS-Headers (wenn nötig)
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // 2. Method-Check
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 3. Input-Validation
  const { address, timeframe } = req.query;

  if (!address || typeof address !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid address' });
  }

  if (!timeframe || typeof timeframe !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid timeframe' });
  }

  // 4. Business-Logic (mit Error-Handling)
  try {
    const result = await fetchOhlcFromDexpaprika(address, timeframe);

    if (!result.success) {
      return res.status(500).json({ error: result.error.message });
    }

    // 5. Success-Response
    return res.status(200).json(result.data);
  } catch (error) {
    console.error('[API] OHLC fetch failed:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
```

### Secret-Management

**[MUST]** Secrets nur in Serverless-Functions nutzen, nie im Client

```ts
// api/moralis/[...path].ts
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ✅ Good: Secret aus Env-Variable
  const apiKey = process.env.MORALIS_API_KEY;

  if (!apiKey) {
    console.error('[API] MORALIS_API_KEY not configured');
    return res.status(500).json({ error: 'API not configured' });
  }

  // Proxy-Request zu Moralis
  const moralisUrl = `https://deep-index.moralis.io/api/v2.2${req.url}`;
  const response = await fetch(moralisUrl, {
    headers: {
      'X-API-Key': apiKey,  // Secret bleibt Server-Side!
    },
  });

  const data = await response.json();
  return res.status(response.status).json(data);
}
```

**[MUST NOT]** Secrets im Client exposen

```tsx
// ❌ Bad: Secret im Client-Code
const MORALIS_API_KEY = 'abc123...';  // Im Bundle sichtbar!

fetch('https://moralis.io/...', {
  headers: { 'X-API-Key': MORALIS_API_KEY }
});

// ✅ Good: Via Serverless-Proxy
fetch('/api/moralis/token/...');  // Secret bleibt im Backend
```

---

## 7. Examples

### ✅ Good – Complete Adapter mit Retry + Validation

```ts
// src/lib/adapters/DexpaprikaAdapter.ts
import { fetchWithRetry } from '@/lib/net/fetchWithRetry';
import { API_CONFIG } from '@/lib/api-config';
import type { OHLCData, Result } from '@/types';

export class DexpaprikaAdapter {
  async fetchOhlc(
    address: string,
    timeframe: string,
    limit: number = 100
  ): Promise<Result<OHLCData[]>> {
    try {
      // Input-Validation
      if (!address || address.length < 32) {
        return {
          success: false,
          error: new Error('Invalid address format'),
        };
      }

      const validTimeframes = ['1m', '5m', '15m', '1h', '4h', '1d', '1w'];
      if (!validTimeframes.includes(timeframe)) {
        return {
          success: false,
          error: new Error(`Invalid timeframe. Must be one of: ${validTimeframes.join(', ')}`),
        };
      }

      // API-Call mit Retry
      const url = `${API_CONFIG.dexpaprika.base}/ohlc?address=${address}&timeframe=${timeframe}&limit=${limit}`;
      const response = await fetchWithRetry(url, {
        retries: 3,
        timeout: API_CONFIG.dexpaprika.timeout,
      });

      if (!response.ok) {
        return {
          success: false,
          error: new Error(`DexPaprika API error: ${response.status}`),
        };
      }

      const data: unknown = await response.json();

      // Runtime-Validation
      if (!this.isValidOHLC(data)) {
        return {
          success: false,
          error: new Error('Invalid OHLC data structure from API'),
        };
      }

      return { success: true, data };
    } catch (error) {
      return {
        success: false,
        error: error as Error,
      };
    }
  }

  private isValidOHLC(data: unknown): data is OHLCData[] {
    if (!Array.isArray(data)) return false;

    return data.every(item =>
      typeof item === 'object' &&
      item !== null &&
      typeof item.timestamp === 'number' &&
      typeof item.open === 'number' &&
      typeof item.high === 'number' &&
      typeof item.low === 'number' &&
      typeof item.close === 'number' &&
      typeof item.volume === 'number'
    );
  }
}

export const dexpaprikaAdapter = new DexpaprikaAdapter();
```

### ❌ Avoid – Anti-Patterns

```ts
// ❌ Bad: Direkter Fetch ohne Retry
async function fetchTokenData(address: string) {
  const response = await fetch(`https://api.moralis.io/token/${address}`);
  return response.json();  // Keine Error-Handling, kein Retry!
}

// ❌ Bad: Secret im Client
const API_KEY = 'sk-abc123...';
fetch('https://api.openai.com/...', {
  headers: { 'Authorization': `Bearer ${API_KEY}` }  // Im Bundle sichtbar!
});

// ❌ Bad: Keine Input-Validation
export default async function handler(req, res) {
  const { address } = req.query;
  const data = await fetchFromDB(address);  // Was, wenn address undefined/malicious?
  return res.json(data);
}

// ❌ Bad: Kein Result-Type, direkter Throw
async function fetchData(address: string) {
  const response = await fetch(`/api/data/${address}`);
  if (!response.ok) {
    throw new Error('API failed');  // Consumer muss try-catch nutzen, unergonomisch
  }
  return response.json();
}
```

---

## Related

- `00-project-core.md` – Data-Sources-Übersicht
- `01-typescript.md` – Result-Type-Definition
- `02-frontend-arch.md` – Hook-Layer für API-Calls
- `03-pwa-conventions.md` – Offline-Fallback-Patterns
- `09-security.md` – Secret-Management-Details
- `src/lib/adapters/` – Adapter-Implementierungen
- `api/**` – Serverless-API-Routes

---

## Revision History

- **2025-11-12:** Initial creation, Phase 3 Batch 2 (Adapter-Pattern, Retry-Logic, Rate-Limiting)
