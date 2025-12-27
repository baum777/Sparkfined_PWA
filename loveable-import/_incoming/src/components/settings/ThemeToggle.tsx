import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="flex items-center justify-between" data-testid="settings-theme-row">
      <div className="flex items-center gap-3">
        {isDark ? (
          <Moon className="h-5 w-5 text-muted-foreground" />
        ) : (
          <Sun className="h-5 w-5 text-muted-foreground" />
        )}
        <div>
          <Label htmlFor="theme-toggle" className="text-sm font-medium">
            Dark mode
          </Label>
          <p className="text-xs text-muted-foreground">
            {isDark ? "Currently using dark theme" : "Currently using light theme"}
          </p>
        </div>
      </div>
      <Switch
        id="theme-toggle"
        checked={isDark}
        onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
        aria-label="Toggle dark mode"
        data-testid="settings-theme-toggle"
      />
    </div>
  );
}
