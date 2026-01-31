// Script to fetch all recipes from multiple free APIs and generate recipe database
// Run with: npx tsx scripts/fetchAllRecipes.ts

import { stapleRecipes } from './stapleRecipes';

interface MealDBMeal {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strTags: string | null;
  strYoutube: string | null;
  strSource: string | null;
  [key: string]: string | null;
}

interface DummyRecipe {
  id: number;
  name: string;
  ingredients: string[];
  instructions: string[];
  prepTimeMinutes: number;
  cookTimeMinutes: number;
  servings: number;
  difficulty: string;
  cuisine: string;
  caloriesPerServing: number;
  tags: string[];
  image: string;
  rating: number;
  reviewCount: number;
  mealType: string[];
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
  rating?: number;
  reviewCount?: number;
  calories?: number;
  mealType?: string[];
}

// ============ MEALDB FUNCTIONS ============

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

async function fetchMealById(id: string): Promise<MealDBMeal | null> {
  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
    );
    const data = await response.json();
    return data.meals?.[0] || null;
  } catch (error) {
    console.error(`Error fetching meal ${id}:`, error);
    return null;
  }
}

async function fetchMealsByCategory(category: string): Promise<{ idMeal: string }[]> {
  try {
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/filter.php?c=${category}`
    );
    const data = await response.json();
    return data.meals || [];
  } catch (error) {
    console.error(`Error fetching category ${category}:`, error);
    return [];
  }
}

async function fetchAllCategories(): Promise<string[]> {
  try {
    const response = await fetch(
      'https://www.themealdb.com/api/json/v1/1/categories.php'
    );
    const data = await response.json();
    return data.categories?.map((c: { strCategory: string }) => c.strCategory) || [];
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
}

function extractMealDBIngredients(meal: MealDBMeal): { item: string; amount: string }[] {
  const ingredients: { item: string; amount: string }[] = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
      ingredients.push({
        item: ingredient.trim(),
        amount: (measure || '').trim() || 'to taste',
      });
    }
  }
  return ingredients;
}

function parseMealDBInstructions(instructions: string): string[] {
  if (!instructions || instructions.trim().length < 20) {
    return [];
  }

  // Clean up the instructions
  let cleaned = instructions
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .trim();

  // Try splitting by numbered steps first (1. 2. 3. or STEP 1, STEP 2)
  const numberedSteps = cleaned.split(/(?:\n|^)(?:STEP\s*)?\d+[\.\):\s]+/i);
  if (numberedSteps.length > 2) {
    return numberedSteps
      .map(s => s.trim())
      .filter(s => s.length > 10)
      .slice(0, 15);
  }

  // Try splitting by double newlines
  const paragraphs = cleaned.split(/\n\n+/);
  if (paragraphs.length > 1) {
    return paragraphs
      .map(s => s.replace(/\n/g, ' ').trim())
      .filter(s => s.length > 10)
      .slice(0, 15);
  }

  // Try splitting by single newlines
  const lines = cleaned.split(/\n/);
  if (lines.length > 1) {
    return lines
      .map(s => s.trim())
      .filter(s => s.length > 10)
      .slice(0, 15);
  }

  // Try splitting by sentences (for long continuous text)
  const sentences = cleaned.split(/(?<=[.!?])\s+(?=[A-Z])/);
  if (sentences.length > 2) {
    // Group sentences into steps of 1-2 sentences each
    const steps: string[] = [];
    for (let i = 0; i < sentences.length; i += 2) {
      const step = sentences.slice(i, i + 2).join(' ').trim();
      if (step.length > 10) {
        steps.push(step);
      }
    }
    return steps.slice(0, 15);
  }

  // Last resort: just return the whole thing as one step if it's valid
  if (cleaned.length > 20) {
    return [cleaned];
  }

  return [];
}

function convertMealDBToRecipe(meal: MealDBMeal): FullRecipe | null {
  const ingredients = extractMealDBIngredients(meal);
  const instructions = parseMealDBInstructions(meal.strInstructions);

  // Skip recipes with no valid instructions
  if (instructions.length === 0 || instructions[0].length < 20) {
    return null;
  }

  // Skip recipes with too few ingredients
  if (ingredients.length < 2) {
    return null;
  }

  // Estimate times from instructions
  const text = (meal.strInstructions || '').toLowerCase();
  const hourMatch = text.match(/(\d+)\s*hours?/);
  const minMatch = text.match(/(\d+)\s*min/);
  let cookTime = 30;
  if (hourMatch) cookTime = parseInt(hourMatch[1]) * 60;
  else if (minMatch) cookTime = Math.max(parseInt(minMatch[1]), 10);

  // Estimate difficulty
  let difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium';
  if (ingredients.length <= 6 && (meal.strInstructions || '').length < 500) difficulty = 'Easy';
  else if (ingredients.length >= 12 || (meal.strInstructions || '').length > 1500) difficulty = 'Hard';

  const tags = meal.strTags ? meal.strTags.split(',').map(t => t.trim().toLowerCase()) : [];
  tags.push(meal.strCategory.toLowerCase());
  tags.push(meal.strArea.toLowerCase());

  // Create a proper description (first sentence or two)
  const descMatch = (meal.strInstructions || '').match(/^(.{50,200}?[.!?])\s/);
  const description = descMatch
    ? descMatch[1]
    : (meal.strInstructions || '').substring(0, 150).trim().replace(/\r?\n/g, ' ') + '...';

  return {
    id: `mealdb-${meal.idMeal}`,
    name: meal.strMeal,
    description,
    image: meal.strMealThumb,
    prepTime: 15,
    cookTime: Math.max(cookTime, 10),
    servings: 4,
    difficulty,
    cuisine: meal.strArea,
    category: meal.strCategory,
    ingredients,
    instructions,
    tags: [...new Set(tags)],
    youtubeUrl: meal.strYoutube || undefined,
  };
}

// ============ DUMMYJSON FUNCTIONS ============

async function fetchDummyRecipes(): Promise<DummyRecipe[]> {
  try {
    const response = await fetch('https://dummyjson.com/recipes?limit=100');
    const data = await response.json();
    return data.recipes || [];
  } catch (error) {
    console.error('Error fetching DummyJSON:', error);
    return [];
  }
}

function convertDummyToRecipe(recipe: DummyRecipe): FullRecipe {
  const difficulty = recipe.difficulty === 'Easy' ? 'Easy'
    : recipe.difficulty === 'Hard' ? 'Hard' : 'Medium';

  // Parse ingredients - DummyJSON has simple strings
  const ingredients = recipe.ingredients.map(ing => {
    // Try to extract amount from ingredient string
    const match = ing.match(/^([\d\/\.\s]+\s*(?:cup|tbsp|tsp|oz|lb|g|kg|ml|l|piece|clove|slice|can)?s?)\s+(.+)$/i);
    if (match) {
      return { item: match[2].trim(), amount: match[1].trim() };
    }
    return { item: ing, amount: '' };
  });

  // Determine category from tags or meal type
  let category = 'Miscellaneous';
  const lowerTags = recipe.tags.map(t => t.toLowerCase());
  if (lowerTags.includes('chicken') || lowerTags.includes('beef') || lowerTags.includes('lamb')) {
    category = lowerTags.find(t => ['chicken', 'beef', 'lamb', 'pork'].includes(t)) || 'Miscellaneous';
    category = category.charAt(0).toUpperCase() + category.slice(1);
  } else if (lowerTags.includes('pasta')) category = 'Pasta';
  else if (lowerTags.includes('dessert') || lowerTags.includes('cookies') || lowerTags.includes('cake')) category = 'Dessert';
  else if (lowerTags.includes('salad')) category = 'Side';
  else if (lowerTags.includes('soup')) category = 'Soup';
  else if (lowerTags.includes('vegetarian') || lowerTags.includes('vegan')) category = 'Vegetarian';
  else if (recipe.mealType.includes('Breakfast')) category = 'Breakfast';
  else if (recipe.mealType.includes('Appetizer') || recipe.mealType.includes('Snack')) category = 'Starter';

  return {
    id: `dummy-${recipe.id}`,
    name: recipe.name,
    description: recipe.instructions[0]?.substring(0, 150) + '...' || recipe.name,
    image: recipe.image,
    prepTime: recipe.prepTimeMinutes,
    cookTime: recipe.cookTimeMinutes,
    servings: recipe.servings,
    difficulty,
    cuisine: recipe.cuisine,
    category,
    ingredients,
    instructions: recipe.instructions,
    tags: recipe.tags.map(t => t.toLowerCase()),
    rating: recipe.rating,
    reviewCount: recipe.reviewCount,
    calories: recipe.caloriesPerServing,
    mealType: recipe.mealType,
  };
}

// ============ ALLRECIPES FUNCTIONS ============

interface AllRecipesJsonLD {
  '@type': string | string[];
  name: string;
  description: string;
  image: { url: string } | string[] | string;
  prepTime?: string;
  cookTime?: string;
  totalTime?: string;
  recipeYield?: string | string[] | number;
  recipeIngredient?: string[];
  recipeInstructions?: { text: string }[] | string[];
  aggregateRating?: { ratingValue: number; reviewCount: number };
  recipeCategory?: string | string[];
  recipeCuisine?: string | string[];
  keywords?: string | string[];
}

// Popular AllRecipes recipe paths to fetch (with slugs)
const ALLRECIPES_PATHS = [
  // Found from various AllRecipes category pages
  '/recipe/142748/bauernomlett-farmers-omelet',
  '/recipe/151595/campbells-green-bean-casserole',
  '/recipe/25199/sweet-and-sour-meatballs-suan-tien-niu-jou-po-lo-la-tzu',
  '/recipe/284441/banh-tet',
  '/recipe/221286/traditional-mexican-guacamole',
  '/recipe/270635/sushi-bake',
  '/recipe/144059/jumbo-breakfast-cookies',
  '/recipe/255275/leftover-roast-beef-hash',
  '/recipe/65691/pumpkin-waffles-with-apple-cider-syrup',
  '/recipe/8496144/apple-fritter-pancakes',
  '/recipe/9482/scotch-eggs',
  '/recipe/15492/ganache-i',
  '/recipe/275590/marry-me-chicken',
  '/recipe/69466/crabless-chicken-cakes',
  // Additional popular recipes
  '/recipe/10813/best-chocolate-chip-cookies',
  '/recipe/6848/cheesecake',
  '/recipe/7918/apple-pie-by-grandma-ople',
  '/recipe/15749/banana-banana-bread',
  '/recipe/17891/best-brownies',
  '/recipe/16354/easy-meatloaf',
  '/recipe/23600/worlds-best-lasagna',
  '/recipe/228285/crispy-and-juicy-fried-chicken',
  '/recipe/13802/chicken-marsala',
  '/recipe/219164/simple-baked-chicken-breasts',
  '/recipe/24264/beef-stew-vi',
  '/recipe/11758/restaurant-style-alfredo-sauce',
  '/recipe/11643/spaghetti-carbonara-ii',
  '/recipe/228968/shrimp-scampi-with-pasta',
  '/recipe/26460/chicken-tortilla-soup',
  '/recipe/13307/french-onion-soup',
  '/recipe/27192/stuffed-bell-peppers-i',
  '/recipe/89029/baked-salmon-fillets-dijon',
  '/recipe/18374/fish-tacos',
  '/recipe/223002/easy-butter-chicken',
  '/recipe/212721/chicken-tikka-masala',
  '/recipe/16167/grilled-cheese-sandwich',
  '/recipe/14084/blt-sandwich',
  '/recipe/44055/penne-alla-vodka',
  '/recipe/229779/one-pot-mac-and-cheese',
  // More from browsing
  '/recipe/8652/worlds-best-meatloaf',
  '/recipe/219173/one-pot-chicken-and-potatoes',
  '/recipe/228823/caprese-salad',
  '/recipe/213717/best-veggie-burgers',
  '/recipe/240559/easy-vegetable-stir-fry',
  '/recipe/229779/one-pot-mac-and-cheese',
  '/recipe/220560/ground-beef-tacos',
  '/recipe/158140/shakshuka',
  '/recipe/39544/potato-soup',
  '/recipe/17205/homemade-ramen',
];

async function fetchAllRecipesPage(recipePath: string): Promise<FullRecipe | null> {
  try {
    const url = `https://www.allrecipes.com${recipePath}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
    });

    if (!response.ok) {
      return null;
    }

    const html = await response.text();

    // Extract JSON-LD data - look for Recipe schema specifically
    // Handle script tags with other attributes before or after type
    const jsonLdMatches = html.matchAll(/<script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi);

    let recipe: AllRecipesJsonLD | undefined;

    for (const match of jsonLdMatches) {
      try {
        const jsonData = JSON.parse(match[1]);

        // Check if it's a Recipe or contains a Recipe
        if (Array.isArray(jsonData)) {
          const found = jsonData.find((item: AllRecipesJsonLD) =>
            item['@type'] === 'Recipe' || (Array.isArray(item['@type']) && item['@type'].includes('Recipe'))
          );
          if (found) {
            recipe = found;
            break;
          }
        } else if (jsonData['@type'] === 'Recipe' || (Array.isArray(jsonData['@type']) && jsonData['@type'].includes('Recipe'))) {
          recipe = jsonData;
          break;
        } else if (jsonData['@graph']) {
          // Some sites use @graph array
          const found = jsonData['@graph'].find((item: AllRecipesJsonLD) =>
            item['@type'] === 'Recipe' || (Array.isArray(item['@type']) && item['@type'].includes('Recipe'))
          );
          if (found) {
            recipe = found;
            break;
          }
        }
      } catch {
        // Continue to next script tag
        continue;
      }
    }

    if (!recipe) {
      return null;
    }

    // Parse ISO 8601 duration (PT30M, PT1H30M, etc.)
    const parseDuration = (duration?: string): number => {
      if (!duration) return 0;
      const hourMatch = duration.match(/(\d+)H/);
      const minMatch = duration.match(/(\d+)M/);
      const hours = hourMatch ? parseInt(hourMatch[1]) : 0;
      const minutes = minMatch ? parseInt(minMatch[1]) : 0;
      return hours * 60 + minutes;
    };

    // Parse ingredients
    const ingredients = (recipe.recipeIngredient || []).map((ing) => {
      // Try to extract amount from ingredient string
      const match = ing.match(/^([\d\/\.\s¼½¾⅓⅔⅛]+\s*(?:cups?|tbsps?|tsps?|tablespoons?|teaspoons?|ounces?|oz|pounds?|lbs?|grams?|g|kg|ml|l|pieces?|cloves?|slices?|cans?)?)\s+(.+)$/i);
      if (match) {
        return { item: match[2].trim(), amount: match[1].trim() };
      }
      return { item: ing, amount: '' };
    });

    // Parse instructions
    let instructions: string[] = [];
    if (recipe.recipeInstructions) {
      instructions = recipe.recipeInstructions.map((step) =>
        typeof step === 'string' ? step : step.text
      ).filter((s) => s.length > 0);
    }

    // Skip if no valid instructions
    if (instructions.length < 2 || ingredients.length < 3) {
      return null;
    }

    // Get image
    let image = 'https://images.unsplash.com/photo-1495521821757-a1efb6729352?w=800';
    if (recipe.image) {
      if (Array.isArray(recipe.image)) {
        image = recipe.image[0];
      } else if (typeof recipe.image === 'object' && recipe.image.url) {
        image = recipe.image.url;
      }
    }

    // Determine difficulty
    const totalTime = parseDuration(recipe.totalTime) || parseDuration(recipe.prepTime) + parseDuration(recipe.cookTime);
    let difficulty: 'Easy' | 'Medium' | 'Hard' = 'Medium';
    if (ingredients.length <= 6 && totalTime <= 30) difficulty = 'Easy';
    else if (ingredients.length >= 12 || totalTime >= 90) difficulty = 'Hard';

    // Parse cuisine
    let cuisine = 'American';
    if (recipe.recipeCuisine) {
      cuisine = Array.isArray(recipe.recipeCuisine) ? recipe.recipeCuisine[0] : recipe.recipeCuisine;
    }

    // Parse category
    let category = 'Miscellaneous';
    if (recipe.recipeCategory) {
      const cat = Array.isArray(recipe.recipeCategory) ? recipe.recipeCategory[0] : recipe.recipeCategory;
      if (cat.toLowerCase().includes('chicken')) category = 'Chicken';
      else if (cat.toLowerCase().includes('beef')) category = 'Beef';
      else if (cat.toLowerCase().includes('pork')) category = 'Pork';
      else if (cat.toLowerCase().includes('seafood') || cat.toLowerCase().includes('fish')) category = 'Seafood';
      else if (cat.toLowerCase().includes('pasta')) category = 'Pasta';
      else if (cat.toLowerCase().includes('soup')) category = 'Soup';
      else if (cat.toLowerCase().includes('dessert') || cat.toLowerCase().includes('baking')) category = 'Dessert';
      else if (cat.toLowerCase().includes('breakfast')) category = 'Breakfast';
      else if (cat.toLowerCase().includes('salad') || cat.toLowerCase().includes('side')) category = 'Side';
      else if (cat.toLowerCase().includes('vegetarian') || cat.toLowerCase().includes('vegan')) category = 'Vegetarian';
      else if (cat.toLowerCase().includes('appetizer')) category = 'Starter';
    }

    // Parse tags
    const tags: string[] = [];
    if (recipe.keywords) {
      if (typeof recipe.keywords === 'string') {
        tags.push(...recipe.keywords.split(',').map((t) => t.trim().toLowerCase()).slice(0, 10));
      } else if (Array.isArray(recipe.keywords)) {
        tags.push(...recipe.keywords.map((t: string) => t.toLowerCase()).slice(0, 10));
      }
    }
    tags.push(category.toLowerCase());
    tags.push(cuisine.toLowerCase());

    // Parse servings
    let servings = 4;
    if (recipe.recipeYield) {
      const yieldStr = Array.isArray(recipe.recipeYield)
        ? recipe.recipeYield[0]
        : String(recipe.recipeYield);
      const yieldMatch = yieldStr.match(/(\d+)/);
      if (yieldMatch) servings = parseInt(yieldMatch[1]);
    }

    return {
      id: `allrecipes-${recipePath.split('/')[2]}`,
      name: recipe.name,
      description: recipe.description?.substring(0, 200) || recipe.name,
      image,
      prepTime: parseDuration(recipe.prepTime) || 15,
      cookTime: parseDuration(recipe.cookTime) || 30,
      servings,
      difficulty,
      cuisine,
      category,
      ingredients,
      instructions,
      tags: [...new Set(tags)],
      rating: recipe.aggregateRating?.ratingValue ? Number(recipe.aggregateRating.ratingValue) : undefined,
      reviewCount: recipe.aggregateRating?.reviewCount ? Number(recipe.aggregateRating.reviewCount) : undefined,
    };
  } catch (error) {
    console.error(`Error fetching AllRecipes ${recipePath}:`, error);
    return null;
  }
}

async function fetchAllRecipes(): Promise<FullRecipe[]> {
  const recipes: FullRecipe[] = [];

  for (let i = 0; i < ALLRECIPES_PATHS.length; i++) {
    const path = ALLRECIPES_PATHS[i];
    process.stdout.write(`  Fetching ${i + 1}/${ALLRECIPES_PATHS.length}...\r`);

    const recipe = await fetchAllRecipesPage(path);
    if (recipe) {
      recipes.push(recipe);
    }

    // Rate limiting - be respectful
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log(`  Fetched ${recipes.length} recipes from AllRecipes.com`);
  return recipes;
}

// ============ ADDITIONAL CURATED RECIPES ============

function getCuratedRecipes(): FullRecipe[] {
  // Add popular recipes that might be missing or have bad data
  return [
    {
      id: 'curated-1',
      name: 'Classic Scrambled Eggs',
      description: 'Perfectly creamy scrambled eggs with butter, cooked low and slow for the best texture.',
      image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800',
      prepTime: 5,
      cookTime: 10,
      servings: 2,
      difficulty: 'Easy',
      cuisine: 'American',
      category: 'Breakfast',
      ingredients: [
        { item: 'eggs', amount: '4 large' },
        { item: 'butter', amount: '2 tbsp' },
        { item: 'salt', amount: '1/4 tsp' },
        { item: 'black pepper', amount: 'to taste' },
        { item: 'chives', amount: '1 tbsp, chopped', optional: true },
      ],
      instructions: [
        'Crack eggs into a bowl and beat with a fork until yolks and whites are combined.',
        'Melt butter in a non-stick pan over medium-low heat.',
        'Add beaten eggs to the pan. Let them sit for 20 seconds until edges start to set.',
        'Using a spatula, gently push eggs from edges toward center, creating soft curds.',
        'Continue folding and pushing every 20 seconds. Remove from heat while still slightly wet.',
        'Season with salt and pepper, garnish with chives if desired. Serve immediately.',
      ],
      tags: ['breakfast', 'eggs', 'quick', 'easy', 'vegetarian'],
      mealType: ['Breakfast'],
    },
    {
      id: 'curated-2',
      name: 'Simple Bread Omelette',
      description: 'A quick Indian-style breakfast combining fluffy eggs with crispy bread slices, perfect for busy mornings.',
      image: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?w=800',
      prepTime: 5,
      cookTime: 10,
      servings: 2,
      difficulty: 'Easy',
      cuisine: 'Indian',
      category: 'Breakfast',
      ingredients: [
        { item: 'bread slices', amount: '4' },
        { item: 'eggs', amount: '3' },
        { item: 'onion', amount: '1 small, finely chopped' },
        { item: 'green chili', amount: '1, finely chopped', optional: true },
        { item: 'salt', amount: '1/2 tsp' },
        { item: 'black pepper', amount: '1/4 tsp' },
        { item: 'oil or butter', amount: '2 tbsp' },
        { item: 'cilantro', amount: '2 tbsp, chopped', optional: true },
      ],
      instructions: [
        'Beat eggs in a bowl with salt, pepper, chopped onion, green chili, and cilantro.',
        'Heat oil or butter in a flat pan over medium heat.',
        'Dip each bread slice in the egg mixture, coating both sides well.',
        'Place coated bread in the hot pan and pour remaining egg mixture over it.',
        'Cook for 2-3 minutes until bottom is golden, then flip carefully.',
        'Cook other side for another 2 minutes until eggs are set and bread is crispy.',
        'Serve hot with ketchup or green chutney.',
      ],
      tags: ['breakfast', 'eggs', 'bread', 'quick', 'indian', 'vegetarian'],
      mealType: ['Breakfast'],
    },
    {
      id: 'curated-3',
      name: 'Garlic Butter Pasta',
      description: 'Simple yet delicious pasta tossed in garlic-infused butter with parmesan and fresh herbs.',
      image: 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=800',
      prepTime: 10,
      cookTime: 15,
      servings: 4,
      difficulty: 'Easy',
      cuisine: 'Italian',
      category: 'Pasta',
      ingredients: [
        { item: 'spaghetti or linguine', amount: '1 lb' },
        { item: 'butter', amount: '4 tbsp' },
        { item: 'garlic', amount: '6 cloves, minced' },
        { item: 'olive oil', amount: '2 tbsp' },
        { item: 'parmesan cheese', amount: '1/2 cup, grated' },
        { item: 'fresh parsley', amount: '1/4 cup, chopped' },
        { item: 'red pepper flakes', amount: '1/4 tsp', optional: true },
        { item: 'salt', amount: 'to taste' },
        { item: 'black pepper', amount: 'to taste' },
      ],
      instructions: [
        'Bring a large pot of salted water to boil. Cook pasta according to package directions until al dente. Reserve 1 cup pasta water before draining.',
        'While pasta cooks, melt butter with olive oil in a large pan over medium heat.',
        'Add minced garlic and cook for 1-2 minutes until fragrant but not browned.',
        'Add red pepper flakes if using and stir for 30 seconds.',
        'Add drained pasta to the pan and toss to coat with garlic butter.',
        'Add pasta water a little at a time if needed to create a light sauce.',
        'Remove from heat, add parmesan and parsley, toss well.',
        'Season with salt and pepper, serve immediately with extra parmesan.',
      ],
      tags: ['pasta', 'italian', 'garlic', 'quick', 'vegetarian', 'dinner'],
      mealType: ['Dinner', 'Lunch'],
    },
    {
      id: 'curated-4',
      name: 'Chicken Stir Fry',
      description: 'Quick and healthy chicken stir fry with colorful vegetables in a savory sauce.',
      image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800',
      prepTime: 15,
      cookTime: 15,
      servings: 4,
      difficulty: 'Easy',
      cuisine: 'Chinese',
      category: 'Chicken',
      ingredients: [
        { item: 'chicken breast', amount: '1 lb, sliced thin' },
        { item: 'broccoli florets', amount: '2 cups' },
        { item: 'bell peppers', amount: '2, sliced' },
        { item: 'carrots', amount: '2, sliced thin' },
        { item: 'garlic', amount: '3 cloves, minced' },
        { item: 'ginger', amount: '1 tbsp, minced' },
        { item: 'soy sauce', amount: '3 tbsp' },
        { item: 'sesame oil', amount: '1 tbsp' },
        { item: 'vegetable oil', amount: '2 tbsp' },
        { item: 'cornstarch', amount: '1 tbsp' },
        { item: 'chicken broth', amount: '1/4 cup' },
      ],
      instructions: [
        'Mix soy sauce, sesame oil, cornstarch, and chicken broth in a small bowl. Set aside.',
        'Heat vegetable oil in a wok or large skillet over high heat until smoking.',
        'Add chicken in a single layer, cook 2-3 minutes per side until golden. Remove and set aside.',
        'Add more oil if needed, then add carrots and broccoli. Stir fry for 2 minutes.',
        'Add bell peppers, garlic, and ginger. Stir fry for 1 minute until fragrant.',
        'Return chicken to the wok along with the sauce mixture.',
        'Toss everything together and cook for 2 minutes until sauce thickens.',
        'Serve immediately over steamed rice.',
      ],
      tags: ['chicken', 'stir-fry', 'chinese', 'healthy', 'quick', 'dinner'],
      mealType: ['Dinner', 'Lunch'],
    },
    {
      id: 'curated-5',
      name: 'Classic Grilled Cheese',
      description: 'The ultimate comfort food - crispy buttered bread with melty cheese inside.',
      image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800',
      prepTime: 5,
      cookTime: 10,
      servings: 1,
      difficulty: 'Easy',
      cuisine: 'American',
      category: 'Breakfast',
      ingredients: [
        { item: 'bread slices', amount: '2' },
        { item: 'cheddar cheese', amount: '2-3 slices' },
        { item: 'butter', amount: '2 tbsp, softened' },
      ],
      instructions: [
        'Butter one side of each bread slice generously.',
        'Heat a non-stick pan over medium-low heat.',
        'Place one bread slice butter-side down in the pan.',
        'Layer cheese slices on top of the bread.',
        'Place second bread slice on top, butter-side up.',
        'Cook for 3-4 minutes until bottom is golden brown.',
        'Flip carefully and cook other side for 3-4 minutes.',
        'Remove when both sides are golden and cheese is melted. Let cool 1 minute before cutting.',
      ],
      tags: ['sandwich', 'cheese', 'quick', 'comfort-food', 'vegetarian', 'lunch'],
      mealType: ['Lunch', 'Snack'],
    },
    {
      id: 'curated-6',
      name: 'Avocado Toast',
      description: 'Trendy and nutritious breakfast featuring creamy avocado on crispy toast with various toppings.',
      image: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=800',
      prepTime: 5,
      cookTime: 5,
      servings: 2,
      difficulty: 'Easy',
      cuisine: 'American',
      category: 'Breakfast',
      ingredients: [
        { item: 'bread slices', amount: '2, thick cut' },
        { item: 'ripe avocado', amount: '1 large' },
        { item: 'lemon juice', amount: '1 tsp' },
        { item: 'salt', amount: '1/4 tsp' },
        { item: 'red pepper flakes', amount: 'pinch', optional: true },
        { item: 'everything bagel seasoning', amount: '1 tsp', optional: true },
        { item: 'cherry tomatoes', amount: '4, halved', optional: true },
      ],
      instructions: [
        'Toast bread slices until golden and crispy.',
        'Cut avocado in half, remove pit, and scoop flesh into a bowl.',
        'Add lemon juice and salt, mash with a fork to desired consistency.',
        'Spread avocado mixture generously on each toast.',
        'Top with red pepper flakes, everything bagel seasoning, or cherry tomatoes as desired.',
        'Serve immediately while toast is still warm.',
      ],
      tags: ['breakfast', 'avocado', 'toast', 'healthy', 'vegan', 'quick'],
      mealType: ['Breakfast', 'Snack'],
    },
    {
      id: 'curated-7',
      name: 'Tomato Soup',
      description: 'Creamy homemade tomato soup that pairs perfectly with grilled cheese sandwiches.',
      image: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800',
      prepTime: 10,
      cookTime: 30,
      servings: 4,
      difficulty: 'Easy',
      cuisine: 'American',
      category: 'Soup',
      ingredients: [
        { item: 'canned whole tomatoes', amount: '28 oz can' },
        { item: 'onion', amount: '1 medium, diced' },
        { item: 'garlic', amount: '3 cloves, minced' },
        { item: 'vegetable broth', amount: '2 cups' },
        { item: 'heavy cream', amount: '1/2 cup' },
        { item: 'butter', amount: '2 tbsp' },
        { item: 'sugar', amount: '1 tsp' },
        { item: 'dried basil', amount: '1 tsp' },
        { item: 'salt', amount: 'to taste' },
        { item: 'black pepper', amount: 'to taste' },
      ],
      instructions: [
        'Melt butter in a large pot over medium heat.',
        'Add diced onion and cook for 5 minutes until softened.',
        'Add garlic and cook for 1 minute until fragrant.',
        'Add canned tomatoes (with juice), vegetable broth, sugar, and basil.',
        'Bring to a boil, then reduce heat and simmer for 20 minutes.',
        'Use an immersion blender to puree until smooth (or carefully blend in batches).',
        'Stir in heavy cream and heat through without boiling.',
        'Season with salt and pepper to taste. Serve with crusty bread or grilled cheese.',
      ],
      tags: ['soup', 'tomato', 'comfort-food', 'vegetarian', 'lunch', 'dinner'],
      mealType: ['Lunch', 'Dinner'],
    },
    {
      id: 'curated-8',
      name: 'Banana Pancakes',
      description: 'Fluffy pancakes with mashed banana mixed right into the batter for natural sweetness.',
      image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=800',
      prepTime: 10,
      cookTime: 15,
      servings: 4,
      difficulty: 'Easy',
      cuisine: 'American',
      category: 'Breakfast',
      ingredients: [
        { item: 'all-purpose flour', amount: '1.5 cups' },
        { item: 'ripe bananas', amount: '2, mashed' },
        { item: 'milk', amount: '1 cup' },
        { item: 'egg', amount: '1' },
        { item: 'baking powder', amount: '2 tsp' },
        { item: 'sugar', amount: '2 tbsp' },
        { item: 'vanilla extract', amount: '1 tsp' },
        { item: 'salt', amount: '1/4 tsp' },
        { item: 'butter', amount: 'for cooking' },
      ],
      instructions: [
        'In a large bowl, mix flour, baking powder, sugar, and salt.',
        'In another bowl, mash bananas well, then whisk in milk, egg, and vanilla.',
        'Pour wet ingredients into dry ingredients and stir until just combined (some lumps are okay).',
        'Heat a non-stick pan or griddle over medium heat and add a little butter.',
        'Pour 1/4 cup batter for each pancake.',
        'Cook until bubbles form on surface and edges look set, about 2-3 minutes.',
        'Flip and cook another 1-2 minutes until golden brown.',
        'Serve warm with maple syrup, sliced bananas, or whipped cream.',
      ],
      tags: ['breakfast', 'pancakes', 'banana', 'brunch', 'vegetarian'],
      mealType: ['Breakfast'],
    },
    {
      id: 'curated-9',
      name: 'Caesar Salad',
      description: 'Classic Caesar salad with crisp romaine, homemade dressing, croutons, and parmesan.',
      image: 'https://images.unsplash.com/photo-1550304943-4f24f54ddde9?w=800',
      prepTime: 15,
      cookTime: 10,
      servings: 4,
      difficulty: 'Easy',
      cuisine: 'Italian',
      category: 'Side',
      ingredients: [
        { item: 'romaine lettuce', amount: '2 heads, chopped' },
        { item: 'parmesan cheese', amount: '1/2 cup, shaved' },
        { item: 'croutons', amount: '1 cup' },
        { item: 'mayonnaise', amount: '1/2 cup' },
        { item: 'lemon juice', amount: '2 tbsp' },
        { item: 'garlic', amount: '2 cloves, minced' },
        { item: 'dijon mustard', amount: '1 tsp' },
        { item: 'worcestershire sauce', amount: '1 tsp' },
        { item: 'olive oil', amount: '2 tbsp' },
        { item: 'salt', amount: 'to taste' },
        { item: 'black pepper', amount: 'to taste' },
      ],
      instructions: [
        'For the dressing: whisk together mayonnaise, lemon juice, garlic, mustard, worcestershire, and olive oil.',
        'Season dressing with salt and pepper to taste.',
        'Wash and dry romaine lettuce, then chop into bite-sized pieces.',
        'Place lettuce in a large bowl and drizzle with dressing.',
        'Toss well to coat all leaves.',
        'Add croutons and half the parmesan, toss again.',
        'Serve topped with remaining parmesan and extra croutons.',
      ],
      tags: ['salad', 'caesar', 'italian', 'side', 'lunch', 'healthy'],
      mealType: ['Lunch', 'Side'],
    },
    {
      id: 'curated-10',
      name: 'Beef Tacos',
      description: 'Seasoned ground beef in crispy taco shells with all your favorite toppings.',
      image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=800',
      prepTime: 10,
      cookTime: 15,
      servings: 4,
      difficulty: 'Easy',
      cuisine: 'Mexican',
      category: 'Beef',
      ingredients: [
        { item: 'ground beef', amount: '1 lb' },
        { item: 'taco shells', amount: '8' },
        { item: 'taco seasoning', amount: '1 packet or 2 tbsp' },
        { item: 'water', amount: '1/2 cup' },
        { item: 'shredded lettuce', amount: '2 cups' },
        { item: 'diced tomatoes', amount: '1 cup' },
        { item: 'shredded cheese', amount: '1 cup' },
        { item: 'sour cream', amount: '1/2 cup' },
        { item: 'salsa', amount: '1/2 cup' },
      ],
      instructions: [
        'Brown ground beef in a skillet over medium-high heat, breaking it up as it cooks.',
        'Drain excess fat from the pan.',
        'Add taco seasoning and water to the beef.',
        'Simmer for 5 minutes until sauce thickens.',
        'Warm taco shells according to package directions.',
        'Fill each shell with seasoned beef.',
        'Top with lettuce, tomatoes, cheese, sour cream, and salsa as desired.',
        'Serve immediately with lime wedges on the side.',
      ],
      tags: ['tacos', 'mexican', 'beef', 'dinner', 'quick', 'family-friendly'],
      mealType: ['Dinner', 'Lunch'],
    },
    {
      id: 'curated-11',
      name: 'Vegetable Fried Rice',
      description: 'Quick and flavorful fried rice loaded with vegetables, perfect for using leftover rice.',
      image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800',
      prepTime: 10,
      cookTime: 15,
      servings: 4,
      difficulty: 'Easy',
      cuisine: 'Chinese',
      category: 'Vegetarian',
      ingredients: [
        { item: 'cooked rice', amount: '4 cups, day-old preferred' },
        { item: 'eggs', amount: '2, beaten' },
        { item: 'frozen peas and carrots', amount: '1 cup' },
        { item: 'green onions', amount: '4, chopped' },
        { item: 'garlic', amount: '2 cloves, minced' },
        { item: 'soy sauce', amount: '3 tbsp' },
        { item: 'sesame oil', amount: '1 tbsp' },
        { item: 'vegetable oil', amount: '2 tbsp' },
      ],
      instructions: [
        'Heat 1 tbsp vegetable oil in a wok or large pan over high heat.',
        'Add beaten eggs and scramble quickly. Remove and set aside.',
        'Add remaining oil to the wok.',
        'Add frozen vegetables and stir fry for 2 minutes.',
        'Add garlic and cook for 30 seconds.',
        'Add rice, breaking up any clumps. Stir fry for 3-4 minutes.',
        'Pour soy sauce and sesame oil over rice, toss well.',
        'Add scrambled eggs and green onions, toss to combine.',
        'Serve hot, garnished with extra green onions.',
      ],
      tags: ['rice', 'fried-rice', 'chinese', 'vegetarian', 'quick', 'dinner'],
      mealType: ['Dinner', 'Lunch'],
    },
    {
      id: 'curated-12',
      name: 'Chocolate Chip Cookies',
      description: 'Classic homemade cookies with crispy edges and chewy centers, loaded with chocolate chips.',
      image: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=800',
      prepTime: 15,
      cookTime: 12,
      servings: 24,
      difficulty: 'Easy',
      cuisine: 'American',
      category: 'Dessert',
      ingredients: [
        { item: 'all-purpose flour', amount: '2.25 cups' },
        { item: 'butter', amount: '1 cup, softened' },
        { item: 'brown sugar', amount: '3/4 cup, packed' },
        { item: 'white sugar', amount: '1/4 cup' },
        { item: 'eggs', amount: '2' },
        { item: 'vanilla extract', amount: '1 tsp' },
        { item: 'baking soda', amount: '1 tsp' },
        { item: 'salt', amount: '1/2 tsp' },
        { item: 'chocolate chips', amount: '2 cups' },
      ],
      instructions: [
        'Preheat oven to 375°F (190°C).',
        'Whisk flour, baking soda, and salt in a bowl. Set aside.',
        'Beat softened butter with both sugars until light and fluffy, about 2 minutes.',
        'Beat in eggs one at a time, then add vanilla.',
        'Gradually mix in flour mixture until just combined.',
        'Fold in chocolate chips.',
        'Drop rounded tablespoons of dough onto ungreased baking sheets.',
        'Bake 9-12 minutes until edges are golden but centers look slightly underdone.',
        'Cool on baking sheet for 5 minutes before transferring to wire rack.',
      ],
      tags: ['cookies', 'dessert', 'chocolate', 'baking', 'vegetarian'],
      mealType: ['Dessert', 'Snack'],
    },
    {
      id: 'curated-13',
      name: 'Honey Garlic Salmon',
      description: 'Glazed salmon fillets with a sweet and savory honey garlic sauce, ready in 20 minutes.',
      image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=800',
      prepTime: 5,
      cookTime: 15,
      servings: 4,
      difficulty: 'Easy',
      cuisine: 'American',
      category: 'Seafood',
      ingredients: [
        { item: 'salmon fillets', amount: '4 (6 oz each)' },
        { item: 'honey', amount: '1/4 cup' },
        { item: 'soy sauce', amount: '3 tbsp' },
        { item: 'garlic', amount: '4 cloves, minced' },
        { item: 'lemon juice', amount: '1 tbsp' },
        { item: 'olive oil', amount: '1 tbsp' },
        { item: 'salt', amount: 'to taste' },
        { item: 'black pepper', amount: 'to taste' },
      ],
      instructions: [
        'Mix honey, soy sauce, garlic, and lemon juice in a small bowl.',
        'Season salmon fillets with salt and pepper.',
        'Heat olive oil in a large oven-safe skillet over medium-high heat.',
        'Sear salmon skin-side up for 3 minutes until golden.',
        'Flip salmon and pour honey garlic sauce around the fillets.',
        'Transfer skillet to 400°F oven and bake for 8-10 minutes.',
        'Baste salmon with sauce halfway through cooking.',
        'Serve with sauce spooned over top and steamed vegetables.',
      ],
      tags: ['salmon', 'seafood', 'honey', 'garlic', 'healthy', 'dinner'],
      mealType: ['Dinner'],
    },
    {
      id: 'curated-14',
      name: 'Margherita Pizza',
      description: 'Classic Italian pizza with tomato sauce, fresh mozzarella, and basil on a crispy crust.',
      image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800',
      prepTime: 20,
      cookTime: 15,
      servings: 4,
      difficulty: 'Medium',
      cuisine: 'Italian',
      category: 'Miscellaneous',
      ingredients: [
        { item: 'pizza dough', amount: '1 lb' },
        { item: 'crushed tomatoes', amount: '1/2 cup' },
        { item: 'fresh mozzarella', amount: '8 oz, sliced' },
        { item: 'fresh basil leaves', amount: '1/4 cup' },
        { item: 'olive oil', amount: '2 tbsp' },
        { item: 'garlic', amount: '2 cloves, minced' },
        { item: 'salt', amount: '1/2 tsp' },
        { item: 'dried oregano', amount: '1/2 tsp', optional: true },
      ],
      instructions: [
        'Preheat oven to 475°F (245°C) with a pizza stone or inverted baking sheet inside.',
        'Mix crushed tomatoes with garlic, 1 tbsp olive oil, salt, and oregano for sauce.',
        'Roll or stretch pizza dough to 12-inch circle on floured surface.',
        'Transfer dough to parchment paper for easy sliding onto hot stone.',
        'Spread tomato sauce evenly, leaving 1/2 inch border.',
        'Arrange mozzarella slices over sauce.',
        'Slide pizza onto hot stone and bake 10-12 minutes until crust is golden.',
        'Remove from oven, top with fresh basil and drizzle with remaining olive oil.',
        'Slice and serve immediately.',
      ],
      tags: ['pizza', 'italian', 'vegetarian', 'dinner', 'cheese'],
      mealType: ['Dinner', 'Lunch'],
    },
    {
      id: 'curated-15',
      name: 'Chicken Quesadilla',
      description: 'Crispy tortillas filled with seasoned chicken, melted cheese, and peppers.',
      image: 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?w=800',
      prepTime: 10,
      cookTime: 15,
      servings: 4,
      difficulty: 'Easy',
      cuisine: 'Mexican',
      category: 'Chicken',
      ingredients: [
        { item: 'flour tortillas', amount: '4 large' },
        { item: 'cooked chicken', amount: '2 cups, shredded' },
        { item: 'shredded cheese', amount: '2 cups' },
        { item: 'bell pepper', amount: '1, diced' },
        { item: 'onion', amount: '1/2, diced' },
        { item: 'cumin', amount: '1 tsp' },
        { item: 'chili powder', amount: '1/2 tsp' },
        { item: 'butter', amount: '2 tbsp' },
        { item: 'sour cream', amount: 'for serving' },
        { item: 'salsa', amount: 'for serving' },
      ],
      instructions: [
        'Mix shredded chicken with cumin and chili powder.',
        'Sauté diced peppers and onions until softened, about 3 minutes.',
        'Mix vegetables with seasoned chicken.',
        'Place a tortilla in a dry skillet over medium heat.',
        'Sprinkle half with cheese, then add chicken mixture, then more cheese.',
        'Fold tortilla in half and cook 2-3 minutes per side until golden and cheese melts.',
        'Repeat with remaining tortillas and filling.',
        'Cut into wedges and serve with sour cream and salsa.',
      ],
      tags: ['quesadilla', 'mexican', 'chicken', 'cheese', 'quick', 'dinner'],
      mealType: ['Dinner', 'Lunch'],
    },
  ];
}

// ============ MAIN ============

async function main() {
  console.log('Fetching all recipes from multiple sources...\n');

  // Fetch MealDB by category for more complete coverage
  console.log('--- TheMealDB ---');
  const categories = await fetchAllCategories();
  console.log(`Found ${categories.length} categories`);

  const mealIdsSet = new Set<string>();
  const mealDBRecipes: MealDBMeal[] = [];

  // First, get all meals by letter
  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
  for (const letter of letters) {
    process.stdout.write(`Letter ${letter.toUpperCase()}... `);
    const meals = await fetchMealsByLetter(letter);
    for (const meal of meals) {
      if (!mealIdsSet.has(meal.idMeal)) {
        mealIdsSet.add(meal.idMeal);
        mealDBRecipes.push(meal);
      }
    }
    console.log(`${meals.length} (total: ${mealDBRecipes.length})`);
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Then get any additional meals by category
  for (const category of categories) {
    process.stdout.write(`Category ${category}... `);
    const categoryMeals = await fetchMealsByCategory(category);
    let added = 0;
    for (const { idMeal } of categoryMeals) {
      if (!mealIdsSet.has(idMeal)) {
        const fullMeal = await fetchMealById(idMeal);
        if (fullMeal) {
          mealIdsSet.add(idMeal);
          mealDBRecipes.push(fullMeal);
          added++;
        }
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }
    console.log(`+${added} new`);
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  console.log(`TheMealDB total: ${mealDBRecipes.length}\n`);

  // Fetch DummyJSON
  console.log('--- DummyJSON ---');
  const dummyRecipes = await fetchDummyRecipes();
  console.log(`DummyJSON total: ${dummyRecipes.length}\n`);

  // Fetch AllRecipes.com
  console.log('--- AllRecipes.com ---');
  const allRecipesData = await fetchAllRecipes();
  console.log(`AllRecipes total: ${allRecipesData.length}\n`);

  // Add staple recipes (manually curated, high-quality)
  console.log('--- Staple Recipes ---');
  console.log(`Staple total: ${stapleRecipes.length}\n`);

  // Convert all recipes (filter out null/invalid ones)
  const convertedMealDB = mealDBRecipes
    .map(convertMealDBToRecipe)
    .filter((r): r is FullRecipe => r !== null);

  console.log(`Valid MealDB recipes: ${convertedMealDB.length} (filtered from ${mealDBRecipes.length})`);

  const allRecipes: FullRecipe[] = [
    ...convertedMealDB,
    ...dummyRecipes.map(convertDummyToRecipe),
    ...allRecipesData,
    ...stapleRecipes,
  ];

  console.log(`Combined total: ${allRecipes.length} recipes\n`);

  // Get unique values for filters
  const cuisines = [...new Set(allRecipes.map(r => r.cuisine))].sort();
  const categories_list = [...new Set(allRecipes.map(r => r.category))].sort();

  // Generate TypeScript file
  const output = `// Auto-generated recipe database from TheMealDB + DummyJSON + AllRecipes + Staple
// Generated on ${new Date().toISOString()}
// Total recipes: ${allRecipes.length}
// Sources: TheMealDB (${convertedMealDB.length}), DummyJSON (${dummyRecipes.length}), AllRecipes (${allRecipesData.length}), Staple (${stapleRecipes.length})

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
  rating?: number;
  reviewCount?: number;
  calories?: number;
  mealType?: string[];
}

export const recipeDatabase: FullRecipe[] = ${JSON.stringify(allRecipes, null, 2)};

// Available filter values
export const availableCuisines = ${JSON.stringify(cuisines)};
export const availableCategories = ${JSON.stringify(categories_list)};
export const availableDifficulties = ['Easy', 'Medium', 'Hard'] as const;

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

// Filter recipes
export interface RecipeFilters {
  cuisine?: string;
  category?: string;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  maxCookTime?: number;
  minRating?: number;
  mealType?: string;
  searchQuery?: string;
}

export function filterRecipes(recipes: FullRecipe[], filters: RecipeFilters): FullRecipe[] {
  return recipes.filter(recipe => {
    if (filters.cuisine && recipe.cuisine !== filters.cuisine) return false;
    if (filters.category && recipe.category !== filters.category) return false;
    if (filters.difficulty && recipe.difficulty !== filters.difficulty) return false;
    if (filters.maxCookTime && (recipe.prepTime + recipe.cookTime) > filters.maxCookTime) return false;
    if (filters.minRating && recipe.rating && recipe.rating < filters.minRating) return false;
    if (filters.mealType && recipe.mealType && !recipe.mealType.includes(filters.mealType)) return false;
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const matchesName = recipe.name.toLowerCase().includes(query);
      const matchesTags = recipe.tags.some(t => t.includes(query));
      const matchesIngredients = recipe.ingredients.some(i => i.item.toLowerCase().includes(query));
      if (!matchesName && !matchesTags && !matchesIngredients) return false;
    }
    return true;
  });
}

// Sort recipes
export type SortOption = 'match' | 'rating' | 'time-asc' | 'time-desc' | 'difficulty-asc' | 'difficulty-desc' | 'name';

export function sortRecipes(recipes: FullRecipe[], sortBy: SortOption): FullRecipe[] {
  const sorted = [...recipes];
  const difficultyOrder = { 'Easy': 1, 'Medium': 2, 'Hard': 3 };

  switch (sortBy) {
    case 'rating':
      return sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
    case 'time-asc':
      return sorted.sort((a, b) => (a.prepTime + a.cookTime) - (b.prepTime + b.cookTime));
    case 'time-desc':
      return sorted.sort((a, b) => (b.prepTime + b.cookTime) - (a.prepTime + a.cookTime));
    case 'difficulty-asc':
      return sorted.sort((a, b) => difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty]);
    case 'difficulty-desc':
      return sorted.sort((a, b) => difficultyOrder[b.difficulty] - difficultyOrder[a.difficulty]);
    case 'name':
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    default:
      return sorted;
  }
}
`;

  // Write to file
  const fs = await import('fs');
  fs.writeFileSync('./src/lib/recipeDatabase.ts', output);

  console.log('Recipe database written to src/lib/recipeDatabase.ts');
  console.log(`\nCuisines (${cuisines.length}): ${cuisines.slice(0, 10).join(', ')}...`);
  console.log(`Categories (${categories_list.length}): ${categories_list.join(', ')}`);
}

main().catch(console.error);
