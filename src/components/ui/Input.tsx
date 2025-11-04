import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  hint?: string;
  mono?: boolean; // For CA/Number inputs
  errorId?: string; // For aria-describedby
}

export default function Input({
  error,
  hint,
  mono = false,
  errorId,
  className = '',
  ...props
}: InputProps) {
  const generatedErrorId = errorId || `error-${Math.random().toString(36).substr(2, 9)}`;
  
  const baseStyles = 'w-full bg-zinc-900 border text-zinc-100 placeholder-zinc-500 transition-all focus:outline-none focus:ring-1';
  const stateStyles = error 
    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/50' 
    : 'border-zinc-700 focus:border-emerald-500 focus:ring-emerald-500/50';
  const sizeStyles = 'px-3 py-2.5 text-sm h-11'; // 44px mobile, 40px desktop
  const fontClass = mono ? 'font-mono' : '';
  
  return (
    <div className="w-full">
      <input
        aria-invalid={!!error}
        aria-describedby={error ? generatedErrorId : undefined}
        className={`${baseStyles} ${stateStyles} ${sizeStyles} ${fontClass} ${className}`}
        style={{
          borderRadius: 'var(--radius-lg)',
          transition: `all var(--duration-short) var(--ease-in-out)`,
        }}
        {...props}
      />
      {error && (
        <p id={generatedErrorId} className="mt-1 text-xs text-rose-400" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-1 text-xs text-zinc-400">{hint}</p>
      )}
    </div>
  );
}
