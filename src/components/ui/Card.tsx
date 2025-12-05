/**
 * Card - Migrated to Design System
 *
 * Uses Design System card classes (.card, .card-glass, .card-interactive, etc.) from src/styles/index.css
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
import React from 'react'
import { cn } from '@/lib/ui/cn'

export type CardVariant = 'default' | 'muted' | 'interactive' | 'glass' | 'elevated' | 'bordered' | 'glow'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  interactive?: boolean
}

// Map component variants to Design System card classes
const variantClasses: Record<CardVariant, string> = {
  default: 'card',
  muted: 'card bg-surface-subtle',
  interactive: 'card-interactive',
  glass: 'card-glass',
  elevated: 'card-elevated',
  bordered: 'card-bordered',
  glow: 'card-glow',
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = 'default', className, interactive, onClick, onKeyDown, tabIndex, ...props },
  ref
) {
  const isInteractive = interactive ?? typeof onClick === 'function'
  
  // If explicitly interactive but not interactive variant, use card-interactive
  const cardClass = isInteractive && variant === 'default' ? 'card-interactive' : variantClasses[variant]

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
        cardClass,
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
