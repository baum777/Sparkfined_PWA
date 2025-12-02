import React from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from '@/lib/icons';
import DataFreshness from '@/components/pwa/DataFreshness';

type Trend = 'up' | 'down' | 'flat';

export interface DashboardKpiItem {
  label: string;
  value: string;
  trend?: Trend;
  lastUpdated?: number; // Timestamp in ms (Date.now() format)
}

interface DashboardKpiStripProps {
  items: DashboardKpiItem[];
}

const trendConfig: Record<Trend, { icon: React.ReactNode; className: string; label: string }> = {
  up: {
    icon: <ArrowUpRight className="h-4 w-4" />,
    className: 'text-sentiment-bull bg-sentiment-bull-bg',
    label: 'Up trend',
  },
  down: {
    icon: <ArrowDownRight className="h-4 w-4" />,
    className: 'text-sentiment-bear bg-sentiment-bear-bg',
    label: 'Down trend',
  },
  flat: {
    icon: <Minus className="h-4 w-4" />,
    className: 'text-text-secondary bg-surface-skeleton',
    label: 'Flat trend',
  },
};

export default function DashboardKpiStrip({ items }: DashboardKpiStripProps) {
  if (!items.length) {
    return null;
  }

  return (
    <section
      className="relative -mx-4 overflow-x-auto px-4 py-2 md:mx-0 md:overflow-visible lg:py-0"
      aria-label="Key performance indicators"
    >
      <div className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 md:grid md:grid-cols-2 md:gap-4 md:overflow-visible lg:grid-cols-4">
        {items.map((item) => {
          const trend = item.trend ? trendConfig[item.trend] : null;
          return (
            <article
              key={item.label}
              className="group relative flex min-w-[min(240px,80vw)] flex-1 snap-start flex-col overflow-hidden rounded-2xl border border-border-subtle bg-gradient-to-br from-surface to-surface-elevated px-5 py-4 text-text-primary shadow-card-subtle backdrop-blur-sm transition-all hover:border-border-moderate hover:shadow-glow-cyan md:min-w-0 md:snap-none"
            >
              {/* Subtle gradient overlay on hover */}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
              
              <div className="relative flex items-start justify-between gap-3">
                {/* Icon + Label */}
                <div className="flex items-center gap-3">
                  {trend && (
                    <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-all ${trend.className} group-hover:scale-110`}>
                      {trend.icon}
                    </div>
                  )}
                  <div className="flex flex-col">
                    <span className="text-[11px] font-semibold uppercase tracking-[0.35em] text-text-tertiary">{item.label}</span>
                    <span className="mt-1 text-2xl font-mono font-bold">{item.value}</span>
                  </div>
                </div>
                
                {/* Status indicator */}
                {item.lastUpdated && (
                  <DataFreshness lastUpdated={item.lastUpdated} />
                )}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
