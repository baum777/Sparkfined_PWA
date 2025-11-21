import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  loading?: boolean; // Backward compatibility alias
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loading = false, // Backward compatibility
  leftIcon,
  rightIcon,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const isLoadingState = isLoading || loading;
  
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg disabled:opacity-50 disabled:pointer-events-none rounded-lg touch-manipulation';

  const variants: Record<string, string> = {
    primary: 'bg-brand text-text-primary hover:bg-brand-hover active:scale-95',
    secondary: 'bg-surface text-text-primary border border-border hover:bg-surface-hover hover:border-border-hover active:scale-95',
    ghost: 'bg-transparent text-text-secondary hover:bg-interactive-hover hover:text-text-primary active:scale-95',
    destructive: 'bg-danger/10 text-danger border border-danger/30 hover:bg-danger/20 active:scale-95',
    danger: 'bg-danger text-text-primary hover:bg-danger/90 active:scale-95', // Keep for backward compatibility
  };

  // Touch-optimized sizes (iOS HIG: min 44px, Material: min 48px)
  const sizes = {
    sm: 'px-4 py-2 text-sm h-11 min-w-[44px]',  // 44px height (iOS standard)
    md: 'px-5 py-2.5 text-base h-12 min-w-[48px]',  // 48px height (Material standard)
    lg: 'px-6 py-3 text-lg h-14 min-w-[56px]',  // 56px height (comfortable)
  };
  
  return (
    <button
      disabled={disabled || isLoadingState}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {isLoadingState ? (
        <>
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
}
