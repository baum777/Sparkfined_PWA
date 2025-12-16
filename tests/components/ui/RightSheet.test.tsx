import "@testing-library/jest-dom/vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { RightSheet } from "@/components/ui/RightSheet"
import { vi } from "vitest"

describe("RightSheet", () => {
  it("closes on Escape", async () => {
    const user = userEvent.setup()
    const handleClose = vi.fn()

    render(
      <RightSheet isOpen onClose={handleClose} title="Create alert">
        <p>Content</p>
      </RightSheet>
    )

    expect(screen.getByTestId("right-sheet-overlay")).toBeInTheDocument()
    await user.keyboard("{Escape}")
    expect(handleClose).toHaveBeenCalledTimes(1)
  })

  it("renders footer content in the sticky area", () => {
    render(
      <RightSheet
        isOpen
        onClose={() => undefined}
        title="New entry"
        footer={<div data-testid="sheet-footer">Footer actions</div>}
      >
        <p>Body</p>
      </RightSheet>
    )

    expect(screen.getByTestId("sheet-footer")).toBeInTheDocument()
  })
})
