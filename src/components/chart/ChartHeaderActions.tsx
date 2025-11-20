import React from 'react';
import Button from '@/components/ui/Button';
import { BookmarkPlus, Share2, RefreshCw } from 'lucide-react';

export function ChartHeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" size="sm" leftIcon={<RefreshCw className="h-4 w-4" />}>
        Refresh
      </Button>
      <Button variant="ghost" size="sm" leftIcon={<BookmarkPlus className="h-4 w-4" />}>
        Bookmark
      </Button>
      <Button variant="ghost" size="sm" leftIcon={<Share2 className="h-4 w-4" />}>
        Share
      </Button>
    </div>
  );
}

export default ChartHeaderActions;
