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
import { useFocusTrap } from '@/hooks/useFocusTrap';

type UserLevel = 'beginner' | 'intermediate' | 'advanced' | null;

interface WelcomeModalProps {
  onClose: () => void;
  onPersonaSelected: (level: UserLevel) => void;
}

export function WelcomeModal({ onClose, onPersonaSelected }: WelcomeModalProps) {
  const [selectedLevel, setSelectedLevel] = useState<UserLevel>(null);
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
      onPersonaSelected(selectedLevel);
    }
  };

  const handleSkip = () => {
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
        className="relative w-full max-w-2xl mx-4 bg-smoke border border-smoke-light rounded-2xl shadow-2xl animate-slide-up focus:outline-none"
        data-testid="modal-content"
      >
        {/* Close Button */}
        <button
          ref={closeButtonRef}
          onClick={handleSkip}
          className="absolute top-4 right-4 text-fog hover:text-mist transition-colors p-2 rounded-lg hover:bg-smoke-light focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark"
          aria-label="Close"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center pt-8 pb-6 px-6">
          <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-spark/20 to-spark/20 rounded-2xl">
            <Zap className="text-spark" size={32} />
          </div>
          <h2 id={headingId} className="text-3xl font-bold mb-2">
            Welcome to Sparkfined
          </h2>
          <p className="text-fog text-lg">
            Your AI-Powered Trading Command Center
          </p>
        </div>

        {/* Content */}
        <div className="px-6 pb-6">
          <p className="text-center text-fog mb-6">
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
                    hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark
                    ${isSelected 
                      ? 'border-spark bg-spark/10 shadow-lg shadow-spark/20' 
                      : 'border-smoke-lighter bg-smoke-light/50 hover:border-ash'
                    }
                  `}
                  aria-pressed={isSelected}
                >
                  {/* Selection indicator */}
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-spark rounded-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}

                  <Icon 
                    size={32} 
                    className={`mb-3 ${isSelected ? 'text-spark' : 'text-fog'}`}
                  />
                  <h3 className="font-semibold text-lg mb-1">{persona.title}</h3>
                  <p className="text-sm text-fog">{persona.description}</p>
                </button>
              );
            })}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleSkip}
              className="flex-1 px-6 py-3 rounded-lg border border-smoke-lighter bg-smoke-light text-mist font-medium transition-all hover:bg-smoke-lighter hover:border-ash focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ash"
            >
              Skip for now
            </button>
            <button
              onClick={handleContinue}
              disabled={!selectedLevel}
              className={`
                flex-1 px-6 py-3 rounded-lg font-semibold transition-all
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark
                ${selectedLevel
                  ? 'bg-spark text-white hover:bg-spark hover:scale-105'
                  : 'bg-smoke-lighter text-ash cursor-not-allowed'
                }
              `}
            >
              Start Quick Tour →
            </button>
          </div>

          {/* Footer hint */}
          <p className="text-center text-xs text-ash mt-4">
            You can change this later in Settings or press <kbd className="px-1.5 py-0.5 bg-smoke-light rounded text-fog">ESC</kbd> to skip
          </p>
        </div>
      </div>
    </div>
  );
}
