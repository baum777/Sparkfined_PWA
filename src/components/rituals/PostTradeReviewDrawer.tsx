/**
 * PostTradeReviewDrawer
 * Post-trade journal entry form with emotional tracking
 *
 * Features:
 * - Complete trade journal entry
 * - Emotional state tracking (before/during/after)
 * - PnL recording
 * - Notes and reflection
 * - Privacy-preserving storage
 */

import React, { useState } from 'react';
import { X, BookOpen, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import type { MoodState, TradeJournalEntry, EmotionalState } from './types';
import { saveJournalEntry } from '../../lib/storage/ritualStore';
import { emitRitualEvent, RitualEvents } from '../../lib/telemetry/emitEvent';
import { categorizePnL } from './types';

const MOOD_OPTIONS: { value: MoodState; label: string; emoji: string }[] = [
  { value: 'calm', label: 'Ruhig', emoji: '😌' },
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
  { value: 'anxious', label: 'Angespannt', emoji: '😰' },
  { value: 'stressed', label: 'Gestresst', emoji: '😫' },
];

interface PostTradeReviewDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: (entry: TradeJournalEntry) => void;
  defaultSymbol?: string;
}

export function PostTradeReviewDrawer({
  isOpen,
  onClose,
  onSave,
  defaultSymbol = '',
}: PostTradeReviewDrawerProps) {
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [tradePlan, setTradePlan] = useState('');
  const [entryTime, setEntryTime] = useState('');
  const [exitTime, setExitTime] = useState('');
  const [positionSize, setPositionSize] = useState('');
  const [riskAmount, setRiskAmount] = useState('');
  const [stopLossPct, setStopLossPct] = useState('');
  const [pnl, setPnl] = useState('');
  const [notes, setNotes] = useState('');
  const [influencers, setInfluencers] = useState('');

  const [emotionBefore, setEmotionBefore] = useState<MoodState>('neutral');
  const [emotionDuring, setEmotionDuring] = useState<MoodState>('neutral');
  const [emotionAfter, setEmotionAfter] = useState<MoodState>('neutral');

  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (isOpen) {
      // Pre-fill current timestamp for exit
      setExitTime(new Date().toISOString().slice(0, 16));

      emitRitualEvent(RitualEvents.POSTTRADE_OPEN, {
        symbol: symbol || undefined,
      });
    }
  }, [isOpen, symbol]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!symbol.trim()) newErrors.symbol = 'Symbol erforderlich';
    if (!tradePlan.trim()) newErrors.tradePlan = 'Trade Plan erforderlich';
    if (!entryTime) newErrors.entryTime = 'Entry Time erforderlich';
    if (!exitTime) newErrors.exitTime = 'Exit Time erforderlich';
    if (!positionSize || parseFloat(positionSize) <= 0) newErrors.positionSize = 'Position Size ungültig';
    if (!riskAmount || parseFloat(riskAmount) <= 0) newErrors.riskAmount = 'Risk Amount ungültig';
    if (!stopLossPct || parseFloat(stopLossPct) <= 0) newErrors.stopLossPct = 'Stop Loss % ungültig';
    if (pnl === '') newErrors.pnl = 'PnL erforderlich';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    setIsSaving(true);
    try {
      const emotionalState: EmotionalState = {
        before: emotionBefore,
        during: emotionDuring,
        after: emotionAfter,
      };

      const entry = await saveJournalEntry({
        symbol: symbol.trim(),
        tradePlan: tradePlan.trim(),
        entryTime,
        exitTime,
        positionSize: parseFloat(positionSize),
        riskAmount: parseFloat(riskAmount),
        stopLossPct: parseFloat(stopLossPct),
        emotionalState,
        influencers: influencers
          .split(',')
          .map(i => i.trim())
          .filter(Boolean),
        outcome: {
          pnl: parseFloat(pnl),
          notes: notes.trim(),
        },
        replaySnapshotId: null,
        userId: undefined,
      });

      const pnlBucket = categorizePnL(entry.outcome.pnl, entry.riskAmount);

      emitRitualEvent(RitualEvents.JOURNAL_CREATE, {
        journalId: entry.id,
        symbol: entry.symbol,
        pnlBucket,
        emotions: `${emotionBefore},${emotionDuring},${emotionAfter}`,
      });

      onSave?.(entry);
      handleClose();
    } catch (error) {
      console.error('[PostTradeReviewDrawer] Save failed:', error);
      setErrors({ submit: 'Fehler beim Speichern' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setSymbol(defaultSymbol);
    setTradePlan('');
    setEntryTime('');
    setExitTime('');
    setPositionSize('');
    setRiskAmount('');
    setStopLossPct('');
    setPnl('');
    setNotes('');
    setInfluencers('');
    setEmotionBefore('neutral');
    setEmotionDuring('neutral');
    setEmotionAfter('neutral');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const pnlNum = parseFloat(pnl);
  const isPnlPositive = !isNaN(pnlNum) && pnlNum > 0;
  const isPnlNegative = !isNaN(pnlNum) && pnlNum < 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-t-2xl sm:rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-900 border-b border-slate-800 p-6 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <BookOpen className="w-5 h-5 text-blue-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Trade Review</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Trade Basics */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
              Trade Details
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Symbol *
                </label>
                <input
                  type="text"
                  value={symbol}
                  onChange={e => setSymbol(e.target.value.toUpperCase())}
                  placeholder="BTC/USDT"
                  className={`w-full bg-slate-800 border ${errors.symbol ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Position Size *
                </label>
                <input
                  type="number"
                  step="0.0001"
                  value={positionSize}
                  onChange={e => setPositionSize(e.target.value)}
                  placeholder="0.01"
                  className={`w-full bg-slate-800 border ${errors.positionSize ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Entry Time *
                </label>
                <input
                  type="datetime-local"
                  value={entryTime}
                  onChange={e => setEntryTime(e.target.value)}
                  className={`w-full bg-slate-800 border ${errors.entryTime ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Exit Time *
                </label>
                <input
                  type="datetime-local"
                  value={exitTime}
                  onChange={e => setExitTime(e.target.value)}
                  className={`w-full bg-slate-800 border ${errors.exitTime ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Risk Amount (USD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={riskAmount}
                  onChange={e => setRiskAmount(e.target.value)}
                  placeholder="100"
                  className={`w-full bg-slate-800 border ${errors.riskAmount ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Stop Loss % *
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={stopLossPct}
                  onChange={e => setStopLossPct(e.target.value)}
                  placeholder="2.5"
                  className={`w-full bg-slate-800 border ${errors.stopLossPct ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                />
              </div>
            </div>
          </div>

          {/* Trade Plan */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Trade Plan *
            </label>
            <textarea
              value={tradePlan}
              onChange={e => setTradePlan(e.target.value)}
              placeholder="Was war der Plan? Setup, Entry, Exit, Risk Management..."
              className={`w-full bg-slate-800 border ${errors.tradePlan ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
              rows={3}
            />
          </div>

          {/* PnL */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Profit/Loss (USD) *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={pnl}
                onChange={e => setPnl(e.target.value)}
                placeholder="150.50 oder -75.25"
                className={`w-full bg-slate-800 border ${errors.pnl ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-2.5 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {isPnlPositive && <TrendingUp className="w-5 h-5 text-emerald-400" />}
                {isPnlNegative && <TrendingDown className="w-5 h-5 text-red-400" />}
                {!isPnlPositive && !isPnlNegative && <Minus className="w-5 h-5 text-slate-500" />}
              </div>
            </div>
          </div>

          {/* Emotional States */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wide">
              Emotionale Reise
            </h3>

            {/* Before */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Vor dem Trade
              </label>
              <div className="grid grid-cols-2 gap-2">
                {MOOD_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setEmotionBefore(option.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      emotionBefore === option.value
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span className="mr-2">{option.emoji}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* During */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Während des Trades
              </label>
              <div className="grid grid-cols-2 gap-2">
                {MOOD_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setEmotionDuring(option.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      emotionDuring === option.value
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span className="mr-2">{option.emoji}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* After */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nach dem Trade
              </label>
              <div className="grid grid-cols-2 gap-2">
                {MOOD_OPTIONS.map(option => (
                  <button
                    key={option.value}
                    onClick={() => setEmotionAfter(option.value)}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      emotionAfter === option.value
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span className="mr-2">{option.emoji}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Influencers */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Einflussfaktoren (kommagetrennt)
            </label>
            <input
              type="text"
              value={influencers}
              onChange={e => setInfluencers(e.target.value)}
              placeholder="News, Twitter, FOMO, Rache-Trade"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Reflexion & Notizen
            </label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="Was habe ich gelernt? Was würde ich anders machen?"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
            />
          </div>

          {errors.submit && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4 text-sm text-red-300">
              {errors.submit}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-900 border-t border-slate-800 p-6 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {isSaving ? 'Speichern...' : 'Journal speichern'}
          </button>
        </div>
      </div>
    </div>
  );
}
