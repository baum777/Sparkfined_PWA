/**
 * Board Page — Command Center
 * 
 * Central hub with:
 * - Overview (KPI Tiles)
 * - Focus ("Now Stream" - Recent Activities)
 * - Quick Actions (Navigation shortcuts)
 * - Feed (Activity events)
 * - Onboarding System (Welcome Modal, Tour, Checklist)
 * 
 * Responsive Grid:
 * - Mobile (< 768px): 1 column (stacked)
 * - Tablet (768-1024px): 2 columns (Focus/Actions)
 * - Desktop (> 1024px): 3 columns (Focus/Actions/Feed)
 */

import { useEffect, useState } from 'react';
import Overview from '@/components/board/Overview';
import Focus from '@/components/board/Focus';
import QuickActions from '@/components/board/QuickActions';
import Feed from '@/components/board/Feed';
import { 
  WelcomeModal, 
  OnboardingChecklist, 
  KeyboardShortcuts,
  HintBanner 
} from '@/components/onboarding';
import { useOnboardingStore, UserLevel } from '@/store/onboardingStore';
import { createProductTour } from '@/lib/productTour';

export default function BoardPage() {
  const { firstVisit, tourCompleted, completeTour, isHintDismissed } = useOnboardingStore();
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Check for first visit
  useEffect(() => {
    if (firstVisit && !showWelcomeModal) {
      // Small delay for page load animation
      const timer = setTimeout(() => {
        setShowWelcomeModal(true);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [firstVisit, showWelcomeModal]);

  // Keyboard shortcut listener (? key)
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      // Check if Shift + / (?) is pressed
      if (e.key === '?' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Start product tour after persona selection
  const handlePersonaSelected = (level: UserLevel) => {
    setShowWelcomeModal(false);
    
    if (level) {
      // Start tour after modal close animation
      setTimeout(() => {
        const tour = createProductTour(level, () => {
          completeTour();
        });
        tour.drive();
      }, 300);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 px-3 py-4 md:px-6 lg:px-8 animate-fade-in">
      {/* Container with max-width */}
      <div className="mx-auto max-w-7xl">
        
        {/* Progressive Hint Banner (Board Page) */}
        {!isHintDismissed('hint:board-kpi-tiles') && tourCompleted && (
          <HintBanner
            hintId="hint:board-kpi-tiles"
            title="💡 Quick Tip"
            message="Click any KPI tile to see detailed breakdowns and insights. Try clicking 'Risk Score' or 'Sentiment'!"
          />
        )}
        
        {/* Overview Zone (Full-width, all breakpoints) */}
        <section 
          id="overview-section" 
          aria-label="Overview KPIs" 
          className="animate-slide-up"
        >
          <Overview />
        </section>
        
        {/* Main Grid (Mobile: 1col, Tablet: 2col, Desktop: 3col) */}
        <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 md:gap-6 lg:grid-cols-[5fr_3fr_4fr] lg:gap-8 stagger">
          
          {/* Focus Zone (Left, "Now Stream") */}
          <section aria-label="Now Stream" className="lg:col-span-1">
            <Focus />
          </section>
          
          {/* Quick Actions (Mobile: Horizontal scroll, Desktop: Sidebar) */}
          <section 
            id="quick-actions"
            aria-label="Quick Actions" 
            className="lg:col-span-1"
          >
            <QuickActions />
          </section>
          
          {/* Feed Zone (Right/Bottom) */}
          <section aria-label="Activity Feed" className="lg:col-span-1">
            <Feed />
          </section>
          
        </div>
      </div>

      {/* Onboarding Components */}
      {showWelcomeModal && (
        <WelcomeModal
          onClose={() => setShowWelcomeModal(false)}
          onPersonaSelected={handlePersonaSelected}
        />
      )}

      <OnboardingChecklist />

      <KeyboardShortcuts
        isOpen={showKeyboardShortcuts}
        onClose={() => setShowKeyboardShortcuts(false)}
      />
    </div>
  );
}
