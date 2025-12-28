import { BarChart3, Clock, Palette } from "lucide-react";
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

export function ChartPrefsSettings() {
  const [defaultTimeframe, setDefaultTimeframe] = useState(() => 
    localStorage.getItem("chartDefaultTimeframe") || "1H"
  );
  const [showVolume, setShowVolume] = useState(() => 
    localStorage.getItem("chartShowVolume") !== "false"
  );
  const [candleStyle, setCandleStyle] = useState(() => 
    localStorage.getItem("chartCandleStyle") || "candles"
  );

  useEffect(() => {
    localStorage.setItem("chartDefaultTimeframe", defaultTimeframe);
  }, [defaultTimeframe]);

  useEffect(() => {
    localStorage.setItem("chartShowVolume", String(showVolume));
  }, [showVolume]);

  useEffect(() => {
    localStorage.setItem("chartCandleStyle", candleStyle);
  }, [candleStyle]);

  return (
    <div className="space-y-4" data-testid="settings-chart-prefs">
      {/* Default Timeframe */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <div>
            <Label className="text-sm font-medium">Default timeframe</Label>
            <p className="text-xs text-muted-foreground">Chart opens with this TF</p>
          </div>
        </div>
        <Select value={defaultTimeframe} onValueChange={setDefaultTimeframe}>
          <SelectTrigger className="w-24" data-testid="chart-pref-timeframe">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1M">1M</SelectItem>
            <SelectItem value="5M">5M</SelectItem>
            <SelectItem value="15M">15M</SelectItem>
            <SelectItem value="1H">1H</SelectItem>
            <SelectItem value="4H">4H</SelectItem>
            <SelectItem value="1D">1D</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Show Volume */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <div>
            <Label htmlFor="show-volume" className="text-sm font-medium">Show volume</Label>
            <p className="text-xs text-muted-foreground">Display volume bars on chart</p>
          </div>
        </div>
        <Switch
          id="show-volume"
          checked={showVolume}
          onCheckedChange={setShowVolume}
          data-testid="chart-pref-volume"
        />
      </div>

      {/* Candle Style */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Palette className="h-5 w-5 text-muted-foreground" />
          <div>
            <Label className="text-sm font-medium">Chart style</Label>
            <p className="text-xs text-muted-foreground">Visual representation</p>
          </div>
        </div>
        <Select value={candleStyle} onValueChange={setCandleStyle}>
          <SelectTrigger className="w-28" data-testid="chart-pref-style">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="candles">Candles</SelectItem>
            <SelectItem value="bars">Bars</SelectItem>
            <SelectItem value="line">Line</SelectItem>
            <SelectItem value="area">Area</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
