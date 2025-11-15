# Sparkfined AI Integration — Recommendation & Use-Cases (Fazit)

**Datum:** 2025-11-12 UTC

## Kurzfazit (Recommendation)
- Verwende vorerst **nur OpenAI + Grok** (Grok für Social/real-time, OpenAI für tieferes Reasoning & RAG).
- Grok: schnelle UI-cards, social sentiment/thesis extraction, bot-detection assist.
- OpenAI: deep trade-plan generation, RAG-grounding, summarization and editor-friendly outputs.
- Immer RAG (Moralis/DexPaprika/Solscan) für numerische/on-chain Claims.
- Implementiere deterministic verifiers and rule-engine for numeric sanity checks.
- Enforce cost-control: sampling, caching, model selection ("mini" for UI).

## Use-Cases (A — E)
A) UI Quickcards/Market Snapshot — Grok mini or OpenAI mini. Low latency, temp 0-0.2.
B) Signal Generation / Trade Plan — OpenAI (larger model), RAG-backed. Sanity-checks enforced.
C) Social Sentiment & Narrative — Grok extracts thesis+sentiment from 10 posts; use botScore heuristics; persist `social_analysis` and `narrative_lore` in journal.
D) Chart Image Understanding — local derender/OCR -> structured table -> model summary.
E) Safety/Verifier — rule engine + optional second-model verification; persist audit trail.

## Operational Rules
- Cache quickcards 15-60s; social analysis 5-15m.
- Sample high-frequency events (chart.crosshair_move) at 0.1%-1%.
- Rate limit provider calls and implement circuit breakers + exponential backoff.
- Store only hashed author IDs and redacted snippets (<=1000 chars).
- Legal review for social scraping; prefer official APIs.

## Quick Roadmap (PoC -> Staging -> Prod)
1. Implement `/api/ai/social/grok` (Grok social analysis).
2. Integrate OpenAI condense flow for journal entries.
3. Merge results into Journal with editable `Social Signals` and `Token Narrative`.
4. Staging PoC with sampling (10%) + human-review.
5. Iterate heuristics and expand test coverage.

