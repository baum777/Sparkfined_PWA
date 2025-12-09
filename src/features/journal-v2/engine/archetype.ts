import type { CognitiveBias } from '../types/derived'
import type { JournalArchetype } from '../types/archetypes'
import type { JournalNormalized } from '../types/normalized'

export function inferArchetype(
  normalized: JournalNormalized,
  derived: { riskAlignment: number; emotionalVolatility: number },
  biasFlags: CognitiveBias[]
): JournalArchetype {
  if (biasFlags.includes('overconfidence') || normalized.emotion > 0.8) {
    return 'The Gambler'
  }

  if (derived.emotionalVolatility > 0.4 && biasFlags.includes('confirmation')) {
    return 'The Overthinker'
  }

  if (normalized.clarity > 0.7 && normalized.discipline > 0.7) {
    return 'The Disciplined'
  }

  if (normalized.patternStrength > 0.7 && derived.riskAlignment > 0.6) {
    return 'The Analyzer'
  }

  if (normalized.emotion < 0.4 && normalized.conviction > 0.6) {
    return 'The Contrarian'
  }

  return 'The Adaptive'
}
