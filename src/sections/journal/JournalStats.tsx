import React from "react";
import type { JournalNote } from "./types";

export default function JournalStats({ notes }: { notes: JournalNote[] }) {
  // Filter nur Trades mit Status (nicht reine Notizen)
  const trades = notes.filter(n => n.status && n.status !== "idea" && n.status !== "cancelled");
  
  // Statistiken berechnen
  const winners = trades.filter(n => n.status === "winner");
  const losers = trades.filter(n => n.status === "loser");
  const breakeven = trades.filter(n => n.status === "breakeven");
  const running = trades.filter(n => n.status === "running" || n.status === "entered");
  
  const totalTrades = winners.length + losers.length + breakeven.length;
  const winRate = totalTrades > 0 ? (winners.length / totalTrades) * 100 : 0;
  
  // PnL-Summen (nur abgeschlossene Trades mit PnL)
  const totalPnl = [...winners, ...losers, ...breakeven]
    .filter(n => typeof n.pnl === "number")
    .reduce((sum, n) => sum + (n.pnl || 0), 0);
  
  const avgWin = winners.length > 0
    ? winners.filter(n => typeof n.pnl === "number").reduce((sum, n) => sum + (n.pnl || 0), 0) / winners.length
    : 0;
    
  const avgLoss = losers.length > 0
    ? losers.filter(n => typeof n.pnl === "number").reduce((sum, n) => sum + (n.pnl || 0), 0) / losers.length
    : 0;
  
  const profitFactor = Math.abs(avgLoss) > 0 ? avgWin / Math.abs(avgLoss) : 0;
  
  // Durchschnittliche R/R Ratio
  const avgRR = trades.filter(n => typeof n.riskRewardRatio === "number")
    .reduce((sum, n, _, arr) => sum + (n.riskRewardRatio || 0) / arr.length, 0);
  
  // Setups Breakdown
  const setupCounts = trades.reduce((acc, n) => {
    if (n.setup) {
      acc[n.setup] = (acc[n.setup] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  const topSetups = Object.entries(setupCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  if (trades.length === 0) {
    return (
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4 text-center">
        <div className="text-sm text-zinc-400">
          Noch keine Trading-Daten vorhanden. Füge Trading-Details zu deinen Journal-Einträgen hinzu, um Statistiken zu sehen.
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-base font-semibold text-zinc-100">📊 Trading-Statistiken</h3>
        <div className="text-xs text-zinc-500">{trades.length} Trades</div>
      </div>
      
      <div className="grid gap-3 md:grid-cols-3">
        {/* Gesamt P&L */}
        <div className="rounded-lg border border-zinc-800 bg-black/30 p-3">
          <div className="text-[10px] text-zinc-400">Gesamt P&L</div>
          <div className={`text-2xl font-bold ${totalPnl >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
            {totalPnl >= 0 ? "+" : ""}{totalPnl.toFixed(2)}
          </div>
          <div className="mt-1 text-[10px] text-zinc-500">USD</div>
        </div>
        
        {/* Win Rate */}
        <div className="rounded-lg border border-zinc-800 bg-black/30 p-3">
          <div className="text-[10px] text-zinc-400">Win Rate</div>
          <div className={`text-2xl font-bold ${winRate >= 50 ? "text-emerald-400" : "text-amber-400"}`}>
            {winRate.toFixed(1)}%
          </div>
          <div className="mt-1 text-[10px] text-zinc-500">
            {winners.length}W · {losers.length}L · {breakeven.length}BE
          </div>
        </div>
        
        {/* Profit Factor */}
        <div className="rounded-lg border border-zinc-800 bg-black/30 p-3">
          <div className="text-[10px] text-zinc-400">Profit Factor</div>
          <div className={`text-2xl font-bold ${profitFactor >= 2 ? "text-emerald-400" : profitFactor >= 1 ? "text-amber-400" : "text-rose-400"}`}>
            {profitFactor.toFixed(2)}
          </div>
          <div className="mt-1 text-[10px] text-zinc-500">
            Avg Win: ${avgWin.toFixed(0)} · Loss: ${avgLoss.toFixed(0)}
          </div>
        </div>
      </div>
      
      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {/* Status-Übersicht */}
        <div className="rounded-lg border border-zinc-800 bg-black/30 p-3">
          <div className="mb-2 text-xs font-medium text-zinc-300">Status</div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">🎉 Winners</span>
              <span className="font-medium text-emerald-300">{winners.length}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">📉 Losers</span>
              <span className="font-medium text-rose-300">{losers.length}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">➖ Breakeven</span>
              <span className="font-medium text-zinc-400">{breakeven.length}</span>
            </div>
            <div className="flex items-center justify-between text-[11px]">
              <span className="text-zinc-400">🏃 Laufend</span>
              <span className="font-medium text-cyan-300">{running.length}</span>
            </div>
          </div>
        </div>
        
        {/* Top Setups */}
        <div className="rounded-lg border border-zinc-800 bg-black/30 p-3">
          <div className="mb-2 text-xs font-medium text-zinc-300">Top Setups</div>
          {topSetups.length > 0 ? (
            <div className="space-y-1">
              {topSetups.map(([setup, count]) => (
                <div key={setup} className="flex items-center justify-between text-[11px]">
                  <span className="truncate text-zinc-400">{setup}</span>
                  <span className="font-medium text-zinc-300">{count}×</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[11px] text-zinc-500">Keine Setups erfasst</div>
          )}
          {avgRR > 0 && (
            <div className="mt-2 border-t border-zinc-800 pt-2 text-[11px]">
              <span className="text-zinc-400">Avg R/R:</span>
              <span className="ml-1 font-medium text-emerald-300">{avgRR.toFixed(2)}</span>
            </div>
          )}
        </div>
      </div>
      
      {/* Timeline-Hint */}
      {running.length > 0 && (
        <div className="mt-3 rounded border border-cyan-900/40 bg-cyan-950/10 p-2 text-xs text-cyan-200">
          💡 Du hast {running.length} laufende Trade{running.length > 1 ? "s" : ""}. 
          Aktualisiere den Status, wenn der Trade abgeschlossen ist.
        </div>
      )}
    </div>
  );
}
