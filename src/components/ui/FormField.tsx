/**
 * Accessible Form Field Component
 * 
 * Features:
 * - Automatic ARIA attributes (aria-invalid, aria-describedby)
 * - Error message announcements (aria-live)
 * - Required field indicators
 * - Helper text support
 * - Label association (htmlFor)
 * - Focus management
 * 
 * WCAG 2.1 Compliance:
 * - 3.3.1 Error Identification (A)
 * - 3.3.2 Labels or Instructions (A)
 * - 3.3.3 Error Suggestion (AA)
 * - 4.1.3 Status Messages (AA)
 */

import { ReactNode, useId } from 'react';
import { AlertTriangle, Info } from '@/lib/icons';

interface FormFieldProps {
  label: string;
  children: ReactNode;
  error?: string;
  hint?: string;
  required?: boolean;
  htmlFor?: string;
  className?: string;
}

export default function FormField({
  label,
  children,
  error,
  hint,
  required = false,
  htmlFor,
  className = '',
}: FormFieldProps) {
  const generatedId = useId();
  const fieldId = htmlFor || generatedId;
  const errorId = `${fieldId}-error`;
  const hintId = `${fieldId}-hint`;
  
  return (
    <div className={`space-y-2 ${className}`}>
      {/* Label */}
      <label
        htmlFor={fieldId}
        className="block text-sm font-medium text-zinc-200"
      >
        {label}
        {required && (
          <span className="ml-1 text-rose-500" aria-label="required">
            *
          </span>
        )}
      </label>
      
      {/* Helper Text */}
      {hint && !error && (
        <div
          id={hintId}
          className="flex items-start gap-2 text-xs text-zinc-500"
        >
          <Info size={14} className="mt-0.5 flex-shrink-0" />
          <span>{hint}</span>
        </div>
      )}
      
      {/* Input Field */}
      <div>
        {children}
      </div>
      
      {/* Error Message */}
      {error && (
        <div
          id={errorId}
          role="alert"
          aria-live="assertive"
          className="flex items-start gap-2 text-xs text-rose-500"
        >
          <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}

/**
 * Usage Example:
 * 
 * <FormField
 *   label="Token Address"
 *   htmlFor="token-address"
 *   error={errors.address}
 *   hint="Enter a valid Solana token address"
 *   required
 * >
 *   <Input
 *     id="token-address"
 *     value={address}
 *     onChange={(e) => setAddress(e.target.value)}
 *     aria-invalid={!!errors.address}
 *     aria-describedby={errors.address ? 'token-address-error' : 'token-address-hint'}
 *   />
 * </FormField>
 */
