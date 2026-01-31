'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { FullRecipeResult } from '@/lib/types';

interface CookbookContextType {
  recipes: FullRecipeResult[];
  addRecipe: (recipe: FullRecipeResult) => void;
  removeRecipe: (recipeId: string) => void;
  hasRecipe: (recipeId: string) => boolean;
  loading: boolean;
}

const CookbookContext = createContext<CookbookContextType | undefined>(undefined);

const STORAGE_KEY = 'flavor-roi-cookbook';

export function CookbookProvider({ children }: { children: ReactNode }) {
  const [recipes, setRecipes] = useState<FullRecipeResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecipes(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Failed to load cookbook:', error);
    }
    setLoading(false);
  }, []);

  // Save to localStorage when recipes change
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
    }
  }, [recipes, loading]);

  const addRecipe = (recipe: FullRecipeResult) => {
    setRecipes((prev) => {
      if (prev.some((r) => r.id === recipe.id)) {
        return prev;
      }
      return [...prev, recipe];
    });
  };

  const removeRecipe = (recipeId: string) => {
    setRecipes((prev) => prev.filter((r) => r.id !== recipeId));
  };

  const hasRecipe = (recipeId: string) => {
    return recipes.some((r) => r.id === recipeId);
  };

  return (
    <CookbookContext.Provider value={{ recipes, addRecipe, removeRecipe, hasRecipe, loading }}>
      {children}
    </CookbookContext.Provider>
  );
}

export function useCookbook() {
  const context = useContext(CookbookContext);
  if (!context) {
    throw new Error('useCookbook must be used within a CookbookProvider');
  }
  return context;
}
