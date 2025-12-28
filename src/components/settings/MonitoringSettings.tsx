import { Activity, RefreshCw, Zap } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";

export function MonitoringSettings() {
  const [autoRefresh, setAutoRefresh] = useState(() => 
    localStorage.getItem("monitorAutoRefresh") !== "false"
  );
  const [refreshInterval, setRefreshInterval] = useState(() => 
    localStorage.getItem("monitorRefreshInterval") || "30"
  );
  const [performanceMode, setPerformanceMode] = useState(() => 
    localStorage.getItem("monitorPerfMode") === "true"
  );

  useEffect(() => {
    localStorage.setItem("monitorAutoRefresh", String(autoRefresh));
  }, [autoRefresh]);

  useEffect(() => {
    localStorage.setItem("monitorRefreshInterval", refreshInterval);
  }, [refreshInterval]);

  useEffect(() => {
    localStorage.setItem("monitorPerfMode", String(performanceMode));
  }, [performanceMode]);

  return (
    <div className="space-y-4" data-testid="settings-monitoring">
      {/* Auto Refresh */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-5 w-5 text-muted-foreground" />
          <div>
            <Label htmlFor="auto-refresh" className="text-sm font-medium">Auto-refresh data</Label>
            <p className="text-xs text-muted-foreground">Keep prices and alerts updated</p>
          </div>
        </div>
        <Switch
          id="auto-refresh"
          checked={autoRefresh}
          onCheckedChange={setAutoRefresh}
          data-testid="monitor-autorefresh-toggle"
        />
      </div>

      {/* Refresh Interval */}
      {autoRefresh && (
        <div className="flex items-center justify-between pl-8">
          <div>
            <Label className="text-sm font-medium">Refresh interval</Label>
            <p className="text-xs text-muted-foreground">How often to update</p>
          </div>
          <Select value={refreshInterval} onValueChange={setRefreshInterval}>
            <SelectTrigger className="w-24" data-testid="monitor-interval-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10s</SelectItem>
              <SelectItem value="30">30s</SelectItem>
              <SelectItem value="60">1m</SelectItem>
              <SelectItem value="300">5m</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Performance Mode */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Zap className="h-5 w-5 text-muted-foreground" />
          <div>
            <Label htmlFor="perf-mode" className="text-sm font-medium">Performance mode</Label>
            <p className="text-xs text-muted-foreground">Reduce animations for speed</p>
          </div>
        </div>
        <Switch
          id="perf-mode"
          checked={performanceMode}
          onCheckedChange={setPerformanceMode}
          data-testid="monitor-perfmode-toggle"
        />
      </div>

      {/* Status Indicator */}
      <div className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2">
        <Activity className="h-4 w-4 text-green-500" />
        <span className="text-xs text-muted-foreground">
          System status: <span className="text-green-500 font-medium">Operational</span>
        </span>
      </div>
    </div>
  );
}
