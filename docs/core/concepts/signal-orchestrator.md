---
title: "Signal Orchestrator Konzept"
summary: "Architektur, Datenflüsse und Integrationspfade für den AI-basierten Signal Orchestrator."
sources:
  - docs/archive/raw/2025-11-12/SIGNAL_ORCHESTRATOR_INTEGRATION.md
  - docs/archive/raw/2025-11-12/SIGNAL_ORCHESTRATOR_USE_CASE.md
  - docs/archive/raw/2025-11-12/SIGNAL_ORCHESTRATOR_EXAMPLE.json
  - src/lib/signalOrchestrator.ts
  - src/lib/signalDb.ts
  - src/types/signal.ts
---

<!-- merged_from: docs/archive/raw/2025-11-12/SIGNAL_ORCHESTRATOR_INTEGRATION.md; docs/archive/raw/2025-11-12/SIGNAL_ORCHESTRATOR_USE_CASE.md; docs/archive/raw/2025-11-12/SIGNAL_ORCHESTRATOR_EXAMPLE.json -->

## Architektur-Layer
- **Detection:** `detectSignal(snapshot, heuristics, regime)` klassifiziert Muster (pattern, confidence, direction).
- **Trade Planning:** `generateTradePlan` erzeugt Entry/Stop/Targets inkl. Risk/Reward, Position-Sizing.
- **Action Graph:** `createActionNode` baut Ereignisknoten (signal.detected → trade.plan.created → outcome.*) mit Tags.
- **Learning Layer:** `extractLesson` destilliert Insights aus Outcomes; speichert in `lessons` Tabelle.

## Datenmodell (IndexedDB)
| Tabelle | Inhalt |
| --- | --- |
| `signals` | Normalisierte Signale mit Thesis, Regime, Confidence. |
| `trade_plans` | Risiko-Profile, Entry/Stop/Targets, Expectancy. |
| `action_nodes` | Event-Sourcing-Knoten (Typ, Meta, Tags, Confidence). |
| `trade_outcomes` | Performance nach Ausführung (PnL, Dauer, Replay-Link). |
| `lessons` | Verdichtete Learnings mit Bezug zu Signals/Plans. |
| `edges` | Beziehungen (CAUSES, FOLLOWS, INVALIDATES). |

### Dexie Kernel (M20)
- **Neue Stores:** `signals`, `rules` mit Indexen auf `symbol`, `ruleId`, `enabled` für schnelle Filter.
- **CRUD-APIs:** `createSignal`, `getSignalsForSymbol(limit?)`, `markSignalTriggered`, `createRule`, `getActiveRules`, `disableRule`.
- **Scope-Trennung:** Legacy-Graph-Funktionen liegen in `src/lib/legacySignalDb.ts`, während `src/lib/signalDb.ts` die schlanke Rule/Signal-DB kapselt.

### Strategien & Orchestrator (M21)
- **Breakout:** `detectBreakout(series, rule)` prüft die letzten *N* Candles und erzeugt ein bullishes/bearishes Signal, wenn der Close über dem Lookback-High bzw. unter dem Lookback-Low (optional mit Multiplikator) liegt. Siehe `src/lib/signals/strategies/breakout.ts`.
- **Volume Spike:** `detectVolumeSpike(series, rule)` vergleicht das aktuelle Volumen mit dem Durchschnitt der letzten *N* Kerzen und markiert Spikes (`spikeMultiplier` > ØVolumen). Siehe `src/lib/signals/strategies/volumeSpike.ts`.
- **scanForSignals:** Der Orchestrator (`src/lib/signalOrchestrator.ts`) lädt je Rule OHLC-Daten (`fetchOHLC` Callback), wählt anhand von `rule.strategy` die passende Detection, schreibt Treffer via `createSignal` in den Dexie-Store und liefert die neuen Signals zurück. Fehler pro Rule werden geloggt, blockieren den Rest aber nicht.

## Integrationspfad
1. **Analyse** – Chart/Analyze liefert `MarketSnapshot` + `HeuristicAnalysis`.
2. **Signal Pipeline** – Call `processMarketData` (siehe `signalOrchestrator.ts` Blueprint) → persistiert Signal + Action Nodes.
3. **Plan Review UI** – Komponenten wie `SignalReviewCard` visualisieren Confidence, Regime, R:R.
4. **Outcome Tracking** – Nach Trade aktualisiert `trade_outcomes`, löst Lesson-Extraction aus.
5. **Feedback Loop** – Lessons erscheinen im Journal/Board; AI kann Textbausteine generieren.

## Beispiel-Output
```json
{
  "signal": {
    "pattern": "breakout",
    "confidence": 0.72,
    "direction": "long"
  },
  "plan": {
    "entry": { "price": 1.23 },
    "risk": { "stop": 1.15, "size": 0.01 },
    "targets": [{ "price": 1.36, "probability": 0.6 }],
    "metrics": { "rr": 1.5, "expectancy": 0.8 }
  },
  "graph": {
    "nodes": ["signal.detected", "trade.plan.created"],
    "edges": [["signal.detected", "trade.plan.created", "CAUSES"]]
  }
}
```

## Use-Case Highlights
- **AI Feedback Loop:** Lessons füttern Playbooks und Journal-Prompts für kontinuierliches Lernen.
- **Token Gating:** Hochwertige Signale können über Access Rank freigeschaltet werden.
- **Automation Hooks:** Action Graph erlaubt Webhooks oder Execution Bots über definierte Edges.

