import "@testing-library/jest-dom/vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import FiltersBar from "@/features/alerts/FiltersBar";
import { applyAlertFilters, type AlertFilterState } from "@/features/alerts/filtering";
import type { AlertListItem } from "@/api/alerts";

const sampleAlerts: AlertListItem[] = [
  {
    id: "alert-btc-armed",
    symbol: "BTCUSDT",
    type: "price-above",
    condition: "Breaks above 42,500",
    threshold: 42500,
    timeframe: "4h",
    status: "armed",
  },
  {
    id: "alert-eth-paused",
    symbol: "ETHUSDT",
    type: "price-below",
    condition: "Falls below 2,350",
    threshold: 2350,
    timeframe: "1h",
    status: "paused",
  },
  {
    id: "alert-sol-triggered",
    symbol: "SOLUSDT",
    type: "price-above",
    condition: "Breaks above 190",
    threshold: 190,
    timeframe: "1d",
    status: "triggered",
  },
];

const baseFilters: AlertFilterState = {
  status: "all",
  type: "all",
  query: "",
  symbol: "",
};

describe("applyAlertFilters", () => {
  it("filters by status", () => {
    const result = applyAlertFilters(sampleAlerts, { ...baseFilters, status: "paused" });
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("alert-eth-paused");
  });

  it("filters by type", () => {
    const result = applyAlertFilters(sampleAlerts, { ...baseFilters, type: "price-below" });
    expect(result).toHaveLength(1);
    expect(result[0]?.symbol).toBe("ETHUSDT");
  });

  it("matches symbol queries", () => {
    const result = applyAlertFilters(sampleAlerts, { ...baseFilters, query: "sol" });
    expect(result).toHaveLength(1);
    expect(result[0]?.symbol).toBe("SOLUSDT");
  });

  it("honors exact symbol filters", () => {
    const result = applyAlertFilters(sampleAlerts, {
      ...baseFilters,
      symbol: "ETHUSDT",
      query: "btc",
    });
    expect(result).toHaveLength(1);
    expect(result[0]?.id).toBe("alert-eth-paused");
  });
});

describe("FiltersBar", () => {
  it("debounces search updates", () => {
    vi.useFakeTimers();
    const onChange = vi.fn();

    render(<FiltersBar filters={baseFilters} onChange={onChange} />);

    const input = screen.getByLabelText(/symbol search/i);
    fireEvent.change(input, { target: { value: "btc" } });

    expect(onChange).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(200);
    });

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ query: "btc" }));
    vi.useRealTimers();
  });
});
