/**
 * Missing Config Banner
 * Shows prominent warning when required API keys are missing
 */

import { useState, useEffect } from 'react'
import { validateEnv, type EnvValidationResult } from '../lib/validateEnv'
import { X, AlertTriangle, ExternalLink } from '@/lib/icons'

export default function MissingConfigBanner() {
  const [validation, setValidation] = useState<EnvValidationResult | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const result = validateEnv()
    setValidation(result)

    // Check if user dismissed in this session
    const wasDismissed = sessionStorage.getItem('config-banner-dismissed')
    if (wasDismissed) {
      setDismissed(true)
    }
  }, [])

  const handleDismiss = () => {
    setDismissed(true)
    sessionStorage.setItem('config-banner-dismissed', 'true')
  }

  // Don't show if valid or dismissed
  if (!validation || validation.isValid || dismissed) {
    return null
  }

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-amber-900/95 backdrop-blur-sm border-b border-amber-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-amber-100 mb-1">
              Missing Configuration
            </p>
            <p className="text-xs text-amber-200 mb-2">
              Some features are unavailable because required API keys are not configured.
            </p>
            
            {/* Missing keys */}
            {validation.missing.length > 0 && (
              <div className="mb-2">
                <p className="text-xs text-amber-300 font-medium mb-1">Required:</p>
                <ul className="text-xs text-amber-200 space-y-0.5">
                  {validation.missing.map((item, i) => (
                    <li key={i} className="pl-2">• {item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Warnings (optional keys) */}
            {validation.warnings.length > 0 && (
              <div>
                <p className="text-xs text-amber-300/80 font-medium mb-1">Optional (degraded features):</p>
                <ul className="text-xs text-amber-200/80 space-y-0.5">
                  {validation.warnings.slice(0, 2).map((item, i) => (
                    <li key={i} className="pl-2">• {item}</li>
                  ))}
                  {validation.warnings.length > 2 && (
                    <li className="pl-2 text-amber-300/60">
                      ... and {validation.warnings.length - 2} more
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Setup link */}
            <a
              href="/docs/ENVIRONMENT_VARIABLES.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-amber-100 hover:text-white underline mt-2"
            >
              View setup guide
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>

          {/* Dismiss button */}
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 text-amber-300 hover:text-amber-100 transition-colors"
            aria-label="Dismiss banner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
