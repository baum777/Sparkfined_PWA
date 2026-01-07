import { Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendPill } from './TrendPill';
import type { WatchlistItem } from '@/features/watchlist/types';
import { cn } from '@/lib/utils';

interface WatchlistCardProps {
  item: WatchlistItem;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
}

export function WatchlistCard({ item, isSelected, onSelect, onRemove }: WatchlistCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ring-offset-background',
        isSelected && 'ring-2 ring-primary bg-accent/30'
      )}
      onClick={onSelect}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect();
        }
      }}
      aria-selected={isSelected}
      data-testid={`watchlist-card-${item.symbol.toLowerCase()}`}
    >
      <CardContent className="p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-semibold text-lg">{item.symbol}</span>
              <span className="text-sm text-muted-foreground truncate">{item.name}</span>
            </div>
            {item.trend && (
              <TrendPill trend={item.trend} relevance={item.relevance} />
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              onRemove();
            }}
            aria-label={`Remove ${item.symbol} from watchlist`}
            data-testid={`watchlist-remove-${item.symbol.toLowerCase()}`}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
