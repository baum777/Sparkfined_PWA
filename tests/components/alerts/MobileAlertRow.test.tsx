import "@testing-library/jest-dom/vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import MobileAlertRow from "@/features/alerts/MobileAlertRow"
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

describe("MobileAlertRow", () => {
  it("renders compact alert details", () => {
    render(
      <MobileAlertRow
        alert={baseAlert}
        onToggleStatus={vi.fn()}
        onDelete={vi.fn()}
      />,
    )

    expect(screen.getByText("BTCUSDT")).toBeInTheDocument()
    expect(screen.getByText("Price above")).toBeInTheDocument()
    expect(screen.getByText("Breaks above 42,500 with RSI > 60")).toBeInTheDocument()
    expect(screen.getByText(/threshold 42,500/i)).toBeInTheDocument()
    expect(screen.getByText(/timeframe 4h/i)).toBeInTheDocument()
    expect(screen.getByText("armed")).toBeInTheDocument()
  })

  it("fires pause and delete actions from the menu", async () => {
    const user = userEvent.setup()
    const onToggleStatus = vi.fn()
    const onDelete = vi.fn()

    render(
      <MobileAlertRow
        alert={baseAlert}
        onToggleStatus={onToggleStatus}
        onDelete={onDelete}
      />,
    )

    await user.click(screen.getByTestId(`mobile-alert-row-menu-${baseAlert.id}`))
    await user.click(screen.getByRole("menuitem", { name: /pause/i }))

    await user.click(screen.getByTestId(`mobile-alert-row-menu-${baseAlert.id}`))
    await user.click(screen.getByRole("menuitem", { name: /delete/i }))

    expect(onToggleStatus).toHaveBeenCalledWith(baseAlert)
    expect(onDelete).toHaveBeenCalledWith(baseAlert)
  })
})
