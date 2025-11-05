# AI Signal Orchestrator & Learning Architect

## 🎯 Mission

Automatisierte **Marktdaten-Analyse**, **Signal-Generierung** und **Lernpfad-Extraktion** für Krypto-Märkte. Jede Aktion wird als **Wissensknoten** erfasst (Event-Sourcing), um eine kontinuierliche Lernkurve zu erzeugen.

---

## 📐 Architektur-Übersicht

```
┌──────────────────────────────────────────────────────────────┐
│                  SIGNAL ORCHESTRATOR                         │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  1. DATA INGESTION                                          │
│     ├─ OHLC (Candlestick) Data                             │
│     ├─ Market Snapshot (Price, Volume, Liquidity)          │
│     └─ On-Chain Metrics (Holders, Concentration)           │
│                                                              │
│  2. REGIME DETECTION                                        │
│     ├─ Trend (up/down/side) via EMA + Price Structure      │
│     ├─ Volatility (low/mid/high) via ATR                   │
│     ├─ Liquidity (low/mid/high) via Pool Depth             │
│     └─ Session (asia/london/nyc) + Phase (markup/dist)     │
│                                                              │
│  3. SIGNAL DETECTION                                        │
│     ├─ Pattern Recognition (breakout/reversal/momentum)     │
│     ├─ Confidence Scoring (0.0 - 1.0)                       │
│     ├─ Risk Flag Detection (rug/illiquid/dev_unverified)   │
│     └─ Thesis Generation (why this edge exists)            │
│                                                              │
│  4. TRADE PLAN GENERATION                                   │
│     ├─ Entry Logic (limit/market, valid_for)               │
│     ├─ Stop Loss (ATR-based, risk_pct_equity)              │
│     ├─ Take Profit Targets (partial exits at R:R levels)   │
│     ├─ Position Sizing (% equity risk model)               │
│     └─ Expectancy Calculation (win_prob * avg_win - ...)   │
│                                                              │
│  5. ACTION GRAPH (Event Sourcing)                          │
│     ├─ signal.detected                                      │
│     ├─ trade.plan.created                                   │
│     ├─ trade.opened / stoploss.hit / takeprofit.hit        │
│     └─ lesson.curated                                       │
│                                                              │
│  6. LESSON EXTRACTION                                       │
│     ├─ Pattern Performance Analysis (win_rate, avg_rr)     │
│     ├─ When It Works / When It Fails                       │
│     ├─ Checklist + Dos/Donts                               │
│     └─ Next Drill (practical exercise)                     │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 🔧 Implementation

### **Dateien**

| Datei | Beschreibung |
|-------|-------------|
| `src/types/signal.ts` | TypeScript-Schemas: Signal, TradePlan, ActionNode, Lesson |
| `src/lib/signalDb.ts` | IndexedDB-Layer für Event-Sourcing & Persistierung |
| `src/lib/signalOrchestrator.ts` | Core Logic: Signal Detection, Trade Plan Generation, Lesson Extraction |
| `src/lib/regimeDetection.ts` | Regime Detection: Trend/Volatility/Liquidity Classification |
| `api/signals/detect.ts` | API-Endpoint: Signal Detection + Trade Plan Generation |
| `api/signals/lessons.ts` | API-Endpoint: Lessons abrufen (nach Pattern/Score) |
| `api/signals/create-lesson.ts` | API-Endpoint: Lesson aus Trade Outcome generieren |

---

## 📊 Schemas

### 1️⃣ **Signal**

```typescript
{
  "id": "sig_<uuid>",
  "timestamp_utc": "2025-11-05T14:23:45.000Z",
  "market": {
    "chain": "solana",
    "symbol": "SOL/USDC",
    "venue": "raydium"
  },
  "regime": {
    "trend": "up",
    "vol": "mid",
    "liquidity": "high",
    "session": "london",
    "phase": "markup"
  },
  "features": {
    "price": 142.35,
    "atr": 3.42,
    "rsi": 62.5,
    "ema_fast": 141.20,
    "ema_slow": 138.90,
    "onchain": {
      "holders_delta": 245,
      "liquidity_usd": 2450000,
      "top10_share": 0.28,
      "mint_age_days": 890
    },
    "risk_flags": []
  },
  "pattern": "momentum",
  "confidence": 0.78,
  "direction": "long",
  "thesis": "Strong momentum continuation in uptrend..."
}
```

### 2️⃣ **TradePlan**

```typescript
{
  "id": "plan_<uuid>",
  "signal_id": "sig_<uuid>",
  "entry": {
    "type": "limit",
    "price": 142.35,
    "valid_for": "30m"
  },
  "risk": {
    "stop": 137.22,
    "risk_pct_equity": 1.0,
    "pos_size_units": 19.48
  },
  "targets": [
    { "tp": 1, "price": 150.03, "share": 0.3 },
    { "tp": 2, "price": 155.20, "share": 0.4 },
    { "tp": 3, "price": 162.91, "share": 0.3 }
  ],
  "metrics": {
    "rr": 2.8,
    "expectancy": 0.42,
    "win_prob": 0.78
  },
  "checklist": ["regime_ok", "liquidity_ok", "rugcheck_ok"],
  "status": "pending"
}
```

### 3️⃣ **ActionNode** (Event Sourcing)

```typescript
{
  "id": "node_<uuid>",
  "type": "signal.detected",
  "ts_utc": "2025-11-05T14:23:45.123Z",
  "refs": {
    "signal_id": "sig_<uuid>",
    "plan_id": null,
    "prev_node_id": null
  },
  "payload": {
    "pattern": "momentum",
    "confidence": 0.78,
    "regime": { "trend": "up", "vol": "mid" }
  },
  "tags": ["pattern/momentum", "confidence/78"],
  "confidence": 0.78
}
```

### 4️⃣ **Lesson**

```typescript
{
  "id": "lesson_<uuid>",
  "pattern": "momentum-breakout-london-session",
  "when_it_works": "Works best in uptrend with mid volatility...",
  "when_it_fails": "Fails when volume spike is fake...",
  "checklist": ["RSI not overbought", "Volume confirming"],
  "dos": ["Wait for regime confirmation", "Take partial profits"],
  "donts": ["Don't chase entries", "Don't ignore risk flags"],
  "next_drill": "Backtest this setup on 100+ samples...",
  "stats": {
    "trades_analyzed": 42,
    "win_rate": 0.68,
    "avg_rr": 2.6
  },
  "score": 0.68
}
```

---

## 🚀 API Usage

### **1. Signal Detection**

**Endpoint:** `POST /api/signals/detect`

**Request:**
```json
{
  "address": "So11111111111111111111111111111111111111112",
  "chain": "solana",
  "tf": "15m",
  "accountEquity": 10000,
  "riskPercentage": 1.0
}
```

**Response:** See [`SIGNAL_ORCHESTRATOR_EXAMPLE.json`](./SIGNAL_ORCHESTRATOR_EXAMPLE.json)

---

### **2. Fetch Lessons**

**Endpoint:** `GET /api/signals/lessons?pattern=momentum&min_score=0.5&limit=10`

**Response:**
```json
{
  "lessons": [
    {
      "id": "lesson_...",
      "pattern": "momentum-breakout-london-session",
      "score": 0.68,
      "when_it_works": "...",
      "when_it_fails": "...",
      "checklist": [...],
      "dos": [...],
      "donts": [...],
      "next_drill": "...",
      "stats": { "win_rate": 0.68, "avg_rr": 2.6 }
    }
  ]
}
```

---

### **3. Create Lesson from Trade Outcome**

**Endpoint:** `POST /api/signals/create-lesson`

**Request:**
```json
{
  "plan_id": "plan_...",
  "outcome": {
    "plan_id": "plan_...",
    "signal_id": "sig_...",
    "result": "win",
    "pnl_usd": 245.50,
    "pnl_pct": 2.45,
    "rr_actual": 2.8,
    "held_duration": 14400,
    "exit_reason": "tp"
  }
}
```

**Response:**
```json
{
  "lesson": { ... }
}
```

---

## 📈 Regime Detection Logic

### **Trend Detection**
- **EMA Crossover:** Fast EMA (9) vs Slow EMA (21)
- **Price Structure:** Higher highs/lows (uptrend) vs lower highs/lows (downtrend)
- **Slope Analysis:** EMA slope > 5% = strong trend

### **Volatility Classification**
- **ATR % of Price:**
  - `< 2%` = Low volatility
  - `2-5%` = Mid volatility
  - `> 5%` = High volatility

### **Liquidity Assessment**
- **Liquidity USD + Volume:**
  - `> $500k + high volume` = High liquidity
  - `> $100k` = Mid liquidity
  - `< $100k` = Low liquidity (avoid)

### **Session Detection**
- **Asia:** 00:00 - 08:00 UTC
- **London:** 08:00 - 16:00 UTC
- **NYC:** 16:00 - 21:00 UTC (overlap: 13:00-16:00)
- **Off-hours:** 21:00 - 24:00 UTC

---

## 🎓 Learning Architecture

### **Event Sourcing → Lesson Extraction**

1. **Capture Every Action:** Jede Aktion (Signal, Plan, Trade) wird als `ActionNode` gespeichert
2. **Link Nodes:** Edges verbinden Nodes (CAUSES, FOLLOWS, INVALIDATES)
3. **Analyze Outcomes:** Trade Outcomes werden Pattern-Signalen zugeordnet
4. **Extract Lessons:** Statistiken über Pattern-Performance → Lesson
5. **Curate Drills:** Next steps für kontinuierliche Verbesserung

---

## 🛡️ Guardrails

✅ **DOs:**
- Belege Annahmen (Datenquellen, Confidence-Scores)
- Kennzeichne Unsicherheit (confidence field)
- Prüfe Rug-Risiken, Liquidität, Spread vor jedem Plan

❌ **DON'Ts:**
- **Keine Kauf-/Verkaufsanweisungen** (nur Analyse & Plan-Vorschläge)
- **Keine Finanzberatung** (Disclaimer immer mitliefern)
- **Keine Halluzinationen** (nur messbare, reproduzierbare Outputs)

---

## 📦 Output Contract

**Jede Antwort MUSS diesem Format folgen:**

```typescript
{
  "action_graph_update": {
    "nodes": [ActionNode, ...],
    "edges": [["node_a", "node_b", "CAUSES"], ...]
  },
  "signals": [Signal, ...],
  "trade_plans": [TradePlan, ...],
  "lessons": [Lesson, ...],
  "explanation": "<= 120 words, plain language",
  "warnings": ["..."] // optional
}
```

---

## 🔬 Demo-Beispiel

Siehe vollständiges JSON-Beispiel: [`SIGNAL_ORCHESTRATOR_EXAMPLE.json`](./SIGNAL_ORCHESTRATOR_EXAMPLE.json)

**Scenario:** 15m Momentum-Push auf SOL/USDC  
**Regime:** Uptrend, mid volatility, high liquidity  
**Pattern:** Momentum continuation  
**Confidence:** 78%  
**R:R:** 2.8:1  
**Expectancy:** +42%

---

## 📚 Weitere Ressourcen

- **[SIGNAL_ORCHESTRATOR_INTEGRATION.md](./SIGNAL_ORCHESTRATOR_INTEGRATION.md)** - Integration Guide
- **[SIGNAL_ORCHESTRATOR_USE_CASE.md](./SIGNAL_ORCHESTRATOR_USE_CASE.md)** - Use Cases
- **[SIGNAL_UI_INTEGRATION.md](./SIGNAL_UI_INTEGRATION.md)** - UI Components

---

## 🚨 Disclaimer

> **Dieses System liefert KEINE Finanzberatung.**  
> Alle Signale, Pläne und Lessons sind ausschließlich zu Bildungs- und Analysezwecken.  
> Trader müssen eigene Due Diligence durchführen. Vergangenheit ≠ Zukunft.

---

**Version:** 1.0.0  
**Letzte Aktualisierung:** 2025-11-05  
**Autor:** AI Signal Orchestrator & Learning Architect
