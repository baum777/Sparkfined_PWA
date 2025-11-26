import React from 'react'
import { cn } from '@/lib/ui/cn'

export type CardVariant = 'default' | 'muted' | 'interactive'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  interactive?: boolean
}

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-surface border-border-subtle',
  muted: 'bg-surface-subtle border-border-moderate',
  interactive: 'bg-surface border-border-subtle hover:border-border-accent hover:shadow-emerald-glow transition-shadow',
}

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
        'rounded-2xl border p-6 shadow-card-subtle',
        variantClasses[variant],
        isInteractive && 'cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus',
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

interface CardSectionProps extends React.HTMLAttributes<HTMLDivElement> {}

export function CardHeader({ className, ...props }: CardSectionProps) {
  return <div className={cn('mb-4 flex flex-col gap-1', className)} {...props} />
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('text-lg font-semibold text-text-primary', className)} {...props} />
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-text-secondary', className)} {...props} />
}

export function CardContent({ className, ...props }: CardSectionProps) {
  return <div className={cn('flex flex-col gap-3 text-sm text-text-secondary', className)} {...props} />
}

export function CardFooter({ className, ...props }: CardSectionProps) {
  return <div className={cn('mt-6 flex items-center justify-between gap-3', className)} {...props} />
}

export default Card
