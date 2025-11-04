import React, { useState, useRef, useEffect } from 'react';

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
}

// Import icons dynamically when lucide-react is installed
// For now, using simple SVG icons
const ChevronDownIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

const ChevronUpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="18 15 12 9 6 15"></polyline>
  </svg>
);

const CheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export default function Select({
  options,
  value,
  onChange,
  placeholder = 'Select…',
  disabled = false,
  error,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const selectedOption = options.find(opt => opt.value === value);
  
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
        className={`w-full flex items-center justify-between px-3 py-2.5 text-sm h-11 bg-zinc-900 border transition-all ${
          isOpen ? 'border-emerald-500 ring-1 ring-emerald-500/50' : error ? 'border-rose-500' : 'border-zinc-700'
        } ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
        style={{
          borderRadius: 'var(--radius-lg)',
        }}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <span className={selectedOption ? 'text-zinc-100' : 'text-zinc-500'}>
          {selectedOption?.label || placeholder}
        </span>
        {isOpen ? <ChevronUpIcon /> : <ChevronDownIcon />}
      </button>
      
      {isOpen && (
        <div
          className="absolute z-50 w-full mt-1 bg-zinc-900 border border-zinc-700 max-h-60 overflow-y-auto"
          style={{
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-md)',
          }}
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
              {option.value === value && <CheckIcon />}
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
