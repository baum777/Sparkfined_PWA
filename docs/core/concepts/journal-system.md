---
title: "Trading-Journal Spezifikation"
summary: "Kernmodelle, Komponenten und API-Verhalten des Sparkfined Journals."
sources:
  - docs/archive/raw/2025-11-12/JOURNAL_SPECIFICATION.md
  - src/sections/journal/JournalEditor.tsx
  - src/sections/journal/JournalList.tsx
  - src/sections/journal/JournalStats.tsx
  - src/sections/journal/useJournal.ts
  - src/pages/JournalPage.tsx
  - src/lib/journal.ts
---

<!-- merged_from: docs/archive/raw/2025-11-12/JOURNAL_SPECIFICATION.md -->

## Ziel & Scope
- Vollwertiges Trading-Journal mit Ideen → Trade Lifecycle → Retrospektive.
- Frontend React-Komponenten + Edge-API `/api/journal` + lokale Persistenz über `useJournal` (Dexie/localStorage).

## Typen & Validierung
- `Timeframe` erweitert um `30m`, `1w`; Validierung via `isTimeframe`, Optionen `TIMEFRAMES`.
- `TradeStatus` umfasst `idea`, `entered`, `running`, `winner`, `loser`, `breakeven`, `cancelled`; Metadaten in `TRADE_STATUS_META`.
- `JournalNote` enthält optionale Pricing-Felder, AI-Stempel (`aiAttachedAt`), Rule-Referenzen und Permalinks.
- `computeTradeMetrics` berechnet `pnl`, `pnlPercent`, `riskRewardRatio` mit Guards gegen NaN/0.

## UI-Bausteine
- **JournalEditor** — Accordion-Bereiche für Trading-Daten & Kontext, Live-Berechnung von R/R & PnL, Screenshot-Upload, Permalinks.
- **JournalList** — Karten mit Status-Badges, KPI-Badges, Filter (Search, `#tag`), Screenshot-Preview.
- **JournalStats** — Kennzahlen (Gesamt-PnL, Win Rate, Profit Factor, Setup-Rankings) + Statusverteilung.

## Hooks & Events
- `useJournal` verwaltet lokalen Store (`sparkfined.journal.v1`), normalisiert Werte, berechnet Kennzahlen bei `create/update`.
- Events: `journal:draft` (Chart → Draft), `journal:insert` (AI-Assistent) werden via `window` Dispatch verarbeitet.

## API-Verhalten
- `/api/journal` akzeptiert `POST` zum Erstellen/Aktualisieren (JSON), `GET` für Sync, `delete` Flag für Entfernen.
- `saveServer` nutzt Merge-Strategie (lokaler Draft + Overrides) und aktualisiert `serverNotes` nach Erfolg.
- Fehlerfälle halten lokalen Draft; Retry-Mechanismus noch offen.

