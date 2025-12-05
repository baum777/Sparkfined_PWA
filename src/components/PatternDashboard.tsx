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
      <div className="flex gap-2 border-b border-smoke-light pb-2">
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
                ? "bg-spark/20 text-spark"
                : "text-ash hover:text-fog"
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
          <div className="rounded-xl border border-smoke-light bg-smoke/60 p-4">
            <h3 className="mb-3 text-sm font-semibold text-phosphor">
              ✅ Best Performing Patterns
            </h3>
            {bestPatterns.length === 0 ? (
              <p className="text-xs text-ash">
                No closed trades yet. Close some trades to see patterns.
              </p>
            ) : (
              <div className="space-y-2">
                {bestPatterns.map((pattern, idx) => (
                  <button
                    key={`best-${idx}`}
                    onClick={() => onFilterByPattern(pattern.setup, pattern.emotion)}
                    className="flex w-full items-center justify-between rounded-lg border border-smoke-light bg-void-lighter p-3 text-left transition-colors hover:border-phosphor/50 hover:bg-phosphor/5"
                  >
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <span className="rounded bg-phosphor/20 px-2 py-0.5 text-xs font-medium text-phosphor">
                          {pattern.setup}
                        </span>
                        <span className="rounded bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-400">
                          {pattern.emotion}
                        </span>
                      </div>
                      <p className="text-xs text-ash">
                        {pattern.count} trades • {pattern.winRate.toFixed(0)}% win rate
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-phosphor">
                        {formatPnl(pattern.avgPnl)}
                      </p>
                      <p className="text-xs text-ash">avg</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Worst Patterns */}
          <div className="rounded-xl border border-smoke-light bg-smoke/60 p-4">
            <h3 className="mb-3 text-sm font-semibold text-blood">
              ❌ Worst Performing Patterns
            </h3>
            {worstPatterns.length === 0 ? (
              <p className="text-xs text-ash">
                No closed trades yet.
              </p>
            ) : (
              <div className="space-y-2">
                {worstPatterns.map((pattern, idx) => (
                  <button
                    key={`worst-${idx}`}
                    onClick={() => onFilterByPattern(pattern.setup, pattern.emotion)}
                    className="flex w-full items-center justify-between rounded-lg border border-smoke-light bg-void-lighter p-3 text-left transition-colors hover:border-blood/50 hover:bg-blood/5"
                  >
                    <div>
                      <div className="mb-1 flex items-center gap-2">
                        <span className="rounded bg-blood/20 px-2 py-0.5 text-xs font-medium text-blood">
                          {pattern.setup}
                        </span>
                        <span className="rounded bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-400">
                          {pattern.emotion}
                        </span>
                      </div>
                      <p className="text-xs text-ash">
                        {pattern.count} trades • {pattern.winRate.toFixed(0)}% win rate
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-blood">
                        {formatPnl(pattern.avgPnl)}
                      </p>
                      <p className="text-xs text-ash">avg</p>
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
        <div className="rounded-xl border border-smoke-light bg-smoke/60 p-4">
          <h3 className="mb-3 text-sm font-semibold text-mist">
            Performance by Setup
          </h3>
          <div className="space-y-3">
            {stats.bySetup.map((setup) => (
              <div
                key={setup.setup}
                className="rounded-lg border border-smoke-light bg-void-lighter p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded bg-phosphor/20 px-2 py-1 text-xs font-medium text-phosphor">
                    {setup.setup}
                  </span>
                  <span className="text-xs text-ash">
                    {setup.totalTrades} trades
                  </span>
                </div>
                
                {/* Win Rate Bar */}
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs text-fog">
                    <span>Win Rate</span>
                    <span className="font-medium">
                      {((setup.winCount / setup.totalTrades) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-smoke-light">
                    <div
                      className="h-full rounded-full bg-phosphor"
                      style={{
                        width: `${(setup.winCount / setup.totalTrades) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div>
                    <p className="text-ash">Avg PnL</p>
                    <p
                      className={`font-medium ${
                        setup.avgPnl >= 0 ? "text-phosphor" : "text-blood"
                      }`}
                    >
                      {formatPnl(setup.avgPnl)}
                    </p>
                  </div>
                  <div>
                    <p className="text-ash">Total PnL</p>
                    <p
                      className={`font-medium ${
                        setup.totalPnl >= 0 ? "text-phosphor" : "text-blood"
                      }`}
                    >
                      {formatPnl(setup.totalPnl)}
                    </p>
                  </div>
                  <div>
                    <p className="text-ash">W/L</p>
                    <p className="font-medium text-fog">
                      {setup.winCount}/{setup.lossCount}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onFilterByPattern(setup.setup, undefined)}
                  className="mt-2 w-full rounded-lg bg-smoke-light py-1 text-xs text-fog transition-colors hover:bg-smoke-lighter hover:text-mist"
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
        <div className="rounded-xl border border-smoke-light bg-smoke/60 p-4">
          <h3 className="mb-3 text-sm font-semibold text-mist">
            Performance by Emotion
          </h3>
          <div className="space-y-3">
            {stats.byEmotion.map((emotion) => (
              <div
                key={emotion.emotion}
                className="rounded-lg border border-smoke-light bg-void-lighter p-3"
              >
                <div className="mb-2 flex items-center justify-between">
                  <span className="rounded bg-purple-500/20 px-2 py-1 text-xs font-medium text-purple-400">
                    {emotion.emotion}
                  </span>
                  <span className="text-xs text-ash">
                    {emotion.totalTrades} trades
                  </span>
                </div>
                
                <div className="mb-2">
                  <div className="flex items-center justify-between text-xs text-fog">
                    <span>Win Rate</span>
                    <span className="font-medium">
                      {((emotion.winCount / emotion.totalTrades) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-smoke-light">
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
                    <p className="text-ash">Avg PnL</p>
                    <p
                      className={`font-medium ${
                        emotion.avgPnl >= 0 ? "text-phosphor" : "text-blood"
                      }`}
                    >
                      {formatPnl(emotion.avgPnl)}
                    </p>
                  </div>
                  <div>
                    <p className="text-ash">Total PnL</p>
                    <p
                      className={`font-medium ${
                        emotion.totalPnl >= 0 ? "text-phosphor" : "text-blood"
                      }`}
                    >
                      {formatPnl(emotion.totalPnl)}
                    </p>
                  </div>
                  <div>
                    <p className="text-ash">W/L</p>
                    <p className="font-medium text-fog">
                      {emotion.winCount}/{emotion.lossCount}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onFilterByPattern(undefined, emotion.emotion)}
                  className="mt-2 w-full rounded-lg bg-smoke-light py-1 text-xs text-fog transition-colors hover:bg-smoke-lighter hover:text-mist"
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
        <div className="rounded-xl border border-smoke-light bg-smoke/60 p-4">
          <h3 className="mb-3 text-sm font-semibold text-mist">
            📚 Successful Pattern Library
          </h3>
          <p className="mb-4 text-xs text-ash">
            Browse trades with PnL &gt; 10% to build your pattern library
          </p>
          
          {entries.filter((e) => e.status === "closed" && e.outcome && e.outcome.pnlPercent > 10).length === 0 ? (
            <p className="text-xs text-ash">
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
                    className="rounded-lg border border-smoke-light bg-void-lighter p-3 text-left transition-colors hover:border-phosphor/50 hover:bg-phosphor/5"
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
                      <span className="text-sm font-semibold text-mist">
                        {entry.ticker}
                      </span>
                      <span className="rounded bg-phosphor/20 px-1.5 py-0.5 text-xs font-medium text-phosphor">
                        {entry.setup}
                      </span>
                    </div>
                    
                    <p className="mb-2 line-clamp-2 text-xs text-ash">
                      {entry.thesis || "No thesis"}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-ash">
                        {new Date(entry.timestamp).toLocaleDateString()}
                      </span>
                      <span className="font-bold text-phosphor">
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
    green: "border-phosphor/50 bg-phosphor/10 text-phosphor",
    red: "border-blood/50 bg-blood/10 text-blood",
    cyan: "border-spark/50 bg-spark/10 text-spark",
  };

  return (
    <div
      className={`rounded-xl border p-4 ${
        color
          ? colorClasses[color]
          : "border-smoke-light bg-smoke/60 text-mist"
      }`}
    >
      <div className="mb-1 text-2xl">{icon}</div>
      <p className="mb-1 text-xs text-ash">{label}</p>
      <p className="text-xl font-bold">{value}</p>
    </div>
  );
}
