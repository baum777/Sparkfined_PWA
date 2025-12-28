import { useState, useRef } from 'react';
import { Eye } from 'lucide-react';
import { useWatchlist } from '@/features/watchlist';
import {
  WatchlistEmptyState,
  WatchlistCard,
  WatchlistQuickAdd,
  WatchlistSymbolDetail,
} from '@/components/watchlist';

export default function Watchlist() {
  const { items, selectedId, selectedItem, selectItem, addItem, removeItem } = useWatchlist();
  const [showAddInput, setShowAddInput] = useState(false);
  const addInputRef = useRef<HTMLDivElement>(null);

  const handleAddClick = () => {
    setShowAddInput(true);
    setTimeout(() => {
      addInputRef.current?.querySelector('input')?.focus();
    }, 0);
  };

  const handleAdd = (symbol: string) => {
    addItem(symbol);
  };

  return (
    <div className="p-6 space-y-6" data-testid="page-watchlist">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
            <Eye className="h-5 w-5 text-primary" />
          </div>
          <h1 className="text-2xl font-bold" data-testid="watchlist-heading">
            Watchlist
          </h1>
        </div>
        {items.length > 0 && (
          <div ref={addInputRef}>
            <WatchlistQuickAdd onAdd={handleAdd} />
          </div>
        )}
      </div>

      {items.length === 0 ? (
        <WatchlistEmptyState onAddClick={handleAddClick} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
          {/* List */}
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              {items.length} symbol{items.length !== 1 ? 's' : ''} tracked
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
              {items.map((item) => (
                <WatchlistCard
                  key={item.id}
                  item={item}
                  isSelected={selectedId === item.id}
                  onSelect={() => selectItem(selectedId === item.id ? null : item.id)}
                  onRemove={() => removeItem(item.id)}
                />
              ))}
            </div>
          </div>

          {/* Detail Panel */}
          <div className="lg:sticky lg:top-6 lg:self-start">
            {selectedItem ? (
              <WatchlistSymbolDetail item={selectedItem} />
            ) : (
              <div 
                className="rounded-md bg-muted/30 py-8 text-center text-muted-foreground"
                data-testid="watchlist-detail-empty"
              >
                Select a symbol to see details
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
