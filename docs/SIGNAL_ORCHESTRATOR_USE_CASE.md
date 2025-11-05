# Signal Orchestrator Use Case: SOL Momentum Breakout

**Scenario:** User uploads SOL/USDC chart showing bullish momentum. System detects signal, generates plan, and tracks outcome.

---

## 🔄 COMPLETE WORKFLOW

### Input: MarketSnapshot + HeuristicAnalysis

```typescript
const snapshot: MarketSnapshot = {
  token: {
    address: "So11111111111111111111111111111111111111112",
    symbol: "SOL",
    name: "Solana",
    chain: "solana",
    decimals: 9
  },
  price: {
    current: 142.50,
    high24h: 145.80,
    low24h: 138.20,
    change24h: 3.2
  },
  volume: {
    volume24h: 2500000,
    volumeChange24h: 15
  },
  liquidity: {
    total: 2500000
  },
  metadata: {
    provider: "dexpaprika",
    timestamp: Date.now(),
    cached: false,
    confidence: 0.9,
    latency: 120
  }
}

const heuristics: HeuristicAnalysis = {
  supportLevel: 140.00,
  resistanceLevel: 145.00,
  rangeSize: "Medium",
  volatility24h: 0.05,
  bias: "Bullish",
  keyLevels: [140, 142.5, 145],
  roundNumbers: [140, 145, 150],
  entryZone: { min: 141.20, max: 143.00 },
  stopLoss: 140.00,
  takeProfit1: 147.00,
  takeProfit2: 151.00,
  confidence: 0.8,
  timestamp: Date.now(),
  source: "heuristic"
}

const regime: MarketRegime = {
  trend: "up",
  vol: "mid",
  liquidity: "high"
}
```

---

### Output: SignalOrchestratorOutput (JSON)

```json
{
  "action_graph_update": {
    "nodes": [
      {
        "id": "node_a1b2c3d4-e5f6-7890-abcd-ef1234567890",
        "type": "signal.detected",
        "ts_utc": "2025-11-04T22:30:00.000Z",
        "refs": {
          "signal_id": "sig_1234abcd-5678-90ef-ghij-klmn12345678",
          "plan_id": null,
          "trade_id": null,
          "prev_node_id": null
        },
        "payload": {
          "pattern": "momentum",
          "confidence": 0.72,
          "price": 142.50,
          "atr": 7.60
        },
        "tags": ["setup/momo", "chain/solana", "trend/up", "vol/mid"],
        "confidence": 0.72,
        "notes": "Detected via heuristic analysis + market snapshot"
      },
      {
        "id": "node_b2c3d4e5-f6g7-8901-bcde-fg2345678901",
        "type": "trade.plan.created",
        "ts_utc": "2025-11-04T22:30:15.000Z",
        "refs": {
          "signal_id": "sig_1234abcd-5678-90ef-ghij-klmn12345678",
          "plan_id": "plan_5678efgh-9012-34ij-klmn-op3456789012",
          "trade_id": null,
          "prev_node_id": "node_a1b2c3d4-e5f6-7890-abcd-ef1234567890"
        },
        "payload": {
          "entry_price": 142.50,
          "stop_loss": 131.10,
          "targets": [147.60, 153.85, 168.60],
          "rr": 2.45,
          "expectancy": 0.88,
          "risk_usd": 100
        },
        "tags": ["plan/created", "rr>2", "risk/1pct"],
        "confidence": 1.0
      }
    ],
    "edges": [
      ["node_a1b2c3d4-e5f6-7890-abcd-ef1234567890", "node_b2c3d4e5-f6g7-8901-bcde-fg2345678901", "CAUSES"]
    ]
  },
  
  "signals": [
    {
      "id": "sig_1234abcd-5678-90ef-ghij-klmn12345678",
      "timestamp_utc": "2025-11-04T22:30:00.000Z",
      "market": {
        "chain": "solana",
        "symbol": "SOL/USDC",
        "venue": "raydium"
      },
      "regime": {
        "trend": "up",
        "vol": "mid",
        "liquidity": "high"
      },
      "features": {
        "price": 142.50,
        "atr": 7.60,
        "rsi": 58,
        "ema_fast": 141.20,
        "ema_slow": 140.00,
        "onchain": {
          "holders_delta": 0,
          "liquidity_usd": 2500000,
          "top10_share": 0.3,
          "mint_age_days": 30
        },
        "risk_flags": []
      },
      "pattern": "momentum",
      "confidence": 0.72,
      "direction": "long",
      "thesis": "Strong momentum continuation in up trend with mid volatility, Entry zone: 141.20-143.00. Price above key support at $140, respecting EMA structure. Volume healthy at $2.5M liquidity.",
      "invalidation": {
        "price_below": 139.50,
        "time_expiry": "2025-11-05T02:30:00.000Z",
        "conditions": ["Break below $140 support", "EMA fast crosses below EMA slow"]
      }
    }
  ],
  
  "trade_plans": [
    {
      "id": "plan_5678efgh-9012-34ij-klmn-op3456789012",
      "signal_id": "sig_1234abcd-5678-90ef-ghij-klmn12345678",
      "entry": {
        "type": "limit",
        "price": 142.50,
        "valid_for": "30m",
        "slippage_tolerance": 0.5
      },
      "risk": {
        "stop": 131.10,
        "risk_pct_equity": 1.0,
        "pos_size_units": 8.77,
        "max_loss_usd": 100.00
      },
      "targets": [
        {
          "tp": 1,
          "price": 147.60,
          "share": 0.3
        },
        {
          "tp": 2,
          "price": 153.85,
          "share": 0.4
        },
        {
          "tp": 3,
          "price": 168.60,
          "share": 0.3
        }
      ],
      "metrics": {
        "rr": 2.45,
        "expectancy": 0.88,
        "win_prob": 0.72,
        "time_horizon": "2h-8h"
      },
      "checklist": [
        "regime_ok",
        "position_size_ok",
        "rugcheck_ok",
        "liquidity_ok",
        "slippage_ok"
      ],
      "notes": "Generated from momentum signal with 72% confidence. Strong momentum continuation in up trend with mid volatility, Entry zone: 141.20-143.00. Risk 1% of equity ($100). Partial exits at TP1 (30%), TP2 (40%), TP3 (30%).",
      "status": "pending",
      "created_at": "2025-11-04T22:30:15.000Z",
      "expires_at": "2025-11-04T23:00:15.000Z"
    }
  ],
  
  "lessons": [],
  
  "explanation": "Detected momentum continuation setup on SOL/USDC in uptrend (72% confidence). Price holding above $140 support with healthy liquidity. Generated trade plan: Entry $142.50, Stop $131.10 (1.5 ATR), Targets at 1.5R, 2.5R, 4R. Risk:Reward 2.45:1. Expectancy 0.88 per $1 risked. No risk flags detected. Checklist: Verify regime, liquidity, and slippage before execution.",
  
  "warnings": []
}
```

---

## 📝 EXPLANATION (<= 120 words)

Detected momentum continuation setup on SOL/USDC during uptrend with 72% confidence. Price respecting key support at $140 and EMA structure. Liquidity healthy at $2.5M. Generated trade plan with 2.45:1 risk:reward targeting partial exits at $147.60 (30%), $153.85 (40%), and $168.60 (30%). Stop loss at $131.10 represents 1.5 ATR risk. Position sized to risk exactly 1% of equity ($100). Expected value: $0.88 per $1 risked based on historical 72% win rate for momentum setups in similar regimes. No blockers detected. Invalidation: Price below $139.50 or EMA crossover. Plan expires in 30 minutes. Final checklist review required before execution.

---

## 🔄 FULL LIFECYCLE

### 1. Signal Detection → Node Created
- **Event:** `signal.detected`
- **Payload:** Pattern, confidence, price features
- **Tags:** `setup/momo`, `chain/solana`, `trend/up`

### 2. Plan Generation → Node Created
- **Event:** `trade.plan.created`
- **Payload:** Entry, stop, targets, R:R, expectancy
- **Edge:** `CAUSES` from signal node

### 3. Trade Execution (User Action)
- **Event:** `trade.opened`
- **Payload:** Fill price, slippage, actual position size
- **Edge:** `FOLLOWS` from plan node

### 4. Outcome Tracking
- **Event:** `takeprofit.hit` OR `stoploss.hit`
- **Payload:** PnL USD, PnL %, actual R:R, held duration
- **Edge:** `FOLLOWS` from trade node

### 5. Lesson Extraction (After 10+ Trades)
- **Event:** `lesson.curated`
- **Payload:** Pattern stats, win rate, avg R:R
- **Lesson:** "Momentum setups in SOL work best during NYC session..."

---

## 📊 PERFORMANCE TRACKING

After accumulating outcomes, the system generates:

```json
{
  "pattern_stats": {
    "pattern": "momentum",
    "total_signals": 25,
    "total_trades": 18,
    "win_rate": 0.68,
    "avg_rr": 2.8,
    "avg_pnl": 78.50,
    "sample_size": 18
  }
}
```

This feeds into Lesson generation:

```json
{
  "lesson": {
    "id": "lesson_xyz",
    "pattern": "momentum-breakout-solana",
    "when_it_works": "Works best in up trends with mid volatility. NYC session shows 68% win rate.",
    "when_it_fails": "Fails during Asia session low-volume periods or when breaking support.",
    "dos": [
      "Wait for EMA confirmation",
      "Check volume spike",
      "Take partials at TP1"
    ],
    "donts": [
      "Don't chase after 3% move",
      "Don't ignore invalidation levels",
      "Don't hold through resistance"
    ],
    "next_drill": "Backtest 50 historical momentum setups on SOL to validate 68% win rate.",
    "score": 0.72
  }
}
```

---

## 🎯 KEY BENEFITS

1. **Reproducibility:** Same inputs = same signal (deterministic)
2. **Transparency:** Every decision logged as action node
3. **Learning:** Patterns improve over time with feedback
4. **Risk Management:** Expectancy-based position sizing
5. **No Hallucination:** Grounded in price/volume/liquidity data

---

## 🔗 Next Steps

1. Integrate `detectSignal()` into ChartPage analysis flow
2. Build `SignalReviewCard` UI component
3. Add outcome tracking to Journal page
4. Create LessonsPage to display extracted wisdom
5. Build analytics dashboard for pattern performance

---

**Complete Code:**
- Types: `src/types/signal.ts`
- Logic: `src/lib/signalOrchestrator.ts`
- DB: `src/lib/signalDb.ts`
- Integration: `docs/SIGNAL_ORCHESTRATOR_INTEGRATION.md`
