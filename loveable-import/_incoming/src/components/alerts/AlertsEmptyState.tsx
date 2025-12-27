import { Bell, LineChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface AlertsEmptyStateProps {
  onCreateClick: () => void;
}

export function AlertsEmptyState({ onCreateClick }: AlertsEmptyStateProps) {
  return (
    <div 
      className="flex flex-col items-center justify-center gap-6 py-16 text-center"
      data-testid="alerts-empty-state"
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-muted">
        <Bell className="h-8 w-8 text-muted-foreground" />
      </div>
      
      <div className="space-y-2">
        <h2 className="text-xl font-semibold">No alerts yet</h2>
        <p className="max-w-sm text-muted-foreground">
          Set up price alerts to get notified when your targets are hit.
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button 
          onClick={onCreateClick}
          data-testid="btn-create-first-alert"
        >
          Create Your First Alert
        </Button>
        <Button 
          variant="outline" 
          asChild
          data-testid="btn-go-to-chart"
        >
          <Link to="/chart">
            <LineChart className="mr-2 h-4 w-4" />
            Go to Chart
          </Link>
        </Button>
      </div>
    </div>
  );
}
