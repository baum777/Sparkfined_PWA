# Verifications

## Local Setup
1. Copy environment template:
   ```bash
   cp .env.example .env.local
   ```
2. Provide server secrets (no VITE_ prefixes):
   ```bash
   MORALIS_API_KEY=REDACTED_TOKEN
   ```
3. Optional mock mode for local development:
   ```bash
   DEV_USE_MOCKS=true pnpm dev
   ```

## Pre-Build Check
```bash
pnpm run check-env
```
- Fails with exit code 2 when `MORALIS_API_KEY` is missing or when `VITE_MORALIS_API_KEY` is set.

## Applying Patch
```bash
git apply patches/fix/vercel-moralis-proxy.patch
```

## Smoke Tests
```bash
./scripts/smoke-vercel-check.sh http://localhost:3000
./scripts/smoke-vercel-check.sh https://<preview-url>
```
- Uses `DEV_USE_MOCKS=true` to skip live Moralis calls locally.
- Requires deployed preview with serverless functions enabled for remote checks.

## Additional Notes
- `/api/moralis/health` returns proxy status, TTL, and whether mocks are active.
- Proxy logs appear in Vercel function logs under the catch-all `api/moralis` function.
