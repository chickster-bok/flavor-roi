'use client';

import Link from 'next/link';
import { useProfile } from '@/contexts/ProfileContext';
import { usePantry } from '@/contexts/PantryContext';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  ShoppingCart,
  Check,
  Trash2,
  Plus,
  Package,
  Loader2,
  ExternalLink,
} from 'lucide-react';

// Common grocery items for suggestions
const COMMON_INGREDIENTS = [
  // Produce
  'Apples', 'Avocados', 'Bananas', 'Bell peppers', 'Broccoli', 'Carrots', 'Celery',
  'Cilantro', 'Cucumbers', 'Garlic', 'Ginger', 'Green onions', 'Jalapenos', 'Kale',
  'Lemons', 'Lettuce', 'Limes', 'Mushrooms', 'Onions', 'Oranges', 'Parsley', 'Potatoes',
  'Spinach', 'Strawberries', 'Tomatoes', 'Zucchini',
  // Dairy
  'Butter', 'Cheddar cheese', 'Cottage cheese', 'Cream cheese', 'Eggs', 'Greek yogurt',
  'Heavy cream', 'Milk', 'Mozzarella cheese', 'Parmesan cheese', 'Sour cream', 'Yogurt',
  // Meat & Protein
  'Bacon', 'Beef ground', 'Chicken breasts', 'Chicken thighs', 'Ham', 'Pork chops',
  'Salmon', 'Sausage', 'Shrimp', 'Steak', 'Tofu', 'Turkey',
  // Pantry
  'All-purpose flour', 'Baking powder', 'Baking soda', 'Black beans', 'Bread',
  'Bread crumbs', 'Brown sugar', 'Canned tomatoes', 'Chicken broth', 'Chickpeas',
  'Coconut milk', 'Cornstarch', 'Honey', 'Maple syrup', 'Olive oil', 'Pasta',
  'Peanut butter', 'Rice', 'Soy sauce', 'Sugar', 'Tortillas', 'Vanilla extract',
  'Vegetable oil', 'Vinegar', 'White sugar',
  // Spices
  'Basil', 'Bay leaves', 'Black pepper', 'Cayenne pepper', 'Chili powder',
  'Cinnamon', 'Cumin', 'Curry powder', 'Italian seasoning', 'Oregano', 'Paprika',
  'Red pepper flakes', 'Rosemary', 'Salt', 'Thyme', 'Turmeric',
  // Frozen
  'Frozen berries', 'Frozen corn', 'Frozen peas', 'Frozen pizza', 'Ice cream',
  // Beverages
  'Coffee', 'Orange juice', 'Tea',
];

export default function ShoppingListPage() {
  const { profile, toggleShoppingItem, clearShoppingList, addToShoppingList, loading } = useProfile();
  const { addItems } = usePantry();
  const [newItem, setNewItem] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  const checkedItems = profile.shoppingList.filter(i => i.checked);
  const uncheckedItems = profile.shoppingList.filter(i => !i.checked);

  // Filter suggestions based on input
  useEffect(() => {
    if (newItem.trim().length >= 1) {
      const filtered = COMMON_INGREDIENTS.filter(item =>
        item.toLowerCase().includes(newItem.toLowerCase()) &&
        !profile.shoppingList.some(s => s.item.toLowerCase() === item.toLowerCase())
      ).slice(0, 8);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [newItem, profile.shoppingList]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddItem = (item?: string) => {
    const itemToAdd = item || newItem.trim();
    if (itemToAdd) {
      addToShoppingList([{ item: itemToAdd }]);
      setNewItem('');
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions || suggestions.length === 0) {
      if (e.key === 'Enter') {
        handleAddItem();
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0) {
          handleAddItem(suggestions[selectedIndex]);
        } else {
          handleAddItem();
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleAddToPantry = () => {
    const checkedNames = checkedItems.map(i => i.item);
    if (checkedNames.length > 0) {
      addItems(checkedNames);
      // Remove checked items from shopping list
      clearShoppingList();
      uncheckedItems.forEach(item => {
        addToShoppingList([{ item: item.item, recipeId: item.recipeId }]);
      });
    }
  };

  const instacartUrl = `https://www.instacart.com/store/search/${encodeURIComponent(
    uncheckedItems.map(i => i.item).join(' ')
  )}`;

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
        <Link href="/dashboard">
          <Button variant="ghost" size="sm" className="mb-2">
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
        </Link>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Shopping List</h1>
              <p className="text-sm text-muted-foreground">
                {profile.shoppingList.length} item{profile.shoppingList.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          {profile.shoppingList.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-red-500"
              onClick={clearShoppingList}
            >
              <Trash2 className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </header>

      {/* Add Item with Autocomplete */}
      <div className="relative mb-4">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            placeholder="Add an item..."
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (suggestions.length > 0) setShowSuggestions(true);
            }}
          />
          <Button onClick={() => handleAddItem()}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {/* Suggestions Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div
            ref={suggestionsRef}
            className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-900 border rounded-lg shadow-lg overflow-hidden"
          >
            {suggestions.map((suggestion, index) => (
              <button
                key={suggestion}
                className={`w-full px-4 py-2 text-left text-sm hover:bg-muted transition-colors ${
                  index === selectedIndex ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400' : ''
                }`}
                onClick={() => handleAddItem(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {profile.shoppingList.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
            <h2 className="text-lg font-semibold mb-2">No items yet</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Start typing to add items - suggestions will appear as you type!
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* Unchecked Items */}
          {uncheckedItems.length > 0 && (
            <Card>
              <CardContent className="p-4">
                <h2 className="text-sm font-medium mb-3">To Buy ({uncheckedItems.length})</h2>
                <div className="space-y-2">
                  {uncheckedItems.map((item, index) => {
                    const originalIndex = profile.shoppingList.findIndex(
                      i => i.item === item.item && !i.checked
                    );
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => toggleShoppingItem(originalIndex)}
                      >
                        <div className="w-5 h-5 rounded border-2 border-muted-foreground/30" />
                        <span className="flex-1">{item.item}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Checked Items */}
          {checkedItems.length > 0 && (
            <Card className="opacity-75">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-sm font-medium">Bought ({checkedItems.length})</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleAddToPantry}
                    className="text-emerald-600"
                  >
                    <Package className="w-4 h-4 mr-1" />
                    Add to Pantry
                  </Button>
                </div>
                <div className="space-y-2">
                  {checkedItems.map((item, index) => {
                    const originalIndex = profile.shoppingList.findIndex(
                      i => i.item === item.item && i.checked
                    );
                    return (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 cursor-pointer"
                        onClick={() => toggleShoppingItem(originalIndex)}
                      >
                        <div className="w-5 h-5 rounded bg-emerald-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                        <span className="flex-1 line-through text-muted-foreground">
                          {item.item}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Online */}
          {uncheckedItems.length > 0 && (
            <Button className="w-full bg-emerald-500 hover:bg-emerald-600" asChild>
              <a href={instacartUrl} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                Order on Instacart
              </a>
            </Button>
          )}
        </div>
      )}
    </main>
  );
}
