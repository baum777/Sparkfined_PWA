import React from 'react';
import { Button } from '@/design-system';

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="rounded-2xl border border-blood/40 bg-blood/10 p-4 text-sm text-blood">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="mt-1 h-2.5 w-2.5 rounded-full bg-blood" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-blood">Something went wrong</p>
            <p className="text-blood/80">{message}</p>
          </div>
        </div>
        {onRetry ? (
          <Button
            size="sm"
            variant="danger"
            onClick={onRetry}
          >
            Retry
          </Button>
        ) : null}
      </div>
    </div>
  );
}
