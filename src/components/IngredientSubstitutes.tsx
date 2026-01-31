'use client';

import { useState } from 'react';
import { getSubstitutes } from '@/lib/ingredientData';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRightLeft, ChevronDown, ChevronUp } from 'lucide-react';

interface IngredientSubstitutesProps {
  ingredientName: string;
  compact?: boolean;
}

export function IngredientSubstitutes({ ingredientName, compact = false }: IngredientSubstitutesProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const substitutes = getSubstitutes(ingredientName);

  if (substitutes.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1 flex-wrap">
        <ArrowRightLeft className="w-3 h-3 text-muted-foreground" />
        {substitutes.slice(0, 2).map((sub) => (
          <Badge key={sub} variant="outline" className="text-[10px] px-1 py-0">
            {sub}
          </Badge>
        ))}
        {substitutes.length > 2 && (
          <span className="text-[10px] text-muted-foreground">
            +{substitutes.length - 2} more
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="mt-1">
      <Button
        variant="ghost"
        size="sm"
        className="h-5 px-1 text-xs text-muted-foreground hover:text-foreground"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <ArrowRightLeft className="w-3 h-3 mr-1" />
        Substitutes
        {isExpanded ? (
          <ChevronUp className="w-3 h-3 ml-1" />
        ) : (
          <ChevronDown className="w-3 h-3 ml-1" />
        )}
      </Button>
      {isExpanded && (
        <div className="flex flex-wrap gap-1 mt-1 ml-4">
          {substitutes.map((sub) => (
            <Badge key={sub} variant="secondary" className="text-xs">
              {sub}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

// Full ingredient list with substitutes
interface IngredientsWithSubstitutesProps {
  ingredients: { item: string; amount: string; optional?: boolean }[];
  scaledAmounts?: Map<number, string>;
}

export function IngredientsWithSubstitutes({ ingredients, scaledAmounts }: IngredientsWithSubstitutesProps) {
  return (
    <ul className="space-y-3">
      {ingredients.map((ing, i) => {
        const amount = scaledAmounts?.get(i) || ing.amount;
        const substitutes = getSubstitutes(ing.item);

        return (
          <li key={i} className="border-b pb-2 last:border-0">
            <div className="flex items-start gap-2">
              <span className={ing.optional ? 'text-muted-foreground italic' : ''}>
                <span className="font-medium">{amount}</span> {ing.item}
                {ing.optional && ' (optional)'}
              </span>
            </div>
            {substitutes.length > 0 && (
              <div className="flex items-center gap-1 mt-1 ml-0">
                <ArrowRightLeft className="w-3 h-3 text-blue-500" />
                <span className="text-xs text-muted-foreground">Can substitute:</span>
                <div className="flex flex-wrap gap-1">
                  {substitutes.map((sub) => (
                    <Badge key={sub} variant="outline" className="text-xs bg-blue-50 dark:bg-blue-950/30 border-blue-200">
                      {sub}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
