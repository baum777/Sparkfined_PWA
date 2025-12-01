import React, { useEffect, useRef } from 'react';

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
  
  const baseStyles =
    'w-full rounded-token-lg border bg-zinc-900 text-zinc-100 placeholder-zinc-500 transition-all duration-150 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-border-focus focus-visible:ring-offset-2 focus-visible:ring-offset-surface resize-none max-h-[400px] overflow-y-auto';
  const stateStyles = error 
    ? 'border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/50'
    : 'border-zinc-700 focus-visible:border-emerald-500 focus-visible:ring-emerald-500/50';
  const sizeStyles = 'px-3 py-2.5 text-sm min-h-[88px]'; // 2 Zeilen minimum
  
  // Auto-resize logic
  useEffect(() => {
    if (autoResize && textareaRef.current) {
      const handleResize = () => {
        const textarea = textareaRef.current;
        if (textarea) {
          textarea.style.height = 'auto';
          textarea.style.height = `${Math.min(textarea.scrollHeight, 400)}px`; // max-height 400px mobile
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
        className={`${baseStyles} ${stateStyles} ${sizeStyles} ${className}`}
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
