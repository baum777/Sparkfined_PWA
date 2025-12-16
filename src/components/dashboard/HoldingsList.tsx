import React, { useMemo } from "react";
import Button from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import type { WalletTokenHolding } from "@/types/walletAssets";
import { useNavigate } from 'react-router-dom'
import type { QuoteCurrency } from '@/types/currency'
import { formatMoney } from '@/lib/format/money'
import { useWalletStore } from '@/store/walletStore'
import Button from '@/components/ui/Button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card'
import { EmptyState } from '@/components/ui/EmptyState'

interface HoldingsListProps {
  holdings: WalletTokenHolding[];
  nativeBalanceLamports: number | null;
  status: "idle" | "loading" | "success" | "error";
  walletAddress: string | null;
  error?: string | null;
  onRetry?: () => void;
}

function formatAmount(amount: number | null, decimals?: number | null): string {
  if (amount == null) return "—";
  const maximumFractionDigits =
    typeof decimals === "number" && decimals >= 0 ? Math.min(decimals, 9) : 6;
  return amount.toLocaleString(undefined, {
    maximumFractionDigits,
  });
}

function buildDisplayHoldings(
  nativeBalanceLamports: number | null,
  holdings: WalletTokenHolding[]
): WalletTokenHolding[] {
  const tokens: WalletTokenHolding[] = [];

  if (nativeBalanceLamports != null) {
    tokens.push({
      mint: "SOL",
      amount: nativeBalanceLamports,
      decimals: 9,
      uiAmount: nativeBalanceLamports / 1_000_000_000,
      symbol: "SOL",
      name: "Solana",
    });
  }

  for (const holding of holdings) {
    if (holding.mint === "SOL") continue;
    tokens.push(holding);
  }

  return tokens;
}

export function HoldingsList({
  holdings,
  nativeBalanceLamports,
  status,
  walletAddress,
  error,
  onRetry,
}: HoldingsListProps) {
  const displayHoldings = useMemo(
    () => buildDisplayHoldings(nativeBalanceLamports, holdings),
    [holdings, nativeBalanceLamports]
  );

  return (
    <div className="rounded-3xl border border-border bg-surface/80 p-4 shadow-card-subtle">
      <div className="mb-3 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-text-tertiary">Holdings</p>
          <p className="text-sm font-semibold text-text-primary">Wallet snapshot</p>
        </div>
        {walletAddress ? (
          <span className="rounded-full bg-surface px-3 py-1 text-[11px] font-semibold text-text-secondary">
            {walletAddress.slice(0, 6)}…{walletAddress.slice(-4)}
          </span>
        ) : null}
      </div>

      {!walletAddress ? (
        <div className="rounded-2xl border border-dashed border-border bg-surface-subtle p-3 text-xs text-text-secondary">
          Set a wallet in Settings to see holdings.
        </div>
      ) : status === "loading" ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, idx) => (
            <Skeleton key={idx} variant="card" className="h-14 w-full" />
          ))}
        </div>
      ) : status === "error" ? (
        <div className="space-y-3">
          <div className="rounded-2xl border border-danger/60 bg-danger/5 p-3 text-xs text-danger">
            {error ?? "Unable to load holdings"}
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={onRetry}
            data-testid="retry-wallet-holdings"
          >
            Retry
          </Button>
        </div>
      ) : displayHoldings.length === 0 ? (
        <p className="text-xs text-text-secondary">
          No fungible holdings found for this wallet yet.
        </p>
      ) : (
        <ul className="space-y-3">
          {displayHoldings.map((holding) => (
            <li
              key={`${holding.mint}-${holding.symbol ?? holding.name ?? holding.uiAmount ?? holding.amount ?? ""}`}
              className="flex items-center justify-between rounded-2xl bg-surface-subtle px-3 py-2"
            >
              <div>
                <div className="text-sm font-semibold text-text-primary">
                  {holding.symbol || holding.name || holding.mint}
                </div>
                <div className="text-xs text-text-secondary" title={holding.mint}>
                  {formatAmount(holding.uiAmount, holding.decimals)} units
                </div>
              </div>
              <div className="text-[11px] font-semibold uppercase text-text-tertiary">
                {holding.mint}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
const MAX_DISPLAY_HOLDINGS = 5

export function HoldingsList({ holdings, quoteCurrency }: HoldingsListProps) {
  const navigate = useNavigate()
  const wallets = useWalletStore((state) => state.wallets)
  const hasWallet = wallets.length > 0

  const totalValue = holdings.reduce((sum, holding) => sum + holding.value, 0)
  const displayedHoldings = holdings.slice(0, MAX_DISPLAY_HOLDINGS)
  const remainingCount = holdings.length - MAX_DISPLAY_HOLDINGS

  const handleOpenHoldings = () => {
    navigate('/holdings')
  }

  const handleAddWallet = () => {
    navigate('/settings')
  }

  return (
    <Card variant="glass" className="shadow-card-subtle" data-testid="dashboard-holdings-snapshot">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-text-tertiary">Portfolio</p>
            <CardTitle className="text-base">Holdings snapshot</CardTitle>
          </div>
          {holdings.length > 0 && (
            <div className="text-right">
              <p className="text-xs text-text-tertiary">Total value</p>
              <p className="text-lg font-semibold text-text-primary" data-testid="holdings-total-value">
                {formatMoney(totalValue, quoteCurrency)}
              </p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent>
        {holdings.length === 0 ? (
          <EmptyState
            illustration="watchlist"
            title={hasWallet ? 'No holdings detected' : 'Connect your wallet'}
            description={
              hasWallet
                ? 'Your connected wallet has no token holdings to display.'
                : 'Add a wallet to track your portfolio holdings and trade history.'
            }
            action={{
              label: hasWallet ? 'Open holdings' : 'Add wallet',
              onClick: hasWallet ? handleOpenHoldings : handleAddWallet,
            }}
            compact
            data-testid="holdings-empty-state"
          />
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/70">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50 bg-surface-subtle/50">
                  <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                    Token
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                    Units
                  </th>
                  <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-text-tertiary">
                    Value
                  </th>
                </tr>
              </thead>
              <tbody>
                {displayedHoldings.map((holding, index) => (
                  <tr
                    key={holding.token}
                    className={index < displayedHoldings.length - 1 ? 'border-b border-border/30' : ''}
                  >
                    <td className="px-3 py-2 font-medium text-text-primary">{holding.token}</td>
                    <td className="px-3 py-2 text-right text-text-secondary">
                      {holding.amount.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                    </td>
                    <td className="px-3 py-2 text-right font-medium text-text-primary">
                      {formatMoney(holding.value, quoteCurrency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {remainingCount > 0 && (
              <div className="border-t border-border/50 bg-surface-subtle/30 px-3 py-2 text-center text-xs text-text-tertiary">
                +{remainingCount} more token{remainingCount > 1 ? 's' : ''}
              </div>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="mt-3 flex justify-end">
        <Button
          variant={hasWallet ? 'secondary' : 'primary'}
          size="sm"
          onClick={hasWallet ? handleOpenHoldings : handleAddWallet}
          data-testid="holdings-cta"
        >
          {hasWallet ? 'Open holdings' : 'Add wallet'}
        </Button>
      </CardFooter>
    </Card>
  )
}
