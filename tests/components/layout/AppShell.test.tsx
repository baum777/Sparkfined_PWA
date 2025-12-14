import { describe, expect, it } from "vitest"
import "@testing-library/jest-dom/vitest"
import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import AppShell from "@/components/layout/AppShell"

function renderShell(pathname = "/dashboard") {
  return render(
    <MemoryRouter initialEntries={[{ pathname }]}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<div>Dashboard Content</div>} />
          <Route path="/analysis" element={<div>Analysis Page</div>} />
          <Route path="/journal" element={<div>Journal Page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe("AppShell", () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  it("renders the core chrome elements", async () => {
    const user = userEvent.setup()
    renderShell()

    expect(screen.getByText("Sparkfined")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Global search" })).toBeInTheDocument()

    const toggle = screen.getByRole("button", { name: "Toggle panel" })
    expect(toggle).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByText("Inspector")).not.toBeInTheDocument()

    await user.click(toggle)

    expect(toggle).toHaveAttribute("aria-expanded", "true")
    expect(screen.getByText("Inspector")).toBeInTheDocument()
    expect(screen.getByText("Shortcuts")).toBeInTheDocument()
    expect(screen.getByRole("main")).toHaveAttribute("id", "main-content")
    expect(screen.getByText("Dashboard Content")).toBeInTheDocument()
  })

  it("lists navigation rail items", () => {
    renderShell()

    const nav = screen.getByRole("navigation", { name: "Primary navigation" })
    const navArea = within(nav)

    expect(navArea.getByText("Dashboard")).toBeInTheDocument()
    expect(navArea.getByText("Analysis")).toBeInTheDocument()
    expect(navArea.getByText("Chart")).toBeInTheDocument()
    expect(navArea.getByText("Watchlist")).toBeInTheDocument()
    expect(navArea.getByText("Alerts")).toBeInTheDocument()
    expect(navArea.getByText("Journal")).toBeInTheDocument()
  })

  it("marks the active rail item when matched", () => {
    renderShell("/journal")

    const nav = screen.getByRole("navigation", { name: "Primary navigation" })
    const journalLink = within(nav).getByRole("link", { name: "Journal" })

    expect(journalLink.getAttribute("aria-current")).toBe("page")
  })

  it("shows journal-specific inspector helpers", async () => {
    const user = userEvent.setup()
    renderShell("/journal")

    const toggle = screen.getByRole("button", { name: "Toggle panel" })
    await user.click(toggle)

    expect(await screen.findByText("Journal tools")).toBeInTheDocument()
    expect(toggle).toHaveAttribute("aria-expanded", "true")
  })

  it("allows collapsing the action panel", async () => {
    const user = userEvent.setup()
    renderShell()

    const toggle = screen.getByRole("button", { name: "Toggle panel" })

    await user.click(toggle)
    expect(toggle).toHaveAttribute("aria-expanded", "true")

    await user.click(toggle)

    expect(toggle).toHaveAttribute("aria-expanded", "false")
    expect(screen.queryByText("Inspector")).not.toBeInTheDocument()
  })
})
