'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { usePantry } from '@/contexts/PantryContext';
import { useCookbook } from '@/contexts/CookbookContext';
import { Button } from '@/components/ui/button';
import {
  ChefHat,
  Camera,
  Sparkles,
  TrendingUp,
  DollarSign,
  LogIn,
  Loader2,
  ArrowRight,
  Check,
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { items: pantryItems, loading: pantryLoading } = usePantry();
  const { recipes: cookbookRecipes } = useCookbook();

  // If user is already set up, redirect to dashboard
  useEffect(() => {
    if (!authLoading && !pantryLoading) {
      if (pantryItems.length > 0 || cookbookRecipes.length > 0) {
        router.push('/dashboard');
      }
    }
  }, [authLoading, pantryLoading, pantryItems, cookbookRecipes, router]);

  if (authLoading || pantryLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex flex-col">
      {/* Header */}
      <header className="p-4 flex items-center justify-between">
        <div className="w-20" />
        {user ? (
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              Dashboard
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        ) : (
          <Link href="/login">
            <Button variant="ghost" size="sm">
              <LogIn className="w-4 h-4 mr-1" />
              Login
            </Button>
          </Link>
        )}
      </header>

      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        {/* Logo */}
        <div className="mb-8">
          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-xl shadow-emerald-500/30 mb-6 mx-auto">
            <ChefHat className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">
            The $5 Chef
          </h1>
          <p className="text-lg text-muted-foreground mt-3">
            Maximum Flavor. Minimum Cost.
          </p>
        </div>

        {/* Value Props */}
        <div className="grid grid-cols-3 gap-6 mb-10 w-full max-w-md">
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <Camera className="w-7 h-7 text-emerald-600" />
            </div>
            <span className="text-sm font-medium">Scan</span>
            <span className="text-xs text-muted-foreground">Your ingredients</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-amber-600" />
            </div>
            <span className="text-sm font-medium">Match</span>
            <span className="text-xs text-muted-foreground">AI-powered recipes</span>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <TrendingUp className="w-7 h-7 text-blue-600" />
            </div>
            <span className="text-sm font-medium">Cook</span>
            <span className="text-xs text-muted-foreground">Delicious meals</span>
          </div>
        </div>

        {/* Features */}
        <div className="w-full max-w-sm mb-8 space-y-3">
          <div className="flex items-center gap-3 text-left">
            <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <span className="text-sm">AI-powered ingredient scanning</span>
          </div>
          <div className="flex items-center gap-3 text-left">
            <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <span className="text-sm">50+ delicious recipes with full instructions</span>
          </div>
          <div className="flex items-center gap-3 text-left">
            <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <span className="text-sm">Smart pantry management</span>
          </div>
          <div className="flex items-center gap-3 text-left">
            <Check className="w-5 h-5 text-emerald-500 flex-shrink-0" />
            <span className="text-sm">Ask AI for cooking tips and substitutions</span>
          </div>
        </div>

        {/* CTA */}
        <div className="w-full max-w-xs space-y-3">
          <Link href="/dashboard">
            <Button
              className="w-full h-14 text-lg bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold shadow-lg shadow-emerald-500/30"
              size="lg"
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
          {!user && (
            <p className="text-xs text-muted-foreground">
              No account needed to try it out
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="p-6 text-center">
        <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
          <DollarSign className="w-4 h-4" />
          <span className="font-medium">The $5 Chef</span>
          <span className="mx-2">•</span>
          <span>Powered by AI</span>
        </div>
      </footer>
    </main>
  );
}
