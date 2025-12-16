import "@testing-library/jest-dom/vitest"
import { render, screen } from "@testing-library/react"
import { FormRow } from "@/components/ui/FormRow"

describe("FormRow", () => {
  it("renders label, help text, and child control", () => {
    render(
      <FormRow label="Theme" help="Choose your preferred theme" labelFor="theme-select">
        <select id="theme-select">
          <option>Dark</option>
        </select>
      </FormRow>
    )

    expect(screen.getByText("Theme")).toBeInTheDocument()
    expect(screen.getByText("Choose your preferred theme")).toBeInTheDocument()
    expect(screen.getByRole("combobox", { name: "Theme" })).toBeInTheDocument()
  })

  it("shows error text when provided", () => {
    render(
      <FormRow label="API Key" error="Required">
        <input aria-label="API Key" />
      </FormRow>
    )

    expect(screen.getByText("Required")).toHaveAttribute("role", "alert")
  })
})
