---
title: "AI & Cortex Integrationsfahrplan"
summary: "Priorisierte AI-Features, Endpunkte und Implementierungshinweise."
sources:
  - docs/archive/raw/2025-11-12/CORTEX_INTEGRATION_PLAN.md
  - docs/archive/raw/2025-11-12/ENV_USAGE_OVERVIEW.md
  - src/sections/ai/useAssist.ts
  - src/lib/aiClient.ts
  - api/ai/assist.ts
---

<!-- merged_from: docs/archive/raw/2025-11-12/CORTEX_INTEGRATION_PLAN.md; docs/archive/raw/2025-11-12/ENV_USAGE_OVERVIEW.md -->

## Erste Ausbaustufe (Ready for Implementation)
| Feature | Aufwand | Beschreibung |
| --- | --- | --- |
| Token Risk Score | 4–6 h | KPI Tile + Detailmodal; Endpoint `api/cortex/risk-score` ruft Moralis Cortex. |
| Sentiment Analysis | 4–5 h | Aggregiert Social Sentiment, speist Board-Feed & KPIs. |
| AI Trade Idea Generator | 6–8 h | Kombiniert Analyze KPIs mit Cortex Vorschlägen, optionaler AI Draft für Journal. |

## Folgeideen
- Pattern Recognition (Chart-Muster), Whale Activity Alerts, Voice Commands.
- Integration in Signal Orchestrator für automatisierte Lessons.

## Technische Leitplanken
- API-Key Management über `.env` (`MORALIS_API_KEY`, `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`).
- `/api/ai/assist` fungiert als Proxy: entgegnet `provider`, `model`, `templateId`, `vars`; setzt Kostenlimits (`maxOutputTokens`, `maxCostUsd`).
- `useAssist` synchronisiert Tokenverbrauch mit `aiContext` + `localStorage`.
- Endpunkte für Cortex bauen auf `fetch` + Fallback Mock-Daten bei Fehlern.

## Deployment Hinweise
- Keys niemals clientseitig exposen; Edge Functions halten Secrets.
- Staging-Umgebung mit gedrosselten Limits; Production via env overrides.
- Monitoring: Telemetrie-Events für AI-Erfolg, Fehlerquote, Kosten.

