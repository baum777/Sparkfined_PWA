/**
 * Textarea - Migrated to Design System
 *
 * Uses Design System tokens for colors, borders, and spacing
 */
import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/ui/cn';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  hint?: string;
  autoResize?: boolean;
  errorId?: string;
}

/**
 * Textarea with optional auto-resize and consistent focus styling.
 *
 * ```tsx
 * <Textarea
 *   placeholder="Leave a note"
 *   hint="Markdown supported"
 *   error={errorMessage}
 * />
 * ```
 */
export default function Textarea({
  error,
  hint,
  autoResize = true,
  errorId,
  className = '',
  ...props
}: TextareaProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const generatedErrorId = errorId || `error-${Math.random().toString(36).substr(2, 9)}`;
  
  // Auto-resize logic
  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const handleResize = () => {
        const textarea = textareaRef.current;
        if (textarea) {
          textarea.style.height = 'auto';
          textarea.style.height = `${Math.min(textarea.scrollHeight, 400)}px`; // max-height 400px
        }
      };
      
      const textarea = textareaRef.current;
      textarea.addEventListener('input', handleResize);
      handleResize(); // Initial resize
      
      return () => textarea.removeEventListener('input', handleResize);
    }
  }, [autoResize]);
  
  return (
    <div className="w-full">
      <textarea
        ref={textareaRef}
        aria-invalid={!!error}
        aria-describedby={error ? generatedErrorId : undefined}
        className={cn(
          'input min-h-[88px] resize-none max-h-[400px] overflow-y-auto scrollbar-custom', // Design System input class + textarea specific
          error && 'border-danger focus:ring-danger/40',
          className
        )}
        {...props}
      />
      {error && (
        <p id={generatedErrorId} className="mt-1 text-xs text-danger" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="mt-1 text-xs text-text-tertiary">{hint}</p>
      )}
    </div>
  );
}
