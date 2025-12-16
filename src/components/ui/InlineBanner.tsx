import React from "react"
import { cn } from "@/lib/ui/cn"

export type InlineBannerVariant = "error" | "info" | "warning"

const variantClasses: Record<InlineBannerVariant, string> = {
  error: "border-rose-400/40 bg-rose-500/10 text-rose-100",
  info: "border-cyan-400/40 bg-cyan-500/10 text-cyan-50",
  warning: "border-amber-300/40 bg-amber-500/10 text-amber-50",
}

interface InlineBannerProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description?: React.ReactNode
  variant?: InlineBannerVariant
  actions?: React.ReactNode
}

export function InlineBanner({
  title,
  description,
  variant = "info",
  actions,
  className,
  ...props
}: InlineBannerProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col gap-2 rounded-2xl border px-4 py-3 shadow-card-subtle",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <p className="text-sm font-semibold">{title}</p>
          {description ? <p className="text-xs leading-relaxed opacity-90">{description}</p> : null}
        </div>
        {actions ? <div className="flex flex-shrink-0 items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  )
}

export default InlineBanner
