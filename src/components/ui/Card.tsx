import React from 'react'
import { cn } from '@/lib/ui/cn'

export type CardVariant = 'default' | 'muted' | 'interactive'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  interactive?: boolean
}

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-gradient-to-br from-surface to-surface-elevated border-border-subtle shadow-card-subtle',
  muted: 'bg-gradient-to-br from-surface-subtle to-surface border-border-moderate shadow-card-subtle',
  interactive:
    'bg-gradient-to-br from-surface to-surface-elevated border-border-subtle shadow-card-subtle hover:border-accent/40 hover:shadow-glow-cyan',
}

/**
 * Card
 *
 * Usage:
 * ```tsx
 * <Card>
 *   <CardHeader>
 *     <CardTitle>Session stats</CardTitle>
 *     <CardDescription>Last 24h performance</CardDescription>
 *   </CardHeader>
 *   <CardContent>…</CardContent>
 * </Card>
 *
 * <Card interactive onClick={handleClick}>
 *   <CardContent>Interactive surface</CardContent>
 * </Card>
 * ```
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = 'default', className, interactive, onClick, onKeyDown, tabIndex, ...props },
  ref
) {
  const isInteractive = interactive ?? typeof onClick === 'function'

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (!isInteractive || event.defaultPrevented) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick?.(event as unknown as React.MouseEvent<HTMLDivElement, MouseEvent>)
    }
  }

  return (
    <div
      ref={ref}
      className={cn(
        'rounded-2xl border p-6 transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface',
        variantClasses[variant],
        isInteractive && 'group cursor-pointer hover:scale-[1.01] hover:-translate-y-0.5 active:scale-[0.99] active:translate-y-0 focus-visible:-translate-y-0.5',
        className
      )}
      tabIndex={isInteractive ? tabIndex ?? 0 : tabIndex}
      role={isInteractive ? 'button' : props.role}
      onKeyDown={handleKeyDown}
      onClick={onClick}
      {...props}
    />
  )
})

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4 flex flex-col gap-1', className)} {...props} />
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-lg font-semibold text-text-primary', className)} {...props}>{children}</h3>
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-text-secondary', className)} {...props} />
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('flex flex-col gap-3 text-sm text-text-secondary', className)} {...props} />
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-6 flex items-center justify-between gap-3', className)} {...props} />
}

export default Card
