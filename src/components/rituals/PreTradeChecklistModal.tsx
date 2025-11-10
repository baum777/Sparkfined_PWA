/**
 * PreTradeChecklistModal
 * Pre-trade validation checklist with thesis, RR, and risk management
 *
 * Features:
 * - Trade thesis validation (min 10 chars)
 * - Risk/Reward ratio input
 * - Risk amount validation
 * - Privacy-preserving storage (hashes only to telemetry)
 */

import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';
import type { PreTradeChecklist } from './types';
import { savePreTradeChecklist } from '../../lib/storage/ritualStore';
import { emitRitualEvent, RitualEvents } from '../../lib/telemetry/emitEvent';

interface PreTradeChecklistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit?: (checklist: PreTradeChecklist) => void;
  defaultSymbol?: string;
}

export function PreTradeChecklistModal({
  isOpen,
  onClose,
  onSubmit,
  defaultSymbol = '',
}: PreTradeChecklistModalProps) {
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [thesis, setThesis] = useState('');
  const [rr, setRr] = useState('');
  const [riskAmount, setRiskAmount] = useState('');
  const [positionSize, setPositionSize] = useState('');
  const [stopLossPct, setStopLossPct] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  React.useEffect(() => {
    if (isOpen) {
      emitRitualEvent(RitualEvents.PRETRADE_OPEN, {
        symbol: symbol || undefined,
      });
    }
  }, [isOpen, symbol]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!symbol.trim()) {
      newErrors.symbol = 'Symbol erforderlich';
    }

    if (thesis.trim().length < 10) {
      newErrors.thesis = 'Thesis zu kurz (min. 10 Zeichen)';
    }

    const rrNum = parseFloat(rr);
    if (isNaN(rrNum) || rrNum <= 0) {
      newErrors.rr = 'RR muss > 0 sein';
    }

    const riskNum = parseFloat(riskAmount);
    if (isNaN(riskNum) || riskNum <= 0) {
      newErrors.riskAmount = 'Risk Amount muss > 0 sein';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const checklist = await savePreTradeChecklist(
        symbol.trim(),
        thesis.trim(),
        parseFloat(rr),
        parseFloat(riskAmount),
        positionSize ? parseFloat(positionSize) : undefined,
        stopLossPct ? parseFloat(stopLossPct) : undefined
      );

      emitRitualEvent(RitualEvents.PRETRADE_SUBMIT, {
        symbol: checklist.symbol,
        rr: checklist.rr,
        riskAmount: checklist.riskAmount,
        thesisHash: checklist.thesisHash,
        thesisLength: checklist.thesis.length,
      });

      onSubmit?.(checklist);
      handleClose();
    } catch (error) {
      console.error('[PreTradeChecklistModal] Submit failed:', error);
      setErrors({ submit: 'Fehler beim Speichern' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSymbol(defaultSymbol);
    setThesis('');
    setRr('');
    setRiskAmount('');
    setPositionSize('');
    setStopLossPct('');
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  const isValid = symbol.trim() && thesis.trim().length >= 10 && parseFloat(rr) > 0 && parseFloat(riskAmount) > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <TrendingUp className="w-5 h-5 text-emerald-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Pre-Trade Checklist</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Symbol */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Symbol *
            </label>
            <input
              type="text"
              value={symbol}
              onChange={e => setSymbol(e.target.value.toUpperCase())}
              placeholder="BTC/USDT"
              className={`w-full bg-slate-800 border ${errors.symbol ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
            />
            {errors.symbol && (
              <p className="text-red-400 text-xs mt-1">{errors.symbol}</p>
            )}
          </div>

          {/* Thesis */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Trade Thesis * (min. 10 Zeichen)
            </label>
            <textarea
              value={thesis}
              onChange={e => setThesis(e.target.value)}
              placeholder="Warum dieser Trade? Setup, Indikatoren, Kontext..."
              className={`w-full bg-slate-800 border ${errors.thesis ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none`}
              rows={4}
            />
            <div className="flex justify-between items-center mt-1">
              {errors.thesis ? (
                <p className="text-red-400 text-xs">{errors.thesis}</p>
              ) : (
                <p className="text-slate-500 text-xs">{thesis.length} / 10</p>
              )}
            </div>
          </div>

          {/* RR Ratio */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Risk/Reward Ratio *
            </label>
            <input
              type="number"
              step="0.1"
              value={rr}
              onChange={e => setRr(e.target.value)}
              placeholder="2.5"
              className={`w-full bg-slate-800 border ${errors.rr ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
            />
            {errors.rr && (
              <p className="text-red-400 text-xs mt-1">{errors.rr}</p>
            )}
          </div>

          {/* Risk Amount */}
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
              className={`w-full bg-slate-800 border ${errors.riskAmount ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent`}
            />
            {errors.riskAmount && (
              <p className="text-red-400 text-xs mt-1">{errors.riskAmount}</p>
            )}
          </div>

          {/* Optional: Position Size */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Position Size (optional)
            </label>
            <input
              type="number"
              step="0.0001"
              value={positionSize}
              onChange={e => setPositionSize(e.target.value)}
              placeholder="0.01"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Optional: Stop Loss % */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Stop Loss % (optional)
            </label>
            <input
              type="number"
              step="0.1"
              value={stopLossPct}
              onChange={e => setStopLossPct(e.target.value)}
              placeholder="2.5"
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
          </div>

          {/* Validation Warning */}
          {!isValid && (
            <div className="flex items-start gap-3 bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
              <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-orange-300">
                <strong>Plan oder Panic?</strong>
                <p className="text-orange-400/80 mt-1">
                  Fülle alle Pflichtfelder aus, bevor du den Trade eingehst.
                </p>
              </div>
            </div>
          )}

          {errors.submit && (
            <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-red-300">{errors.submit}</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-800 flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            Abbrechen
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || isSubmitting}
            className="flex-1 bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              'Speichern...'
            ) : (
              <>
                <CheckCircle className="w-4 h-4" />
                Bestätigen
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
