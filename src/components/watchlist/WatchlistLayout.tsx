import React from 'react';

interface WatchlistLayoutProps {
  children: React.ReactNode;
}

export default function WatchlistLayout({ children }: WatchlistLayoutProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface/80 p-4 sm:p-6">
      <div className="space-y-6">{children}</div>
    </div>
  );
}

