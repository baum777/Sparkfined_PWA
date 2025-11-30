import React from 'react';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'destructive';
export type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary: `
    px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white 
    font-medium rounded-lg transition-colors
    focus:outline-none focus:ring-2 focus:ring-blue-500 
    focus:ring-offset-2 focus:ring-offset-zinc-900
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  secondary: `
    px-4 py-2 border border-neutral-700 hover:border-neutral-600 
    text-neutral-300 hover:text-neutral-100 hover:bg-neutral-800
    font-medium rounded-lg transition-colors
    focus:outline-none focus:ring-2 focus:ring-blue-500 
    focus:ring-offset-2 focus:ring-offset-zinc-900
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  ghost: `
    px-3 py-1.5 text-neutral-400 hover:text-neutral-100 
    hover:bg-neutral-800 rounded-md transition-colors
    focus:outline-none focus:ring-2 focus:ring-blue-500 
    focus:ring-offset-2 focus:ring-offset-zinc-900
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
  destructive: `
    px-4 py-2 bg-red-500/10 hover:bg-red-500/20 
    text-red-500 border border-red-500/30 
    font-medium rounded-lg transition-colors
    focus:outline-none focus:ring-2 focus:ring-red-500 
    focus:ring-offset-2 focus:ring-offset-zinc-900
    disabled:opacity-50 disabled:cursor-not-allowed
  `,
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: 'text-xs px-3 py-1.5',
  md: 'text-sm px-4 py-2',
  lg: 'text-base px-6 py-3',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  disabled,
  className = '',
  ...props
}) => {
  const baseStyles = variantStyles[variant];
  const sizeStyle = sizeStyles[size];

  return (
    <button
      className={`
        inline-flex items-center justify-center gap-2
        ${baseStyles} ${sizeStyle} ${className}
      `.trim().replace(/\s+/g, ' ')}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg
          className="animate-spin h-4 w-4"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      ) : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  );
};
