import type { JournalRawInput } from '../types/input'
import type { JournalOutput } from '../types/output'

import { normalizeEmotion, normalizeLinear } from './normalization'
import { computeScore } from './scoring'
import { detectBias } from './bias'
import { inferArchetype } from './archetype'
import { generateInsights } from './insights'

export function runJournalPipeline(input: JournalRawInput): JournalOutput {
  const normalized = {
    emotion: normalizeEmotion(input.emotionalState),
    conviction: normalizeLinear(input.conviction),
    clarity: normalizeLinear(7), // TODO: NLP clarity extraction
    discipline: normalizeLinear(6), // TODO: reflection analysis
    patternStrength: normalizeLinear(input.patternQuality),
  }

  const derived = {
    emotionalVolatility: Math.abs(normalized.emotion - normalized.conviction),
    riskAlignment: normalized.conviction * normalized.clarity,
    cognitiveBiasFlags: detectBias(input, normalized),
    decisionQuality: (normalized.clarity + normalized.discipline) / 2,
  }

  const archetype = inferArchetype(normalized, derived, derived.cognitiveBiasFlags)

  const insights = generateInsights(archetype, derived.cognitiveBiasFlags, derived)

  const score = computeScore({
    ...normalized,
    emotionalVolatility: derived.emotionalVolatility,
  })

  return {
    archetype,
    metrics: derived,
    normalized,
    insights,
    recommendations: insights,
    score,
  }
}
