import React from 'react';
import Button from '@/components/ui/Button';
import { Download, RotateCw } from 'lucide-react';

export function SettingsHeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <Button variant="secondary" size="sm" leftIcon={<Download className="h-4 w-4" />}>
        Export
      </Button>
      <Button variant="ghost" size="sm" leftIcon={<RotateCw className="h-4 w-4" />}>
        Reset
      </Button>
    </div>
  );
}

export default SettingsHeaderActions;
