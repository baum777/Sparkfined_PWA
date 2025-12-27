import React from "react";
import type { AlertFilterState, AlertFilterStatus, AlertFilterType } from "@/features/alerts/filtering";

const STATUS_OPTIONS: Array<{ value: AlertFilterStatus; label: string }> = [
  { value: "all", label: "All" },
  { value: "armed", label: "Armed" },
  { value: "paused", label: "Paused" },
  { value: "triggered", label: "Triggered" },
];

const TYPE_OPTIONS: Array<{ value: AlertFilterType; label: string }> = [
  { value: "all", label: "All types" },
  { value: "price-above", label: "Price above" },
  { value: "price-below", label: "Price below" },
];

type FiltersBarProps = {
  filters: AlertFilterState;
  onChange: (next: AlertFilterState) => void;
};

export default function FiltersBar({ filters, onChange }: FiltersBarProps) {
  return (
    <div className="sf-alerts-page__filters" role="region" aria-label="Alert filters">
      <fieldset className="sf-alerts-filters__group">
        <legend className="sf-alerts-filters__label">Status</legend>
        <div className="sf-alerts-filters__segmented" role="group" aria-label="Alert status">
          {STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className="sf-alerts-filters__button sf-focus-ring"
              aria-pressed={filters.status === option.value}
              data-testid={`alerts-status-filter-${option.value}`}
              onClick={() => onChange({ ...filters, status: option.value })}
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset className="sf-alerts-filters__group">
        <legend className="sf-alerts-filters__label">Type</legend>
        <div className="sf-alerts-filters__segmented" role="group" aria-label="Alert type">
          {TYPE_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              className="sf-alerts-filters__button sf-focus-ring"
              aria-pressed={filters.type === option.value}
              data-testid={`alerts-type-filter-${option.value}`}
              onClick={() => onChange({ ...filters, type: option.value })}
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="sf-alerts-filters__group">
        <label className="sf-alerts-filters__label" htmlFor="alerts-symbol">
          Symbol search
        </label>
        <input
          id="alerts-symbol"
          className="sf-alerts-filters__input sf-focus-ring"
          type="search"
          placeholder="Search symbol"
          value={filters.query}
          onChange={(event) => onChange({ ...filters, query: event.target.value })}
          aria-label="Search by symbol"
          data-testid="alerts-symbol-filter"
        />
      </div>
    </div>
  );
}
