import React from 'react'
import { cn } from '@/design-system/utils/cn'

export type AlertVariant = 'armed' | 'triggered' | 'paused'

export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
  title: React.ReactNode
  description?: React.ReactNode
  badge?: React.ReactNode
  actions?: React.ReactNode
}

const containerVariants: Record<AlertVariant, string> = {
  armed: 'bg-spark/10 border-spark text-spark',
  triggered: 'bg-gold/10 border-gold text-gold',
  paused: 'bg-smoke/70 border-smoke-light text-fog',
}

const accentVariants: Record<AlertVariant, string> = {
  armed: 'bg-spark',
  triggered: 'bg-gold',
  paused: 'bg-fog',
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
      role="alert"
      className={cn(
        'relative overflow-hidden rounded-xl border p-4 pr-5 shadow-md',
        containerVariants[variant],
        className
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn('absolute left-0 top-0 bottom-0 w-1 rounded-r-full', accentVariants[variant])}
      />
      <div className="flex flex-col gap-3 pl-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 font-semibold">
              {title}
            </div>
            {description ? <p className="text-sm opacity-90">{description}</p> : null}
          </div>
          {badge ? <div className="flex-shrink-0">{badge}</div> : null}
        </div>
        {actions ? <div className="flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
    </div>
  )
}
