# extracted

Vite + React + TypeScript PWA, deployed on Vercel. Includes PWA (vite-plugin-pwa), Vercel Functions under `/api` (proxies), and tests (Vitest + Playwright).

## Prerequisites
- Node >= 20.10
- pnpm or npm

## Setup
```bash
pnpm i   # or npm i
pnpm dev # or npm run dev
```

## Scripts
- `dev` — start Vite dev server
- `build` — typecheck + Vite build
- `preview` — preview the build
- `typecheck` — run TypeScript
- `lint` — ESLint (flat config)
- `format` — Prettier write
- `test`/`test:watch` — Vitest
- `test:e2e` — Playwright

## ENV
Define environment in `.env.local` (non-committed). See `.env.example` for all variables.  
Client flags must start with `VITE_` to be exposed.

📖 **Detailed guide:** See [docs/API_KEY_MANAGEMENT.md](docs/API_KEY_MANAGEMENT.md) for complete API key setup and security best practices.

## PWA
- Manifest `public/manifest.webmanifest`
- Icons in `public/`
- Service worker via vite-plugin-pwa

## Deployment (Vercel)
1. Connect Git repo in Vercel, set ENV for Preview & Production.
2. Push to main → Preview deploy.
3. Promote to Production after checks.
