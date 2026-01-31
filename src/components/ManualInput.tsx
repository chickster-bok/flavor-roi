'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, ChefHat, Loader2 } from 'lucide-react';

interface ManualInputProps {
  onSubmit: (ingredients: string[]) => void;
  isAnalyzing?: boolean;
}

const SUGGESTIONS = [
  'Chicken', 'Pasta', 'Rice', 'Eggs', 'Onion', 'Garlic',
  'Tomato', 'Cheese', 'Butter', 'Olive Oil', 'Bread', 'Milk'
];

export function ManualInput({ onSubmit, isAnalyzing = false }: ManualInputProps) {
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');

  const addIngredient = useCallback((ingredient: string) => {
    const trimmed = ingredient.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients(prev => [...prev, trimmed]);
      setInputValue('');
    }
  }, [ingredients]);

  const removeIngredient = useCallback((ingredient: string) => {
    setIngredients(prev => prev.filter(i => i !== ingredient));
  }, []);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addIngredient(inputValue);
    }
  }, [inputValue, addIngredient]);

  const handleSubmit = useCallback(() => {
    if (ingredients.length > 0) {
      onSubmit(ingredients);
    }
  }, [ingredients, onSubmit]);

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <ChefHat className="w-5 h-5 text-emerald-600" />
          Type Your Ingredients
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Input Field */}
        <div className="flex gap-2">
          <Input
            placeholder="e.g., Chicken, Pasta, Tomatoes..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isAnalyzing}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => addIngredient(inputValue)}
            disabled={!inputValue.trim() || isAnalyzing}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Quick Suggestions */}
        <div>
          <p className="text-xs text-muted-foreground mb-2">Quick add:</p>
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.filter(s => !ingredients.includes(s)).slice(0, 8).map((suggestion) => (
              <Badge
                key={suggestion}
                variant="outline"
                className="cursor-pointer hover:bg-emerald-50 hover:border-emerald-300 dark:hover:bg-emerald-950/30 transition-colors text-xs"
                onClick={() => addIngredient(suggestion)}
              >
                + {suggestion}
              </Badge>
            ))}
          </div>
        </div>

        {/* Selected Ingredients */}
        {ingredients.length > 0 && (
          <div>
            <p className="text-xs text-muted-foreground mb-2">Your ingredients ({ingredients.length}):</p>
            <div className="flex flex-wrap gap-1.5">
              {ingredients.map((ingredient) => (
                <Badge
                  key={ingredient}
                  variant="secondary"
                  className="pr-1 flex items-center gap-1"
                >
                  {ingredient}
                  <button
                    type="button"
                    onClick={() => removeIngredient(ingredient)}
                    className="ml-1 rounded-full hover:bg-destructive/20 p-0.5"
                    disabled={isAnalyzing}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={ingredients.length === 0 || isAnalyzing}
          className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            `Analyze ${ingredients.length} Ingredient${ingredients.length !== 1 ? 's' : ''}`
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
