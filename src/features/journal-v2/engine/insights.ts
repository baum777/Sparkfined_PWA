import type { CognitiveBias } from '../types/derived'
import type { JournalArchetype } from '../types/archetypes'
import type { JournalDerived } from '../types/derived'

export function generateInsights(
  archetype: JournalArchetype,
  biasFlags: CognitiveBias[],
  derived: JournalDerived
): string[] {
  const insights: string[] = []

  insights.push(`Primary archetype: ${archetype}`)

  if (derived.emotionalVolatility > 0.4) {
    insights.push('Emotional volatility is elevated; rebalance conviction with clarity before acting.')
  }

  if (derived.riskAlignment < 0.4) {
    insights.push('Conviction and clarity are misaligned. Revisit your thesis and risk limits.')
  }

  if (biasFlags.length) {
    insights.push(`Detected biases: ${biasFlags.join(', ')}`)
  }

  if (derived.decisionQuality > 0.6) {
    insights.push('Decision quality is trending positive. Maintain disciplined execution.')
  } else {
    insights.push('Decision quality is unstable. Slow down and validate setups with checklists.')
  }

  return insights
}
