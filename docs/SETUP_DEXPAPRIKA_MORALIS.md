# Setup: DexPaprika (Primary) + Moralis (Server-side Fallback)

This document describes required env variables, local checks and how the adapter + proxy work.

## Environment

- `VITE_DEXPAPRIKA_BASE` — DexPaprika base URL (Preview + Production). Example: `https://api.dexpaprika.com`
- `VITE_DATA_PRIMARY` — `dexpaprika` (recommended)
- `MORALIS_API_KEY` — **server-only** secret (set in Vercel Production only)
- `MORALIS_BASE` — e.g. `https://deep-index.moralis.io/api/v2.2`
- `MORALIS_PROXY_TTL_MS` — proxy TTL (ms), default `10000`

## Local smoke tests

1. Start dev server: `pnpm dev`
2. DexPaprika quick curl: `curl -s "${VITE_DEXPAPRIKA_BASE}/networks/ethereum/tokens/0x..." | jq '.'`
3. Moralis proxy (local): `curl "http://localhost:3000/api/moralis/token?network=ethereum&address=0x..." | jq '.'`

## Notes

- Do **not** expose `MORALIS_API_KEY` to client or in build-time `VITE_` vars.
- If DexPaprika returns 429 or 5xx repeatedly, adapter will fallback to the server proxy.

