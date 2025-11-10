/**
 * MorningMindsetCard
 * Daily ritual component for goal setting and mood tracking
 *
 * Features:
 * - Set daily goal with privacy-preserving hash
 * - Track mood state
 * - Maintain streak counter
 * - Mark ritual as complete
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, Target, Flame } from 'lucide-react';
import type { DailyRitual, MoodState } from './types';
import { getTodaysRitual, saveDailyRitual, markRitualComplete } from '../../lib/storage/localRitualStore';
import { emitRitualEvent, RitualEvents } from '../../lib/telemetry/emitEvent';

const MOOD_OPTIONS: { value: MoodState; label: string; emoji: string }[] = [
  { value: 'calm', label: 'Ruhig', emoji: '😌' },
  { value: 'neutral', label: 'Neutral', emoji: '😐' },
  { value: 'anxious', label: 'Angespannt', emoji: '😰' },
  { value: 'stressed', label: 'Gestresst', emoji: '😫' },
];

interface MorningMindsetCardProps {
  onComplete?: (ritual: DailyRitual) => void;
}

export function MorningMindsetCard({ onComplete }: MorningMindsetCardProps) {
  const [ritual, setRitual] = useState<DailyRitual | null>(null);
  const [goal, setGoal] = useState('');
  const [mood, setMood] = useState<MoodState>('neutral');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadTodaysRitual();
  }, []);

  const loadTodaysRitual = () => {
    const today = getTodaysRitual();
    if (today) {
      setRitual(today);
      setGoal(today.goal);
      setMood(today.mood);
      setIsEditing(false);
    } else {
      setIsEditing(true);
      emitRitualEvent(RitualEvents.MORNING_OPEN, {
        date: new Date().toISOString().split('T')[0],
      });
    }
  };

  const handleSaveGoal = async () => {
    if (goal.trim().length === 0) return;

    setIsSaving(true);
    try {
      const savedRitual = await saveDailyRitual(goal, mood, false);
      setRitual(savedRitual);
      setIsEditing(false);

      emitRitualEvent(RitualEvents.GOAL_SET, {
        date: savedRitual.date,
        goalHash: savedRitual.goalHash,
        mood: savedRitual.mood,
        streak: savedRitual.streak,
      });
    } catch (error) {
      console.error('[MorningMindsetCard] Save failed:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMarkComplete = () => {
    if (!ritual) return;

    const completed = markRitualComplete(ritual.date);
    if (completed) {
      setRitual(completed);

      emitRitualEvent(RitualEvents.RITUAL_COMPLETE, {
        date: completed.date,
        streak: completed.streak,
      });

      onComplete?.(completed);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-lg p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Target className="w-6 h-6 text-emerald-400" />
          <h2 className="text-xl font-semibold text-white">Morning Mindset</h2>
        </div>
        {ritual && ritual.streak > 0 && (
          <div className="flex items-center gap-2 bg-orange-500/10 px-3 py-1.5 rounded-full">
            <Flame className="w-4 h-4 text-orange-400" />
            <span className="text-orange-400 font-semibold text-sm">{ritual.streak} Tag{ritual.streak > 1 ? 'e' : ''}</span>
          </div>
        )}
      </div>

      {/* Content */}
      {isEditing ? (
        <div className="space-y-4">
          {/* Goal Input */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Dein Ziel für heute
            </label>
            <textarea
              value={goal}
              onChange={e => setGoal(e.target.value)}
              placeholder="Ich handle nach Plan. Keine FOMO-Trades."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
              rows={3}
            />
          </div>

          {/* Mood Select */}
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Wie fühlst du dich?
            </label>
            <div className="grid grid-cols-2 gap-2">
              {MOOD_OPTIONS.map(option => (
                <button
                  key={option.value}
                  onClick={() => setMood(option.value)}
                  className={`px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    mood === option.value
                      ? 'bg-emerald-500 text-white'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  <span className="mr-2">{option.emoji}</span>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <button
            onClick={handleSaveGoal}
            disabled={isSaving || goal.trim().length === 0}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {isSaving ? 'Speichern...' : 'Ziel setzen'}
          </button>
        </div>
      ) : ritual ? (
        <div className="space-y-4">
          {/* Display Goal */}
          <div>
            <div className="text-sm text-slate-400 mb-1">Dein Ziel</div>
            <div className="bg-slate-800/50 rounded-lg px-4 py-3 text-white">
              {ritual.goal}
            </div>
          </div>

          {/* Display Mood */}
          <div>
            <div className="text-sm text-slate-400 mb-1">Stimmung</div>
            <div className="inline-flex items-center gap-2 bg-slate-800/50 rounded-full px-4 py-2">
              <span>{MOOD_OPTIONS.find(m => m.value === ritual.mood)?.emoji}</span>
              <span className="text-white text-sm">
                {MOOD_OPTIONS.find(m => m.value === ritual.mood)?.label}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {!ritual.completed ? (
              <>
                <button
                  onClick={handleMarkComplete}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  Abgeschlossen
                </button>
                <button
                  onClick={handleEdit}
                  className="px-6 bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  Bearbeiten
                </button>
              </>
            ) : (
              <div className="flex-1 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-semibold py-3 rounded-lg flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Ritual abgeschlossen
              </div>
            )}
          </div>
        </div>
      ) : null}

      {/* Info Footer */}
      <div className="mt-4 pt-4 border-t border-slate-800">
        <p className="text-xs text-slate-500 text-center">
          Starte jeden Tag mit einem klaren Ziel. Deine Daten bleiben privat.
        </p>
      </div>
    </div>
  );
}
