import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  hint?: string; // Backward compatibility alias for helperText
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  mono?: boolean; // For CA/Number inputs
  errorId?: string; // For aria-describedby
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  hint, // Backward compatibility
  leftIcon,
  rightIcon,
  mono = false,
  errorId,
  className = '',
  ...props
}, ref) => {
  const generatedErrorId = errorId || `error-${Math.random().toString(36).substr(2, 9)}`;
  const helperTextValue = helperText || hint;
  
  const baseStyles = 'w-full bg-zinc-800 border text-zinc-100 placeholder-zinc-500 transition-all focus:outline-none focus:ring-2 rounded-lg touch-manipulation';
  const stateStyles = error
    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/50'
    : 'border-zinc-700 focus:border-blue-500 focus:ring-blue-500/50';
  // Touch-optimized: h-12 = 48px (exceeds iOS HIG 44px minimum)
  const sizeStyles = 'px-4 py-3 text-sm h-12';
  const fontClass = mono ? 'font-mono tabular-nums' : '';
  const iconPadding = leftIcon ? 'pl-11' : rightIcon ? 'pr-11' : '';
  
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-zinc-300 mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 flex items-center">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          aria-invalid={!!error}
          aria-describedby={error ? generatedErrorId : undefined}
          className={`${baseStyles} ${stateStyles} ${sizeStyles} ${fontClass} ${iconPadding} ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 flex items-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p id={generatedErrorId} className="mt-1 text-xs text-red-500 flex items-center gap-1" role="alert">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          {error}
        </p>
      )}
      {helperTextValue && !error && (
        <p className="mt-1 text-xs text-zinc-400">{helperTextValue}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
