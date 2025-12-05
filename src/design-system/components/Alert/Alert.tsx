import { forwardRef } from 'react'
import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/design-system/utils/cn'

export type AlertVariant = 'armed' | 'triggered' | 'paused'

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant
  title: string
  description?: string
  badge?: ReactNode
  actions?: ReactNode
}

const variantStyles: Record<AlertVariant, string> = {
  armed: 'bg-spark/10 border-spark text-spark before:bg-spark',
  triggered: 'bg-gold/10 border-gold text-gold before:bg-gold',
  paused: 'bg-smoke/70 border-smoke-light text-mist-fog before:bg-mist-ash',
}

export const Alert = forwardRef<HTMLDivElement, AlertProps>(function Alert(
  { variant = 'armed', title, description, badge, actions, className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      role="status"
      className={cn(
        'relative overflow-hidden rounded-lg border p-4 text-sm transition-colors before:absolute before:bottom-0 before:left-0 before:top-0 before:w-1 before:rounded-l-lg',
        variantStyles[variant],
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 text-base font-semibold text-mist">
            <span>{title}</span>
            {badge}
          </div>
          {description ? <p className="mt-1 text-sm text-mist-fog/90">{description}</p> : null}
        </div>
      </div>
      {actions ? (
        <div className="mt-4 flex flex-wrap items-center gap-2 text-right sm:justify-end">{actions}</div>
      ) : null}
    </div>
  )
})

Alert.displayName = 'Alert'
