import React from "react"
import { cn } from "@/lib/ui/cn"

interface FormRowProps extends React.HTMLAttributes<HTMLDivElement> {
  label: React.ReactNode
  labelFor?: string
  help?: React.ReactNode
  error?: React.ReactNode
  actions?: React.ReactNode
  inline?: boolean
}

export function FormRow({
  label,
  labelFor,
  help,
  error,
  actions,
  inline = false,
  className,
  children,
  ...props
}: FormRowProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border/70 bg-surface/70 p-4 shadow-card-subtle",
        "flex flex-col gap-3",
        className
      )}
      {...props}
    >
      <div className={cn("flex gap-3", inline ? "flex-row items-start justify-between" : "flex-col")}>
        <div className="space-y-1">
          <label htmlFor={labelFor} className="text-sm font-semibold text-text-primary">
            {label}
          </label>
          {help ? <p className="text-xs leading-relaxed text-text-secondary">{help}</p> : null}
        </div>
        {actions ? <div className="flex flex-shrink-0 items-center gap-2">{actions}</div> : null}
      </div>

      <div className="flex flex-wrap items-center gap-3">{children}</div>

      {error ? (
        <p role="alert" className="text-xs font-medium text-rose-200">
          {error}
        </p>
      ) : null}
    </div>
  )
}

export default FormRow
