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
import { useOnboardingStore, ONBOARDING_CHECKLIST } from '@/store/onboardingStore';

export function OnboardingChecklist() {
  const { progress, discoveredFeatures, resetOnboarding } = useOnboardingStore();
  const [isOpen, setIsOpen] = useState(true);
  const [isDismissed, setIsDismissed] = useState(false);

  // Don't show if dismissed or completed
  if (isDismissed || progress === 100) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 w-80 max-w-[calc(100vw-2rem)] bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-40 animate-slide-in-right">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-4 hover:bg-zinc-800/50 transition-colors rounded-t-xl"
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
                className="text-zinc-700"
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
                className="text-emerald-500 transition-all duration-500"
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
              {progress}%
            </span>
          </div>
          <div className="text-left">
            <div className="font-semibold text-sm">Onboarding Progress</div>
            <div className="text-xs text-zinc-400">
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
            className="p-1 hover:bg-zinc-700 rounded transition-colors text-zinc-400 hover:text-zinc-100"
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
            const completedCount = items.filter(item => 
              discoveredFeatures.includes(item.id)
            ).length;
            const isComplete = completedCount === items.length;

            return (
              <div key={category} className="mb-4">
                {/* Category header */}
                <div className="flex items-center gap-2 mb-2">
                  {isComplete ? (
                    <CheckCircle2 size={16} className="text-emerald-500" />
                  ) : (
                    <Circle size={16} className="text-zinc-600" />
                  )}
                  <h3 className="font-semibold text-sm">
                    {category}
                    <span className="ml-2 text-zinc-500">
                      ({completedCount}/{items.length})
                    </span>
                  </h3>
                </div>

                {/* Items */}
                <ul className="space-y-1.5 ml-6">
                  {items.map((item) => {
                    const isCompleted = discoveredFeatures.includes(item.id);
                    
                    return (
                      <li 
                        key={item.id}
                        className="flex items-center gap-2 text-sm"
                      >
                        {isCompleted ? (
                          <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                        ) : (
                          <Circle size={14} className="text-zinc-600 flex-shrink-0" />
                        )}
                        <span className={isCompleted ? 'text-zinc-400 line-through' : 'text-zinc-300'}>
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
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <button
              onClick={() => {
                if (confirm('This will reset all onboarding progress. Continue?')) {
                  resetOnboarding();
                  setIsDismissed(false);
                }
              }}
              className="w-full text-xs text-zinc-500 hover:text-zinc-300 transition-colors py-2"
            >
              Reset Progress
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
