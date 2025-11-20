import React from 'react';

interface WatchlistLayoutProps {
  children: React.ReactNode;
}

export default function WatchlistLayout({ children }: WatchlistLayoutProps) {
  return (
    <div className="space-y-6 rounded-3xl border border-white/5 bg-black/20 p-4 sm:p-6">
      <div className="rounded-2xl border border-white/5 bg-black/40 p-4 sm:p-6 shadow-inner">{children}</div>
    </div>
  );
}

