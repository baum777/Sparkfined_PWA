import { useState, useMemo } from "react";
import { GraduationCap } from "lucide-react";
import { useLessons, type SortOption } from "@/hooks/useLessons";
import { LessonCard, LessonFilters, UnlockCallout } from "@/components/lessons";

export default function Learn() {
  const { lessons, categories, unlockedCount, totalCount } = useLessons();
  const [activeCategories, setActiveCategories] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState<SortOption>("newest");

  const handleCategoryToggle = (category: string) => {
    setActiveCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category]
    );
  };

  const handleReset = () => {
    setActiveCategories([]);
    setSortOption("newest");
  };

  const filteredAndSortedLessons = useMemo(() => {
    let result = [...lessons];

    // Filter by category
    if (activeCategories.length > 0) {
      result = result.filter((l) => activeCategories.includes(l.category));
    }

    // Sort
    if (sortOption === "difficulty-asc") {
      result.sort((a, b) => a.difficulty - b.difficulty);
    } else if (sortOption === "difficulty-desc") {
      result.sort((a, b) => b.difficulty - a.difficulty);
    }

    return result;
  }, [lessons, activeCategories, sortOption]);

  const lockedCount = totalCount - unlockedCount;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6" data-testid="page-learn">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
          <GraduationCap className="h-6 w-6 text-primary" aria-hidden="true" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Learn</h1>
          <p className="text-sm text-muted-foreground">
            {unlockedCount} of {totalCount} lessons unlocked — degen → mastery
          </p>
        </div>
      </div>

      {/* Unlock callout */}
      <UnlockCallout lockedCount={lockedCount} />

      {/* Filters */}
      <LessonFilters
        categories={categories}
        activeCategories={activeCategories}
        sortOption={sortOption}
        onCategoryToggle={handleCategoryToggle}
        onSortChange={setSortOption}
        onReset={handleReset}
      />

      {/* Lessons grid */}
      <div 
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        role="list"
        aria-label="Lessons"
      >
        {filteredAndSortedLessons.map((lesson) => (
          <div key={lesson.id} role="listitem">
            <LessonCard lesson={lesson} />
          </div>
        ))}
      </div>

      {filteredAndSortedLessons.length === 0 && (
        <div 
          className="rounded-md bg-muted/30 py-8 text-center text-muted-foreground"
          data-testid="lessons-empty-state"
        >
          No lessons match your filters.{" "}
          <button
            onClick={handleReset}
            className="text-primary underline underline-offset-2 hover:text-primary/80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background rounded"
            data-testid="btn-reset-filters"
          >
            Reset filters
          </button>
        </div>
      )}
    </div>
  );
}
