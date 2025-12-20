import "@testing-library/jest-dom/vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import AlertCard from "@/features/alerts/AlertCard"
import type { AlertListItem } from "@/api/alerts"

const baseAlert: AlertListItem = {
  id: "alert-btc-breakout",
  symbol: "BTCUSDT",
  type: "price-above",
  condition: "Breaks above 42,500 with RSI > 60",
  threshold: 42500,
  timeframe: "4h",
  status: "armed",
}

describe("AlertCard", () => {
  it("renders alert details and actions", () => {
    render(
      <AlertCard
        alert={baseAlert}
        onToggleStatus={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByText("BTCUSDT")).toBeInTheDocument()
    expect(screen.getByText("Breaks above 42,500 with RSI > 60")).toBeInTheDocument()
    expect(screen.getByText("armed")).toBeInTheDocument()
    expect(screen.getByText("Type: Price above")).toBeInTheDocument()
    expect(screen.getByText("Threshold: 42,500")).toBeInTheDocument()
    expect(screen.getByText("Timeframe: 4h")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /pause alert/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /delete alert/i })).toBeInTheDocument()
  })

  it("fires pause and delete handlers", async () => {
    const user = userEvent.setup()
    const onToggleStatus = vi.fn()
    const onDelete = vi.fn()

    render(<AlertCard alert={baseAlert} onToggleStatus={onToggleStatus} onDelete={onDelete} />)

    await user.click(screen.getByRole("button", { name: /pause alert/i }))
    await user.click(screen.getByRole("button", { name: /delete alert/i }))

    expect(onToggleStatus).toHaveBeenCalledWith(baseAlert)
    expect(onDelete).toHaveBeenCalledWith(baseAlert)
  })
})
