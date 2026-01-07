import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { SortOption } from "@/hooks/useLessons";

interface LessonFiltersProps {
  categories: readonly string[];
  activeCategories: string[];
  sortOption: SortOption;
  onCategoryToggle: (category: string) => void;
  onSortChange: (sort: SortOption) => void;
  onReset: () => void;
}

export function LessonFilters({
  categories,
  activeCategories,
  sortOption,
  onCategoryToggle,
  onSortChange,
  onReset,
}: LessonFiltersProps) {
  const hasActiveFilters = activeCategories.length > 0 || sortOption !== "newest";

  return (
    <div className="space-y-3" data-testid="lesson-filters">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={sortOption}
          onValueChange={(value) => onSortChange(value as SortOption)}
        >
          <SelectTrigger 
            className="w-[180px] bg-card focus-visible:ring-offset-background" 
            aria-label="Sort lessons"
            data-testid="sort-select"
          >
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent className="bg-popover">
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="difficulty-asc">Difficulty: Low → High</SelectItem>
            <SelectItem value="difficulty-desc">Difficulty: High → Low</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="text-muted-foreground hover:text-foreground focus-visible:ring-offset-background"
            data-testid="reset-filters"
          >
            <X className="mr-1 h-3 w-3" aria-hidden="true" />
            Reset
          </Button>
        )}
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {categories.map((category) => {
          const isActive = activeCategories.includes(category);
          return (
            <button
              key={category}
              onClick={() => onCategoryToggle(category)}
              className={`
                inline-flex items-center rounded-full px-3 py-1 text-sm font-medium
                transition-colors focus-visible:outline-none focus-visible:ring-2 
                focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background
                ${isActive 
                  ? "bg-primary text-primary-foreground ring-2 ring-primary/30" 
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
                }
              `}
              aria-pressed={isActive}
              data-testid={`filter-chip-${category.toLowerCase().replace(/\s+/g, "-")}`}
            >
              {category}
              {isActive && (
                <X className="ml-1 h-3 w-3" aria-hidden="true" />
              )}
            </button>
          );
        })}
      </div>

      {activeCategories.length > 0 && (
        <div className="flex flex-wrap gap-1" aria-live="polite">
          <span className="text-xs text-muted-foreground">Active:</span>
          {activeCategories.map((cat) => (
            <Badge key={cat} variant="secondary" className="text-xs">
              {cat}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
