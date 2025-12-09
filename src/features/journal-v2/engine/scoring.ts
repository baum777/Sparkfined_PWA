import type { JournalNormalized } from '../types/normalized'

interface ScoreParams extends JournalNormalized {
  emotionalVolatility: number
}

export function computeScore(params: ScoreParams): number {
  const weights = {
    emotion: 0.2,
    conviction: 0.2,
    clarity: 0.2,
    discipline: 0.2,
    patternStrength: 0.2,
  }

  const baseScore =
    params.emotion * weights.emotion +
    params.conviction * weights.conviction +
    params.clarity * weights.clarity +
    params.discipline * weights.discipline +
    params.patternStrength * weights.patternStrength

  const volatilityPenalty = Math.max(0, 1 - params.emotionalVolatility)

  return Math.round(Math.min(100, baseScore * volatilityPenalty * 100))
}
