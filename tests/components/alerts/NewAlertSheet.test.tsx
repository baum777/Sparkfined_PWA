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
});
