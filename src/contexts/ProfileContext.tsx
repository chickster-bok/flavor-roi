'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type CookingLevel = 'beginner' | 'home-cook' | 'amateur-chef' | 'pro';

export interface CookingStats {
  recipesCooked: number;
  recipesSaved: number;
  ingredientsScanned: number;
  cuisinesExplored: string[];
}

export interface UserProfile {
  displayName: string;
  cookingLevel: CookingLevel;
  favoriteCuisines: string[];
  dietaryRestrictions: string[];
  allergies: string[];
  stats: CookingStats;
  recentlyViewed: string[]; // recipe IDs
  mealPlan: { [date: string]: { [meal: string]: string } }; // date -> meal type -> recipe ID
  shoppingList: { item: string; checked: boolean; recipeId?: string }[];
}

interface ProfileContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
  addRecentlyViewed: (recipeId: string) => void;
  markRecipeCooked: (recipeId: string, cuisine: string) => void;
  addToMealPlan: (date: string, meal: string, recipeId: string) => void;
  removeFromMealPlan: (date: string, meal: string) => void;
  addToShoppingList: (items: { item: string; recipeId?: string }[]) => void;
  toggleShoppingItem: (index: number) => void;
  clearShoppingList: () => void;
  loading: boolean;
}

const DEFAULT_PROFILE: UserProfile = {
  displayName: '',
  cookingLevel: 'beginner',
  favoriteCuisines: [],
  dietaryRestrictions: [],
  allergies: [],
  stats: {
    recipesCooked: 0,
    recipesSaved: 0,
    ingredientsScanned: 0,
    cuisinesExplored: [],
  },
  recentlyViewed: [],
  mealPlan: {},
  shoppingList: [],
};

const STORAGE_KEY = 'flavor-roi-profile';

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all fields exist
        setProfile({
          ...DEFAULT_PROFILE,
          ...parsed,
          stats: { ...DEFAULT_PROFILE.stats, ...parsed.stats },
        });
      }
    } catch (error) {
      console.error('Failed to load profile:', error);
    }
    setLoading(false);
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (!loading) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    }
  }, [profile, loading]);

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile(prev => ({ ...prev, ...updates }));
  };

  const addRecentlyViewed = (recipeId: string) => {
    setProfile(prev => {
      const filtered = prev.recentlyViewed.filter(id => id !== recipeId);
      return {
        ...prev,
        recentlyViewed: [recipeId, ...filtered].slice(0, 20), // Keep last 20
      };
    });
  };

  const markRecipeCooked = (recipeId: string, cuisine: string) => {
    setProfile(prev => {
      const cuisinesExplored = prev.stats.cuisinesExplored.includes(cuisine)
        ? prev.stats.cuisinesExplored
        : [...prev.stats.cuisinesExplored, cuisine];

      return {
        ...prev,
        stats: {
          ...prev.stats,
          recipesCooked: prev.stats.recipesCooked + 1,
          cuisinesExplored,
        },
      };
    });
  };

  const addToMealPlan = (date: string, meal: string, recipeId: string) => {
    setProfile(prev => ({
      ...prev,
      mealPlan: {
        ...prev.mealPlan,
        [date]: {
          ...prev.mealPlan[date],
          [meal]: recipeId,
        },
      },
    }));
  };

  const removeFromMealPlan = (date: string, meal: string) => {
    setProfile(prev => {
      const dayPlan = { ...prev.mealPlan[date] };
      delete dayPlan[meal];
      return {
        ...prev,
        mealPlan: {
          ...prev.mealPlan,
          [date]: dayPlan,
        },
      };
    });
  };

  const addToShoppingList = (items: { item: string; recipeId?: string }[]) => {
    setProfile(prev => ({
      ...prev,
      shoppingList: [
        ...prev.shoppingList,
        ...items.map(i => ({ ...i, checked: false })),
      ],
    }));
  };

  const toggleShoppingItem = (index: number) => {
    setProfile(prev => ({
      ...prev,
      shoppingList: prev.shoppingList.map((item, i) =>
        i === index ? { ...item, checked: !item.checked } : item
      ),
    }));
  };

  const clearShoppingList = () => {
    setProfile(prev => ({ ...prev, shoppingList: [] }));
  };

  return (
    <ProfileContext.Provider
      value={{
        profile,
        updateProfile,
        addRecentlyViewed,
        markRecipeCooked,
        addToMealPlan,
        removeFromMealPlan,
        addToShoppingList,
        toggleShoppingItem,
        clearShoppingList,
        loading,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}

export const DIETARY_OPTIONS = [
  'Vegetarian',
  'Vegan',
  'Gluten-Free',
  'Dairy-Free',
  'Keto',
  'Paleo',
  'Low-Carb',
  'Halal',
  'Kosher',
];

export const ALLERGY_OPTIONS = [
  'Peanuts',
  'Tree Nuts',
  'Milk',
  'Eggs',
  'Wheat',
  'Soy',
  'Fish',
  'Shellfish',
  'Sesame',
];

export const COOKING_LEVELS: { value: CookingLevel; label: string; description: string }[] = [
  { value: 'beginner', label: 'Beginner', description: 'Just starting out, learning basics' },
  { value: 'home-cook', label: 'Home Cook', description: 'Comfortable with everyday recipes' },
  { value: 'amateur-chef', label: 'Amateur Chef', description: 'Enjoys challenging recipes' },
  { value: 'pro', label: 'Pro', description: 'Expert level, any recipe is possible' },
];
