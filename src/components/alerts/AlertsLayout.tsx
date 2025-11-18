import React from 'react';

interface AlertsLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export default function AlertsLayout({ title, subtitle, children }: AlertsLayoutProps) {
  return (
    <section className="space-y-6 rounded-3xl border border-white/5 bg-black/20 p-4 sm:p-6">
      <header className="space-y-2">
        <p className="text-xs uppercase tracking-[0.4em] text-zinc-500">Sparkfined</p>
        <div>
          <h1 className="text-3xl font-semibold text-white">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-zinc-400">{subtitle}</p> : null}
        </div>
      </header>

      <div className="rounded-2xl border border-white/5 bg-black/40 p-4 sm:p-6 shadow-inner">
        {children}
      </div>
    </section>
  );
}

