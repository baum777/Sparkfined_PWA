import { useState } from "react";
import { Info, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { ExtendedDataSettings } from "@/features/journal/types";

interface JournalExtendedSettingsProps {
  settings: ExtendedDataSettings;
  onSettingsChange: (updates: Partial<ExtendedDataSettings>) => void;
}

const presets: { value: ExtendedDataSettings["preset"]; label: string; description: string }[] = [
  { value: "minimal", label: "Minimal", description: "Basic trade data only" },
  { value: "default", label: "Default", description: "Market + technical context" },
  { value: "maximum", label: "Maximum", description: "All available metrics" },
];

const defaultTimeframes = ["1m", "5m", "15m", "1h", "4h", "1d", "1w"];

// Timeframe validation regex
const timeframeRegex = /^(\d+)(m|h|d|w)$/;

export function JournalExtendedSettings({ settings, onSettingsChange }: JournalExtendedSettingsProps) {
  const [newTimeframe, setNewTimeframe] = useState("");
  const [timeframeError, setTimeframeError] = useState("");

  // Estimate storage impact (bytes per entry)
  const estimateStorage = () => {
    let bytes = 200; // base
    if (settings.marketContext) bytes += 150;
    if (settings.technicalIndicators) bytes += 100 * settings.customTimeframes.length;
    if (settings.onChainMetrics) bytes += 200;
    return bytes;
  };

  const storageEstimate = estimateStorage();
  const storagePercent = Math.min(100, (storageEstimate / 1000) * 100);

  const handlePresetChange = (preset: ExtendedDataSettings["preset"]) => {
    const updates: Partial<ExtendedDataSettings> = { preset };
    
    switch (preset) {
      case "minimal":
        updates.marketContext = false;
        updates.technicalIndicators = false;
        updates.onChainMetrics = false;
        break;
      case "default":
        updates.marketContext = true;
        updates.technicalIndicators = true;
        updates.onChainMetrics = false;
        break;
      case "maximum":
        updates.marketContext = true;
        updates.technicalIndicators = true;
        updates.onChainMetrics = true;
        break;
    }
    
    onSettingsChange(updates);
  };

  const handleAddTimeframe = () => {
    const trimmed = newTimeframe.trim().toLowerCase();
    
    if (!trimmed) return;
    
    if (!timeframeRegex.test(trimmed)) {
      setTimeframeError("Use format: 1m, 5m, 1h, 4h, 1d, 1w");
      return;
    }
    
    if (settings.customTimeframes.includes(trimmed)) {
      setTimeframeError("Already added");
      return;
    }
    
    onSettingsChange({
      customTimeframes: [...settings.customTimeframes, trimmed],
    });
    setNewTimeframe("");
    setTimeframeError("");
  };

  const handleRemoveTimeframe = (tf: string) => {
    onSettingsChange({
      customTimeframes: settings.customTimeframes.filter((t) => t !== tf),
    });
  };

  return (
    <Card className="border-border-sf-subtle bg-surface" data-testid="journal-extended-settings">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-text-primary">Extended Data</CardTitle>
        <p className="text-sm text-text-secondary">
          Configure what data is captured with each trade
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Presets */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-3">
            Preset
          </label>
          <div className="flex flex-wrap gap-2">
            {presets.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePresetChange(preset.value)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  settings.preset === preset.value
                    ? "bg-brand text-black shadow-glow-brand"
                    : "bg-surface-subtle text-text-secondary border border-border-sf-subtle hover:border-brand/50"
                }`}
                data-testid={`preset-${preset.value}`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-primary">Market Context</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3.5 w-3.5 text-text-tertiary" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-surface-elevated border-border-sf-subtle">
                    <p className="text-xs">Market cap, volume, category</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Switch
              checked={settings.marketContext}
              onCheckedChange={(checked) =>
                onSettingsChange({ marketContext: checked, preset: "default" })
              }
              data-testid="toggle-market-context"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-primary">Technical Indicators</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3.5 w-3.5 text-text-tertiary" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-surface-elevated border-border-sf-subtle">
                    <p className="text-xs">RSI, trends at selected timeframes</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Switch
              checked={settings.technicalIndicators}
              onCheckedChange={(checked) =>
                onSettingsChange({ technicalIndicators: checked, preset: "default" })
              }
              data-testid="toggle-technical"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm text-text-primary">On-Chain Metrics</span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3.5 w-3.5 text-text-tertiary" />
                  </TooltipTrigger>
                  <TooltipContent className="bg-surface-elevated border-border-sf-subtle">
                    <p className="text-xs">Holders, whale concentration, token age</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Switch
              checked={settings.onChainMetrics}
              onCheckedChange={(checked) =>
                onSettingsChange({ onChainMetrics: checked, preset: "default" })
              }
              data-testid="toggle-onchain"
            />
          </div>
        </div>

        {/* Custom Timeframes */}
        {settings.technicalIndicators && (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-3">
              Timeframes
            </label>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {settings.customTimeframes.map((tf) => (
                <Badge
                  key={tf}
                  variant="secondary"
                  className="bg-surface-subtle border-border-sf-subtle text-text-secondary gap-1"
                >
                  {tf}
                  <button
                    type="button"
                    onClick={() => handleRemoveTimeframe(tf)}
                    className="hover:text-text-primary"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newTimeframe}
                onChange={(e) => {
                  setNewTimeframe(e.target.value);
                  setTimeframeError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleAddTimeframe()}
                placeholder="e.g. 30m"
                className="flex-1 bg-surface-subtle border-border-sf-moderate"
                data-testid="timeframe-input"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={handleAddTimeframe}
                className="border-border-sf-moderate bg-surface-subtle hover:bg-surface-hover"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {timeframeError && (
              <p className="text-xs text-sentiment-bear mt-1">{timeframeError}</p>
            )}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {defaultTimeframes
                .filter((tf) => !settings.customTimeframes.includes(tf))
                .slice(0, 4)
                .map((tf) => (
                  <button
                    key={tf}
                    onClick={() =>
                      onSettingsChange({
                        customTimeframes: [...settings.customTimeframes, tf],
                      })
                    }
                    className="text-xs text-text-tertiary hover:text-brand transition-colors"
                  >
                    +{tf}
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Storage Impact */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-2">
            Storage Impact
          </label>
          <div className="flex items-center gap-3">
            <Progress value={storagePercent} className="flex-1 h-2" />
            <span className="text-xs text-text-tertiary font-mono">
              ~{storageEstimate} bytes/entry
            </span>
          </div>
        </div>

        {/* Dependencies Info */}
        {settings.onChainMetrics && (
          <div className="p-3 rounded-xl bg-surface-subtle border border-border-sf-subtle text-xs text-text-tertiary">
            <p className="font-medium text-text-secondary mb-1">Dependencies:</p>
            <ul className="space-y-0.5 list-disc list-inside">
              <li>WhaleConcentration requires HolderDistribution</li>
              <li>TokenMaturity requires TokenAge</li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
