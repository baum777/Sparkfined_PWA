import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/design-system/utils'

export type AlertVariant = 'armed' | 'triggered' | 'paused'

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
  title: ReactNode
  description?: ReactNode
  badge?: ReactNode
  actions?: ReactNode
}

const variantClasses: Record<AlertVariant, string> = {
  armed: 'bg-spark/5 border-spark text-spark',
  triggered: 'bg-gold/5 border-gold text-gold animate-pulse',
  paused: 'bg-smoke/40 border-smoke-light text-fog',
}

export function Alert({
  variant = 'armed',
  title,
  description,
  badge,
  actions,
  className,
  ...props
}: AlertProps) {
  return (
    <div
      role="status"
      data-variant={variant}
      className={cn(
        'relative overflow-hidden rounded-xl border p-4 pl-5',
        'before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:content-[""]',
        variant === 'armed' && 'before:bg-spark',
        variant === 'triggered' && 'before:bg-gold',
        variant === 'paused' && 'before:bg-fog',
        variantClasses[variant],
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="font-semibold tracking-wide uppercase text-xs flex items-center gap-2">
            {title}
          </div>
          {description ? <p className="mt-1 text-sm text-current opacity-90">{description}</p> : null}
        </div>
        {badge ? <div className="flex-shrink-0">{badge}</div> : null}
      </div>
      {actions ? (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-mist">{actions}</div>
      ) : null}
    </div>
  )
}
