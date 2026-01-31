'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useProfile, COOKING_LEVELS, DIETARY_OPTIONS, ALLERGY_OPTIONS, CookingLevel } from '@/contexts/ProfileContext';
import { usePantry } from '@/contexts/PantryContext';
import { useCookbook } from '@/contexts/CookbookContext';
import { availableCuisines } from '@/lib/recipeDatabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft,
  ChefHat,
  Globe,
  Leaf,
  AlertTriangle,
  TrendingUp,
  BookOpen,
  Package,
  Check,
  Loader2,
  Star,
} from 'lucide-react';

export default function ProfilePage() {
  const { profile, updateProfile, loading } = useProfile();
  const { items: pantryItems } = usePantry();
  const { recipes: cookbookRecipes } = useCookbook();
  const [editingName, setEditingName] = useState(false);
  const [nameInput, setNameInput] = useState(profile.displayName);

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </main>
    );
  }

  const handleSaveName = () => {
    updateProfile({ displayName: nameInput });
    setEditingName(false);
  };

  const toggleCuisine = (cuisine: string) => {
    const current = profile.favoriteCuisines;
    if (current.includes(cuisine)) {
      updateProfile({ favoriteCuisines: current.filter(c => c !== cuisine) });
    } else {
      updateProfile({ favoriteCuisines: [...current, cuisine] });
    }
  };

  const toggleDietary = (option: string) => {
    const current = profile.dietaryRestrictions;
    if (current.includes(option)) {
      updateProfile({ dietaryRestrictions: current.filter(d => d !== option) });
    } else {
      updateProfile({ dietaryRestrictions: [...current, option] });
    }
  };

  const toggleAllergy = (allergy: string) => {
    const current = profile.allergies;
    if (current.includes(allergy)) {
      updateProfile({ allergies: current.filter(a => a !== allergy) });
    } else {
      updateProfile({ allergies: [...current, allergy] });
    }
  };

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
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-2xl font-bold">
            {profile.displayName ? profile.displayName[0].toUpperCase() : '👨‍🍳'}
          </div>
          <div className="flex-1">
            {editingName ? (
              <div className="flex gap-2">
                <Input
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  placeholder="Your name"
                  className="h-9"
                />
                <Button size="sm" onClick={handleSaveName}>Save</Button>
              </div>
            ) : (
              <div>
                <h1 className="text-xl font-bold">
                  {profile.displayName || 'Chef'}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="ml-2 h-6 text-xs"
                    onClick={() => {
                      setNameInput(profile.displayName);
                      setEditingName(true);
                    }}
                  >
                    Edit
                  </Button>
                </h1>
                <p className="text-sm text-muted-foreground">
                  {COOKING_LEVELS.find(l => l.value === profile.cookingLevel)?.label}
                </p>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="space-y-6 max-w-2xl mx-auto">
        {/* Stats Overview */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="p-3 text-center">
              <ChefHat className="w-5 h-5 mx-auto mb-1 text-emerald-600" />
              <p className="text-xl font-bold">{profile.stats.recipesCooked}</p>
              <p className="text-[10px] text-muted-foreground">Cooked</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <BookOpen className="w-5 h-5 mx-auto mb-1 text-amber-600" />
              <p className="text-xl font-bold">{cookbookRecipes.length}</p>
              <p className="text-[10px] text-muted-foreground">Saved</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-3 text-center">
              <Package className="w-5 h-5 mx-auto mb-1 text-blue-600" />
              <p className="text-xl font-bold">{pantryItems.length}</p>
              <p className="text-[10px] text-muted-foreground">Pantry</p>
            </CardContent>
          </Card>
        </div>

        {/* Cooking Level */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Cooking Level
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-2 gap-2">
              {COOKING_LEVELS.map((level) => (
                <Button
                  key={level.value}
                  variant={profile.cookingLevel === level.value ? 'default' : 'outline'}
                  className={`h-auto py-3 flex-col items-start ${
                    profile.cookingLevel === level.value
                      ? 'bg-emerald-500 hover:bg-emerald-600'
                      : ''
                  }`}
                  onClick={() => updateProfile({ cookingLevel: level.value })}
                >
                  <span className="font-medium">{level.label}</span>
                  <span className="text-[10px] opacity-80">{level.description}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Favorite Cuisines */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Favorite Cuisines
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {availableCuisines.slice(0, 20).map((cuisine) => (
                <Badge
                  key={cuisine}
                  variant={profile.favoriteCuisines.includes(cuisine) ? 'default' : 'outline'}
                  className={`cursor-pointer ${
                    profile.favoriteCuisines.includes(cuisine)
                      ? 'bg-emerald-500 hover:bg-emerald-600'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => toggleCuisine(cuisine)}
                >
                  {profile.favoriteCuisines.includes(cuisine) && (
                    <Check className="w-3 h-3 mr-1" />
                  )}
                  {cuisine}
                </Badge>
              ))}
            </div>
            {profile.favoriteCuisines.length > 0 && (
              <p className="text-xs text-muted-foreground mt-3">
                {profile.favoriteCuisines.length} cuisine{profile.favoriteCuisines.length !== 1 ? 's' : ''} selected
              </p>
            )}
          </CardContent>
        </Card>

        {/* Dietary Preferences */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Leaf className="w-4 h-4" />
              Dietary Preferences
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {DIETARY_OPTIONS.map((option) => (
                <Badge
                  key={option}
                  variant={profile.dietaryRestrictions.includes(option) ? 'default' : 'outline'}
                  className={`cursor-pointer ${
                    profile.dietaryRestrictions.includes(option)
                      ? 'bg-green-500 hover:bg-green-600'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => toggleDietary(option)}
                >
                  {profile.dietaryRestrictions.includes(option) && (
                    <Check className="w-3 h-3 mr-1" />
                  )}
                  {option}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Allergies */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Allergies
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {ALLERGY_OPTIONS.map((allergy) => (
                <Badge
                  key={allergy}
                  variant={profile.allergies.includes(allergy) ? 'default' : 'outline'}
                  className={`cursor-pointer ${
                    profile.allergies.includes(allergy)
                      ? 'bg-red-500 hover:bg-red-600'
                      : 'hover:bg-muted'
                  }`}
                  onClick={() => toggleAllergy(allergy)}
                >
                  {profile.allergies.includes(allergy) && (
                    <Check className="w-3 h-3 mr-1" />
                  )}
                  {allergy}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cuisines Explored */}
        {profile.stats.cuisinesExplored.length > 0 && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Star className="w-4 h-4" />
                Cuisines Explored
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="flex flex-wrap gap-2">
                {profile.stats.cuisinesExplored.map((cuisine) => (
                  <Badge key={cuisine} variant="secondary">
                    {cuisine}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  );
}
