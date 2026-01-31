import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

interface RecipeContext {
  name: string;
  description: string;
  ingredients: { item: string; amount: string; optional?: boolean }[];
  instructions: string[];
  tips?: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  difficulty: string;
  cuisine: string;
}

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatRequest {
  question: string;
  recipe: RecipeContext;
  chatHistory: ChatMessage[];
}

// Fallback responses for when AI is unavailable
const fallbackResponses: Record<string, string> = {
  substitute: "Common substitutions include: butter → coconut oil, milk → oat milk, eggs → flax eggs, flour → almond flour. For specific ingredients, the general rule is to match texture and flavor profile.",
  done: "Look for visual cues like golden brown color, internal temperature (165°F for chicken, 145°F for pork/fish), and texture changes. When in doubt, use a meat thermometer!",
  ahead: "Most dishes can be prepped 1-2 days ahead. Store components separately, and add fresh elements just before serving. Soups and stews often taste better the next day!",
  serve: "Consider complementary flavors and textures. A rich main pairs well with a light salad, while simple proteins shine with flavorful sides.",
  default: "I'd be happy to help with your cooking questions! Try asking about ingredient substitutions, cooking techniques, timing, or what to serve alongside.",
};

function getFallbackResponse(question: string): string {
  const q = question.toLowerCase();
  if (q.includes('substitut') || q.includes('replace') || q.includes('instead')) {
    return fallbackResponses.substitute;
  }
  if (q.includes('done') || q.includes('ready') || q.includes('cooked')) {
    return fallbackResponses.done;
  }
  if (q.includes('ahead') || q.includes('advance') || q.includes('prep')) {
    return fallbackResponses.ahead;
  }
  if (q.includes('serve') || q.includes('side') || q.includes('pair')) {
    return fallbackResponses.serve;
  }
  return fallbackResponses.default;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequest = await request.json();
    const { question, recipe, chatHistory } = body;

    if (!question || !recipe) {
      return NextResponse.json(
        { error: 'Missing question or recipe' },
        { status: 400 }
      );
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.log('No GEMINI_API_KEY found in environment');
      // Return fallback response if no API key
      return NextResponse.json({
        answer: getFallbackResponse(question),
        fallback: true
      });
    }

    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

      // Build the conversation context
      const ingredientsList = recipe.ingredients
        .map(ing => `${ing.amount} ${ing.item}${ing.optional ? ' (optional)' : ''}`)
        .join('\n');

      const instructionsList = recipe.instructions
        .map((step, i) => `${i + 1}. ${step}`)
        .join('\n');

      const systemPrompt = `You are a helpful, friendly AI cooking assistant. You're helping someone cook "${recipe.name}" - a ${recipe.difficulty.toLowerCase()} ${recipe.cuisine} recipe.

Recipe Details:
- Name: ${recipe.name}
- Description: ${recipe.description}
- Prep Time: ${recipe.prepTime} minutes
- Cook Time: ${recipe.cookTime} minutes
- Servings: ${recipe.servings}
- Difficulty: ${recipe.difficulty}
- Cuisine: ${recipe.cuisine}

Ingredients:
${ingredientsList}

Instructions:
${instructionsList}

Guidelines for your responses:
- Be concise but helpful (2-4 sentences typically)
- Give practical, actionable advice
- If suggesting substitutions, explain why they work
- For doneness questions, give specific visual/temperature cues
- Be encouraging and supportive
- If you don't know something specific, be honest about it`;

      // Build chat history for context
      const historyContext = chatHistory.length > 0
        ? '\n\nPrevious conversation:\n' + chatHistory
            .slice(-6) // Keep last 6 messages for context
            .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
            .join('\n')
        : '';

      const fullPrompt = `${systemPrompt}${historyContext}

User's question: ${question}

Please provide a helpful, concise response:`;

      const result = await model.generateContent(fullPrompt);
      const response = result.response;
      const text = response.text();

      if (!text) {
        throw new Error('Empty response from AI');
      }

      return NextResponse.json({ answer: text });
    } catch (aiError: unknown) {
      const errorMessage = aiError instanceof Error ? aiError.message : String(aiError);
      console.error('AI generation error:', errorMessage);
      // Return fallback response on AI error
      return NextResponse.json({
        answer: getFallbackResponse(question) + '\n\n(AI temporarily unavailable)',
        fallback: true,
        error: errorMessage
      });
    }
  } catch (error) {
    console.error('Recipe chat error:', error);
    return NextResponse.json(
      { error: 'Failed to process question' },
      { status: 500 }
    );
  }
}
