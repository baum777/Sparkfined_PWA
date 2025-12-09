# Signal Matrix Feature Completion

**Priorität**: 🟠 P1 CRITICAL
**Aufwand**: 3 Tage
**Dringlichkeit**: R1 Beta Feature
**Abhängigkeiten**: Market Data, Replay Service

---

## Problem

Signal Matrix ist **nur 50% implementiert**:
- signalDb Operations nicht getestet
- `/api/rules/eval-cron` nicht implementiert
- Live Provider Data Integration fehlt
- Keine Test Fixtures

**Betroffene Files**:
- `src/lib/signalDb.ts` - Dexie Operations ungetestet
- `api/rules/eval-cron.ts` - Cron Endpoint fehlt
- `src/lib/signalOrchestrator.ts` - TODO: Live provider data (P1)
- `tests/cases/signal-matrix/` - Keine Tests

---

## Ziel

Vollständige **Signal Matrix** Implementation:
- Signal Detection Engine
- Rule Evaluation (Cron)
- Persistence (signalDb)
- UI Display (Signal Matrix Page)
- Test Coverage >80%

## Audit 2025-12-08 (Codex)

- Status: Signal-Flow bleibt fragmentiert – `signalDb` existiert, aber keine Cron-Route oder Live-Detection-Strategien sind verdrahtet.
- Kategorie A – Bereits erfüllt
  - [ ] Keine End-to-End-Kette aktiv; vorhandene `signalDb`-API ist ungetestet und ohne Rules/Orchestrator-Anbindung.
- Kategorie B – Kleine, fokussierte Tasks
  - [ ] Unit-Tests für bestehende `signalDb`-CRUDs hinzufügen, um Schema-Stabilität abzusichern.
- Kategorie C – Große / Epische Themen (offen)
  - [ ] Regel-Auswertung + Cron-Handler implementieren und absichern (Auth, Push, Telemetrie).
  - [ ] Provider-basierte Signal-Strategien mit Live-OHLC anbinden (abhängig von Replay/Market-Datenpfad).
  - [ ] SignalsPage-UI mit realen Datenquellen und Watchlist-Konnektor verdrahten.

---

## Tasks

### Phase 1: signalDb Tests & Validation (1 Tag)

#### 1.1 Dexie Schema Review
```typescript
// src/lib/signalDb.ts
import Dexie, { Table } from 'dexie';
import type { Signal, SignalRule } from '@/types/signal';

export class SignalDatabase extends Dexie {
  signals!: Table<Signal, string>;
  rules!: Table<SignalRule, string>;

  constructor() {
    super('signals-db');

    this.version(1).stores({
      signals: 'id, symbol, timestamp, strategy, triggered',
      rules: 'id, symbol, strategy, active'
    });
  }
}

export const signalDb = new SignalDatabase();
```

#### 1.2 CRUD Operations
```typescript
// src/lib/signalDb.ts
export async function createSignal(signal: Omit<Signal, 'id'>): Promise<string> {
  const id = crypto.randomUUID();
  await signalDb.signals.add({ ...signal, id });
  return id;
}

export async function getSignalsForSymbol(symbol: string): Promise<Signal[]> {
  return signalDb.signals
    .where('symbol')
    .equals(symbol)
    .and((s) => !s.triggered) // Only active signals
    .toArray();
}

export async function markSignalTriggered(signalId: string): Promise<void> {
  await signalDb.signals.update(signalId, {
    triggered: true,
    triggeredAt: Date.now()
  });
}

export async function createRule(rule: Omit<SignalRule, 'id'>): Promise<string> {
  const id = crypto.randomUUID();
  await signalDb.rules.add({ ...signal, id });
  return id;
}

export async function getActiveRules(): Promise<SignalRule[]> {
  return signalDb.rules.where('active').equals(true).toArray();
}
```

#### 1.3 Unit Tests
```typescript
// tests/lib/signalDb.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { signalDb, createSignal, getSignalsForSymbol, markSignalTriggered } from '@/lib/signalDb';

describe('Signal DB Operations', () => {
  beforeEach(async () => {
    await signalDb.delete();
    await signalDb.open();
  });

  it('should create and retrieve signal', async () => {
    const signalId = await createSignal({
      symbol: 'SOL',
      strategy: 'breakout',
      timestamp: Date.now(),
      triggered: false
    });

    const signals = await getSignalsForSymbol('SOL');

    expect(signals).toHaveLength(1);
    expect(signals[0].id).toBe(signalId);
  });

  it('should mark signal as triggered', async () => {
    const signalId = await createSignal({
      symbol: 'SOL',
      strategy: 'breakout',
      timestamp: Date.now(),
      triggered: false
    });

    await markSignalTriggered(signalId);

    const signal = await signalDb.signals.get(signalId);
    expect(signal.triggered).toBe(true);
    expect(signal.triggeredAt).toBeDefined();
  });

  it('should filter out triggered signals', async () => {
    await createSignal({ symbol: 'SOL', strategy: 'breakout', triggered: false });
    await createSignal({ symbol: 'SOL', strategy: 'momentum', triggered: true });

    const active = await getSignalsForSymbol('SOL');

    expect(active).toHaveLength(1);
    expect(active[0].strategy).toBe('breakout');
  });
});
```

---

### Phase 2: Signal Detection Engine (1 Tag)

#### 2.1 Strategy Implementations
```typescript
// src/lib/signals/strategies/breakout.ts
import type { OHLCData } from '@/types/market';
import type { Signal } from '@/types/signal';

export async function detectBreakout(
  symbol: string,
  ohlcData: OHLCData[]
): Promise<Signal | null> {
  if (ohlcData.length < 20) return null;

  const latest = ohlcData[ohlcData.length - 1];
  const last20 = ohlcData.slice(-20);

  // Calculate 20-period high
  const high20 = Math.max(...last20.map((c) => c.high));

  // Breakout: Current close > 20-period high
  if (latest.close > high20) {
    return {
      symbol,
      strategy: 'breakout',
      timestamp: latest.time * 1000,
      price: latest.close,
      metadata: {
        breakoutLevel: high20,
        strength: ((latest.close - high20) / high20) * 100
      },
      triggered: false
    };
  }

  return null;
}
```

```typescript
// src/lib/signals/strategies/volumeSpike.ts
export async function detectVolumeSpike(
  symbol: string,
  ohlcData: OHLCData[]
): Promise<Signal | null> {
  if (ohlcData.length < 20) return null;

  const latest = ohlcData[ohlcData.length - 1];
  const last20 = ohlcData.slice(-21, -1); // Exclude latest

  // Avg volume (last 20 periods)
  const avgVolume = last20.reduce((sum, c) => sum + c.volume, 0) / 20;

  // Volume Spike: Current volume > 2× avg
  if (latest.volume > avgVolume * 2) {
    return {
      symbol,
      strategy: 'volume-spike',
      timestamp: latest.time * 1000,
      price: latest.close,
      metadata: {
        avgVolume,
        currentVolume: latest.volume,
        multiplier: latest.volume / avgVolume
      },
      triggered: false
    };
  }

  return null;
}
```

#### 2.2 Signal Orchestrator
```typescript
// src/lib/signalOrchestrator.ts
import { fetchOHLCWithFallback } from '@/lib/data/ohlcOrchestrator';
import { detectBreakout } from '@/lib/signals/strategies/breakout';
import { detectVolumeSpike } from '@/lib/signals/strategies/volumeSpike';
import { createSignal } from '@/lib/signalDb';

const strategies = [detectBreakout, detectVolumeSpike];

export async function scanForSignals(symbol: string): Promise<Signal[]> {
  // Fetch OHLC data (last 1 hour, 5min candles)
  const { data: ohlcData } = await fetchOHLCWithFallback(
    symbol,
    '5m',
    Date.now() / 1000 - 3600, // 1 hour ago
    Date.now() / 1000
  );

  const signals: Signal[] = [];

  // Run all strategies
  for (const strategy of strategies) {
    const signal = await strategy(symbol, ohlcData);

    if (signal) {
      // Store in DB
      const signalId = await createSignal(signal);
      signals.push({ ...signal, id: signalId });

      console.log(`[Signal] Detected ${signal.strategy} for ${symbol}`);
    }
  }

  return signals;
}
```

---

### Phase 3: Cron Evaluation Endpoint (4h)

#### 3.1 API Endpoint
```typescript
// api/rules/eval-cron.ts
import { verifyRequest } from 'api/lib/auth';
import { getActiveRules } from '@/lib/signalDb';
import { scanForSignals } from '@/lib/signalOrchestrator';

export default async function handler(req, res) {
  // Verify cron secret (prevent abuse)
  const authHeader = req.headers.authorization;
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    // Get active rules
    const rules = await getActiveRules();

    if (rules.length === 0) {
      return res.json({ evaluated: 0, triggered: 0 });
    }

    // Scan for signals
    const allSignals = [];

    for (const rule of rules) {
      const signals = await scanForSignals(rule.symbol);
      allSignals.push(...signals);
    }

    // Send push notifications for triggered signals
    const notified = await sendSignalNotifications(allSignals);

    return res.json({
      evaluated: rules.length,
      triggered: allSignals.length,
      notified
    });
  } catch (error) {
    console.error('[Cron] Evaluation failed:', error);
    return res.status(500).json({ error: error.message });
  }
}
```

#### 3.2 Vercel Cron Config
```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/rules/eval-cron",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

#### 3.3 Contract Tests
```typescript
// tests/api/eval-cron.test.ts
import { describe, it, expect, vi } from 'vitest';

describe('Cron Evaluation Endpoint', () => {
  it('should reject unauthorized requests', async () => {
    const res = await fetch('/api/rules/eval-cron', {
      method: 'POST'
    });

    expect(res.status).toBe(401);
  });

  it('should evaluate active rules', async () => {
    // Seed rules
    await signalDb.rules.bulkAdd([
      { id: '1', symbol: 'SOL', strategy: 'breakout', active: true },
      { id: '2', symbol: 'BTC', strategy: 'volume-spike', active: false }
    ]);

    const res = await fetch('/api/rules/eval-cron', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` }
    });

    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data.evaluated).toBe(1); // Only active rule
  });
});
```

---

### Phase 4: UI Integration (4h)

#### 4.1 SignalsPage Component
```typescript
// src/pages/SignalsPage.tsx
import { useEffect, useState } from 'react';
import { getSignalsForSymbol } from '@/lib/signalDb';
import type { Signal } from '@/types/signal';

export function SignalsPage() {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSignals();
  }, []);

  const loadSignals = async () => {
    setLoading(true);

    try {
      // Load signals for watchlist symbols
      const watchlist = ['SOL', 'BTC', 'ETH'];
      const allSignals = [];

      for (const symbol of watchlist) {
        const symbolSignals = await getSignalsForSymbol(symbol);
        allSignals.push(...symbolSignals);
      }

      setSignals(allSignals);
    } catch (error) {
      console.error('Failed to load signals:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Signal Matrix</h1>

      {loading && <LoadingSkeleton />}

      {!loading && signals.length === 0 && (
        <EmptyState message="No active signals" />
      )}

      <div className="signal-grid">
        {signals.map((signal) => (
          <SignalCard key={signal.id} signal={signal} />
        ))}
      </div>
    </div>
  );
}

function SignalCard({ signal }: { signal: Signal }) {
  return (
    <div className="signal-card">
      <div className="signal-header">
        <span className="symbol">{signal.symbol}</span>
        <span className="strategy">{signal.strategy}</span>
      </div>

      <div className="signal-price">
        ${signal.price.toFixed(2)}
      </div>

      <div className="signal-meta">
        {signal.metadata && (
          <pre>{JSON.stringify(signal.metadata, null, 2)}</pre>
        )}
      </div>

      <div className="signal-timestamp">
        {new Date(signal.timestamp).toLocaleString()}
      </div>
    </div>
  );
}
```

---

## Acceptance Criteria

✅ signalDb CRUD Tests: >80% Coverage
✅ Signal Detection: 2+ Strategies implementiert
✅ Signal Orchestrator: Scannt Symbole
✅ Cron Endpoint: `/api/rules/eval-cron` funktioniert
✅ Cron Config: Vercel Cron Schedule aktiv
✅ UI: SignalsPage zeigt aktive Signals
✅ Contract Tests: Cron Auth & Evaluation
✅ Integration Test: End-to-End Signal Flow

---

## Validation

```bash
# Unit Tests
pnpm vitest --run tests/lib/signalDb.test.ts

# API Tests
pnpm vitest --run tests/api/eval-cron.test.ts

# Manual Test
pnpm dev
# → Open /signals
# → Verify signals displayed
# → Trigger cron manually: curl -X POST http://localhost:5173/api/rules/eval-cron -H "Authorization: Bearer <secret>"
```

---

## Related

- Siehe: `docs/tickets/signal-matrix-todo.md` (F-05)
- Siehe: `src/lib/signalOrchestrator.ts` (TODO P1)
- Abhängig von: OHLC Live Data, Market Orchestrator

---

**Owner**: Backend + Data Team
**Status**: 🔴 OFFEN – fehlende Cron/Strategien; siehe Audit 2025-12-08
**Deadline**: Woche 4-5 (Sprint 4-5)
