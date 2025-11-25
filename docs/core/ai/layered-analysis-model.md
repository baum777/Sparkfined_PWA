# Sparkfined TA-PWA – Layered Analysis Model (L1–L5)

This document captures the conceptual structure you defined as:

> From raw price watching → to structural market understanding.

## Layers

- **L1 – Structure Context**
  - Inhalt: Marktumfeld, Chartstruktur, Range, Trendwechsel, Key Levels.
  - Aufgabe: Beschreibt den strukturellen Zustand des Marktes (Range, Trend, Phasenwechsel).
  - Status: ✅ Auto (Heuristik).
  - Technische Abbildung:
    - `RangeStructure`
    - `KeyLevel[]`
    - Teil von `AdvancedInsightSections.market_structure`.

- **L2 – Flow & Volume**
  - Inhalt: Volumen, Orderflow, Wallet-Flow, Akkumulation.
  - Status: ⚙️ Teilweise (Volumen Δ).
  - Technische Abbildung:
    - `FlowVolumeSnapshot`
    - ggf. später: Walletflow-APIs (SolanaFlow / DEXT).
    - Teil von `AdvancedInsightSections.flow_volume`.

- **L3 – Tactical Setup**
  - Inhalt: Entry, TP1/TP2, SL, Bias, Risk, Pullback/Retest.
  - Status: ✅ Heuristik + manuell.
  - Technische Abbildung:
    - `BiasReading`
    - `PriceZone[]` (Support / Re-Entry / TP / SL).
    - `AdvancedInsightSections.playbook.entries`.

- **L4 – Macro Lens**
  - Inhalt: Stretch-Ziele, Macro-Zonen (42k/45k/68k), Momentum, Capitulation.
  - Status: 📝 Manual Input.
  - Technische Abbildung:
    - `MacroTag[]`
    - Teil von `AdvancedInsightSections.macro.tags`.

- **L5 – Indicators (Screenshot)**
  - Inhalt: RSI, Bollinger Bands.
  - Status: ✅ Auto (Tagging via OCR/Regex).
  - Technische Abbildung:
    - `IndicatorStatus[]`
    - Bestandteil von `MarketSnapshotPayload.indicator_status`.

## Helper Functions (Mini-Analysis Phase)

These helper functions are implied by your spec and map directly into the types in `ai_types.ts`:

- `computeRange(candles, windowHours) -> RangeStructure`
- `deriveBias(range: RangeStructure, candles: OhlcCandle[]) -> BiasReading`
- `proposeSetup(range, keyLevels, bias) -> PriceZone[]`
- `tagIndicatorsFromOCR(ocrResult: OcrResult) -> IndicatorStatus[]`

Each of these functions updates fields in `MarketSnapshotPayload` before the AI orchestrator runs.

## Integration Phases

- **Phase 2 – Mini-Analysis**
  - Ziel: Lokale Heuristik (L1–L3) als Auto-Suggestion bereitstellen.
  - Datenfluss:
    - OHLC + Dex-Volume → `MarketSnapshotPayload` (Range, Bias, Zones, Flow).
    - Optional Screenshot/OCR → `indicator_status`.

- **Phase 3 – Journal**
  - Schema-Erweiterung `TradeEntry`:
    - `bias`, `entry_zone`, `sl`, `tp_levels`, `key_levels`, `notes_playbook`.
  - Filter:
    - Filterbar nach Bias, Setup-Typ, Emotion, Volatilität.

- **Phase 5 – Export**
  - Export-Felder:
    - Token / Timeframe / Bias.
    - Entry / SL / TP1/TP2.
    - Range L/M/H + Key Levels.
    - Optional Screenshot/Chart-Snapshot.
