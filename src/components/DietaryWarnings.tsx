'use client';

import { useProfile } from '@/contexts/ProfileContext';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Leaf, Check } from 'lucide-react';

interface DietaryWarningsProps {
  ingredients: { item: string; amount: string; optional?: boolean }[];
  tags?: string[];
  compact?: boolean;
}

// Mapping of allergens to ingredient keywords
const ALLERGEN_KEYWORDS: Record<string, string[]> = {
  'Peanuts': ['peanut', 'peanuts', 'peanut butter', 'groundnut'],
  'Tree Nuts': ['almond', 'almonds', 'walnut', 'walnuts', 'cashew', 'cashews', 'pecan', 'pecans', 'pistachio', 'hazelnut', 'macadamia', 'pine nut', 'brazil nut'],
  'Milk': ['milk', 'cream', 'butter', 'cheese', 'yogurt', 'whey', 'casein', 'ghee', 'half-and-half', 'sour cream', 'cream cheese', 'cottage cheese', 'ricotta', 'mozzarella', 'parmesan', 'cheddar', 'feta'],
  'Eggs': ['egg', 'eggs', 'mayonnaise', 'mayo', 'meringue', 'custard'],
  'Wheat': ['flour', 'bread', 'pasta', 'noodle', 'wheat', 'cracker', 'breadcrumb', 'tortilla', 'bun', 'roll', 'croissant', 'pita', 'couscous', 'bulgur', 'seitan'],
  'Soy': ['soy', 'soya', 'tofu', 'tempeh', 'edamame', 'miso', 'soy sauce', 'tamari'],
  'Fish': ['fish', 'salmon', 'tuna', 'cod', 'halibut', 'tilapia', 'trout', 'bass', 'anchovy', 'anchovies', 'sardine', 'mackerel', 'fish sauce'],
  'Shellfish': ['shrimp', 'prawn', 'crab', 'lobster', 'clam', 'mussel', 'oyster', 'scallop', 'crawfish', 'crayfish', 'shellfish'],
  'Sesame': ['sesame', 'tahini', 'sesame oil', 'sesame seed'],
};

// Keywords that indicate dietary compliance
const DIETARY_KEYWORDS: Record<string, { includes: string[]; excludes: string[] }> = {
  'Vegetarian': {
    includes: [],
    excludes: ['chicken', 'beef', 'pork', 'lamb', 'fish', 'salmon', 'tuna', 'shrimp', 'bacon', 'ham', 'sausage', 'meat', 'turkey', 'duck', 'veal', 'steak', 'prawn', 'crab', 'lobster', 'anchovy', 'anchovies'],
  },
  'Vegan': {
    includes: [],
    excludes: ['chicken', 'beef', 'pork', 'lamb', 'fish', 'salmon', 'tuna', 'shrimp', 'bacon', 'ham', 'sausage', 'meat', 'turkey', 'duck', 'veal', 'steak', 'prawn', 'crab', 'lobster', 'egg', 'eggs', 'milk', 'cream', 'butter', 'cheese', 'yogurt', 'honey', 'mayo', 'mayonnaise', 'ghee'],
  },
  'Gluten-Free': {
    includes: [],
    excludes: ['flour', 'bread', 'pasta', 'noodle', 'wheat', 'barley', 'rye', 'cracker', 'breadcrumb', 'couscous', 'bulgur', 'seitan', 'soy sauce'],
  },
  'Dairy-Free': {
    includes: [],
    excludes: ['milk', 'cream', 'butter', 'cheese', 'yogurt', 'whey', 'casein', 'ghee', 'half-and-half', 'sour cream', 'cream cheese', 'ricotta', 'mozzarella', 'parmesan', 'cheddar', 'feta', 'cottage cheese'],
  },
  'Keto': {
    includes: [],
    excludes: ['sugar', 'flour', 'bread', 'pasta', 'rice', 'potato', 'potatoes', 'corn', 'beans', 'oats', 'honey', 'maple syrup', 'banana', 'apple', 'orange'],
  },
  'Low-Carb': {
    includes: [],
    excludes: ['sugar', 'flour', 'bread', 'pasta', 'rice', 'potato', 'potatoes', 'corn', 'beans'],
  },
};

export function DietaryWarnings({ ingredients, tags = [], compact = false }: DietaryWarningsProps) {
  const { profile } = useProfile();

  if (profile.allergies.length === 0 && profile.dietaryRestrictions.length === 0) {
    return null;
  }

  const ingredientText = ingredients.map(i => i.item.toLowerCase()).join(' ');
  const tagText = tags.join(' ').toLowerCase();
  const allText = ingredientText + ' ' + tagText;

  // Check for allergens
  const allergenWarnings: string[] = [];
  for (const allergy of profile.allergies) {
    const keywords = ALLERGEN_KEYWORDS[allergy] || [];
    for (const keyword of keywords) {
      if (allText.includes(keyword.toLowerCase())) {
        allergenWarnings.push(allergy);
        break;
      }
    }
  }

  // Check dietary compliance
  const dietaryIssues: string[] = [];
  const dietaryOk: string[] = [];

  for (const restriction of profile.dietaryRestrictions) {
    const rules = DIETARY_KEYWORDS[restriction];
    if (!rules) continue;

    let isCompliant = true;
    for (const exclude of rules.excludes) {
      if (allText.includes(exclude.toLowerCase())) {
        isCompliant = false;
        break;
      }
    }

    if (isCompliant) {
      dietaryOk.push(restriction);
    } else {
      dietaryIssues.push(restriction);
    }
  }

  if (allergenWarnings.length === 0 && dietaryIssues.length === 0 && dietaryOk.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-1">
        {allergenWarnings.map(allergy => (
          <Badge key={allergy} variant="destructive" className="text-[10px] px-1.5 py-0">
            <AlertTriangle className="w-2.5 h-2.5 mr-0.5" />
            {allergy}
          </Badge>
        ))}
        {dietaryIssues.map(issue => (
          <Badge key={issue} variant="outline" className="text-[10px] px-1.5 py-0 border-orange-400 text-orange-600">
            Not {issue}
          </Badge>
        ))}
        {dietaryOk.map(ok => (
          <Badge key={ok} variant="outline" className="text-[10px] px-1.5 py-0 border-green-400 text-green-600">
            <Check className="w-2.5 h-2.5 mr-0.5" />
            {ok}
          </Badge>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {allergenWarnings.length > 0 && (
        <div className="flex items-start gap-2 p-2 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-800">
          <AlertTriangle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-red-700 dark:text-red-400">Allergen Warning</p>
            <p className="text-xs text-red-600 dark:text-red-500">
              Contains: {allergenWarnings.join(', ')}
            </p>
          </div>
        </div>
      )}
      {dietaryIssues.length > 0 && (
        <div className="flex items-start gap-2 p-2 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
          <AlertTriangle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-orange-700 dark:text-orange-400">Dietary Notice</p>
            <p className="text-xs text-orange-600 dark:text-orange-500">
              Not suitable for: {dietaryIssues.join(', ')}
            </p>
          </div>
        </div>
      )}
      {dietaryOk.length > 0 && (
        <div className="flex items-start gap-2 p-2 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
          <Leaf className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-green-700 dark:text-green-400">Dietary Friendly</p>
            <p className="text-xs text-green-600 dark:text-green-500">
              Appears to be: {dietaryOk.join(', ')}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
