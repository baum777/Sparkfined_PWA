import { describe, expect, it } from "vitest"
import "@testing-library/jest-dom/vitest"
import { render, screen, within } from "@testing-library/react"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import AppShell from "@/layout/AppShell"

function renderShell(pathname = "/dashboard") {
  return render(
    <MemoryRouter initialEntries={[{ pathname }]}>
      <Routes>
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<div>Dashboard Content</div>} />
          <Route path="/journal" element={<div>Journal Page</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe("AppShell", () => {
  it("renders the core chrome elements", () => {
    renderShell()

    expect(screen.getByText("Sparkfined")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Global search" })).toBeInTheDocument()
    expect(screen.getByText("Trade")).toBeInTheDocument()
    expect(screen.getByText("Dashboard Content")).toBeInTheDocument()
  })

  it("lists navigation rail items", () => {
    renderShell()

    const nav = screen.getByRole("navigation", { name: "Primary navigation" })
    const navArea = within(nav)

    expect(navArea.getByText("Dashboard")).toBeInTheDocument()
    expect(navArea.getByText("Scanner")).toBeInTheDocument()
    expect(navArea.getByText("Chart")).toBeInTheDocument()
    expect(navArea.getByText("Trades")).toBeInTheDocument()
    expect(navArea.getByText("Journal")).toBeInTheDocument()
  })

  it("marks the active rail item when matched", () => {
    renderShell("/journal")

    const nav = screen.getByRole("navigation", { name: "Primary navigation" })
    const journalLink = within(nav).getByRole("link", { name: "Journal" })

    expect(journalLink.getAttribute("aria-current")).toBe("page")
  })
})
