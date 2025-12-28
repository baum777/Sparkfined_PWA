import { useState } from "react";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface AdditionalSlidersProps {
  conviction: number;
  patternQuality: number;
  onConvictionChange: (value: number) => void;
  onPatternQualityChange: (value: number) => void;
}

export function AdditionalSliders({
  conviction,
  patternQuality,
  onConvictionChange,
  onPatternQualityChange,
}: AdditionalSlidersProps) {
  const [open, setOpen] = useState(false);

  return (
    <Collapsible open={open} onOpenChange={setOpen} data-testid="additional-sliders">
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between text-muted-foreground hover:text-foreground"
          data-testid="additional-sliders-toggle"
        >
          <span>Additional Metrics</span>
          <ChevronDown className={cn("h-4 w-4 transition-transform", open && "rotate-180")} />
        </Button>
      </CollapsibleTrigger>
      
      <CollapsibleContent className="pt-4">
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Conviction Slider */}
          <div className="space-y-3" data-testid="conviction-slider">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Conviction</Label>
              <span className="text-sm font-mono tabular-nums">{conviction}%</span>
            </div>
            <Slider
              value={[conviction]}
              onValueChange={([v]) => onConvictionChange(v)}
              min={0}
              max={100}
              step={1}
              data-testid="conviction-slider-input"
            />
            <p className="text-[10px] text-muted-foreground">
              How strongly do you believe in this setup?
            </p>
          </div>
          
          {/* Pattern Quality Slider */}
          <div className="space-y-3" data-testid="pattern-quality-slider">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">Pattern Quality</Label>
              <span className="text-sm font-mono tabular-nums">{patternQuality}%</span>
            </div>
            <Slider
              value={[patternQuality]}
              onValueChange={([v]) => onPatternQualityChange(v)}
              min={0}
              max={100}
              step={1}
              data-testid="pattern-quality-slider-input"
            />
            <p className="text-[10px] text-muted-foreground">
              How clean is the technical pattern?
            </p>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
