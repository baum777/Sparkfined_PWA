# Replay Lab - Live OHLC Daten Integration

**Priorität**: 🟠 P1 CRITICAL
**Aufwand**: 2 Tage
**Dringlichkeit**: R1 Beta Feature
**Abhängigkeiten**: Market Data Orchestrator

---

## Problem

Replay Lab verwendet **gemockte OHLC-Daten**. Die gesamte Feature ist aktuell nicht produktiv nutzbar.

**Betroffene Files**:
- `src/lib/data/getTokenSnapshot.ts` - OHLC Fetch stubbed (TODO P0)
- `src/lib/ReplayService.ts` - Session Management (keine Daten)
- `src/pages/ReplayPage.tsx` - UI zeigt Mock-Daten
- `tests/e2e/replay.spec.ts` - Komplett geskippt

## Checkliste (Repo-Abgleich – Stand: 2025-12-12)

- [x] Live-Provider-Adapter vorhanden – `src/lib/priceAdapter.ts` nutzt DexPaprika mit Moralis-Fallback inkl. Retry/Cooldown.
- [x] Hook/Cache umgesetzt – `src/hooks/useOhlcData.ts` lädt aus IndexedDB-Snapshots, aktualisiert via Network-Fetch und speichert mit `putChartSnapshot`.
- [x] E2E-Flow aktiv – `tests/e2e/replay.spec.ts` läuft mit deterministischen Candle-Fixtures statt Skip.
- [x] Unit-Tests für Replay-Logik – `tests/unit/replay.math.test.ts` und `useOhlcData.test.ts` prüfen Playback/Mapping.
- [ ] Live-Replay ohne Mocks – ReplayPage nutzt weiterhin Mock-Daten in E2E; echter Provider-Pfad noch nicht in Playwright abgedeckt.

## Nächste Schritte aus Repo-Sicht

- Optional: Separaten E2E-Run mit echtem Provider-Flag ergänzen, um Live-Daten-Pipeline zu verifizieren.
- Dokumentation im Task anpassen, falls `getTokenSnapshot.ts` nicht mehr zentral genutzt wird (aktueller Fetch über `priceAdapter`).

**Aktueller Code**:
```typescript
// src/lib/data/getTokenSnapshot.ts
export async function fetchOHLC(symbol: string, timeframe: string) {
  // TODO: Implement live provider muxing (P0)
  return MOCK_OHLC_DATA; // ❌ Hardcoded Mock
}
```

---

## Ziel

Live OHLC-Daten von echten Providern abrufen:
- **Primary**: Moralis / DexPaprika
- **Fallback 1**: DexScreener
- **Fallback 2**: CoinGecko (Free Tier, limitiert)

## Audit 2025-12-08 (Codex)

- Status: Live-Datenpfad fehlt weiterhin; `getTokenSnapshot` wirft "Not implemented" und kein Orchestrator ist verdrahtet.
- Kategorie A – Bereits erfüllt
  - [ ] Keine Abdeckung: es gibt keine produktive OHLC-Quelle, weder Adapter noch Orchestrator noch Replay-Integration.
- Kategorie B – Kleine, fokussierte Tasks
  - [x] Quick-Win: Deterministische OHLC-Replay-Engine für gespeicherte Kerzen implementiert (Start/Pause/Resume/Stop, Cleanup, Normalisierung) und in ReplayPage verdrahtet. Tests: `tests/lib/ohlcReplayEngine.test.ts`.
- Kategorie C – Große / Epische Themen (offen)
  - [ ] Provider-Adapter (Moralis/DexScreener/CoinGecko) implementieren und via Fallback-Kette anbinden.
  - [ ] SWR-/IndexedDB-Cache für OHLC-Daten hinzufügen, damit Replay offline-fähig ist.
  - [ ] ReplayService/ReplayPage auf Live-Daten umstellen und `tests/e2e/replay.spec.ts` reaktivieren.

---

## Tasks

### Phase 1: Provider Adapter Implementation (1 Tag)

#### 1.1 Moralis OHLC Adapter
```typescript
// src/lib/adapters/moralisOHLCAdapter.ts
import type { OHLCData, Timeframe } from '@/types/market';

export async function fetchMoralisOHLC(
  symbol: string,
  timeframe: Timeframe,
  startTime: number,
  endTime: number
): Promise<OHLCData[]> {
  const apiKey = import.meta.env.VITE_MORALIS_API_KEY;
  if (!apiKey) throw new Error('Moralis API key missing');

  const interval = timeframeToInterval(timeframe); // '1h', '4h', '1d'

  const response = await fetch(
    `https://deep-index.moralis.io/api/v2/erc20/${symbol}/ohlcv` +
    `?chain=solana&interval=${interval}&from=${startTime}&to=${endTime}`,
    {
      headers: { 'X-API-Key': apiKey }
    }
  );

  if (!response.ok) {
    throw new Error(`Moralis OHLC fetch failed: ${response.status}`);
  }

  const data = await response.json();

  return data.result.map(candle => ({
    time: new Date(candle.timestamp).getTime() / 1000,
    open: parseFloat(candle.open),
    high: parseFloat(candle.high),
    low: parseFloat(candle.low),
    close: parseFloat(candle.close),
    volume: parseFloat(candle.volume || '0')
  }));
}

function timeframeToInterval(tf: Timeframe): string {
  const map = {
    '1m': '1m', '5m': '5m', '15m': '15m', '30m': '30m',
    '1h': '1h', '4h': '4h', '1d': '1d', '1w': '1w'
  };
  return map[tf] || '1h';
}
```

#### 1.2 DexScreener Fallback Adapter
```typescript
// src/lib/adapters/dexscreenerOHLCAdapter.ts
export async function fetchDexScreenerOHLC(
  symbol: string,
  timeframe: Timeframe,
  startTime: number,
  endTime: number
): Promise<OHLCData[]> {
  const response = await fetch(
    `https://api.dexscreener.com/latest/dex/tokens/${symbol}/candles` +
    `?timeframe=${timeframe}&from=${startTime}&to=${endTime}`
  );

  if (!response.ok) {
    throw new Error(`DexScreener OHLC failed: ${response.status}`);
  }

  const data = await response.json();

  return data.candles.map(c => ({
    time: c.timestamp,
    open: c.o,
    high: c.h,
    low: c.l,
    close: c.c,
    volume: c.v
  }));
}
```

---

### Phase 2: OHLC Orchestrator (4h)

#### Orchestrator mit Fallback-Chain
```typescript
// src/lib/data/ohlcOrchestrator.ts
import { fetchMoralisOHLC } from '@/lib/adapters/moralisOHLCAdapter';
import { fetchDexScreenerOHLC } from '@/lib/adapters/dexscreenerOHLCAdapter';
import type { OHLCData, Timeframe } from '@/types/market';

type OHLCProvider = 'moralis' | 'dexscreener' | 'coingecko';

export async function fetchOHLCWithFallback(
  symbol: string,
  timeframe: Timeframe,
  startTime: number,
  endTime: number
): Promise<{ data: OHLCData[]; provider: OHLCProvider }> {
  const providers: Array<{
    name: OHLCProvider;
    fetcher: typeof fetchMoralisOHLC;
  }> = [
    { name: 'moralis', fetcher: fetchMoralisOHLC },
    { name: 'dexscreener', fetcher: fetchDexScreenerOHLC }
  ];

  for (const { name, fetcher } of providers) {
    try {
      console.log(`[OHLC] Trying provider: ${name}`);
      const data = await fetcher(symbol, timeframe, startTime, endTime);

      if (data && data.length > 0) {
        console.log(`[OHLC] Success with ${name}, ${data.length} candles`);

        // Track telemetry
        await trackProviderSuccess(name, 'ohlc');

        return { data, provider: name };
      }
    } catch (error) {
      console.warn(`[OHLC] Provider ${name} failed:`, error);
      await trackProviderFailure(name, 'ohlc', error.message);
      // Continue to next provider
    }
  }

  throw new Error('All OHLC providers failed');
}
```

---

### Phase 3: Integration in ReplayService (2h)

#### Update ReplayService.ts
```typescript
// src/lib/ReplayService.ts
import { fetchOHLCWithFallback } from '@/lib/data/ohlcOrchestrator';
import { db } from '@/db/db';

export async function loadReplaySession(
  symbol: string,
  timeframe: Timeframe,
  startDate: Date,
  endDate: Date
): Promise<ReplaySession> {
  const startTime = Math.floor(startDate.getTime() / 1000);
  const endTime = Math.floor(endDate.getTime() / 1000);

  // Fetch live OHLC data
  const { data: ohlcData, provider } = await fetchOHLCWithFallback(
    symbol,
    timeframe,
    startTime,
    endTime
  );

  if (ohlcData.length === 0) {
    throw new Error('No OHLC data available for replay');
  }

  // Create replay session
  const session: ReplaySession = {
    id: crypto.randomUUID(),
    symbol,
    timeframe,
    startTime,
    endTime,
    candles: ohlcData,
    currentIndex: 0,
    playbackSpeed: 1,
    provider,
    createdAt: Date.now()
  };

  // Persist to IndexedDB
  await db.replaySessions.add(session);

  return session;
}

export async function resumeReplaySession(sessionId: string): Promise<ReplaySession> {
  const session = await db.replaySessions.get(sessionId);

  if (!session) {
    throw new Error(`Replay session ${sessionId} not found`);
  }

  return session;
}
```

---

### Phase 4: UI Integration (2h)

#### Update ReplayPage.tsx
```typescript
// src/pages/ReplayPage.tsx
import { loadReplaySession } from '@/lib/ReplayService';
import { useState } from 'react';

export function ReplayPage() {
  const [session, setSession] = useState<ReplaySession | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLoadReplay = async () => {
    setLoading(true);
    setError(null);

    try {
      const startDate = new Date('2024-01-01');
      const endDate = new Date('2024-01-31');

      const newSession = await loadReplaySession('SOL', '1h', startDate, endDate);
      setSession(newSession);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Replay Lab</h1>

      {error && <ErrorBanner message={error} />}

      {!session && (
        <button onClick={handleLoadReplay} disabled={loading}>
          {loading ? 'Loading OHLC...' : 'Load Replay Session'}
        </button>
      )}

      {session && (
        <div>
          <p>Session loaded: {session.candles.length} candles</p>
          <p>Provider: {session.provider}</p>
          {/* Chart component here */}
        </div>
      )}
    </div>
  );
}
```

---

### Phase 5: Caching Strategy (2h)

#### SWR Cache für OHLC Daten
```typescript
// src/lib/cache/ohlcCache.ts
import { db } from '@/db/db';

const CACHE_TTL = 5 * 60 * 1000; // 5 Minuten

export async function getCachedOHLC(
  symbol: string,
  timeframe: Timeframe,
  startTime: number,
  endTime: number
): Promise<OHLCData[] | null> {
  const cacheKey = `${symbol}-${timeframe}-${startTime}-${endTime}`;

  const cached = await db.ohlcCache.get(cacheKey);

  if (!cached) return null;

  const age = Date.now() - cached.timestamp;
  if (age > CACHE_TTL) {
    // Stale, delete and return null
    await db.ohlcCache.delete(cacheKey);
    return null;
  }

  console.log(`[OHLC Cache] HIT for ${cacheKey}`);
  return cached.data;
}

export async function setCachedOHLC(
  symbol: string,
  timeframe: Timeframe,
  startTime: number,
  endTime: number,
  data: OHLCData[]
): Promise<void> {
  const cacheKey = `${symbol}-${timeframe}-${startTime}-${endTime}`;

  await db.ohlcCache.put({
    key: cacheKey,
    data,
    timestamp: Date.now()
  });

  console.log(`[OHLC Cache] STORED ${cacheKey}, ${data.length} candles`);
}
```

#### Integrate Cache in Orchestrator
```typescript
// Update fetchOHLCWithFallback
export async function fetchOHLCWithFallback(...args) {
  // Check cache first
  const cached = await getCachedOHLC(...args);
  if (cached) {
    return { data: cached, provider: 'cache' };
  }

  // Fetch from providers
  const { data, provider } = await /* ... */;

  // Store in cache
  await setCachedOHLC(...args, data);

  return { data, provider };
}
```

---

## Testing

### Unit Tests: OHLC Adapters (2h)
```typescript
// tests/lib/ohlcAdapters.test.ts
import { describe, it, expect, vi } from 'vitest';
import { fetchMoralisOHLC } from '@/lib/adapters/moralisOHLCAdapter';

describe('Moralis OHLC Adapter', () => {
  it('should fetch OHLC data for SOL', async () => {
    // Mock fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        result: [
          { timestamp: '2024-01-01T00:00:00Z', open: '95', high: '98', low: '94', close: '97', volume: '1000000' }
        ]
      })
    });

    const data = await fetchMoralisOHLC('SOL', '1h', 1704067200, 1704153600);

    expect(data).toHaveLength(1);
    expect(data[0].open).toBe(95);
    expect(data[0].close).toBe(97);
  });

  it('should throw error when API key missing', async () => {
    delete import.meta.env.VITE_MORALIS_API_KEY;

    await expect(
      fetchMoralisOHLC('SOL', '1h', 0, 0)
    ).rejects.toThrow('Moralis API key missing');
  });
});
```

### Integration Test: Orchestrator Fallback (2h)
```typescript
// tests/integration/ohlcOrchestrator.test.ts
it('should fallback to DexScreener when Moralis fails', async () => {
  // Mock Moralis to fail
  vi.spyOn(moralisAdapter, 'fetchMoralisOHLC').mockRejectedValue(
    new Error('Moralis rate limit')
  );

  // Mock DexScreener to succeed
  vi.spyOn(dexscreenerAdapter, 'fetchDexScreenerOHLC').mockResolvedValue([
    { time: 1704067200, open: 95, high: 98, low: 94, close: 97, volume: 1000000 }
  ]);

  const { data, provider } = await fetchOHLCWithFallback('SOL', '1h', 0, 999999999);

  expect(provider).toBe('dexscreener');
  expect(data).toHaveLength(1);
});
```

---

## Acceptance Criteria

✅ Moralis OHLC Adapter implementiert & getestet
✅ DexScreener Fallback Adapter implementiert & getestet
✅ OHLC Orchestrator mit Fallback-Chain
✅ SWR Cache für OHLC Daten (5min TTL)
✅ ReplayService verwendet Live-Daten (kein Mock mehr)
✅ ReplayPage lädt echte Candles
✅ Unit Tests: >80% Coverage für Adapters
✅ Integration Tests: Fallback-Chain validiert
✅ E2E Tests: `tests/e2e/replay.spec.ts` unskipped & grün

---

## Validation

```bash
# Unit Tests
pnpm vitest --run tests/lib/ohlcAdapters.test.ts

# Integration Tests
pnpm vitest --run tests/integration/ohlcOrchestrator.test.ts

# E2E Tests
pnpm test:e2e tests/e2e/replay.spec.ts

# Manual Test
pnpm dev
# → Open /replay
# → Load SOL 1h session
# → Verify candles displayed
```

---

## Related

- Siehe: `docs/tickets/replay-lab-todo.md` (F-06)
- Abhängig von: Market Data Orchestrator
- Blocker für: E2E Test Stabilization (P0)

---

**Owner**: Backend + Data Team
**Status**: 🔴 OFFEN – kein Live-Datenpfad; siehe Audit 2025-12-08
**Deadline**: Woche 3 (Sprint 3)
