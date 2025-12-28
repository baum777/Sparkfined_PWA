import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FileText, Zap, Clock, TrendingUp, Undo2, Plus, ChevronDown } from "lucide-react";

export interface JournalTemplate {
  id: string;
  name: string;
  description: string;
  icon: "scalp" | "swing" | "daytrade" | "breakout";
  emotionalState?: string;
  tags?: string[];
  notes?: string;
}

const DEFAULT_TEMPLATES: JournalTemplate[] = [
  {
    id: "scalp",
    name: "Scalp Trade",
    description: "Quick in-and-out momentum plays",
    icon: "scalp",
    tags: ["scalp", "quick"],
    notes: "Quick in-and-out trade.\nKey levels:\nEntry reason:\nExit plan:",
  },
  {
    id: "swing",
    name: "Swing Trade",
    description: "Multi-day position with clear thesis",
    icon: "swing",
    tags: ["swing", "multi-day"],
    notes: "Multi-day position.\nThesis:\nTarget:\nStop:\nTimeframe:",
  },
  {
    id: "daytrade",
    name: "Day Trade",
    description: "Intraday setups with defined R:R",
    icon: "daytrade",
    tags: ["daytrade", "intraday"],
    notes: "Intraday position.\nSetup:\nEntry trigger:\nRisk/Reward:",
  },
  {
    id: "breakout",
    name: "Breakout",
    description: "Momentum breakout with volume confirmation",
    icon: "breakout",
    tags: ["breakout", "momentum"],
    notes: "Breakout setup.\nLevel broken:\nVolume confirmation:\nTarget:",
  },
];

const ICON_MAP = {
  scalp: Zap,
  swing: Clock,
  daytrade: TrendingUp,
  breakout: TrendingUp,
};

interface JournalHeaderProps {
  onApplyTemplate: (template: JournalTemplate) => void;
  onUndo: () => void;
  onCreateTemplate: () => void;
  canUndo: boolean;
  appliedTemplate?: string | null;
  customTemplates?: JournalTemplate[];
}

export function JournalHeader({
  onApplyTemplate,
  onUndo,
  onCreateTemplate,
  canUndo,
  appliedTemplate,
  customTemplates = [],
}: JournalHeaderProps) {
  const [open, setOpen] = useState(false);
  const allTemplates = [...DEFAULT_TEMPLATES, ...customTemplates];

  const handleSelectTemplate = (template: JournalTemplate) => {
    onApplyTemplate(template);
    setOpen(false);
  };

  return (
    <div className="flex flex-col gap-3" data-testid="journal-header">
      <div className="flex items-center gap-3">
        {/* Template Dropdown */}
        <DropdownMenu open={open} onOpenChange={setOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              className="gap-2 min-w-[180px] justify-between"
              data-testid="journal-template-dropdown"
            >
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>{appliedTemplate || "Select Template"}</span>
              </div>
              <ChevronDown className="h-4 w-4 opacity-50" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[280px] max-h-[300px] overflow-y-auto">
            {allTemplates.map((template) => {
              const Icon = ICON_MAP[template.icon];
              const isCustom = template.id.startsWith("custom-");
              return (
                <DropdownMenuItem
                  key={template.id}
                  onClick={() => handleSelectTemplate(template)}
                  className="flex flex-col items-start gap-1 p-3 cursor-pointer"
                  data-testid={`journal-template-${template.id}`}
                >
                  <div className="flex items-center gap-2 font-medium">
                    <Icon className="h-4 w-4 text-primary" />
                    {template.name}
                    {isCustom && (
                      <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                        Custom
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {template.description}
                  </span>
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Create Custom Template */}
        <Button
          variant="ghost"
          size="sm"
          onClick={onCreateTemplate}
          className="gap-2 text-muted-foreground hover:text-foreground"
          data-testid="journal-create-template-btn"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Create Custom Template</span>
          <span className="sm:hidden">Custom</span>
        </Button>
      </div>

      {/* Undo Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onUndo}
        disabled={!canUndo}
        className="w-fit gap-2 text-muted-foreground hover:text-foreground"
        data-testid="journal-undo-btn"
      >
        <Undo2 className="h-4 w-4" />
        Undo
      </Button>
    </div>
  );
}
