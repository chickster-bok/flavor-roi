'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePantry } from '@/contexts/PantryContext';
import { useCookbook } from '@/contexts/CookbookContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RecipeList } from '@/components/RecipeList';
import { AnalysisResult, FullRecipeResult } from '@/lib/types';
import {
  ChefHat,
  Camera,
  Keyboard,
  Package,
  BookOpen,
  Sparkles,
  LogOut,
  Crown,
  Loader2,
  Clock,
  Utensils,
  ChevronRight,
  Zap,
  TrendingUp,
  User,
  ShoppingCart,
  Shuffle,
  Star,
} from 'lucide-react';
import { useProfile } from '@/contexts/ProfileContext';
import { recipeDatabase } from '@/lib/recipeDatabase';
import { logOut } from '@/lib/firebase';
import { CameraDialog } from '@/components/CameraDialog';
import { ManualInput } from '@/components/ManualInput';
import { useTrial } from '@/hooks/useTrial';

type ViewMode = 'dashboard' | 'results' | 'manual-input';

function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, subscription } = useAuth();
  const { items: pantryItems } = usePantry();
  const { recipes: cookbookRecipes, hasRecipe } = useCookbook();
  const { profile, addRecentlyViewed } = useProfile();
  const { isTrialActive, isPremium, daysRemaining, hasTrialExpired } = useTrial();

  const [viewMode, setViewMode] = useState<ViewMode>('dashboard');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [showCamera, setShowCamera] = useState(false);
  const [makeNowRecipes, setMakeNowRecipes] = useState<FullRecipeResult[]>([]);
  const [loadingMakeNow, setLoadingMakeNow] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const isSubscribed = subscription?.status === 'active';

  // Surprise Me - get a random recipe and navigate to it
  const handleSurpriseMe = () => {
    // Filter by user's favorite cuisines if they have any
    let candidates = recipeDatabase;
    if (profile.favoriteCuisines.length > 0) {
      const filtered = recipeDatabase.filter(r =>
        profile.favoriteCuisines.includes(r.cuisine)
      );
      if (filtered.length > 10) candidates = filtered;
    }
    const randomRecipe = candidates[Math.floor(Math.random() * candidates.length)];
    router.push(`/recipe/${randomRecipe.id}`);
  };

  // Fetch "Make Right Now" recipes based on pantry
  const fetchMakeNowRecipes = useCallback(async () => {
    if (pantryItems.length === 0) return;

    setLoadingMakeNow(true);
    try {
      const ingredients = pantryItems.map((item) => item.name);
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients, maxRecipes: 50 }),
      });

      if (response.ok) {
        const data = (await response.json()) as AnalysisResult;
        // Filter to recipes with 70%+ match
        const canMakeNow = data.recipes.filter((r) => r.matchPercentage >= 70);
        setMakeNowRecipes(canMakeNow.slice(0, 6));
      }
    } catch (error) {
      console.error('Failed to fetch recipes:', error);
    }
    setLoadingMakeNow(false);
  }, [pantryItems]);

  useEffect(() => {
    fetchMakeNowRecipes();
  }, [fetchMakeNowRecipes]);

  // Check if we should analyze from URL param
  useEffect(() => {
    const usePantry = searchParams.get('usePantry');
    if (usePantry === 'true' && pantryItems.length > 0) {
      handleAnalyzeFromPantry();
      router.replace('/dashboard');
    }
  }, [searchParams, pantryItems]);

  const handleAnalyzeFromPantry = async () => {
    if (pantryItems.length === 0) return;

    setIsAnalyzing(true);
    try {
      const ingredients = pantryItems.map((item) => item.name);
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients, maxRecipes: 50 }),
      });

      if (response.ok) {
        const data = (await response.json()) as AnalysisResult;
        setResult(data);
        setViewMode('results');
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    }
    setIsAnalyzing(false);
  };

  const handleAnalyzeImage = async (imageData: string) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData, maxRecipes: 50 }),
      });

      if (response.ok) {
        const data = (await response.json()) as AnalysisResult;
        setResult(data);
        setViewMode('results');
        setShowCamera(false);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    }
    setIsAnalyzing(false);
  };

  const handleAnalyzeIngredients = async (ingredients: string[]) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ingredients, maxRecipes: 50 }),
      });

      if (response.ok) {
        const data = (await response.json()) as AnalysisResult;
        setResult(data);
        setViewMode('results');
      }
    } catch (error) {
      console.error('Analysis failed:', error);
    }
    setIsAnalyzing(false);
  };

  const handleImageError = (recipeId: string) => {
    setImageErrors((prev) => new Set(prev).add(recipeId));
  };

  const handleLogout = async () => {
    await logOut();
    router.push('/');
  };

  // Results view
  if (viewMode === 'results' && result) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 pt-6 pb-20">
        <header className="text-center mb-6">
          <button
            onClick={() => setViewMode('dashboard')}
            className="mb-2 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            ← Back to Dashboard
          </button>
          <h1 className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
            <ChefHat className="w-6 h-6 text-emerald-600" />
            Recipe Results
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {result.recipes.length} recipes found
          </p>
        </header>
        <RecipeList
          recipes={result.recipes}
          foundIngredients={result.found_ingredients}
          onReset={() => setViewMode('dashboard')}
        />
      </main>
    );
  }

  // Manual input view
  if (viewMode === 'manual-input') {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 pt-8 pb-20">
        <header className="text-center mb-6">
          <h1 className="text-xl font-bold text-foreground flex items-center justify-center gap-2">
            <ChefHat className="w-6 h-6 text-emerald-600" />
            Enter Ingredients
          </h1>
        </header>
        <ManualInput onSubmit={handleAnalyzeIngredients} isAnalyzing={isAnalyzing} />
        <div className="mt-4 text-center">
          <button
            onClick={() => setViewMode('dashboard')}
            disabled={isAnalyzing}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors disabled:opacity-50"
          >
            Back to Dashboard
          </button>
        </div>
      </main>
    );
  }

  // Dashboard view
  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Header */}
      <header className="p-4 border-b bg-white/80 dark:bg-gray-950/80 backdrop-blur sticky top-0 z-10">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg">The $5 Chef</h1>
              <p className="text-xs text-muted-foreground">Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isSubscribed ? (
              <Badge className="bg-gradient-to-r from-emerald-500 to-amber-500 text-white">
                <Crown className="w-3 h-3 mr-1" />
                Premium
              </Badge>
            ) : isTrialActive ? (
              <Badge className="bg-emerald-500 text-white">
                Trial
              </Badge>
            ) : null}
            {user && (
              <button
                onClick={handleLogout}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <LogOut className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="p-4 max-w-4xl mx-auto space-y-6">
        {/* Trial/Upgrade Banner */}
        {isTrialActive && !isSubscribed && (
          <div className="bg-gradient-to-r from-emerald-500 to-amber-500 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">Free Trial Active</p>
                  <p className="text-sm text-white/80">{daysRemaining} days remaining</p>
                </div>
              </div>
              <Link href="/pricing">
                <Button size="sm" className="bg-white text-emerald-600 hover:bg-white/90 font-semibold">
                  See Plans
                </Button>
              </Link>
            </div>
          </div>
        )}

        {hasTrialExpired && !isSubscribed && (
          <div className="bg-gradient-to-r from-amber-500 to-red-500 rounded-xl p-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-semibold">Trial Ended</p>
                  <p className="text-sm text-white/80">Upgrade to continue using all features</p>
                </div>
              </div>
              <Link href="/subscribe">
                <Button size="sm" className="bg-white text-amber-600 hover:bg-white/90 font-semibold">
                  Upgrade Now
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Quick Navigation */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4">
          <Link href="/browse">
            <button className="flex items-center gap-2 px-4 py-2 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm font-medium flex-shrink-0 hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors">
              <ChefHat className="w-4 h-4" />
              Browse All
            </button>
          </Link>
          <Link href="/profile">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium flex-shrink-0 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <User className="w-4 h-4" />
              Profile
            </button>
          </Link>
          <Link href="/shopping-list">
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium flex-shrink-0 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
              <ShoppingCart className="w-4 h-4" />
              Shopping List
            </button>
          </Link>
          <button
            onClick={handleSurpriseMe}
            className="flex items-center gap-2 px-4 py-2 bg-pink-100 dark:bg-pink-900/30 text-pink-700 dark:text-pink-300 rounded-lg text-sm font-medium flex-shrink-0 hover:bg-pink-200 dark:hover:bg-pink-900/50 transition-colors"
          >
            <Shuffle className="w-4 h-4" />
            Surprise Me!
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2">
          <Link href="/pantry">
            <Card className="hover:border-emerald-500 transition-colors cursor-pointer">
              <CardContent className="p-3 text-center">
                <Package className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
                <p className="text-xl font-bold">{pantryItems.length}</p>
                <p className="text-[10px] text-muted-foreground">Pantry</p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/cookbook">
            <Card className="hover:border-amber-500 transition-colors cursor-pointer">
              <CardContent className="p-3 text-center">
                <BookOpen className="w-5 h-5 mx-auto mb-1 text-amber-600" />
                <p className="text-xl font-bold">{cookbookRecipes.length}</p>
                <p className="text-[10px] text-muted-foreground">Saved</p>
              </CardContent>
            </Card>
          </Link>
          <Card>
            <CardContent className="p-3 text-center">
              <Zap className="w-5 h-5 mx-auto mb-1 text-purple-600" />
              <p className="text-xl font-bold">{makeNowRecipes.length}</p>
              <p className="text-[10px] text-muted-foreground">Ready</p>
            </CardContent>
          </Card>
          <Link href="/profile">
            <Card className="hover:border-orange-500 transition-colors cursor-pointer">
              <CardContent className="p-3 text-center">
                <Star className="w-5 h-5 mx-auto mb-1 text-orange-600" />
                <p className="text-xl font-bold">{profile.stats.recipesCooked}</p>
                <p className="text-[10px] text-muted-foreground">Cooked</p>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardContent className="p-4">
            <h2 className="font-semibold mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              Find Recipes
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={() => setShowCamera(true)}
                className="h-20 flex-col gap-2 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
              >
                <Camera className="w-6 h-6" />
                <span>Scan Ingredients</span>
              </Button>
              <button
                onClick={() => setViewMode('manual-input')}
                className="h-20 flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600 transition-colors text-gray-700 dark:text-gray-300"
              >
                <Keyboard className="w-6 h-6" />
                <span className="font-medium">Type Ingredients</span>
              </button>
            </div>
            {pantryItems.length > 0 && (
              <Button
                onClick={handleAnalyzeFromPantry}
                disabled={isAnalyzing}
                className="w-full mt-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
              >
                {isAnalyzing ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Package className="w-4 h-4 mr-2" />
                )}
                Use My Pantry ({pantryItems.length} items)
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Make Right Now Section */}
        {pantryItems.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold flex items-center gap-2">
                <Zap className="w-4 h-4 text-purple-600" />
                Make Right Now
              </h2>
              {makeNowRecipes.length > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleAnalyzeFromPantry}
                  className="text-purple-600"
                >
                  See All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>

            {loadingMakeNow ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-purple-600" />
              </div>
            ) : makeNowRecipes.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {makeNowRecipes.map((recipe) => (
                  <Link key={recipe.id} href={`/recipe/${recipe.id}`}>
                    <Card className="overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all">
                      <div className="relative h-28 bg-muted">
                        {!imageErrors.has(recipe.id) ? (
                          <img
                            src={recipe.image}
                            alt={recipe.name}
                            className="w-full h-full object-cover"
                            onError={() => handleImageError(recipe.id)}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30">
                            <Utensils className="w-8 h-8 text-purple-600/50" />
                          </div>
                        )}
                        <Badge className="absolute top-2 right-2 bg-purple-500 text-white text-xs">
                          {recipe.matchPercentage}%
                        </Badge>
                      </div>
                      <CardContent className="p-3">
                        <h3 className="font-medium text-sm line-clamp-1">{recipe.name}</h3>
                        <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {recipe.prepTime + recipe.cookTime}m
                          </span>
                          <Badge variant="outline" className="text-[10px] px-1 py-0">
                            {recipe.difficulty}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <Card className="border-dashed">
                <CardContent className="p-6 text-center">
                  <Utensils className="w-8 h-8 mx-auto mb-2 text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    Add more items to your pantry to see recipes you can make right now.
                  </p>
                  <Link href="/pantry">
                    <Button variant="outline" size="sm" className="mt-3">
                      <Package className="w-4 h-4 mr-2" />
                      Manage Pantry
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Saved Recipes Preview */}
        {cookbookRecipes.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-semibold flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-600" />
                My Cookbook
              </h2>
              <Link href="/cookbook">
                <Button variant="ghost" size="sm" className="text-amber-600">
                  View All <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4">
              {cookbookRecipes.slice(0, 5).map((recipe) => (
                <Link href="/cookbook" key={recipe.id}>
                  <Card className="flex-shrink-0 w-32 overflow-hidden hover:ring-2 hover:ring-amber-500 transition-all">
                    <div className="relative h-20 bg-muted">
                      {!imageErrors.has(recipe.id) ? (
                        <img
                          src={recipe.image}
                          alt={recipe.name}
                          className="w-full h-full object-cover"
                          onError={() => handleImageError(recipe.id)}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30">
                          <Utensils className="w-6 h-6 text-amber-600/50" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-2">
                      <h3 className="font-medium text-xs line-clamp-2">{recipe.name}</h3>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Empty State for New Users */}
        {pantryItems.length === 0 && cookbookRecipes.length === 0 && (
          <Card className="bg-gradient-to-br from-emerald-50 to-amber-50 dark:from-emerald-950/30 dark:to-amber-950/30 border-0">
            <CardContent className="p-6 text-center">
              <ChefHat className="w-12 h-12 mx-auto mb-3 text-emerald-600" />
              <h2 className="text-lg font-semibold mb-2">Welcome to The $5 Chef!</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Get started by setting up your pantry or scanning some ingredients.
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/pantry">
                  <Button variant="outline">
                    <Package className="w-4 h-4 mr-2" />
                    Set Up Pantry
                  </Button>
                </Link>
                <Button onClick={() => setShowCamera(true)} className="bg-emerald-500 hover:bg-emerald-600">
                  <Camera className="w-4 h-4 mr-2" />
                  Scan Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tip of the Day */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 border-0">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Pro Tip</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Keep your pantry updated for more accurate recipe suggestions. The more ingredients you add, the better matches you'll get!
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Camera Dialog */}
      <CameraDialog
        open={showCamera}
        onOpenChange={setShowCamera}
        onCapture={handleAnalyzeImage}
        isAnalyzing={isAnalyzing}
      />
    </main>
  );
}

export default function DashboardPage() {
  const { loading: authLoading } = useAuth();
  const { loading: pantryLoading } = usePantry();

  if (authLoading || pantryLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </main>
    );
  }

  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </main>
      }
    >
      <DashboardContent />
    </Suspense>
  );
}
