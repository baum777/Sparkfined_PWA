import { Shield, Percent, DollarSign, Target } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";

export function RiskDefaultsSettings() {
  const [defaultRiskPercent, setDefaultRiskPercent] = useState(() => 
    localStorage.getItem("riskDefaultPercent") || "2"
  );
  const [maxPositionSize, setMaxPositionSize] = useState(() => 
    localStorage.getItem("riskMaxPosition") || "10"
  );
  const [defaultStopType, setDefaultStopType] = useState(() => 
    localStorage.getItem("riskStopType") || "percent"
  );

  useEffect(() => {
    localStorage.setItem("riskDefaultPercent", defaultRiskPercent);
  }, [defaultRiskPercent]);

  useEffect(() => {
    localStorage.setItem("riskMaxPosition", maxPositionSize);
  }, [maxPositionSize]);

  useEffect(() => {
    localStorage.setItem("riskStopType", defaultStopType);
  }, [defaultStopType]);

  return (
    <div className="space-y-4" data-testid="settings-risk-defaults">
      {/* Default Risk % */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Percent className="h-5 w-5 text-muted-foreground" />
          <div>
            <Label className="text-sm font-medium">Default risk per trade</Label>
            <p className="text-xs text-muted-foreground">% of portfolio at risk</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            min="0.1"
            max="10"
            step="0.1"
            value={defaultRiskPercent}
            onChange={(e) => setDefaultRiskPercent(e.target.value)}
            className="w-16 text-right"
            data-testid="risk-default-percent"
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>
      </div>

      {/* Max Position Size */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <DollarSign className="h-5 w-5 text-muted-foreground" />
          <div>
            <Label className="text-sm font-medium">Max position size</Label>
            <p className="text-xs text-muted-foreground">% of total capital</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            min="1"
            max="100"
            step="1"
            value={maxPositionSize}
            onChange={(e) => setMaxPositionSize(e.target.value)}
            className="w-16 text-right"
            data-testid="risk-max-position"
          />
          <span className="text-sm text-muted-foreground">%</span>
        </div>
      </div>

      {/* Default Stop Type */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Target className="h-5 w-5 text-muted-foreground" />
          <div>
            <Label className="text-sm font-medium">Default stop-loss type</Label>
            <p className="text-xs text-muted-foreground">How to calculate stops</p>
          </div>
        </div>
        <Select value={defaultStopType} onValueChange={setDefaultStopType}>
          <SelectTrigger className="w-28" data-testid="risk-stop-type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="percent">Percent</SelectItem>
            <SelectItem value="atr">ATR-based</SelectItem>
            <SelectItem value="fixed">Fixed $</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Info */}
      <div className="rounded-lg bg-muted/50 px-3 py-2">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-primary" />
          <span className="text-xs text-muted-foreground">
            These defaults apply to new trades in the Journal.
          </span>
        </div>
      </div>
    </div>
  );
}
