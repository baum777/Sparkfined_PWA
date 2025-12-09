import type { JournalArchetype } from './archetypes'
import type { JournalDerived } from './derived'
import type { JournalNormalized } from './normalized'

export interface JournalOutput {
  archetype: JournalArchetype
  metrics: JournalDerived
  normalized: JournalNormalized
  insights: string[]
  recommendations: string[]
  emotionalTrend?: 'rising' | 'falling' | 'stable'
  score: number
}
