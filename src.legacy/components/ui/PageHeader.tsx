import React from "react"
import { cn } from "@/lib/ui/cn"

interface PageHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode
  subtitle?: React.ReactNode
  actions?: React.ReactNode
  align?: "start" | "center"
}

export function PageHeader({ title, subtitle, actions, align = "start", className, ...props }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 border-b border-border/60 pb-4 pt-2 sm:flex-row sm:items-center sm:justify-between",
        align === "center" && "sm:items-start",
        className
      )}
      {...props}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold text-text-primary">{title}</h1>
        {subtitle ? <p className="text-sm text-text-secondary">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  )
}

export default PageHeader
