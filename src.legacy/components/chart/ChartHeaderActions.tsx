import React from 'react';
import Button from '@/components/ui/Button';
import { FilterPills } from '@/components/layout/FilterPills';
import type { ChartTimeframe } from '@/domain/chart';
import { RefreshCw, Activity } from '@/lib/icons';

interface ChartHeaderActionsProps {
  timeframe: ChartTimeframe;
  supportedTimeframes: ReadonlyArray<ChartTimeframe>;
  onTimeframeChange: (timeframe: ChartTimeframe) => void;
  onRefresh: () => void;
  onOpenReplay: () => void;
  isRefreshing?: boolean;
}

export function ChartHeaderActions({
  timeframe,
  supportedTimeframes,
  onTimeframeChange,
  onRefresh,
  onOpenReplay,
  isRefreshing,
}: ChartHeaderActionsProps) {
  return (
    <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-end">
      <FilterPills
        options={supportedTimeframes}
        active={timeframe}
        onChange={onTimeframeChange}
        className="justify-end"
      />
      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<RefreshCw className="h-4 w-4" />}
          onClick={onRefresh}
          isLoading={isRefreshing}
          data-testid="button-refresh-chart"
        >
          Refresh
        </Button>
        <Button
          variant="ghost"
          size="sm"
          leftIcon={<Activity className="h-4 w-4" />}
          onClick={onOpenReplay}
          data-testid="button-open-replay"
        >
          Replay
        </Button>
      </div>
    </div>
  );
}

export default ChartHeaderActions;
