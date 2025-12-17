import React, { useMemo } from "react";
import Button from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";
import type { WalletTokenHolding } from "@/types/walletAssets";

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
}
