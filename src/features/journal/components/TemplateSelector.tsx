import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, Zap, Clock, TrendingUp } from "lucide-react";

export interface TradeTemplate {
  id: string;
  name: string;
  direction?: "long" | "short";
  tags?: string;
  notes?: string;
}

const TEMPLATES: TradeTemplate[] = [
  {
    id: "scalp",
    name: "Scalp Trade",
    tags: "scalp, quick",
    notes: "Quick in-and-out trade. Key levels: \nEntry reason: \nExit plan: ",
  },
  {
    id: "swing",
    name: "Swing Trade",
    tags: "swing, multi-day",
    notes: "Multi-day position. \nThesis: \nTarget: \nStop: \nTimeframe: ",
  },
  {
    id: "daytrade",
    name: "Day Trade",
    tags: "daytrade, intraday",
    notes: "Intraday position. \nSetup: \nEntry trigger: \nRisk/Reward: ",
  },
  {
    id: "breakout",
    name: "Breakout",
    direction: "long",
    tags: "breakout, momentum",
    notes: "Breakout setup. \nLevel broken: \nVolume confirmation: \nTarget: ",
  },
];

interface TemplateSelectorProps {
  onApply: (template: TradeTemplate) => void;
}

export function TemplateSelector({ onApply }: TemplateSelectorProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2"
          data-testid="template-selector-btn"
          aria-label="Apply template to pre-fill fields"
        >
          <FileText className="h-4 w-4" />
          <span className="hidden sm:inline">Apply Template</span>
          <span className="sm:hidden" aria-hidden="true">Template</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {TEMPLATES.map((template) => (
          <DropdownMenuItem
            key={template.id}
            onClick={() => onApply(template)}
            className="cursor-pointer gap-2"
            data-testid={`template-${template.id}`}
          >
            {template.id === "scalp" && <Zap className="h-4 w-4" />}
            {template.id === "swing" && <Clock className="h-4 w-4" />}
            {template.id === "daytrade" && <TrendingUp className="h-4 w-4" />}
            {template.id === "breakout" && <TrendingUp className="h-4 w-4" />}
            <span>Apply {template.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
