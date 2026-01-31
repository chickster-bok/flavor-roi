'use client';

import { Button } from '@/components/ui/button';
import { Users, Minus, Plus } from 'lucide-react';

interface ServingScalerProps {
  originalServings: number;
  currentServings: number;
  onServingsChange: (servings: number) => void;
}

export function ServingScaler({ originalServings, currentServings, onServingsChange }: ServingScalerProps) {
  const decrease = () => {
    if (currentServings > 1) {
      onServingsChange(currentServings - 1);
    }
  };

  const increase = () => {
    if (currentServings < 20) {
      onServingsChange(currentServings + 1);
    }
  };

  const isScaled = currentServings !== originalServings;

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1 text-sm text-muted-foreground">
        <Users className="w-4 h-4" />
        <span>Servings:</span>
      </div>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={decrease}
          disabled={currentServings <= 1}
        >
          <Minus className="w-3 h-3" />
        </Button>
        <span className={`w-8 text-center font-bold ${isScaled ? 'text-emerald-600' : ''}`}>
          {currentServings}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={increase}
          disabled={currentServings >= 20}
        >
          <Plus className="w-3 h-3" />
        </Button>
      </div>
      {isScaled && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground"
          onClick={() => onServingsChange(originalServings)}
        >
          Reset to {originalServings}
        </Button>
      )}
    </div>
  );
}
