import { useState } from "react";
import { Info, Plus, X, Database, Zap, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useJournalStore } from "@/features/journal/useJournalStore";
import type { ExtendedDataSettings } from "@/features/journal/types";

type Preset = ExtendedDataSettings["preset"];

interface PresetConfig {
  value: Preset;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const PRESETS: PresetConfig[] = [
  { 
    value: "minimal", 
    label: "Minimal", 
    description: "Basic trade data only",
    icon: <Zap className="h-4 w-4" />,
  },
  { 
    value: "default", 
    label: "Default", 
    description: "Market + technical context",
    icon: <BarChart3 className="h-4 w-4" />,
  },
  { 
    value: "maximum", 
    label: "Maximum", 
    description: "All available metrics",
    icon: <Database className="h-4 w-4" />,
  },
];

const SUGGESTED_TIMEFRAMES = ["1m", "5m", "15m", "30m", "1h", "4h", "1d", "1w"];

// Timeframe validation regex: number + m/h/d/w
const TIMEFRAME_REGEX = /^(\d+)(m|h|d|w)$/i;

function validateTimeframe(value: string): boolean {
  return TIMEFRAME_REGEX.test(value.trim().toLowerCase());
}

function estimateStorageBytes(settings: ExtendedDataSettings): number {
  let bytes = 200; // base entry size
  if (settings.marketContext) bytes += 150;
  if (settings.technicalIndicators) bytes += 80 * settings.customTimeframes.length;
  if (settings.onChainMetrics) bytes += 200;
  return bytes;
}

export function JournalDataSettings() {
  const { extendedSettings, updateExtendedSettings } = useJournalStore();
  const [newTimeframe, setNewTimeframe] = useState("");
  const [timeframeError, setTimeframeError] = useState("");

  const storageBytes = estimateStorageBytes(extendedSettings);
  const storagePercent = Math.min(100, (storageBytes / 800) * 100);

  const handlePresetChange = (preset: Preset) => {
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
    
    updateExtendedSettings(updates);
  };

  const handleToggleChange = (key: keyof ExtendedDataSettings, value: boolean) => {
    // When manually toggling, switch to custom preset logic
    updateExtendedSettings({ [key]: value });
  };

  const handleAddTimeframe = () => {
    const trimmed = newTimeframe.trim().toLowerCase();
    
    if (!trimmed) return;
    
    if (!validateTimeframe(trimmed)) {
      setTimeframeError("Use format: 1m, 5m, 1h, 4h, 1d, 1w");
      return;
    }
    
    if (extendedSettings.customTimeframes.includes(trimmed)) {
      setTimeframeError("Already added");
      return;
    }
    
    updateExtendedSettings({
      customTimeframes: [...extendedSettings.customTimeframes, trimmed],
    });
    setNewTimeframe("");
    setTimeframeError("");
  };

  const handleRemoveTimeframe = (tf: string) => {
    updateExtendedSettings({
      customTimeframes: extendedSettings.customTimeframes.filter((t) => t !== tf),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddTimeframe();
    }
  };

  // Dependency checks
  const isMarketCapCategoryDisabled = !extendedSettings.marketContext;
  const isWhaleConcentrationDisabled = !extendedSettings.onChainMetrics;
  const isTokenMaturityDisabled = !extendedSettings.onChainMetrics;

  return (
    <Card 
      className="border-border-sf-subtle bg-surface"
      data-testid="journal-data-settings"
    >
      <CardHeader className="pb-4">
        <CardTitle className="text-lg text-text-primary flex items-center gap-2">
          <Database className="h-5 w-5 text-brand" />
          Extended Data
        </CardTitle>
        <CardDescription className="text-text-secondary">
          Configure what data is captured with each auto-captured trade
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Presets */}
        <div>
          <label className="block text-sm font-medium text-text-secondary mb-3">
            Preset
          </label>
          <div className="grid grid-cols-3 gap-2">
            {PRESETS.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handlePresetChange(preset.value)}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-sm font-medium transition-all ${
                  extendedSettings.preset === preset.value
                    ? "bg-brand text-black shadow-glow-brand"
                    : "bg-surface-subtle text-text-secondary border border-border-sf-subtle hover:border-brand/50"
                }`}
                data-testid={`preset-${preset.value}`}
              >
                {preset.icon}
                <span>{preset.label}</span>
              </button>
            ))}
          </div>
          <p className="text-xs text-text-tertiary mt-2">
            {PRESETS.find((p) => p.value === extendedSettings.preset)?.description}
          </p>
        </div>

        {/* Toggles */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-text-secondary">Data Sources</h4>
          
          {/* Market Context */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-surface-subtle">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-primary">Market Context</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3.5 w-3.5 text-text-tertiary" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-surface-elevated border-border-sf-subtle max-w-xs">
                      <p className="text-xs">Market cap, 24h volume, category classification</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <Switch
              checked={extendedSettings.marketContext}
              onCheckedChange={(checked) => handleToggleChange("marketContext", checked)}
              data-testid="toggle-market-context"
            />
          </div>

          {/* Technical Indicators */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-surface-subtle">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-primary">Technical Indicators</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3.5 w-3.5 text-text-tertiary" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-surface-elevated border-border-sf-subtle max-w-xs">
                      <p className="text-xs">RSI, trend indicators at selected timeframes</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <Switch
              checked={extendedSettings.technicalIndicators}
              onCheckedChange={(checked) => handleToggleChange("technicalIndicators", checked)}
              data-testid="toggle-technical"
            />
          </div>

          {/* On-Chain Metrics */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-surface-subtle">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-text-primary">On-Chain Metrics</span>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-3.5 w-3.5 text-text-tertiary" />
                    </TooltipTrigger>
                    <TooltipContent className="bg-surface-elevated border-border-sf-subtle max-w-xs">
                      <p className="text-xs">Holder count, whale concentration, token age & maturity</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
            <Switch
              checked={extendedSettings.onChainMetrics}
              onCheckedChange={(checked) => handleToggleChange("onChainMetrics", checked)}
              data-testid="toggle-onchain"
            />
          </div>
        </div>

        {/* Custom Timeframes */}
        {extendedSettings.technicalIndicators && (
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-3">
              Timeframes
            </label>
            
            {/* Current chips */}
            <div className="flex flex-wrap gap-1.5 mb-3">
              {extendedSettings.customTimeframes.map((tf) => (
                <Badge
                  key={tf}
                  variant="secondary"
                  className="bg-brand/20 text-brand border-brand/30 gap-1 pr-1"
                >
                  {tf}
                  <button
                    type="button"
                    onClick={() => handleRemoveTimeframe(tf)}
                    className="hover:text-white ml-0.5 p-0.5 rounded-full hover:bg-brand/30"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>

            {/* Add input */}
            <div className="flex gap-2">
              <Input
                value={newTimeframe}
                onChange={(e) => {
                  setNewTimeframe(e.target.value);
                  setTimeframeError("");
                }}
                onKeyDown={handleKeyDown}
                placeholder="e.g. 30m"
                className="flex-1 bg-surface-subtle border-border-sf-moderate"
                data-testid="timeframe-input"
              />
              <Button
                size="icon"
                variant="outline"
                onClick={handleAddTimeframe}
                className="border-border-sf-moderate bg-surface-subtle hover:bg-surface-hover shrink-0"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {timeframeError && (
              <p className="text-xs text-sentiment-bear mt-1.5">{timeframeError}</p>
            )}

            {/* Suggestions */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {SUGGESTED_TIMEFRAMES
                .filter((tf) => !extendedSettings.customTimeframes.includes(tf))
                .slice(0, 4)
                .map((tf) => (
                  <button
                    key={tf}
                    onClick={() =>
                      updateExtendedSettings({
                        customTimeframes: [...extendedSettings.customTimeframes, tf],
                      })
                    }
                    className="text-xs text-text-tertiary hover:text-brand transition-colors px-1.5 py-0.5 rounded hover:bg-brand/10"
                  >
                    +{tf}
                  </button>
                ))}
            </div>
          </div>
        )}

        {/* Storage Impact */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-text-secondary">
              Storage Impact
            </label>
            <span className="text-xs text-text-tertiary font-mono">
              ~{storageBytes} bytes/entry
            </span>
          </div>
          <Progress 
            value={storagePercent} 
            className="h-2"
          />
          <p className="text-xs text-text-tertiary mt-1.5">
            {storagePercent < 40 && "Low impact — fast sync"}
            {storagePercent >= 40 && storagePercent < 70 && "Moderate impact — balanced"}
            {storagePercent >= 70 && "Higher impact — more detailed data"}
          </p>
        </div>

        {/* Dependencies Info */}
        {extendedSettings.onChainMetrics && (
          <div className="p-3 rounded-xl bg-surface-subtle border border-border-sf-subtle">
            <p className="text-xs font-medium text-text-secondary mb-2">
              Metric Dependencies
            </p>
            <ul className="space-y-1.5 text-xs text-text-tertiary">
              <li className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isMarketCapCategoryDisabled ? "bg-text-tertiary" : "bg-brand"}`} />
                <span className={isMarketCapCategoryDisabled ? "line-through opacity-50" : ""}>
                  MarketCapCategory requires MarketContext
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isWhaleConcentrationDisabled ? "bg-text-tertiary" : "bg-brand"}`} />
                <span className={isWhaleConcentrationDisabled ? "line-through opacity-50" : ""}>
                  WhaleConcentration requires On-Chain
                </span>
              </li>
              <li className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${isTokenMaturityDisabled ? "bg-text-tertiary" : "bg-brand"}`} />
                <span className={isTokenMaturityDisabled ? "line-through opacity-50" : ""}>
                  TokenMaturity requires On-Chain
                </span>
              </li>
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
