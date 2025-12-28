import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ArchiveReason } from "../types";

interface LogbookFiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  reasonFilter: ArchiveReason | "all";
  onReasonFilterChange: (value: ArchiveReason | "all") => void;
  dateFilter: "all" | "today" | "week" | "month";
  onDateFilterChange: (value: "all" | "today" | "week" | "month") => void;
}

export function LogbookFilters({
  search,
  onSearchChange,
  reasonFilter,
  onReasonFilterChange,
  dateFilter,
  onDateFilterChange,
}: LogbookFiltersProps) {
  return (
    <div 
      className="flex flex-col sm:flex-row gap-3"
      data-testid="logbook-filters"
    >
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-tertiary" />
        <Input
          placeholder="Search tokens..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-9 bg-surface-subtle border-border-sf-moderate"
          data-testid="logbook-search"
        />
      </div>

      {/* Reason Filter */}
      <Select
        value={reasonFilter}
        onValueChange={(v) => onReasonFilterChange(v as ArchiveReason | "all")}
      >
        <SelectTrigger 
          className="w-full sm:w-36 bg-surface-subtle border-border-sf-moderate"
          data-testid="logbook-filter-reason"
        >
          <Filter className="h-4 w-4 mr-2 text-text-tertiary" />
          <SelectValue placeholder="Reason" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Reasons</SelectItem>
          <SelectItem value="full_exit">Full Exit</SelectItem>
          <SelectItem value="expired">Expired</SelectItem>
          <SelectItem value="manual">Manual</SelectItem>
        </SelectContent>
      </Select>

      {/* Date Filter */}
      <Select
        value={dateFilter}
        onValueChange={(v) => onDateFilterChange(v as "all" | "today" | "week" | "month")}
      >
        <SelectTrigger 
          className="w-full sm:w-32 bg-surface-subtle border-border-sf-moderate"
          data-testid="logbook-filter-date"
        >
          <SelectValue placeholder="Date" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Time</SelectItem>
          <SelectItem value="today">Today</SelectItem>
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
