'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCookbook } from '@/contexts/CookbookContext';
import { usePantry } from '@/contexts/PantryContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RecipeChat } from '@/components/RecipeChat';
import {
  ChefHat,
  Clock,
  Users,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  ShoppingCart,
  Package,
  Utensils,
  Lightbulb,
  BookOpen,
  Trash2,
  ArrowLeft,
  Loader2,
  Youtube,
} from 'lucide-react';

export default function CookbookPage() {
  const { recipes, removeRecipe, loading } = useCookbook();
  const { hasItem } = usePantry();
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const handleImageError = (recipeId: string) => {
    setImageErrors((prev) => new Set(prev).add(recipeId));
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 pt-6 pb-20">
      {/* Header */}
      <header className="mb-6">
        <Link href="/">
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
            <BookOpen className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">My Cookbook</h1>
            <p className="text-sm text-muted-foreground">
              {recipes.length} saved recipe{recipes.length !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </header>

      {recipes.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="text-lg font-semibold mb-2">No saved recipes yet</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Find recipes you love and save them here for easy access.
            </p>
            <Link href="/">
              <Button className="bg-emerald-500 hover:bg-emerald-600">
                <ChefHat className="w-4 h-4 mr-2" />
                Find Recipes
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {recipes.map((recipe) => {
            const isExpanded = expandedRecipe === recipe.id;
            const hasImageError = imageErrors.has(recipe.id);

            // Recalculate availability based on current pantry
            const ingredientsWithAvailability = recipe.ingredients.map((ing) => ({
              ...ing,
              available: hasItem(ing.item),
            }));

            return (
              <Card
                key={recipe.id}
                className={`overflow-hidden transition-all ${
                  isExpanded ? 'ring-2 ring-amber-500' : ''
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
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30">
                        <Utensils className="w-16 h-16 text-amber-600/50" />
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
                    </div>

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
                      {/* Actions */}
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-950/50"
                          onClick={() => removeRecipe(recipe.id)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Remove
                        </Button>
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
                          {ingredientsWithAvailability.map((ing, i) => (
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
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-400 flex items-center justify-center text-xs font-bold">
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
                              <li
                                key={i}
                                className="text-sm text-amber-800 dark:text-amber-300"
                              >
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
                              href={`https://www.instacart.com/store/search/${encodeURIComponent(
                                recipe.missingIngredients.join(' ')
                              )}`}
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
      )}
    </main>
  );
}
