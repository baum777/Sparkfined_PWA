import { useState } from 'react'
import FeedbackModal from './FeedbackModal'
import MetricsPanel from './MetricsPanel'
import Button from '@/components/ui/Button'
import { BarChart3, MessageCircle, Moon, Sun } from '@/lib/icons'
import { useTheme } from '@/lib/theme/useTheme'

interface HeaderProps {
  title?: string
}

export default function Header({ title = 'Sparkfined' }: HeaderProps) {
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false)
  const [isMetricsOpen, setIsMetricsOpen] = useState(false)
  const { resolvedTheme, setTheme } = useTheme()

  const handleToggleTheme = () => {
    setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')
  }

  return (
    <>
      <header className="sticky top-0 z-panel border-b border-border/80 bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 md:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-border/70 bg-gradient-to-br from-brand to-brand-hover text-bg shadow-glow-brand">
              <span className="text-base font-semibold tracking-tight">S</span>
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-text-tertiary">Sparkfined</p>
              <h1 className="text-lg font-semibold leading-tight text-text-primary">{title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFeedbackOpen(true)}
              aria-label="Share feedback"
              title="Share feedback"
            >
              <MessageCircle className="h-4 w-4" aria-hidden />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMetricsOpen(true)}
              aria-label="View metrics"
              title="Metrics & export"
            >
              <BarChart3 className="h-4 w-4" aria-hidden />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleTheme}
              aria-label={`Switch to ${resolvedTheme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {resolvedTheme === 'dark' ? (
                <Sun className="h-4 w-4" aria-hidden />
              ) : (
                <Moon className="h-4 w-4" aria-hidden />
              )}
            </Button>
          </div>
        </div>
      </header>

      <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
      <MetricsPanel isOpen={isMetricsOpen} onClose={() => setIsMetricsOpen(false)} />
    </>
  )
}
