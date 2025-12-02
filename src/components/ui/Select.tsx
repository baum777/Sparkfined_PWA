import React, { useState, useRef, useEffect } from 'react';

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

import { ChevronDown, ChevronUp, Check } from '@/lib/icons';

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
        className={`flex h-11 w-full items-center justify-between rounded-token-lg border bg-zinc-900 px-3 py-2.5 text-sm transition-all duration-150 ease-out ${
          isOpen ? 'border-emerald-500 ring-1 ring-emerald-500/50' : error ? 'border-rose-500' : 'border-zinc-700'
        } ${disabled ? 'cursor-not-allowed opacity-60' : ''} ${triggerClassName ?? ''}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        {...restTriggerProps}
      >
        <span className={selectedOption ? 'text-zinc-100' : 'text-zinc-500'}>
          {selectedOption?.label || placeholder}
        </span>
        {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
      </button>
      
      {isOpen && (
        <div
          className="absolute z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-token-md border border-zinc-700 bg-zinc-900 shadow-token-md"
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
              className={`w-full flex items-center justify-between px-3 py-2 text-sm text-left transition-colors ${
                option.value === value 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : 'text-zinc-100 hover:bg-zinc-800'
              }`}
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
        <p className="mt-1 text-xs text-rose-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
