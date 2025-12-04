import { type HTMLAttributes, type ReactNode } from 'react'
import { cn } from '@/design-system/utils/cn'

export type AlertVariant = 'armed' | 'triggered' | 'paused'

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
  title: ReactNode
  description?: ReactNode
  badge?: ReactNode
  actions?: ReactNode
}

const variantStyles: Record<AlertVariant, string> = {
  armed: 'bg-spark/5 border-spark text-spark',
  triggered: 'bg-gold/5 border-gold text-gold animate-pulse',
  paused: 'bg-smoke/50 border-smoke-light text-fog',
}

const accentStyles: Record<AlertVariant, string> = {
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
  const role = variant === 'triggered' ? 'alert' : 'status'

  return (
    <div
      className={cn(
        'relative rounded-lg border p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark',
        variantStyles[variant],
        className
      )}
      role={role}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn('absolute left-0 top-0 bottom-0 w-1 rounded-l-lg', accentStyles[variant])}
      />
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="mb-2 flex items-center gap-2 font-semibold">
            {title}
          </div>
          {description ? <p className="text-sm opacity-90">{description}</p> : null}
        </div>
        {badge ? <div>{badge}</div> : null}
      </div>
      {actions ? <div className="mt-3 flex items-center gap-2">{actions}</div> : null}
    </div>
  )
}
