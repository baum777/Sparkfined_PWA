import { Save, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StickyActionBarProps {
  onSave: () => void;
  onReset: () => void;
  isSaving?: boolean;
  isDirty?: boolean;
  isValid?: boolean;
}

export function StickyActionBar({ 
  onSave, 
  onReset, 
  isSaving = false,
  isDirty = false,
  isValid = false,
}: StickyActionBarProps) {
  return (
    <div 
      className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-border bg-background/95 backdrop-blur-sm px-4 py-3 -mx-4 mt-4"
      data-testid="sticky-action-bar"
    >
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onReset}
        disabled={!isDirty || isSaving}
        data-testid="reset-form-btn"
      >
        <RotateCcw className="mr-2 h-4 w-4" />
        Reset
      </Button>
      
      <Button
        type="submit"
        onClick={onSave}
        disabled={!isValid || isSaving}
        data-testid="save-entry-btn"
      >
        <Save className="mr-2 h-4 w-4" />
        {isSaving ? "Saving..." : "Save Entry"}
      </Button>
    </div>
  );
}
