import { useState, useRef } from 'react';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface WatchlistQuickAddProps {
  onAdd: (symbol: string) => void;
}

export function WatchlistQuickAdd({ onAdd }: WatchlistQuickAddProps) {
  const [symbol, setSymbol] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = symbol.trim();
    if (trimmed) {
      onAdd(trimmed);
      setSymbol('');
      inputRef.current?.focus();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        ref={inputRef}
        type="text"
        placeholder="Add symbol (e.g., BTC)"
        value={symbol}
        onChange={(e) => setSymbol(e.target.value)}
        className="max-w-[200px]"
        aria-label="Symbol to add"
        data-testid="watchlist-add-input"
      />
      <Button type="submit" size="sm" disabled={!symbol.trim()} className="focus-visible:ring-offset-background" data-testid="watchlist-add-submit">
        <Plus className="h-4 w-4 mr-1" />
        Add
      </Button>
    </form>
  );
}
