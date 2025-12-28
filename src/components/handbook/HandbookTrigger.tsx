import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HelpCircle } from "lucide-react";
import { useHandbookPanel } from "@/hooks/useHandbookPanel";

export function HandbookTrigger() {
  const { toggle } = useHandbookPanel();

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggle}
          className="h-8 w-8 text-text-secondary hover:text-text-primary hover:bg-surface-hover"
          aria-label="Open Handbook"
          data-testid="handbook-trigger"
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <p>Handbook <kbd className="ml-1 text-[10px] opacity-70">?</kbd></p>
      </TooltipContent>
    </Tooltip>
  );
}
