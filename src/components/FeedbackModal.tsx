import { useState, useRef, useId } from 'react'
import type { MouseEvent } from 'react'
import { saveFeedback, getSessionId } from '@/lib/db'
import { useFocusTrap } from '@/hooks/useFocusTrap'
import { Button } from '@/design-system'

interface FeedbackModalProps {
  isOpen: boolean
  onClose: () => void
}

type FeedbackType = 'Bug' | 'Idea' | 'Other'

export default function FeedbackModal({ isOpen, onClose }: FeedbackModalProps) {
  const [step, setStep] = useState<'type' | 'text'>('type')
  const [feedbackType, setFeedbackType] = useState<FeedbackType>('Idea')
  const [feedbackText, setFeedbackText] = useState('')
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const headingId = useId()
  const modalRef = useFocusTrap<HTMLDivElement>({
    isActive: isOpen,
    initialFocusRef: closeButtonRef,
    onEscape: onClose,
  })
  const handleOverlayMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      handleClose()
    }
  }

  const maxChars = 140

  const handleTypeSelect = (type: FeedbackType) => {
    setFeedbackType(type)
    setStep('text')
  }

  const handleSubmit = async () => {
    if (!feedbackText.trim() || isSaving) return

    setIsSaving(true)
    try {
      const feedbackEntry = {
        type: feedbackType,
        text: feedbackText.trim(),
        timestamp: Date.now(),
        status: 'queued' as const,
        sessionId: getSessionId(),
      }
      
      // Ensure data is valid before saving
      if (!feedbackEntry.text || feedbackEntry.text.length === 0) {
        throw new Error('Feedback text cannot be empty')
      }
      
      await saveFeedback(feedbackEntry)

      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
        handleClose()
      }, 1500)
    } catch (error) {
      console.error('Failed to save feedback:', error)
      alert('Failed to save feedback. Please try again.')
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    setStep('type')
    setFeedbackType('Idea')
    setFeedbackText('')
    setIsSaving(false)
    setShowSuccess(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-bg-overlay/70 backdrop-blur"
      role="dialog"
      aria-modal="true"
      aria-labelledby={headingId}
      onMouseDown={handleOverlayMouseDown}
      data-testid="modal-overlay"
    >
      <div
        ref={modalRef}
        tabIndex={-1}
        className="relative w-full max-w-md rounded-xl border border-border-moderate bg-surface text-text-primary shadow-2xl focus:outline-none"
        data-testid="modal-content"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-moderate p-4">
          <h2 id={headingId} className="text-lg font-semibold text-text-primary">
            {step === 'type' ? 'Share Feedback' : `${feedbackType}`}
          </h2>
          <button
            ref={closeButtonRef}
            onClick={handleClose}
            className="text-text-secondary transition-colors hover:text-text-primary hover:bg-interactive-hover rounded-lg p-2"
            disabled={isSaving}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'type' && (
            <div className="space-y-3">
              <p className="mb-4 text-sm text-text-secondary">
                What kind of feedback would you like to share?
              </p>
              <button
                onClick={() => handleTypeSelect('Bug')}
                className="w-full rounded-lg border-2 border-border-moderate bg-surface text-left transition-all hover:border-danger hover:bg-surface-subtle"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🐛</span>
                  <div>
                    <div className="font-semibold text-text-primary">Bug Report</div>
                    <div className="text-sm text-text-secondary">
                      Something isn't working as expected
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleTypeSelect('Idea')}
                className="w-full rounded-lg border-2 border-border-moderate bg-surface text-left transition-all hover:border-brand hover:bg-surface-subtle"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <div className="font-semibold text-text-primary">Feature Idea</div>
                    <div className="text-sm text-text-secondary">
                      Suggest an improvement or new feature
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleTypeSelect('Other')}
                className="w-full rounded-lg border-2 border-border-moderate bg-surface text-left transition-all hover:border-info hover:bg-surface-subtle"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💬</span>
                  <div>
                    <div className="font-semibold text-text-primary">Other</div>
                    <div className="text-sm text-text-secondary">
                      General comments or questions
                    </div>
                  </div>
                </div>
              </button>
            </div>
          )}

          {step === 'text' && !showSuccess && (
            <div className="space-y-4">
              <button
                onClick={() => setStep('type')}
                className="flex items-center gap-1 text-sm text-text-secondary hover:text-text-primary"
                disabled={isSaving}
              >
                ← Back
              </button>

              <div>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value.slice(0, maxChars))}
                  placeholder={`Share your ${feedbackType.toLowerCase()}...`}
                  className="w-full h-32 resize-none rounded-lg border border-border bg-surface px-3 py-2 text-text-primary placeholder-text-tertiary focus:border-brand focus:ring-2 focus:ring-brand/50"
                  autoFocus
                  disabled={isSaving}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-text-tertiary">
                    {feedbackText.length}/{maxChars}
                  </span>
                  <span className="text-xs text-text-tertiary">
                    🔒 Stored locally, no tracking
                  </span>
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!feedbackText.trim() || isSaving}
                className="w-full"
                isLoading={isSaving}
              >
                Submit Feedback
              </Button>
            </div>
          )}

          {showSuccess && (
            <div className="text-center py-8 space-y-3">
              <div className="text-5xl">✓</div>
              <div className="text-lg font-semibold text-text-primary">
                Thank you!
              </div>
              <div className="text-sm text-text-secondary">
                Your feedback has been saved locally
              </div>
            </div>
          )}
        </div>

        {/* Privacy Notice */}
        {step === 'type' && (
          <div className="px-6 pb-4">
            <div className="rounded-lg border border-border-subtle bg-surface-subtle p-3 text-xs text-text-secondary">
              🔒 <strong>Privacy:</strong> All feedback is stored locally on your device.
              No data is sent to any server. You can export and share it manually.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
