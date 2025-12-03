import React from 'react';

interface DashboardTab {
  id: string;
  label: string;
}

interface DashboardShellProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  tabs?: DashboardTab[];
  activeTabId?: string;
  onTabSelect?: (tabId: string) => void;
  kpiStrip?: React.ReactNode;
  children: React.ReactNode;
  testId?: string;
}

export default function DashboardShell({
  title,
  description,
  actions,
  tabs,
  activeTabId,
  onTabSelect,
  kpiStrip,
  children,
  testId,
}: DashboardShellProps) {
  const hasTabs = Array.isArray(tabs) && tabs.length > 0;

  return (
    <div className="min-h-screen bg-app-gradient text-text-primary" data-testid={testId}>
      <header className="border-b border-border-subtle bg-surface-elevated/60 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-text-tertiary">Sparkfined</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary md:text-4xl">{title}</h1>
              {description ? (
                <p className="mt-2 max-w-2xl text-sm text-text-secondary">{description}</p>
              ) : null}
            </div>
            {actions ? (
              <div className="flex flex-wrap items-center gap-3">{actions}</div>
            ) : null}
          </div>
          {hasTabs ? (
            <nav className="-mb-2 overflow-x-auto pb-1">
              <div className="flex gap-2">
                {tabs?.map((tab) => {
                  const isActive = tab.id === activeTabId;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => onTabSelect?.(tab.id)}
                      className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                        isActive
                          ? 'border-brand bg-interactive-active text-text-primary'
                          : 'border-border-subtle text-text-secondary hover:border-border-moderate hover:bg-interactive-hover hover:text-text-primary'
                      }`}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </nav>
          ) : null}
        </div>
      </header>

      {kpiStrip ? (
        <section className="border-b border-border-subtle bg-surface/70">
          <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 lg:px-8">{kpiStrip}</div>
        </section>
      ) : null}

      <section className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">{children}</section>
    </div>
  );
}
