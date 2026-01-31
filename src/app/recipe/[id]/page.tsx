'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { recipeDatabase, FullRecipe } from '@/lib/recipeDatabase';
import { scaleAmount } from '@/lib/ingredientData';
import { useCookbook } from '@/contexts/CookbookContext';
import { useProfile } from '@/contexts/ProfileContext';
import { usePantry } from '@/contexts/PantryContext';
import { RecipeChat } from '@/components/RecipeChat';
import { DietaryWarnings } from '@/components/DietaryWarnings';
import { RecipeNutritionCard } from '@/components/RecipeNutritionCard';
import { ServingScaler } from '@/components/ServingScaler';
import { CookingTimer, extractTimerFromStep } from '@/components/CookingTimer';
import { IngredientsWithSubstitutes } from '@/components/IngredientSubstitutes';
import { RecipeReview } from '@/components/RecipeReview';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Clock,
  Users,
  ChefHat,
  Star,
  Heart,
  Check,
  Youtube,
  ShoppingCart,
  Utensils,
  Loader2,
  Share2,
  Shuffle,
  Timer,
} from 'lucide-react';

export default function RecipePage() {
  const params = useParams();
  const router = useRouter();
  const recipeId = params.id as string;

  const { addRecipe, removeRecipe, hasRecipe } = useCookbook();
  const { profile, addRecentlyViewed, markRecipeCooked, addToShoppingList } = useProfile();
  const { items: pantryItems } = usePantry();

  const [recipe, setRecipe] = useState<FullRecipe | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [checkedSteps, setCheckedSteps] = useState<Set<number>>(new Set());
  const [imageError, setImageError] = useState(false);
  const [currentServings, setCurrentServings] = useState(4);
  const [activeTimer, setActiveTimer] = useState<{ stepIndex: number; minutes: number } | null>(null);
  const hasTrackedView = useRef(false);

  // Load recipe data
  useEffect(() => {
    const found = recipeDatabase.find(r => r.id === recipeId);
    setRecipe(found || null);
    setIsSaved(found ? hasRecipe(found.id) : false);
    setCurrentServings(found?.servings || 4);
    hasTrackedView.current = false;
    setCheckedSteps(new Set());
    setActiveTimer(null);
  }, [recipeId]);

  // Track recently viewed
  useEffect(() => {
    if (recipe && !hasTrackedView.current) {
      hasTrackedView.current = true;
      addRecentlyViewed(recipe.id);
    }
  }, [recipe]);

  // Update saved state when cookbook changes
  useEffect(() => {
    if (recipe) {
      setIsSaved(hasRecipe(recipe.id));
    }
  }, [recipe]);

  // Calculate scaled amounts
  const scaledIngredients = useMemo(() => {
    if (!recipe) return new Map<number, string>();
    const scaled = new Map<number, string>();
    recipe.ingredients.forEach((ing, i) => {
      scaled.set(i, scaleAmount(ing.amount, recipe.servings, currentServings));
    });
    return scaled;
  }, [recipe, currentServings]);

  if (!recipe) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mx-auto mb-4" />
          <p className="text-muted-foreground">Loading recipe...</p>
        </div>
      </main>
    );
  }

  const toggleSave = () => {
    if (isSaved) {
      removeRecipe(recipe.id);
    } else {
      addRecipe({
        ...recipe,
        ingredients: recipe.ingredients.map(ing => ({
          ...ing,
          available: pantryItems.some(p =>
            p.name.toLowerCase().includes(ing.item.toLowerCase()) ||
            ing.item.toLowerCase().includes(p.name.toLowerCase())
          ),
        })),
        matchPercentage: 100,
        missingIngredients: [],
      });
    }
    setIsSaved(!isSaved);
  };

  const toggleStep = (index: number) => {
    setCheckedSteps(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleMarkCooked = () => {
    markRecipeCooked(recipe.id, recipe.cuisine);
    alert('Recipe marked as cooked! Great job!');
  };

  const handleAddMissingToShoppingList = () => {
    const pantrySet = new Set(pantryItems.map(i => i.name.toLowerCase()));
    const missing = recipe.ingredients.filter(ing => {
      const itemLower = ing.item.toLowerCase();
      return !pantrySet.has(itemLower) &&
             !Array.from(pantrySet).some(p => itemLower.includes(p) || p.includes(itemLower));
    });

    if (missing.length > 0) {
      addToShoppingList(missing.map(m => ({ item: m.item, recipeId: recipe.id })));
      alert(`Added ${missing.length} items to your shopping list!`);
    } else {
      alert('You have all the ingredients!');
    }
  };

  const handleSurpriseMe = () => {
    let candidates = recipeDatabase.filter(r => r.id !== recipe.id);
    if (profile.favoriteCuisines.length > 0) {
      const filtered = candidates.filter(r => profile.favoriteCuisines.includes(r.cuisine));
      if (filtered.length > 5) candidates = filtered;
    }
    const randomRecipe = candidates[Math.floor(Math.random() * candidates.length)];
    router.push(`/recipe/${randomRecipe.id}`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: recipe.name,
          text: `Check out this recipe: ${recipe.name}`,
          url: window.location.href,
        });
      } catch (err) {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleStartTimer = (stepIndex: number, minutes: number) => {
    setActiveTimer({ stepIndex, minutes });
  };

  // Convert to FullRecipeResult format for RecipeChat
  const recipeForChat = {
    ...recipe,
    ingredients: recipe.ingredients.map(ing => ({
      ...ing,
      available: pantryItems.some(p =>
        p.name.toLowerCase().includes(ing.item.toLowerCase()) ||
        ing.item.toLowerCase().includes(p.name.toLowerCase())
      ),
    })),
    matchPercentage: 100,
    missingIngredients: [] as string[],
    tips: [] as string[],
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-20">
      {/* Hero Image */}
      <div className="relative h-64 sm:h-80 bg-muted">
        {!imageError ? (
          <img
            src={recipe.image}
            alt={recipe.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-amber-100 dark:from-emerald-900/30 dark:to-amber-900/30">
            <Utensils className="w-16 h-16 text-emerald-600/50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Back Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 left-4 bg-black/30 text-white hover:bg-black/50"
          onClick={() => router.back()}
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="bg-black/30 text-white hover:bg-black/50"
            onClick={handleShare}
          >
            <Share2 className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`${isSaved ? 'bg-pink-500 text-white hover:bg-pink-600' : 'bg-black/30 text-white hover:bg-black/50'}`}
            onClick={toggleSave}
          >
            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
          </Button>
        </div>

        {/* Recipe Title */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-emerald-500">{recipe.cuisine}</Badge>
            <Badge variant="outline" className="border-white/50 text-white">
              {recipe.difficulty}
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold">{recipe.name}</h1>
        </div>
      </div>

      <div className="p-4 max-w-3xl mx-auto space-y-6">
        {/* Quick Stats */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-muted-foreground" />
              {recipe.prepTime + recipe.cookTime} min
            </span>
            {recipe.rating && (
              <span className="flex items-center gap-1 text-amber-500">
                <Star className="w-4 h-4 fill-current" />
                {recipe.rating.toFixed(1)}
              </span>
            )}
          </div>
          {recipe.youtubeUrl && (
            <a href={recipe.youtubeUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="text-red-500 border-red-200">
                <Youtube className="w-4 h-4 mr-1" />
                Watch
              </Button>
            </a>
          )}
        </div>

        {/* Serving Scaler */}
        <ServingScaler
          originalServings={recipe.servings}
          currentServings={currentServings}
          onServingsChange={setCurrentServings}
        />

        {/* Description */}
        <p className="text-muted-foreground">{recipe.description}</p>

        {/* Dietary Warnings based on user profile */}
        <DietaryWarnings ingredients={recipe.ingredients} tags={recipe.tags} />

        {/* Cost & Nutrition Card */}
        <RecipeNutritionCard ingredients={recipe.ingredients} servings={currentServings} />

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button
            className="flex-1 bg-emerald-500 hover:bg-emerald-600"
            onClick={handleMarkCooked}
          >
            <ChefHat className="w-4 h-4 mr-2" />
            Mark as Cooked
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={handleAddMissingToShoppingList}
          >
            <ShoppingCart className="w-4 h-4 mr-2" />
            Add Missing
          </Button>
        </div>

        {/* Active Timer */}
        {activeTimer && (
          <CookingTimer
            initialMinutes={activeTimer.minutes}
            label={`Step ${activeTimer.stepIndex + 1} Timer`}
            onComplete={() => {
              // Auto advance to check the step
              toggleStep(activeTimer.stepIndex);
            }}
          />
        )}

        {/* Ingredients with Substitutes */}
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <Utensils className="w-5 h-5 text-emerald-600" />
              Ingredients
              {currentServings !== recipe.servings && (
                <Badge variant="secondary" className="ml-2">
                  Scaled for {currentServings}
                </Badge>
              )}
            </h2>
            <IngredientsWithSubstitutes
              ingredients={recipe.ingredients}
              scaledAmounts={scaledIngredients}
            />
          </CardContent>
        </Card>

        {/* Instructions with Timer Detection */}
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold text-lg mb-3 flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-amber-600" />
              Instructions
            </h2>
            <ol className="space-y-4">
              {recipe.instructions.map((step, i) => {
                const timerMinutes = extractTimerFromStep(step);

                return (
                  <li
                    key={i}
                    className={`p-2 rounded-lg transition-colors ${
                      checkedSteps.has(i) ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div
                      className="flex gap-3 cursor-pointer"
                      onClick={() => toggleStep(i)}
                    >
                      <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-sm font-medium ${
                        checkedSteps.has(i)
                          ? 'bg-emerald-500 text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {checkedSteps.has(i) ? <Check className="w-4 h-4" /> : i + 1}
                      </div>
                      <p className={checkedSteps.has(i) ? 'text-muted-foreground line-through' : ''}>
                        {step}
                      </p>
                    </div>
                    {timerMinutes && !checkedSteps.has(i) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="ml-10 mt-2 text-blue-600 border-blue-200"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleStartTimer(i, timerMinutes);
                        }}
                      >
                        <Timer className="w-3 h-3 mr-1" />
                        Set {timerMinutes} min timer
                      </Button>
                    )}
                  </li>
                );
              })}
            </ol>
          </CardContent>
        </Card>

        {/* Recipe Review */}
        <RecipeReview recipeId={recipe.id} />

        {/* Tags */}
        {recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {recipe.tags.map(tag => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* AI Chat */}
        <RecipeChat recipe={recipeForChat} />

        {/* Try Another */}
        <Button
          variant="outline"
          className="w-full border-pink-300 text-pink-600 hover:bg-pink-50"
          onClick={handleSurpriseMe}
        >
          <Shuffle className="w-4 h-4 mr-2" />
          Surprise Me with Another Recipe
        </Button>
      </div>
    </main>
  );
}
