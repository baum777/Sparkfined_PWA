import { forwardRef } from 'react'
import type { HTMLAttributes, KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import type { HTMLMotionProps, MotionProps } from 'framer-motion'
import { cn } from '@/design-system/utils/cn'

export type CardVariant = 'default' | 'interactive' | 'glow' | 'muted'

export interface CardProps extends HTMLMotionProps<'div'> {
  variant?: CardVariant
  interactive?: boolean
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-smoke border border-smoke-light text-mist-fog',
  interactive:
    'bg-smoke border border-smoke-light text-mist-fog hover:border-spark focus-visible:border-spark focus-visible:shadow-glow-spark',
  glow: 'bg-smoke border border-spark shadow-glow-spark text-mist',
  // TODO: design-system: spec vs. legacy variant naming – remove muted once consumers migrate
  muted: 'bg-smoke-light border border-smoke text-mist-fog/80',
}

const interactiveMotion: MotionProps = {
  whileHover: { y: -2 },
  transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
}

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = 'default', className, interactive, onClick, onKeyDown, tabIndex, role, ...props },
  ref
) {
  const isInteractive = interactive ?? typeof onClick === 'function'

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event)
    if (!isInteractive || event.defaultPrevented) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick?.(event as unknown as React.MouseEvent<HTMLDivElement, MouseEvent>)
    }
  }

  return (
    <motion.div
      {...(isInteractive ? interactiveMotion : {})}
      ref={ref}
      className={cn(
        'rounded-xl p-6 transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark/60 focus-visible:ring-offset-2 focus-visible:ring-offset-void',
        variantStyles[variant],
        isInteractive && 'cursor-pointer focus-visible:-translate-y-0.5',
        className
      )}
      role={isInteractive ? role ?? 'button' : role}
      tabIndex={isInteractive ? tabIndex ?? 0 : tabIndex}
      onKeyDown={handleKeyDown}
      onClick={onClick}
      {...props}
    />
  )
})

Card.displayName = 'Card'

export function CardHeader({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mb-4 flex flex-col gap-2', className)} {...props}>
      {children}
    </div>
  )
}

export function CardTitle({ className, children, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3 className={cn('font-display text-xl font-semibold text-mist', className)} {...props}>
      {children}
    </h3>
  )
}

export function CardDescription({ className, children, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p className={cn('text-sm text-mist-fog', className)} {...props}>
      {children}
    </p>
  )
}

export function CardContent({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('text-sm text-mist-fog', className)} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className, children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('mt-4 flex items-center justify-between gap-3', className)} {...props}>
      {children}
    </div>
  )
}
