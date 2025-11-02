/**
 * Component Examples for Storybook
 * 
 * These are production-ready React components following the design system
 * specifications defined in /styleboard/MOODBOARD.md and COMPONENT-VARIANTS.md
 */

import React from 'react'
import { CheckIcon, XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline'

// ============================================================================
// BUTTON COMPONENTS
// ============================================================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  children, 
  className = '',
  ...props 
}: ButtonProps) {
  const baseClasses = 'rounded-md font-semibold transition-all duration-180 ease-soft-out active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'bg-brand text-white hover:brightness-110 hover:shadow-glow-brand',
    secondary: 'bg-surface text-text-primary border border-border-accent/20 hover:border-accent hover:shadow-glow-accent',
    ghost: 'bg-transparent text-text-secondary border border-border hover:bg-surface-hover hover:text-text-primary'
  }
  
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

// ============================================================================
// CARD COMPONENTS
// ============================================================================

interface CardProps {
  children: React.ReactNode
  interactive?: boolean
  selected?: boolean
  className?: string
  onClick?: () => void
}

export function Card({ children, interactive = false, selected = false, className = '', onClick }: CardProps) {
  const baseClasses = 'bg-surface rounded-lg border shadow-card-subtle p-6 backdrop-blur-sm transition-all duration-220 ease-soft-out'
  const interactiveClasses = interactive 
    ? 'cursor-pointer hover:border-accent/30 hover:shadow-glow-accent hover:-translate-y-0.5' 
    : ''
  const selectedClasses = selected 
    ? 'border-accent bg-accent/5 shadow-glow-accent' 
    : 'border-border'
  
  return (
    <div
      className={`${baseClasses} ${interactiveClasses} ${selectedClasses} ${className}`}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {children}
    </div>
  )
}

// ============================================================================
// FORM COMPONENTS
// ============================================================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export function Input({ label, error, icon, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full px-4 py-3 rounded-md
            bg-surface border text-text-primary placeholder:text-text-tertiary
            font-mono text-sm
            transition-all duration-180 ease-soft-out
            focus:outline-none focus:border-accent focus:shadow-glow-accent
            disabled:opacity-50 disabled:cursor-not-allowed
            ${error ? 'border-bear' : 'border-border'}
            ${icon ? 'pl-10' : ''}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="mt-2 text-sm text-bear flex items-center gap-1">
          <ExclamationTriangleIcon className="w-4 h-4" />
          {error}
        </p>
      )}
    </div>
  )
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  options: Array<{ value: string; label: string }>
}

export function Select({ label, options, className = '', ...props }: SelectProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-text-primary mb-2">
          {label}
        </label>
      )}
      <select
        className={`
          w-full px-4 py-3 rounded-md
          bg-surface border border-border text-text-primary
          font-mono text-sm
          transition-all duration-180 ease-soft-out
          focus:outline-none focus:border-accent focus:shadow-glow-accent
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label: string
}

export function Checkbox({ label, className = '', ...props }: CheckboxProps) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input
        type="checkbox"
        className={`
          w-5 h-5 rounded border-border
          checked:bg-accent checked:border-accent
          focus:ring-2 focus:ring-accent/50
          transition-all duration-180
          ${className}
        `}
        {...props}
      />
      <span className="text-sm text-text-primary">{label}</span>
    </label>
  )
}

interface ToggleProps {
  enabled: boolean
  onChange: (enabled: boolean) => void
  label?: string
}

export function Toggle({ enabled, onChange, label }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`
        relative inline-flex h-6 w-11 items-center rounded-full
        transition-all duration-180 ease-soft-out
        focus:outline-none focus:ring-2 focus:ring-accent/50
        ${enabled ? 'bg-accent shadow-glow-accent' : 'bg-border'}
      `}
      role="switch"
      aria-checked={enabled}
      aria-label={label}
    >
      <span
        className={`
          inline-block h-4 w-4 transform rounded-full bg-white
          transition-transform duration-180 ease-soft-out
          ${enabled ? 'translate-x-6' : 'translate-x-1'}
        `}
      />
    </button>
  )
}

// ============================================================================
// STATE COMPONENTS
// ============================================================================

export function LoadingSkeleton({ rows = 3, className = '' }: { rows?: number; className?: string }) {
  return (
    <div className={`space-y-4 animate-pulse ${className}`} role="status" aria-label="Loading">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="space-y-3">
          <div className="h-4 bg-surface rounded w-3/4 skeleton" />
          <div className="h-4 bg-surface rounded w-1/2 skeleton" />
        </div>
      ))}
    </div>
  )
}

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      {icon && <div className="mb-4 text-text-tertiary">{icon}</div>}
      <h3 className="text-lg font-semibold text-text-primary mb-2">{title}</h3>
      {description && <p className="text-text-secondary mb-6 max-w-md">{description}</p>}
      {action && <div>{action}</div>}
    </div>
  )
}

interface ErrorStateProps {
  title: string
  message: string
  onRetry?: () => void
}

export function ErrorState({ title, message, onRetry }: ErrorStateProps) {
  return (
    <div className="rounded-xl border border-bear bg-bear/10 p-6">
      <div className="flex items-start gap-3">
        <ExclamationTriangleIcon className="w-6 h-6 text-bear flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-bear mb-2">{title}</h3>
          <p className="text-sm text-text-secondary mb-4">{message}</p>
          {onRetry && (
            <Button variant="secondary" size="sm" onClick={onRetry}>
              Retry
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================================
// BADGE COMPONENT
// ============================================================================

interface BadgeProps {
  children: React.ReactNode
  variant?: 'success' | 'warning' | 'error' | 'info' | 'neutral'
  size?: 'sm' | 'md'
}

export function Badge({ children, variant = 'neutral', size = 'sm' }: BadgeProps) {
  const variantClasses = {
    success: 'bg-bull/20 text-bull',
    warning: 'bg-brand/20 text-brand',
    error: 'bg-bear/20 text-bear',
    info: 'bg-cyan/20 text-cyan',
    neutral: 'bg-border text-text-secondary'
  }
  
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm'
  }
  
  return (
    <span className={`inline-flex items-center rounded font-semibold ${variantClasses[variant]} ${sizeClasses[size]}`}>
      {children}
    </span>
  )
}

// ============================================================================
// MODAL COMPONENT
// ============================================================================

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  footer?: React.ReactNode
}

export function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  if (!isOpen) return null
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div 
        className="bg-surface rounded-2xl border border-border-accent shadow-2xl max-w-lg w-full animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 id="modal-title" className="text-xl font-semibold text-text-primary">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-primary transition-colors"
            aria-label="Close modal"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6">
          {children}
        </div>
        
        {/* Footer */}
        {footer && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-border">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================================
// KPI CARD COMPONENT (Domain-Specific)
// ============================================================================

interface KpiCardProps {
  label: string
  value: string | number
  tone?: 'positive' | 'negative' | 'neutral'
  change?: string
  icon?: React.ReactNode
}

export function KpiCard({ label, value, tone = 'neutral', change, icon }: KpiCardProps) {
  const toneClasses = {
    positive: 'text-bull',
    negative: 'text-bear',
    neutral: 'text-text-primary'
  }
  
  return (
    <Card className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs text-text-tertiary">{label}</div>
        {icon && <div className="text-text-tertiary">{icon}</div>}
      </div>
      <div className={`text-2xl font-bold font-mono ${toneClasses[tone]}`}>
        {value}
      </div>
      {change && (
        <div className={`text-sm font-medium ${toneClasses[tone]}`}>
          {change}
        </div>
      )}
    </Card>
  )
}

// ============================================================================
// EXAMPLE USAGE & STORIES
// ============================================================================

export const ComponentExamples = {
  // Button examples
  ButtonPrimary: () => <Button variant="primary">Analyze Chart Now</Button>,
  ButtonSecondary: () => <Button variant="secondary">Export JSON</Button>,
  ButtonGhost: () => <Button variant="ghost">Copy Link</Button>,
  ButtonDisabled: () => <Button disabled>Loading...</Button>,
  
  // Card examples
  CardDefault: () => (
    <Card>
      <h3 className="text-lg font-semibold text-text-primary mb-2">Default Card</h3>
      <p className="text-sm text-text-secondary">This is a basic card component.</p>
    </Card>
  ),
  CardInteractive: () => (
    <Card interactive onClick={() => alert('Card clicked!')}>
      <h3 className="text-lg font-semibold text-text-primary mb-2">Interactive Card</h3>
      <p className="text-sm text-text-secondary">Hover to see the effect.</p>
    </Card>
  ),
  CardSelected: () => (
    <Card selected>
      <h3 className="text-lg font-semibold text-text-primary mb-2">Selected Card</h3>
      <p className="text-sm text-text-secondary">This card is in a selected state.</p>
    </Card>
  ),
  
  // Form examples
  InputText: () => <Input label="Contract Address" placeholder="0x1234...abcd" />,
  InputWithError: () => <Input label="Token Address" error="Invalid address format" />,
  SelectDropdown: () => (
    <Select
      label="Timeframe"
      options={[
        { value: '1m', label: '1 minute' },
        { value: '5m', label: '5 minutes' },
        { value: '15m', label: '15 minutes' },
        { value: '1h', label: '1 hour' },
        { value: '4h', label: '4 hours' },
        { value: '1d', label: '1 day' }
      ]}
    />
  ),
  CheckboxExample: () => <Checkbox label="Enable notifications" />,
  ToggleExample: () => {
    const [enabled, setEnabled] = React.useState(false)
    return <Toggle enabled={enabled} onChange={setEnabled} label="Dark mode" />
  },
  
  // State examples
  LoadingSkeletonExample: () => <LoadingSkeleton rows={3} />,
  EmptyStateExample: () => (
    <EmptyState
      icon={<div className="text-6xl">📊</div>}
      title="No Data Available"
      description="Enter a contract address and click 'Analyze' to start technical analysis"
      action={<Button variant="primary">Get Started</Button>}
    />
  ),
  ErrorStateExample: () => (
    <ErrorState
      title="Failed to Load Data"
      message="Could not fetch OHLC data from Dexscreener API. Please retry."
      onRetry={() => alert('Retrying...')}
    />
  ),
  
  // Badge examples
  BadgeSuccess: () => <Badge variant="success">Active</Badge>,
  BadgeWarning: () => <Badge variant="warning">Pending</Badge>,
  BadgeError: () => <Badge variant="error">Failed</Badge>,
  BadgeInfo: () => <Badge variant="info">Beta</Badge>,
  
  // KPI Card example
  KpiCardExample: () => (
    <KpiCard
      label="Close (last)"
      value="0.000123"
      tone="positive"
      change="+12.5%"
    />
  )
}
