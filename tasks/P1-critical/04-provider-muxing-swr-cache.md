# Provider Muxing & SWR Cache Finalisierung

**Priorität**: 🟠 P1 CRITICAL
**Aufwand**: 1-2 Tage
**Dringlichkeit**: Performance & Reliability
**Abhängigkeiten**: Market Data Orchestrator

---

## Problem

Market Data Provider Muxing ist **nicht finalisiert** (TODO P0 im Code):
- Kein SWR (Stale-While-Revalidate) Cache
- Provider Switching nicht optimiert
- Redundante API Calls
- Cache Invalidation fehlt

**Betroffene Files**:
- `src/lib/data/getTokenSnapshot.ts` - Provider muxing TODO (P0)
- `src/lib/marketOrchestrator.ts` - Cache Layer fehlt

**Impact**:
- 💸 Unnötige API Costs (Moralis/DexPaprika)
- ⚡ Langsame Ladezeiten
- 🔄 Duplicate Requests

---

## Ziel

Implementiere **effizienten SWR Cache** für Market Data:
- Cache-First Strategy (5min TTL)
- Background Revalidation
- Request Deduplication
- Provider Health Tracking

---

## Tasks

### Phase 1: SWR Cache Layer (4h)

```typescript
// src/lib/cache/swrCache.ts
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
  revalidating: boolean;
}

export class SWRCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private inFlightRequests = new Map<string, Promise<T>>();

  async get(
    key: string,
    fetcher: () => Promise<T>,
    options: { ttl?: number; revalidate?: boolean } = {}
  ): Promise<T> {
    const { ttl = 5 * 60 * 1000, revalidate = true } = options;

    // Check cache
    const cached = this.cache.get(key);

    if (cached) {
      const age = Date.now() - cached.timestamp;

      // Fresh → return immediately
      if (age < cached.ttl && !cached.revalidating) {
        console.log(`[SWR] FRESH hit for ${key}`);
        return cached.data;
      }

      // Stale → return cached, revalidate in background
      if (age >= cached.ttl && revalidate && !cached.revalidating) {
        console.log(`[SWR] STALE hit for ${key}, revalidating...`);

        // Mark as revalidating
        cached.revalidating = true;

        // Revalidate in background
        this.revalidate(key, fetcher, ttl).catch(console.error);

        return cached.data; // Return stale data immediately
      }

      // Currently revalidating → return cached
      if (cached.revalidating) {
        console.log(`[SWR] Revalidating, returning cached for ${key}`);
        return cached.data;
      }
    }

    // Cache MISS → fetch fresh data
    console.log(`[SWR] MISS for ${key}, fetching...`);

    // Request deduplication
    const inFlight = this.inFlightRequests.get(key);
    if (inFlight) {
      console.log(`[SWR] Deduplicating request for ${key}`);
      return inFlight;
    }

    const fetchPromise = fetcher();
    this.inFlightRequests.set(key, fetchPromise);

    try {
      const data = await fetchPromise;

      // Store in cache
      this.cache.set(key, {
        data,
        timestamp: Date.now(),
        ttl,
        revalidating: false
      });

      return data;
    } finally {
      this.inFlightRequests.delete(key);
    }
  }

  private async revalidate(key: string, fetcher: () => Promise<T>, ttl: number) {
    try {
      const freshData = await fetcher();

      this.cache.set(key, {
        data: freshData,
        timestamp: Date.now(),
        ttl,
        revalidating: false
      });

      console.log(`[SWR] Revalidated ${key}`);
    } catch (error) {
      console.error(`[SWR] Revalidation failed for ${key}:`, error);

      // Keep stale data, mark as not revalidating
      const cached = this.cache.get(key);
      if (cached) {
        cached.revalidating = false;
      }
    }
  }

  invalidate(key: string) {
    this.cache.delete(key);
    console.log(`[SWR] Invalidated ${key}`);
  }

  clear() {
    this.cache.clear();
    console.log('[SWR] Cache cleared');
  }
}
```

---

### Phase 2: Integration mit Market Orchestrator (2h)

```typescript
// src/lib/marketOrchestrator.ts
import { SWRCache } from '@/lib/cache/swrCache';
import type { MarketSnapshot } from '@/types/market';

const marketDataCache = new SWRCache<MarketSnapshot>();

export async function getTokenSnapshot(
  symbol: string,
  options: { forceRefresh?: boolean } = {}
): Promise<MarketSnapshot> {
  const cacheKey = `market:${symbol}`;

  if (options.forceRefresh) {
    marketDataCache.invalidate(cacheKey);
  }

  return marketDataCache.get(
    cacheKey,
    async () => {
      // Fetch from provider chain
      return fetchFromProviderChain(symbol);
    },
    {
      ttl: 5 * 60 * 1000, // 5 minutes
      revalidate: true
    }
  );
}

async function fetchFromProviderChain(symbol: string): Promise<MarketSnapshot> {
  const providers = [
    { name: 'moralis', fetcher: fetchFromMoralis },
    { name: 'dexpaprika', fetcher: fetchFromDexPaprika },
    { name: 'dexscreener', fetcher: fetchFromDexScreener }
  ];

  for (const { name, fetcher } of providers) {
    try {
      console.log(`[Market] Trying provider: ${name}`);
      const data = await fetcher(symbol);

      if (data) {
        console.log(`[Market] Success with ${name}`);
        await trackProviderSuccess(name);
        return data;
      }
    } catch (error) {
      console.warn(`[Market] Provider ${name} failed:`, error);
      await trackProviderFailure(name, error.message);
    }
  }

  throw new Error('All market data providers failed');
}
```

---

### Phase 3: Provider Health Tracking (2h)

```typescript
// src/lib/telemetry/providerHealth.ts
interface ProviderStats {
  name: string;
  successCount: number;
  failureCount: number;
  avgLatency: number;
  lastSuccess: number;
  lastFailure: number;
}

class ProviderHealthTracker {
  private stats = new Map<string, ProviderStats>();

  async trackSuccess(provider: string, latency: number) {
    const stat = this.getOrCreateStat(provider);

    stat.successCount++;
    stat.lastSuccess = Date.now();
    stat.avgLatency = (stat.avgLatency * (stat.successCount - 1) + latency) / stat.successCount;

    this.stats.set(provider, stat);
  }

  async trackFailure(provider: string, error: string) {
    const stat = this.getOrCreateStat(provider);

    stat.failureCount++;
    stat.lastFailure = Date.now();

    this.stats.set(provider, stat);

    console.warn(`[Provider Health] ${provider} failed:`, error);
  }

  getHealthScore(provider: string): number {
    const stat = this.stats.get(provider);
    if (!stat) return 0;

    const total = stat.successCount + stat.failureCount;
    if (total === 0) return 1; // No data yet

    const successRate = stat.successCount / total;

    // Penalty for recent failures
    const recencyPenalty = Date.now() - stat.lastSuccess < 60000 ? 0 : 0.2;

    return Math.max(0, successRate - recencyPenalty);
  }

  getBestProvider(): string | null {
    let best: { name: string; score: number } | null = null;

    for (const [name] of this.stats) {
      const score = this.getHealthScore(name);

      if (!best || score > best.score) {
        best = { name, score };
      }
    }

    return best?.name || null;
  }

  private getOrCreateStat(provider: string): ProviderStats {
    if (!this.stats.has(provider)) {
      this.stats.set(provider, {
        name: provider,
        successCount: 0,
        failureCount: 0,
        avgLatency: 0,
        lastSuccess: 0,
        lastFailure: 0
      });
    }

    return this.stats.get(provider)!;
  }
}

export const providerHealth = new ProviderHealthTracker();
```

---

### Phase 4: Optimized Provider Selection (2h)

```typescript
// Update marketOrchestrator.ts
async function fetchFromProviderChain(symbol: string): Promise<MarketSnapshot> {
  // Sort providers by health score
  const providers = [
    { name: 'moralis', fetcher: fetchFromMoralis },
    { name: 'dexpaprika', fetcher: fetchFromDexPaprika },
    { name: 'dexscreener', fetcher: fetchFromDexScreener }
  ].sort((a, b) => {
    const scoreA = providerHealth.getHealthScore(a.name);
    const scoreB = providerHealth.getHealthScore(b.name);
    return scoreB - scoreA; // Descending
  });

  console.log(`[Market] Provider order by health:`, providers.map(p => p.name));

  for (const { name, fetcher } of providers) {
    const startTime = Date.now();

    try {
      const data = await fetcher(symbol);

      if (data) {
        const latency = Date.now() - startTime;
        await providerHealth.trackSuccess(name, latency);

        console.log(`[Market] ✓ ${name} (${latency}ms)`);
        return data;
      }
    } catch (error) {
      await providerHealth.trackFailure(name, error.message);
      console.warn(`[Market] ✗ ${name}:`, error.message);
    }
  }

  throw new Error('All providers failed');
}
```

---

## Testing

### Unit Tests: SWR Cache (2h)
```typescript
// tests/lib/swrCache.test.ts
import { describe, it, expect, vi } from 'vitest';
import { SWRCache } from '@/lib/cache/swrCache';

describe('SWR Cache', () => {
  it('should return fresh data on cache hit', async () => {
    const cache = new SWRCache();
    const fetcher = vi.fn().mockResolvedValue({ price: 100 });

    // First call → cache miss
    const result1 = await cache.get('test-key', fetcher, { ttl: 5000 });
    expect(result1).toEqual({ price: 100 });
    expect(fetcher).toHaveBeenCalledTimes(1);

    // Second call → cache hit (fresh)
    const result2 = await cache.get('test-key', fetcher, { ttl: 5000 });
    expect(result2).toEqual({ price: 100 });
    expect(fetcher).toHaveBeenCalledTimes(1); // Not called again
  });

  it('should revalidate stale data in background', async () => {
    vi.useFakeTimers();

    const cache = new SWRCache();
    const fetcher = vi.fn()
      .mockResolvedValueOnce({ price: 100 }) // First call
      .mockResolvedValueOnce({ price: 105 }); // Revalidation

    // Initial fetch
    await cache.get('test-key', fetcher, { ttl: 1000 });

    // Advance time past TTL
    vi.advanceTimersByTime(1500);

    // Second call → returns stale, revalidates in background
    const result = await cache.get('test-key', fetcher, { ttl: 1000, revalidate: true });

    expect(result).toEqual({ price: 100 }); // Stale data returned immediately
    expect(fetcher).toHaveBeenCalledTimes(2); // Revalidation triggered

    // Wait for revalidation to complete
    await vi.runAllTimersAsync();

    // Third call → fresh revalidated data
    const result2 = await cache.get('test-key', fetcher, { ttl: 1000 });
    expect(result2).toEqual({ price: 105 });

    vi.useRealTimers();
  });

  it('should deduplicate concurrent requests', async () => {
    const cache = new SWRCache();
    const fetcher = vi.fn().mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ price: 100 }), 100))
    );

    // Fire 3 concurrent requests
    const [result1, result2, result3] = await Promise.all([
      cache.get('test-key', fetcher),
      cache.get('test-key', fetcher),
      cache.get('test-key', fetcher)
    ]);

    expect(result1).toEqual({ price: 100 });
    expect(result2).toEqual({ price: 100 });
    expect(result3).toEqual({ price: 100 });

    // Fetcher should only be called once
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Test: Provider Health (1h)
```typescript
// tests/integration/providerHealth.test.ts
it('should track provider health and select best', async () => {
  const tracker = new ProviderHealthTracker();

  // moralis: 3 success, 1 failure
  await tracker.trackSuccess('moralis', 50);
  await tracker.trackSuccess('moralis', 60);
  await tracker.trackSuccess('moralis', 55);
  await tracker.trackFailure('moralis', 'timeout');

  // dexpaprika: 2 success, 0 failure
  await tracker.trackSuccess('dexpaprika', 80);
  await tracker.trackSuccess('dexpaprika', 90);

  const bestProvider = tracker.getBestProvider();
  expect(bestProvider).toBe('dexpaprika'); // Higher success rate
});
```

---

## Acceptance Criteria

✅ SWR Cache: Fresh/Stale/Miss logic works
✅ Background Revalidation funktioniert
✅ Request Deduplication verhindert duplicate calls
✅ Provider Health Tracking implementiert
✅ Providers sortiert nach Health Score
✅ Cache Invalidation on forceRefresh
✅ Unit Tests: >80% Coverage
✅ Integration Tests: End-to-End Cache Flow

---

## Validation

```bash
# Unit Tests
pnpm vitest --run tests/lib/swrCache.test.ts
pnpm vitest --run tests/integration/providerHealth.test.ts

# Manual Test
pnpm dev
# → Open Dashboard
# → Check Network Tab (should see 1 API call for market data)
# → Refresh page (should see cache hit, no API call)
# → Wait 6 minutes (should see background revalidation)
```

---

## Performance Metrics

### Before Optimization
- **API Calls per page load**: 5-10
- **Avg Load Time**: 1.5s
- **Cache Hit Rate**: 0%
- **Moralis Cost**: $0.50/day

### After Optimization (Target)
- **API Calls per page load**: 1-2
- **Avg Load Time**: 0.3s (stale data returned)
- **Cache Hit Rate**: >70%
- **Moralis Cost**: $0.15/day (−70%)

---

## Related

- Siehe: `src/lib/data/getTokenSnapshot.ts` (TODO P0)
- Siehe: `src/lib/marketOrchestrator.ts`
- Abhängigkeit für: Replay OHLC, Dashboard KPIs

---

**Owner**: Backend + Data Team
**Status**: 🟠 NICHT GESTARTET
**Deadline**: Woche 3-4 (Sprint 3)
