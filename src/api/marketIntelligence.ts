import { config } from "@/lib/config";

export type DailyBias = "BULLISH" | "BEARISH" | "NEUTRAL";

export interface DailyBiasDTO {
  bias: DailyBias;
  insights: string[];
  asOf: string;
  source?: string;
}

const MOCK_DAILY_BIAS: DailyBiasDTO = {
  bias: "BULLISH",
  insights: [
    "Order flow skewed to buy-side on higher timeframes; monitoring pullback bids.",
    "Momentum breadth improving; funding stabilizing across majors.",
    "Cumulative volume delta holding above VWAP; dips attracting responsive buyers.",
  ],
  asOf: "2024-05-01T09:00:00Z",
  source: "Sparkfined Mock Intel",
};

const isValidBias = (value: unknown): value is DailyBias =>
  value === "BULLISH" || value === "BEARISH" || value === "NEUTRAL";

const sanitizeInsights = (insights: unknown): string[] => {
  if (!Array.isArray(insights)) return [];
  return insights.filter((item): item is string => typeof item === "string" && item.trim().length > 0);
};

export async function getDailyBias(): Promise<DailyBiasDTO> {
  const baseUrl = config?.apiBaseUrl?.trim();
  const endpoint = baseUrl ? `${baseUrl.replace(/\/$/, "")}/market-intelligence/daily-bias` : null;

  if (endpoint && typeof fetch === "function") {
    try {
      const response = await fetch(endpoint, {
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const payload = (await response.json()) as Partial<DailyBiasDTO>;
        const bias = isValidBias(payload.bias) ? payload.bias : null;
        const asOf = typeof payload.asOf === "string" && payload.asOf.trim().length > 0 ? payload.asOf : null;
        const insights = sanitizeInsights(payload.insights);
        const source = typeof payload.source === "string" && payload.source.trim().length > 0 ? payload.source : undefined;

        if (bias && asOf) {
          return {
            bias,
            insights,
            asOf,
            source,
          };
        }
      }
    } catch (error) {
      console.warn("getDailyBias: falling back to mock payload", error);
    }
  }

  return {
    ...MOCK_DAILY_BIAS,
    asOf: new Date().toISOString(),
  };
}
