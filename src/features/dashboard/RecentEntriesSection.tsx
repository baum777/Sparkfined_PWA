import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getRecentJournalEntries, type JournalEntryDTO } from "@/api/journalEntries";
import StateView from "@/components/ui/StateView";
import { Skeleton } from "@/components/ui/Skeleton";
import { ArrowRight } from "@/lib/icons";
import "@/features/dashboard/recent-entries.css";

interface RecentEntriesSectionProps {
  limit?: number;
  className?: string;
}

const formatDate = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(date);
};

const getActionLabel = (action?: JournalEntryDTO["action"]): string => {
  if (action === "BUY") return "Buy";
  if (action === "SELL") return "Sell";
  if (action === "HOLD") return "Hold";
  return "Note";
};

export default function RecentEntriesSection({ limit = 5, className }: RecentEntriesSectionProps) {
  const [entries, setEntries] = useState<JournalEntryDTO[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const navigate = useNavigate();

  const handleOpenJournal = useCallback(() => navigate("/journal"), [navigate]);
  const handleRetry = useCallback(() => {
    setError(null);
    setIsLoading(true);
    setReloadKey((key) => key + 1);
  }, []);

  useEffect(() => {
    let active = true;

    const loadEntries = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getRecentJournalEntries(limit);
        if (!active) return;
        setEntries(data);
      } catch (err) {
        if (!active) return;
        setEntries([]);
        setError(err instanceof Error ? err.message : "Failed to load entries");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadEntries();

    return () => {
      active = false;
    };
  }, [limit, reloadKey]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="sf-recent-entries__list" aria-live="polite" aria-busy>
          {[...Array(Math.min(limit, 4)).keys()].map((index) => (
            <div key={`recent-entry-skeleton-${index}`} className="sf-recent-entries__card">
              <div className="sf-recent-entries__card-header">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-12" />
              </div>
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <StateView
          type="error"
          title="Unable to load entries"
          description="Check your connection and try again."
          actionLabel="Retry"
          onAction={handleRetry}
          compact
        />
      );
    }

    if (!entries.length) {
      return (
        <StateView
          type="empty"
          title="No journal entries yet"
          description="Log your first trade or mindset note to populate this feed."
          actionLabel="Open journal"
          onAction={handleOpenJournal}
          compact
        />
      );
    }

    return (
      <div className="sf-recent-entries__list" aria-live="polite">
        {entries.slice(0, limit).map((entry) => {
          const href = entry.id ? `/journal/${entry.id}` : "/journal";
          const action = getActionLabel(entry.action);
          const dateLabel = formatDate(entry.createdAt);

          return (
            <Link key={entry.id} to={href} className="sf-recent-entries__card sf-focus-ring" aria-label={`${entry.title} – ${action}`}>
              <div className="sf-recent-entries__card-header">
                <span className={`sf-recent-entries__pill sf-recent-entries__pill--${(entry.action ?? "note").toLowerCase()}`}>
                  {action}
                </span>
                {entry.symbol ? <span className="sf-recent-entries__symbol">{entry.symbol}</span> : null}
              </div>
              <div className="sf-recent-entries__title">{entry.title}</div>
              {entry.shortNote ? <p className="sf-recent-entries__note">{entry.shortNote}</p> : null}
              <div className="sf-recent-entries__footer">
                <span className="sf-recent-entries__date">{dateLabel}</span>
                <span className="sf-recent-entries__cta">
                  View
                  <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <section className={`dashboard-card sf-card sf-recent-entries ${className ?? ""}`.trim()} data-testid="dashboard-recent-entries">
      <div className="sf-recent-entries__header">
        <div>
          <p className="sf-recent-entries__eyebrow">Journal</p>
          <h3 className="dashboard-section-heading">Recent entries</h3>
        </div>
        <Link to="/journal" className="sf-recent-entries__view-all">
          View journal
          <ArrowRight size={16} />
        </Link>
      </div>
      {renderContent()}
    </section>
  );
}
