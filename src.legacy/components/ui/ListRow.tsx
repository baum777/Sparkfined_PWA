import React from "react"
import { cn } from "@/lib/ui/cn"

interface ListRowProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  title: React.ReactNode
  subtitle?: React.ReactNode
  meta?: React.ReactNode
  actions?: React.ReactNode
  onPress?: () => void
}

export function ListRow({ title, subtitle, meta, actions, onPress, className, ...props }: ListRowProps) {
  const isInteractive = Boolean(onPress || props.onClick)
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    props.onKeyDown?.(event)
    if (!isInteractive) return
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      onPress?.()
      props.onClick?.(event as unknown as React.MouseEvent<HTMLDivElement, MouseEvent>)
    }
  }

  return (
    <div
      role={isInteractive ? "button" : undefined}
      tabIndex={isInteractive ? 0 : props.tabIndex}
      onKeyDown={handleKeyDown}
      onClick={(event) => {
        props.onClick?.(event)
        onPress?.()
      }}
      className={cn(
        "flex items-start gap-3 rounded-xl border border-border/70 bg-surface/60 px-4 py-3",
        isInteractive && "cursor-pointer transition hover:border-border-focus hover:bg-surface-hover/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus",
        className
      )}
      {...props}
    >
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-text-primary">{title}</p>
          {meta ? <span className="text-xs text-text-tertiary">{meta}</span> : null}
        </div>
        {subtitle ? <p className="mt-1 text-xs text-text-secondary leading-relaxed">{subtitle}</p> : null}
      </div>
      {actions ? <div className="flex flex-shrink-0 items-center gap-2">{actions}</div> : null}
    </div>
  )
}

export default ListRow
