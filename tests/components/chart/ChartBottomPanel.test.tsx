import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter } from "react-router-dom"
import ChartBottomPanel from "@/features/chart/ChartBottomPanel"
import { buildStorageKey } from "@/features/chart/InlineJournalNotes"

const mockPulse = {
  summary: "Test summary",
  bias: "BULLISH",
  timestamp: "2025-01-01T00:00:00Z",
  bullets: ["Signal one", "Signal two"],
  source: "Mock Pulse",
}

describe("ChartBottomPanel", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: vi.fn().mockResolvedValue(mockPulse),
      })
    )
    window.localStorage.clear()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("renders Grok Pulse data and persists notes", async () => {
    const user = userEvent.setup()

    render(
      <MemoryRouter initialEntries={["/chart?symbol=BTCUSDT&timeframe=1h"]}>
        <ChartBottomPanel />
      </MemoryRouter>
    )

    expect(screen.getByRole("tab", { name: /grok pulse/i }).getAttribute("aria-selected")).toBe("true")
    expect(await screen.findByText(/test summary/i)).toBeTruthy()

    await user.click(screen.getByRole("tab", { name: /journal notes/i }))

    const textarea = await screen.findByPlaceholderText(/log thesis updates/i)
    await user.type(textarea, "Draft note")

    const storageKey = buildStorageKey("BTCUSDT", "1h")
    const stored = window.localStorage.getItem(storageKey)
    expect(stored).toContain("Draft note")
  })
})
