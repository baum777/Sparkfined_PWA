import React from 'react';

interface WatchlistLayoutProps {
  children: React.ReactNode;
}

export default function WatchlistLayout({ children }: WatchlistLayoutProps) {
  return (
    <div className="space-y-6 rounded-3xl border border-border-subtle bg-surface-subtle p-4 sm:p-6">
      <div className="rounded-2xl border border-border-subtle bg-surface-elevated p-4 sm:p-6 shadow-inner">{children}</div>
    </div>
  );
}

