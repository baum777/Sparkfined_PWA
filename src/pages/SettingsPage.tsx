import React from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import SettingsHeaderActions from '@/components/settings/SettingsHeaderActions';
import SettingsContent from './SettingsContent';

export default function SettingsPage() {
  return (
    <DashboardShell
      title="Settings"
      description="Manage preferences, data backups, AI usage and app controls."
      actions={<SettingsHeaderActions />}
    >
      <div className="card rounded-3xl p-4 sm:p-6" data-testid="settings-page">
        <SettingsContent showHeading={false} wrapperClassName="space-y-6" />
      </div>
    </DashboardShell>
  );
}
