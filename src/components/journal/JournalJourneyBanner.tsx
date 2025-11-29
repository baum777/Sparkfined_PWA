import type { UserJourneySnapshot } from '@/lib/journal/journey-snapshot'

interface JournalJourneyBannerProps {
  snapshot: UserJourneySnapshot
}

const FORMATTER = new Intl.NumberFormat('en-US')

export function JournalJourneyBanner({ snapshot }: JournalJourneyBannerProps) {
  return (
    <section data-testid="journal-journey-banner">
      <div className="rounded-2xl border border-border-subtle bg-surface-secondary/60 px-4 py-3 text-sm text-text-primary shadow-sm md:px-5 md:py-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-text-tertiary">Journey progress</p>
            <p className="text-xs text-text-secondary md:text-sm">
              XP grows with disciplined trade logs and thorough reflections.
            </p>
          </div>
          <div className="flex flex-col gap-2 text-sm text-text-primary md:flex-row md:items-center md:gap-6">
            <div className="flex flex-col">
              <span className="text-[11px] text-text-tertiary">Phase</span>
              <span className="text-base font-semibold text-text-primary">{snapshot.phase}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-text-tertiary">XP</span>
              <span className="text-base font-semibold text-text-primary">{FORMATTER.format(snapshot.xpTotal)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] text-text-tertiary">Streak</span>
              <span className="text-base font-semibold text-text-primary">{snapshot.streak}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
