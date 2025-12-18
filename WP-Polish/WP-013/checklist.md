# WP-013 — Holdings / Wallet Snapshot Card Checklist

## Current State Snapshot
- **Wallet Store**: `src/store/walletStore.ts` manages connected wallets and active state.
- **Dashboard**: `src/pages/DashboardPage.tsx` is the main dashboard page.
- **Dashboard Features**: `src/features/dashboard/` contains `DailyBiasCard` and `KPIBar`.
- **API**: `src/api/` exists but `wallet.ts` is missing.
- **Styles**: `src/features/dashboard/dashboard.css` exists.

## File Targets
- [x] `src/api/wallet.ts` (CREATE)
- [x] `src/features/dashboard/HoldingsCard.tsx` (CREATE)
- [x] `src/pages/DashboardPage.tsx` (MODIFY)
- [x] `docs/CHANGELOG.md` (MODIFY)
- [x] `docs/index.md` (MODIFY)

## Implementation Steps
- [x] **Step 1: Wallet API DTO + deterministic mock**
  - Create `src/api/wallet.ts`
  - Define `HoldingDTO` interface
  - Implement `getHoldings` with mock fallback
- [x] **Step 2: HoldingsCard UI + states**
  - Create `src/features/dashboard/HoldingsCard.tsx`
  - Implement states: loading, error, empty, not-connected
  - Use `useWalletStore` to get active wallet
  - Added `WP-013 step 2` commit
- [x] **Step 3: Holdings list / table**
  - Render list/table of holdings
  - Columns: Symbol, Amount, Value, Change
  - Use design tokens (`--sf-*`)
  - Row hover and click interactions
  - Added `WP-013 step 3` commit
- [x] **Step 4: Dashboard integration**
  - Import `HoldingsCard` in `DashboardPage.tsx`
  - Place it in the dashboard layout
  - Cleaned up old `HoldingsList` and `useWalletHoldings` hook usage
- [x] **Step 5: Docs**
  - Update `docs/CHANGELOG.md`
  - Update `docs/index.md`
- [x] **Step 6: Finalize checklist**
  - Verify all steps completed
  - Add verification results

## Acceptance Criteria
- [x] Not-connected state shows placeholder + "Connect wallet" CTA
- [x] Connected state shows holdings rows (mock or real)
- [x] Change values are color-coded (green/red) via tokens
- [x] No hard-coded colors
- [x] UI handles loading/empty/error states

## Verification
- [x] `pnpm typecheck` (Passed)
- [x] `pnpm lint` (Passed with 14 pre-existing warnings)
- [x] `pnpm test` (Passed)
- [ ] Mobile/Desktop viewport smoke check (manual)
