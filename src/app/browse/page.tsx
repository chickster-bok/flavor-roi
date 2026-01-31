'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { recipeDatabase, availableCuisines, availableCategories } from '@/lib/recipeDatabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  Search,
  Clock,
  Utensils,
  ChefHat,
  Filter,
  X,
} from 'lucide-react';
import { DietaryWarnings } from '@/components/DietaryWarnings';

type Difficulty = 'Easy' | 'Medium' | 'Hard';

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | ''>('');
  const [showFilters, setShowFilters] = useState(false);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());

  const filteredRecipes = useMemo(() => {
    return recipeDatabase.filter(recipe => {
      // Search query
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = recipe.name.toLowerCase().includes(query);
        const matchesTags = recipe.tags.some(t => t.includes(query));
        const matchesIngredients = recipe.ingredients.some(i =>
          i.item.toLowerCase().includes(query)
        );
        const matchesCuisine = recipe.cuisine.toLowerCase().includes(query);
        if (!matchesName && !matchesTags && !matchesIngredients && !matchesCuisine) {
          return false;
        }
      }

      // Cuisine filter
      if (selectedCuisine && recipe.cuisine !== selectedCuisine) {
        return false;
      }

      // Category filter
      if (selectedCategory && recipe.category !== selectedCategory) {
        return false;
      }

      // Difficulty filter
      if (selectedDifficulty && recipe.difficulty !== selectedDifficulty) {
        return false;
      }

      return true;
    });
  }, [searchQuery, selectedCuisine, selectedCategory, selectedDifficulty]);

  const clearFilters = () => {
    setSelectedCuisine('');
    setSelectedCategory('');
    setSelectedDifficulty('');
    setSearchQuery('');
  };

  const hasActiveFilters = selectedCuisine || selectedCategory || selectedDifficulty;

  const handleImageError = (recipeId: string) => {
    setImageErrors(prev => new Set(prev).add(recipeId));
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-20">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/80 dark:bg-gray-950/80 backdrop-blur border-b p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold flex items-center gap-2">
                <ChefHat className="w-5 h-5 text-emerald-600" />
                Browse Recipes
              </h1>
              <p className="text-xs text-muted-foreground">
                {filteredRecipes.length} of {recipeDatabase.length} recipes
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search recipes, ingredients, cuisines..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button
              variant={showFilters ? "default" : "outline"}
              size="icon"
              onClick={() => setShowFilters(!showFilters)}
              className={hasActiveFilters ? "bg-emerald-500 hover:bg-emerald-600" : ""}
            >
              <Filter className="w-4 h-4" />
            </Button>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="mt-3 p-3 bg-muted/50 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Filters</span>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters}>
                    <X className="w-3 h-3 mr-1" />
                    Clear
                  </Button>
                )}
              </div>

              {/* Cuisine */}
              <div>
                <label className="text-xs text-muted-foreground">Cuisine</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {['American', 'Italian', 'Mexican', 'Chinese', 'Indian', 'Japanese', 'French', 'Thai'].map(cuisine => (
                    <Badge
                      key={cuisine}
                      variant={selectedCuisine === cuisine ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedCuisine(selectedCuisine === cuisine ? '' : cuisine)}
                    >
                      {cuisine}
                    </Badge>
                  ))}
                  <select
                    value={selectedCuisine}
                    onChange={(e) => setSelectedCuisine(e.target.value)}
                    className="text-xs bg-transparent border rounded px-2 py-1"
                  >
                    <option value="">More...</option>
                    {availableCuisines.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs text-muted-foreground">Category</label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {availableCategories.slice(0, 8).map(category => (
                    <Badge
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory(selectedCategory === category ? '' : category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="text-xs text-muted-foreground">Difficulty</label>
                <div className="flex gap-1 mt-1">
                  {(['Easy', 'Medium', 'Hard'] as Difficulty[]).map(diff => (
                    <Badge
                      key={diff}
                      variant={selectedDifficulty === diff ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedDifficulty(selectedDifficulty === diff ? '' : diff)}
                    >
                      {diff}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Recipe Grid */}
      <div className="p-4 max-w-4xl mx-auto">
        {filteredRecipes.length === 0 ? (
          <div className="text-center py-12">
            <Utensils className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="text-lg font-semibold mb-2">No recipes found</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Try adjusting your search or filters
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Clear All Filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredRecipes.map(recipe => (
              <Link key={recipe.id} href={`/recipe/${recipe.id}`}>
                <Card className="overflow-hidden cursor-pointer hover:ring-2 hover:ring-emerald-500 transition-all h-full">
                  <div className="relative h-32 bg-muted">
                    {!imageErrors.has(recipe.id) ? (
                      <img
                        src={recipe.image}
                        alt={recipe.name}
                        className="w-full h-full object-cover"
                        onError={() => handleImageError(recipe.id)}
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-emerald-100 to-amber-100 dark:from-emerald-900/30 dark:to-amber-900/30">
                        <Utensils className="w-8 h-8 text-emerald-600/50" />
                      </div>
                    )}
                    <Badge className="absolute top-2 right-2 bg-black/60 text-white text-xs">
                      {recipe.cuisine}
                    </Badge>
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-medium text-sm line-clamp-2 mb-2">{recipe.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {recipe.prepTime + recipe.cookTime}m
                      </span>
                      <Badge variant="outline" className="text-[10px] px-1 py-0">
                        {recipe.difficulty}
                      </Badge>
                    </div>
                    <DietaryWarnings ingredients={recipe.ingredients} tags={recipe.tags} compact />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
