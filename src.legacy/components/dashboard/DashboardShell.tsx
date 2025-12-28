import React from 'react';
import { PageLayout, PageHeader, PageContent } from '@/components/layout';

interface DashboardTab {
  id: string;
  label: string;
}

interface DashboardShellProps {
  title: string;
  description?: string;
  meta?: string;
  actions?: React.ReactNode;
  tabs?: DashboardTab[];
  activeTabId?: string;
  onTabSelect?: (tabId: string) => void;
  kpiStrip?: React.ReactNode;
  children: React.ReactNode;
}

export default function DashboardShell({
  title,
  description,
  meta,
  actions,
  tabs,
  activeTabId,
  onTabSelect,
  kpiStrip,
  children,
}: DashboardShellProps) {
  const hasTabs = Array.isArray(tabs) && tabs.length > 0;

  return (
    <PageLayout className="space-y-6">
      <PageHeader
        title={title}
        subtitle={description}
        meta={meta}
        actions={actions}
        tabs={
          hasTabs ? (
            <div className="flex gap-2">
              {tabs?.map((tab) => {
                const isActive = tab.id === activeTabId;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => onTabSelect?.(tab.id)}
                    className={`rounded-full border px-4 py-2 text-sm font-medium transition hover:scale-[1.01] ${
                      isActive
                        ? 'border-border bg-brand/10 text-brand shadow-glow-brand'
                        : 'border-border/70 text-text-secondary hover:bg-interactive-hover hover:text-text-primary'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>
          ) : undefined
        }
      />

      {kpiStrip ? (
        <section className="rounded-3xl border border-border/60 bg-surface/70 px-4 py-4 shadow-card-subtle backdrop-blur-md sm:px-6">
          {kpiStrip}
        </section>
      ) : null}

      <PageContent>{children}</PageContent>
    </PageLayout>
  );
}
