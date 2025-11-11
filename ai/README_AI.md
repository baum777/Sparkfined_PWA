# AI Orchestrator

Diese Dokumentation beschreibt den Trading-AI-Orchestrator für Sparkfined. Der Fokus liegt auf zwei Providern: **OpenAI** für Markt-Bullets und **Grok (xAI)** für Social-Sentiment und Narrative.

## Architekturüberblick

```
[Client Payload]
      ↓
[AIOrchestrator.generateAnalysis]
      ↓
┌──────────────┬────────────────────┐
│OpenAI Client │ Grok Client        │
│(Marktbullet) │ (Social Analysis)  │
└─────┬────────┴────────────┬───────┘
      ↓                     ↓
[Validation + Sanity Checks]
      ↓                     ↓
[Merge Layer + Journal Fields]
      ↓
[Telemetry → telemetry/ai/events.jsonl]
```

## Setup

1. Kopiere `.env.example` zu `.env.local` (falls nicht vorhanden) und ergänze folgende Keys:
   - `OPENAI_API_KEY`
   - `GROK_API_KEY`
   - `DEFAULT_UI_MODEL` (optional, default `gpt-4o-mini`)
   - `AI_TELEMETRY_ENDPOINT` (optional, für Remote-Streaming)
2. Stelle sicher, dass Node ≥ 20 installiert ist.
3. Installiere Dependencies: `pnpm install`.

## Verwendung

```ts
import { AIOrchestrator } from "../ai/orchestrator";
import payload from "../ai/tests/fixtures/btc_payload.json" assert { type: "json" };

const orchestrator = new AIOrchestrator();
const posts = await fetchSocialPosts(payload.ticker);
const result = await orchestrator.generateAnalysis(payload, { posts });
const journalReady = mergeJournalFields(result);
```

### Sampling & Trigger

- `includeSocial=true` im Payload erzwingt Grok-Aufruf.
- Ohne Flag wird Grok nur anhand der Sampling-Rate (Default 10 %) getriggert.

## Tests

- Unit Tests: `pnpm test -- --runInBand ai/tests/orchestrator.test.ts`
- Coverage: Bestandteil von `pnpm test`.

## Telemetry

- Jede Provider-Response erzeugt einen JSONL-Eintrag unter `telemetry/ai/events.jsonl`.
- Felder: `provider`, `model`, `latencyMs`, optionale `costUsd` (falls verfügbar).

## Beispiel-cURL

```
curl -X POST http://localhost:3000/api/ai/assist \
  -H "Authorization: Bearer $AI_PROXY_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "provider":"openai",
    "templateId":"v1/analyze_bullets",
    "vars":{
      "address":"So1111111111",
      "tf":"1h",
      "metrics":{"lastClose":58200,"change24h":2.1}
    }
  }'
```

## Acceptance Criteria

- 4–7 Bullets, max 20 Wörter, Quellenangabe.
- Social-Analyse nur bei Opt-in oder Sampling-Hit.
- `social_review_required` wenn Confidence < 0.6 oder Bot-Ratio ≥ 0.4.
- Telemetry-Eintrag pro Provider-Call.
