import { forwardRef, type ReactNode } from 'react'
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/design-system/utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

type BaseButtonProps = Omit<HTMLMotionProps<'button'>, 'ref' | 'onDrag' | 'children'>

export interface ButtonProps extends BaseButtonProps {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
  children?: ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: 'bg-gradient-spark text-void border border-spark/20 hover:shadow-glow-spark',
  secondary: 'bg-transparent text-spark border-2 border-spark hover:bg-spark hover:text-void',
  ghost: 'bg-transparent text-mist hover:bg-smoke hover:text-spark',
  danger: 'bg-blood text-mist hover:shadow-glow-blood',
  success: 'bg-phosphor text-void hover:shadow-glow-phosphor',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm rounded-md',
  md: 'h-11 px-5 text-base rounded-lg',
  lg: 'h-14 px-8 text-lg rounded-xl',
  xl: 'h-16 px-10 text-xl rounded-2xl',
}

const MotionButton = motion.button

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      type = 'button',
      ...rest
    },
    ref
  ) => {
    const prefersReducedMotion = useReducedMotion()
    const isDisabled = disabled || isLoading

    const { onDrag, ...safeRest } = rest as typeof rest & { onDrag?: unknown }

    return (
      <MotionButton
        ref={ref}
        type={type}
        disabled={isDisabled}
        className={cn(
          'relative inline-flex items-center justify-center gap-2 font-medium tracking-wide',
          'transition-all duration-250 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark',
          'disabled:cursor-not-allowed disabled:opacity-60',
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
        whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        aria-busy={isLoading}
        data-variant={variant}
        data-size={size}
        {...safeRest}
      >
        {isLoading ? (
          <span
            className="inline-flex items-center gap-2"
            role="status"
            aria-live="polite"
            data-testid="button-spinner"
          >
            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            <span className="text-sm">Loading</span>
          </span>
        ) : (
          <>
            {leftIcon ? <span className="flex items-center">{leftIcon}</span> : null}
            <span>{children}</span>
            {rightIcon ? <span className="flex items-center">{rightIcon}</span> : null}
          </>
        )}
      </MotionButton>
    )
  }
)

Button.displayName = 'Button'
