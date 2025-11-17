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
    <div className="min-h-screen bg-gradient-to-b from-[#050505] via-[#0b0b13] to-[#050505] text-zinc-100">
      <header className="border-b border-white/5 bg-black/40 backdrop-blur-xl">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Sparkfined</p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight md:text-4xl">{title}</h1>
              {description ? (
                <p className="mt-2 text-sm text-zinc-400 max-w-2xl">{description}</p>
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
                          ? 'border-blue-500/70 bg-blue-500/10 text-white'
                          : 'border-white/5 text-zinc-400 hover:border-white/30 hover:text-white'
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
        <section className="border-b border-white/5 bg-black/30">
          <div className="mx-auto w-full max-w-6xl px-4 py-4 sm:px-6 lg:px-8">{kpiStrip}</div>
        </section>
      ) : null}

      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
