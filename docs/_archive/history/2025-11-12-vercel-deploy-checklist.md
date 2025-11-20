# Vercel Deploy Checklist

1. **Environment Secrets**
   - Set `MORALIS_API_KEY` (Production, Preview, Development) as a hidden secret in Vercel.
   - Optional: override `MORALIS_BASE_URL` if you use a Moralis mirror endpoint.
   - Remove any legacy `VITE_MORALIS_API_KEY` entries – the key must remain server-side.
2. **Build Guards**
   - `pnpm run check-env` (runs automatically via `prebuild`) should pass with no missing vars.
3. **Local Verification**
   - `DEV_USE_MOCKS=true pnpm dev` for local work without live Moralis calls.
   - `./scripts/smoke-vercel-check.sh http://localhost:3000` against your dev server or local preview.
4. **Preview Deployment**
   - Deploy branch to Vercel and wait for preview URL.
   - `./scripts/smoke-vercel-check.sh https://<preview-url>` to validate `/api/health` and `/api/moralis/health`.
5. **Review Logs**
   - Check Vercel Function logs for `api/moralis/*` for rate limiting or proxy errors.
6. **Sign Off**
   - Document environment values in `env_inventory.md` and archive smoke test results in `verifications.md`.
