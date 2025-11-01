import { useState } from 'react'
import { saveFeedback, getSessionId } from '@/lib/db'

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-800 rounded-xl shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {step === 'type' ? 'Share Feedback' : `${feedbackType}`}
          </h2>
          <button
            onClick={handleClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            disabled={isSaving}
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'type' && (
            <div className="space-y-3">
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                What kind of feedback would you like to share?
              </p>
              <button
                onClick={() => handleTypeSelect('Bug')}
                className="w-full p-4 text-left rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950 transition-all"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">🐛</span>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">Bug Report</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Something isn't working as expected
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleTypeSelect('Idea')}
                className="w-full p-4 text-left rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-green-500 dark:hover:border-green-500 hover:bg-green-50 dark:hover:bg-green-950 transition-all"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💡</span>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">Feature Idea</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
                      Suggest an improvement or new feature
                    </div>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleTypeSelect('Other')}
                className="w-full p-4 text-left rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-950 transition-all"
              >
                <div className="flex items-start gap-3">
                  <span className="text-2xl">💬</span>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">Other</div>
                    <div className="text-sm text-slate-600 dark:text-slate-400">
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
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                disabled={isSaving}
              >
                ← Back
              </button>

              <div>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value.slice(0, maxChars))}
                  placeholder={`Share your ${feedbackType.toLowerCase()}...`}
                  className="w-full h-32 px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  autoFocus
                  disabled={isSaving}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {feedbackText.length}/{maxChars}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    🔒 Stored locally, no tracking
                  </span>
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!feedbackText.trim() || isSaving}
                className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSaving ? 'Saving...' : 'Submit Feedback'}
              </button>
            </div>
          )}

          {showSuccess && (
            <div className="text-center py-8 space-y-3">
              <div className="text-5xl">✓</div>
              <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                Thank you!
              </div>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Your feedback has been saved locally
              </div>
            </div>
          )}
        </div>

        {/* Privacy Notice */}
        {step === 'type' && (
          <div className="px-6 pb-4">
            <div className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 p-3 rounded-lg">
              🔒 <strong>Privacy:</strong> All feedback is stored locally on your device.
              No data is sent to any server. You can export and share it manually.
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
