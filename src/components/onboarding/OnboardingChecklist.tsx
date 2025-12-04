/**
 * OnboardingChecklist - Gamified progress tracker
 * 
 * Shows user's onboarding progress with:
 * - Grouped checklist items
 * - Progress percentage
 * - Collapsible panel
 * - Auto-hide at 100% completion
 */

import { useState } from 'react';
import { CheckCircle2, Circle, ChevronUp, ChevronDown, X } from '@/lib/icons';
import { useOnboardingStore } from '@/store/onboardingStore';

const ONBOARDING_CHECKLIST = {
  'Quick Wins': [
    { id: 'journal', label: 'Create your first journal entry' },
    { id: 'watchlist', label: 'Add symbols to your watchlist' },
    { id: 'alerts', label: 'Arm an automated alert' },
  ],
} as const;

const TOTAL_ITEMS = Object.values(ONBOARDING_CHECKLIST).reduce((count, items) => count + items.length, 0);

export function OnboardingChecklist() {
  const completedSteps = useOnboardingStore((state) => state.completedSteps);
  const resetOnboarding = useOnboardingStore((state) => state.resetOnboarding);
  const [isOpen, setIsOpen] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);
  const progress = TOTAL_ITEMS ? Math.round((completedSteps.size / TOTAL_ITEMS) * 100) : 0;

  // Don't show if dismissed or completed
  if (isDismissed || progress === 100) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 max-w-[calc(100vw-2rem)] bg-smoke border border-smoke-light rounded-xl shadow-2xl z-40 animate-slide-in-right">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-smoke-light/50 transition-colors rounded-t-xl"
        aria-expanded={isOpen}
        aria-controls="checklist-content"
      >
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10">
            {/* Circular progress */}
            <svg className="w-10 h-10 transform -rotate-90">
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                className="text-smoke-lighter"
              />
              <circle
                cx="20"
                cy="20"
                r="16"
                stroke="currentColor"
                strokeWidth="3"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 16}`}
                strokeDashoffset={`${2 * Math.PI * 16 * (1 - progress / 100)}`}
                className="text-spark transition-all duration-500"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
              {progress}%
            </span>
          </div>
          <div className="text-left">
            <div className="font-semibold text-sm">Onboarding Progress</div>
            <div className="text-xs text-fog">
              {progress < 50 && "Just getting started"}
              {progress >= 50 && progress < 80 && "You're making progress!"}
              {progress >= 80 && progress < 100 && "Almost there!"}
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsDismissed(true);
            }}
            className="p-1 hover:bg-smoke-lighter rounded transition-colors text-fog hover:text-mist"
            aria-label="Dismiss checklist"
          >
            <X size={16} />
          </button>
          {isOpen ? <ChevronDown size={20} /> : <ChevronUp size={20} />}
        </div>
      </button>

      {/* Content */}
      {isOpen && (
        <div id="checklist-content" className="px-4 pb-4 max-h-96 overflow-y-auto">
          {Object.entries(ONBOARDING_CHECKLIST).map(([category, items]) => {
            const completedCount = items.filter((item) => completedSteps.has(item.id)).length;
            const isComplete = completedCount === items.length;

            return (
              <div key={category} className="mb-4">
                {/* Category header */}
                <div className="flex items-center gap-2 mb-2">
                  {isComplete ? (
                    <CheckCircle2 size={16} className="text-spark" />
                  ) : (
                    <Circle size={16} className="text-ash" />
                  )}
                  <h3 className="font-semibold text-sm">
                    {category}
                    <span className="ml-2 text-ash">
                      ({completedCount}/{items.length})
                    </span>
                  </h3>
                </div>

                {/* Items */}
                <ul className="space-y-1.5 ml-6">
                  {items.map((item) => {
                    const isCompleted = completedSteps.has(item.id);
                    
                    return (
                      <li 
                        key={item.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={14} className="text-spark flex-shrink-0" />
                        ) : (
                          <Circle size={14} className="text-ash flex-shrink-0" />
                        )}
                        <span className={isCompleted ? 'text-fog line-through' : 'text-fog'}>
                          {item.label}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}

          {/* Footer actions */}
          <div className="mt-4 pt-4 border-t border-smoke-light">
            <button
              onClick={() => {
                if (confirm('This will reset all onboarding progress. Continue?')) {
                  resetOnboarding();
                  setIsDismissed(false);
                }
              }}
              className="w-full text-xs text-ash hover:text-fog transition-colors py-2"
            >
              Reset Progress
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
