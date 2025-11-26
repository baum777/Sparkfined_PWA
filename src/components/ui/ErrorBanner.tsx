import React from 'react';
import Button from './Button';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="rounded-2xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-50">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-red-400" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-red-50">Something went wrong</p>
            <p className="text-red-100/80">{message}</p>
          </div>
        </div>
        {onRetry ? (
          <Button
            size="sm"
            variant="outline"
            className="border-danger/60 text-danger hover:bg-danger/10"
            onClick={onRetry}
          >
            Retry
          </Button>
        ) : null}
      </div>
    </div>
  );
}
