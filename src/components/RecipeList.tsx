'use client';

import { useState, useMemo } from 'react';
import { FullRecipeResult } from '@/lib/types';
import { usePantry } from '@/contexts/PantryContext';
import { useCookbook } from '@/contexts/CookbookContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RecipeChat } from '@/components/RecipeChat';
import { RecipeFiltersComponent } from '@/components/RecipeFilters';
import {
  RecipeFilters,
  SortOption,
  filterRecipes,
  sortRecipes,
} from '@/lib/recipeDatabase';
import {
  Clock,
  Users,
  ChefHat,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  ShoppingCart,
  Package,
  Plus,
  Utensils,
  Lightbulb,
  BookmarkPlus,
  BookmarkCheck,
  Youtube,
  Star,
} from 'lucide-react';

interface RecipeListProps {
  recipes: FullRecipeResult[];
  foundIngredients: string[];
  onReset?: () => void;
}

export function RecipeList({ recipes, foundIngredients, onReset }: RecipeListProps) {
  const { addItems, hasItem } = usePantry();
  const { addRecipe, removeRecipe, hasRecipe } = useCookbook();
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [savedToPantry, setSavedToPantry] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [filters, setFilters] = useState<RecipeFilters>({});
  const [sortBy, setSortBy] = useState<SortOption>('match');

  // Apply filters and sorting
  const filteredRecipes = useMemo(() => {
    // Cast to any to use with filterRecipes since types slightly differ
    let result = filterRecipes(recipes as any, filters);
    result = sortRecipes(result, sortBy);
    return result as unknown as FullRecipeResult[];
  }, [recipes, filters, sortBy]);

  const visibleRecipes = filteredRecipes.slice(0, visibleCount);
  const hasMore = filteredRecipes.length > visibleCount;

  const handleSaveToPantry = () => {
    addItems(foundIngredients);
    setSavedToPantry(true);
  };

  const newIngredients = foundIngredients.filter((ing) => !hasItem(ing));

  const handleImageError = (recipeId: string) => {
    setImageErrors(prev => new Set(prev).add(recipeId));
  };

  return (
    <div className="w-full max-w-2xl mx-auto space-y-4">
      {/* Detected Ingredients */}
      <Card className="border-border/50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-medium">Your Ingredients</p>
            {!savedToPantry && newIngredients.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleSaveToPantry}
                className="h-7 text-xs"
              >
                <Plus className="w-3 h-3 mr-1" />
                Save to Pantry
              </Button>
            )}
            {savedToPantry && (
              <span className="text-xs text-emerald-600 flex items-center gap-1">
                <Check className="w-3 h-3" />
                Saved
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {foundIngredients.map((ingredient, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {ingredient}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <RecipeFiltersComponent
        filters={filters}
        sortBy={sortBy}
        onFiltersChange={setFilters}
        onSortChange={setSortBy}
        totalResults={filteredRecipes.length}
      />

      {/* Recipe Cards */}
      <div className="space-y-4">
        {visibleRecipes.map((recipe, index) => {
          const isExpanded = expandedRecipe === recipe.id;
          const hasImageError = imageErrors.has(recipe.id);

          return (
            <Card
              key={recipe.id}
              className={`overflow-hidden transition-all ${
                isExpanded ? 'ring-2 ring-emerald-500' : ''
              }`}
            >
              {/* Recipe Header with Image */}
              <div
                className="cursor-pointer"
                onClick={() => setExpandedRecipe(isExpanded ? null : recipe.id)}
              >
                <div className="relative h-48 bg-muted">
                  {!hasImageError ? (
                    <img
                      src={recipe.image}
                      alt={recipe.name}
                      className="w-full h-full object-cover"
                      onError={() => handleImageError(recipe.id)}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-amber-100 dark:from-emerald-900/30 dark:to-amber-900/30">
                      <Utensils className="w-16 h-16 text-emerald-600/50" />
                    </div>
                  )}
                  {/* Match Badge */}
                  <div className="absolute top-3 left-3">
                    <Badge
                      className={`${
                        recipe.matchPercentage >= 70
                          ? 'bg-emerald-500'
                          : recipe.matchPercentage >= 40
                          ? 'bg-amber-500'
                          : 'bg-gray-500'
                      } text-white`}
                    >
                      {recipe.matchPercentage}% match
                    </Badge>
                  </div>
                  {/* Rank Badge */}
                  {index < 3 && (
                    <div className="absolute top-3 right-3">
                      <Badge
                        className={`${
                          index === 0
                            ? 'bg-amber-400 text-amber-900'
                            : index === 1
                            ? 'bg-gray-300 text-gray-800'
                            : 'bg-amber-600 text-white'
                        }`}
                      >
                        #{index + 1}
                      </Badge>
                    </div>
                  )}
                  {/* Gradient overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/60 to-transparent" />
                  {/* Title on image */}
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="text-white font-bold text-lg leading-tight">
                      {recipe.name}
                    </h3>
                    <p className="text-white/80 text-sm">{recipe.cuisine}</p>
                  </div>
                </div>

                {/* Quick Info */}
                <CardContent className="p-4">
                  <p className="text-sm text-muted-foreground mb-3">
                    {recipe.description}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {recipe.prepTime + recipe.cookTime} min
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {recipe.servings} servings
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {recipe.difficulty}
                    </Badge>
                    {recipe.rating && (
                      <span className="flex items-center gap-1 text-amber-500">
                        <Star className="w-4 h-4 fill-current" />
                        {recipe.rating.toFixed(1)}
                      </span>
                    )}
                  </div>

                  {/* Missing Ingredients Preview */}
                  {recipe.missingIngredients.length > 0 && (
                    <div className="mt-3 flex items-center gap-2">
                      <ShoppingCart className="w-4 h-4 text-amber-600" />
                      <span className="text-sm text-amber-600">
                        Need {recipe.missingIngredients.length} more ingredient{recipe.missingIngredients.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  )}

                  {/* Expand/Collapse */}
                  <div className="flex justify-center mt-3">
                    {isExpanded ? (
                      <ChevronUp className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>
                </CardContent>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t" onClick={(e) => e.stopPropagation()}>
                  <CardContent className="p-4 space-y-6">
                    {/* Save to Cookbook & YouTube */}
                    <div className="flex gap-2">
                      {hasRecipe(recipe.id) ? (
                        <Button
                          variant="outline"
                          className="flex-1 border-emerald-500 text-emerald-600"
                          onClick={() => removeRecipe(recipe.id)}
                        >
                          <BookmarkCheck className="w-4 h-4 mr-2" />
                          Saved
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => addRecipe(recipe)}
                        >
                          <BookmarkPlus className="w-4 h-4 mr-2" />
                          Save
                        </Button>
                      )}
                      {recipe.youtubeUrl && (
                        <Button
                          variant="outline"
                          className="border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/50"
                          asChild
                        >
                          <a
                            href={recipe.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Youtube className="w-4 h-4 mr-2" />
                            Watch
                          </a>
                        </Button>
                      )}
                    </div>

                    {/* Ingredients */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Ingredients
                      </h4>
                      <ul className="space-y-2">
                        {recipe.ingredients.map((ing, i) => (
                          <li
                            key={i}
                            className={`flex items-center gap-2 text-sm ${
                              ing.available
                                ? 'text-emerald-700 dark:text-emerald-400'
                                : 'text-muted-foreground'
                            }`}
                          >
                            {ing.available ? (
                              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                            ) : (
                              <X className="w-4 h-4 text-muted-foreground/50 flex-shrink-0" />
                            )}
                            <span className={ing.available ? 'font-medium' : ''}>
                              {ing.amount} {ing.item}
                            </span>
                            {ing.optional && (
                              <Badge variant="outline" className="text-xs ml-auto">
                                optional
                              </Badge>
                            )}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Instructions */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <ChefHat className="w-4 h-4" />
                        Instructions
                      </h4>
                      <ol className="space-y-3">
                        {recipe.instructions.map((step, i) => (
                          <li key={i} className="flex gap-3 text-sm">
                            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-400 flex items-center justify-center text-xs font-bold">
                              {i + 1}
                            </span>
                            <span className="pt-0.5">{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    {/* Tips */}
                    {recipe.tips && recipe.tips.length > 0 && (
                      <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-4">
                        <h4 className="font-semibold mb-2 flex items-center gap-2 text-amber-700 dark:text-amber-400">
                          <Lightbulb className="w-4 h-4" />
                          Pro Tips
                        </h4>
                        <ul className="space-y-1">
                          {recipe.tips.map((tip, i) => (
                            <li key={i} className="text-sm text-amber-800 dark:text-amber-300">
                              • {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Shopping List for Missing Items */}
                    {recipe.missingIngredients.length > 0 && (
                      <div className="bg-muted/50 rounded-lg p-4">
                        <h4 className="font-semibold mb-2 flex items-center gap-2">
                          <ShoppingCart className="w-4 h-4" />
                          Shopping List
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {recipe.missingIngredients.map((ing, i) => (
                            <Badge key={i} variant="outline">
                              {ing}
                            </Badge>
                          ))}
                        </div>
                        <Button
                          className="w-full mt-3 bg-emerald-500 hover:bg-emerald-600"
                          asChild
                        >
                          <a
                            href={`https://www.instacart.com/store/search/${encodeURIComponent(recipe.missingIngredients.join(' '))}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ShoppingCart className="w-4 h-4 mr-2" />
                            Order Missing Ingredients
                          </a>
                        </Button>
                      </div>
                    )}

                    {/* AI Chat */}
                    <RecipeChat recipe={recipe} />
                  </CardContent>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Load More */}
      {hasMore && (
        <Button
          variant="outline"
          className="w-full"
          onClick={() => setVisibleCount((prev) => prev + 10)}
        >
          Show More ({filteredRecipes.length - visibleCount} remaining)
        </Button>
      )}

      {/* Scan Again */}
      {onReset && (
        <Button variant="outline" className="w-full" onClick={onReset}>
          Scan Again
        </Button>
      )}
    </div>
  );
}
