# API-Skizze - “Reasoning Layer” mit DeepSeek-R1 
*https://replicate.com/deepseek-ai/deepseek-r1*

* **4 Kern-Endpunkte:**
1. Trade-Review
2. Session-Review
3. Board/Watchlist-Szenarien
4. Insight-Critic (R1 bewertet andere LLM-Outputs)

## Mögliche einbindung - bsp.

* **Frontend**
  * Pro Seite (Trade-Detail, Session-View, Board) einen Hook/Service:
    * `useTradeReviewInsight(tradeId)`
    * `useSessionReviewInsight(sessionId)`
    * `useBoardScenarios(boardId)`
  * Diese Services callen die oben genannten Endpoints und liefern direkt ein typisiertes `ReasoningResponse`.

* **Backend / BFF**
  * Implementiert o.g. Endpoints.
  * Mappt deine Domain-Modelle → Request-Schemata.
  * Spricht DeepSeek-R1 über seinen eigenen Client, macht:
    * Prompting,
    * JSON-Parsing & Schema-Validation,
    * Error-Handling (Time-Out, Retry, Fallback).


## 0. Basics

**Base URL (Beispiel)**
`/api/reasoning/*` – eigener Service oder BFF-Route.

**Gemeinsames Response-Envelope**

```ts
type ReasoningResponse<TPayload> = {
  id: string;                 // interne Reasoning-Request-ID
  model: string;              // z.B. "deepseek-r1-32b"
  version: string;            // Prompt-/Pipeline-Version
  confidence: number;         // 0–1 (interne Heuristik)
  payload: TPayload;          // inhaltliches Ergebnis (siehe unten)
  meta?: {
    latency_ms?: number;
    tokens_in?: number;
    tokens_out?: number;
    warnings?: string[];
  };
};
```

**Fehler-Envelope**

```ts
type ReasoningError = {
  error: {
    code: string;             // z.B. "VALIDATION_ERROR" | "LLM_TIMEOUT"
    message: string;
    details?: any;
  };
};
```

---

## 1. Trade Review – `POST /api/reasoning/trade-review`

Ziel: **Post-Mortem für einen Trade**: Ursachen, Evidenz, Alternativen, konkrete Regeln.

### Request

```ts
// High-Level
POST /api/reasoning/trade-review
Content-Type: application/json
```

```ts
type TradeReviewRequest = {
  user_context: {
    user_id: string;
    profile: {
      experience_level: "beginner" | "intermediate" | "advanced";
      style: "scalper" | "daytrader" | "swing" | "position";
      risk_profile: "conservative" | "balanced" | "aggressive";
      timezone?: string;
    };
    playbook_rules?: string[];   // komprimierte Regeln, IDs oder kurze Texte
  };

  trade: {
    id: string;
    timestamp_open: string;      // ISO
    timestamp_close: string;     // ISO
    instrument: string;          // z.B. "NQ", "AAPL", ...
    direction: "long" | "short";
    size: number;
    entry_price: number;
    exit_price: number;
    stop_price?: number;
    target_price?: number;
    setup_tag?: string;          // z.B. "Breakout", "MeanRevert"
  };

  metrics: {
    r_multiple: number;
    pnl_abs: number;
    pnl_pct: number;
    max_favorable_excursion?: number;
    max_adverse_excursion?: number;
    heat_pct_balance?: number;
    rule_violations?: {
      code: string;             // z.B. "OVERSIZED", "NO_STOP"
      description: string;
      severity: "low" | "medium" | "high";
    }[];
  };

  context: {
    session_id?: string;
    market_snapshot?: {
      volatility_regime?: "low" | "normal" | "high";
      trend_context?: "uptrend" | "downtrend" | "range" | "choppy";
      event_risk?: "none" | "minor" | "major"; // z.B. FOMC
    };
    previous_trades_short?: {
      count_last_hour: number;
      consecutive_losses: number;
      consecutive_wins: number;
    };
  };

  journal: {
    pre_plan?: string;          // kurzer Plan vor dem Trade
    during_trade_notes?: string;
    post_mortem_note?: string;
    emotions_self_report?: string;
  };
};
```

### Response-Payload

```ts
type TradeReviewPayload = {
  summary: {
    trade_quality: "poor" | "mixed" | "good" | "excellent";
    headline: string;              // 1-Satz-Zusammenfassung
    key_takeaway: string;          // wichtigster Lerneffekt
  };

  root_causes: {
    label: string;                 // z.B. "Impatience", "Risk Misalignment"
    description: string;
    evidence_refs: string[];       // kurze Texte mit Bezug auf metrics/journal
    impact: "low" | "medium" | "high";
  }[];

  supporting_evidence: {
    source: "metrics" | "journal" | "context";
    description: string;
  }[];

  counterfactuals: {
    scenario: string;              // "Entry 5 Minuten später", "Size halbiert"
    expected_effect: string;       // textuelle Beschreibung
  }[];

  actionable_rules: {
    rule_id?: string;              // optional: Link zu bestehender Playbook-Regel
    title: string;
    description: string;
    timeframe: "next_trade" | "this_week" | "long_term";
  }[];
};
```

**Finale Response**

```ts
type TradeReviewResponse = ReasoningResponse<TradeReviewPayload> | ReasoningError;
```

---

## 2. Session Review – `POST /api/reasoning/session-review`

Ziel: **ganze Session** bewerten, Muster erkennen, Fokus-Regeln ableiten.

### Request

```ts
POST /api/reasoning/session-review
Content-Type: application/json
```

```ts
type SessionReviewRequest = {
  user_context: TradeReviewRequest["user_context"];

  session: {
    id: string;
    date: string;                 // ISO (nur Datum oder Startzeit)
    timezone: string;
    session_label?: string;       // z.B. "London Open", "NY Afternoon"
    total_trades: number;
    net_pnl: number;
    avg_r_multiple: number;
    max_drawdown_r: number;
    max_runup_r: number;
    rule_violations_agg: {
      code: string;
      count: number;
      severity: "low" | "medium" | "high";
    }[];
  };

  trade_buckets: {
    setup_tag?: string;
    time_bucket?: string;         // z.B. "first_hour", "mid_session"
    count: number;
    avg_r: number;
    winrate: number;
    notes_excerpt?: string;
  }[];

  psychological_notes?: string;   // Tagesjournal / Stimmungs-Check
};
```

### Response-Payload

```ts
type SessionReviewPayload = {
  session_assessment: {
    overall_grade: "F" | "D" | "C" | "B" | "A";
    headline: string;
    summary: string;
  };

  key_patterns: {
    type: "strength" | "weakness" | "risk" | "opportunity";
    title: string;
    description: string;
    evidence: string[];
  }[];

  focus_areas: {
    label: string;                // z.B. "Sizing", "Overtrading"
    reason: string;
    suggested_kpis: string[];     // was der User tracken sollte
  }[];

  session_rules: {
    title: string;
    description: string;
    priority: 1 | 2 | 3;         // 1 = höchste Priorität
  }[];
};
```

---

## 3. Board / Watchlist Szenarien – `POST /api/reasoning/board-scenarios`

Ziel: **Risiko- / Was-wäre-wenn-Szenarien** für geplante Trades / Watchlist.

### Request

```ts
POST /api/reasoning/board-scenarios
Content-Type: application/json
```

```ts
type BoardScenariosRequest = {
  user_context: TradeReviewRequest["user_context"];

  portfolio_state: {
    balance: number;
    open_risk_r: number;             // Summe geplantes Risk in R
    max_daily_risk_allowed: number;
    open_positions: {
      instrument: string;
      direction: "long" | "short";
      size: number;
      entry_price: number;
      stop_price: number;
      current_price: number;
      risk_r: number;
    }[];
  };

  planned_trades: {
    temp_id: string;
    instrument: string;
    direction: "long" | "short";
    size: number;
    planned_entry: number;
    planned_stop: number;
    planned_target?: number;
    setup_tag?: string;
    confidence_self_report?: "low" | "medium" | "high";
  }[];

  market_context?: {
    volatility_regime?: "low" | "normal" | "high";
    main_drivers?: string[];         // z.B. ["FOMC", "Earnings Season"]
  };
};
```

### Response-Payload

```ts
type BoardScenariosPayload = {
  portfolio_risk_assessment: {
    headline: string;
    risk_level: "within_limits" | "near_limit" | "breach";
    description: string;
    rule_violations?: {
      code: string;
      description: string;
      related_trade_ids?: string[];
    }[];
  };

  trade_scenarios: {
    planned_trade_id: string;       // temp_id from request
    scenario_summaries: {
      scenario_name: string;        // "Normal Vol", "High Vol Spike" etc.
      expected_outcome: string;     // verbale Beschreibung
      notes: string;
    }[];
    caution_flags?: {
      label: string;                // "Correlated Risk", "Oversized"
      description: string;
      severity: "low" | "medium" | "high";
    }[];
  }[];

  recommended_actions: {
    title: string;
    description: string;
    applies_to: "portfolio" | "specific_trades";
    related_trade_ids?: string[];
  }[];
};
```

---

## 4. Insight Critic – `POST /api/reasoning/insight-critic`

Ziel: DeepSeek-R1 bewertet / verfeinert **Kandidaten-Insights anderer Modelle** (Claude, GPT) auf Basis deiner Metriken.

### Request

```ts
POST /api/reasoning/insight-critic
Content-Type: application/json
```

```ts
type InsightCriticRequest = {
  context: {
    context_type: "trade" | "session" | "board" | "generic";
    reference_id: string;           // Trade-ID, Session-ID, Board-ID etc.
  };

  artifacts: {
    // dieselben Facts, die das Base-LLM hatte
    metrics: any;                   // flexibel: dein internes Schema (oder Link)
    short_context_text?: string;    // knapp komprimierter Kontext
  };

  candidate_insights: {
    id: string;
    source: "claude" | "gpt" | "internal";
    text: string;
    metadata?: {
      created_at?: string;
    };
  }[];

  options?: {
    max_final_insights?: number;    // Default: 1–2
  };
};
```

### Response-Payload

```ts
type InsightCriticPayload = {
  evaluated_candidates: {
    id: string;                     // Candidate-ID
    score_relevance: number;        // 0–1
    score_correctness: number;      // 0–1 (nur basierend auf gelieferten Facts)
    score_actionability: number;    // 0–1
    issues?: string[];              // erkannte Probleme / Halluzinationen
  }[];

  final_insights: {
    id: string;                     // neue ID
    derived_from?: string[];        // Candidate-IDs
    text: string;                   // finaler, ggf. überarbeiteter Insight
    tags?: string[];                // z.B. ["risk", "psychology", "pattern"]
  }[];

  notes_for_system?: string;        // intern, nicht an User durchreichen
};
```

---


