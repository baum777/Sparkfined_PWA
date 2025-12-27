import { Link } from 'react-router-dom';
import { LineChart, Play } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendPill } from './TrendPill';
import type { WatchlistItem } from '@/features/watchlist/types';

interface WatchlistSymbolDetailProps {
  item: WatchlistItem;
}

export function WatchlistSymbolDetail({ item }: WatchlistSymbolDetailProps) {
  return (
    <Card data-testid="watchlist-detail-panel">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-3">
          <span>{item.symbol}</span>
          <span className="text-base font-normal text-muted-foreground">{item.name}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {item.trend && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Trend:</span>
            <TrendPill trend={item.trend} relevance={item.relevance} />
          </div>
        )}
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild className="focus-visible:ring-offset-background" data-testid="open-chart">
            <Link to={`/chart?symbol=${item.symbol}`}>
              <LineChart className="h-4 w-4 mr-2" />
              Analyze in Chart
            </Link>
          </Button>
          <Button variant="outline" asChild className="focus-visible:ring-offset-background" data-testid="open-replay">
            <Link to={`/replay?symbol=${item.symbol}`}>
              <Play className="h-4 w-4 mr-2" />
              Practice in Replay
            </Link>
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Added {item.addedAt.toLocaleDateString()}
        </p>
      </CardContent>
    </Card>
  );
}
