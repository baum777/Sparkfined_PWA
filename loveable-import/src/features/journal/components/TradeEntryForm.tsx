import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TemplateSelector, TradeTemplate } from "./TemplateSelector";
import { AiNotesStatus } from "@/components/journal/AiNotesStatus";
import { Save, TrendingUp, TrendingDown, ArrowRight } from "lucide-react";

const tradeSchema = z.object({
  asset: z.string().min(1, "Asset/symbol is required"),
  direction: z.enum(["long", "short"], {
    required_error: "Select trade direction",
  }),
  entryPrice: z.string().min(1, "Entry price is required"),
  entryDate: z.string().min(1, "Entry date is required"),
  exitPrice: z.string().optional(),
  pnl: z.string().optional(),
  notes: z.string().optional(),
  tags: z.string().optional(),
});

type TradeFormData = z.infer<typeof tradeSchema>;

interface TradeEntryFormProps {
  onSubmit?: (data: TradeFormData) => void;
}

export function TradeEntryForm({ onSubmit }: TradeEntryFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [templateApplied, setTemplateApplied] = useState<string | null>(null);

  const form = useForm<TradeFormData>({
    resolver: zodResolver(tradeSchema),
    defaultValues: {
      asset: "",
      direction: undefined,
      entryPrice: "",
      entryDate: new Date().toISOString().split("T")[0],
      exitPrice: "",
      pnl: "",
      notes: "",
      tags: "",
    },
  });

  const handleSubmit = (data: TradeFormData) => {
    onSubmit?.(data);
    form.reset();
  };

  const handleError = () => {
    // Focus first invalid field
    const firstError = Object.keys(form.formState.errors)[0] as keyof TradeFormData;
    if (firstError) {
      const element = formRef.current?.querySelector(`[name="${firstError}"]`);
      if (element instanceof HTMLElement) {
        element.focus();
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  };

  const applyTemplate = (template: TradeTemplate) => {
    if (template.direction) {
      form.setValue("direction", template.direction);
    }
    if (template.tags) {
      form.setValue("tags", template.tags);
    }
    if (template.notes) {
      form.setValue("notes", template.notes);
    }
    // Show feedback briefly
    setTemplateApplied(template.name);
    setTimeout(() => setTemplateApplied(null), 2000);
  };

  return (
    <Card data-testid="trade-entry-form">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-lg">Log Trade</CardTitle>
          <div className="flex items-center gap-2">
            {templateApplied && (
              <span 
                className="text-xs text-success animate-in fade-in slide-in-from-right-2 duration-200"
                data-testid="template-applied-feedback"
              >
                ✓ {templateApplied} applied
              </span>
            )}
            <TemplateSelector onApply={applyTemplate} />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            ref={formRef}
            onSubmit={form.handleSubmit(handleSubmit, handleError)}
            className="space-y-4"
          >
            {/* Required Fields Section */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="asset"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Asset / Symbol <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., BTC, ETH, AAPL"
                        {...field}
                        aria-required="true"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="direction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Direction <span className="text-destructive">*</span>
                    </FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} name="direction">
                      <FormControl>
                        <SelectTrigger aria-required="true" name="direction">
                          <SelectValue placeholder="Select direction" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="long">
                          <span className="flex items-center gap-2">
                            <TrendingUp className="h-4 w-4 text-chart-2" />
                            Long
                          </span>
                        </SelectItem>
                        <SelectItem value="short">
                          <span className="flex items-center gap-2">
                            <TrendingDown className="h-4 w-4 text-destructive" />
                            Short
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="entryPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Entry Price <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="any"
                        placeholder="0.00"
                        {...field}
                        aria-required="true"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="entryDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Entry Date <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} aria-required="true" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Optional Fields Section */}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="exitPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Exit Price</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="pnl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>P&L</FormLabel>
                    <FormControl>
                      <Input type="number" step="any" placeholder="+/- 0.00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., breakout, scalp, swing" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Notes</FormLabel>
                    <AiNotesStatus status="demo" />
                  </div>
                  <FormControl>
                    <Textarea
                      placeholder="What was your thesis? What did you learn?"
                      className="min-h-[100px] resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
              <Button type="submit" className="w-full sm:w-auto focus-visible:ring-offset-background" data-testid="save-trade-btn">
                <Save className="mr-2 h-4 w-4" />
                Save Trade
              </Button>
              <span 
                className="text-xs text-muted-foreground flex items-center gap-1"
                data-testid="journal-mastery-cue"
              >
                <span className="opacity-70">degen</span>
                <ArrowRight className="h-3 w-3 opacity-50" />
                <span>mastery</span>
                <span className="opacity-50">— each log sharpens your edge</span>
              </span>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
