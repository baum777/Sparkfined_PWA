import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Tooltip } from '@/design-system';

export default function DashboardQuickActions() {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Dashboard',
      path: '/dashboard-v2',
    },
    {
      label: 'Journal',
      path: '/journal-v2',
    },
    {
      label: 'Analysis',
      path: '/analysis-v2',
    },
  ];

  return (
    <div className="flex flex-wrap items-center gap-3">
      {actions.map((action) => (
        <Tooltip key={action.label} content={`Navigate to ${action.label}`}>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(action.path)}
          >
            {action.label}
          </Button>
        </Tooltip>
      ))}
    </div>
  );
}
