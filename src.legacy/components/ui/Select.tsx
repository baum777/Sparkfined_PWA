/**
 * Select - Migrated to Design System
 *
 * Uses Design System tokens for colors, borders, and spacing
 */
import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Check } from '@/lib/icons';
import { cn } from '@/lib/ui/cn';

interface SelectOption {
  value: string;
  label: string;
}

type SelectTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  'data-testid'?: string;
};

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  triggerProps?: SelectTriggerProps;
}

/**
 * Select component for simple option lists.
 *
 * ```tsx
 * <Select
 *   value={range}
 *   onChange={setRange}
 *   options={[
 *     { value: '24h', label: 'Last 24h' },
 *     { value: '7d', label: 'Last 7 days' },
 *   ]}
 * />
 * ```
 */
export default function Select({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  disabled = false,
  error,
  triggerProps,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(opt => opt.value === value);
  const { className: triggerClassName, ...restTriggerProps } = triggerProps ?? {};
  
  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen]);
  
  return (
    <div ref={containerRef} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'input flex items-center justify-between', // Design System input class
          isOpen && 'border-brand ring-2 ring-brand/20',
          error && 'border-danger',
          disabled && 'cursor-not-allowed opacity-60',
          triggerClassName
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        {...restTriggerProps}
      >
        <span className={selectedOption ? 'text-text-primary' : 'text-text-tertiary'}>
          {selectedOption?.label || placeholder}
        </span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      
      {isOpen && (
        <div
          className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-xl border border-border bg-surface elevation-medium scrollbar-custom"
          role="listbox"
        >
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setIsOpen(false);
              }}
              className={cn(
                'w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors',
                option.value === value 
                  ? 'bg-brand/10 text-brand' 
                  : 'text-text-primary hover:bg-interactive-hover'
              )}
              role="option"
              aria-selected={option.value === value}
            >
              {option.label}
              {option.value === value && <Check size={16} />}
            </button>
          ))}
        </div>
      )}
      
      {error && (
        <p className="mt-1 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
