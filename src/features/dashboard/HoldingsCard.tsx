import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/ui/Button";
import StateView from "@/components/ui/StateView";
import { Skeleton } from "@/components/ui/Skeleton";
import { getHoldings, type HoldingDTO } from "@/api/wallet";
import { fmtNum, fmtPct, fmtUsd } from "@/lib/format";
import { WALLET_CHANGED_EVENT, getMonitoredWallet } from "@/lib/wallet/monitoredWallet";
import { cn } from "@/lib/ui/cn";
import "./holdings-card.css";

type HoldingsStatus = "idle" | "loading" | "success" | "error";

interface HoldingsCardProps {
  className?: string;
}

interface HoldingsState {
  status: HoldingsStatus;
  holdings: HoldingDTO[];
  error: string | null;
}

const truncateWallet = (address: string): string => {
  if (address.length <= 10) return address;
  return `${address.slice(0, 6)}…${address.slice(-4)}`;
};

const getChangeTone = (change?: number): "positive" | "negative" | "neutral" => {
  if (typeof change !== "number" || Number.isNaN(change) || change === 0) return "neutral";
  return change > 0 ? "positive" : "negative";
};

const formatChange = (value?: number): string => {
  if (typeof value !== "number" || Number.isNaN(value)) return "—";
  return fmtPct(value);
};

const getHoldingDisplayName = (holding: HoldingDTO): string | null => {
  const maybeName = (holding as unknown as { name?: unknown }).name;
  if (typeof maybeName === "string" && maybeName.trim().length > 0) return maybeName.trim();
  return null;
};

const getHoldingIconUrl = (holding: HoldingDTO): string | null => {
  const maybeIconUrl = (holding as unknown as { iconUrl?: unknown }).iconUrl;
  if (typeof maybeIconUrl === "string" && maybeIconUrl.trim().length > 0) return maybeIconUrl.trim();
  return null;
};

export default function HoldingsCard({ className }: HoldingsCardProps) {
  const navigate = useNavigate();

  const [walletAddress, setWalletAddress] = useState<string | null>(() => getMonitoredWallet());
  const [{ status, holdings, error }, setState] = useState<HoldingsState>({
    status: walletAddress ? "loading" : "idle",
    holdings: [],
    error: null,
  });

  const isMountedRef = useRef(true);

  const refreshHoldings = useCallback(async () => {
    if (!walletAddress) {
      setState({ status: "idle", holdings: [], error: null });
      return;
    }

    setState((prev) => ({
      status: "loading",
      holdings: prev.status === "success" ? prev.holdings : [],
      error: null,
    }));

    try {
      const result = await getHoldings(walletAddress);
      if (!isMountedRef.current) return;

      // Defensive: filter out invalid rows (should already be sanitized in API layer).
      const safeHoldings = Array.isArray(result) ? result.filter(Boolean) : [];
      setState({ status: "success", holdings: safeHoldings, error: null });
    } catch (refreshError) {
      if (!isMountedRef.current) return;

      const fallbackMessage =
        refreshError instanceof Error && refreshError.message.trim().length > 0
          ? refreshError.message
          : "Unable to load holdings right now.";

      setState({ status: "error", holdings: [], error: fallbackMessage });
    }
  }, [walletAddress]);

  useEffect(() => {
    isMountedRef.current = true;

    const handleWalletChange = () => {
      setWalletAddress(getMonitoredWallet());
    };

    window.addEventListener("storage", handleWalletChange);
    window.addEventListener(WALLET_CHANGED_EVENT, handleWalletChange);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener("storage", handleWalletChange);
      window.removeEventListener(WALLET_CHANGED_EVENT, handleWalletChange);
    };
  }, []);

  useEffect(() => {
    void refreshHoldings();
  }, [refreshHoldings]);

  const isNotConnected = !walletAddress;
  const isLoading = status === "loading";
  const isError = status === "error";
  const hasHoldings = holdings.length > 0;

  const displayHoldings = useMemo(() => {
    return [...holdings].sort((a, b) => (b.valueUsd ?? 0) - (a.valueUsd ?? 0));
  }, [holdings]);

  const handleRowClick = useCallback(
    (symbol: string) => {
      const destination = symbol ? `/watchlist?asset=${encodeURIComponent(symbol)}` : "/watchlist";
      navigate(destination);
    },
    [navigate]
  );

  return (
    <section
      className={cn("sf-card dashboard-card sf-holdings-card", className)}
      aria-label="Wallet holdings snapshot"
      data-testid="dashboard-holdings-card"
    >
      <header className="sf-holdings-card__header">
        <div className="sf-holdings-card__titles">
          <p className="sf-holdings-card__eyebrow">Wallet</p>
          <h3 className="sf-holdings-card__title">Holdings</h3>
          <p className="sf-holdings-card__subtitle">
            Snapshot of your connected wallet value and token mix.
          </p>
        </div>
        {walletAddress ? (
          <span className="sf-holdings-card__wallet-pill" title={walletAddress}>
            {truncateWallet(walletAddress)}
          </span>
        ) : null}
      </header>

      <div className="sf-holdings-card__body">
        {isNotConnected ? (
          <div className="sf-holdings-card__state sf-holdings-card__state--info">
            <div>
              <p className="sf-holdings-card__state-title">Wallet not connected</p>
              <p className="sf-holdings-card__state-copy">
                Connect a wallet in Settings → Wallet Monitoring to see live holdings.
              </p>
            </div>
            <div className="sf-holdings-card__state-actions">
              <Button variant="secondary" size="sm" onClick={() => navigate("/settings#monitoring")}>
                Connect wallet
              </Button>
            </div>
          </div>
        ) : null}

        {isLoading ? (
          <div className="sf-holdings-card__skeletons" aria-label="Loading holdings">
            {Array.from({ length: 3 }).map((_, idx) => (
              <Skeleton key={idx} variant="card" className="h-14 w-full" />
            ))}
          </div>
        ) : null}

        {isError ? (
          <StateView
            type="error"
            title="Holdings unavailable"
            description={error ?? "Unable to load holdings right now."}
            actionLabel="Retry"
            onAction={refreshHoldings}
            compact
          />
        ) : null}

        {!isNotConnected && !isLoading && !isError && !hasHoldings ? (
          <StateView
            type="empty"
            title="No holdings yet"
            description="Once your wallet has balances, they will show up here."
            actionLabel="Refresh"
            onAction={refreshHoldings}
            compact
          />
        ) : null}

        {!isNotConnected && !isLoading && !isError && hasHoldings ? (
          <div className="sf-holdings-card__table" role="list" aria-label="Wallet holdings">
            <div className="sf-holdings-card__head">
              <span>Asset</span>
              <span>Amount</span>
              <span>Value</span>
              <span>Change</span>
            </div>

            <div className="sf-holdings-card__rows">
              {displayHoldings.map((holding, index) => {
                const changeTone = getChangeTone(holding.changePct24h);
                const name = getHoldingDisplayName(holding);
                const iconUrl = getHoldingIconUrl(holding);

                return (
                  <button
                    key={`${holding.symbol}-${index}`}
                    type="button"
                    className="sf-holdings-card__row"
                    onClick={() => handleRowClick(holding.symbol)}
                  >
                    <div className="sf-holdings-card__cell sf-holdings-card__cell--symbol">
                      <span className="sf-holdings-card__meta-label">Asset</span>

                      <div className="sf-holdings-card__asset">
                        <div className="sf-holdings-card__icon" aria-hidden="true">
                          {iconUrl ? (
                            <img
                              src={iconUrl}
                              alt=""
                              loading="lazy"
                              className="sf-holdings-card__icon-img"
                              onError={(e) => {
                                // Hide broken image; keep placeholder via CSS.
                                (e.currentTarget as HTMLImageElement).style.display = "none";
                              }}
                            />
                          ) : null}
                          {!iconUrl ? (
                            <span className="sf-holdings-card__icon-fallback">
                              {holding.symbol?.slice(0, 1) ?? "—"}
                            </span>
                          ) : null}
                        </div>

                        <div className="sf-holdings-card__asset-text">
                          <span className="sf-holdings-card__symbol">{holding.symbol}</span>
                          {name ? <span className="sf-holdings-card__name">{name}</span> : null}
                        </div>
                      </div>
                    </div>

                    <div className="sf-holdings-card__cell sf-holdings-card__cell--amount">
                      <span className="sf-holdings-card__meta-label">Amount</span>
                      <span className="sf-holdings-card__value">{fmtNum(holding.amount)}</span>
                    </div>

                    <div className="sf-holdings-card__cell sf-holdings-card__cell--value">
                      <span className="sf-holdings-card__meta-label">Value</span>
                      <span className="sf-holdings-card__value">{fmtUsd(holding.valueUsd)}</span>
                    </div>

                    <div className="sf-holdings-card__cell sf-holdings-card__cell--change">
                      <span className="sf-holdings-card__meta-label">Change</span>
                      <span
                        className={cn(
                          "sf-holdings-card__change",
                          changeTone === "positive" && "sf-holdings-card__change--positive",
                          changeTone === "negative" && "sf-holdings-card__change--negative"
                        )}
                      >
                        {formatChange(holding.changePct24h)}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
