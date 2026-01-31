'use client';

import { useState } from 'react';
import { usePantry } from '@/contexts/PantryContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChefHat,
  Plus,
  X,
  Trash2,
  Package,
  ArrowLeft,
  Search,
  Loader2,
} from 'lucide-react';
import Link from 'next/link';

const COMMON_INGREDIENTS = [
  'Eggs', 'Milk', 'Butter', 'Cheese', 'Bread',
  'Chicken', 'Ground Beef', 'Rice', 'Pasta', 'Olive Oil',
  'Garlic', 'Onion', 'Tomatoes', 'Salt', 'Pepper',
  'Flour', 'Sugar', 'Soy Sauce', 'Lemon', 'Potatoes',
];

export default function PantryPage() {
  const { items, loading, addItem, removeItem, clearAll, hasItem } = usePantry();
  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAddItem = () => {
    if (inputValue.trim()) {
      addItem(inputValue.trim());
      setInputValue('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    }
  };

  const filteredItems = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedItems = [...filteredItems].sort((a, b) =>
    a.name.localeCompare(b.name)
  );

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30 p-4 pb-20">
      {/* Header */}
      <header className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </Link>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAll}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear All
            </Button>
          )}
        </div>
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 mx-auto mb-3">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">My Pantry</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {items.length} ingredient{items.length !== 1 ? 's' : ''} in stock
          </p>
        </div>
      </header>

      {/* Add Ingredient */}
      <Card className="mb-6 max-w-md mx-auto">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder="Add an ingredient..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button
              onClick={handleAddItem}
              disabled={!inputValue.trim()}
              className="bg-emerald-500 hover:bg-emerald-600"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Quick Add */}
          <div className="mt-4">
            <p className="text-xs text-muted-foreground mb-2">Quick add:</p>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_INGREDIENTS.filter((i) => !hasItem(i)).slice(0, 10).map((ingredient) => (
                <Badge
                  key={ingredient}
                  variant="outline"
                  className="cursor-pointer hover:bg-emerald-50 hover:border-emerald-300 dark:hover:bg-emerald-950/30 transition-colors text-xs"
                  onClick={() => addItem(ingredient)}
                >
                  + {ingredient}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search (if many items) */}
      {items.length > 10 && (
        <div className="max-w-md mx-auto mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search pantry..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}

      {/* Pantry Items */}
      {items.length === 0 ? (
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <Package className="w-12 h-12 text-muted-foreground/50 mx-auto mb-3" />
            <h3 className="font-medium mb-1">Your pantry is empty</h3>
            <p className="text-sm text-muted-foreground">
              Add ingredients you have at home to get personalized recipes.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="max-w-md mx-auto">
          <div className="grid grid-cols-2 gap-2">
            {sortedItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-3 bg-card border rounded-lg group hover:border-destructive/50 transition-colors"
              >
                <span className="text-sm truncate flex-1">{item.name}</span>
                <button
                  onClick={() => removeItem(item.id)}
                  className="ml-2 p-1 rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive/10 transition-all"
                  title="Remove"
                >
                  <X className="w-4 h-4 text-destructive" />
                </button>
              </div>
            ))}
          </div>

          {searchQuery && filteredItems.length === 0 && (
            <p className="text-center text-muted-foreground text-sm mt-4">
              No ingredients match "{searchQuery}"
            </p>
          )}
        </div>
      )}

      {/* Use Pantry Button */}
      {items.length > 0 && (
        <div className="fixed bottom-4 left-4 right-4 max-w-md mx-auto">
          <Link href="/?usePantry=true">
            <Button
              className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold shadow-lg"
              size="lg"
            >
              <ChefHat className="w-5 h-5 mr-2" />
              Find Recipes with My Pantry
            </Button>
          </Link>
        </div>
      )}
    </main>
  );
}
