# WP-013 — Holdings / Wallet Snapshot Card Checklist

## Current State Snapshot
- **Wallet Store**: `src/store/walletStore.ts` manages connected wallets and active state.
- **Dashboard**: `src/pages/DashboardPage.tsx` is the main dashboard page.
- **Dashboard Features**: `src/features/dashboard/` contains `DailyBiasCard` and `KPIBar`.
- **API**: `src/api/` exists but `wallet.ts` is missing.
- **Styles**: `src/features/dashboard/dashboard.css` exists.

## File Targets
- [ ] `src/api/wallet.ts` (CREATE)
- [ ] `src/features/dashboard/HoldingsCard.tsx` (CREATE)
- [ ] `src/pages/DashboardPage.tsx` (MODIFY)
- [ ] `docs/CHANGELOG.md` (MODIFY)
- [ ] `docs/index.md` (MODIFY)

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
- [ ] **Step 4: Dashboard integration**
  - Import `HoldingsCard` in `DashboardPage.tsx`
  - Place it in the dashboard layout
- [ ] **Step 5: Docs**
  - Update `docs/CHANGELOG.md`
  - Update `docs/index.md`
- [ ] **Step 6: Finalize checklist**
  - Verify all steps completed
  - Add verification results

## Acceptance Criteria
- [ ] Not-connected state shows placeholder + "Connect wallet" CTA
- [ ] Connected state shows holdings rows (mock or real)
- [ ] Change values are color-coded (green/red) via tokens
- [ ] No hard-coded colors
- [ ] UI handles loading/empty/error states

## Verification
- [ ] `pnpm typecheck`
- [ ] `pnpm lint`
- [ ] `pnpm test`
- [ ] Mobile/Desktop viewport smoke check (manual)
