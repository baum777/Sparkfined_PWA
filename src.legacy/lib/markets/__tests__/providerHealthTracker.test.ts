import { describe, it, expect, beforeEach } from 'vitest'
import { ProviderHealthTracker } from '../providerHealthTracker'

const tracker = new ProviderHealthTracker()

describe('ProviderHealthTracker', () => {
  beforeEach(() => {
    tracker.reset()
  })

  it('should record successes and compute average latency', () => {
    tracker.recordSuccess('moralis', 100)
    tracker.recordSuccess('moralis', 200)

    const health = tracker.getHealth('moralis')
    expect(health.successCount).toBe(2)
    expect(health.failureCount).toBe(0)
    expect(health.averageLatencyMs).toBeCloseTo(150)
    expect(health.healthScore).toBeGreaterThan(0)
    expect(health.lastSuccessAt).toBeDefined()
  })

  it('should record failures and adjust health score', () => {
    tracker.recordFailure('dexpaprika', new Error('failure'))
    tracker.recordFailure('dexpaprika', new Error('failure'))

    const health = tracker.getHealth('dexpaprika')
    expect(health.failureCount).toBe(2)
    expect(health.successCount).toBe(0)
    expect(health.healthScore).toBeLessThan(1)
    expect(health.lastFailureAt).toBeDefined()
  })

  it('should return health snapshots for all providers', () => {
    const all = tracker.getAllHealth()
    const providers = all.map((item) => item.provider)

    expect(providers).toEqual(expect.arrayContaining(['moralis', 'dexpaprika', 'dexscreener']))
  })
})
