import "@testing-library/jest-dom/vitest"
import { render, screen } from "@testing-library/react"
import { Badge } from "@/components/ui/Badge"

describe("Badge", () => {
  it("renders extended variants", () => {
    const variants = ["armed", "triggered", "paused", "long", "short", "info"] as const
    variants.forEach((variant) => {
      render(<Badge variant={variant}>{variant}</Badge>)
      expect(screen.getByText(variant)).toBeInTheDocument()
    })
  })
})
