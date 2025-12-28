import { Settings } from "lucide-react";
import {
  SettingsSection,
  ThemeToggle,
  DataExportImport,
  FactoryReset,
  SetupCompleteness,
} from "@/components/settings";

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

      {/* Setup completeness cue */}
      <SetupCompleteness />

      {/* Theme - Priority 1 */}
      <SettingsSection
        title="Appearance"
        description="Customize how the app looks"
        priority
        data-testid="settings-section-appearance"
      >
        <ThemeToggle />
      </SettingsSection>

      {/* Export/Import - Priority 2 */}
      <SettingsSection
        title="Backup & Restore"
        description="Export your data or restore from a backup"
        priority
        data-testid="settings-section-backup"
      >
        <DataExportImport />
      </SettingsSection>

      {/* Preferences - Priority 3 (stub) */}
      <SettingsSection
        title="Preferences"
        description="General app settings"
        priority
        data-testid="settings-section-preferences"
      >
        <div className="flex items-center gap-2">
          <span className="rounded border border-muted-foreground/30 bg-muted px-2 py-0.5 text-xs text-muted-foreground">
            Coming soon
          </span>
        </div>
        <p className="text-sm text-muted-foreground italic mt-2">
          Notifications, default views, and display options.
        </p>
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
    </div>
  );
}
