import type { UserJourneySnapshot } from '@/lib/journal/journey-snapshot'

interface JournalJourneyBannerProps {
  snapshot: UserJourneySnapshot
}

const FORMATTER = new Intl.NumberFormat('en-US')

export function JournalJourneyBanner({ snapshot }: JournalJourneyBannerProps) {
  return (
    <section data-testid="journal-journey-banner">
      <div className="rounded-2xl border border-border-subtle bg-surface-secondary/60 px-4 py-3 text-sm text-text-primary shadow-sm md:px-5 md:py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-8">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.25em] text-text-tertiary">Hero's journey</p>
            <p className="text-xs text-text-secondary md:text-sm">
              XP grows with disciplined trade logs and honest reflections.
            </p>
          </div>
          <div className="flex flex-col gap-3 text-sm text-text-primary md:flex-row md:items-center md:gap-8">
            <div className="flex flex-col">
              <span className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">Phase</span>
              <span className="mt-0.5 text-base font-semibold text-text-primary">{snapshot.phase}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">XP</span>
              <span className="mt-0.5 text-base font-semibold text-text-primary">{FORMATTER.format(snapshot.xpTotal)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[11px] font-medium uppercase tracking-wide text-text-tertiary">Streak</span>
              <span className="mt-0.5 text-base font-semibold text-text-primary">{snapshot.streak}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
