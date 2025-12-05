import { motion } from 'framer-motion'
import React from 'react'
import { cn } from '@/design-system/utils/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success'
export type ButtonSize = 'sm' | 'md' | 'lg' | 'xl'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant
  size?: ButtonSize
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-spark text-void shadow-glow-spark hover:shadow-glow-spark focus-visible:ring-spark',
  secondary:
    'bg-transparent border border-spark text-spark hover:bg-spark/10 hover:text-spark focus-visible:ring-spark/60',
  ghost: 'bg-transparent text-mist hover:bg-smoke hover:text-spark focus-visible:ring-spark/50',
  danger:
    'bg-blood text-mist shadow-glow-blood hover:bg-blood/90 focus-visible:ring-blood/60',
  success:
    'bg-phosphor text-void shadow-glow-phosphor hover:bg-phosphor/90 focus-visible:ring-phosphor/60',
}

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'h-9 px-3 text-xs rounded-lg',
  md: 'h-11 px-4 text-sm rounded-lg',
  lg: 'h-12 px-6 text-base rounded-xl',
  xl: 'h-14 px-8 text-lg rounded-2xl',
}

const Spinner = () => (
  <span
    role="status"
    aria-live="polite"
    className="inline-flex h-4 w-4 animate-spin rounded-full border-2 border-mist/30 border-t-transparent"
  />
)

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    isLoading = false,
    leftIcon,
    rightIcon,
    className,
    disabled,
    type = 'button',
    children,
    ...props
  },
  ref
) {
  const isDisabled = disabled || isLoading

  return (
    <motion.button
      ref={ref}
      type={type}
      whileHover={{ scale: isDisabled ? 1 : 1.03 }}
      whileTap={{ scale: isDisabled ? 1 : 0.97 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      disabled={isDisabled}
      aria-busy={isLoading}
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium tracking-wide text-mist transition-all duration-250 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-void disabled:cursor-not-allowed disabled:opacity-60',
        variantStyles[variant],
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {isLoading ? (
        <div className="flex items-center gap-2">
          <Spinner />
          <span>{children}</span>
        </div>
      ) : (
        <>
          {leftIcon ? <span className="flex-shrink-0">{leftIcon}</span> : null}
          <span className="inline-flex items-center">{children}</span>
          {rightIcon ? <span className="flex-shrink-0">{rightIcon}</span> : null}
        </>
      )}
    </motion.button>
  )
})

Button.displayName = 'DesignSystemButton'
