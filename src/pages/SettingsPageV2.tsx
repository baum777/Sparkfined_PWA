import React, { useState } from 'react';
import DashboardShell from '@/components/dashboard/DashboardShell';
import SettingsHeaderActions from '@/components/settings/SettingsHeaderActions';
import SettingsPage from './SettingsPage';
import WalletConnectionSection from '@/components/settings/WalletConnectionSection';
import WalletSettingsPanel from '@/components/settings/WalletSettingsPanel';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/Tabs';

export default function SettingsPageV2() {
  return (
    <DashboardShell
      title="Settings"
      description="Manage preferences, data backups, AI usage and app controls."
      actions={<SettingsHeaderActions />}
    >
      <div className="space-y-6">
        {/* ========== TABS: GENERAL + WALLET + ALERTS ========== */}
        <Tabs defaultValue="general" className="space-y-6">
          <TabsList>
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="wallet">Wallet & Auto-Journal</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          {/* ========== TAB: GENERAL ========== */}
          <TabsContent value="general">
            <div className="rounded-3xl border border-border-subtle bg-surface p-4 sm:p-6">
              <SettingsPage showHeading={false} wrapperClassName="space-y-6" />
            </div>
          </TabsContent>

          {/* ========== TAB: WALLET & AUTO-JOURNAL ========== */}
          <TabsContent value="wallet">
            <div className="space-y-6">
              <WalletConnectionSection />
              <WalletSettingsPanel />
            </div>
          </TabsContent>

          {/* ========== TAB: ALERTS ========== */}
          <TabsContent value="alerts">
            <div className="rounded-3xl border border-border-subtle bg-surface p-4 sm:p-6">
              <p className="text-sm text-text-secondary">
                TODO Codex: Add alert-specific settings (evaluation interval, notification preferences, etc.)
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}
