import { AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface ThesisInputProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
}

export function ThesisInput({ value, onChange, error }: ThesisInputProps) {
  return (
    <div className="space-y-2" data-testid="thesis-input">
      <div className="flex items-center gap-2">
        <Label htmlFor="thesis" className="text-sm font-medium">
          Thesis <span className="text-destructive">*</span>
        </Label>
        {error && (
          <span className="flex items-center gap-1 text-xs text-destructive">
            <AlertCircle className="h-3 w-3" />
            Required
          </span>
        )}
      </div>
      <Textarea
        id="thesis"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Why are you taking this trade? What's your edge?"
        className={cn(
          "min-h-[100px] resize-none",
          error && !value && "border-destructive"
        )}
        data-testid="thesis-textarea"
      />
      <p className="text-xs text-muted-foreground">
        Be specific about your reasoning and expected outcome
      </p>
    </div>
  );
}

import { cn } from "@/lib/utils";
