---
title: "AI Cache Layer"
summary: "Abstraktion, Storage und API für zwischengespeicherte AI-Antworten."
---

## Ziel

Der AI Cache Layer kapselt AI-Responses zentral, damit Orchestrator und Clients einheitlich über dieselbe Schnittstelle arbeiten. AC1 liefert die Grundbausteine (Typen, Store-Interface, Basisspeicher), ohne schon in den Orchestrator einzugreifen.

## Kern-Konzepte

- **AICacheEntry**: enthält `response`, `createdAt`, `ttlMs`, `modelId`, `key`.
- **AICacheStore**: Interface für Storage-Backends (`get`, `set`, `del`, optional `delByModel`).
- **Default Store**: In-Memory-Implementierung für lokale Entwicklung/tests; kann später durch Redis/KV ersetzt werden.

## API (AC1)

- `getCachedAIResponse(key)` → liefert `{ hit: boolean, entry?: AICacheEntry }`, entfernt abgelaufene Einträge.
- `setCachedAIResponse(key, entry)` → persistiert Einträge; Fehler werden geloggt, aber nicht geworfen.
- `invalidateAIResponse(key)` / `invalidateAIResponsesByModel(modelId)` → löschen gezielt Einträge.
- `setAICacheStore(store)` → erlaubt den Austausch des Storage-Backends (z. B. für Tests oder Redis).

## Offene Punkte (für AC2+)

### AC2 – Key-Schema & TTL

- **Deterministische Keys** via `buildAICacheKey(input)` → normalisiert Provider/Modell/Prompts und hasht den Payload (`ai:{provider}:{model}:{hash}`).
- **Model-Identifier**: `getModelId(provider, model)` erzeugt konsistente IDs.
- **TTL-Konfiguration**: `getDefaultAICacheTTL()` liest `AI_CACHE_TTL_MS` oder `AI_CACHE_TTL_SECONDS` (Fallback: 5 Min.).

### AC3 – Orchestrator-Integration

- **Backend-Orchestrator** nutzt den Cache für Market- und Social-Analysen (OpenAI/Grok) und verhindert doppelte LLM-Aufrufe.
- **Prompt-basierte Keys**: Der Orchestrator rendert die genutzten Prompts (`task_prompt_openai.md`, `task_prompt_grok.md`) und bildet daraus Cache-Keys.
- **Store-Ausfälle blockieren nicht**: Cache-Reads/Writes loggen Fehler, der Orchestrator liefert dennoch frische Modellantworten.

### Weiter offen (AC4+)

- Orchestrator-Integration inkl. Telemetrie.
- Invalidierungsstrategie bei Modellwechseln.
