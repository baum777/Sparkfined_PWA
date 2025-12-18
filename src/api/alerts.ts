import { config } from "@/lib/config";

export interface AlertsOverviewDTO {
  armed: number;
  triggered: number;
  paused: number;
}

const MOCK_ALERTS_OVERVIEW: AlertsOverviewDTO = {
  armed: 2,
  triggered: 1,
  paused: 0,
};

const normalizeCount = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number.parseInt(value, 10);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
};

const extractOverview = (payload: unknown): AlertsOverviewDTO | null => {
  if (!payload || typeof payload !== "object") return null;
  const record = payload as Record<string, unknown>;
  const source =
    record.overview && typeof record.overview === "object"
      ? (record.overview as Record<string, unknown>)
      : record;

  const armed = normalizeCount(source.armed);
  const triggered = normalizeCount(source.triggered);
  const paused = normalizeCount(source.paused);

  if (armed === null || triggered === null || paused === null) return null;

  return { armed, triggered, paused };
};

export async function getAlertsOverview(): Promise<AlertsOverviewDTO> {
  const baseUrl = config?.apiBaseUrl?.trim();
  const endpoint = baseUrl ? `${baseUrl.replace(/\/$/, "")}/alerts/overview` : null;

  if (endpoint && typeof fetch === "function") {
    try {
      const response = await fetch(endpoint, {
        headers: { Accept: "application/json" },
      });

      if (response.ok) {
        const payload = await response.json();
        const overview = extractOverview(payload);
        if (overview) return overview;
      }
    } catch (error) {
      console.warn("getAlertsOverview: falling back to mock overview", error);
    }
  }

  return { ...MOCK_ALERTS_OVERVIEW };
}
