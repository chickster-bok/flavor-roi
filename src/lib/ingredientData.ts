// Ingredient prices (average USD per unit) and nutrition data
// Prices are estimates based on typical grocery store prices

export interface IngredientInfo {
  price: number; // USD per standard unit
  unit: string;
  calories: number; // per standard unit
  protein: number; // grams
  carbs: number; // grams
  fat: number; // grams
  substitutes?: string[];
}

// Price and nutrition database for common ingredients
export const ingredientDatabase: Record<string, IngredientInfo> = {
  // Proteins
  'chicken breast': { price: 3.50, unit: 'lb', calories: 165, protein: 31, carbs: 0, fat: 3.6, substitutes: ['turkey breast', 'tofu', 'tempeh'] },
  'chicken thighs': { price: 2.50, unit: 'lb', calories: 209, protein: 26, carbs: 0, fat: 10.9, substitutes: ['chicken breast', 'turkey thighs'] },
  'chicken': { price: 3.00, unit: 'lb', calories: 187, protein: 28, carbs: 0, fat: 7, substitutes: ['turkey', 'tofu'] },
  'ground beef': { price: 5.00, unit: 'lb', calories: 250, protein: 26, carbs: 0, fat: 15, substitutes: ['ground turkey', 'ground chicken', 'plant-based ground'] },
  'beef': { price: 6.00, unit: 'lb', calories: 250, protein: 26, carbs: 0, fat: 15, substitutes: ['pork', 'lamb', 'mushrooms'] },
  'steak': { price: 10.00, unit: 'lb', calories: 271, protein: 26, carbs: 0, fat: 18, substitutes: ['portobello mushroom', 'cauliflower steak'] },
  'pork': { price: 4.00, unit: 'lb', calories: 242, protein: 27, carbs: 0, fat: 14, substitutes: ['chicken', 'turkey'] },
  'bacon': { price: 6.00, unit: 'lb', calories: 541, protein: 37, carbs: 1, fat: 42, substitutes: ['turkey bacon', 'tempeh bacon', 'coconut bacon'] },
  'salmon': { price: 10.00, unit: 'lb', calories: 208, protein: 20, carbs: 0, fat: 13, substitutes: ['trout', 'arctic char', 'tofu'] },
  'shrimp': { price: 9.00, unit: 'lb', calories: 99, protein: 24, carbs: 0, fat: 0.3, substitutes: ['scallops', 'tofu', 'hearts of palm'] },
  'fish': { price: 8.00, unit: 'lb', calories: 136, protein: 24, carbs: 0, fat: 4, substitutes: ['tofu', 'tempeh'] },
  'tofu': { price: 2.50, unit: 'lb', calories: 76, protein: 8, carbs: 2, fat: 4.5, substitutes: ['tempeh', 'seitan', 'paneer'] },
  'eggs': { price: 0.25, unit: 'each', calories: 72, protein: 6, carbs: 0.4, fat: 5, substitutes: ['flax egg', 'chia egg', 'applesauce', 'mashed banana'] },
  'egg': { price: 0.25, unit: 'each', calories: 72, protein: 6, carbs: 0.4, fat: 5, substitutes: ['flax egg', 'chia egg', 'applesauce'] },

  // Dairy
  'milk': { price: 0.50, unit: 'cup', calories: 149, protein: 8, carbs: 12, fat: 8, substitutes: ['oat milk', 'almond milk', 'soy milk', 'coconut milk'] },
  'butter': { price: 0.50, unit: 'tbsp', calories: 102, protein: 0, carbs: 0, fat: 12, substitutes: ['olive oil', 'coconut oil', 'margarine', 'applesauce'] },
  'cream': { price: 0.40, unit: 'tbsp', calories: 52, protein: 0.4, carbs: 0.4, fat: 5.5, substitutes: ['coconut cream', 'cashew cream'] },
  'heavy cream': { price: 0.40, unit: 'tbsp', calories: 52, protein: 0.4, carbs: 0.4, fat: 5.5, substitutes: ['coconut cream', 'cashew cream'] },
  'cheese': { price: 0.50, unit: 'oz', calories: 113, protein: 7, carbs: 0.4, fat: 9, substitutes: ['nutritional yeast', 'vegan cheese', 'cashew cheese'] },
  'cheddar cheese': { price: 0.50, unit: 'oz', calories: 113, protein: 7, carbs: 0.4, fat: 9, substitutes: ['gouda', 'colby', 'vegan cheddar'] },
  'parmesan': { price: 0.75, unit: 'oz', calories: 111, protein: 10, carbs: 1, fat: 7, substitutes: ['nutritional yeast', 'pecorino', 'vegan parmesan'] },
  'parmesan cheese': { price: 0.75, unit: 'oz', calories: 111, protein: 10, carbs: 1, fat: 7, substitutes: ['nutritional yeast', 'pecorino'] },
  'mozzarella': { price: 0.40, unit: 'oz', calories: 85, protein: 6, carbs: 1, fat: 6, substitutes: ['provolone', 'vegan mozzarella'] },
  'cream cheese': { price: 0.30, unit: 'oz', calories: 99, protein: 2, carbs: 1, fat: 10, substitutes: ['cashew cream cheese', 'vegan cream cheese'] },
  'sour cream': { price: 0.20, unit: 'tbsp', calories: 23, protein: 0.3, carbs: 0.5, fat: 2.3, substitutes: ['greek yogurt', 'cashew cream', 'coconut cream'] },
  'yogurt': { price: 0.30, unit: 'oz', calories: 18, protein: 1, carbs: 1.5, fat: 1, substitutes: ['coconut yogurt', 'soy yogurt'] },
  'greek yogurt': { price: 0.35, unit: 'oz', calories: 17, protein: 3, carbs: 1, fat: 0.2, substitutes: ['regular yogurt', 'coconut yogurt'] },

  // Grains & Pasta
  'rice': { price: 0.15, unit: 'cup', calories: 206, protein: 4, carbs: 45, fat: 0.4, substitutes: ['quinoa', 'cauliflower rice', 'couscous'] },
  'pasta': { price: 0.25, unit: 'oz', calories: 75, protein: 3, carbs: 15, fat: 0.4, substitutes: ['zucchini noodles', 'rice noodles', 'gluten-free pasta'] },
  'spaghetti': { price: 0.25, unit: 'oz', calories: 75, protein: 3, carbs: 15, fat: 0.4, substitutes: ['linguine', 'zucchini noodles', 'rice noodles'] },
  'bread': { price: 0.20, unit: 'slice', calories: 79, protein: 3, carbs: 15, fat: 1, substitutes: ['lettuce wrap', 'gluten-free bread', 'tortilla'] },
  'flour': { price: 0.05, unit: 'tbsp', calories: 28, protein: 1, carbs: 6, fat: 0, substitutes: ['almond flour', 'coconut flour', 'oat flour'] },
  'all-purpose flour': { price: 0.05, unit: 'tbsp', calories: 28, protein: 1, carbs: 6, fat: 0, substitutes: ['whole wheat flour', 'almond flour'] },
  'breadcrumbs': { price: 0.10, unit: 'tbsp', calories: 30, protein: 1, carbs: 5, fat: 0.5, substitutes: ['crushed crackers', 'panko', 'almond flour'] },
  'tortilla': { price: 0.25, unit: 'each', calories: 90, protein: 2, carbs: 15, fat: 2.5, substitutes: ['lettuce wrap', 'corn tortilla'] },
  'noodles': { price: 0.30, unit: 'oz', calories: 70, protein: 2, carbs: 14, fat: 0.3, substitutes: ['rice noodles', 'zucchini noodles'] },

  // Vegetables
  'onion': { price: 0.50, unit: 'each', calories: 44, protein: 1, carbs: 10, fat: 0, substitutes: ['shallot', 'leek', 'scallions'] },
  'garlic': { price: 0.10, unit: 'clove', calories: 4, protein: 0.2, carbs: 1, fat: 0, substitutes: ['garlic powder', 'shallot'] },
  'tomato': { price: 0.50, unit: 'each', calories: 22, protein: 1, carbs: 5, fat: 0.2, substitutes: ['canned tomatoes', 'sun-dried tomatoes'] },
  'tomatoes': { price: 0.50, unit: 'each', calories: 22, protein: 1, carbs: 5, fat: 0.2, substitutes: ['canned tomatoes', 'red bell pepper'] },
  'potato': { price: 0.30, unit: 'each', calories: 161, protein: 4, carbs: 37, fat: 0.2, substitutes: ['sweet potato', 'cauliflower'] },
  'potatoes': { price: 0.30, unit: 'each', calories: 161, protein: 4, carbs: 37, fat: 0.2, substitutes: ['sweet potato', 'turnip'] },
  'carrot': { price: 0.15, unit: 'each', calories: 25, protein: 0.6, carbs: 6, fat: 0.1, substitutes: ['parsnip', 'sweet potato'] },
  'carrots': { price: 0.15, unit: 'each', calories: 25, protein: 0.6, carbs: 6, fat: 0.1, substitutes: ['parsnip', 'butternut squash'] },
  'celery': { price: 0.10, unit: 'stalk', calories: 6, protein: 0.3, carbs: 1, fat: 0.1, substitutes: ['fennel', 'bok choy'] },
  'bell pepper': { price: 0.75, unit: 'each', calories: 31, protein: 1, carbs: 6, fat: 0.3, substitutes: ['poblano', 'anaheim pepper'] },
  'broccoli': { price: 0.50, unit: 'cup', calories: 31, protein: 2.5, carbs: 6, fat: 0.3, substitutes: ['cauliflower', 'broccolini'] },
  'spinach': { price: 0.30, unit: 'cup', calories: 7, protein: 1, carbs: 1, fat: 0.1, substitutes: ['kale', 'swiss chard', 'arugula'] },
  'lettuce': { price: 0.20, unit: 'cup', calories: 5, protein: 0.5, carbs: 1, fat: 0.1, substitutes: ['spinach', 'arugula', 'cabbage'] },
  'mushrooms': { price: 0.40, unit: 'cup', calories: 15, protein: 2, carbs: 2, fat: 0.2, substitutes: ['zucchini', 'eggplant'] },
  'zucchini': { price: 0.40, unit: 'each', calories: 33, protein: 2, carbs: 6, fat: 0.6, substitutes: ['yellow squash', 'cucumber'] },
  'cucumber': { price: 0.50, unit: 'each', calories: 16, protein: 0.7, carbs: 4, fat: 0.1, substitutes: ['zucchini', 'celery'] },
  'avocado': { price: 1.50, unit: 'each', calories: 234, protein: 3, carbs: 12, fat: 21, substitutes: ['hummus', 'mashed banana'] },
  'corn': { price: 0.30, unit: 'ear', calories: 77, protein: 3, carbs: 17, fat: 1, substitutes: ['peas', 'edamame'] },
  'peas': { price: 0.25, unit: 'cup', calories: 62, protein: 4, carbs: 11, fat: 0.3, substitutes: ['edamame', 'green beans'] },
  'green beans': { price: 0.30, unit: 'cup', calories: 31, protein: 2, carbs: 7, fat: 0.1, substitutes: ['asparagus', 'snap peas'] },
  'cabbage': { price: 0.20, unit: 'cup', calories: 17, protein: 1, carbs: 4, fat: 0.1, substitutes: ['lettuce', 'brussels sprouts'] },
  'cauliflower': { price: 0.40, unit: 'cup', calories: 25, protein: 2, carbs: 5, fat: 0.1, substitutes: ['broccoli', 'rice'] },

  // Fruits
  'lemon': { price: 0.35, unit: 'each', calories: 17, protein: 0.6, carbs: 5, fat: 0.2, substitutes: ['lime', 'vinegar'] },
  'lime': { price: 0.30, unit: 'each', calories: 11, protein: 0.2, carbs: 4, fat: 0.1, substitutes: ['lemon', 'orange'] },
  'apple': { price: 0.50, unit: 'each', calories: 95, protein: 0.5, carbs: 25, fat: 0.3, substitutes: ['pear', 'peach'] },
  'banana': { price: 0.25, unit: 'each', calories: 105, protein: 1, carbs: 27, fat: 0.4, substitutes: ['plantain', 'mango'] },
  'orange': { price: 0.50, unit: 'each', calories: 62, protein: 1, carbs: 15, fat: 0.2, substitutes: ['tangerine', 'grapefruit'] },
  'berries': { price: 1.00, unit: 'cup', calories: 84, protein: 1, carbs: 21, fat: 0.5, substitutes: ['frozen berries', 'grapes'] },

  // Oils & Fats
  'olive oil': { price: 0.15, unit: 'tbsp', calories: 119, protein: 0, carbs: 0, fat: 14, substitutes: ['avocado oil', 'vegetable oil', 'coconut oil'] },
  'vegetable oil': { price: 0.08, unit: 'tbsp', calories: 120, protein: 0, carbs: 0, fat: 14, substitutes: ['canola oil', 'olive oil'] },
  'coconut oil': { price: 0.20, unit: 'tbsp', calories: 121, protein: 0, carbs: 0, fat: 13, substitutes: ['butter', 'vegetable oil'] },
  'sesame oil': { price: 0.25, unit: 'tbsp', calories: 120, protein: 0, carbs: 0, fat: 14, substitutes: ['peanut oil', 'vegetable oil'] },

  // Seasonings & Spices
  'salt': { price: 0.01, unit: 'tsp', calories: 0, protein: 0, carbs: 0, fat: 0, substitutes: ['sea salt', 'kosher salt', 'soy sauce'] },
  'pepper': { price: 0.02, unit: 'tsp', calories: 2, protein: 0.1, carbs: 0.5, fat: 0, substitutes: ['white pepper', 'cayenne'] },
  'black pepper': { price: 0.02, unit: 'tsp', calories: 2, protein: 0.1, carbs: 0.5, fat: 0, substitutes: ['white pepper'] },
  'paprika': { price: 0.05, unit: 'tsp', calories: 6, protein: 0.3, carbs: 1, fat: 0.3, substitutes: ['cayenne', 'chili powder'] },
  'cumin': { price: 0.05, unit: 'tsp', calories: 8, protein: 0.4, carbs: 1, fat: 0.5, substitutes: ['coriander', 'caraway'] },
  'oregano': { price: 0.05, unit: 'tsp', calories: 3, protein: 0.1, carbs: 0.7, fat: 0.1, substitutes: ['basil', 'thyme', 'marjoram'] },
  'basil': { price: 0.10, unit: 'tbsp', calories: 1, protein: 0.1, carbs: 0.1, fat: 0, substitutes: ['oregano', 'parsley'] },
  'thyme': { price: 0.05, unit: 'tsp', calories: 1, protein: 0, carbs: 0.2, fat: 0, substitutes: ['oregano', 'rosemary'] },
  'rosemary': { price: 0.05, unit: 'tsp', calories: 1, protein: 0, carbs: 0.2, fat: 0, substitutes: ['thyme', 'sage'] },
  'cinnamon': { price: 0.05, unit: 'tsp', calories: 6, protein: 0.1, carbs: 2, fat: 0, substitutes: ['nutmeg', 'allspice'] },
  'ginger': { price: 0.15, unit: 'tbsp', calories: 5, protein: 0.1, carbs: 1, fat: 0, substitutes: ['ground ginger', 'galangal'] },
  'chili powder': { price: 0.05, unit: 'tsp', calories: 8, protein: 0.3, carbs: 1.4, fat: 0.4, substitutes: ['cayenne + cumin', 'paprika'] },
  'curry powder': { price: 0.10, unit: 'tsp', calories: 7, protein: 0.3, carbs: 1.2, fat: 0.3, substitutes: ['garam masala', 'individual spices'] },

  // Sauces & Condiments
  'soy sauce': { price: 0.10, unit: 'tbsp', calories: 9, protein: 1, carbs: 1, fat: 0, substitutes: ['tamari', 'coconut aminos', 'worcestershire'] },
  'tomato sauce': { price: 0.15, unit: 'oz', calories: 8, protein: 0.3, carbs: 2, fat: 0, substitutes: ['crushed tomatoes', 'tomato paste + water'] },
  'ketchup': { price: 0.05, unit: 'tbsp', calories: 19, protein: 0.2, carbs: 5, fat: 0, substitutes: ['tomato paste + vinegar + sugar'] },
  'mustard': { price: 0.05, unit: 'tsp', calories: 3, protein: 0.2, carbs: 0.3, fat: 0.2, substitutes: ['horseradish', 'wasabi'] },
  'mayonnaise': { price: 0.10, unit: 'tbsp', calories: 94, protein: 0.1, carbs: 0, fat: 10, substitutes: ['greek yogurt', 'avocado', 'hummus'] },
  'honey': { price: 0.15, unit: 'tbsp', calories: 64, protein: 0, carbs: 17, fat: 0, substitutes: ['maple syrup', 'agave', 'brown sugar'] },
  'maple syrup': { price: 0.25, unit: 'tbsp', calories: 52, protein: 0, carbs: 13, fat: 0, substitutes: ['honey', 'agave', 'brown sugar syrup'] },
  'vinegar': { price: 0.05, unit: 'tbsp', calories: 3, protein: 0, carbs: 0, fat: 0, substitutes: ['lemon juice', 'lime juice'] },
  'worcestershire': { price: 0.10, unit: 'tsp', calories: 4, protein: 0, carbs: 1, fat: 0, substitutes: ['soy sauce + vinegar', 'fish sauce'] },

  // Canned & Pantry
  'canned tomatoes': { price: 0.15, unit: 'oz', calories: 5, protein: 0.2, carbs: 1, fat: 0, substitutes: ['fresh tomatoes', 'tomato sauce'] },
  'tomato paste': { price: 0.20, unit: 'tbsp', calories: 13, protein: 0.7, carbs: 3, fat: 0.1, substitutes: ['tomato sauce (reduced)', 'ketchup'] },
  'chicken broth': { price: 0.10, unit: 'oz', calories: 1, protein: 0.2, carbs: 0, fat: 0, substitutes: ['vegetable broth', 'water + bouillon'] },
  'vegetable broth': { price: 0.10, unit: 'oz', calories: 2, protein: 0.1, carbs: 0.5, fat: 0, substitutes: ['chicken broth', 'water + miso'] },
  'coconut milk': { price: 0.20, unit: 'oz', calories: 30, protein: 0.3, carbs: 0.5, fat: 3, substitutes: ['heavy cream', 'cashew cream'] },
  'beans': { price: 0.10, unit: 'oz', calories: 21, protein: 1.4, carbs: 4, fat: 0.1, substitutes: ['lentils', 'chickpeas'] },
  'chickpeas': { price: 0.10, unit: 'oz', calories: 23, protein: 1.5, carbs: 4, fat: 0.4, substitutes: ['white beans', 'lentils'] },
  'lentils': { price: 0.08, unit: 'oz', calories: 20, protein: 1.6, carbs: 3.5, fat: 0.1, substitutes: ['beans', 'split peas'] },

  // Baking
  'sugar': { price: 0.02, unit: 'tbsp', calories: 48, protein: 0, carbs: 12, fat: 0, substitutes: ['honey', 'maple syrup', 'stevia'] },
  'brown sugar': { price: 0.03, unit: 'tbsp', calories: 52, protein: 0, carbs: 13, fat: 0, substitutes: ['white sugar + molasses', 'coconut sugar'] },
  'baking powder': { price: 0.02, unit: 'tsp', calories: 2, protein: 0, carbs: 1, fat: 0, substitutes: ['baking soda + cream of tartar'] },
  'baking soda': { price: 0.01, unit: 'tsp', calories: 0, protein: 0, carbs: 0, fat: 0, substitutes: ['baking powder (3x amount)'] },
  'vanilla': { price: 0.30, unit: 'tsp', calories: 12, protein: 0, carbs: 0.5, fat: 0, substitutes: ['vanilla bean', 'almond extract'] },
  'vanilla extract': { price: 0.30, unit: 'tsp', calories: 12, protein: 0, carbs: 0.5, fat: 0, substitutes: ['vanilla bean paste', 'maple syrup'] },
  'chocolate chips': { price: 0.20, unit: 'oz', calories: 70, protein: 0.8, carbs: 9, fat: 4, substitutes: ['chopped chocolate bar', 'carob chips'] },
  'cocoa powder': { price: 0.15, unit: 'tbsp', calories: 12, protein: 1, carbs: 3, fat: 0.7, substitutes: ['carob powder', 'chocolate'] },

  // Nuts & Seeds
  'almonds': { price: 0.50, unit: 'oz', calories: 164, protein: 6, carbs: 6, fat: 14, substitutes: ['cashews', 'sunflower seeds'] },
  'walnuts': { price: 0.60, unit: 'oz', calories: 185, protein: 4, carbs: 4, fat: 18, substitutes: ['pecans', 'almonds'] },
  'peanuts': { price: 0.30, unit: 'oz', calories: 161, protein: 7, carbs: 5, fat: 14, substitutes: ['sunflower seeds', 'soy nuts'] },
  'peanut butter': { price: 0.15, unit: 'tbsp', calories: 94, protein: 4, carbs: 3, fat: 8, substitutes: ['almond butter', 'sunflower seed butter', 'tahini'] },
  'sesame seeds': { price: 0.10, unit: 'tbsp', calories: 52, protein: 2, carbs: 2, fat: 4.5, substitutes: ['hemp seeds', 'poppy seeds'] },
};

// Parse amount string to get quantity and unit
export function parseAmount(amountStr: string): { quantity: number; unit: string } {
  const fractionMap: Record<string, number> = {
    '¼': 0.25, '½': 0.5, '¾': 0.75, '⅓': 0.33, '⅔': 0.67, '⅛': 0.125,
    '1/4': 0.25, '1/2': 0.5, '3/4': 0.75, '1/3': 0.33, '2/3': 0.67, '1/8': 0.125,
  };

  let amount = amountStr.toLowerCase().trim();
  let quantity = 0;

  // Replace fractions
  for (const [frac, val] of Object.entries(fractionMap)) {
    if (amount.includes(frac)) {
      // Check if there's a whole number before the fraction
      const match = amount.match(/(\d+)\s*[½¼¾⅓⅔⅛]/);
      if (match) {
        quantity = parseInt(match[1]) + val;
      } else {
        quantity = val;
      }
      amount = amount.replace(frac, '').trim();
    }
  }

  // Extract number if not already parsed
  if (quantity === 0) {
    const numMatch = amount.match(/^([\d.]+)/);
    if (numMatch) {
      quantity = parseFloat(numMatch[1]);
    } else {
      quantity = 1; // Default to 1 if no number found
    }
  }

  // Extract unit
  const unitPatterns = ['cups?', 'tbsps?', 'tablespoons?', 'tsps?', 'teaspoons?', 'oz', 'ounces?', 'lbs?', 'pounds?', 'cloves?', 'slices?', 'pieces?', 'cans?', 'each', 'large', 'medium', 'small'];
  let unit = '';
  for (const pattern of unitPatterns) {
    const regex = new RegExp(`\\b(${pattern})\\b`, 'i');
    const match = amount.match(regex);
    if (match) {
      unit = match[1].toLowerCase();
      break;
    }
  }

  // Normalize units
  if (unit.startsWith('tbsp') || unit.startsWith('tablespoon')) unit = 'tbsp';
  if (unit.startsWith('tsp') || unit.startsWith('teaspoon')) unit = 'tsp';
  if (unit.startsWith('cup')) unit = 'cup';
  if (unit.startsWith('oz') || unit.startsWith('ounce')) unit = 'oz';
  if (unit.startsWith('lb') || unit.startsWith('pound')) unit = 'lb';
  if (unit.startsWith('clove')) unit = 'clove';

  return { quantity, unit: unit || 'each' };
}

// Find ingredient in database (fuzzy match)
export function findIngredient(name: string): IngredientInfo | null {
  const normalizedName = name.toLowerCase().trim();

  // Exact match
  if (ingredientDatabase[normalizedName]) {
    return ingredientDatabase[normalizedName];
  }

  // Partial match
  for (const [key, value] of Object.entries(ingredientDatabase)) {
    if (normalizedName.includes(key) || key.includes(normalizedName)) {
      return value;
    }
  }

  // Word match
  const words = normalizedName.split(' ');
  for (const word of words) {
    if (word.length > 3 && ingredientDatabase[word]) {
      return ingredientDatabase[word];
    }
  }

  return null;
}

// Calculate recipe cost and nutrition
export interface RecipeNutrition {
  totalCost: number;
  costPerServing: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  isUnderFiveDollars: boolean;
}

export function calculateRecipeInfo(
  ingredients: { item: string; amount: string; optional?: boolean }[],
  servings: number
): RecipeNutrition {
  let totalCost = 0;
  let totalCalories = 0;
  let totalProtein = 0;
  let totalCarbs = 0;
  let totalFat = 0;

  for (const ing of ingredients) {
    if (ing.optional) continue; // Skip optional ingredients for cost/nutrition

    const info = findIngredient(ing.item);
    if (!info) continue;

    const parsed = parseAmount(ing.amount);

    // Estimate quantity multiplier based on units
    let multiplier = parsed.quantity;

    // Convert units if needed (rough estimates)
    if (parsed.unit === 'cup' && info.unit === 'oz') multiplier *= 8;
    if (parsed.unit === 'tbsp' && info.unit === 'cup') multiplier /= 16;
    if (parsed.unit === 'tsp' && info.unit === 'tbsp') multiplier /= 3;
    if (parsed.unit === 'lb' && info.unit === 'oz') multiplier *= 16;

    totalCost += info.price * multiplier;
    totalCalories += info.calories * multiplier;
    totalProtein += info.protein * multiplier;
    totalCarbs += info.carbs * multiplier;
    totalFat += info.fat * multiplier;
  }

  return {
    totalCost: Math.round(totalCost * 100) / 100,
    costPerServing: Math.round((totalCost / servings) * 100) / 100,
    calories: Math.round(totalCalories / servings),
    protein: Math.round(totalProtein / servings),
    carbs: Math.round(totalCarbs / servings),
    fat: Math.round(totalFat / servings),
    isUnderFiveDollars: totalCost <= 5,
  };
}

// Get substitutes for an ingredient
export function getSubstitutes(ingredientName: string): string[] {
  const info = findIngredient(ingredientName);
  return info?.substitutes || [];
}

// Scale ingredient amount
export function scaleAmount(amount: string, originalServings: number, newServings: number): string {
  const parsed = parseAmount(amount);
  const scale = newServings / originalServings;
  const newQuantity = parsed.quantity * scale;

  // Format the quantity nicely
  let formattedQty: string;
  if (newQuantity === Math.floor(newQuantity)) {
    formattedQty = String(Math.floor(newQuantity));
  } else if (Math.abs(newQuantity - 0.25) < 0.01) {
    formattedQty = '¼';
  } else if (Math.abs(newQuantity - 0.5) < 0.01) {
    formattedQty = '½';
  } else if (Math.abs(newQuantity - 0.75) < 0.01) {
    formattedQty = '¾';
  } else if (Math.abs(newQuantity - 0.33) < 0.05) {
    formattedQty = '⅓';
  } else if (Math.abs(newQuantity - 0.67) < 0.05) {
    formattedQty = '⅔';
  } else {
    formattedQty = newQuantity.toFixed(1).replace('.0', '');
  }

  // Reconstruct amount string
  const unit = parsed.unit !== 'each' ? ` ${parsed.unit}` : '';
  return `${formattedQty}${unit}`;
}
