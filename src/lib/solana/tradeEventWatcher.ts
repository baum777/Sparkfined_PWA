import { fetchWalletSwaps, type NormalizedTradeEvent } from './providers/moralisTradeEvents'
import { getConnectedWallets, type ConnectedWalletRecord } from './store/connectedWallets'
import { saveTradeEvents, type NewTradeEvent } from './store/tradeEvents'
import { MoralisClientError } from './providers/moralisClient'

const DEFAULT_INTERVAL_MS = 25_000
const DEFAULT_MAX_BACKOFF_MS = 5 * 60 * 1_000

interface TradeEventWatcherOptions {
  intervalMs?: number
  maxBackoffMs?: number
}

interface TradeEventWatcherDeps {
  getWallets?: typeof getConnectedWallets
  fetchWalletSwaps?: typeof fetchWalletSwaps
  saveEvents?: typeof saveTradeEvents
  hasApiKey?: () => boolean
  schedule?: typeof setTimeout
  cancelSchedule?: typeof clearTimeout
}

function hasMoralisApiKey(): boolean {
  const apiKey = import.meta.env?.VITE_MORALIS_API_KEY ?? process.env.VITE_MORALIS_API_KEY
  return Boolean(apiKey)
}

function isRateLimitError(error: unknown): boolean {
  return error instanceof MoralisClientError && error.status === 429
}

function mapToNewTradeEvent(
  wallet: ConnectedWalletRecord,
  event: NormalizedTradeEvent,
): NewTradeEvent {
  return {
    ...event,
    walletId: wallet.id ?? null,
    walletAddress: wallet.address,
    consumed: false,
  }
}

export class TradeEventWatcher {
  private intervalMs: number
  private maxBackoffMs: number
  private currentDelay: number
  private timer: ReturnType<typeof setTimeout> | null = null
  private running = false
  private readonly getWallets: typeof getConnectedWallets
  private readonly fetchSwaps: typeof fetchWalletSwaps
  private readonly saveEvents: typeof saveTradeEvents
  private readonly hasApiKey: () => boolean
  private readonly schedule: typeof setTimeout
  private readonly cancelSchedule: typeof clearTimeout

  constructor(options: TradeEventWatcherOptions = {}, deps: TradeEventWatcherDeps = {}) {
    this.intervalMs = options.intervalMs ?? DEFAULT_INTERVAL_MS
    this.maxBackoffMs = options.maxBackoffMs ?? DEFAULT_MAX_BACKOFF_MS
    this.currentDelay = this.intervalMs

    this.getWallets = deps.getWallets ?? getConnectedWallets
    this.fetchSwaps = deps.fetchWalletSwaps ?? fetchWalletSwaps
    this.saveEvents = deps.saveEvents ?? saveTradeEvents
    this.hasApiKey = deps.hasApiKey ?? hasMoralisApiKey
    this.schedule = deps.schedule ?? setTimeout
    this.cancelSchedule = deps.cancelSchedule ?? clearTimeout
  }

  async start(): Promise<void> {
    if (this.running) return
    if (!this.hasApiKey()) return

    const wallets = await this.getWallets()
    if (!wallets.length) return

    this.running = true
    this.queueNextRun(0)
  }

  stop(): void {
    this.running = false
    if (this.timer) {
      this.cancelSchedule(this.timer)
      this.timer = null
    }
    this.currentDelay = this.intervalMs
  }

  private queueNextRun(delay: number): void {
    if (!this.running) return
    if (this.timer) {
      this.cancelSchedule(this.timer)
    }

    this.timer = this.schedule(() => this.runCycle(), delay)
  }

  private resetDelay(): void {
    this.currentDelay = this.intervalMs
  }

  private increaseBackoff(): void {
    this.currentDelay = Math.min(this.currentDelay * 2, this.maxBackoffMs)
  }

  private async runCycle(): Promise<void> {
    if (!this.running) return

    try {
      if (!this.hasApiKey()) {
        this.stop()
        return
      }

      const wallets = await this.getWallets()
      if (!wallets.length) {
        this.stop()
        return
      }

      await this.pollWallets(wallets)
      this.resetDelay()
    } catch (error) {
      if (isRateLimitError(error) || error instanceof TypeError) {
        this.increaseBackoff()
      } else {
        this.resetDelay()
      }
    } finally {
      this.queueNextRun(this.currentDelay)
    }
  }

  private async pollWallets(wallets: ConnectedWalletRecord[]): Promise<void> {
    for (const wallet of wallets) {
      const swaps = await this.fetchSwaps(wallet.address, { limit: 50, order: 'DESC' })
      const buys = swaps.filter((event) => event.side === 'BUY')

      if (!buys.length) continue

      const normalized = buys.map((event) => mapToNewTradeEvent(wallet, event))
      await this.saveEvents(normalized)
    }
  }
}

export function createTradeEventWatcher(
  options?: TradeEventWatcherOptions,
  deps?: TradeEventWatcherDeps,
): TradeEventWatcher {
  return new TradeEventWatcher(options, deps)
}
