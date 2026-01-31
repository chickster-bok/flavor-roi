export interface RecipeMatch {
  id: string;
  basic_recipe_name: string;
  upgrade_recipe_name: string;
  missing_magic_ingredient: string;
  taste_score_basic: number;
  taste_score_upgrade: number;
  missing_ingredient_price: number;
  flavor_roi: number;
  upgrade_description: string;
}

export interface FullRecipeResult {
  id: string;
  name: string;
  description: string;
  image: string;
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  cuisine: string;
  category: string;
  ingredients: {
    item: string;
    amount: string;
    optional?: boolean;
    available: boolean; // Whether user has this ingredient
  }[];
  instructions: string[];
  tips?: string[];
  tags: string[];
  youtubeUrl?: string;
  rating?: number;
  reviewCount?: number;
  calories?: number;
  mealType?: string[];
  matchPercentage: number; // How well it matches user's ingredients
  missingIngredients: string[];
}

export interface AnalysisResult {
  found_ingredients: string[];
  recipes: FullRecipeResult[];
  // Legacy fields for backward compatibility
  missing_magic_ingredient?: string;
  upgrade_recipe_name?: string;
  basic_recipe_name?: string;
  taste_score_basic?: number;
  taste_score_upgrade?: number;
  missing_ingredient_price?: number;
  flavor_roi?: number;
}

export interface MockScenario {
  id: string;
  name: string;
  description: string;
  result: AnalysisResult;
}

export type AnalysisState = 'idle' | 'capturing' | 'analyzing' | 'complete' | 'error';
