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
}: DashboardShellProps) {
  const hasTabs = Array.isArray(tabs) && tabs.length > 0;

  return (
    <div className="relative min-h-screen bg-app-gradient text-text-primary">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(var(--color-brand)_/_0.18),transparent_35%),radial-gradient(circle_at_85%_10%,rgba(var(--color-cyan)_/_0.14),transparent_32%)]"
      />
      <div className="relative">
        <header className="border-b border-border/70 bg-surface/70 backdrop-blur-xl">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="space-y-2">
                <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-text-tertiary">Sparkfined Suite</p>
                <div className="space-y-1">
                  <h1 className="text-3xl font-semibold tracking-tight text-text-primary md:text-4xl">{title}</h1>
                  {description ? (
                    <p className="max-w-3xl text-sm text-text-secondary">{description}</p>
                  ) : null}
                </div>
              </div>
              {actions ? (
                <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-surface-subtle/80 px-3 py-2 shadow-sm ring-1 ring-border/80">
                  {actions}
                </div>
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
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition hover-scale ${
                          isActive
                            ? 'border-glow-brand bg-brand/10 text-brand'
                            : 'border-border text-text-secondary hover:bg-interactive-hover hover:text-text-primary'
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
          <section className="border-b border-border/70 bg-surface/70 backdrop-blur-xl">
            <div className="mx-auto w-full max-w-7xl px-4 py-4 sm:px-6 lg:px-10">{kpiStrip}</div>
          </section>
        ) : null}

        <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-10">{children}</section>
      </div>
    </div>
  );
}
