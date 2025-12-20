import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SymbolAutocomplete } from "@/features/alerts/SymbolAutocomplete";

describe("SymbolAutocomplete", () => {
  it("shows suggestions and lets users click to select", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<SymbolAutocomplete value="" onChange={handleChange} dataTestId="symbol-input" />);

    const input = screen.getByTestId("symbol-input");
    await user.click(input);

    const listbox = screen.getByRole("listbox");
    expect(listbox).toBeInTheDocument();

    await user.click(screen.getByRole("option", { name: "BTCUSDT" }));
    expect(handleChange).toHaveBeenCalledWith("BTCUSDT");
  });

  it("supports keyboard selection", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<SymbolAutocomplete value="" onChange={handleChange} dataTestId="symbol-input" />);

    const input = screen.getByTestId("symbol-input");
    await user.click(input);
    await user.keyboard("{ArrowDown}{Enter}");

    expect(handleChange).toHaveBeenCalled();
    expect(handleChange.mock.calls[0]?.[0]).toBeTruthy();
  });
});
