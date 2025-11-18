import React from 'react';
import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

type Trend = 'up' | 'down' | 'flat';

export interface DashboardKpiItem {
  label: string;
  value: string;
  trend?: Trend;
}

interface DashboardKpiStripProps {
  items: DashboardKpiItem[];
}

const trendConfig: Record<Trend, { icon: React.ReactNode; className: string; label: string }> = {
  up: {
    icon: <ArrowUpRight className="h-4 w-4" />,
    className: 'text-emerald-400 bg-emerald-500/10',
    label: 'Up trend',
  },
  down: {
    icon: <ArrowDownRight className="h-4 w-4" />,
    className: 'text-rose-400 bg-rose-500/10',
    label: 'Down trend',
  },
  flat: {
    icon: <Minus className="h-4 w-4" />,
    className: 'text-zinc-300 bg-white/5',
    label: 'Flat trend',
  },
};

export default function DashboardKpiStrip({ items }: DashboardKpiStripProps) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-full gap-3">
        {items.map((item) => {
          const trend = item.trend ? trendConfig[item.trend] : null;
          return (
            <div
              key={item.label}
              className="flex min-w-[160px] flex-1 flex-col rounded-2xl border border-white/5 bg-white/5 px-4 py-3 backdrop-blur"
            >
              <span className="text-xs uppercase tracking-widest text-zinc-400">{item.label}</span>
              <div className="mt-2 flex items-baseline justify-between gap-3">
                <span className="text-2xl font-mono font-semibold text-white">{item.value}</span>
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
            </div>
          );
        })}
      </div>
    </div>
  );
}
