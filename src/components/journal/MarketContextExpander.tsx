import { useState } from "react";
import { ChevronDown, Globe, Clock, TrendingUp } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface MarketContextData {
  marketCondition: string;
  session: string;
  keyLevels: string;
}

interface MarketContextExpanderProps {
  value: MarketContextData;
  onChange: (value: MarketContextData) => void;
  defaultOpen?: boolean;
}

export function MarketContextExpander({ 
  value, 
  onChange, 
  defaultOpen = false 
}: MarketContextExpanderProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible 
      open={isOpen} 
      onOpenChange={setIsOpen}
      data-testid="market-context-expander"
    >
      <CollapsibleTrigger className="flex w-full items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2 text-sm hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background">
        <span className="flex items-center gap-2 text-muted-foreground">
          <Globe className="h-4 w-4" />
          Market Context
          <span className="text-xs">(optional)</span>
        </span>
        <ChevronDown className={cn(
          "h-4 w-4 text-muted-foreground transition-transform duration-200",
          isOpen && "rotate-180"
        )} />
      </CollapsibleTrigger>
      
      <CollapsibleContent className="pt-3 space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="market-condition" className="text-sm flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
              Market Condition
            </Label>
            <Input
              id="market-condition"
              value={value.marketCondition}
              onChange={(e) => onChange({ ...value, marketCondition: e.target.value })}
              placeholder="e.g., Trending, Ranging, Volatile"
              data-testid="market-condition-input"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="session" className="text-sm flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              Session
            </Label>
            <Input
              id="session"
              value={value.session}
              onChange={(e) => onChange({ ...value, session: e.target.value })}
              placeholder="e.g., London, NY, Asia"
              data-testid="session-input"
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="key-levels" className="text-sm">
            Key Levels / Notes
          </Label>
          <Textarea
            id="key-levels"
            value={value.keyLevels}
            onChange={(e) => onChange({ ...value, keyLevels: e.target.value })}
            placeholder="Support/resistance levels, news, correlations..."
            className="min-h-[60px] resize-none"
            data-testid="key-levels-textarea"
          />
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
