import React, { useState } from 'react';

interface CollapsibleProps {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  variant?: 'default' | 'card' | 'minimal';
  className?: string;
}

export function Collapsible({ 
  title, 
  children, 
  defaultOpen = false,
  variant = 'default',
  className = '' 
}: CollapsibleProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  const variantStyles = {
    default: 'border border-border rounded-xl bg-surface',
    card: 'card-elevated rounded-2xl',
    minimal: 'border-b border-border-subtle',
  };

  return (
    <div className={`${variantStyles[variant]} ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`
          w-full flex items-center justify-between gap-4
          ${variant === 'minimal' ? 'py-3' : 'p-4'}
          text-left transition-colors
          hover:bg-surface-hover/50
          ${variant === 'default' || variant === 'card' ? 'rounded-t-xl' : ''}
        `}
        aria-expanded={isOpen}
      >
        <span className="text-sm font-semibold text-text-primary flex-1">
          {title}
        </span>
        <svg
          className={`w-5 h-5 text-text-secondary transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className={`
          overflow-hidden transition-all duration-300 ease-in-out
          ${isOpen ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <div className={variant === 'minimal' ? 'pb-3' : 'p-4 pt-0'}>
          {children}
        </div>
      </div>
    </div>
  );
}

// Show More/Less Component
export function ShowMore({ 
  children, 
  maxHeight = 200,
  buttonText = { show: 'Show more', hide: 'Show less' }
}: { 
  children: React.ReactNode;
  maxHeight?: number;
  buttonText?: { show: string; hide: string };
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (contentRef.current) {
      setNeedsExpansion(contentRef.current.scrollHeight > maxHeight);
    }
  }, [maxHeight]);

  return (
    <div className="space-y-3">
      <div
        ref={contentRef}
        className={`overflow-hidden transition-all duration-300 ${
          isExpanded ? '' : 'relative'
        }`}
        style={{ maxHeight: isExpanded ? 'none' : `${maxHeight}px` }}
      >
        {children}
        {/* Fade overlay */}
        {!isExpanded && needsExpansion && (
          <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-surface to-transparent pointer-events-none" />
        )}
      </div>

      {needsExpansion && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-sm font-medium text-brand hover:text-brand-hover transition-colors flex items-center gap-1"
        >
          {isExpanded ? buttonText.hide : buttonText.show}
          <svg
            className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      )}
    </div>
  );
}

// Accordion (Multiple Collapsibles)
export function Accordion({ 
  items,
  allowMultiple = false,
  variant = 'default'
}: {
  items: Array<{ title: React.ReactNode; content: React.ReactNode; id: string }>;
  allowMultiple?: boolean;
  variant?: 'default' | 'card' | 'minimal';
}) {
  const [openItems, setOpenItems] = useState<string[]>([]);

  const toggleItem = (id: string) => {
    if (allowMultiple) {
      setOpenItems((prev) =>
        prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
      );
    } else {
      setOpenItems((prev) => (prev.includes(id) ? [] : [id]));
    }
  };

  return (
    <div className={`space-y-${variant === 'minimal' ? '0' : '3'}`}>
      {items.map((item) => {
        const isOpen = openItems.includes(item.id);
        
        return (
          <Collapsible
            key={item.id}
            title={item.title}
            defaultOpen={isOpen}
            variant={variant}
          >
            {item.content}
          </Collapsible>
        );
      })}
    </div>
  );
}

// Expandable Text (for long descriptions)
export function ExpandableText({ 
  text, 
  maxLines = 3 
}: { 
  text: string; 
  maxLines?: number; 
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [needsExpansion, setNeedsExpansion] = useState(false);
  const textRef = React.useRef<HTMLParagraphElement>(null);

  React.useEffect(() => {
    if (textRef.current) {
      const lineHeight = parseInt(window.getComputedStyle(textRef.current).lineHeight);
      const maxHeight = lineHeight * maxLines;
      setNeedsExpansion(textRef.current.scrollHeight > maxHeight);
    }
  }, [maxLines, text]);

  return (
    <div className="space-y-2">
      <p
        ref={textRef}
        className={`text-sm text-text-secondary leading-relaxed ${
          !isExpanded ? 'line-clamp-' + maxLines : ''
        }`}
      >
        {text}
      </p>
      {needsExpansion && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-semibold text-brand hover:text-brand-hover transition-colors"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
}
