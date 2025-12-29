import { Settings, RefreshCw, Palette, Database, Shield, Activity, HardDrive, Smartphone, Bell as AlertBell, LineChart, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SettingsSection,
  ThemeToggle,
  DataExportImport,
  FactoryReset,
  SetupCompleteness,
  ChartPrefsSettings,
  NotificationsSettings,
  ConnectedWalletsSettings,
  MonitoringSettings,
  TokenUsageSettings,
  RiskDefaultsSettings,
  AdvancedSettings,
} from "@/components/settings";
import { JournalDataSettings } from "@/features/settings";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4 sm:p-6" data-testid="page-settings">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
          <Settings className="h-5 w-5 text-muted-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Manage your preferences and data
          </p>
        </div>
      </div>

      {/* Setup completeness cue - TO BE MOVED TO MODAL LATER */}
      {/* <SetupCompleteness /> */}

      <Tabs defaultValue="preferences" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* PREFERENCES TAB */}
        <TabsContent value="preferences" className="space-y-6">
          {/* Appearance */}
          <SettingsSection
            title="Appearance"
            description="Customize how the app looks"
            icon={<Palette className="h-5 w-5 text-brand" />}
            priority
            data-testid="settings-section-appearance"
          >
            <ThemeToggle />
          </SettingsSection>

          {/* Chart Preferences */}
          <SettingsSection
            title="Chart preferences"
            description="Default chart behavior and style"
            icon={<LineChart className="h-5 w-5 text-brand" />}
            data-testid="settings-section-chart"
          >
            <ChartPrefsSettings />
          </SettingsSection>

          {/* Notifications */}
          <SettingsSection
            title="Notifications"
            description="Control alerts and reminders"
            icon={<AlertBell className="h-5 w-5 text-brand" />}
            data-testid="settings-section-notifications"
          >
            <NotificationsSettings />
          </SettingsSection>

          {/* Risk Defaults */}
          <SettingsSection
            title="Risk defaults"
            description="Default risk parameters for trades"
            icon={<Shield className="h-5 w-5 text-brand" />}
            data-testid="settings-section-risk"
          >
            <RiskDefaultsSettings />
          </SettingsSection>
        </TabsContent>

        {/* DATA TAB */}
        <TabsContent value="data" className="space-y-6">
           {/* Journal Extended Data */}
           <SettingsSection
            title="Journal data"
            description="Configure auto-captured trade enrichments"
            icon={<Database className="h-5 w-5 text-brand" />}
            data-testid="settings-section-journal"
          >
            <JournalDataSettings />
          </SettingsSection>

          {/* Connected Wallets */}
          <SettingsSection
            title="Connected wallets"
            description="Manage wallet connections for tracking"
            icon={<Wallet className="h-5 w-5 text-brand" />}
            data-testid="settings-section-wallets"
          >
            <ConnectedWalletsSettings />
          </SettingsSection>

          {/* Backup & Restore */}
          <SettingsSection
            title="Backup & Restore"
            description="Export your data or restore from a backup"
            icon={<HardDrive className="h-5 w-5 text-brand" />}
            priority
            data-testid="settings-section-backup"
          >
            <DataExportImport />
          </SettingsSection>
        </TabsContent>

        {/* SYSTEM TAB */}
        <TabsContent value="system" className="space-y-6">
          {/* Monitoring */}
          <SettingsSection
            title="Monitoring"
            description="Data refresh and performance settings"
            icon={<Activity className="h-5 w-5 text-brand" />}
            data-testid="settings-section-monitoring"
          >
            <MonitoringSettings />
          </SettingsSection>

           {/* Token Usage */}
          <SettingsSection
            title="Token usage"
            description="Track your AI token consumption"
            icon={<Smartphone className="h-5 w-5 text-brand" />}
            data-testid="settings-section-tokens"
          >
            <TokenUsageSettings />
          </SettingsSection>

          {/* Advanced/Diagnostics */}
          <SettingsSection
            title="Advanced"
            description="Diagnostics and developer tools"
            data-testid="settings-section-advanced"
          >
            <AdvancedSettings />
          </SettingsSection>

          {/* Danger Zone */}
          <SettingsSection
            title="Danger zone"
            description="Irreversible actions"
            className="border-destructive/30"
            data-testid="settings-section-danger"
          >
            <FactoryReset />
          </SettingsSection>
        </TabsContent>
      </Tabs>

      {/* Update App */}
      <div className="pt-4 pb-8">
        <Button
          variant="outline"
          size="lg"
          className="w-full gap-2 border-border-sf-moderate bg-surface-subtle hover:bg-surface-elevated"
          data-testid="settings-update-app-btn"
        >
          <RefreshCw className="h-4 w-4" />
          Update app
        </Button>
      </div>
    </div>
  );
}
