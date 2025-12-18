import React, { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getAlertsOverview, type AlertsOverviewDTO } from "@/api/alerts";
import StateView from "@/components/ui/StateView";
import { Skeleton } from "@/components/ui/Skeleton";
import { AlertTriangle, Bell, Clock } from "@/lib/icons";
import "@/features/dashboard/alerts-overview.css";

interface AlertsOverviewWidgetProps {
  className?: string;
}

export default function AlertsOverviewWidget({ className }: AlertsOverviewWidgetProps) {
  const [overview, setOverview] = useState<AlertsOverviewDTO | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const navigate = useNavigate();

  const handleOpenAlerts = useCallback(() => navigate("/alerts"), [navigate]);
  const handleRetry = useCallback(() => {
    setError(null);
    setIsLoading(true);
    setReloadKey((key) => key + 1);
  }, []);

  useEffect(() => {
    let active = true;

    const loadOverview = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getAlertsOverview();
        if (!active) return;
        setOverview(data);
      } catch (err) {
        if (!active) return;
        setOverview(null);
        setError(err instanceof Error ? err.message : "Failed to load alerts overview");
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    void loadOverview();

    return () => {
      active = false;
    };
  }, [reloadKey]);

  const hasAnyAlerts = (overview?.armed ?? 0) + (overview?.triggered ?? 0) + (overview?.paused ?? 0) > 0;

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="sf-alerts-overview__grid" aria-live="polite" aria-busy>
          {["Armed", "Triggered", "Paused"].map((label) => (
            <div key={label} className="sf-alerts-overview__stat">
              <div className="sf-alerts-overview__stat-label">
                <Skeleton className="h-4 w-20" />
              </div>
              <Skeleton className="h-6 w-12" />
            </div>
          ))}
        </div>
      );
    }

    if (error) {
      return (
        <StateView
          type="error"
          title="Unable to load alerts"
          description="We couldn’t fetch alert stats. Retry to refresh."
          actionLabel="Retry"
          onAction={handleRetry}
          compact
        />
      );
    }

    if (!hasAnyAlerts) {
      return (
        <StateView
          type="empty"
          title="No alerts yet"
          description="Create or arm alerts to see readiness here."
          actionLabel="Open alerts"
          onAction={handleOpenAlerts}
          compact
        />
      );
    }

    if (!overview) return null;

    return (
      <div className="sf-alerts-overview__grid" aria-live="polite">
        <AlertStat label="Armed" value={overview.armed} icon={<Bell size={16} />} tone="success" />
        <AlertStat label="Triggered" value={overview.triggered} icon={<AlertTriangle size={16} />} tone="danger" />
        <AlertStat label="Paused" value={overview.paused} icon={<Clock size={16} />} tone="muted" />
      </div>
    );
  };

  return (
    <section className={`dashboard-card sf-card sf-alerts-overview ${className ?? ""}`.trim()} data-testid="dashboard-alerts-overview">
      <div className="sf-alerts-overview__header">
        <div>
          <p className="sf-alerts-overview__eyebrow">Signals</p>
          <h3 className="dashboard-section-heading">Alerts overview</h3>
        </div>
        <Link to="/alerts" className="sf-alerts-overview__cta" aria-label="Open alerts">
          Manage alerts
        </Link>
      </div>
      {renderContent()}
      <div className="sf-alerts-overview__footer">
        <Link to="/alerts" className="sf-alerts-overview__footer-link">
          Open alerts
        </Link>
      </div>
    </section>
  );
}

interface AlertStatProps {
  label: string;
  value: number;
  tone: "success" | "danger" | "muted";
  icon: React.ReactNode;
}

function AlertStat({ label, value, tone, icon }: AlertStatProps) {
  return (
    <div className={`sf-alerts-overview__stat sf-alerts-overview__stat--${tone}`}>
      <div className="sf-alerts-overview__stat-label">
        <span className="sf-alerts-overview__stat-icon" aria-hidden>
          {icon}
        </span>
        <span>{label}</span>
      </div>
      <div className="sf-alerts-overview__stat-value" data-testid={`alerts-${label.toLowerCase()}-count`}>
        {value}
      </div>
    </div>
  );
}
