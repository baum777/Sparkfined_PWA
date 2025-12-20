import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import NewAlertSheet from "@/features/alerts/NewAlertSheet";

describe("NewAlertSheet", () => {
  it("validates required fields before submitting", async () => {
    const user = userEvent.setup();
    const onCreated = vi.fn();

    render(<NewAlertSheet isOpen onClose={vi.fn()} onCreated={onCreated} />);

    await user.click(screen.getByTestId("alert-submit-button"));

    expect(screen.getByText("Symbol is required.")).toBeInTheDocument();
    expect(screen.getByText("Condition must be at least 5 characters.")).toBeInTheDocument();
    expect(screen.getByText("Threshold must be a valid number.")).toBeInTheDocument();
    expect(onCreated).not.toHaveBeenCalled();
  });

  it("applies a template to prefill the alert form", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<NewAlertSheet isOpen onClose={vi.fn()} />);

    await user.click(screen.getByTestId("alert-template-apply-breakout-above"));

    expect(screen.getByTestId("alert-symbol-input")).toHaveValue("BTCUSDT");
    expect(screen.getByTestId("alert-threshold-input")).toHaveValue(45000);
    expect(screen.getByTestId("alert-condition-input")).toHaveValue(
      "Alert when price closes above the breakout level.",
    );
    expect(confirmSpy).not.toHaveBeenCalled();

    confirmSpy.mockRestore();
  });

  it("confirms before overwriting existing values", async () => {
    const user = userEvent.setup();
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(false);

    render(<NewAlertSheet isOpen onClose={vi.fn()} />);

    await user.type(screen.getByTestId("alert-symbol-input"), "DOGEUSDT");
    await user.click(screen.getByTestId("alert-template-apply-breakout-above"));

    expect(confirmSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("alert-symbol-input")).toHaveValue("DOGEUSDT");

    confirmSpy.mockRestore();
  });
});
