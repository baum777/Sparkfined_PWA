/**
 * PatternDashboard.tsx
 * 
 * Analytics dashboard for pattern recognition across journal entries.
 * Features:
 * - Win-rate by setup, emotion, custom tags
 * - Time-to-exit analysis
 * - Best/worst performing patterns
 * - Emotion-pattern correlation
 * - Filter & drill-down capabilities
 */

import React from "react";
import type { JournalEntry, PatternStats, SetupTag, EmotionTag } from "@/types/journal";

export interface PatternDashboardProps {
  stats: PatternStats;
  entries: JournalEntry[];
  onFilterByPattern: (setup?: SetupTag, emotion?: EmotionTag) => void;
  onViewEntry: (entryId: string) => void;
}

export default function PatternDashboard({
  stats,
  entries,
  onFilterByPattern,
  onViewEntry,
}: PatternDashboardProps) {
  const [activeTab, setActiveTab] = React.useState<"overview" | "setup" | "emotion" | "library">("overview");

  // Calculate win rate for a specific setup
  const getSetupWinRate = (setup: SetupTag) => {
    const setupStats = stats.bySetup.find((s) => s.setup === setup);
    if (!setupStats || setupStats.totalTrades === 0) return 0;
    return (setupStats.winCount / setupStats.totalTrades) * 100;
  };

  // Calculate win rate for a specific emotion
  const getEmotionWinRate = (emotion: EmotionTag) => {
    const emotionStats = stats.byEmotion.find((e) => e.emotion === emotion);
    if (!emotionStats || emotionStats.totalTrades === 0) return 0;
    return (emotionStats.winCount / emotionStats.totalTrades) * 100;
  };

  // Get best performing patterns (setup + emotion combo)
  const bestPatterns = React.useMemo(() => {
    const patterns: Array<{
      setup: SetupTag;
      emotion: EmotionTag;
      count: number;
      winRate: number;
      avgPnl: number;
    }> = [];

    const closedEntries = entries.filter((e) => e.status === "closed" && e.outcome);

    // Group by setup + emotion
    const combos = new Map<string, JournalEntry[]>();
    closedEntries.forEach((entry) => {
      const key = `${entry.setup}-${entry.emotion}`;
      if (!combos.has(key)) combos.set(key, []);
      combos.get(key)!.push(entry);
    });

    // Calculate stats for each combo
    combos.forEach((comboEntries, key) => {
      const [setup, emotion] = key.split("-") as [SetupTag, EmotionTag];
      const wins = comboEntries.filter((e) => e.outcome!.pnl > 0).length;
      const totalPnl = comboEntries.reduce((sum, e) => sum + e.outcome!.pnl, 0);
      
      patterns.push({
        setup,
        emotion,
        count: comboEntries.length,
        winRate: (wins / comboEntries.length) * 100,
        avgPnl: totalPnl / comboEntries.length,
      });
    });

    // Sort by win rate, then avg PnL
    return patterns
      .sort((a, b) => {
        if (b.winRate !== a.winRate) return b.winRate - a.winRate;
        return b.avgPnl - a.avgPnl;
      })
      .slice(0, 5); // Top 5
  }, [entries]);

  // Get worst performing patterns
  const worstPatterns = React.useMemo(() => {
    const patterns: Array<{
      setup: SetupTag;
      emotion: EmotionTag;
      count: number;
      winRate: number;
      avgPnl: number;
    }> = [];

    const closedEntries = entries.filter((e) => e.status === "closed" && e.outcome);

    const combos = new Map<string, JournalEntry[]>();
    closedEntries.forEach((entry) => {
      const key = `${entry.setup}-${entry.emotion}`;
      if (!combos.has(key)) combos.set(key, []);
      combos.get(key)!.push(entry);
    });

    combos.forEach((comboEntries, key) => {
      const [setup, emotion] = key.split("-") as [SetupTag, EmotionTag];
      const wins = comboEntries.filter((e) => e.outcome!.pnl > 0).length;
      const totalPnl = comboEntries.reduce((sum, e) => sum + e.outcome!.pnl, 0);
      
      patterns.push({
        setup,
        emotion,
        count: comboEntries.length,
        winRate: (wins / comboEntries.length) * 100,
        avgPnl: totalPnl / comboEntries.length,
      });
    });

    return patterns
      .sort((a, b) => {
        if (a.winRate !== b.winRate) return a.winRate - b.winRate;
        return a.avgPnl - b.avgPnl;
      })
      .slice(0, 5); // Bottom 5
  }, [entries]);

  // Format PnL for display
  const formatPnl = (pnl: number) => {
    const sign = pnl >= 0 ? "+" : "";
    return `${sign}$${pnl.toFixed(2)}`;
  };

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-800 pb-2">
        {[
          { id: "overview", label: "📊 Overview" },
          { id: "setup", label: "🎯 By Setup" },
          { id: "emotion", label: "😐 By Emotion" },
          { id: "library", label: "📚 Pattern Library" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-cyan-500/20 text-cyan-400"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard
              label="Total Trades"
              value={stats.totalTrades}
              icon="📊"
            />
            <StatCard
              label="Win Rate"
              value={`${stats.winRate.toFixed(1)}%`}
              icon="🎯"
              color={stats.winRate >= 50 ? "green" : "red"}
            />
            <StatCard
              label="Avg PnL"
              value={formatPnl(stats.avgPnl)}
              icon="💰"
              color={stats.avgPnl >= 0 ? "green" : "red"}
            />
            <StatCard
              label="Avg Time to Exit"
              value={`${Math.floor(stats.avgTimeToExit / 3600000)}h`}
              icon="⏱"
            />
          </div>

          {/* Best Patterns */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <h3 className="mb-3 text-sm font-semibold text-green-400">
              ✅ Best Performing Patterns
            </h3>
            {bestPatterns.length === 0 ? (
              <p className="text-xs text-zinc-600">
                No closed trades yet. Close some trades to see patterns.
              </p>
            ) : (
              <div className="space-y-2">
                {bestPatterns.map((pattern, idx) => (
                  <button
                    key={`best-${idx}`}
                    onClick={() => onFilterByPattern(pattern.setup, pattern.emotion)}
                    className="flex w-full items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-left transition-colors hover:border-green-500/50 hover:bg-green-500/5"
                  >
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <span className="rounded bg-green-500/20 px-2 py-0.5 text-xs font-medium text-green-400">
                          {pattern.setup}
                        </span>
                        <span className="rounded bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-400">
                          {pattern.emotion}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600">
                        {pattern.count} trades • {pattern.winRate.toFixed(0)}% win rate
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-400">
                        {formatPnl(pattern.avgPnl)}
                      </p>
                      <p className="text-xs text-zinc-600">avg</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Worst Patterns */}
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
            <h3 className="mb-3 text-sm font-semibold text-red-400">
              ❌ Worst Performing Patterns
            </h3>
            {worstPatterns.length === 0 ? (
              <p className="text-xs text-zinc-600">
                No closed trades yet.
              </p>
            ) : (
              <div className="space-y-2">
                {worstPatterns.map((pattern, idx) => (
                  <button
                    key={`worst-${idx}`}
                    onClick={() => onFilterByPattern(pattern.setup, pattern.emotion)}
                    className="flex w-full items-center justify-between rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-left transition-colors hover:border-red-500/50 hover:bg-red-500/5"
                  >
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <span className="rounded bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-400">
                          {pattern.setup}
                        </span>
                        <span className="rounded bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-400">
                          {pattern.emotion}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-600">
                        {pattern.count} trades • {pattern.winRate.toFixed(0)}% win rate
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-red-400">
                        {formatPnl(pattern.avgPnl)}
                      </p>
                      <p className="text-xs text-zinc-600">avg</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* By Setup Tab */}
      {activeTab === "setup" && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <h3 className="mb-3 text-sm font-semibold text-zinc-200">
            Performance by Setup
          </h3>
          <div className="space-y-3">
            {stats.bySetup.map((setup) => (
              <div
                key={setup.setup}
                className="rounded-lg border border-zinc-800 bg-zinc-950 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded bg-green-500/20 px-2 py-1 text-xs font-medium text-green-400">
                    {setup.setup}
                  </span>
                  <span className="text-xs text-zinc-600">
                    {setup.totalTrades} trades
                  </span>
                </div>
                
                {/* Win Rate Bar */}
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Win Rate</span>
                    <span className="font-medium">
                      {((setup.winCount / setup.totalTrades) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-green-500"
                      style={{
                        width: `${(setup.winCount / setup.totalTrades) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-zinc-600">Avg PnL</p>
                    <p
                      className={`font-medium ${
                        setup.avgPnl >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {formatPnl(setup.avgPnl)}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-600">Total PnL</p>
                    <p
                      className={`font-medium ${
                        setup.totalPnl >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {formatPnl(setup.totalPnl)}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-600">W/L</p>
                    <p className="font-medium text-zinc-300">
                      {setup.winCount}/{setup.lossCount}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onFilterByPattern(setup.setup, undefined)}
                  className="mt-2 w-full rounded-lg bg-zinc-800 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
                >
                  View All {setup.setup} Trades →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* By Emotion Tab */}
      {activeTab === "emotion" && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <h3 className="mb-3 text-sm font-semibold text-zinc-200">
            Performance by Emotion
          </h3>
          <div className="space-y-3">
            {stats.byEmotion.map((emotion) => (
              <div
                key={emotion.emotion}
                className="rounded-lg border border-zinc-800 bg-zinc-950 p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded bg-purple-500/20 px-2 py-1 text-xs font-medium text-purple-400">
                    {emotion.emotion}
                  </span>
                  <span className="text-xs text-zinc-600">
                    {emotion.totalTrades} trades
                  </span>
                </div>
                
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>Win Rate</span>
                    <span className="font-medium">
                      {((emotion.winCount / emotion.totalTrades) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-zinc-800">
                    <div
                      className="h-full rounded-full bg-purple-500"
                      style={{
                        width: `${(emotion.winCount / emotion.totalTrades) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-zinc-600">Avg PnL</p>
                    <p
                      className={`font-medium ${
                        emotion.avgPnl >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {formatPnl(emotion.avgPnl)}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-600">Total PnL</p>
                    <p
                      className={`font-medium ${
                        emotion.totalPnl >= 0 ? "text-green-400" : "text-red-400"
                      }`}
                    >
                      {formatPnl(emotion.totalPnl)}
                    </p>
                  </div>
                  <div>
                    <p className="text-zinc-600">W/L</p>
                    <p className="font-medium text-zinc-300">
                      {emotion.winCount}/{emotion.lossCount}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onFilterByPattern(undefined, emotion.emotion)}
                  className="mt-2 w-full rounded-lg bg-zinc-800 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-700 hover:text-zinc-200"
                >
                  View All {emotion.emotion} Trades →
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pattern Library Tab */}
      {activeTab === "library" && (
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
          <h3 className="mb-3 text-sm font-semibold text-zinc-200">
            📚 Successful Pattern Library
          </h3>
          <p className="mb-4 text-xs text-zinc-500">
            Browse trades with PnL &gt; 10% to build your pattern library
          </p>
          
          {entries.filter((e) => e.status === "closed" && e.outcome && e.outcome.pnlPercent > 10).length === 0 ? (
            <p className="text-xs text-zinc-600">
              No successful patterns yet. Close trades with &gt;10% PnL to build your library.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {entries
                .filter((e) => e.status === "closed" && e.outcome && e.outcome.pnlPercent > 10)
                .slice(0, 6) // Show top 6
                .map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => onViewEntry(entry.id)}
                    className="rounded-lg border border-zinc-800 bg-zinc-950 p-3 text-left transition-colors hover:border-green-500/50 hover:bg-green-500/5"
                  >
                    {/* Screenshot Preview */}
                    {entry.chartSnapshot?.screenshot && (
                      <img
                        src={entry.chartSnapshot.screenshot}
                        alt="Chart"
                        className="mb-2 h-24 w-full rounded object-cover"
                      />
                    )}
                    
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-sm font-semibold text-zinc-200">
                        {entry.ticker}
                      </span>
                      <span className="rounded bg-green-500/20 px-1.5 py-0.5 text-xs font-medium text-green-400">
                        {entry.setup}
                      </span>
                    </div>
                    
                    <p className="mb-2 line-clamp-2 text-xs text-zinc-500">
                      {entry.thesis || "No thesis"}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-zinc-600">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </span>
                      <span className="font-bold text-green-400">
                        +{entry.outcome!.pnlPercent.toFixed(1)}%
                      </span>
                    </div>
                  </button>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Helper component for stat cards
function StatCard({
  label,
  value,
  icon,
  color,
}: {
  label: string;
  value: string | number;
  icon: string;
  color?: "green" | "red" | "cyan";
}) {
  const colorClasses = {
    green: "border-green-500/50 bg-green-500/10 text-green-400",
    red: "border-red-500/50 bg-red-500/10 text-red-400",
    cyan: "border-cyan-500/50 bg-cyan-500/10 text-cyan-400",
  };

  return (
    <div
      className={`rounded-xl border p-4 ${
        color
          ? colorClasses[color]
          : "border-zinc-800 bg-zinc-900/60 text-zinc-200"
      }`}
    >
      <div className="mb-1 text-2xl">{icon}</div>
      <p className="mb-1 text-xs text-zinc-500">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
