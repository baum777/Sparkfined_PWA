import React from 'react'

interface OnboardingOverlayProps {
  children: React.ReactNode
  labelledBy?: string
}

export default function OnboardingOverlay({ children, labelledBy }: OnboardingOverlayProps) {
  return (
    <div
      className="fixed inset-0 z-[60] bg-background/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      data-testid="onboarding-overlay"
    >
      <div className="flex h-full items-center justify-center px-4">
        <div className="glass-heavy elevation-high w-full max-w-lg rounded-3xl shadow-card-strong">
          {children}
        </div>
      </div>
    </div>
  )
}
