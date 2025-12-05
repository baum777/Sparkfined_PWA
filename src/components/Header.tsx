import { useState } from 'react'
import FeedbackModal from './FeedbackModal'
import MetricsPanel from './MetricsPanel'
import { Button } from '@/design-system'
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
      <header className="sticky top-0 z-40 border-b border-border-moderate bg-surface/95 backdrop-blur supports-[backdrop-filter]:bg-surface/75">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-glow-accent">
              <span className="text-base font-semibold">S</span>
            </div>
            <h1 className="text-lg font-semibold text-text-primary">{title}</h1>
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
