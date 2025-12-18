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
      <div className="dashboard-horizontal-scroll snap-x snap-mandatory md:grid md:grid-cols-2 md:gap-4 md:overflow-visible lg:grid-cols-4">
        {items.map((item) => {
          const trend = item.trend ? trendConfig[item.trend] : null;
          return (
            <article
              key={item.label}
              className="card-glass hover-lift flex min-w-[min(240px,80vw)] flex-1 snap-start flex-col px-4 py-3 text-text-primary md:min-w-0 md:snap-none"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="text-[11px] uppercase tracking-[0.4em] text-text-tertiary">{item.label}</span>
                {item.lastUpdated && <DataFreshness lastUpdated={item.lastUpdated} />}
              </div>
              <div className="mt-2 flex items-baseline justify-between gap-3">
                <span className="text-2xl font-mono font-semibold">{item.value}</span>
                {trend ? (
                  <span
                    className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold ${trend.className}`}
                    aria-label={trend.label}
                  >
                    {trend.icon}
                    {item.trend === 'flat' ? '—' : 'Live'}
                  </span>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
