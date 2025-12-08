import React from 'react';
import Button from '@/components/ui/Button';
import { BookmarkPlus, RefreshCw, Clock } from '@/lib/icons';

interface ChartHeaderActionsProps {
  onCreateAlert?: () => void;
  onSaveJournal?: () => void;
  onOpenReplay?: () => void;
}

export function ChartHeaderActions({ onCreateAlert, onSaveJournal, onOpenReplay }: ChartHeaderActionsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button
        variant="primary"
        size="sm"
        leftIcon={<RefreshCw className="h-4 w-4" />}
        onClick={onCreateAlert}
        data-testid="chart-action-create-alert"
      >
        Create alert
      </Button>
      <Button
        variant="ghost"
        size="sm"
        leftIcon={<BookmarkPlus className="h-4 w-4" />}
        onClick={onSaveJournal}
        data-testid="chart-action-save-journal"
      >
        Save note
      </Button>
      <Button
        variant="ghost"
        size="sm"
        leftIcon={<Clock className="h-4 w-4" />}
        onClick={onOpenReplay}
        data-testid="chart-action-open-replay"
      >
        Replay
      </Button>
    </div>
  );
}

export default ChartHeaderActions;
