# Production Environment Variables

## Helius (Solana On-chain Provider)

These variables are used by the backend Solana on-chain adapter (`HeliusAdapter`). **Never** expose these to the client and **never** log the API key.

- **`HELIUS_API_KEY` (required)**: Helius API key used for both RPC + DAS JSON-RPC requests.
- **`HELIUS_RPC_URL` (optional)**: Defaults to `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`.
- **`HELIUS_DAS_RPC_URL` (optional)**: Defaults to `HELIUS_RPC_URL`. Used for DAS method `getAsset` (JSON-RPC POST).
- **`HELIUS_TIMEOUT_MS` (optional)**: Request timeout (milliseconds). Defaults to `LLM_TIMEOUT_MS` if set, otherwise `10000`.

