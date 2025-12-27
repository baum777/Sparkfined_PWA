import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface AlertQuickCreateProps {
  onSubmit: (symbol: string, condition: string, targetPrice: number) => void;
}

export function AlertQuickCreate({ onSubmit }: AlertQuickCreateProps) {
  const [symbol, setSymbol] = useState('');
  const [condition, setCondition] = useState('Price above');
  const [targetPrice, setTargetPrice] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol.trim() || !targetPrice) return;
    
    onSubmit(symbol.trim(), condition, parseFloat(targetPrice));
    setSymbol('');
    setTargetPrice('');
  };

  const isValid = symbol.trim().length > 0 && parseFloat(targetPrice) > 0;

  return (
    <form 
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-3 rounded-lg border border-border bg-card p-4"
      data-testid="alert-quick-create"
    >
      <div className="flex-1 min-w-[100px] space-y-1.5">
        <label htmlFor="alert-symbol" className="text-sm font-medium">
          Symbol
        </label>
        <Input
          id="alert-symbol"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value.toUpperCase())}
          placeholder="BTC"
          className="uppercase"
          maxLength={10}
        />
      </div>

      <div className="w-[140px] space-y-1.5">
        <label htmlFor="alert-condition" className="text-sm font-medium">
          Condition
        </label>
        <Select value={condition} onValueChange={setCondition}>
          <SelectTrigger id="alert-condition" className="focus:ring-offset-background">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Price above">Price above</SelectItem>
            <SelectItem value="Price below">Price below</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1 min-w-[120px] space-y-1.5">
        <label htmlFor="alert-price" className="text-sm font-medium">
          Target Price
        </label>
        <Input
          id="alert-price"
          type="number"
          value={targetPrice}
          onChange={(e) => setTargetPrice(e.target.value)}
          placeholder="0.00"
          min="0"
          step="any"
        />
      </div>

      <Button 
        type="submit" 
        disabled={!isValid}
        className="focus-visible:ring-offset-background"
        data-testid="btn-create-alert"
      >
        <Plus className="mr-2 h-4 w-4" />
        Create
      </Button>
    </form>
  );
}
