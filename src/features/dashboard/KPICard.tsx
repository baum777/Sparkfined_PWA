import React from "react";
import { ArrowDownRight, ArrowUpRight, Minus } from "@/lib/icons";
import type { KPIItem } from "./KPIBar";

interface KPICardProps {
  item: KPIItem;
  onClick?: () => void;
}

const deltaIcon = {
  up: <ArrowUpRight className="sf-kpi-card__delta-icon" aria-hidden />,
  down: <ArrowDownRight className="sf-kpi-card__delta-icon" aria-hidden />,
  flat: <Minus className="sf-kpi-card__delta-icon" aria-hidden />,
} as const;

export default function KPICard({ item, onClick }: KPICardProps) {
  const { label, value, delta, icon } = item;
  const direction = delta?.direction ?? "flat";
  const deltaLabel =
    delta?.srLabel ??
    (direction === "up"
      ? "Positive change"
      : direction === "down"
        ? "Negative change"
        : "No change");

  const isInteractive = typeof onClick === "function";

  return (
    <article
      className="sf-kpi-card sf-card sf-focus-ring"
      aria-label={`${label} KPI`}
      role={isInteractive ? "button" : "group"}
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(event) => {
        if (!isInteractive) return;
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onClick();
        }
      }}
    >
      <div className="sf-kpi-card__header">
        <div className="sf-kpi-card__label" aria-label={label}>
          {icon ? (
            <span className="sf-kpi-card__icon" aria-hidden>
              {icon}
            </span>
          ) : null}
          <span className="sf-kpi-card__label-text">{label}</span>
        </div>
        {delta ? (
          <span
            className={`sf-kpi-card__delta sf-kpi-card__delta--${direction}`}
            aria-label={deltaLabel}
          >
            {deltaIcon[direction]}
            <span className="sf-kpi-card__delta-value">{delta.value}</span>
          </span>
        ) : null}
      </div>

      <div className="sf-kpi-card__value" aria-label={`Value ${value}`}>
        {value}
      </div>
    </article>
  );
}
