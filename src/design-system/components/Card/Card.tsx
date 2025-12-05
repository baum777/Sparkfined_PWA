import { motion } from 'framer-motion'
import React from 'react'
import { cn } from '@/design-system/utils/cn'

export type CardVariant = 'default' | 'interactive' | 'glow'

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  interactive?: boolean
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-smoke border border-smoke-light',
  interactive:
    'bg-smoke border border-smoke-light hover:border-spark focus-visible:border-spark shadow-sm hover:shadow-glow-spark',
  glow: 'bg-smoke border border-spark shadow-glow-spark',
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = 'default', interactive, className, onClick, tabIndex, onKeyDown, ...props },
  ref
) {
  const isInteractive = interactive ?? typeof onClick === 'function'
  const Component = isInteractive ? motion.div : 'div'

  const motionProps = isInteractive
    ? {
        whileHover: { y: -2 },
        transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
      }
    : {}

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (!isInteractive || event.defaultPrevented) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick?.(event as unknown as React.MouseEvent<HTMLDivElement>)
    }
  }

  return (
    <Component
      ref={ref as never}
      className={cn(
        'rounded-xl p-6 text-mist transition-all duration-250 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark/70 focus-visible:ring-offset-2 focus-visible:ring-offset-void',
        variantStyles[variant],
        isInteractive && 'cursor-pointer',
        className
      )}
      onKeyDown={handleKeyDown}
      onClick={onClick}
      tabIndex={isInteractive ? tabIndex ?? 0 : tabIndex}
      role={isInteractive ? 'button' : props.role}
      {...motionProps}
      {...props}
    />
  )
})

Card.displayName = 'DesignSystemCard'

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-4 flex items-start justify-between gap-4', className)} {...props} />
}

export function CardTitle({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('text-xl font-semibold text-mist font-display tracking-tight', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-fog', className)} {...props} />
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('text-sm text-fog', className)} {...props} />
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-6 flex items-center justify-between gap-4', className)} {...props} />
}
