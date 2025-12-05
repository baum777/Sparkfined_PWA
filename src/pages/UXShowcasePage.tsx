import React, { useState } from 'react';
import { Skeleton, SkeletonCard } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState, InlineError, ErrorBanner } from '@/components/ui/ErrorState';
import { useToast } from '@/components/ui/Toast';
import { Tooltip } from '@/design-system';
import { useKeyboardShortcut } from '@/hooks/useKeyboardShortcut';
import { KeyboardShortcutsDialog, defaultShortcuts } from '@/components/ui/KeyboardShortcutsDialog';
import { FormField, ValidatedInput, CharacterCounter } from '@/components/ui/FormField';
import { Collapsible, ShowMore, ExpandableText } from '@/components/ui/Collapsible';
import { useFocusTrap } from '@/hooks/useFocusManagement';
import { ScaleTransition } from '@/components/ui/PageTransition';

export default function UXShowcasePage() {
  const toast = useToast();
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formValue, setFormValue] = useState('');
  const [emailValue, setEmailValue] = useState('');

  // Keyboard shortcuts
  useKeyboardShortcut('?', () => setShowShortcuts(true));
  useKeyboardShortcut('cmd+k', () => toast.info('Command Palette würde sich hier öffnen'));

  return (
    <div className="min-h-screen bg-bg p-6 space-y-12">
      {/* Header */}
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-text-primary mb-2">
              UX Showcase
            </h1>
            <p className="text-text-secondary">
              10 UX-Verbesserungen in Aktion • Drücke <kbd className="px-2 py-1 rounded bg-surface-elevated border border-border-moderate font-mono text-xs">?</kbd> für Shortcuts
            </p>
          </div>
          <button
            onClick={() => window.history.back()}
            className="btn btn-ghost"
          >
            ← Zurück
          </button>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-wrap gap-3 mb-8">
          <button onClick={() => toast.success('Operation successful!')} className="btn btn-sm btn-primary">
            Show Success Toast
          </button>
          <button onClick={() => toast.error('Something went wrong!', 'Error')} className="btn btn-sm btn-danger">
            Show Error Toast
          </button>
          <button onClick={() => toast.warning('Be careful!', 'Warning')} className="btn btn-sm btn-secondary">
            Show Warning Toast
          </button>
          <button onClick={() => setShowModal(true)} className="btn btn-sm btn-outline">
            Open Modal
          </button>
          <button onClick={() => setShowShortcuts(true)} className="btn btn-sm btn-ghost">
            Keyboard Shortcuts
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. Skeleton Loaders */}
        <Section
          title="1. Skeleton Loaders"
          description="Progressive loading states"
        >
          <div className="space-y-4">
            <SkeletonCard />
            <Skeleton variant="text" count={3} />
            <div className="flex gap-4">
              <Skeleton variant="circular" width="3rem" height="3rem" />
              <div className="flex-1 space-y-2">
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="40%" />
              </div>
            </div>
          </div>
        </Section>

        {/* 2. Empty States */}
        <Section
          title="2. Empty States"
          description="Actionable empty states"
        >
          <EmptyState
            illustration="journal"
            title="No Items Yet"
            description="Start by creating your first item to see it here."
            action={{
              label: "Create Item",
              onClick: () => toast.info('Create item clicked'),
            }}
          />
        </Section>

        {/* 3. Error States */}
        <Section
          title="3. Error States"
          description="User-friendly error messages"
        >
          <div className="space-y-4">
            <ErrorBanner
              message="Connection lost. Retrying..."
              onRetry={() => toast.info('Retrying...')}
            />
            <InlineError message="This field is required" />
            <ErrorState
              variant="warning"
              title="Warning"
              message="Your session will expire in 5 minutes."
              onDismiss={() => toast.info('Dismissed')}
            />
          </div>
        </Section>

        {/* 4. Toast Notifications */}
        <Section
          title="4. Toast Notifications"
          description="Non-intrusive feedback"
          help="Click the buttons at the top to trigger different toast types"
        >
          <div className="glass-subtle rounded-2xl p-6 text-center space-y-4">
            <svg className="w-12 h-12 mx-auto text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-sm text-text-secondary">
              Toasts erscheinen unten rechts mit Auto-Dismiss
            </p>
          </div>
        </Section>

        {/* 5. Tooltips */}
        <Section
          title="5. Tooltips & Help"
          description="Contextual help"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Tooltip content="This is a helpful tooltip" position="top">
                <button className="btn btn-secondary">
                  Hover me
                </button>
              </Tooltip>
              <InfoTooltipIcon content="Additional information about this feature" />
              <HelpTooltipCard
                title="Win Rate"
                description="Percentage of profitable trades out of total trades"
              />
            </div>

            <div className="card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-text-primary">Net P&L</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-sentiment-bull">+$2,450</span>
                  <InfoTooltipIcon content="Your total profit/loss over the last 30 days" />
                </div>
              </div>
            </div>
          </div>
        </Section>

        {/* 6. Keyboard Shortcuts */}
        <Section
          title="6. Keyboard Shortcuts"
          description="Power-user features"
        >
          <div className="glass-subtle rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-primary">Command Palette</span>
              <kbd className="px-3 py-1.5 rounded-lg bg-surface-elevated border border-border-moderate font-mono text-xs">Cmd+K</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-primary">Show Shortcuts</span>
              <kbd className="px-3 py-1.5 rounded-lg bg-surface-elevated border border-border-moderate font-mono text-xs">?</kbd>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-primary">Save</span>
              <kbd className="px-3 py-1.5 rounded-lg bg-surface-elevated border border-border-moderate font-mono text-xs">Cmd+S</kbd>
            </div>
            <button
              onClick={() => setShowShortcuts(true)}
              className="btn btn-sm btn-outline w-full"
            >
              View All Shortcuts
            </button>
          </div>
        </Section>

        {/* 7. Form Validation */}
        <Section
          title="7. Form Validation"
          description="Inline feedback"
        >
          <div className="space-y-4">
            <FormField
              label="Name"
              hint="Enter your full name"
              required
            >
              <input
                value={formValue}
                onChange={(e) => setFormValue(e.target.value)}
                className="input w-full"
                placeholder="John Doe"
              />
            </FormField>

            <ValidatedInput
              value={emailValue}
              onChange={(val: string) => setEmailValue(val)}
              validation={{
                required: true,
                pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
              }}
              placeholder="email@example.com"
              className="input w-full"
            />

            <CharacterCounter current={formValue.length} max={50} />
          </div>
        </Section>

        {/* 8. Progressive Disclosure */}
        <Section
          title="8. Progressive Disclosure"
          description="Show more/less patterns"
        >
          <div className="space-y-4">
            <Collapsible title="Advanced Settings" variant="card">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-primary">Dark Mode</span>
                  <input type="checkbox" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-text-primary">Notifications</span>
                  <input type="checkbox" defaultChecked />
                </div>
              </div>
            </Collapsible>

            <ShowMore maxHeight={100}>
              <p className="text-sm text-text-secondary leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. 
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. 
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.
              </p>
            </ShowMore>

            <ExpandableText
              text="This is a long text that will be truncated and expandable. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
              maxLines={2}
            />
          </div>
        </Section>

        {/* 9. Focus Management */}
        <Section
          title="9. Focus Management"
          description="Keyboard navigation"
        >
          <div className="glass-subtle rounded-2xl p-6 space-y-4">
            <p className="text-sm text-text-secondary">
              Try navigating with <kbd className="px-2 py-0.5 rounded bg-surface-elevated border border-border-moderate font-mono text-xs">Tab</kbd>
            </p>
            <div className="flex gap-2">
              <button className="btn btn-sm btn-primary">Button 1</button>
              <button className="btn btn-sm btn-secondary">Button 2</button>
              <button className="btn btn-sm btn-ghost">Button 3</button>
            </div>
            <input className="input w-full" placeholder="Focus me with Tab" />
          </div>
        </Section>

        {/* 10. Page Transitions */}
        <Section
          title="10. Page Transitions"
          description="Smooth animations"
        >
          <div className="space-y-4">
            <button
              onClick={() => setShowModal(true)}
              className="btn btn-outline w-full"
            >
              Open Modal (Scale Transition)
            </button>
            <div className="glass-subtle rounded-2xl p-6 text-center">
              <p className="text-sm text-text-secondary">
                Route changes und Modals verwenden smooth transitions für bessere UX
              </p>
            </div>
          </div>
        </Section>
      </div>

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutsDialog
        isOpen={showShortcuts}
        onClose={() => setShowShortcuts(false)}
        shortcuts={defaultShortcuts}
      />

      {/* Example Modal */}
      {showModal && (
        <Modal onClose={() => setShowModal(false)}>
          <h2 className="text-2xl font-bold text-text-primary mb-4">
            Modal with Focus Trap
          </h2>
          <p className="text-text-secondary mb-6">
            This modal uses focus trapping. Try pressing <kbd className="px-2 py-0.5 rounded bg-surface-elevated border border-border-moderate font-mono text-xs">Tab</kbd> to navigate, 
            and <kbd className="px-2 py-0.5 rounded bg-surface-elevated border border-border-moderate font-mono text-xs">Esc</kbd> to close.
          </p>
          <div className="flex gap-3">
            <button onClick={() => setShowModal(false)} className="btn btn-primary">
              Close
            </button>
            <button onClick={() => toast.success('Action executed!')} className="btn btn-secondary">
              Action
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// Section Component
function Section({ 
  title, 
  description, 
  help,
  children 
}: { 
  title: string; 
  description: string; 
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="card-elevated rounded-3xl p-6 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-text-primary mb-1">
            {title}
          </h3>
          <p className="text-sm text-text-tertiary">
            {description}
          </p>
        </div>
        {help && <InfoTooltipIcon content={help} />}
      </div>
      <div>{children}</div>
    </div>
  );
}

// Modal Component with Focus Trap
function Modal({ 
  onClose, 
  children 
}: { 
  onClose: () => void; 
  children: React.ReactNode;
}) {
  const modalRef = useFocusTrap(true) as React.RefObject<HTMLDivElement>;
  useKeyboardShortcut('esc', onClose);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-bg-overlay/70 backdrop-blur px-4 py-8"
      onClick={onClose}
    >
      <ScaleTransition isOpen={true}>
        <div
          ref={modalRef}
          className="glass-heavy w-full max-w-md rounded-3xl border border-border-moderate p-8 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {children}
        </div>
      </ScaleTransition>
    </div>
  );
}

function InfoTooltipIcon({ content }: { content: React.ReactNode }) {
  return (
    <Tooltip content={content} position="top">
      <button
        className="inline-flex h-4 w-4 items-center justify-center rounded-full border border-border text-text-tertiary hover:text-text-primary hover:border-border-focus transition-colors"
        aria-label="More information"
      >
        i
      </button>
    </Tooltip>
  )
}

function HelpTooltipCard({ title, description }: { title: string; description: string }) {
  return (
    <Tooltip
      position="top"
      content={
        <div className="max-w-xs space-y-1">
          <p className="font-semibold text-text-primary">{title}</p>
          <p className="text-xs text-text-secondary leading-relaxed">{description}</p>
        </div>
      }
    >
      <button
        className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-surface-elevated border border-border text-text-tertiary hover:text-text-primary hover:border-brand transition-colors"
        aria-label={`${title} help`}
      >
        ?
      </button>
    </Tooltip>
  )
}
