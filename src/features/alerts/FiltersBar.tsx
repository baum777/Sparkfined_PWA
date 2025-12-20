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

const DEBOUNCE_MS = 200;

type FiltersBarProps = {
  filters: AlertFilterState;
  onChange: (next: AlertFilterState) => void;
};

export default function FiltersBar({ filters, onChange }: FiltersBarProps) {
  const [localQuery, setLocalQuery] = React.useState(filters.query);

  React.useEffect(() => {
    setLocalQuery(filters.query);
  }, [filters.query]);

  React.useEffect(() => {
    const handle = window.setTimeout(() => {
      if (localQuery !== filters.query) {
        onChange({ ...filters, query: localQuery });
      }
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(handle);
    };
  }, [filters, localQuery, onChange]);

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
              onClick={() => onChange({ ...filters, status: option.value })}
            >
              {option.label}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="sf-alerts-filters__group">
        <label className="sf-alerts-filters__label" htmlFor="alerts-type">
          Type
        </label>
        <select
          id="alerts-type"
          className="sf-alerts-filters__select sf-focus-ring"
          value={filters.type}
          onChange={(event) => onChange({ ...filters, type: event.target.value as AlertFilterType })}
        >
          {TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="sf-alerts-filters__group">
        <label className="sf-alerts-filters__label" htmlFor="alerts-symbol">
          Symbol search
        </label>
        <input
          id="alerts-symbol"
          className="sf-alerts-filters__input sf-focus-ring"
          type="search"
          placeholder="Search symbol"
          value={localQuery}
          onChange={(event) => setLocalQuery(event.target.value)}
          aria-label="Search by symbol"
        />
      </div>
    </div>
  );
}
