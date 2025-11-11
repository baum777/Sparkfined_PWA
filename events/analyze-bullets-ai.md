---
title: "Analyze KPI Bullets (AI Proxy)"
id: "events/analyze-bullets-ai"
agent: "anthropic"
priority: "high"
trigger: "User klickt \"Generieren\" im Analyze-Dashboard"
tags: ["analyze","signals","ai-proxy"]
created: "2025-11-11"
---

## 1) Kurzbeschreibung (one-liner)
Erzeugt taktische Analyse-Bullets auf Basis von KPIs & Signal-Matrix über die AI-Proxy-Route.

## 2) Trigger (auslösendes Ereignis)
- Quelle: UI (AnalyzePage React Component)
- Event-Name: `analyze.ai.bullets`
- Auslöser-Bedingungen: `button.click('Generieren') && metrics && matrix`

## 3) Payload (expected input)
```json
{
  "provider": "anthropic",
  "model": "claude-3-5-sonnet-latest",
  "templateId": "v1/analyze_bullets",
  "vars": {
    "address": "So11111111111111111111111111111111111111112",
    "tf": "15m",
    "metrics": {
      "lastClose": 0.000043,
      "change24h": 8.4,
      "volStdev": 0.12,
      "atr14": 0.000002,
      "hiLoPerc": 15.6,
      "volumeSum": 1240000
    },
    "matrixRows": [
      { "id": "SMA", "values": [1, 1, 0, -1] }
    ]
  },
  "maxOutputTokens": 800,
  "maxCostUsd": 0.15
}
```

## 4) Pre- & Postconditions

* Preconditions: Nutzer hat OHLC-Daten geladen (`fetchOhlc` erfolgreich); `AI_PROXY_SECRET` Header vorhanden; Consent für AI-Analyse dokumentiert.
* Postconditions: Ergebnis erscheint im Analyze-Panel (`aiResult.text`); optionaler Broadcast per `window.dispatchEvent('journal:insert')` verfügbar; Token Counter aktualisiert.

## 5) Security & Privacy

* Data sensitivity: Moderate (Marktdaten, keine direkten PII, jedoch indirekte Strategien → vertraulich).
* Redaction rules: Keine PII erwartet; stelle sicher, dass zusätzliche Notizen vor dem Versand sanitisiert sind.
* Token handling: Provider-Keys serverseitig verwalten; monatliche Rotation; `AI_PROXY_SECRET` als Edge-config (Vercel) speichern.

## 6) Agent-Instruktion (copy-paste ready)

```
ROLE: Du bist "Sparkfined Technical Bullet Writer".
INPUT: JSON {
  "address": "string",
  "tf": "string",
  "metrics": { "lastClose": number, "change24h": number, "volStdev": number, "atr14": number, "hiLoPerc": number, "volumeSum": number },
  "matrixRows": Array<{ "id": string, "values": number[] }>
}
TASK: Erstelle 4-7 Bulletpoints in Deutsch: (1) Marktstatus, (2) Momentum/Trend, (3) Risiko/Volatilität, (4) mögliche Trades. Ergänze konkrete Werte.
OUTPUT: Reine JSON-Antwort im Schema: { "bullets": string[], "confidence": number, "nextSteps": string[] }
RULES: - Kein Disclaimer, keine Emojis
       - Jede Zahl mit Einheit versehen
       - Max 3 Begriffe pro Bullet kursiv hervorheben → Markdown `_` verwenden
```

## 7) Workflow (Diagram + Steps)

```
[Analyze Page Metrics]
      ↓ (Generieren)
[useAssist.runTemplate]
      ↓ (fetch /api/ai/assist)
[Edge AI Proxy]
      ↓ (Template Rendering)
[Anthropic/OpenAI/xAI API]
      ↓
[Proxy Response Payload]
      ↓
[Analyze UI Result + Broadcast]
```

Step-by-step:

1. Nutzer lädt Markt-Daten → `metrics` & `matrixRows` stehen bereit.
2. Button „Generieren“ ruft `runTemplate('v1/analyze_bullets', vars)`.
3. Hook sendet POST `/api/ai/assist` mit Template, Provider-Guards und Kostenlimit.
4. Proxy rendert Template (`render('v1/analyze_bullets', vars)`), prüft Caps, cached optional.
5. Provider antwortet mit Bullets, Proxy annotiert Kosten & Usage.
6. Frontend zeigt Ergebnis, bietet Insert ins Journal & One-Click-Idea an.

## 8) Example Call (cURL / Node)

```bash
curl -X POST "https://app.sparkfined.example/api/ai/assist" \
 -H "Authorization: Bearer ${AI_PROXY_SECRET}" \
 -H "Content-Type: application/json" \
 -d '{
       "provider":"anthropic",
       "model":"claude-3-5-sonnet-latest",
       "templateId":"v1/analyze_bullets",
       "vars":{
         "address":"So11111111111111111111111111111111111111112",
         "tf":"15m",
         "metrics":{"lastClose":0.000043,"change24h":8.4,"volStdev":0.12,"atr14":0.000002,"hiLoPerc":15.6,"volumeSum":1240000},
         "matrixRows":[{"id":"SMA","values":[1,1,0,-1]}]
       },
       "maxOutputTokens":800,
       "maxCostUsd":0.15
     }'
```

## 9) Expected Response (schema + example)

```json
{
  "ok": true,
  "provider": "anthropic",
  "model": "claude-3-5-sonnet-latest",
  "ms": 1620,
  "text": "- Marktstatus: ...",
  "usage": { "input_tokens": 540, "output_tokens": 210 },
  "costUsd": 0.0014,
  "fromCache": false
}
```

## 10) Retry / Error Handling

* Retries: Nutzer kann erneut klicken; Proxy implementiert 3 Backoff-Retries bei 429/5xx.
* Idempotency key: Template + Vars Hash (`SHA-256(JSON.stringify(vars))`).
* Fallback: Zeige Hinweis „AI nicht verfügbar“; biete Download der rohen KPIs an.

## 11) Observability & Metrics

* Metrics: `ai.assist.template_calls{template="v1/analyze_bullets"}`, `ai.assist.cache_hit`, `ai.assist.error_rate`.
* Logs: JSON mit `trace_id`, `address`, `tf`, `provider`, `cached`, `cost_estimate`.

## 12) Cost / Rate Limit Considerations

* Estimate calls per month: ~1.8k (150 aktive Nutzer × 0.4 Aufrufe/Tag × 30 Tage).
* Empfehlung: Bei hohem Traffic Response-Caching (TTL `AI_CACHE_TTL_SEC` ≥ 600) aktivieren; `maxCostUsd` ≤ 0.2 lassen.

## 13) Tests / Acceptance Criteria

* Unit test: Template-Renderer gibt erwartete Strings zurück.
* Integration test: POST mit Fixture-Matrix → Response enthält ≥4 Bullets.
* Smoke test: Live-Call auf Staging → 200 + `provider` Feld gesetzt.

## 14) Assumptions

* `AI_PROXY_SECRET` wird vor Go-Live im Frontend-Fetch ergänzt.
* Provider-Defaults bleiben Anthropics Claude; OpenAI/xAI kompatibel zum Prompt.
* Signal-Matrix enthält maximal 6 Zeilen → Prompt bleibt < 10k Zeichen.

## 15) Change log

* v0.1 created 2025-11-11 by Codex

