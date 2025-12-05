import type { HTMLAttributes } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/design-system/utils'

export type CardVariant = 'default' | 'interactive' | 'glow'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant
  interactive?: boolean
}

const variantClasses: Record<CardVariant, string> = {
  default: 'bg-smoke border border-smoke-light text-mist',
  interactive:
    'bg-smoke border border-smoke-light text-mist hover:border-spark hover:shadow-glow-spark cursor-pointer',
  glow: 'bg-smoke border border-spark shadow-glow-spark text-mist',
}

export function Card({ className, children, variant = 'default', interactive, ...props }: CardProps) {
  const prefersReducedMotion = useReducedMotion()
  const isInteractive = interactive || variant === 'interactive'

  const Component = isInteractive ? motion.div : 'div'
  const motionProps = isInteractive
    ? {
        whileHover: prefersReducedMotion
          ? undefined
          : { y: -4, boxShadow: '0 0 20px rgba(0, 240, 255, 0.25)' },
        transition: prefersReducedMotion ? undefined : { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
      }
    : {}

  return (
    <Component
      className={cn(
        'rounded-xl p-6 transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark',
        variantClasses[variant],
        className
      )}
      {...motionProps}
      {...props}
    >
      {children}
    </Component>
  )
}

type CardSectionProps = HTMLAttributes<HTMLDivElement>

export function CardHeader({ className, ...props }: CardSectionProps) {
  return <div className={cn('mb-4 flex items-center justify-between gap-4', className)} {...props} />
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn('text-xl font-semibold text-mist font-display tracking-tight', className)}
      {...props}
    />
  )
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-fog', className)} {...props} />
}

export function CardContent({ className, ...props }: CardSectionProps) {
  return <div className={cn('text-sm text-fog', className)} {...props} />
}

export function CardFooter({ className, ...props }: CardSectionProps) {
  return <div className={cn('mt-4 flex items-center gap-3', className)} {...props} />
}
