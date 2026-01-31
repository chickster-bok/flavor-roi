'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useProfile, DIETARY_OPTIONS, ALLERGY_OPTIONS, COOKING_LEVELS } from '@/contexts/ProfileContext';
import { ChefHat, ArrowRight, ArrowLeft, Sparkles, Check, SkipForward } from 'lucide-react';

const CUISINE_OPTIONS = [
  'Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian',
  'Thai', 'Mediterranean', 'American', 'French', 'Korean',
  'Vietnamese', 'Greek', 'Spanish', 'Middle Eastern', 'Caribbean'
];

export default function OnboardingPage() {
  const router = useRouter();
  const { profile, updateProfile } = useProfile();
  const [step, setStep] = useState(1);
  const [name, setName] = useState(profile.displayName || '');
  const [cookingLevel, setCookingLevel] = useState(profile.cookingLevel);
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(profile.favoriteCuisines);
  const [selectedDietary, setSelectedDietary] = useState<string[]>(profile.dietaryRestrictions);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>(profile.allergies);
  const [fadeIn, setFadeIn] = useState(true);

  const totalSteps = 4;

  const handleNext = () => {
    setFadeIn(false);
    setTimeout(() => {
      if (step < totalSteps) {
        setStep(step + 1);
      } else {
        handleComplete();
      }
      setFadeIn(true);
    }, 200);
  };

  const handleBack = () => {
    setFadeIn(false);
    setTimeout(() => {
      setStep(step - 1);
      setFadeIn(true);
    }, 200);
  };

  const handleComplete = () => {
    updateProfile({
      displayName: name || 'Chef',
      cookingLevel,
      favoriteCuisines: selectedCuisines,
      dietaryRestrictions: selectedDietary,
      allergies: selectedAllergies,
    });
    localStorage.setItem('onboarding-complete', 'true');
    router.push('/');
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding-complete', 'true');
    router.push('/');
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

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30">
      {/* Gradient Header */}
      <div className="h-48 bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white">
            <div className="w-20 h-20 rounded-3xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 shadow-lg">
              <ChefHat className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-2xl font-bold">The $5 Chef</h1>
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="max-w-md mx-auto px-4 -mt-6">
        <div className="bg-white dark:bg-card rounded-full p-1 shadow-lg">
          <div className="flex gap-1">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div
                key={i}
                className={`h-2 flex-1 rounded-full transition-all duration-500 ${
                  i < step ? 'bg-gradient-to-r from-emerald-500 to-amber-400' : 'bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-md mx-auto px-4 py-8">
        <div className={`transition-all duration-200 ${fadeIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          {/* Step 1: Welcome + Name */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 text-amber-500 mb-2">
                  <Sparkles className="w-5 h-5" />
                  <span className="text-sm font-medium">Welcome!</span>
                </div>
                <h2 className="text-2xl font-bold">Let's get cooking!</h2>
                <p className="text-muted-foreground">
                  First, what should we call you?
                </p>
              </div>

              <Card>
                <CardContent className="pt-6">
                  <Input
                    placeholder="Your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-lg h-14 text-center"
                    autoFocus
                  />
                </CardContent>
              </Card>
            </div>
          )}

          {/* Step 2: Cooking Level */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Your cooking level?</h2>
                <p className="text-muted-foreground">
                  We'll tailor recipes to match your skills
                </p>
              </div>

              <div className="space-y-3">
                {COOKING_LEVELS.map((level) => (
                  <Card
                    key={level.value}
                    className={`cursor-pointer transition-all hover:scale-[1.02] ${
                      cookingLevel === level.value
                        ? 'ring-2 ring-emerald-500 bg-emerald-50 dark:bg-emerald-950/20'
                        : ''
                    }`}
                    onClick={() => setCookingLevel(level.value)}
                  >
                    <CardContent className="p-4 flex items-center justify-between">
                      <div>
                        <h3 className="font-semibold">{level.label}</h3>
                        <p className="text-sm text-muted-foreground">{level.description}</p>
                      </div>
                      {cookingLevel === level.value && (
                        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                          <Check className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Favorite Cuisines */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Favorite cuisines?</h2>
                <p className="text-muted-foreground">
                  Select all that sound delicious
                </p>
              </div>

              <div className="flex flex-wrap gap-2 justify-center">
                {CUISINE_OPTIONS.map((cuisine) => (
                  <button
                    key={cuisine}
                    onClick={() => toggleCuisine(cuisine)}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedCuisines.includes(cuisine)
                        ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
                        : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    {cuisine}
                  </button>
                ))}
              </div>

              {selectedCuisines.length > 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  {selectedCuisines.length} selected
                </p>
              )}
            </div>
          )}

          {/* Step 4: Dietary Restrictions + Allergies */}
          {step === 4 && (
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold">Any dietary needs?</h2>
                <p className="text-muted-foreground">
                  We'll make sure recipes work for you
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium mb-2 text-muted-foreground">Dietary Preferences</h3>
                  <div className="flex flex-wrap gap-2">
                    {DIETARY_OPTIONS.map((option) => (
                      <button
                        key={option}
                        onClick={() => toggleDietary(option)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          selectedDietary.includes(option)
                            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-md'
                            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-medium mb-2 text-muted-foreground">Allergies</h3>
                  <div className="flex flex-wrap gap-2">
                    {ALLERGY_OPTIONS.map((allergy) => (
                      <button
                        key={allergy}
                        onClick={() => toggleAllergy(allergy)}
                        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                          selectedAllergies.includes(allergy)
                            ? 'bg-gradient-to-r from-red-500 to-red-600 text-white shadow-md'
                            : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700'
                        }`}
                      >
                        {allergy}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex gap-3 mt-8">
          {step > 1 && (
            <Button variant="outline" onClick={handleBack} className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <Button
            onClick={handleNext}
            className={`flex-1 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white ${
              step === 1 ? 'w-full' : ''
            }`}
          >
            {step === totalSteps ? (
              <>
                <Check className="w-4 h-4 mr-2" />
                Get Started
              </>
            ) : (
              <>
                Continue
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>

        {/* Skip Option */}
        <div className="text-center mt-4">
          <button
            onClick={handleSkip}
            className="text-sm text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
          >
            <SkipForward className="w-3 h-3" />
            Skip for now
          </button>
        </div>
      </div>
    </main>
  );
}
