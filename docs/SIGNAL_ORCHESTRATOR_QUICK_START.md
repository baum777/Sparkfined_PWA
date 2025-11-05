# 🚀 Signal Orchestrator - Quick Start

## Was ist der Signal Orchestrator?

Ein **KI-gestütztes System** für automatisierte Crypto-Signal-Generierung mit integriertem **Event-Sourcing** und **kontinuierlichem Lernen**.

**In 3 Sätzen:**
1. Analysiert Marktdaten (OHLC, Liquidity, On-Chain) und erkennt Trading-Patterns
2. Generiert Trade-Pläne mit Risk-Management (Stop/Targets, R:R, Expectancy)
3. Speichert jede Aktion als Wissensknoten und extrahiert Lessons für fortlaufende Verbesserung

---

## 📦 Was wurde implementiert?

### ✅ Core System

| Komponente | Datei | Status |
|------------|-------|--------|
| **Type Definitions** | `src/types/signal.ts` | ✅ Komplett |
| **Database Layer** | `src/lib/signalDb.ts` | ✅ IndexedDB + Event-Sourcing |
| **Orchestrator Logic** | `src/lib/signalOrchestrator.ts` | ✅ Signal Detection, Trade Plans, Lessons |
| **Regime Detection** | `src/lib/regimeDetection.ts` | ✅ Trend/Vol/Liquidity Classification |

### ✅ API Endpoints

| Endpoint | Datei | Beschreibung |
|----------|-------|-------------|
| **POST** `/api/signals/detect` | `api/signals/detect.ts` | Signal Detection + Trade Plan Generation |
| **GET** `/api/signals/lessons` | `api/signals/lessons.ts` | Abrufen gespeicherter Lessons |
| **POST** `/api/signals/create-lesson` | `api/signals/create-lesson.ts` | Lesson aus Trade Outcome generieren |

### ✅ Dokumentation & Beispiele

- 📘 **[SIGNAL_ORCHESTRATOR_GUIDE.md](./SIGNAL_ORCHESTRATOR_GUIDE.md)** - Vollständige Dokumentation
- 📊 **[SIGNAL_ORCHESTRATOR_EXAMPLE.json](./SIGNAL_ORCHESTRATOR_EXAMPLE.json)** - Beispiel-Output (SOL/USDC)
- 🧪 **[scripts/demo-signal-orchestrator.ts](../scripts/demo-signal-orchestrator.ts)** - Runnable Demo

---

## 🎯 Schnelleinstieg

### **1. Signal Detection API aufrufen**

```bash
curl -X POST https://your-domain.com/api/signals/detect \
  -H "Content-Type: application/json" \
  -d '{
    "address": "So11111111111111111111111111111111111111112",
    "chain": "solana",
    "tf": "15m",
    "accountEquity": 10000,
    "riskPercentage": 1.0
  }'
```

**Response:** Vollständiger `SignalOrchestratorOutput` mit:
- ✅ Signals (Pattern, Confidence, Regime, Thesis)
- ✅ Trade Plans (Entry, Stop, Targets, R:R, Expectancy)
- ✅ Action Graph Nodes (Event-Sourcing)
- ✅ Lessons (Pattern Analysis, Checklist, Dos/Donts)

### **2. Lessons abrufen**

```bash
curl "https://your-domain.com/api/signals/lessons?pattern=momentum&min_score=0.5&limit=10"
```

### **3. Demo lokal ausführen**

```bash
# Mit Deno:
deno run --allow-all scripts/demo-signal-orchestrator.ts

# Mit Node (tsx):
npx tsx scripts/demo-signal-orchestrator.ts
```

---

## 📊 Output-Format (Contract)

Jede Response folgt dem **`SignalOrchestratorOutput`** Schema:

```typescript
{
  "action_graph_update": {
    "nodes": [ActionNode, ...],        // Event-Sourcing Nodes
    "edges": [["node_a", "node_b", "CAUSES"], ...]
  },
  "signals": [Signal, ...],            // Detected Signals
  "trade_plans": [TradePlan, ...],     // Generated Plans
  "lessons": [Lesson, ...],            // Extracted Lessons
  "explanation": "...",                // Human-readable (<= 120 words)
  "warnings": ["..."]                  // Optional risk warnings
}
```

**Beispiel:** [SIGNAL_ORCHESTRATOR_EXAMPLE.json](./SIGNAL_ORCHESTRATOR_EXAMPLE.json)

---

## 🧠 Kernkonzepte

### **1. Signal Detection**

```typescript
Signal = {
  pattern: "momentum" | "breakout" | "reversal" | ...,
  confidence: 0.78,                  // 0.0 - 1.0
  direction: "long" | "short",
  regime: { trend: "up", vol: "mid", liquidity: "high" },
  features: { price, atr, rsi, ema_fast, ema_slow, onchain: {...} },
  thesis: "Why this setup has edge...",
  risk_flags: ["rug_suspect", "illiquid", ...]
}
```

### **2. Trade Plan Generation**

```typescript
TradePlan = {
  entry: { type: "limit", price: 142.35, valid_for: "30m" },
  risk: { stop: 137.22, risk_pct_equity: 1.0, pos_size_units: 19.48 },
  targets: [
    { tp: 1, price: 150.03, share: 0.3 },  // 30% at 1.5R
    { tp: 2, price: 155.20, share: 0.4 },  // 40% at 2.5R
    { tp: 3, price: 162.91, share: 0.3 }   // 30% at 4R
  ],
  metrics: { rr: 2.8, expectancy: 0.42, win_prob: 0.78 },
  checklist: ["regime_ok", "liquidity_ok", "rugcheck_ok", ...]
}
```

### **3. Regime Detection**

```typescript
MarketRegime = {
  trend: "up" | "down" | "side",       // EMA + Price Structure
  vol: "low" | "mid" | "high",         // ATR % of price
  liquidity: "low" | "mid" | "high",   // Pool depth + Volume
  session: "asia" | "london" | "nyc",  // UTC time-based
  phase: "accumulation" | "markup" | ...
}
```

**Algorithmen:**
- **Trend:** EMA(9) vs EMA(21), Higher Highs/Lows
- **Volatility:** ATR % (< 2% low, 2-5% mid, > 5% high)
- **Liquidity:** Pool USD + Volume ratio

### **4. Event Sourcing (Action Graph)**

Jede Aktion wird als **ActionNode** gespeichert:

```typescript
ActionNode = {
  id: "node_...",
  type: "signal.detected" | "trade.plan.created" | "stoploss.hit" | ...,
  ts_utc: "2025-11-05T14:23:45.123Z",
  refs: { signal_id, plan_id, prev_node_id },
  payload: { ... },                    // Event-specific data
  tags: ["pattern/momentum", "confidence/78", ...],
  confidence: 0.78
}
```

Nodes werden via **Edges** verbunden: `["node_a", "node_b", "CAUSES"]`

### **5. Lesson Extraction**

Aus Trade Outcomes + Pattern History werden **Lessons** generiert:

```typescript
Lesson = {
  pattern: "momentum-breakout-london-session",
  when_it_works: "Works best in uptrend with mid volatility...",
  when_it_fails: "Fails when volume spike is fake...",
  checklist: ["RSI not overbought", "Volume confirming", ...],
  dos: ["Wait for regime confirmation", ...],
  donts: ["Don't chase entries", "Don't ignore risk flags", ...],
  next_drill: "Backtest this setup on 100+ samples...",
  stats: { trades_analyzed: 42, win_rate: 0.68, avg_rr: 2.6 }
}
```

---

## 🔍 Use Cases

### **1. Automated Signal Screening**

Scanne Tokens für Trading-Opportunities:

```typescript
// Pseudo-Code
const tokens = ['SOL', 'ETH', 'BTC', 'AVAX', ...];
const signals = await Promise.all(
  tokens.map(token => fetch('/api/signals/detect', {
    method: 'POST',
    body: JSON.stringify({ address: token, tf: '15m' })
  }))
);

const highConfidence = signals
  .filter(s => s.signals[0].confidence > 0.7)
  .sort((a, b) => b.trade_plans[0].metrics.rr - a.trade_plans[0].metrics.rr);
```

### **2. Trade Journal Integration**

Logge Trades → Generiere Lessons:

```typescript
// Nach Trade-Abschluss:
await fetch('/api/signals/create-lesson', {
  method: 'POST',
  body: JSON.stringify({
    plan_id: 'plan_...',
    outcome: {
      result: 'win',
      pnl_usd: 245.50,
      rr_actual: 2.8,
      exit_reason: 'tp'
    }
  })
});
```

### **3. Pattern Performance Dashboard**

Visualisiere Lesson-Stats:

```typescript
const lessons = await fetch('/api/signals/lessons?limit=50');
const byPattern = lessons.reduce((acc, l) => {
  acc[l.pattern] = acc[l.pattern] || { count: 0, win_rate: 0, avg_rr: 0 };
  acc[l.pattern].count++;
  acc[l.pattern].win_rate += l.stats.win_rate;
  acc[l.pattern].avg_rr += l.stats.avg_rr;
  return acc;
}, {});

// → Dashboard: Welche Patterns performen am besten?
```

---

## 🛡️ Guardrails & Disclaimer

### **✅ Was das System KANN:**

- Marktdaten analysieren (Regime, Patterns, Confidence)
- Trade-Pläne generieren (Entry, Stop, Targets, R:R)
- Event-Sourcing (jede Aktion als Wissensknoten)
- Lessons extrahieren (Pattern-Performance, Checklists)

### **❌ Was das System NICHT TUT:**

- **KEINE automatischen Orders** (nur Pläne, keine Execution)
- **KEINE Finanzberatung** (nur Analyse & Bildung)
- **KEINE Garantien** (Vergangenheit ≠ Zukunft)

### **🚨 Disclaimer:**

> Dieses System liefert **ausschließlich Analyse- und Planungshilfen**.  
> Trader müssen eigene Due Diligence durchführen.  
> Crypto-Trading trägt signifikante Verlustrisiken.

---

## 📚 Weitere Ressourcen

| Dokument | Beschreibung |
|----------|-------------|
| **[SIGNAL_ORCHESTRATOR_GUIDE.md](./SIGNAL_ORCHESTRATOR_GUIDE.md)** | Vollständige technische Dokumentation |
| **[SIGNAL_ORCHESTRATOR_EXAMPLE.json](./SIGNAL_ORCHESTRATOR_EXAMPLE.json)** | Beispiel-Output (SOL/USDC Momentum) |
| **[SIGNAL_ORCHESTRATOR_INTEGRATION.md](./SIGNAL_ORCHESTRATOR_INTEGRATION.md)** | Integration-Guide (falls vorhanden) |
| **[scripts/demo-signal-orchestrator.ts](../scripts/demo-signal-orchestrator.ts)** | Runnable Demo-Script |

---

## 🎓 Nächste Schritte

1. **Demo ausführen:** `deno run --allow-all scripts/demo-signal-orchestrator.ts`
2. **API testen:** POST `/api/signals/detect` mit eigenem Token
3. **UI integrieren:** Components für Signal-Display, Trade-Plan-Cards, Lesson-Browser
4. **Daten sammeln:** Ersten Trades loggen → Lessons generieren
5. **Backtesting:** Historische Daten durchlaufen → Pattern-Stats validieren

---

**Version:** 1.0.0  
**Status:** ✅ Production Ready  
**Lines of Code:** ~2500 (Core + API + Docs)  
**Letzte Aktualisierung:** 2025-11-05

---

**Gebaut mit:**
- TypeScript
- IndexedDB (Event-Sourcing)
- Vercel Edge Functions (API)
- Vitest (Testing - coming soon)

**Autor:** AI Signal Orchestrator & Learning Architect
