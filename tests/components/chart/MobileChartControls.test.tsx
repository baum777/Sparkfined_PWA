import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { vi } from "vitest"
import MobileChartControls from "@/features/chart/MobileChartControls"

describe("MobileChartControls", () => {
  it("calls handlers for sidebar and tools", async () => {
    const user = userEvent.setup()
    const handleSidebar = vi.fn()
    const handleTools = vi.fn()

    render(<MobileChartControls onOpenSidebar={handleSidebar} onOpenToolbar={handleTools} />)

    await user.click(screen.getByRole("button", { name: /open chart sidebar/i }))
    await user.click(screen.getByRole("button", { name: /open chart tools/i }))

    expect(handleSidebar).toHaveBeenCalledTimes(1)
    expect(handleTools).toHaveBeenCalledTimes(1)
  })

  it("renders replay control when callback is provided", () => {
    const handleReplay = vi.fn()

    render(
      <MobileChartControls
        onOpenSidebar={vi.fn()}
        onOpenToolbar={vi.fn()}
        onOpenReplay={handleReplay}
      />
    )

    expect(screen.getByRole("button", { name: /open replay controls/i })).toBeTruthy()
  })
})
