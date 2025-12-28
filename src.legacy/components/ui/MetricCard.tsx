import React from "react"
import { cn } from "@/lib/ui/cn"

interface MetricCardProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: React.ReactNode
  helper?: string
  trend?: string
  trendTone?: "positive" | "negative" | "neutral"
}

const trendClasses: Record<NonNullable<MetricCardProps["trendTone"]>, string> = {
  positive: "text-emerald-300",
  negative: "text-rose-300",
  neutral: "text-text-secondary",
}

export function MetricCard({
  label,
  value,
  helper,
  trend,
  trendTone = "neutral",
  className,
  ...props
}: MetricCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-surface/80 p-4 shadow-card-subtle",
        "flex flex-col gap-2",
        className
      )}
      {...props}
    >
      <p className="text-xs uppercase tracking-[0.25em] text-text-tertiary">{label}</p>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-semibold text-text-primary">{value}</span>
        {trend ? <span className={cn("text-sm font-medium", trendClasses[trendTone])}>{trend}</span> : null}
      </div>
      {helper ? <p className="text-xs text-text-secondary leading-relaxed">{helper}</p> : null}
    </div>
  )
}

export default MetricCard
