import type { ProviderId } from '@/types/market'

export interface ProviderHealthSnapshot {
  provider: ProviderId
  successCount: number
  failureCount: number
  lastSuccessAt?: number
  lastFailureAt?: number
  averageLatencyMs?: number
  healthScore: number
}

export class ProviderHealthTracker {
  private snapshots = new Map<ProviderId, ProviderHealthSnapshot>()
  private readonly defaultProviders: ProviderId[]

  constructor(providers: ProviderId[] = ['moralis', 'dexpaprika', 'dexscreener']) {
    this.defaultProviders = providers
    providers.forEach((provider) => {
      this.snapshots.set(provider, {
        provider,
        successCount: 0,
        failureCount: 0,
        healthScore: 1,
      })
    })
  }

  recordSuccess(provider: ProviderId, latencyMs: number): void {
    const snapshot = this.ensureSnapshot(provider)
    snapshot.successCount += 1
    snapshot.lastSuccessAt = Date.now()

    snapshot.averageLatencyMs = this.updateAverageLatency(snapshot, latencyMs)

    snapshot.healthScore = this.calculateHealthScore(snapshot)
    this.snapshots.set(provider, snapshot)
  }

  recordFailure(provider: ProviderId, _error: unknown, latencyMs?: number): void {
    const snapshot = this.ensureSnapshot(provider)
    snapshot.failureCount += 1
    snapshot.lastFailureAt = Date.now()

    if (latencyMs !== undefined) {
      snapshot.averageLatencyMs = this.updateAverageLatency(snapshot, latencyMs)
    }

    snapshot.healthScore = this.calculateHealthScore(snapshot)
    this.snapshots.set(provider, snapshot)
  }

  getHealth(provider: ProviderId): ProviderHealthSnapshot {
    return { ...this.ensureSnapshot(provider) }
  }

  getAllHealth(): ProviderHealthSnapshot[] {
    const allProviders = new Set<ProviderId>([
      ...this.defaultProviders,
      ...this.snapshots.keys(),
    ])

    return Array.from(allProviders).map((provider) => this.getHealth(provider))
  }

  reset(): void {
    this.snapshots.clear()
    this.defaultProviders.forEach((provider) => {
      this.snapshots.set(provider, {
        provider,
        successCount: 0,
        failureCount: 0,
        healthScore: 1,
      })
    })
  }

  private ensureSnapshot(provider: ProviderId): ProviderHealthSnapshot {
    if (!this.snapshots.has(provider)) {
      this.snapshots.set(provider, {
        provider,
        successCount: 0,
        failureCount: 0,
        healthScore: 1,
      })
    }

    return this.snapshots.get(provider) as ProviderHealthSnapshot
  }

  private calculateHealthScore(snapshot: ProviderHealthSnapshot): number {
    const totalAttempts = snapshot.successCount + snapshot.failureCount
    const successRate = totalAttempts > 0 ? snapshot.successCount / totalAttempts : 1

    const latencyPenalty = (() => {
      if (snapshot.averageLatencyMs === undefined) return 0
      const normalizedLatency = Math.min(snapshot.averageLatencyMs / 2000, 1)
      return normalizedLatency * 0.3
    })()

    const rawScore = successRate * (1 - latencyPenalty)
    return Number(rawScore.toFixed(3))
  }

  private updateAverageLatency(snapshot: ProviderHealthSnapshot, latencyMs: number): number {
    const totalEvents = snapshot.successCount + snapshot.failureCount
    if (snapshot.averageLatencyMs === undefined || totalEvents <= 1) {
      return latencyMs
    }

    return (snapshot.averageLatencyMs * (totalEvents - 1) + latencyMs) / totalEvents
  }
}
