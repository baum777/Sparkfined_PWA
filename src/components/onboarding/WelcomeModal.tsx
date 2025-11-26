/**
 * WelcomeModal - Initial welcome screen for first-time visitors
 * 
 * Shows on first visit with:
 * - Welcome message
 * - Persona selection (beginner, intermediate, advanced)
 * - Option to skip
 */

import { useRef, useId, useState } from 'react';
import type { MouseEvent } from 'react';
import { Zap, GraduationCap, TrendingUp, Rocket, X } from '@/lib/icons';
import { useOnboardingStore, UserLevel } from '@/store/onboardingStore';
import { useFocusTrap } from '@/hooks/useFocusTrap';

interface WelcomeModalProps {
  onClose: () => void;
  onPersonaSelected: (level: UserLevel) => void;
}

export function WelcomeModal({ onClose, onPersonaSelected }: WelcomeModalProps) {
  const [selectedLevel, setSelectedLevel] = useState<UserLevel>(null);
  const { setUserLevel, markVisited } = useOnboardingStore();
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const headingId = useId();
  const modalRef = useFocusTrap<HTMLDivElement>({
    isActive: true,
    initialFocusRef: closeButtonRef,
    onEscape: onClose,
  });

  const handleOverlayMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      handleSkip();
    }
  };

  const handleContinue = () => {
    if (selectedLevel) {
      setUserLevel(selectedLevel);
      markVisited();
      onPersonaSelected(selectedLevel);
    }
  };

  const handleSkip = () => {
    markVisited();
    onClose();
  };

  const personas = [
    {
      level: 'beginner' as UserLevel,
      icon: GraduationCap,
      title: 'New to Crypto',
      description: 'I\'m learning the basics and want guidance',
      color: 'cyan',
    },
    {
      level: 'intermediate' as UserLevel,
      icon: TrendingUp,
      title: 'Active Trader',
      description: 'I trade regularly and know the fundamentals',
      color: 'emerald',
    },
    {
      level: 'advanced' as UserLevel,
      icon: Rocket,
      title: 'Professional',
      description: 'I\'m experienced and want advanced features',
      color: 'purple',
    },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in"
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      onMouseDown={handleOverlayMouseDown}
      data-testid="modal-overlay"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-2xl mx-4 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl animate-slide-up focus:outline-none"
        data-testid="modal-content"
      >
        {/* Close Button */}
        <button
          ref={closeButtonRef}
          onClick={handleSkip}
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100 transition-colors p-2 rounded-lg hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center pt-8 pb-6 px-6">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 rounded-2xl">
            <Zap className="text-emerald-500" size={32} />
          </div>
          <h2 id={headingId} className="text-3xl font-bold mb-2">
            Welcome to Sparkfined
          </h2>
          <p className="text-zinc-400 text-lg">
            Your AI-Powered Trading Command Center
          </p>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <p className="text-center text-zinc-300 mb-6">
            Let's personalize your experience. Choose your trading level:
          </p>

          <div className="grid gap-4 md:grid-cols-3 mb-6">
            {personas.map((persona) => {
              const Icon = persona.icon;
              const isSelected = selectedLevel === persona.level;
              
              return (
                <button
                  key={persona.level}
                  onClick={() => setSelectedLevel(persona.level)}
                  className={`
                    relative p-5 rounded-xl border-2 transition-all text-left
                    hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500
                    ${isSelected 
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-lg shadow-emerald-500/20' 
                      : 'border-zinc-700 bg-zinc-800/50 hover:border-zinc-600'
                    }
                  `}
                  aria-pressed={isSelected}
                >
                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}

                  <Icon 
                    size={32} 
                    className={`mb-3 ${isSelected ? 'text-emerald-400' : 'text-zinc-400'}`}
                  />
                  <h3 className="font-semibold text-lg mb-1">{persona.title}</h3>
                  <p className="text-sm text-zinc-400">{persona.description}</p>
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 px-6 py-3 rounded-lg border border-zinc-700 bg-zinc-800 text-zinc-100 font-medium transition-all hover:bg-zinc-700 hover:border-zinc-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-500"
            >
              Skip for now
            </button>
            <button
              onClick={handleContinue}
              disabled={!selectedLevel}
              className={`
                flex-1 px-6 py-3 rounded-lg font-semibold transition-all
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500
                ${selectedLevel
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600 hover:scale-105'
                  : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                }
              `}
            >
              Start Quick Tour →
            </button>
          </div>

          {/* Footer hint */}
          <p className="text-center text-xs text-zinc-600 mt-4">
            You can change this later in Settings or press <kbd className="px-1.5 py-0.5 bg-zinc-800 rounded text-zinc-400">ESC</kbd> to skip
          </p>
        </div>
      </div>
    </div>
  );
}
