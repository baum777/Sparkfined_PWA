import * as React from "react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  useHandbookContext,
  useDemoMode,
  enableDemoMode,
  disableDemoMode,
  setDemoOverride,
  getDemoOverrides,
  resetDemoOverrides,
} from "@/lib/handbook/handbookContext";
import type { HandbookContext } from "@/lib/handbook/types";
import { Beaker, ChevronDown, ChevronRight, RotateCcw } from "lucide-react";

const GATE_LABELS: Record<keyof HandbookContext, string> = {
  walletConnected: "Wallet Connected",
  hasMonitoredWallet: "Has Monitored Wallet",
  hasHoldings: "Has Holdings",
  hasEntries: "Has Journal Entries",
  hasWatchlist: "Has Watchlist Items",
  hasAlerts: "Has Alerts",
  isOffline: "Is Offline",
  hasSelectedToken: "Has Selected Token",
};

export function DemoGateToggle() {
  const context = useHandbookContext();
  const isDemoMode = useDemoMode();
  const [isOpen, setIsOpen] = React.useState(false);

  const overrides = getDemoOverrides();
  const overrideCount = Object.keys(overrides).length;

  const handleToggleGate = (key: keyof HandbookContext) => {
    const currentValue = context[key];
    setDemoOverride(key, !currentValue);
  };

  const handleToggleDemoMode = () => {
    if (isDemoMode) {
      disableDemoMode();
    } else {
      enableDemoMode();
    }
  };

  const handleReset = () => {
    resetDemoOverrides();
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between h-9 px-3 text-xs hover:bg-surface-hover"
        >
          <div className="flex items-center gap-2">
            <Beaker className="h-3.5 w-3.5 text-warning" />
            <span className="text-text-secondary">Demo Mode</span>
            {isDemoMode && (
              <Badge variant="outline" className="text-[10px] h-4 px-1 bg-warning/10 text-warning border-warning/30">
                Active
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            {overrideCount > 0 && isDemoMode && (
              <span className="text-[10px] text-text-tertiary">{overrideCount} overrides</span>
            )}
            {isOpen ? (
              <ChevronDown className="h-3.5 w-3.5 text-text-tertiary" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-text-tertiary" />
            )}
          </div>
        </Button>
      </CollapsibleTrigger>

      <CollapsibleContent className="px-3 pb-3 space-y-3">
        {/* Enable/disable demo mode */}
        <div className="flex items-center justify-between p-2 rounded-lg bg-surface-subtle border border-border-sf-subtle">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-text-primary">Enable Demo Mode</span>
            <span className="text-[10px] text-text-tertiary">Override gate states for testing</span>
          </div>
          <Switch
            checked={isDemoMode}
            onCheckedChange={handleToggleDemoMode}
            className="data-[state=checked]:bg-warning"
          />
        </div>

        {isDemoMode && (
          <>
            {/* Reset button */}
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs text-text-tertiary hover:text-text-secondary"
                onClick={handleReset}
                disabled={overrideCount === 0}
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Reset All
              </Button>
            </div>

            {/* Gate toggles */}
            <div className="space-y-1">
              {(Object.keys(GATE_LABELS) as Array<keyof HandbookContext>).map((key) => {
                const isOverridden = key in overrides;
                const currentValue = context[key];

                return (
                  <div
                    key={key}
                    className={`flex items-center justify-between p-2 rounded-lg transition-colors ${
                      isOverridden ? "bg-warning/10 border border-warning/20" : "bg-surface-subtle"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-text-secondary">{GATE_LABELS[key]}</span>
                      {isOverridden && (
                        <Badge variant="outline" className="text-[9px] h-3.5 px-1 text-warning border-warning/30">
                          override
                        </Badge>
                      )}
                    </div>
                    <Switch
                      checked={currentValue}
                      onCheckedChange={() => handleToggleGate(key)}
                      className="h-4 w-7 data-[state=checked]:bg-brand"
                    />
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
