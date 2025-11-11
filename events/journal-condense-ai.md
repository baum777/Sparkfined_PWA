---
title: "Journal Notiz Verdichten (AI Proxy)"
id: "events/journal-condense-ai"
agent: "anthropic"
priority: "high"
trigger: "User klickt \"Verdichten\" im Journal"
tags: ["journal","compression","ai-proxy"]
created: "2025-11-11"
---

## 1) Kurzbeschreibung (one-liner)
Komprimiert einen Journal-Entwurf in 4–6 Spiegelstriche über die AI-Proxy-Route.

## 2) Trigger (auslösendes Ereignis)
- Quelle: UI (JournalPage React Component)
- Event-Name: `journal.condense.request`
- Auslöser-Bedingungen: `button.click('Verdichten') && draft.body?.length > 0`

## 3) Payload (expected input)
```json
{
  "provider": "anthropic",
  "model": "claude-3-5-sonnet-latest",
  "system": "Du reduzierst Chart-Notizen auf das Wesentliche. Antworte in deutsch als 4–6 kurze Spiegelstriche: Kontext, Beobachtung, Hypothese, Plan, Risiko, Nächste Aktion.",
  "user": "Titel: Breakout Setup\nCA: So1111111111\nTF: 15m\nNotiz:\nLong an Daily SR, Stop unter Tages-Tief",
  "maxOutputTokens": 800,
  "maxCostUsd": 0.15
}
```

## 4) Pre- & Postconditions

* Preconditions: Benutzer authentifiziert; `AI_PROXY_SECRET` ist bekannt und wird als Bearer Header gesetzt; Draft enthält relevanten Text.
* Postconditions: Antwort wird im lokalen Zustand `aiResult` gespeichert; Token-Verbrauch wird via `aiCtx.addTokens` getrackt; optionaler Cache-Hit markiert `fromCache`.

## 5) Security & Privacy

* Data sensitivity: Enthält potenziell PII und Trading-Journal-Details (hoch).
* Redaction rules: Entferne sensible PII (E-Mail, Telefonnummern) clientseitig bevor der Request gesendet wird; logge keine Roh-Notizen serverseitig.
* Token handling: `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` / `XAI_API_KEY` liegen im Server-Environment; Rotation monatlich; `AI_PROXY_SECRET` nie im Client-Bundle persistieren.

## 6) Agent-Instruktion (copy-paste ready)

```
ROLE: Du bist "Sparkfined Journal Condenser".
INPUT: JSON { "title": "string", "body": "string", "tf": "string", "address": "string" }
TASK: Komprimiere Trading-Notizen in 4-6 prägnante Spiegelstriche (Kontext, Beobachtung, Hypothese, Plan, Risiko, Nächste Aktion). Nutze ausschließlich die gelieferten Fakten.
OUTPUT: Reine JSON-Antwort im Schema: { "bullets": string[], "summary": string }
RULES: - Keine erklärenden Fließtexte außerhalb des JSON
       - Max-Länge je Bullet: 180 Zeichen
       - Entferne oder pseudonymisiere PII vor der Antwort
```

## 7) Workflow (Diagram + Steps)

```
[Journal UI Button]
      ↓ (click)
[useAssist Hook]
      ↓ (fetch /api/ai/assist)
[Edge AI Proxy]
      ↓ (Route nach Provider)
[Anthropic/OpenAI/xAI API]
      ↓
[Proxy Response Parser]
      ↓
[AI Result im Journal State]
```

Step-by-step:

1. Benutzer klickt „Verdichten“ → `runAssist(system,user)` wird aufgerufen.
2. Hook sendet POST `/api/ai/assist` mit Provider- & Guard-Parametern.
3. Edge-Route prüft Auth (`AI_PROXY_SECRET`), Kosten-Caps, Template- oder Prompt-Länge.
4. Proxy ruft gewählten Anbieter (Standard: Claude 3.5 Sonnet) mit System/User-Nachrichten.
5. Antwort + Token-Nutzung werden zurückgegeben, Kosten geschätzt, optional gecached.
6. Frontend speichert Ergebnis in Zustand, aktualisiert Token-Zähler, bietet „Anhängen“ an.

## 8) Example Call (cURL / Node)

```bash
curl -X POST "https://app.sparkfined.example/api/ai/assist" \
 -H "Authorization: Bearer ${AI_PROXY_SECRET}" \
 -H "Content-Type: application/json" \
 -d '{
       "provider":"anthropic",
       "model":"claude-3-5-sonnet-latest",
       "system":"Du reduzierst Chart-Notizen auf das Wesentliche. Antworte in deutsch als 4–6 kurze Spiegelstriche: Kontext, Beobachtung, Hypothese, Plan, Risiko, Nächste Aktion.",
       "user":"Titel: Breakout Setup\nCA: So1111111111\nTF: 15m\nNotiz:\nLong an Daily SR, Stop unter Tages-Tief",
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
  "ms": 1850,
  "text": "- Kontext: SOL testet Daily SR...",
  "usage": { "input_tokens": 620, "output_tokens": 180 },
  "costUsd": 0.0015,
  "fromCache": false
}
```

## 10) Retry / Error Handling

* Retries: Client wiederholt nicht automatisch; UI erlaubt erneutes Klicken. Proxy sollte bei 5xx eine exponential Backoff Queue (3 Versuche, 0.5s Basis) implementieren.
* Idempotency key: Verwende Hash des Prompts (`SHA-256(system+user)`) als optionalen Header für serverseitiges De-Duping.
* Fallback: Bei Fehlern zeigt UI Toast, behält Draft unverändert; Logging + Alerting im Proxy.

## 11) Observability & Metrics

* Metrics: `ai.assist.requests`, `ai.assist.latency`, `ai.assist.cost_usd`, `ai.assist.errors` mit Labels `{provider, model}`.
* Logs: Strukturierte JSON-Logs mit `trace_id`, gehashter `userId`, `draftId`, `provider`, `estimated_tokens`.

## 12) Cost / Rate Limit Considerations

* Estimate calls per month: ~1.2k (100 aktive User × 0.4 Verdichtungen/Tag × 30 Tage).
* Sampling recommendation: Bei hoher Frequenz ab 100 Calls/Tag 20% Sampling für Telemetrie; setze `maxCostUsd` ≤ 0.2.

## 13) Tests / Acceptance Criteria

* Unit test: Mock `fetch` im Proxy → sicherstellen, dass `AI_PROXY_SECRET` Pflicht ist.
* Integration test: Simulierter POST mit Fixture-Notiz → `ok:true` und JSON-Antwort.
* Smoke test: cURL gegen Staging → HTTP 200, `text` nicht leer, Kosten-Schätzung vorhanden.

## 14) Assumptions

* Frontend ergänzt Authorization-Header vor Production-Launch.
* Draft-Inhalte werden vor Versand auf sensible PII geprüft.
* Claude 3.5 Sonnet ist verfügbar; Alternativmodelle folgen derselben Instruktion.

## 15) Change log

* v0.1 created 2025-11-11 by Codex

