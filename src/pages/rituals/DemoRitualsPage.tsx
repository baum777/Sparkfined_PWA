/**
 * DemoRitualsPage
 * Showcase page for all ritual components
 *
 * Demonstrates:
 * - MorningMindsetCard usage
 * - PreTradeChecklistModal flow
 * - PostTradeReviewDrawer flow
 * - Event telemetry integration
 */

import React, { useState } from 'react';
import { Play, FileText, Activity } from 'lucide-react';
import {
  MorningMindsetCard,
  PreTradeChecklistModal,
  PostTradeReviewDrawer,
} from '../../components/rituals';
import type {
  DailyRitual,
  PreTradeChecklist,
  TradeJournalEntry,
} from '../../components/rituals';
import {
  getRitualHistory,
  getRecentPreTradeChecklists,
  getJournalEntries,
  getRitualStats,
  clearAllRitualData,
} from '../../lib/storage/ritualStore';

export default function DemoRitualsPage() {
  const [isPreTradeOpen, setIsPreTradeOpen] = useState(false);
  const [isPostTradeOpen, setIsPostTradeOpen] = useState(false);
  const [recentRituals, setRecentRituals] = useState<DailyRitual[]>([]);
  const [recentChecklists, setRecentChecklists] = useState<PreTradeChecklist[]>([]);
  const [recentJournals, setRecentJournals] = useState<TradeJournalEntry[]>([]);
  const [stats, setStats] = useState(getRitualStats());

  const refreshData = () => {
    setRecentRituals(getRitualHistory(7));
    setRecentChecklists(getRecentPreTradeChecklists(5));
    setRecentJournals(getJournalEntries(5));
    setStats(getRitualStats());
  };

  React.useEffect(() => {
    refreshData();
  }, []);

  const handleRitualComplete = (ritual: DailyRitual) => {
    console.log('[Demo] Ritual completed:', ritual);
    refreshData();
  };

  const handlePreTradeSubmit = (checklist: PreTradeChecklist) => {
    console.log('[Demo] PreTrade submitted:', checklist);
    refreshData();
  };

  const handleJournalSave = (entry: TradeJournalEntry) => {
    console.log('[Demo] Journal saved:', entry);
    refreshData();
  };

  const handleClearData = () => {
    if (confirm('⚠️ Alle Ritual-Daten löschen? (Nur in DEV Mode)')) {
      clearAllRitualData();
      refreshData();
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Rituals Demo</h1>
              <p className="text-slate-400">
                Morning Mindset, Pre-Trade Checklist, und Post-Trade Review
              </p>
            </div>
            {import.meta.env.DEV && (
              <button
                onClick={handleClearData}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-medium rounded-lg transition-colors"
              >
                Clear Data (DEV)
              </button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-slate-400 text-xs uppercase tracking-wide">Streak</div>
              <div className="text-2xl font-bold text-emerald-400 mt-1">
                {stats.currentStreak}
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-slate-400 text-xs uppercase tracking-wide">Completed</div>
              <div className="text-2xl font-bold text-white mt-1">
                {stats.completedDays}/{stats.totalDays}
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-slate-400 text-xs uppercase tracking-wide">Longest Streak</div>
              <div className="text-2xl font-bold text-orange-400 mt-1">
                {stats.longestStreak}
              </div>
            </div>
            <div className="bg-slate-800/50 rounded-lg p-4">
              <div className="text-slate-400 text-xs uppercase tracking-wide">Success Rate</div>
              <div className="text-2xl font-bold text-blue-400 mt-1">
                {Math.round(stats.completionRate * 100)}%
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Morning Mindset Card */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Play className="w-5 h-5 text-emerald-400" />
                Morning Mindset
              </h2>
              <MorningMindsetCard onComplete={handleRitualComplete} />
            </section>

            {/* Action Buttons */}
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Trade Actions
              </h2>
              <div className="space-y-3">
                <button
                  onClick={() => setIsPreTradeOpen(true)}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-3"
                >
                  <FileText className="w-5 h-5" />
                  Pre-Trade Checklist öffnen
                </button>
                <button
                  onClick={() => setIsPostTradeOpen(true)}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg transition-colors flex items-center justify-center gap-3"
                >
                  <FileText className="w-5 h-5" />
                  Post-Trade Review öffnen
                </button>
              </div>
            </section>
          </div>

          {/* Right Column - Recent Activity */}
          <div className="space-y-8">
            {/* Recent Rituals */}
            <section>
              <h3 className="text-lg font-semibold mb-4 text-slate-300">
                Letzte Rituale ({recentRituals.length})
              </h3>
              <div className="space-y-2">
                {recentRituals.length === 0 ? (
                  <div className="bg-slate-800/30 rounded-lg p-6 text-center text-slate-500">
                    Keine Rituale vorhanden
                  </div>
                ) : (
                  recentRituals.map(ritual => (
                    <div
                      key={ritual.date}
                      className="bg-slate-800/50 border border-slate-700 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-xs text-slate-400">{ritual.date}</div>
                          <div className="text-sm text-white mt-1 line-clamp-2">
                            {ritual.goal}
                          </div>
                        </div>
                        {ritual.completed && (
                          <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded">
                            ✓
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Recent Checklists */}
            <section>
              <h3 className="text-lg font-semibold mb-4 text-slate-300">
                Pre-Trade Checklists ({recentChecklists.length})
              </h3>
              <div className="space-y-2">
                {recentChecklists.length === 0 ? (
                  <div className="bg-slate-800/30 rounded-lg p-6 text-center text-slate-500">
                    Keine Checklists vorhanden
                  </div>
                ) : (
                  recentChecklists.map(checklist => (
                    <div
                      key={checklist.id}
                      className="bg-slate-800/50 border border-slate-700 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {checklist.symbol}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            RR: {checklist.rr}x • Risk: ${checklist.riskAmount}
                          </div>
                        </div>
                        <div className="text-xs text-slate-500">
                          {new Date(checklist.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {/* Recent Journal Entries */}
            <section>
              <h3 className="text-lg font-semibold mb-4 text-slate-300">
                Journal Entries ({recentJournals.length})
              </h3>
              <div className="space-y-2">
                {recentJournals.length === 0 ? (
                  <div className="bg-slate-800/30 rounded-lg p-6 text-center text-slate-500">
                    Keine Journal Entries vorhanden
                  </div>
                ) : (
                  recentJournals.map(entry => (
                    <div
                      key={entry.id}
                      className="bg-slate-800/50 border border-slate-700 rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-sm font-semibold text-white">
                            {entry.symbol}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            {new Date(entry.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div
                          className={`text-sm font-semibold ${
                            entry.outcome.pnl > 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {entry.outcome.pnl > 0 ? '+' : ''}${entry.outcome.pnl.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>

        {/* Info Footer */}
        <div className="mt-12 bg-slate-800/30 border border-slate-700 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-white mb-3">ℹ️ Demo Info</h3>
          <div className="text-sm text-slate-400 space-y-2">
            <p>
              • <strong>MorningMindsetCard:</strong> Setze dein tägliches Ziel und tracke deine
              Stimmung
            </p>
            <p>
              • <strong>PreTradeChecklistModal:</strong> Validiere deine Trade-Thesis vor dem
              Entry
            </p>
            <p>
              • <strong>PostTradeReviewDrawer:</strong> Reflektiere nach dem Trade und lerne
            </p>
            <p className="pt-2 text-slate-500 text-xs">
              Alle Daten werden lokal in localStorage gespeichert (Privacy-first). Events werden
              an TelemetryService gesendet. Öffne DevTools Console für Event-Logs.
            </p>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PreTradeChecklistModal
        isOpen={isPreTradeOpen}
        onClose={() => setIsPreTradeOpen(false)}
        onSubmit={handlePreTradeSubmit}
        defaultSymbol="BTC/USDT"
      />

      <PostTradeReviewDrawer
        isOpen={isPostTradeOpen}
        onClose={() => setIsPostTradeOpen(false)}
        onSave={handleJournalSave}
        defaultSymbol="BTC/USDT"
      />
    </div>
  );
}
