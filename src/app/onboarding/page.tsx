'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProfile, DIETARY_OPTIONS, ALLERGY_OPTIONS, COOKING_LEVELS, CookingLevel } from '@/contexts/ProfileContext';
import { usePantry } from '@/contexts/PantryContext';
import { useAuth } from '@/contexts/AuthContext';
import { CameraDialog } from '@/components/CameraDialog';
import { ManualInput } from '@/components/ManualInput';
import {
  ChefHat,
  ArrowRight,
  ArrowLeft,
  Check,
  Camera,
  Keyboard,
  Sparkles,
  Loader2,
  X,
} from 'lucide-react';

const CUISINE_OPTIONS = [
  'Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian',
  'Thai', 'Mediterranean', 'American', 'French', 'Korean',
  'Vietnamese', 'Greek', 'Spanish', 'Middle Eastern', 'Caribbean'
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { profile, updateProfile } = useProfile();
  const { items: pantryItems, addItems } = usePantry();

  const [step, setStep] = useState(1);
  const [name, setName] = useState(profile.displayName || '');
  const [cookingLevel, setCookingLevel] = useState<CookingLevel>(profile.cookingLevel);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(profile.favoriteCuisines);
  const [selectedDietary, setSelectedDietary] = useState<string[]>(profile.dietaryRestrictions);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(profile.allergies);
  const [showCamera, setShowCamera] = useState(false);
  const [showManualInput, setShowManualInput] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [scannedIngredients, setScannedIngredients] = useState<string[]>([]);

  const totalSteps = 4;

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Pre-populate name from Firebase user
  useEffect(() => {
    if (user?.displayName && !name) {
      setName(user.displayName);
    }
  }, [user, name]);

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleComplete = () => {
    updateProfile({
      displayName: name || user?.displayName || 'Chef',
      cookingLevel,
      favoriteCuisines: selectedCuisines,
      dietaryRestrictions: selectedDietary,
      allergies: selectedAllergies,
    });

    // Add scanned ingredients to pantry
    if (scannedIngredients.length > 0) {
      addItems(scannedIngredients);
    }

    localStorage.setItem('onboarding-complete', 'true');
    router.push('/dashboard');
  };

  const handleCapture = async (imageData: string) => {
    setIsAnalyzing(true);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageData }),
      });

      const data = await response.json();
      if (data.found_ingredients) {
        setScannedIngredients(prev => {
          const newIngredients = data.found_ingredients.filter(
            (ing: string) => !prev.some(p => p.toLowerCase() === ing.toLowerCase())
          );
          return [...prev, ...newIngredients];
        });
      }
      setShowCamera(false);
    } catch (error) {
      console.error('Scan failed:', error);
      setShowCamera(false);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualAdd = (ingredients: string[]) => {
    setScannedIngredients(prev => {
      const newIngredients = ingredients.filter(
        (ing) => !prev.some(p => p.toLowerCase() === ing.toLowerCase())
      );
      return [...prev, ...newIngredients];
    });
    setShowManualInput(false);
  };

  const removeIngredient = (ingredient: string) => {
    setScannedIngredients(prev => prev.filter(i => i !== ingredient));
  };

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines(prev =>
      prev.includes(cuisine)
        ? prev.filter(c => c !== cuisine)
        : [...prev, cuisine]
    );
  };

  const toggleDietary = (option: string) => {
    setSelectedDietary(prev =>
      prev.includes(option)
        ? prev.filter(d => d !== option)
        : [...prev, option]
    );
  };

  const toggleAllergy = (allergy: string) => {
    setSelectedAllergies(prev =>
      prev.includes(allergy)
        ? prev.filter(a => a !== allergy)
        : [...prev, allergy]
    );
  };

  if (authLoading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex flex-col max-w-lg mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold">The $5 Chef</span>
          </div>
          <span className="text-sm text-white/50">Step {step} of {totalSteps}</span>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-10">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${
                i < step ? 'bg-gradient-to-r from-emerald-500 to-amber-400' : 'bg-white/10'
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="flex-1">
          {/* Step 1: Welcome + Name */}
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center gap-2 bg-emerald-500/20 rounded-full px-3 py-1 mb-4">
                  <Sparkles className="w-4 h-4 text-emerald-400" />
                  <span className="text-sm text-emerald-400">Welcome</span>
                </div>
                <h1 className="text-3xl font-bold mb-3">
                  Hey there, chef!
                </h1>
                <p className="text-white/60">
                  Let's personalize your cooking experience. What should we call you?
                </p>
              </div>

              <div className="space-y-4">
                <Input
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-14 text-lg bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-emerald-500"
                  autoFocus
                />
              </div>
            </div>
          )}

          {/* Step 2: Scan Ingredients */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-bold mb-3">
                  What's in your kitchen?
                </h1>
                <p className="text-white/60">
                  Scan your fridge or pantry to get started with personalized recipes.
                </p>
              </div>

              {/* Scan Options */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowCamera(true)}
                  disabled={isAnalyzing}
                  className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/20 border border-emerald-500/30 rounded-2xl p-6 text-left hover:border-emerald-500/50 transition-all disabled:opacity-50"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-4">
                    <Camera className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h3 className="font-semibold mb-1">Scan</h3>
                  <p className="text-sm text-white/50">Use your camera</p>
                </button>

                <button
                  onClick={() => setShowManualInput(true)}
                  disabled={isAnalyzing}
                  className="bg-white/5 border border-white/10 rounded-2xl p-6 text-left hover:border-white/20 transition-all disabled:opacity-50"
                >
                  <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4">
                    <Keyboard className="w-6 h-6 text-white/60" />
                  </div>
                  <h3 className="font-semibold mb-1">Type</h3>
                  <p className="text-sm text-white/50">Enter manually</p>
                </button>
              </div>

              {/* Analyzing State */}
              {isAnalyzing && (
                <div className="flex items-center justify-center gap-3 py-8">
                  <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
                  <span className="text-white/60">Analyzing your ingredients...</span>
                </div>
              )}

              {/* Scanned Ingredients */}
              {scannedIngredients.length > 0 && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-white/60">Your Ingredients ({scannedIngredients.length})</h3>
                    <button
                      onClick={() => setScannedIngredients([])}
                      className="text-xs text-red-400 hover:text-red-300"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {scannedIngredients.map((ingredient, i) => (
                      <span
                        key={i}
                        className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 px-3 py-1.5 rounded-full text-sm"
                      >
                        {ingredient}
                        <button
                          onClick={() => removeIngredient(ingredient)}
                          className="hover:text-white"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {scannedIngredients.length === 0 && !isAnalyzing && (
                <p className="text-center text-white/40 py-8">
                  No ingredients added yet. Scan or type to add some!
                </p>
              )}
            </div>
          )}

          {/* Step 3: Cooking Level + Cuisines */}
          {step === 3 && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-3">
                  Tell us about yourself
                </h1>
                <p className="text-white/60">
                  We'll tailor recipes to your skill level and taste preferences.
                </p>
              </div>

              {/* Cooking Level */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-white/60">Cooking Level</h3>
                <div className="grid grid-cols-2 gap-3">
                  {COOKING_LEVELS.map((level) => (
                    <button
                      key={level.value}
                      onClick={() => setCookingLevel(level.value)}
                      className={`p-4 rounded-xl text-left transition-all ${
                        cookingLevel === level.value
                          ? 'bg-emerald-500/20 border-2 border-emerald-500'
                          : 'bg-white/5 border-2 border-transparent hover:border-white/10'
                      }`}
                    >
                      <h4 className="font-semibold text-sm">{level.label}</h4>
                      <p className="text-xs text-white/50 mt-0.5">{level.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cuisines */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-white/60">Favorite Cuisines</h3>
                <div className="flex flex-wrap gap-2">
                  {CUISINE_OPTIONS.map((cuisine) => (
                    <button
                      key={cuisine}
                      onClick={() => toggleCuisine(cuisine)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedCuisines.includes(cuisine)
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {cuisine}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Dietary + Allergies */}
          {step === 4 && (
            <div className="space-y-8">
              <div>
                <h1 className="text-3xl font-bold mb-3">
                  Almost done!
                </h1>
                <p className="text-white/60">
                  Any dietary preferences or allergies we should know about?
                </p>
              </div>

              {/* Dietary */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-white/60">Dietary Preferences</h3>
                <div className="flex flex-wrap gap-2">
                  {DIETARY_OPTIONS.map((option) => (
                    <button
                      key={option}
                      onClick={() => toggleDietary(option)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedDietary.includes(option)
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white'
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>

              {/* Allergies */}
              <div className="space-y-3">
                <h3 className="text-sm font-medium text-white/60">Allergies</h3>
                <div className="flex flex-wrap gap-2">
                  {ALLERGY_OPTIONS.map((allergy) => (
                    <button
                      key={allergy}
                      onClick={() => toggleAllergy(allergy)}
                      className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedAllergies.includes(allergy)
                          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                          : 'bg-white/5 text-white/60 hover:bg-white/10'
                      }`}
                    >
                      {allergy}
                    </button>
                  ))}
                </div>
              </div>

              <p className="text-sm text-white/40 text-center">
                You can always update these in your profile settings.
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="pt-8 space-y-4">
          <div className="flex gap-3">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex-1 h-14 border-white/20 text-white hover:bg-white/10"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            <Button
              onClick={handleNext}
              disabled={step === 1 && !name.trim()}
              className={`h-14 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold ${
                step === 1 ? 'w-full' : 'flex-1'
              }`}
            >
              {step === totalSteps ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Let's Cook!
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </>
              )}
            </Button>
          </div>

          {step === 2 && (
            <button
              onClick={handleNext}
              className="w-full text-center text-sm text-white/40 hover:text-white/60"
            >
              Skip for now
            </button>
          )}
        </div>
      </div>

      {/* Camera Dialog */}
      <CameraDialog
        open={showCamera}
        onOpenChange={setShowCamera}
        onCapture={handleCapture}
        isAnalyzing={isAnalyzing}
      />

      {/* Manual Input Dialog */}
      {showManualInput && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowManualInput(false)} />
          <div className="relative bg-zinc-900 w-full max-w-lg rounded-t-3xl sm:rounded-3xl p-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Add Ingredients</h2>
              <button
                onClick={() => setShowManualInput(false)}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center"
              >
                <X className="w-4 h-4 text-white" />
              </button>
            </div>
            <ManualInput
              onSubmit={handleManualAdd}
            />
          </div>
        </div>
      )}
    </main>
  );
}
