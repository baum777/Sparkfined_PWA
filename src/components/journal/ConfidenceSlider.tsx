import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";

interface ConfidenceSliderProps {
  value: number;
  onChange: (value: number) => void;
}

export function ConfidenceSlider({ value, onChange }: ConfidenceSliderProps) {
  // Calculate gradient color based on value (0-100)
  const getGradientColor = (val: number) => {
    if (val < 30) return "bg-destructive";
    if (val < 50) return "bg-orange-500";
    if (val < 70) return "bg-yellow-500";
    return "bg-chart-2";
  };

  return (
    <div className="space-y-3" data-testid="confidence-slider">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Confidence Level</Label>
        <span className="text-sm font-mono tabular-nums">{value}%</span>
      </div>
      
      <div className="relative">
        {/* Gradient background track */}
        <div 
          className="absolute inset-0 h-2 rounded-full top-1/2 -translate-y-1/2"
          style={{
            background: "linear-gradient(to right, hsl(var(--destructive)), hsl(38 92% 50%), hsl(48 96% 53%), hsl(var(--chart-2)))"
          }}
        />
        
        <Slider
          value={[value]}
          onValueChange={([v]) => onChange(v)}
          min={0}
          max={100}
          step={1}
          className="relative"
          data-testid="confidence-slider-input"
        />
      </div>
      
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>Low confidence</span>
        <span>High confidence</span>
      </div>
    </div>
  );
}
