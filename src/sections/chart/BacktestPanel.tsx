import React from "react";
import type { BacktestResult, BacktestHit } from "./backtest";

export default function BacktestPanel({
  rulesCount, onRun, result, onJump
}: {
  rulesCount: number;
  onRun: () => void;
  result?: BacktestResult | null;
  onJump: (t:number) => void;
}) {
  const btn = "rounded-lg border border-zinc-700 px-2 py-1 text-xs text-zinc-200 hover:bg-zinc-800";
  return (
    <div className="mt-3 rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="text-sm text-zinc-200">Backtesting</div>
        <button className={btn} onClick={onRun}>Run Backtest ({rulesCount} Regeln)</button>
      </div>
      {result && (
        <>
          <div className="mb-2 text-xs text-zinc-400">
            Treffer: <b>{result.hits.length}</b>
          </div>
          <div className="max-h-48 overflow-auto rounded border border-zinc-800">
            <table className="w-full text-[11px]">
              <thead className="bg-zinc-900 text-zinc-400">
                <tr>
                  <th className="px-2 py-1 text-left">Zeit</th>
                  <th className="px-2 py-1 text-left">Regel</th>
                  <th className="px-2 py-1 text-left">Kurs</th>
                  <th className="px-2 py-1 text-left">Meta</th>
                  <th className="px-2 py-1"></th>
                </tr>
              </thead>
              <tbody>
                {result.hits.slice(0,200).map((h:BacktestHit) => (
                  <tr key={`${h.ruleId}-${h.t}`} className="border-t border-zinc-800">
                    <td className="px-2 py-1">{new Date(h.t).toLocaleString()}</td>
                    <td className="px-2 py-1">{h.kind}</td>
                    <td className="px-2 py-1">{fmt(h.c)}</td>
                    <td className="px-2 py-1">{h.meta ? Object.entries(h.meta).map(([k,v])=>`${k}:${v}`).join(" ") : "-"}</td>
                    <td className="px-2 py-1 text-right">
                      <button className="rounded border border-cyan-700 px-2 py-0.5 text-[10px] text-cyan-100 hover:bg-cyan-900/20"
                        onClick={()=>onJump(h.t)}>
                        Jump
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
      {!result && <div className="text-[11px] text-zinc-500">Wähle Zeitraum im Chart, dann „Run Backtest".</div>}
    </div>
  );
}

function fmt(n:number){ return new Intl.NumberFormat(undefined, { maximumFractionDigits: 6 }).format(n); }
