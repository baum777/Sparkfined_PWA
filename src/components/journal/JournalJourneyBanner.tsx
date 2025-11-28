import type { UserJourneySnapshot } from '@/lib/journal/journey-snapshot'

interface JournalJourneyBannerProps {
  snapshot: UserJourneySnapshot
}

const FORMATTER = new Intl.NumberFormat('en-US')

export function JournalJourneyBanner({ snapshot }: JournalJourneyBannerProps) {
  return (
    <section
      className="rounded-2xl border border-border/60 bg-surface/70 px-4 py-3 text-sm text-text-primary shadow-sm"
      data-testid="journal-journey-banner"
    >
      <p className="text-xs uppercase tracking-[0.3em] text-text-tertiary">Journey progress</p>
      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm md:text-base">
        <span className="font-medium text-text-secondary">Phase</span>
        <span className="font-semibold text-text-primary">{snapshot.phase}</span>
        <span className="text-text-tertiary">•</span>
        <span className="font-medium text-text-secondary">XP</span>
        <span className="font-semibold text-text-primary">{FORMATTER.format(snapshot.xpTotal)}</span>
        <span className="text-text-tertiary">•</span>
        <span className="font-medium text-text-secondary">Streak</span>
        <span className="font-semibold text-text-primary">{snapshot.streak}</span>
      </div>
      <p className="mt-2 text-xs text-text-tertiary">
        XP grows with disciplined trade logs and thorough reflections.
      </p>
    </section>
  )
}
