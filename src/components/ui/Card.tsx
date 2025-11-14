import React from 'react';

export type CardVariant = 'default' | 'elevated' | 'glass';

interface CardProps {
  variant?: CardVariant;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-zinc-900 border border-zinc-800 rounded-xl p-4 md:p-6 shadow-lg',
  elevated: 'bg-zinc-900 border border-zinc-800 rounded-xl p-4 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all duration-200 shadow-lg cursor-pointer',
  glass: 'bg-zinc-900/80 backdrop-blur-md border border-zinc-700 rounded-xl p-4 shadow-2xl',
};

export function Card({
  variant = 'default',
  className = '',
  children,
  onClick,
}: CardProps) {
  const baseStyles = variantStyles[variant];

  return (
    <div
      className={`${baseStyles} ${className}`.trim()}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      } : undefined}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
}

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3 className={`text-lg font-medium text-zinc-100 ${className}`}>
      {children}
    </h3>
  );
}

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={className}>
      {children}
    </div>
  );
}

// Default export for backward compatibility
export default Card;
