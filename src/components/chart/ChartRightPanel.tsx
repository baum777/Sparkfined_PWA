import { useState } from "react";
import { 
  Pencil, TrendingUp, LineChart, BarChart3, 
  Minus, Circle, Square, Triangle, Type, ArrowUpRight,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const DRAWING_TOOLS = [
  { id: "line", label: "Trend Line", icon: Minus },
  { id: "hline", label: "Horizontal Line", icon: Minus },
  { id: "vline", label: "Vertical Line", icon: Minus },
  { id: "ray", label: "Ray", icon: ArrowUpRight },
  { id: "rectangle", label: "Rectangle", icon: Square },
  { id: "circle", label: "Circle", icon: Circle },
  { id: "triangle", label: "Triangle", icon: Triangle },
  { id: "fib", label: "Fibonacci Retracement", icon: TrendingUp },
  { id: "text", label: "Text", icon: Type },
];

const INDICATORS = [
  { id: "sma", label: "SMA (Simple Moving Average)", category: "Trend" },
  { id: "ema", label: "EMA (Exponential Moving Average)", category: "Trend" },
  { id: "bb", label: "Bollinger Bands", category: "Volatility" },
  { id: "rsi", label: "RSI (Relative Strength Index)", category: "Momentum" },
  { id: "macd", label: "MACD", category: "Momentum" },
  { id: "stoch", label: "Stochastic", category: "Momentum" },
  { id: "atr", label: "ATR (Average True Range)", category: "Volatility" },
  { id: "volume", label: "Volume", category: "Volume" },
  { id: "vwap", label: "VWAP", category: "Volume" },
];

interface ChartRightPanelProps {
  className?: string;
  onDrawingToolSelect?: (toolId: string) => void;
  onIndicatorSelect?: (indicatorId: string) => void;
}

export function ChartRightPanel({ 
  className, 
  onDrawingToolSelect, 
  onIndicatorSelect 
}: ChartRightPanelProps) {
  const [selectedTool, setSelectedTool] = useState<string | null>(null);
  const [activeIndicators, setActiveIndicators] = useState<string[]>(["sma", "volume"]);

  const handleToolSelect = (toolId: string) => {
    setSelectedTool(toolId);
    onDrawingToolSelect?.(toolId);
  };

  const handleIndicatorToggle = (indicatorId: string) => {
    setActiveIndicators((prev) => {
      if (prev.includes(indicatorId)) {
        return prev.filter((id) => id !== indicatorId);
      }
      return [...prev, indicatorId];
    });
    onIndicatorSelect?.(indicatorId);
  };

  const selectedToolLabel = DRAWING_TOOLS.find((t) => t.id === selectedTool)?.label || "Select Tool";

  return (
    <aside
      className={cn(
        "flex flex-col gap-4 border-l border-border bg-card p-4",
        className
      )}
      data-testid="chart-right-panel"
    >
      {/* Drawing Tools Card */}
      <Card data-testid="chart-drawing-tools-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <Pencil className="h-4 w-4" />
            Drawing Tools
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between"
                data-testid="chart-drawing-tools-dropdown"
              >
                <span className="truncate">{selectedToolLabel}</span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-56 bg-popover z-50" 
              align="start"
            >
              {DRAWING_TOOLS.map((tool) => (
                <DropdownMenuItem
                  key={tool.id}
                  onClick={() => handleToolSelect(tool.id)}
                  className={cn(
                    "cursor-pointer",
                    selectedTool === tool.id && "bg-accent"
                  )}
                  data-testid={`chart-tool-${tool.id}`}
                >
                  <tool.icon className="mr-2 h-4 w-4" />
                  {tool.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>

      {/* Indicators Card */}
      <Card data-testid="chart-indicators-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold">
            <LineChart className="h-4 w-4" />
            Indicators
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button 
                variant="outline" 
                className="w-full justify-between"
                data-testid="chart-indicators-dropdown"
              >
                <span className="truncate">
                  {activeIndicators.length > 0 
                    ? `${activeIndicators.length} active` 
                    : "Add Indicator"}
                </span>
                <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent 
              className="w-64 bg-popover z-50 max-h-64 overflow-y-auto" 
              align="start"
            >
              {INDICATORS.map((indicator) => (
                <DropdownMenuItem
                  key={indicator.id}
                  onClick={() => handleIndicatorToggle(indicator.id)}
                  className={cn(
                    "cursor-pointer flex items-center justify-between",
                    activeIndicators.includes(indicator.id) && "bg-accent"
                  )}
                  data-testid={`chart-indicator-${indicator.id}`}
                >
                  <div className="flex flex-col">
                    <span>{indicator.label}</span>
                    <span className="text-xs text-muted-foreground">
                      {indicator.category}
                    </span>
                  </div>
                  {activeIndicators.includes(indicator.id) && (
                    <span className="h-2 w-2 rounded-full bg-primary" />
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          {/* Active indicators list */}
          {activeIndicators.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {activeIndicators.map((id) => {
                const indicator = INDICATORS.find((i) => i.id === id);
                return (
                  <span
                    key={id}
                    className="inline-flex items-center rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                  >
                    {indicator?.id.toUpperCase()}
                  </span>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </aside>
  );
}
