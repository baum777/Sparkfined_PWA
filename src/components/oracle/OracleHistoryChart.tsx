import React, { useMemo } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import type { OracleReport } from '@/types/oracle';

interface OracleHistoryChartProps {
  reports: OracleReport[];
}

const themeColors: Record<string, string> = {
  Gaming: '#34d399',
  RWA: '#60a5fa',
  'AI Agents': '#a78bfa',
  DePIN: '#facc15',
  'Privacy/ZK': '#f472b6',
  'Collectibles/TCG': '#fb923c',
  'Stablecoin Yield': '#f87171',
};

export function OracleHistoryChart({ reports }: OracleHistoryChartProps) {
  const data = useMemo(
    () =>
      reports
        .slice()
        .reverse()
        .map((report) => ({
          date: formatChartDate(report.date),
          rawDate: report.date,
          score: report.score,
          topTheme: report.topTheme,
          color: themeColors[report.topTheme] ?? '#10b981',
        })),
    [reports]
  );

  return (
    <div
      className="rounded-3xl border border-border bg-surface/80 p-4 shadow-[0_15px_40px_rgba(2,6,23,0.45)]"
      data-testid="oracle-history-chart"
    >
      <div className="mb-3 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-text-primary">30-Day Score History</h3>
          <p className="text-xs text-text-secondary">Oracle score trend, color-coded by top theme.</p>
        </div>
      </div>

      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid stroke="rgba(148,163,184,0.15)" vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickMargin={8}
            />
            <YAxis
              domain={[0, 7]}
              stroke="#94a3b8"
              tick={{ fill: '#94a3b8', fontSize: 12 }}
              tickCount={8}
              allowDecimals={false}
            />
            <Tooltip content={<OracleTooltip />} />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={({ cx, cy, payload }) => (
                <circle
                  cx={cx}
                  cy={cy}
                  r={5}
                  fill={payload.color}
                  stroke="#0f172a"
                  strokeWidth={2}
                />
              )}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

function OracleTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value: number; payload: any }>;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  const data = payload[0].payload;

  return (
    <div className="rounded-2xl border border-border bg-surface px-3 py-2 text-xs text-text-secondary shadow-token-md">
      <p className="text-sm font-semibold text-text-primary">{data.rawDate}</p>
      <p className="mt-1 text-text-primary">
        Score: <span className="font-semibold text-brand">{data.score}/7</span>
      </p>
      <p className="text-text-secondary">Theme: {data.topTheme}</p>
    </div>
  );
}

function formatChartDate(date: string): string {
  const [year, month, day] = date.split('-');
  if (!year || !month || !day) return date;
  return `${day}.${month}`;
}
