import React from "react";
import { cn } from "@/lib/ui/cn";
import KPICard from "./KPICard";
import "./kpi.css";

export type KPIDeltaDirection = "up" | "down" | "flat";

export interface KPIDelta {
  value: string;
  direction?: KPIDeltaDirection;
  srLabel?: string;
}

export interface KPIItem {
  label: string;
  value: string;
  delta?: KPIDelta;
  icon?: React.ReactNode;
}

interface KPIBarProps {
  items: KPIItem[];
  onItemClick?: (item: KPIItem) => void;
  className?: string;
  "data-testid"?: string;
}

export default function KPIBar({ items, onItemClick, className, "data-testid": dataTestId }: KPIBarProps) {
  if (!items?.length) {
    return null;
  }

  return (
    <section className={cn("sf-kpi-bar", className)} aria-label="Key performance indicators" data-testid={dataTestId}>
      <div className="sf-kpi-bar__track">
        {items.map((item) => (
          <KPICard key={item.label} item={item} onClick={onItemClick ? () => onItemClick(item) : undefined} />
        ))}
      </div>
    </section>
  );
}
