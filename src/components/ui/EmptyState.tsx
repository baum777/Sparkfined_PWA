import React from 'react';
import { cn } from '@/lib/ui/cn';

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  illustration?: 'journal' | 'watchlist' | 'alerts' | 'chart' | 'generic';
  className?: string;
  compact?: boolean;
}

const illustrations = {
  journal: (
    <svg className="w-24 h-24 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
    </svg>
  ),
  watchlist: (
    <svg className="w-24 h-24 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  alerts: (
    <svg className="w-24 h-24 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  ),
  chart: (
    <svg className="w-24 h-24 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  generic: (
    <svg className="w-24 h-24 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
    </svg>
  ),
};

export function EmptyState({ 
  icon, 
  title, 
  description, 
  action, 
  secondaryAction,
  illustration = 'generic',
  className,
  compact = false,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border-moderate bg-surface-subtle/30 px-6 text-center",
        compact ? "min-h-[220px] py-8" : "min-h-[400px] py-12",
        className
      )}
    >
      {/* Icon/Illustration */}
      <div className={cn("mb-6 flex items-center justify-center rounded-full bg-surface-elevated/50", compact ? "h-16 w-16" : "h-24 w-24")}>
        {icon || illustrations[illustration]}
      </div>

      {/* Title */}
      <h3 className={cn("font-semibold text-text-primary mb-3", compact ? "text-lg" : "text-xl")}>
        {title}
      </h3>

      {/* Description */}
      <p className={cn("max-w-md text-sm text-text-secondary leading-relaxed", compact ? "mb-6" : "mb-8")}>
        {description}
      </p>

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3">
          {action && (
            <button
              onClick={action.onClick}
              className="btn btn-primary"
            >
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="btn btn-ghost"
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Preset Empty States
export function EmptyJournalState({ onCreateEntry }: { onCreateEntry: () => void }) {
  return (
    <EmptyState
      illustration="journal"
      title="Start Your Trading Journal"
      description="Document your trades, track your reasoning, and build consistent habits. Every entry helps you spot patterns and improve over time."
      action={{
        label: "Create First Entry",
        onClick: onCreateEntry,
      }}
    />
  );
}

export function EmptyWatchlistState({ onAddToken }: { onAddToken: () => void }) {
  return (
    <EmptyState
      illustration="watchlist"
      title="No Tokens in Watchlist"
      description="Add tokens to your watchlist to track their price movements, set alerts, and analyze trends in real-time."
      action={{
        label: "Add Token",
        onClick: onAddToken,
      }}
    />
  );
}

export function EmptyAlertsState({ onCreateAlert }: { onCreateAlert: () => void }) {
  return (
    <EmptyState
      illustration="alerts"
      title="No Active Alerts"
      description="Create price alerts to get notified when your favorite tokens hit specific price levels. Never miss an opportunity."
      action={{
        label: "Create Alert",
        onClick: onCreateAlert,
      }}
    />
  );
}

export function EmptySearchState({ searchTerm }: { searchTerm: string }) {
  return (
    <EmptyState
      illustration="generic"
      title="No Results Found"
      description={`No results found for "${searchTerm}". Try adjusting your search terms or filters.`}
    />
  );
}
