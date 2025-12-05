import { forwardRef, type CSSProperties, type HTMLAttributes, type ReactNode } from 'react'
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion'
import { cn } from '@/design-system/utils/cn'

export type CardVariant = 'default' | 'interactive' | 'glow' | 'muted'

type BaseCardProps = Omit<HTMLMotionProps<'div'>, 'ref' | 'onDrag' | 'children'>

export interface CardProps extends BaseCardProps {
  variant?: CardVariant
  interactive?: boolean
  children?: ReactNode
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-smoke border border-smoke-light',
  interactive: 'bg-smoke border border-smoke-light hover:border-spark',
  glow: 'bg-smoke border border-spark shadow-glow-spark',
  muted: 'bg-smoke/70 border border-smoke-light text-text-secondary',
}

const MotionDiv = motion.div

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ variant = 'default', interactive = false, className, children, onClick, ...rest }, ref) => {
    const prefersReducedMotion = useReducedMotion()
    const isInteractive = interactive || typeof onClick === 'function' || variant === 'interactive'
    const Component = isInteractive ? MotionDiv : 'div'
    const motionProps = isInteractive
      ? {
          whileHover: prefersReducedMotion ? undefined : { y: -2, borderColor: '#00F0FF' },
          transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
        }
      : {}

    const { onDrag, style, ...safeRest } = rest as typeof rest & {
      onDrag?: unknown
      style?: CSSProperties
    }

    const resolvedStyle = isInteractive ? style : (style as CSSProperties | undefined)

    return (
      <Component
        ref={ref}
        className={cn(
          'rounded-lg p-4 text-text-primary transition-all duration-250 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark',
          isInteractive && 'cursor-pointer',
          variantStyles[variant],
          className
        )}
        tabIndex={isInteractive ? 0 : rest.tabIndex}
        role={isInteractive ? 'button' : rest.role}
        onClick={onClick}
        {...(isInteractive ? motionProps : {})}
        {...safeRest}
        style={resolvedStyle}
      >
        {children}
      </Component>
    )
  }
)

Card.displayName = 'Card'

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mb-3 flex items-center gap-3', className)} {...props} />
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn('font-display text-xl font-semibold text-mist', className)} {...props} />
}

export function CardDescription({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-sm text-text-secondary', className)} {...props} />
}

export function CardContent({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('text-sm text-text-secondary', className)} {...props} />
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mt-4 flex items-center justify-between gap-3', className)} {...props} />
}
