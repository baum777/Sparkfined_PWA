import React from 'react';

export type CardVariant = 'default' | 'elevated' | 'glass';

interface CardProps {
  variant?: CardVariant;
  className?: string;
  children: React.ReactNode;
  onClick?: () => void;
}

const variantStyles: Record<CardVariant, string> = {
  default: `
    bg-zinc-900 border border-neutral-800 rounded-xl 
    p-4 md:p-6 shadow-lg
  `,
  elevated: `
    bg-zinc-900 border border-neutral-800 rounded-xl 
    p-4 hover:border-neutral-700 hover:bg-zinc-800/50
    transition-all duration-200 shadow-lg cursor-pointer
  `,
  glass: `
    bg-zinc-900/80 backdrop-blur-md border border-neutral-700 
    rounded-xl p-4 shadow-2xl
  `,
};

export const Card: React.FC<CardProps> = ({
  variant = 'default',
  className = '',
  children,
  onClick,
}) => {
  const baseStyles = variantStyles[variant];

  return (
    <div
      className={`${baseStyles} ${className}`.trim().replace(/\s+/g, ' ')}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className = '' }) => {
  return (
    <div className={`mb-4 ${className}`}>
      {children}
    </div>
  );
};

interface CardTitleProps {
  children: React.ReactNode;
  className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className = '' }) => {
  return (
    <h3 className={`text-lg font-medium text-neutral-100 ${className}`}>
      {children}
    </h3>
  );
};

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = '' }) => {
  return (
    <div className={className}>
      {children}
    </div>
  );
};
