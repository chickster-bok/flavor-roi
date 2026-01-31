// Script to fetch all recipes from TheMealDB and generate recipe database
// Run with: npx tsx scripts/fetchRecipes.ts

interface MealDBMeal {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags: string | null;
  strYoutube: string | null;
  strIngredient1: string | null;
  strIngredient2: string | null;
  strIngredient3: string | null;
  strIngredient4: string | null;
  strIngredient5: string | null;
  strIngredient6: string | null;
  strIngredient7: string | null;
  strIngredient8: string | null;
  strIngredient9: string | null;
  strIngredient10: string | null;
  strIngredient11: string | null;
  strIngredient12: string | null;
  strIngredient13: string | null;
  strIngredient14: string | null;
  strIngredient15: string | null;
  strIngredient16: string | null;
  strIngredient17: string | null;
  strIngredient18: string | null;
  strIngredient19: string | null;
  strIngredient20: string | null;
  strMeasure1: string | null;
  strMeasure2: string | null;
  strMeasure3: string | null;
  strMeasure4: string | null;
  strMeasure5: string | null;
  strMeasure6: string | null;
  strMeasure7: string | null;
  strMeasure8: string | null;
  strMeasure9: string | null;
  strMeasure10: string | null;
  strMeasure11: string | null;
  strMeasure12: string | null;
  strMeasure13: string | null;
  strMeasure14: string | null;
  strMeasure15: string | null;
  strMeasure16: string | null;
  strMeasure17: string | null;
  strMeasure18: string | null;
  strMeasure19: string | null;
  strMeasure20: string | null;
}

interface FullRecipe {
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
  }[];
  instructions: string[];
  tips?: string[];
  tags: string[];
  youtubeUrl?: string;
}

async function fetchMealsByLetter(letter: string): Promise<MealDBMeal[]> {
  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?f=${letter}`
    );
    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    console.error(`Error fetching letter ${letter}:`, error);
    return [];
  }
}

function extractIngredients(meal: MealDBMeal): { item: string; amount: string }[] {
  const ingredients: { item: string; amount: string }[] = [];

  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}` as keyof MealDBMeal] as string | null;
    const measure = meal[`strMeasure${i}` as keyof MealDBMeal] as string | null;

    if (ingredient && ingredient.trim()) {
      ingredients.push({
        item: ingredient.trim(),
        amount: (measure || '').trim() || 'to taste',
      });
    }
  }

  return ingredients;
}

function parseInstructions(instructions: string): string[] {
  // Split by periods, newlines, or numbered steps
  const steps = instructions
    .split(/(?:\r?\n)+|(?:(?<=\.)\s+(?=[A-Z]))|(?:\d+\.\s*)/)
    .map(s => s.trim())
    .filter(s => s.length > 10); // Filter out very short segments

  // If we didn't get good splits, just return as paragraphs
  if (steps.length < 2) {
    return instructions
      .split(/(?:\r?\n)+/)
      .map(s => s.trim())
      .filter(s => s.length > 0);
  }

  return steps;
}

function estimateDifficulty(ingredients: number, instructionLength: number): 'Easy' | 'Medium' | 'Hard' {
  if (ingredients <= 6 && instructionLength < 500) return 'Easy';
  if (ingredients >= 12 || instructionLength > 1500) return 'Hard';
  return 'Medium';
}

function estimateTimes(instructions: string): { prepTime: number; cookTime: number } {
  const text = instructions.toLowerCase();

  // Try to find cooking times in the text
  const hourMatch = text.match(/(\d+)\s*hours?/);
  const minMatch = text.match(/(\d+)\s*min/);

  let cookTime = 30; // default
  if (hourMatch) cookTime = parseInt(hourMatch[1]) * 60;
  else if (minMatch) cookTime = parseInt(minMatch[1]);

  // Estimate prep time based on ingredients
  const prepTime = 15;

  return { prepTime, cookTime: Math.max(cookTime, 10) };
}

function convertMealToRecipe(meal: MealDBMeal): FullRecipe {
  const ingredients = extractIngredients(meal);
  const instructions = parseInstructions(meal.strInstructions);
  const { prepTime, cookTime } = estimateTimes(meal.strInstructions);
  const difficulty = estimateDifficulty(ingredients.length, meal.strInstructions.length);

  const tags = meal.strTags
    ? meal.strTags.split(',').map(t => t.trim().toLowerCase())
    : [];
  tags.push(meal.strCategory.toLowerCase());
  tags.push(meal.strArea.toLowerCase());

  // Create a short description from the first part of instructions
  const description = meal.strInstructions.substring(0, 150).trim() + '...';

  return {
    id: `mealdb-${meal.idMeal}`,
    name: meal.strMeal,
    description: description.replace(/\r?\n/g, ' '),
    image: meal.strMealThumb,
    prepTime,
    cookTime,
    servings: 4, // Default
    difficulty,
    cuisine: meal.strArea,
    category: meal.strCategory,
    ingredients,
    instructions,
    tags: [...new Set(tags)],
    youtubeUrl: meal.strYoutube || undefined,
  };
}

async function main() {
  console.log('Fetching all recipes from TheMealDB...\n');

  const allMeals: MealDBMeal[] = [];
  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');

  for (const letter of letters) {
    process.stdout.write(`Fetching ${letter.toUpperCase()}... `);
    const meals = await fetchMealsByLetter(letter);
    console.log(`${meals.length} meals`);
    allMeals.push(...meals);

    // Small delay to be nice to the API
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`\nTotal meals fetched: ${allMeals.length}`);

  // Convert to our format
  const recipes = allMeals.map(convertMealToRecipe);

  // Generate TypeScript file
  const output = `// Auto-generated recipe database from TheMealDB
// Generated on ${new Date().toISOString()}
// Total recipes: ${recipes.length}

export interface FullRecipe {
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
  }[];
  instructions: string[];
  tips?: string[];
  tags: string[];
  youtubeUrl?: string;
}

export const recipeDatabase: FullRecipe[] = ${JSON.stringify(recipes, null, 2)};

// Helper to match ingredients to recipes
export function findMatchingFullRecipes(availableIngredients: string[]): FullRecipe[] {
  const normalizedAvailable = availableIngredients.map(i => i.toLowerCase().trim());

  return recipeDatabase
    .map(recipe => {
      const requiredIngredients = recipe.ingredients
        .filter(ing => !ing.optional)
        .map(ing => ing.item.toLowerCase());

      const matchCount = requiredIngredients.filter(ingredient =>
        normalizedAvailable.some(available =>
          available.includes(ingredient) ||
          ingredient.includes(available) ||
          ingredient.split(' ').some(word => word.length > 3 && available.includes(word)) ||
          available.split(' ').some(word => word.length > 3 && ingredient.includes(word))
        )
      ).length;

      const matchPercentage = requiredIngredients.length > 0
        ? matchCount / requiredIngredients.length
        : 0;

      return { recipe, matchCount, matchPercentage, missingCount: requiredIngredients.length - matchCount };
    })
    .filter(({ matchPercentage }) => matchPercentage >= 0.2)
    .sort((a, b) => {
      if (b.matchPercentage !== a.matchPercentage) {
        return b.matchPercentage - a.matchPercentage;
      }
      return a.missingCount - b.missingCount;
    })
    .map(({ recipe }) => recipe);
}

// Get missing ingredients for a recipe
export function getMissingIngredients(recipe: FullRecipe, availableIngredients: string[]): string[] {
  const normalizedAvailable = availableIngredients.map(i => i.toLowerCase().trim());

  return recipe.ingredients
    .filter(ing => !ing.optional)
    .filter(ing => {
      const ingredient = ing.item.toLowerCase();
      return !normalizedAvailable.some(available =>
        available.includes(ingredient) ||
        ingredient.includes(available) ||
        ingredient.split(' ').some(word => word.length > 3 && available.includes(word)) ||
        available.split(' ').some(word => word.length > 3 && ingredient.includes(word))
      );
    })
    .map(ing => ing.item);
}
`;

  // Write to file
  const fs = await import('fs');
  fs.writeFileSync('./src/lib/recipeDatabase.ts', output);

  console.log(`\nRecipe database written to src/lib/recipeDatabase.ts`);
  console.log(`Total recipes: ${recipes.length}`);

  // Print some stats
  const cuisines = [...new Set(recipes.map(r => r.cuisine))];
  const categories = [...new Set(recipes.map(r => r.category))];

  console.log(`\nCuisines: ${cuisines.join(', ')}`);
  console.log(`Categories: ${categories.join(', ')}`);
}

main().catch(console.error);
