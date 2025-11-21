# Grok Pulse Integration Guide

This document outlines how the Grok Pulse backend integrates live market data, Twitter sentiment, and Vercel KV state for Sparkfined.

## Environment variables

Set the following secrets in Vercel/CI for end-to-end functionality:

- `GROK_API_KEY`, `GROK_API_URL`, `GROK_MODEL` – access to Grok chat completions.
- `DEXSCREENER_API_KEY`, `DEXSCREENER_BASE_URL` – on-chain market data.
- `BIRDEYE_API_KEY`, `BIRDEYE_BASE_URL` – secondary on-chain source.
- `PULSE_SOCIAL_API_KEY`, `PULSE_SOCIAL_API_URL` – generic social search feed.
- `PULSE_TWITTER_API_KEY`, `PULSE_TWITTER_API_URL` – live Twitter/X mentions for symbols/contracts.
- `PULSE_WATCHLIST_TOKENS` – optional comma-separated `SYMBOL:ADDRESS` overrides for watchlist seeding.
- `PULSE_CRON_SECRET` – bearer token for `api/grok-pulse/cron`.

## Endpoints

- `POST /api/grok-pulse/sentiment` – builds enhanced context, calls Grok (or keyword fallback), persists snapshot & history to KV.
- `GET /api/grok-pulse/context` – returns the enhanced Grok context for a token (cached via KV for 20 minutes).
- `GET /api/grok-pulse/state` – exposes current snapshots + history for dashboards.
- `POST /api/grok-pulse/cron` – batch runner that seeds KV and processes multiple tokens with rate limiting.

All handlers run on Vercel Edge and read the shared KV namespace for snapshots, history, watchlist tokens, and cached contexts.

## KV storage

- Snapshots: `sentiment:{address}` with 45m TTL.
- History: `sentiment:history:{address}` (7d TTL, trimmed to 50 entries).
- Context cache: `sentiment:context:{address}` with 20m TTL to avoid duplicate upstream calls.
- Global list: `pulse:global_list` for the last token batch (30m TTL).
- Watchlist tokens: `pulse:watchlist:tokens` with 15m TTL, optionally populated from `PULSE_WATCHLIST_TOKENS`.

## Testing

Run `pnpm test --filter grokPulse` to execute the Grok Pulse unit suite (context builder, engine smoke test, keyword fallback, and API handlers). Tests mock KV and external HTTP calls to keep CI isolated.
