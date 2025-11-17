import React from 'react';
import Button from '@/components/ui/Button';

interface DashboardQuickActionsProps {
  onOpenBoard?: () => void;
  onOpenJournal?: () => void;
  onOpenAnalysis?: () => void;
}

const noop = () => {};

export default function DashboardQuickActions({
  onOpenBoard = noop,
  onOpenJournal = noop,
  onOpenAnalysis = noop,
}: DashboardQuickActionsProps) {
  const actions = [
    {
      label: 'Open Board',
      onClick: onOpenBoard,
    },
    {
      label: 'Open Journal',
      onClick: onOpenJournal,
    },
    {
      label: 'Open Analysis',
      onClick: onOpenAnalysis,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant="secondary"
          size="sm"
          onClick={() => {
            action.onClick();
            // TODO: wire navigation
          }}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}
