---
title: "AI Teaser Vision Analyse"
id: "events/teaser-vision-analysis"
agent: "openai"
priority: "medium"
trigger: "Client löst Screenshot-Analyse für Teaser-Karte aus"
tags: ["teaser","vision","client-side"]
created: "2025-11-11"
---

## 1) Kurzbeschreibung (one-liner)
Analysiert Chart-Screenshots + Marktdaten clientseitig über GPT-4o/Grok/Claude, um Teaser-Insights zu rendern.

## 2) Trigger (auslösendes Ereignis)
- Quelle: UI (Teaser-Komponente, sobald Nutzer Screenshot/Token auswählt)
- Event-Name: `teaser.analysis.request`
- Auslöser-Bedingungen: `getTeaserAnalysis(payload)` wird aufgerufen (z. B. nach Upload oder Refresh).

## 3) Payload (expected input)
```json
{
  "provider": "openai",
  "imageDataUrl": "data:image/png;base64,iVBORw0KGgo...",
  "ocrData": {
    "labels": ["RSI", "VWAP"],
    "indicators": { "rsi": 64 }
  },
  "dexData": {
    "price": 0.000043,
    "high24": 0.000052,
    "low24": 0.000031,
    "vol24": 1250000
  },
  "pumpfunData": {
    "symbol": "SOLX",
    "liquidity": 120000
  },
  "contractAddress": "So11111111111111111111111111111111111111112"
}
```

## 4) Pre- & Postconditions

* Preconditions: Browser besitzt gültigen API-Key (`OPENAI_API_KEY`/`GROK_API_KEY`/`ANTHROPIC_API_KEY`) via Env-Injection; Nutzer stimmt AI-Verarbeitung zu; Bilddaten sind ≤ 4 MB.
* Postconditions: Ergebnis (`AITeaserAnalysis`) enthält JSON mit SR-Levels, Stop, TP, Indikatoren und Teaser-Text; Fehler führen zu Heuristik-Fallback (`calculateHeuristic`).

## 5) Security & Privacy

* Data sensitivity: Hoch (enthält ggf. proprietäre Chart-Screenshots + Handelsstrategien).
* Redaction rules: Entferne PII in `ocrData.labels` bevor gesendet; maskiere Wallet-Adressen falls Nutzer-gebunden.
* Token handling: **Gefährlich** – Keys dürfen nicht dauerhaft im Client liegen. Empfohlen: Proxy-Call statt `dangerouslyAllowBrowser`. Keys regelmäßig rotieren (≤30 Tage), Storage nur in Memory.

## 6) Agent-Instruktion (copy-paste ready)

```
ROLE: Du bist "Sparkfined Vision Analyst".
INPUT: JSON { "image": "base64", "metrics": {...}, "indicators": string[] }
TASK: Leite Support/Resistance, Stop-Loss, Take-Profits und Kernaussagen aus dem Chart ab. Rückgabe muss das definierte JSON-Schema erfüllen.
OUTPUT: Reine JSON-Antwort im Schema: { "sr_levels": [{"label": "S1", "price": number, "type": "support"}], "stop_loss": number, "tp": number[], "indicators": string[], "teaser_text": string, "confidence": number }
RULES: - Keine Fließtexte außerhalb des JSON
       - Preise als Dezimalwerte mit 6 Stellen
       - Wenn keine Aussage möglich ist, `confidence` = 0 setzen
```

## 7) Workflow (Diagram + Steps)

```
[Teaser UI Action]
      ↓ (payload assemble)
[getTeaserAnalysis]
      ↓ (switch provider)
[OpenAI SDK im Browser]
      ↓ (Vision Request)
[Provider Response]
      ↓
[parseAIResponse]
      ↓
[Teaser Component Render]
```

Step-by-step:

1. UI sammelt Screenshot, OCR-, Dexscreener- & Pumpfun-Daten.
2. `getTeaserAnalysis(payload)` ermittelt Provider (Default: `import.meta.env.ANALYSIS_AI_PROVIDER`).
3. Bei `openai` wird `OpenAI({ apiKey, dangerouslyAllowBrowser:true })` instanziert.
4. Chat Completion `gpt-4o-mini` mit System- & User-Prompts + optionalem `image_url` wird gesendet.
5. Antwort wird geparst (`parseAIResponse`) → JSON extrahiert oder Fallback.
6. Fehler werfen Ausnahme → `catch` führt `getHeuristicTeaser` aus.

## 8) Example Call (cURL / Node)

```bash
curl -X POST "https://api.openai.com/v1/chat/completions" \
 -H "Authorization: Bearer ${OPENAI_API_KEY}" \
 -H "Content-Type: application/json" \
 -d '{
       "model":"gpt-4o-mini",
       "temperature":0.7,
       "max_tokens":500,
       "response_format":{"type":"json_object"},
       "messages":[
         {"role":"system","content":"You are an expert crypto trading analyst..."},
         {"role":"user","content":[
           {"type":"text","text":"Analyze this trading chart and provide technical analysis."},
           {"type":"image_url","image_url":{"url":"data:image/png;base64,iVBORw0KGgo..."}}
         ]}
       ]
     }'
```

## 9) Expected Response (schema + example)

```json
{
  "sr_levels": [
    { "label": "S1", "price": 0.000041, "type": "support" },
    { "label": "R1", "price": 0.000049, "type": "resistance" }
  ],
  "stop_loss": 0.000039,
  "tp": [0.000046, 0.000051],
  "indicators": ["RSI 64", "VWAP support"],
  "teaser_text": "Range-Breakout mit klaren SR-Zonen.",
  "confidence": 0.72
}
```

## 10) Retry / Error Handling

* Retries: Client versucht sofort erneut (max 1 Retry) bei Netzwerkfehler; UI zeigt Toast.
* Idempotency key: Nicht vorhanden → Empfehlung: Hash aus Bild+Metriken an Provider übergeben (`metadata` falls verfügbar).
* Fallback: Bei Fehlern `getHeuristicTeaser` liefert heuristische Analyse und kennzeichnet Provider `heuristic`.

## 11) Observability & Metrics

* Metrics: Client-seitig `performance.now()` → `processingTime`; sende Telemetrie `teaser.ai.latency`, `teaser.ai.fallbacks`, `teaser.ai.provider`.
* Logs: Browser-Logging vermeiden; optional anonymisierte Events (`confidence`, `provider`) an Telemetry-Endpunkt.

## 12) Cost / Rate Limit Considerations

* Estimate calls per month: ~900 (30 tägliche aktive Nutzer × 1 Vision-Analyse/Tag).
* Kostenkontrolle: Vision-Requests teuer → throttle auf 1 Request pro 60s & Caching (IndexedDB) für identische Screenshots.

## 13) Tests / Acceptance Criteria

* Unit test: `parseAIResponse` extrahiert JSON auch aus Markdown-Codeblöcken.
* Integration test: Mock OpenAI SDK → Rückgabe entspricht Schema.
* Smoke test: Manueller Screenshot → Response JSON parsebar, `confidence` zwischen 0 und 1.

## 14) Assumptions

* Teaser-Komponente implementiert UI-Trigger (derzeit nur Adapter vorhanden).
* API-Keys werden über sichere Runtime-Konfiguration injiziert, nicht via `.env` im Bundle.
* Nutzer hat Vision-Feature bewusst aktiviert (Consent im UI).

## 15) Change log

* v0.1 created 2025-11-11 by Codex

