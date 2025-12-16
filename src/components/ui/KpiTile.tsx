import React from "react"
import { cn } from "@/lib/ui/cn"

interface KpiTileProps extends React.HTMLAttributes<HTMLDivElement> {
  label: string
  value: React.ReactNode
  delta?: string
  deltaTone?: "positive" | "negative" | "neutral"
  helper?: string
}

const deltaClasses: Record<NonNullable<KpiTileProps["deltaTone"]>, string> = {
  positive: "text-emerald-300 bg-emerald-500/10",
  negative: "text-rose-300 bg-rose-500/10",
  neutral: "text-text-secondary bg-surface-subtle/60",
}

export function KpiTile({ label, value, delta, deltaTone = "neutral", helper, className, ...props }: KpiTileProps) {
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
        <span className="text-2xl font-semibold text-text-primary">{value}</span>
        {delta ? (
          <span className={cn("rounded-full px-2 py-1 text-xs font-semibold", deltaClasses[deltaTone])}>{delta}</span>
        ) : null}
      </div>
      {helper ? <p className="text-xs text-text-secondary leading-relaxed">{helper}</p> : null}
    </div>
  )
}

export default KpiTile
