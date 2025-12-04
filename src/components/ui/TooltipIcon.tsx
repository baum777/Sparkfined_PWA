/**
 * TooltipIcon Component - Help icon with tooltip for complex terms
 * 
 * Usage:
 * <TooltipIcon content="RSI measures momentum. > 70 is overbought." />
 */

import { HelpCircle } from '@/lib/icons';
import { useState } from 'react';

interface TooltipIconProps {
  content: string;
  learnMoreUrl?: string;
  className?: string;
}

export function TooltipIcon({ 
  content, 
  learnMoreUrl,
  className = '' 
}: TooltipIconProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        className={`text-fog hover:text-mist transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-spark rounded ${className}`}
        aria-label="Help"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        type="button"
      >
        <HelpCircle size={16} />
      </button>

      {isVisible && (
        <div 
          className="absolute z-50 left-1/2 -translate-x-1/2 bottom-full mb-2 w-64 px-3 py-2 text-sm bg-smoke-light text-mist rounded-lg shadow-xl border border-smoke-lighter pointer-events-none"
          role="tooltip"
        >
          <div className="relative">
            {content}
            {learnMoreUrl && (
              <a 
                href={learnMoreUrl}
                className="block mt-2 text-spark hover:text-spark text-xs pointer-events-auto"
                target="_blank"
                rel="noopener noreferrer"
              >
                Learn More →
              </a>
            )}
          </div>
          {/* Arrow */}
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-1 w-2 h-2 bg-smoke-light border-r border-b border-smoke-lighter rotate-45"></div>
        </div>
      )}
    </div>
  );
}
