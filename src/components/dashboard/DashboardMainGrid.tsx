import React from 'react';
import { cn } from '@/lib/ui/cn';

interface DashboardMainGridProps {
  primary: React.ReactNode;
  secondary?: React.ReactNode;
  tertiary?: React.ReactNode;
}

export default function DashboardMainGrid({ primary, secondary, tertiary }: DashboardMainGridProps) {
  const hasSidebarContent = Boolean(secondary) || Boolean(tertiary);
  const primarySpan = hasSidebarContent ? 'lg:col-span-7 xl:col-span-8' : 'lg:col-span-12';

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className={cn('card-elevated rounded-3xl p-6', primarySpan)}>{primary}</div>
      {hasSidebarContent ? (
        <div className="flex flex-col gap-6 lg:col-span-5 xl:col-span-4">
          {secondary ? <div className="card-glass rounded-3xl p-6">{secondary}</div> : null}
          {tertiary ? <div className="card-glass rounded-3xl p-6">{tertiary}</div> : null}
        </div>
      ) : null}
    </div>
  );
}
