import React from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import SettingsHeaderActions from '@/components/settings/SettingsHeaderActions';
import SettingsPage from './SettingsPage';

export default function SettingsPageV2() {
  return (
    <DashboardShell
      title="Settings"
      description="Manage preferences, data backups, AI usage and app controls."
      actions={<SettingsHeaderActions />}
    >
      <SettingsPage showHeading={false} wrapperClassName="space-y-6" />
    </DashboardShell>
  );
}
