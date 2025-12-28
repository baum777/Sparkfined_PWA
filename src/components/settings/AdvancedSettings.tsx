import { Bug, Database, FileCode, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

export function AdvancedSettings() {
  const [copied, setCopied] = useState(false);

  const diagnosticInfo = {
    version: "1.0.0-beta",
    build: "2024.12.27",
    userAgent: navigator.userAgent.slice(0, 50) + "...",
    localStorage: `${Object.keys(localStorage).length} keys`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
  };

  const handleCopyDiagnostics = () => {
    const info = JSON.stringify(diagnosticInfo, null, 2);
    navigator.clipboard.writeText(info);
    setCopied(true);
    toast.success("Diagnostics copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClearCache = () => {
    // Clear specific cache keys, not all localStorage
    const cacheKeys = Object.keys(localStorage).filter(k => 
      k.startsWith("cache_") || k.startsWith("temp_")
    );
    cacheKeys.forEach(k => localStorage.removeItem(k));
    toast.success(`Cleared ${cacheKeys.length} cached items`);
  };

  return (
    <div className="space-y-4" data-testid="settings-advanced">
      {/* Diagnostics Info */}
      <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bug className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Diagnostics</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopyDiagnostics}
            data-testid="advanced-copy-diagnostics"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <dl className="text-xs space-y-1">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Version</dt>
            <dd className="font-mono text-foreground">{diagnosticInfo.version}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Build</dt>
            <dd className="font-mono text-foreground">{diagnosticInfo.build}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Storage</dt>
            <dd className="font-mono text-foreground">{diagnosticInfo.localStorage}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Timezone</dt>
            <dd className="font-mono text-foreground">{diagnosticInfo.timezone}</dd>
          </div>
        </dl>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleClearCache}
          data-testid="advanced-clear-cache"
        >
          <Database className="mr-2 h-4 w-4" />
          Clear cache
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            console.log("Debug mode enabled");
            toast.info("Debug logging enabled in console");
          }}
          data-testid="advanced-debug-mode"
        >
          <FileCode className="mr-2 h-4 w-4" />
          Enable debug logs
        </Button>
      </div>
    </div>
  );
}
