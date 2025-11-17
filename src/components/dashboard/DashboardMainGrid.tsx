import React from 'react';

interface DashboardMainGridProps {
  primary: React.ReactNode;
  secondary?: React.ReactNode;
}

export default function DashboardMainGrid({ primary, secondary }: DashboardMainGridProps) {
  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="rounded-3xl border border-white/5 bg-black/40 p-6">{primary}</div>
      {secondary ? (
        <div className="rounded-3xl border border-white/5 bg-black/30 p-6">{secondary}</div>
      ) : null}
    </div>
  );
}
