import { Settings, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  SettingsSection,
  ThemeToggle,
  DataExportImport,
  FactoryReset,
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

      <Tabs defaultValue="general" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="trading">Trading</TabsTrigger>
          <TabsTrigger value="data">Data</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="space-y-6 mt-6">
          <SettingsSection
            title="Appearance"
            description="Customize how the app looks"
            priority
            data-testid="settings-section-appearance"
          >
            <ThemeToggle />
          </SettingsSection>

          <SettingsSection
            title="Notifications"
            description="Control alerts and reminders"
            data-testid="settings-section-notifications"
          >
            <NotificationsSettings />
          </SettingsSection>

          <SettingsSection
            title="Token usage"
            description="Track your AI token consumption"
            data-testid="settings-section-tokens"
          >
            <TokenUsageSettings />
          </SettingsSection>
        </TabsContent>

        {/* Trading Tab */}
        <TabsContent value="trading" className="space-y-6 mt-6">
          <SettingsSection
            title="Chart preferences"
            description="Default chart behavior and style"
            data-testid="settings-section-chart"
          >
            <ChartPrefsSettings />
          </SettingsSection>

          <SettingsSection
            title="Risk defaults"
            description="Default risk parameters for trades"
            data-testid="settings-section-risk"
          >
            <RiskDefaultsSettings />
          </SettingsSection>

          <SettingsSection
            title="Connected wallets"
            description="Manage wallet connections for tracking"
            data-testid="settings-section-wallets"
          >
            <ConnectedWalletsSettings />
          </SettingsSection>
        </TabsContent>

        {/* Data Tab */}
        <TabsContent value="data" className="space-y-6 mt-6">
          <SettingsSection
            title="Journal data"
            description="Configure auto-captured trade enrichments"
            data-testid="settings-section-journal"
          >
            <JournalDataSettings />
          </SettingsSection>

          <SettingsSection
            title="Monitoring"
            description="Data refresh and performance settings"
            data-testid="settings-section-monitoring"
          >
            <MonitoringSettings />
          </SettingsSection>

          <SettingsSection
            title="Backup & Restore"
            description="Export your data or restore from a backup"
            priority
            data-testid="settings-section-backup"
          >
            <DataExportImport />
          </SettingsSection>
        </TabsContent>

        {/* System Tab */}
        <TabsContent value="system" className="space-y-6 mt-6">
          <SettingsSection
            title="Advanced"
            description="Diagnostics and developer tools"
            data-testid="settings-section-advanced"
          >
            <AdvancedSettings />
          </SettingsSection>

          <div className="pt-4">
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
    </div>
  );
}
