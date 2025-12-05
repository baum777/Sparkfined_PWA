import React from 'react';

interface DashboardMainGridProps {
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  tertiary?: React.ReactNode;
}

export default function DashboardMainGrid({ primary, secondary, tertiary }: DashboardMainGridProps) {
  const hasSidebarContent = Boolean(secondary) || Boolean(tertiary);

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
      <div className="card-elevated rounded-3xl p-6">{primary}</div>
      {hasSidebarContent ? (
        <div className="flex flex-col gap-6">
          {secondary ? (
            <div className="card rounded-3xl p-6">{secondary}</div>
          ) : null}
          {tertiary ? (
            <div className="card rounded-3xl p-6">{tertiary}</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
