import React from "react"
import { RefreshCw } from "@/lib/icons"
import { config } from "@/lib/config"

export type GrokPulseBias = "BULLISH" | "BEARISH" | "NEUTRAL" | "MIXED"

export interface GrokPulseDTO {
  summary: string
  bias: GrokPulseBias
  timestamp: string
  bullets: string[]
  source?: string
}

type GrokPulseStatus = "loading" | "error" | "success"

interface GrokPulseCardProps {
  symbol?: string | null
  timeframe?: string | null
}

const MOCK_SUMMARIES = [
  "Momentum cooled but higher timeframe structure remains intact.",
  "Volatility is compressing; watch for a breakout confirmation.",
  "Buy pressure is steady while funding stays balanced.",
  "Liquidity sweep risk elevated; keep risk tight around key levels.",
 ] as const

const MOCK_BULLETS = [
  "Order flow leans bid-side into the session open.",
  "CVD support holding above the prior pivot.",
  "Open interest flat; leverage not overly crowded.",
  "Short-term momentum slowing into a range boundary.",
  "Spot volume positive on pullbacks.",
  "Funding normalized after the last impulse.",
 ] as const

const MOCK_BIASES = ["BULLISH", "BEARISH", "NEUTRAL", "MIXED"] as const

const createSeed = (value: string): number => {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i)
    hash |= 0
  }
  return Math.abs(hash)
}

const pickFrom = <T,>(list: readonly [T, ...T[]], seed: number, offset: number): T => {
  const index = (seed + offset) % list.length
  return list[index] ?? list[0]
}

const buildMockPulse = (seedKey: string): GrokPulseDTO => {
  const seed = createSeed(seedKey)
  return {
    summary: pickFrom(MOCK_SUMMARIES, seed, 1),
    bias: pickFrom(MOCK_BIASES, seed, 2),
    timestamp: new Date().toISOString(),
    bullets: [
      pickFrom(MOCK_BULLETS, seed, 3),
      pickFrom(MOCK_BULLETS, seed, 5),
      pickFrom(MOCK_BULLETS, seed, 7),
    ],
    source: "Sparkfined Mock Pulse",
  }
}

const normalizeBias = (value: unknown): GrokPulseBias | null => {
  if (value === "BULLISH" || value === "BEARISH" || value === "NEUTRAL" || value === "MIXED") return value
  return null
}

const sanitizeBullets = (value: unknown): string[] => {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
}

const formatTimestamp = (value?: string | null): string => {
  if (!value) return "—"
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return value
  const formatted = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
  }).format(parsed)
  return `${formatted} UTC`
}

const buildContextKey = (symbol?: string | null, timeframe?: string | null): string => {
  const normalizedSymbol = symbol?.trim().toUpperCase()
  const normalizedTimeframe = timeframe?.trim()
  if (normalizedSymbol && normalizedTimeframe) return `${normalizedSymbol}:${normalizedTimeframe}`
  if (normalizedSymbol) return normalizedSymbol
  if (normalizedTimeframe) return normalizedTimeframe
  return "chart"
}

const fetchGrokPulse = async (seedKey: string): Promise<{ payload: GrokPulseDTO; fromMock: boolean }> => {
  const fallback = buildMockPulse(seedKey)
  const baseUrl = config?.apiBaseUrl?.trim()
  const endpoint = baseUrl ? `${baseUrl.replace(/\/$/, "")}/grok-pulse/summary` : null

  if (endpoint && typeof fetch === "function") {
    try {
      const response = await fetch(endpoint, {
        headers: {
          Accept: "application/json",
        },
      })

      if (response.ok) {
        const payload = (await response.json()) as Partial<GrokPulseDTO>
        const summary = typeof payload.summary === "string" && payload.summary.trim().length > 0 ? payload.summary : null
        const bias = normalizeBias(payload.bias)
        const timestamp = typeof payload.timestamp === "string" && payload.timestamp.trim().length > 0 ? payload.timestamp : null
        const bullets = sanitizeBullets(payload.bullets)
        const source =
          typeof payload.source === "string" && payload.source.trim().length > 0 ? payload.source : fallback.source

        if (summary && bias && timestamp && bullets.length > 0) {
          return {
            payload: {
              summary,
              bias,
              timestamp,
              bullets,
              source,
            },
            fromMock: false,
          }
        }
      }
    } catch (error) {
      console.warn("fetchGrokPulse: falling back to mock payload", error)
    }
  }

  return { payload: fallback, fromMock: true }
}

export default function GrokPulseCard({ symbol, timeframe }: GrokPulseCardProps) {
  const [pulse, setPulse] = React.useState<GrokPulseDTO | null>(null)
  const [status, setStatus] = React.useState<GrokPulseStatus>("loading")
  const [errorMessage, setErrorMessage] = React.useState<string | null>(null)
  const [isMock, setIsMock] = React.useState(false)
  const isMountedRef = React.useRef(true)

  const contextKey = React.useMemo(() => buildContextKey(symbol, timeframe), [symbol, timeframe])

  const handleRefresh = React.useCallback(async () => {
    setStatus("loading")
    setErrorMessage(null)

    try {
      const result = await fetchGrokPulse(contextKey)
      if (!isMountedRef.current) return
      setPulse(result.payload)
      setIsMock(result.fromMock)
      setStatus(result.fromMock ? "error" : "success")
      if (result.fromMock) {
        setErrorMessage("Live pulse is unavailable; showing mock insights instead.")
      }
    } catch {
      if (!isMountedRef.current) return
      setStatus("error")
      setErrorMessage("Unable to load Grok Pulse right now.")
    }
  }, [contextKey])

  React.useEffect(() => {
    isMountedRef.current = true
    void handleRefresh()

    return () => {
      isMountedRef.current = false
    }
  }, [handleRefresh])

  const isLoading = status === "loading"
  const biasLabel = pulse?.bias ? pulse.bias.toLowerCase() : "neutral"
  const timestampLabel = formatTimestamp(pulse?.timestamp)
  const sourceLabel = pulse?.source ?? "Sparkfined Pulse"

  return (
    <section className="sf-grok-pulse" aria-label="Grok Pulse">
      <header className="sf-grok-pulse__header">
        <div className="sf-grok-pulse__titles">
          <span className="sf-chart-panel-heading">Grok Pulse</span>
          <span className="sf-chart-panel-subtext">AI read on sentiment and momentum shifts.</span>
        </div>
        <button
          type="button"
          className="sf-chart-text-button sf-focus-ring"
          onClick={handleRefresh}
          aria-label="Refresh Grok Pulse"
        >
          <RefreshCw size={16} aria-hidden />
          Refresh
        </button>
      </header>

      <div className="sf-grok-pulse__body" aria-live="polite">
        {isLoading ? (
          <div className="sf-grok-pulse__loading" role="status" aria-label="Loading Grok Pulse">
            <div className="sf-grok-pulse__skeleton-line" aria-hidden />
            <div className="sf-grok-pulse__skeleton-line sf-grok-pulse__skeleton-line--short" aria-hidden />
            <div className="sf-grok-pulse__skeleton-line" aria-hidden />
          </div>
        ) : null}

        {!isLoading && status === "error" ? (
          <div className="sf-grok-pulse__alert" role="status">
            <span>{errorMessage ?? "Pulse feed unavailable."}</span>
            <button type="button" className="sf-chart-text-button" onClick={handleRefresh}>
              Retry
            </button>
          </div>
        ) : null}

        {!isLoading && pulse ? (
          <div className="sf-grok-pulse__content">
            <div className="sf-grok-pulse__meta">
              <span className="sf-grok-pulse__bias" data-bias={biasLabel}>
                {pulse.bias}
              </span>
              <div className="sf-grok-pulse__meta-details">
                <span className="sf-grok-pulse__timestamp">Updated {timestampLabel}</span>
                <span className="sf-grok-pulse__source" aria-label={`Source ${sourceLabel}`}>
                  {isMock ? `${sourceLabel} · Mock` : sourceLabel}
                </span>
              </div>
            </div>
            <p className="sf-grok-pulse__summary">{pulse.summary}</p>
            <ul className="sf-grok-pulse__list" aria-label="Pulse takeaways">
              {pulse.bullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </section>
  )
}
