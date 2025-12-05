import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/design-system/utils'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: ReactNode
  rightIcon?: ReactNode
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-spark text-void shadow-glow-spark border border-spark/40 hover:shadow-glow-spark',
  secondary:
    'bg-transparent text-spark border-2 border-spark hover:bg-spark/10 focus-visible:ring-spark/40',
  ghost:
    'bg-transparent text-mist hover:bg-void-lightest hover:text-spark border border-transparent',
  danger: 'bg-blood text-mist border border-blood shadow-glow-blood hover:bg-blood/90',
  success: 'bg-phosphor text-void border border-phosphor shadow-glow-phosphor hover:bg-phosphor/90',
}

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-sm rounded-md',
  md: 'h-11 px-5 text-base rounded-lg',
  lg: 'h-14 px-8 text-lg rounded-xl',
  xl: 'h-16 px-10 text-xl rounded-2xl',
}

const Spinner = () => (
  <svg
    className="h-4 w-4 animate-spin text-current"
    viewBox="0 0 24 24"
    role="status"
    aria-label="Loading"
  >
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path
      className="opacity-75"
      fill="currentColor"
      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
    />
  </svg>
)

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', size = 'md', isLoading = false, leftIcon, rightIcon, disabled, children, ...props },
  ref
) {
  const prefersReducedMotion = useReducedMotion()
  const isDisabled = disabled || isLoading

  return (
    <motion.button
      ref={ref}
      data-variant={variant}
      data-size={size}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium tracking-wide transition-all',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-void focus-visible:ring-spark',
        'disabled:cursor-not-allowed disabled:opacity-50',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={isDisabled}
      whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
      whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
      transition={prefersReducedMotion ? undefined : { duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <Spinner />
          <span className="text-sm uppercase tracking-wider">Loading</span>
        </span>
      ) : (
        <>
          {leftIcon ? <span className="flex-shrink-0">{leftIcon}</span> : null}
          <span>{children}</span>
          {rightIcon ? <span className="flex-shrink-0">{rightIcon}</span> : null}
        </>
      )}
    </motion.button>
  )
})

Button.displayName = 'Button'
