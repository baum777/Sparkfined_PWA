import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  className?: string;
}

export function Tooltip({ 
  content, 
  children, 
  position = 'top', 
  delay = 300,
  className = '' 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout>();
  const triggerRef = useRef<HTMLElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => {
      if (triggerRef.current) {
        const rect = triggerRef.current.getBoundingClientRect();
        const tooltipHeight = tooltipRef.current?.offsetHeight || 0;
        const tooltipWidth = tooltipRef.current?.offsetWidth || 0;

        let x = 0;
        let y = 0;

        switch (position) {
          case 'top':
            x = rect.left + rect.width / 2 - tooltipWidth / 2;
            y = rect.top - tooltipHeight - 8;
            break;
          case 'bottom':
            x = rect.left + rect.width / 2 - tooltipWidth / 2;
            y = rect.bottom + 8;
            break;
          case 'left':
            x = rect.left - tooltipWidth - 8;
            y = rect.top + rect.height / 2 - tooltipHeight / 2;
            break;
          case 'right':
            x = rect.right + 8;
            y = rect.top + rect.height / 2 - tooltipHeight / 2;
            break;
        }

        setCoords({ x, y });
        setIsVisible(true);
      }
    }, delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const arrowStyles = {
    top: 'bottom-[-4px] left-1/2 -translate-x-1/2 border-t-surface-elevated border-x-transparent border-b-transparent',
    bottom: 'top-[-4px] left-1/2 -translate-x-1/2 border-b-surface-elevated border-x-transparent border-t-transparent',
    left: 'right-[-4px] top-1/2 -translate-y-1/2 border-l-surface-elevated border-y-transparent border-r-transparent',
    right: 'left-[-4px] top-1/2 -translate-y-1/2 border-r-surface-elevated border-y-transparent border-l-transparent',
  };

  return (
    <>
      {React.cloneElement(children, {
        ref: triggerRef,
        onMouseEnter: showTooltip,
        onMouseLeave: hideTooltip,
        onFocus: showTooltip,
        onBlur: hideTooltip,
      })}

      {isVisible && typeof window !== 'undefined' && (
        <div
          ref={tooltipRef}
          role="tooltip"
          className={`
            fixed z-50
            px-3 py-2
            rounded-lg
            bg-surface-elevated
            border border-border-moderate
            shadow-lg
            text-sm text-text-primary
            pointer-events-none
            animate-fade-in
            ${className}
          `}
          style={{
            left: `${coords.x}px`,
            top: `${coords.y}px`,
          }}
        >
          {content}
          {/* Arrow */}
          <div
            className={`
              absolute w-2 h-2
              border-4
              ${arrowStyles[position]}
            `}
          />
        </div>
      )}
    </>
  );
}

// Simplified Tooltip for common use
export function SimpleTooltip({ 
  text, 
  children 
}: { 
  text: string; 
  children: React.ReactElement;
}) {
  return (
    <Tooltip content={<span className="whitespace-nowrap">{text}</span>}>
      {children}
    </Tooltip>
  );
}

// Info Icon with Tooltip
export function InfoTooltip({ content }: { content: React.ReactNode }) {
  return (
    <Tooltip content={content} position="top">
      <button
        className="inline-flex items-center justify-center w-4 h-4 rounded-full border border-border-moderate text-text-tertiary hover:text-text-secondary hover:border-border-hover transition-colors"
        aria-label="More information"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </Tooltip>
  );
}

// Help Icon with Tooltip
export function HelpTooltip({ title, description }: { title: string; description: string }) {
  return (
    <Tooltip
      content={
        <div className="max-w-xs space-y-1">
          <p className="font-semibold text-text-primary">{title}</p>
          <p className="text-xs text-text-secondary leading-relaxed">{description}</p>
        </div>
      }
      position="top"
      delay={200}
    >
      <button
        className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-surface-elevated border border-border-moderate text-text-tertiary hover:text-text-primary hover:border-brand transition-colors"
        aria-label="Help"
      >
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </button>
    </Tooltip>
  );
}
