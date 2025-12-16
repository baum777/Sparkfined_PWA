import "@testing-library/jest-dom/vitest"
import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { Modal } from "@/components/ui/Modal"
import { vi } from "vitest"

describe("Modal", () => {
  it("traps focus within the dialog", async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()

    render(
      <>
        <button>Outside</button>
        <Modal isOpen onClose={onClose} title="Danger Zone">
          <div className="flex flex-col gap-2">
            <button>Primary</button>
            <button>Secondary</button>
          </div>
        </Modal>
      </>
    )

    const closeButton = screen.getByLabelText("Close modal")
    expect(closeButton).toHaveFocus()

    await user.tab()
    expect(screen.getByRole("button", { name: "Primary" })).toHaveFocus()

    await user.tab()
    expect(screen.getByRole("button", { name: "Secondary" })).toHaveFocus()

    await user.tab()
    expect(closeButton).toHaveFocus()
  })
})
