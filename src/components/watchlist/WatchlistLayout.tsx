import React from 'react';

interface WatchlistLayoutProps {
  children: React.ReactNode;
}

export default function WatchlistLayout({ children }: WatchlistLayoutProps) {
  return (
    <div className="card-glass rounded-2xl p-4 sm:p-6">
      <div className="space-y-6">{children}</div>
    </div>
  );
}

