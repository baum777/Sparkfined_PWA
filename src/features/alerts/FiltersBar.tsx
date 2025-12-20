import React from "react";

const STATUS_OPTIONS = [
  { value: "all", label: "All" },
  { value: "armed", label: "Armed" },
  { value: "paused", label: "Paused" },
  { value: "triggered", label: "Triggered" },
] as const;

type StatusOption = (typeof STATUS_OPTIONS)[number]["value"];

type TypeOption = "all" | "price-above" | "price-below" | "volatility";

const TYPE_OPTIONS: Array<{ value: TypeOption; label: string }> = [
  { value: "all", label: "All types" },
  { value: "price-above", label: "Price above" },
  { value: "price-below", label: "Price below" },
  { value: "volatility", label: "Volatility spike" },
];

export default function FiltersBar() {
  const [status, setStatus] = React.useState<StatusOption>("all");
  const [type, setType] = React.useState<TypeOption>("all");
  const [symbolQuery, setSymbolQuery] = React.useState("");

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
              aria-pressed={status === option.value}
              onClick={() => setStatus(option.value)}
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
          value={type}
          onChange={(event) => setType(event.target.value as TypeOption)}
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
          value={symbolQuery}
          onChange={(event) => setSymbolQuery(event.target.value)}
        />
      </div>
    </div>
  );
}
