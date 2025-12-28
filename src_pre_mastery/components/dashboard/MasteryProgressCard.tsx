import { Target } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface MasteryProgressCardProps {
  currentStep?: number;
  totalSteps?: number;
}

export function MasteryProgressCard({ 
  currentStep = 0, 
  totalSteps = 5 
}: MasteryProgressCardProps) {
  const progressPercent = Math.min((currentStep / totalSteps) * 100, 100);

  return (
    <Card data-testid="dashboard-mastery-progress" className="bg-muted/30">
      <CardContent className="py-3 px-4">
        <div className="flex items-center gap-3">
          <Target className="h-4 w-4 text-muted-foreground shrink-0" />
          <div className="flex-1 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Mastery Progress</span>
              <span className="text-muted-foreground">{currentStep}/{totalSteps}</span>
            </div>
            <Progress value={progressPercent} className="h-1.5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
