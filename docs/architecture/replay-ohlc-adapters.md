# Replay Lab – OHLC Provider Adapter Plan

## Scope
- Establish Moralis (primary) and Dexscreener (fallback) OHLC adapters
- Normalize payloads to a shared `OHLCProviderResult` with consistent metadata
- Prepare groundwork for the replay orchestrator and caching layer

## Adapter Contracts
- **Request params:** `{ symbol, timeframe, address?, chainId?, from?, to?, limit? }`
- **Result shape:**
  - `providerId`: `moralis | dexscreener`
  - `series`: `{ symbol, timeframe, points[], metadata }`
  - `points`: `{ timestamp(ms), open, high, low, close, volume? }`
- **Error handling:** throw `OHLCProviderError(provider, message, code?, cause?)` on any upstream failure or empty payload

## Timeframe Normalization
- `timeframeToInterval` maps UI timeframes to provider intervals:
  - `30s → '30s'`
  - `1m → 1`, `5m → 5`, `15m → 15`
  - `1h → 60`, `4h → 240`, `1d → '1d'`
- Shared utility ensures both providers stay in sync when new timeframes are added.

## Moralis Adapter
- Endpoint: `/api/moralis/ohlc?symbol=…&interval=…`
- Accepts optional `address`, `chainId`, `from`, `to`, `limit`
- Normalizes flexible payloads (`data.items`, `result`, arrays) and converts seconds → ms
- Rejects empty or malformed rows with `OHLCProviderError('moralis', …)`

## Dexscreener Adapter
- Endpoint: `${DEX_API_BASE}/latest/dex/ohlc` with identical query params
- Uses request timeout (`DEX_API_TIMEOUT`, default 5s) with `AbortController`
- Normalizes `candles | data | result` arrays and converts seconds → ms
- Rejects non-OK responses, network failures, or empty datasets with `OHLCProviderError('dexscreener', …)`

## Next Steps
- Add orchestrator with provider fallback + caching (5m TTL)
- Wire into `ReplayService` and `ReplayPage` with loading/error states
- Extend docs with orchestrator flow and caching behaviour once implemented
