import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import StateView from "@/components/ui/StateView";
import { ExternalLink, RefreshCw } from "@/lib/icons";
import { cn } from "@/lib/ui/cn";
import { getDailyBias, type DailyBiasDTO } from "@/api/marketIntelligence";
import BiasTag from "./BiasTag";
import "./daily-bias.css";

type BiasStatus = "idle" | "loading" | "error";

interface DailyBiasCardProps {
  className?: string;
}

const formatTimestamp = (value?: string | null): string => {
  if (!value) return "—";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function DailyBiasCard({ className }: DailyBiasCardProps) {
  const [data, setData] = useState<DailyBiasDTO | null>(null);
  const [status, setStatus] = useState<BiasStatus>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const isMountedRef = useRef(true);

  const handleRefresh = useCallback(async () => {
    setStatus("loading");
    setErrorMessage(null);

    try {
      const result = await getDailyBias();
      if (!isMountedRef.current) return;
      setData(result);
      setLastUpdated(new Date().toISOString());
      setStatus("idle");
    } catch (refreshError) {
      if (!isMountedRef.current) return;
      const fallbackMessage =
        refreshError instanceof Error && refreshError.message.trim().length > 0
          ? refreshError.message
          : "Unable to load market intelligence right now.";
      setErrorMessage(fallbackMessage);
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    void handleRefresh();

    return () => {
      isMountedRef.current = false;
    };
  }, [handleRefresh]);

  const isLoading = status === "loading";
  const isError = status === "error";
  const insights = data?.insights ?? [];
  const isEmpty = !isLoading && !isError && insights.length === 0;

  const timestampLabel = useMemo(
    () => formatTimestamp(lastUpdated ?? data?.asOf ?? null),
    [data?.asOf, lastUpdated]
  );

  const sourceLabel = data?.source ?? "Sparkfined Intelligence";

  return (
    <section className={cn("sf-card dashboard-card sf-daily-bias-card", className)} aria-label="Daily market bias">
      <header className="sf-daily-bias-card__header">
        <div className="sf-daily-bias-card__titles">
          <p className="sf-daily-bias-card__eyebrow">Market Intel</p>
          <h3 className="sf-daily-bias-card__title">Daily Bias</h3>
          <p className="sf-daily-bias-card__subtitle">
            AI summarised intraday lean with actionable context.
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          isLoading={isLoading}
          aria-label="Refresh daily bias"
          leftIcon={<RefreshCw size={16} aria-hidden />}
        >
          Refresh
        </Button>
      </header>

      <div className="sf-daily-bias-card__body">
        {isLoading ? (
          <div className="sf-daily-bias-card__loading">
            <div className="sf-daily-bias-card__summary">
              <div className="sf-daily-bias-card__bias-row">
                <div className="sf-daily-bias-card__skeleton-tag" aria-hidden />
                <div className="sf-daily-bias-card__skeleton-line" aria-hidden />
              </div>
              <div className="sf-daily-bias-card__skeleton-button" aria-hidden />
            </div>
            <div className="sf-daily-bias-card__skeleton-line" aria-hidden />
            <div
              className="sf-daily-bias-card__skeleton-line sf-daily-bias-card__skeleton-line--short"
              aria-hidden
            />
          </div>
        ) : null}

        {isError ? (
          <StateView
            type="error"
            title="Bias unavailable"
            description={errorMessage ?? "Unable to refresh the bias feed."}
            actionLabel="Retry"
            onAction={handleRefresh}
            compact
          />
        ) : null}

        {isEmpty ? (
          <StateView
            type="empty"
            title="No insights yet"
            description="Once we have fresh order flow and momentum reads, your bias intel will show here."
            actionLabel="Refresh"
            onAction={handleRefresh}
            compact
          />
        ) : null}

        {!isLoading && !isError && !isEmpty && data ? (
          <>
            <div className="sf-daily-bias-card__summary">
              <div className="sf-daily-bias-card__bias-row">
                <BiasTag bias={data.bias} />
                <span className="sf-daily-bias-card__source" aria-label={`Source ${sourceLabel}`}>
                  {sourceLabel}
                </span>
              </div>
              <span className="sf-daily-bias-card__updated">As of {timestampLabel}</span>
            </div>

            <ul className="sf-daily-bias-card__insights" aria-label="Key insights">
              {insights.map((insight) => (
                <li key={insight}>
                  <span className="sf-daily-bias-card__bullet" aria-hidden />
                  <span className="sf-daily-bias-card__insight-text">{insight}</span>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>

      <footer className="sf-daily-bias-card__footer">
        <a className="sf-daily-bias-card__link" href="/analysis">
          <ExternalLink size={16} aria-hidden />
          <span>View analysis</span>
        </a>
        <div className="sf-daily-bias-card__footer-actions">
          <div className="sf-daily-bias-card__updated sf-daily-bias-card__updated--muted">
            Last checked {timestampLabel}
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleRefresh}
            isLoading={isLoading}
            leftIcon={<RefreshCw size={16} aria-hidden />}
          >
            Refresh
          </Button>
        </div>
      </footer>
    </section>
  );
}
