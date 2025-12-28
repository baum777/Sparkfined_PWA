import { Link } from "react-router-dom";
import { Lock, Play, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { Lesson } from "@/hooks/useLessons";

interface LessonCardProps {
  lesson: Lesson;
}

function DifficultyIndicator({ level }: { level: number }) {
  return (
    <div 
      className="flex items-center gap-1"
      role="meter"
      aria-label={`Difficulty level ${level} out of 5`}
      aria-valuenow={level}
      aria-valuemin={1}
      aria-valuemax={5}
    >
      <span className="sr-only">Difficulty: {level} of 5</span>
      <span className="text-xs text-muted-foreground mr-1" aria-hidden="true">
        Difficulty:
      </span>
      {[1, 2, 3, 4, 5].map((dot) => (
        <span
          key={dot}
          className={`h-2 w-2 rounded-full transition-colors ${
            dot <= level ? "bg-primary" : "bg-muted"
          }`}
          aria-hidden="true"
        />
      ))}
      <span className="text-xs text-muted-foreground ml-1" aria-hidden="true">
        {level}/5
      </span>
    </div>
  );
}

export function LessonCard({ lesson }: LessonCardProps) {
  const { id, title, category, difficulty, isLocked, applyTip, unlockHint, drillRoute } = lesson;

  return (
    <Card 
      className={`transition-all ${isLocked ? "opacity-60" : "hover:border-primary/50"}`}
      data-testid={`lesson-card-${id}`}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-1">
            <Badge variant="outline" className="text-xs">
              {category}
            </Badge>
            <CardTitle className="text-base leading-tight">
              {isLocked && (
                <Lock className="mr-1.5 inline h-4 w-4 text-muted-foreground" aria-hidden="true" />
              )}
              {title}
            </CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <DifficultyIndicator level={difficulty} />

        {/* Apply today tip */}
        <div className="flex items-start gap-2 rounded-md bg-muted/50 p-2">
          <Lightbulb className="h-4 w-4 shrink-0 text-yellow-500" aria-hidden="true" />
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Apply today:</span>{" "}
            {applyTip}
          </p>
        </div>

        {isLocked ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="secondary" 
                  size="sm" 
                  className="w-full" 
                  disabled
                  aria-describedby={`unlock-hint-${id}`}
                >
                  <Lock className="mr-2 h-4 w-4" aria-hidden="true" />
                  Locked
                </Button>
              </TooltipTrigger>
              <TooltipContent id={`unlock-hint-${id}`} className="bg-popover">
                <p>{unlockHint}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <Button 
            asChild 
            size="sm" 
            className="w-full focus-visible:ring-offset-background"
            data-testid={`start-drill-${id}`}
          >
            <Link to={drillRoute}>
              <Play className="mr-2 h-4 w-4" aria-hidden="true" />
              Start Drill
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
