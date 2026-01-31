'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  ChefHat,
  Sparkles,
  ArrowRight,
  Utensils,
  Leaf,
  Clock,
  Star,
  Search,
} from 'lucide-react';

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect authenticated users to onboarding or dashboard
  useEffect(() => {
    if (!loading && user) {
      const hasCompletedOnboarding = localStorage.getItem('onboarding-complete');
      if (hasCompletedOnboarding) {
        router.push('/dashboard');
      } else {
        router.push('/onboarding');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <main className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center animate-pulse">
          <ChefHat className="w-8 h-8 text-white" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <header className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg">Gap Chef</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/pricing">
              <Button variant="ghost" size="sm" className="text-white/70 hover:text-white hover:bg-white/10">
                Pricing
              </Button>
            </Link>
            <Link href="/login">
              <Button size="sm" className="bg-white text-black hover:bg-white/90 font-medium">
                Sign In
              </Button>
            </Link>
          </div>
        </header>

        {/* Hero */}
        <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-8">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-sm font-medium">AI-Powered Cooking Assistant</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 max-w-3xl">
            Cook{' '}
            <span className="bg-gradient-to-r from-emerald-400 to-amber-400 bg-clip-text text-transparent">
              smarter
            </span>
            , not harder
          </h1>

          <p className="text-xl text-white/60 max-w-xl mb-10">
            Enter your ingredients, get personalized recipes, and create delicious meals with what you already have.
          </p>

          {/* CTA */}
          <Link href="/login">
            <Button
              size="lg"
              className="h-14 px-8 text-lg bg-white text-black hover:bg-white/90 font-semibold rounded-full shadow-lg"
            >
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>

          <p className="text-sm text-white/50 mt-4">
            7 days free, then $4.99/month
          </p>
        </div>

        {/* Features Grid */}
        <div className="px-6 pb-12">
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center mb-3">
                <Search className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="font-semibold mb-1">Find Recipes</h3>
              <p className="text-sm text-white/50">Enter your ingredients, get matches</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 flex items-center justify-center mb-3">
                <Utensils className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="font-semibold mb-1">50+ Recipes</h3>
              <p className="text-sm text-white/50">Curated collection of delicious meals</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center mb-3">
                <Leaf className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="font-semibold mb-1">Dietary Filters</h3>
              <p className="text-sm text-white/50">Vegan, keto, gluten-free & more</p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-5 border border-white/10">
              <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-3">
                <Clock className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="font-semibold mb-1">Quick Meals</h3>
              <p className="text-sm text-white/50">Ready in 30 minutes or less</p>
            </div>
          </div>
        </div>

        {/* Social Proof */}
        <div className="px-6 pb-12">
          <div className="max-w-md mx-auto flex items-center justify-center gap-2 text-white/40">
            <div className="flex -space-x-2">
              {['E', 'M', 'S', 'J'].map((letter, i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-amber-500 flex items-center justify-center text-xs font-bold text-white ring-2 ring-black"
                >
                  {letter}
                </div>
              ))}
            </div>
            <div className="flex items-center gap-1 ml-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-sm">Loved by home cooks</span>
          </div>
        </div>
      </div>
    </main>
  );
}
