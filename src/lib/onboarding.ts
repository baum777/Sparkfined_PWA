/**
 * Onboarding State Management
 * 
 * Handles user onboarding flow state and progress tracking.
 */

export interface OnboardingState {
  // Tour & Welcome
  completed: boolean
  tourShown: boolean
  currentStep: number
  
  // Feature Discovery
  demoCompleted: boolean
  featuresDiscovered: string[]
  pagesVisited: string[]
  
  // Access System
  accessExplainerSeen: boolean
  accessPageVisited: boolean
  
  // PWA & Push
  pwaInstallPrompted: boolean
  pwaInstalled: boolean
  pushPermissionAsked: boolean
  pushPermissionGranted: boolean
  
  // Timestamps
  firstVisitTimestamp: number
  firstAnalyzeTimestamp?: number
  lastActiveTimestamp: number
  
  // Analytics
  tourCompletionRate?: number
  skipCount: number
  analyzeCount: number
}

const DEFAULT_STATE: OnboardingState = {
  completed: false,
  tourShown: false,
  currentStep: 0,
  demoCompleted: false,
  featuresDiscovered: [],
  pagesVisited: [],
  accessExplainerSeen: false,
  accessPageVisited: false,
  pwaInstallPrompted: false,
  pwaInstalled: false,
  pushPermissionAsked: false,
  pushPermissionGranted: false,
  firstVisitTimestamp: Date.now(),
  lastActiveTimestamp: Date.now(),
  skipCount: 0,
  analyzeCount: 0,
}

const STORAGE_KEY = 'sparkfined_onboarding_state'

/**
 * Get current onboarding state
 */
export const getOnboardingState = (): OnboardingState => {
  if (typeof window === 'undefined') return DEFAULT_STATE
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      return { ...DEFAULT_STATE, ...parsed }
    }
  } catch (error) {
    console.warn('[Onboarding] Failed to parse state:', error)
  }
  
  return DEFAULT_STATE
}

/**
 * Update onboarding state
 */
export const updateOnboardingState = (updates: Partial<OnboardingState>) => {
  if (typeof window === 'undefined') return
  
  try {
    const current = getOnboardingState()
    const updated = {
      ...current,
      ...updates,
      lastActiveTimestamp: Date.now(),
    }
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    
    // Dispatch custom event for reactive updates
    window.dispatchEvent(new CustomEvent('onboarding-state-changed', { detail: updated }))
  } catch (error) {
    console.error('[Onboarding] Failed to update state:', error)
  }
}

/**
 * Reset onboarding state (for testing)
 */
export const resetOnboardingState = () => {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new CustomEvent('onboarding-state-changed', { detail: DEFAULT_STATE }))
}

/**
 * Mark feature as discovered
 */
export const markFeatureDiscovered = (feature: string) => {
  const state = getOnboardingState()
  if (!state.featuresDiscovered.includes(feature)) {
    updateOnboardingState({
      featuresDiscovered: [...state.featuresDiscovered, feature],
    })
  }
}

/**
 * Check if user should see onboarding
 */
export const shouldShowOnboarding = (): boolean => {
  const state = getOnboardingState()
  return !state.tourShown && !state.completed
}

/**
 * Check if PWA install prompt should be shown
 */
export const shouldShowPWAPrompt = (): boolean => {
  const state = getOnboardingState()
  
  // Don't show if already prompted or installed
  if (state.pwaInstallPrompted || state.pwaInstalled) {
    return false
  }
  
  // Don't show if user just arrived (less than 3 minutes)
  const timeSinceFirstAction = state.firstAnalyzeTimestamp
    ? Date.now() - state.firstAnalyzeTimestamp
    : 0
  
  return timeSinceFirstAction > 3 * 60 * 1000 // 3 minutes
}

/**
 * Check if push permission prompt should be shown
 */
export const shouldShowPushPrompt = (): boolean => {
  const state = getOnboardingState()
  
  // Don't show if already asked
  if (state.pushPermissionAsked) {
    return false
  }
  
  // Only show on Notifications page
  return false // Let page component decide
}

/**
 * Calculate onboarding completion percentage
 */
export const getOnboardingProgress = (): number => {
  const state = getOnboardingState()
  
  const steps = [
    state.tourShown,
    state.demoCompleted,
    state.featuresDiscovered.length >= 3,
    state.accessPageVisited,
    state.pwaInstalled,
  ]
  
  const completed = steps.filter(Boolean).length
  return Math.round((completed / steps.length) * 100)
}

/**
 * Track onboarding analytics event
 */
export const trackOnboardingEvent = (event: string, data?: Record<string, any>) => {
  // Integration with your analytics system (Plausible, Umami, etc.)
  if (typeof window !== 'undefined' && (window as any).plausible) {
    (window as any).plausible(event, { props: data })
  }
  
  console.log('[Onboarding Event]', event, data)
}
