import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

export default function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className = '',
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:opacity-50 disabled:pointer-events-none';
  
  const variants = {
    primary: 'bg-emerald-500 text-white hover:bg-emerald-600 active:scale-95',
    secondary: 'bg-zinc-800 text-zinc-100 border border-zinc-700 hover:bg-zinc-700 active:scale-95',
    ghost: 'bg-transparent text-zinc-300 hover:bg-zinc-800/50 active:scale-95',
    danger: 'bg-rose-500 text-white hover:bg-rose-600 active:scale-95',
  };
  
  const sizes = {
    sm: 'px-3 py-1.5 text-sm h-9',         // 36px mobile, 32px desktop
    md: 'px-4 py-2.5 text-sm h-11',        // 44px mobile, 40px desktop
    lg: 'px-6 py-3 text-base h-12',        // 48px mobile, 44px desktop
  };
  
  return (
    <button
      disabled={disabled || loading}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      style={{
        borderRadius: 'var(--radius-lg)',
        transition: `all var(--duration-short) var(--ease-in-out)`,
      }}
      {...props}
    >
      {loading ? (
        <>
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Lädt…
        </>
      ) : children}
    </button>
  );
}
