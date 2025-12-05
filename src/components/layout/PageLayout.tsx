/**
 * PageLayout - Standardized Page Layout Pattern
 *
 * Provides consistent structure for all main pages:
 * - PageHeader: Title, description, meta info, primary actions
 * - Toolbar: Filters, search, sort controls
 * - PageContent: Main content area with consistent spacing
 *
 * Usage:
 * ```tsx
 * <PageLayout>
 *   <PageHeader
 *     title="Alerts"
 *     subtitle="Stay ahead of key levels, momentum shifts and volatility spikes"
 *     meta="5 alerts tracked · 2 triggered"
 *     actions={<Button>New Alert</Button>}
 *   />
 *   <Toolbar
 *     left={<StatusFilter />}
 *     right={<TypeFilter />}
 *   />
 *   <PageContent>
 *     <AlertsList />
 *   </PageContent>
 * </PageLayout>
 * ```
 */

import React from 'react';
import { cn } from '@/lib/ui/cn';

/** PageLayout - Container for entire page */
export interface PageLayoutProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'none' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | '7xl';
}

const maxWidthClasses = {
  none: '',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '6xl': 'max-w-6xl',
  '7xl': 'max-w-7xl',
};

export function PageLayout({ children, className, maxWidth = '6xl' }: PageLayoutProps) {
  return (
    <div className={cn('min-h-screen bg-app-gradient text-text-primary', className)}>
      <div className={cn('mx-auto w-full px-4 sm:px-6 lg:px-8', maxWidthClasses[maxWidth])}>
        {children}
      </div>
    </div>
  );
}

/** PageHeader - Page title, description, meta, and actions */
export interface PageHeaderProps {
  title: string;
  subtitle?: string;
  meta?: string;
  actions?: React.ReactNode;
  tabs?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, subtitle, meta, actions, tabs, className }: PageHeaderProps) {
  return (
    <header
      className={cn('border-b border-border glass-subtle elevation-low py-8', className)}
      data-testid="page-header"
    >
      <div className="flex flex-col gap-6">
        {/* Title & Actions Row */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="flex-1">
            <p className="text-xs uppercase tracking-[0.3em] text-text-tertiary">Sparkfined</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-text-primary md:text-4xl">
              {title}
            </h1>
            {subtitle && <p className="mt-2 max-w-2xl text-sm text-text-secondary">{subtitle}</p>}
            {meta && <p className="mt-2 text-xs text-text-tertiary">{meta}</p>}
          </div>
          {actions && <div className="flex flex-wrap items-center gap-3">{actions}</div>}
        </div>

        {/* Optional Tabs */}
        {tabs && <div className="-mb-2 pb-1">{tabs}</div>}
      </div>
    </header>
  );
}

/** Toolbar - Filters, search, and controls */
export interface ToolbarProps {
  left?: React.ReactNode;
  right?: React.ReactNode;
  search?: React.ReactNode;
  className?: string;
}

export function Toolbar({ left, right, search, className }: ToolbarProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4 border-b border-border bg-surface-subtle/30 px-4 py-4 sm:flex-row sm:items-center sm:justify-between',
        className
      )}
      data-testid="page-toolbar"
    >
      {left && <div className="flex flex-wrap items-center gap-2">{left}</div>}
      {search && <div className="flex-1 sm:mx-4">{search}</div>}
      {right && <div className="flex flex-wrap items-center gap-2">{right}</div>}
    </div>
  );
}

/** PageContent - Main content area */
export interface PageContentProps {
  children: React.ReactNode;
  className?: string;
  spacing?: 'none' | 'sm' | 'md' | 'lg';
}

const spacingClasses = {
  none: '',
  sm: 'py-4',
  md: 'py-6',
  lg: 'py-10',
};

export function PageContent({ children, className, spacing = 'lg' }: PageContentProps) {
  return (
    <section className={cn(spacingClasses[spacing], className)} data-testid="page-content">
      {children}
    </section>
  );
}

/** PageFooter - Optional pagination or meta info */
export interface PageFooterProps {
  children: React.ReactNode;
  className?: string;
}

export function PageFooter({ children, className }: PageFooterProps) {
  return (
    <footer
      className={cn('border-t border-border bg-surface-subtle/30 px-4 py-4', className)}
      data-testid="page-footer"
    >
      {children}
    </footer>
  );
}

export default PageLayout;
