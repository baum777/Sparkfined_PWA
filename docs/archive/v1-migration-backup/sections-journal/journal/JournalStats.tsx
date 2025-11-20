import React from "react";
import {
  TRADE_STATUS_META,
  TRADE_STATUSES,
  computeTradeMetrics,
  type JournalNote,
  type TradeStatus,
} from "./types";

type Props = {
  notes: JournalNote[];
};

type AggregateBucket = {
  count: number;
  totalPnL: number;
  avgPnL: number;
  totalRisk?: number;
  avgRisk?: number;
};

const STATUS_ORDER: TradeStatus[] = ["idea", "entered", "running", "winner", "loser", "breakeven", "cancelled"];

export function JournalStats({ notes }: Props) {
  const stats = React.useMemo(() => buildStats(notes), [notes]);

  const winRateTone =
    stats.tradeCounts.completed === 0
      ? "text-zinc-300"
      : stats.winRate > 50
        ? "text-emerald-400"
        : stats.winRate >= 45
          ? "text-amber-400"
          : "text-rose-400";

  const profitFactorTone =
    stats.profitFactor === undefined
      ? "text-zinc-300"
      : stats.profitFactor > 2
        ? "text-emerald-400"
        : stats.profitFactor > 1
          ? "text-amber-400"
          : "text-rose-400";

  const activeTrades = stats.statusBuckets.running?.count || 0;
  const avgRisk = stats.statusBuckets.running?.avgRisk ?? stats.tradeCounts.avgRisk;

  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <header className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-zinc-100">Trading Journal Stats</h2>
          <p className="text-sm text-zinc-400">Insights zu deinen Trades & Ideen</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <StatPill label="Notizen total" value={stats.totalNotes} />
          <StatPill label="Trades" value={stats.tradeCounts.totalTrades} />
          <StatPill label="Ideen" value={stats.tradeCounts.ideas} />
        </div>
      </header>

      <div className="grid gap-3 lg:grid-cols-3">
        <div className="rounded-lg border border-zinc-800 bg-black/30 p-3">
          <h3 className="text-sm font-semibold text-zinc-200">Gesamt PnL</h3>
          <div className={`mt-2 text-2xl font-semibold ${stats.totalPnL >= 0 ? "text-emerald-300" : "text-rose-300"}`}>
            {formatNumber(stats.totalPnL)}
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            {stats.tradeCounts.completed} abgeschlossene Trades (Winner {stats.tradeCounts.winners} · Loser {stats.tradeCounts.losers} · BE {stats.tradeCounts.breakeven})
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-black/30 p-3">
          <h3 className="text-sm font-semibold text-zinc-200">Win Rate</h3>
          <div className={`mt-2 text-2xl font-semibold ${winRateTone}`}>
            {stats.tradeCounts.completed > 0 ? `${stats.winRate.toFixed(1)}%` : "—"}
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            Gewinner {stats.tradeCounts.winners} · Verlierer {stats.tradeCounts.losers} · Break-even {stats.tradeCounts.breakeven}
          </p>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-black/30 p-3">
          <h3 className="text-sm font-semibold text-zinc-200">Profit Factor</h3>
          <div className={`mt-2 text-2xl font-semibold ${profitFactorTone}`}>
            {stats.profitFactor !== undefined ? stats.profitFactor.toFixed(2) : "—"}
          </div>
          <p className="mt-1 text-xs text-zinc-400">
            ⌀ Gewinn {formatNumber(stats.avgWin)} · ⌀ Verlust {formatNumber(stats.avgLoss)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        <div className="rounded-lg border border-zinc-800 bg-black/30 p-3">
          <h3 className="text-sm font-semibold text-zinc-200">Status Übersicht</h3>
          <div className="mt-2 grid grid-cols-2 gap-2 text-[12px] text-zinc-300 sm:grid-cols-3">
            {STATUS_ORDER.map(status => {
              const bucket = stats.statusBuckets[status];
              const meta = TRADE_STATUS_META[status];
              return (
                <div key={status} className="rounded border border-zinc-800 bg-zinc-900/50 p-2">
                  <div className="flex items-center gap-2 text-[13px]">
                    <span>{meta.emoji}</span>
                    <span>{meta.label}</span>
                  </div>
                  <div className="mt-1 text-xs text-zinc-400">
                    {bucket?.count ?? 0} Einträge
                    {bucket?.totalPnL !== undefined && bucket?.count
                      ? <div className="text-[11px] text-zinc-500">PnL {formatNumber(bucket.totalPnL)}</div>
                      : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-black/30 p-3">
          <h3 className="text-sm font-semibold text-zinc-200">Top Setups</h3>
          <SetupList setups={stats.topSetups} />
        </div>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        <div className="rounded-lg border border-zinc-800 bg-black/30 p-3">
          <h3 className="text-sm font-semibold text-zinc-200">Ø Risk / Reward</h3>
          <div className="mt-2 flex items-baseline gap-3 text-zinc-300">
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500">Avg R/R</div>
              <div className={stats.avgRR !== undefined && stats.avgRR >= 2 ? "text-lg font-semibold text-emerald-300" : "text-lg font-semibold text-zinc-200"}>
                {stats.avgRR !== undefined ? stats.avgRR.toFixed(2) : "—"}
              </div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500">Avg Risk</div>
              <div className="text-lg font-semibold text-zinc-200">
                {stats.tradeCounts.avgRisk !== undefined ? formatNumber(stats.tradeCounts.avgRisk) : "—"}
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-black/30 p-3">
          <h3 className="text-sm font-semibold text-zinc-200">Laufende Trades</h3>
          <p className="mt-2 text-2xl font-semibold text-sky-300">{activeTrades}</p>
          <p className="mt-1 text-xs text-zinc-400">
            ⌀ Risiko aktuell {avgRisk !== undefined ? formatNumber(avgRisk) : "—"}
          </p>
        </div>

        <div className="rounded-lg border border-zinc-800 bg-black/30 p-3">
          <h3 className="text-sm font-semibold text-zinc-200">Ideen vs Trades</h3>
          <div className="mt-2 flex items-baseline gap-3 text-zinc-300">
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500">Ideen</div>
              <div className="text-lg font-semibold text-zinc-100">{stats.tradeCounts.ideas}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500">Trades (≠ Idee)</div>
              <div className="text-lg font-semibold text-zinc-100">{stats.tradeCounts.totalTrades - stats.tradeCounts.ideas}</div>
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-zinc-500">Conversion</div>
              <div className="text-lg font-semibold text-zinc-100">
                {stats.tradeCounts.totalTrades > 0
                  ? `${((stats.tradeCounts.totalTrades - stats.tradeCounts.ideas) / stats.tradeCounts.totalTrades * 100).toFixed(0)}%`
                  : "—"}
              </div>
            </div>
          </div>
        </div>
      </div>

      <footer className="mt-4 rounded-lg border border-amber-800/60 bg-amber-900/20 p-3 text-xs text-amber-200">
        <strong>Hinweis:</strong> Ideen (Status „Idea“) werden in Kennzahlen getrennt betrachtet. Nur abgeschlossene Trades (Winner/Loser/Breakeven) fließen in Win Rate & Profit Factor ein.
      </footer>
    </section>
  );
}

type SetupInfo = {
  name: string;
  count: number;
  avgPnL: number;
  avgRR?: number;
};

function SetupList({ setups }: { setups: SetupInfo[] }) {
  if (!setups.length) {
    return <p className="text-xs text-zinc-500">Noch keine Setups mit Ergebnissen.</p>;
  }

  return (
    <ul className="mt-2 space-y-2 text-sm text-zinc-300">
      {setups.map(setup => (
        <li key={setup.name} className="flex items-center justify-between gap-2 rounded border border-zinc-800 bg-zinc-900/60 px-3 py-2">
          <div>
            <div className="font-medium text-zinc-100">{setup.name}</div>
            <div className="text-[11px] text-zinc-400">{setup.count} Trades</div>
          </div>
          <div className="text-right text-[12px] text-zinc-300">
            <div className={setup.avgPnL >= 0 ? "text-emerald-300" : "text-rose-300"}>
              {formatNumber(setup.avgPnL)}
            </div>
            <div className="text-[11px] text-zinc-400">
              {setup.avgRR !== undefined ? `Ø R/R ${setup.avgRR.toFixed(2)}` : "—"}
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}

function StatPill({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-full border border-zinc-800 bg-black/30 px-3 py-1 text-xs text-zinc-300">
      <span className="text-zinc-500">{label}:</span>{" "}
      <span className="font-semibold text-zinc-100">{value}</span>
    </div>
  );
}

type BuiltStats = {
  totalNotes: number;
  totalPnL: number;
  winRate: number;
  profitFactor?: number;
  avgWin: number;
  avgLoss: number;
  avgRR?: number;
  tradeCounts: {
    totalTrades: number;
    completed: number;
    winners: number;
    losers: number;
    breakeven: number;
    running: number;
    entered: number;
    ideas: number;
    avgRisk?: number;
  };
  statusBuckets: Record<TradeStatus, AggregateBucket | undefined>;
  topSetups: SetupInfo[];
};

function buildStats(notes: JournalNote[]): BuiltStats {
  const statusBuckets: Record<TradeStatus, AggregateBucket | undefined> = {
    idea: undefined,
    entered: undefined,
    running: undefined,
    winner: undefined,
    loser: undefined,
    breakeven: undefined,
    cancelled: undefined,
  };

  const setupBuckets = new Map<string, { count: number; totalPnL: number; totalRR: number; rrCount: number }>();
  let totalPnL = 0;
  const totalNotes = notes.length;

  let completedTrades = 0;
  let winners = 0;
  let losers = 0;
  let breakeven = 0;
  let running = 0;
  let entered = 0;
  let ideas = 0;
  let totalTrades = 0;
  let aggregateRisk = 0;
  let riskCount = 0;

  const winPnls: number[] = [];
  const lossPnls: number[] = [];
  let totalRR = 0;
  let rrCount = 0;

  for (const note of notes) {
    const status = note.status || "idea";
    const bucket = statusBuckets[status] ?? { count: 0, totalPnL: 0, avgPnL: 0 };

    const metrics = computeTradeMetrics({
      entryPrice: note.entryPrice,
      exitPrice: note.exitPrice,
      positionSize: note.positionSize,
      stopLoss: note.stopLoss,
      takeProfit: note.takeProfit,
    });

    const pnl = metrics.pnl ?? note.pnl;
    const rr = metrics.riskRewardRatio ?? note.riskRewardRatio;
    const risk = metrics.risk;

    if (typeof pnl === "number" && Number.isFinite(pnl)) {
      totalPnL += pnl;
      bucket.totalPnL += pnl;
    }
    if (note.status && note.status !== "idea") {
      totalTrades += 1;
    }

    bucket.count += 1;

    if (typeof risk === "number" && Number.isFinite(risk)) {
      aggregateRisk += risk;
      riskCount += 1;
      bucket.totalRisk = (bucket.totalRisk || 0) + risk;
    }

    statusBuckets[status] = bucket;

    if (note.setupName) {
      const key = note.setupName.trim();
      const setup = setupBuckets.get(key) || { count: 0, totalPnL: 0, totalRR: 0, rrCount: 0 };
      setup.count += 1;
      if (typeof pnl === "number" && Number.isFinite(pnl)) setup.totalPnL += pnl;
      if (typeof rr === "number" && Number.isFinite(rr)) { setup.totalRR += rr; setup.rrCount += 1; }
      setupBuckets.set(key, setup);
    }

    if (status === "winner") {
      winners += 1;
      completedTrades += 1;
      if (typeof pnl === "number") winPnls.push(pnl);
    } else if (status === "loser") {
      losers += 1;
      completedTrades += 1;
      if (typeof pnl === "number") lossPnls.push(pnl);
    } else if (status === "breakeven") {
      breakeven += 1;
      completedTrades += 1;
    } else if (status === "running") {
      running += 1;
    } else if (status === "entered") {
      entered += 1;
    } else if (status === "idea") {
      ideas += 1;
    }

    if (typeof rr === "number" && Number.isFinite(rr)) {
      totalRR += rr;
      rrCount += 1;
    }
  }

  for (const status of TRADE_STATUSES) {
    const bucket = statusBuckets[status];
    if (bucket && bucket.count > 0) {
      bucket.avgPnL = bucket.totalPnL / bucket.count;
      if (bucket.totalRisk !== undefined) {
        bucket.avgRisk = bucket.totalRisk / bucket.count;
      }
    }
  }

  const avgWin = winPnls.length ? average(winPnls) : 0;
  const avgLoss = lossPnls.length ? average(lossPnls) : 0;
  const profitFactor = avgLoss < 0 ? Math.abs(avgWin / avgLoss) : undefined;

  const avgRR = rrCount ? totalRR / rrCount : undefined;

  const topSetups = Array.from(setupBuckets.entries())
    .map(([name, bucket]) => ({
      name,
      count: bucket.count,
      avgPnL: bucket.count ? bucket.totalPnL / bucket.count : 0,
      avgRR: bucket.rrCount ? bucket.totalRR / bucket.rrCount : undefined,
    }))
    .sort((a, b) => b.avgPnL - a.avgPnL)
    .slice(0, 3);

  const tradeCounts = {
    totalTrades,
    completed: completedTrades,
    winners,
    losers,
    breakeven,
    running,
    entered,
    ideas,
    avgRisk: riskCount ? aggregateRisk / riskCount : undefined,
  };

  const winRate = completedTrades
    ? ((winners + breakeven * 0.5) / completedTrades) * 100
    : 0;

  return {
    totalNotes,
    totalPnL,
    winRate,
    profitFactor,
    avgWin,
    avgLoss,
    avgRR,
    tradeCounts,
    statusBuckets,
    topSetups,
  };
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((acc, val) => acc + val, 0) / values.length;
}

function formatNumber(value: number) {
  if (!Number.isFinite(value)) return "—";
  if (Math.abs(value) >= 1000) {
    return `${value > 0 ? "+" : ""}${(value / 1000).toFixed(1)}k`;
  }
  return `${value > 0 ? "+" : ""}${value.toFixed(2)}`;
}
