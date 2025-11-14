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
  
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-900 disabled:opacity-50 disabled:pointer-events-none rounded-lg';
  
  const variants: Record<string, string> = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600 active:scale-95',
    secondary: 'bg-zinc-800 text-zinc-100 border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 active:scale-95',
    ghost: 'bg-transparent text-zinc-300 hover:bg-zinc-800/50 hover:text-zinc-100 active:scale-95',
    destructive: 'bg-red-500/10 text-red-500 border border-red-500/30 hover:bg-red-500/20 active:scale-95',
    danger: 'bg-rose-500 text-white hover:bg-rose-600 active:scale-95', // Keep for backward compatibility
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs h-9',
    md: 'px-4 py-2 text-sm h-11',
    lg: 'px-6 py-3 text-base h-12',
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
