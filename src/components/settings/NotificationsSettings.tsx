import { Bell, BellRing, Volume2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";

export function NotificationsSettings() {
  const [alertNotifications, setAlertNotifications] = useState(() => 
    localStorage.getItem("notifyAlerts") !== "false"
  );
  const [journalReminders, setJournalReminders] = useState(() => 
    localStorage.getItem("notifyJournal") !== "false"
  );
  const [soundEnabled, setSoundEnabled] = useState(() => 
    localStorage.getItem("notifySound") !== "false"
  );

  useEffect(() => {
    localStorage.setItem("notifyAlerts", String(alertNotifications));
  }, [alertNotifications]);

  useEffect(() => {
    localStorage.setItem("notifyJournal", String(journalReminders));
  }, [journalReminders]);

  useEffect(() => {
    localStorage.setItem("notifySound", String(soundEnabled));
  }, [soundEnabled]);

  return (
    <div className="space-y-4" data-testid="settings-notifications">
      {/* Alert Notifications */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BellRing className="h-5 w-5 text-muted-foreground" />
          <div>
            <Label htmlFor="alert-notif" className="text-sm font-medium">Alert notifications</Label>
            <p className="text-xs text-muted-foreground">Get notified when alerts trigger</p>
          </div>
        </div>
        <Switch
          id="alert-notif"
          checked={alertNotifications}
          onCheckedChange={setAlertNotifications}
          data-testid="notif-alerts-toggle"
        />
      </div>

      {/* Journal Reminders */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <div>
            <Label htmlFor="journal-remind" className="text-sm font-medium">Journal reminders</Label>
            <p className="text-xs text-muted-foreground">Daily prompts to log entries</p>
          </div>
        </div>
        <Switch
          id="journal-remind"
          checked={journalReminders}
          onCheckedChange={setJournalReminders}
          data-testid="notif-journal-toggle"
        />
      </div>

      {/* Sound */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Volume2 className="h-5 w-5 text-muted-foreground" />
          <div>
            <Label htmlFor="sound-toggle" className="text-sm font-medium">Sound effects</Label>
            <p className="text-xs text-muted-foreground">Play sounds for notifications</p>
          </div>
        </div>
        <Switch
          id="sound-toggle"
          checked={soundEnabled}
          onCheckedChange={setSoundEnabled}
          data-testid="notif-sound-toggle"
        />
      </div>
    </div>
  );
}
