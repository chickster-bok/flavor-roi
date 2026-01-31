'use client';

import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { calculateRecipeInfo } from '@/lib/ingredientData';
import { DollarSign, Flame, Beef, Wheat, Droplets } from 'lucide-react';

interface RecipeNutritionCardProps {
  ingredients: { item: string; amount: string; optional?: boolean }[];
  servings: number;
}

export function RecipeNutritionCard({ ingredients, servings }: RecipeNutritionCardProps) {
  const nutrition = useMemo(
    () => calculateRecipeInfo(ingredients, servings),
    [ingredients, servings]
  );

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Cost & Nutrition</h3>
          {nutrition.isUnderFiveDollars && (
            <Badge className="bg-green-500 text-white">
              <DollarSign className="w-3 h-3 mr-0.5" />
              Under $5!
            </Badge>
          )}
        </div>

        {/* Cost Row */}
        <div className="flex items-center justify-between p-2 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Estimated Cost</p>
              <p className="font-bold text-lg text-emerald-600">${nutrition.totalCost.toFixed(2)}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Per Serving</p>
            <p className="font-medium">${nutrition.costPerServing.toFixed(2)}</p>
          </div>
        </div>

        {/* Nutrition Grid */}
        <div className="grid grid-cols-4 gap-2 text-center">
          <div className="p-2 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
            <Flame className="w-4 h-4 mx-auto mb-1 text-orange-500" />
            <p className="text-lg font-bold">{nutrition.calories}</p>
            <p className="text-[10px] text-muted-foreground">Calories</p>
          </div>
          <div className="p-2 bg-red-50 dark:bg-red-950/30 rounded-lg">
            <Beef className="w-4 h-4 mx-auto mb-1 text-red-500" />
            <p className="text-lg font-bold">{nutrition.protein}g</p>
            <p className="text-[10px] text-muted-foreground">Protein</p>
          </div>
          <div className="p-2 bg-amber-50 dark:bg-amber-950/30 rounded-lg">
            <Wheat className="w-4 h-4 mx-auto mb-1 text-amber-500" />
            <p className="text-lg font-bold">{nutrition.carbs}g</p>
            <p className="text-[10px] text-muted-foreground">Carbs</p>
          </div>
          <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
            <Droplets className="w-4 h-4 mx-auto mb-1 text-blue-500" />
            <p className="text-lg font-bold">{nutrition.fat}g</p>
            <p className="text-[10px] text-muted-foreground">Fat</p>
          </div>
        </div>

        <p className="text-[10px] text-muted-foreground text-center mt-2">
          *Estimates based on average prices and standard portions
        </p>
      </CardContent>
    </Card>
  );
}
