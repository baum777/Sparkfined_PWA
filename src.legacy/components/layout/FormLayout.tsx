/**
 * FormLayout - Reusable Form Components for Drawers
 *
 * Provides consistent form structure for Drawer-based editors:
 * - FormSection: Grouped form fields with title/description
 * - FormField: Label + Input wrapper with consistent spacing
 * - FormActions: Footer with Cancel/Save buttons
 *
 * Usage:
 * ```tsx
 * <Drawer isOpen={isOpen} onClose={handleClose} title="New Alert">
 *   <FormSection title="Market Selection" description="Select the asset and timeframe">
 *     <FormField label="Symbol" htmlFor="symbol">
 *       <Input id="symbol" placeholder="BTCUSDT" />
 *     </FormField>
 *     <FormField label="Timeframe" htmlFor="timeframe">
 *       <Select options={timeframes} />
 *     </FormField>
 *   </FormSection>
 *   <FormActions>
 *     <Button variant="secondary" onClick={handleClose}>Cancel</Button>
 *     <Button variant="primary" onClick={handleSave}>Create Alert</Button>
 *   </FormActions>
 * </Drawer>
 * ```
 */

import React from 'react';
import { cn } from '@/lib/ui/cn';

/** FormSection - Grouped form fields with title/description */
export interface FormSectionProps {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({ title, description, children, className }: FormSectionProps) {
  return (
    <section className={cn('space-y-4', className)}>
      {(title || description) && (
        <div className="mb-5">
          {title && <h3 className="text-sm font-semibold text-text-primary">{title}</h3>}
          {description && <p className="mt-1 text-xs text-text-secondary">{description}</p>}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </section>
  );
}

/** FormField - Label + Input wrapper with consistent spacing */
export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
  className?: string;
  layout?: 'vertical' | 'horizontal';
}

export function FormField({
  label,
  htmlFor,
  required,
  error,
  hint,
  children,
  className,
  layout = 'vertical',
}: FormFieldProps) {
  return (
    <div
      className={cn(
        layout === 'horizontal'
          ? 'grid grid-cols-[140px_1fr] items-start gap-4'
          : 'flex flex-col gap-2',
        className
      )}
    >
      <label
        htmlFor={htmlFor}
        className={cn(
          'text-sm font-medium text-text-secondary',
          layout === 'horizontal' && 'pt-2'
        )}
      >
        {label}
        {required && <span className="ml-1 text-danger">*</span>}
      </label>
      <div className="flex-1">
        {children}
        {hint && !error && <p className="mt-1 text-xs text-text-tertiary">{hint}</p>}
        {error && <p className="mt-1 text-xs text-danger">{error}</p>}
      </div>
    </div>
  );
}

/** FormActions - Footer with Cancel/Save buttons */
export interface FormActionsProps {
  children: React.ReactNode;
  className?: string;
  sticky?: boolean;
}

export function FormActions({ children, className, sticky = false }: FormActionsProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-end gap-3 border-t border-border bg-surface-elevated px-6 py-4',
        sticky && 'sticky bottom-0',
        className
      )}
    >
      {children}
    </div>
  );
}

/** FormDivider - Visual separator between sections */
export function FormDivider() {
  return <div className="my-6 border-t border-border" />;
}

export default FormSection;
