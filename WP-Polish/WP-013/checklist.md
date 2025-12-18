# WP-013 Checklist

## Current state snapshot
- Monitored wallet address is stored via `getMonitoredWallet`/`setMonitoredWallet` in `src/lib/wallet/monitoredWallet.ts`, surfaced in Settings’ Wallet Monitoring inputs with validation. 
- Wallet store (`src/store/walletStore.ts`) persists connected wallets and settings, but dashboard monitored wallet comes from storage rather than the store selectors.
- Dashboard holdings currently render through `src/components/dashboard/HoldingsList.tsx` using `useWalletHoldings` + `fetchWalletHoldings` (calls `/api/wallet/assets`), shown alongside trades in `src/pages/DashboardPage.tsx`.
- API folder contains `src/api/marketIntelligence.ts` using `config.apiBaseUrl` with typed DTOs and mock fallback; no wallet API wrapper yet.
- Holdings/types live under `src/lib/wallet/holdingsClient.ts` and `src/types/walletAssets.ts` with SOL-native balance handling; no features/dashboard Holdings card exists.

## File targets
- [ ] CREATE `src/features/dashboard/HoldingsCard.tsx`
- [ ] CREATE `src/api/wallet.ts`
- [ ] (If needed) MODIFY `src/pages/DashboardPage.tsx`
- [ ] UPDATE docs in `/docs/` to reflect WP-013

## Implementation steps
- [x] Step 1 — Wallet API DTO + deterministic mock fallback — Created `HoldingDTO` and `getHoldings` using config-driven endpoint with sanitized response handling and deterministic mock fallback (files: `src/api/wallet.ts`).
- [x] Step 2 — HoldingsCard UI skeleton + states — Added `HoldingsCard` with monitored wallet detection, loading/error/empty/not-connected states, and base styling (files: `src/features/dashboard/HoldingsCard.tsx`, `src/features/dashboard/holdings-card.css`).
- [x] Step 3 — Holdings table/list rendering — Implemented responsive holdings grid with formatted amounts/value/change, token-based change coloring, and row navigation to watchlist (files: `src/features/dashboard/HoldingsCard.tsx`, `src/features/dashboard/holdings-card.css`).
- [x] Step 4 — Wire into DashboardPage — Replaced the legacy holdings list with `HoldingsCard` and simplified dashboard wiring (file: `src/pages/DashboardPage.tsx`).
- [x] Step 5 — Docs — Recorded WP-013 in `docs/CHANGELOG.md` and `docs/index.md`, linking checklist and holdings card wiring.
- [x] Step 6 — Finalize checklist — Verification recorded and checklist updated (file: `WP-Polish/WP-013/checklist.md`).

## Acceptance criteria
- [ ] Shows placeholder when no wallet
- [ ] Shows rows when wallet exists
- [ ] Change values color-coded via tokens (danger/success)
- [ ] Tokens only

## Verification
- [x] `pnpm typecheck`
- [x] `pnpm lint` (existing warnings in unrelated files)
- [x] `pnpm test`
- [ ] `pnpm test:e2e` (Playwright browsers missing locally; install via `pnpm exec playwright install chromium` before rerun)
