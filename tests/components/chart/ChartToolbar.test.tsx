import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi } from "vitest"
import ChartToolbar from "@/features/chart/ChartToolbar"
import * as alertsApi from "@/api/alerts"
import type { AlertListItem } from "@/api/alerts"
import { MemoryRouter } from "react-router-dom"

vi.mock("@/api/alerts", async () => {
  const actual = await vi.importActual<typeof import("@/api/alerts")>("@/api/alerts")
  return {
    ...actual,
    getAlertsList: vi.fn(),
  }
})

const mockedGetAlertsList = vi.mocked(alertsApi.getAlertsList)

const mockAlerts: AlertListItem[] = [
  {
    id: "alert-1",
    symbol: "BTCUSDT",
    type: "price-above",
    condition: "Breaks above 42,500",
    threshold: 42500,
    timeframe: "4h",
    status: "armed",
  },
]

describe("ChartToolbar", () => {
  beforeEach(() => {
    mockedGetAlertsList.mockResolvedValue(mockAlerts)
  })

  it("toggles sections with aria-expanded", async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <ChartToolbar isOpen={false} onClose={vi.fn()} />
      </MemoryRouter>
    )

    const indicatorsButton = screen.getByRole("button", { name: /indicators tools/i })
    expect(indicatorsButton.getAttribute("aria-expanded")).toBe("false")

    await user.click(indicatorsButton)

    expect(indicatorsButton.getAttribute("aria-expanded")).toBe("true")
  })

  it("loads alerts when the alerts section expands", async () => {
    const user = userEvent.setup()
    render(
      <MemoryRouter>
        <ChartToolbar isOpen={false} onClose={vi.fn()} />
      </MemoryRouter>
    )

    const alertsButton = screen.getByRole("button", { name: /alerts tools/i })
    expect(mockedGetAlertsList).not.toHaveBeenCalled()

    await user.click(alertsButton)

    expect(mockedGetAlertsList).toHaveBeenCalledTimes(1)
    expect(await screen.findByText("BTCUSDT")).toBeTruthy()
  })
})
