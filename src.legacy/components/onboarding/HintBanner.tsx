/**
 * HintBanner - Progressive hints that appear on first page visits
 * 
 * Usage:
 * <HintBanner
 *   hintId="chart-shortcuts"
 *   title="Pro Tip"
 *   message="Press 'C' to enter drawing mode..."
 *   onDismiss={() => {}}
 * />
 */

import { Lightbulb, X } from '@/lib/icons';
import { useEffect, useState } from 'react';

interface HintBannerProps {
  hintId: string;
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  delayMs?: number;
}

export function HintBanner({
  hintId,
  title = 'Pro Tip',
  message,
  actionLabel,
  onAction,
  delayMs = 5000,
}: HintBannerProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    // Check if hint was already dismissed
    if (window.localStorage.getItem(`hint:${hintId}`)) {
      return;
    }

    // Show hint after delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, delayMs);

    return () => clearTimeout(timer);
  }, [hintId, delayMs]);

  const handleDismiss = () => {
    setIsVisible(false);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(`hint:${hintId}`, 'dismissed');
    }
  };

  if (!isVisible) return null;

  return (
    <div className="mb-4 bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-lg p-4 animate-slide-down">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-emerald-500/20 rounded-lg flex items-center justify-center">
          <Lightbulb size={18} className="text-emerald-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm mb-1 text-emerald-100">
            {title}
          </h3>
          <p className="text-sm text-zinc-300 leading-relaxed">
            {message}
          </p>
          
          {actionLabel && onAction && (
            <button
              onClick={onAction}
              className="mt-3 text-sm font-medium text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              {actionLabel} →
            </button>
          )}
        </div>

        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-zinc-400 hover:text-zinc-100 transition-colors p-1 rounded hover:bg-zinc-800/50"
          aria-label="Dismiss hint"
        >
          <X size={18} />
        </button>
      </div>
    </div>
  );
}
