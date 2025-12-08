import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '@/components/ui/Button';

export default function DashboardQuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Open Watchlist',
      path: '/watchlist-v2',
      variant: 'primary' as const,
    },
    {
      label: 'Review Alerts',
      path: '/alerts-v2',
      variant: 'ghost' as const,
    },
    {
      label: 'Start Replay',
      path: '/replay',
      variant: 'ghost' as const,
    },
    {
      label: 'Open Analyze',
      path: '/analysis-v2',
      variant: 'ghost' as const,
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant={action.variant}
          size="sm"
          onClick={() => navigate(action.path)}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}
