import { describe, expect, it } from "vitest"
import { getCandles } from "@/api/marketData"

const request = {
  symbol: "SOL/USDC",
  timeframe: "1h" as const,
}

describe("marketData", () => {
  it("returns deterministic mock candles when no address is provided", async () => {
    const first = await getCandles(request)
    const second = await getCandles(request)

    expect(first).toEqual(second)
    expect(first.length).toBeGreaterThan(40)
    expect(first[0]).toMatchObject({
      t: expect.any(Number),
      o: expect.any(Number),
      h: expect.any(Number),
      l: expect.any(Number),
      c: expect.any(Number),
    })
  })

  it("advances timestamps using the timeframe interval", async () => {
    const candles = await getCandles({ ...request, limit: 3 })

    expect(candles).toHaveLength(40)
    if (!candles[0] || !candles[1]) {
      throw new Error("Expected at least two candles for interval validation.")
    }
    expect(candles[1].t - candles[0].t).toBe(3600)
  })
})
