import { describe, expect, it } from "vitest"
import { buildChartExportFilename, buildChartExportPayload } from "@/features/chart/chartExport"

const baseInput = {
  symbol: "SOLUSDT",
  timeframe: "1h" as const,
  replayState: { enabled: true, speed: 2 as const },
}

describe("chart export helpers", () => {
  it("builds a deterministic filename", () => {
    expect(buildChartExportFilename(baseInput)).toBe("chart-export-solusdt-1h.json")
  })

  it("builds an export payload stub", () => {
    const payload = buildChartExportPayload(baseInput)
    expect(payload.symbol).toBe("SOLUSDT")
    expect(payload.timeframe).toBe("1h")
    expect(payload.replay).toEqual(baseInput.replayState)
    expect(payload.note).toContain("Chart export stub")
  })
})
