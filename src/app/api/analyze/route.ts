import { NextRequest, NextResponse } from 'next/server';
import { recipeDatabase, findMatchingFullRecipes, getMissingIngredients, FullRecipe } from '@/lib/recipeDatabase';
import { AnalysisResult, FullRecipeResult } from '@/lib/types';

// Gemini API configuration
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent';

// System prompt for Gemini
const GEMINI_SYSTEM_PROMPT = `You are a culinary AI assistant that analyzes food ingredients. When given an image or list of ingredients:

1. Identify all food ingredients visible or mentioned
2. Be specific - identify brands, types, and varieties when visible
3. Include condiments, sauces, and seasonings you can see
4. Include staples like salt, pepper, oil if visible

Return ONLY a valid JSON object with this exact structure (no markdown, no code blocks, just the JSON):
{
  "found_ingredients": ["array", "of", "ingredient", "strings"]
}

Be thorough - list everything edible you can identify.`;

interface GeminiResponse {
  candidates?: Array<{
    content?: {
      parts?: Array<{
        text?: string;
      }>;
    };
  }>;
  error?: {
    message: string;
  };
}

async function analyzeWithGemini(imageBase64: string | null, ingredients: string[] | null): Promise<string[]> {
  if (ingredients && ingredients.length > 0) {
    return ingredients;
  }

  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  if (!imageBase64) {
    throw new Error('No image or ingredients provided');
  }

  const parts: Array<{ text: string } | { inline_data: { mime_type: string; data: string } }> = [
    { text: GEMINI_SYSTEM_PROMPT },
  ];

  const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, '');
  parts.push({
    inline_data: {
      mime_type: 'image/jpeg',
      data: base64Data,
    },
  });
  parts.push({ text: 'Identify all food ingredients visible in this image.' });

  const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      contents: [{ parts }],
      generationConfig: {
        temperature: 0.4,
        maxOutputTokens: 1024,
      },
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Gemini API error: ${response.status} - ${JSON.stringify(errorData)}`);
  }

  const data: GeminiResponse = await response.json();

  if (data.error) {
    throw new Error(`Gemini error: ${data.error.message}`);
  }

  const textResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!textResponse) {
    throw new Error('No response from Gemini');
  }

  try {
    let cleanedResponse = textResponse.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.slice(7);
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.slice(3);
    }
    if (cleanedResponse.endsWith('```')) {
      cleanedResponse = cleanedResponse.slice(0, -3);
    }
    cleanedResponse = cleanedResponse.trim();

    const parsed = JSON.parse(cleanedResponse);
    return parsed.found_ingredients;
  } catch {
    console.error('Failed to parse Gemini response:', textResponse);
    throw new Error('Failed to parse Gemini response as JSON');
  }
}

function isIngredientAvailable(ingredientItem: string, availableIngredients: string[]): boolean {
  const normalized = ingredientItem.toLowerCase();
  return availableIngredients.some(available => {
    const normalizedAvailable = available.toLowerCase();
    return (
      normalizedAvailable.includes(normalized) ||
      normalized.includes(normalizedAvailable) ||
      normalized.split(' ').some(word => normalizedAvailable.includes(word)) ||
      normalizedAvailable.split(' ').some(word => normalized.includes(word))
    );
  });
}

function convertToFullRecipeResult(recipe: FullRecipe, availableIngredients: string[]): FullRecipeResult {
  const normalizedAvailable = availableIngredients.map(i => i.toLowerCase().trim());
  const missingIngredients = getMissingIngredients(recipe, availableIngredients);

  const ingredientsWithAvailability = recipe.ingredients.map(ing => ({
    ...ing,
    available: isIngredientAvailable(ing.item, normalizedAvailable),
  }));

  const requiredIngredients = recipe.ingredients.filter(ing => !ing.optional);
  const availableCount = ingredientsWithAvailability.filter(ing => ing.available && !ing.optional).length;
  const matchPercentage = requiredIngredients.length > 0
    ? Math.round((availableCount / requiredIngredients.length) * 100)
    : 0;

  return {
    id: recipe.id,
    name: recipe.name,
    description: recipe.description,
    image: recipe.image,
    prepTime: recipe.prepTime,
    cookTime: recipe.cookTime,
    servings: recipe.servings,
    difficulty: recipe.difficulty,
    cuisine: recipe.cuisine,
    category: recipe.category || 'Other',
    ingredients: ingredientsWithAvailability,
    instructions: recipe.instructions,
    tips: recipe.tips,
    tags: recipe.tags,
    youtubeUrl: recipe.youtubeUrl,
    rating: recipe.rating,
    reviewCount: recipe.reviewCount,
    calories: recipe.calories,
    mealType: recipe.mealType,
    matchPercentage,
    missingIngredients,
  };
}

function matchIngredientsToRecipes(foundIngredients: string[], maxRecipes: number = 50): AnalysisResult {
  // Find matching recipes
  let matchingRecipes = findMatchingFullRecipes(foundIngredients);

  // If not enough matches, add more recipes
  if (matchingRecipes.length < maxRecipes) {
    const matchedIds = new Set(matchingRecipes.map(r => r.id));
    const additionalRecipes = recipeDatabase.filter(r => !matchedIds.has(r.id));
    matchingRecipes = [...matchingRecipes, ...additionalRecipes].slice(0, maxRecipes);
  } else {
    matchingRecipes = matchingRecipes.slice(0, maxRecipes);
  }

  // Convert to FullRecipeResult format
  const recipeResults = matchingRecipes.map(recipe =>
    convertToFullRecipeResult(recipe, foundIngredients)
  );

  // Sort by match percentage (best matches first)
  recipeResults.sort((a, b) => b.matchPercentage - a.matchPercentage);

  return {
    found_ingredients: foundIngredients,
    recipes: recipeResults,
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { image, ingredients, useMock = false, maxRecipes = 50 } = body as {
      image?: string;
      ingredients?: string[];
      useMock?: boolean;
      maxRecipes?: number;
    };

    let foundIngredients: string[];

    if (useMock || (!GEMINI_API_KEY && !ingredients)) {
      foundIngredients = ['chicken', 'pasta', 'tomatoes', 'garlic', 'olive oil', 'onion', 'eggs', 'cheese', 'butter', 'milk'];
    } else {
      foundIngredients = await analyzeWithGemini(image ?? null, ingredients ?? null);
    }

    const result = matchIngredientsToRecipes(foundIngredients, maxRecipes);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Analysis error:', error);

    const fallbackIngredients = ['chicken', 'rice', 'vegetables', 'garlic', 'onion', 'soy sauce'];
    const result = matchIngredientsToRecipes(fallbackIngredients);

    return NextResponse.json({
      ...result,
      _fallback: true,
      _error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Gap Chef Analysis API',
    hasGeminiKey: !!GEMINI_API_KEY,
    recipeCount: recipeDatabase.length,
  });
}
