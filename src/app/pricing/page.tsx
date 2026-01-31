'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import {
  Check,
  X,
  Crown,
  ChefHat,
  Sparkles,
  Shield,
  Zap,
  ArrowLeft,
  Star
} from 'lucide-react';

export default function PricingPage() {
  const [isYearly, setIsYearly] = useState(false);

  const monthlyPrice = 4.99;
  const yearlyPrice = 39.99;
  const yearlySavings = Math.round((1 - yearlyPrice / (monthlyPrice * 12)) * 100);

  const freeFeatures = [
    { name: '5 recipe scans per day', included: true },
    { name: 'Basic recipe suggestions', included: true },
    { name: 'Save up to 10 recipes', included: true },
    { name: 'Basic nutritional info', included: true },
    { name: 'Unlimited scans', included: false },
    { name: 'AI meal planning', included: false },
    { name: 'Smart shopping lists', included: false },
    { name: 'Priority support', included: false },
  ];

  const premiumFeatures = [
    { name: 'Unlimited recipe scans', included: true },
    { name: 'Advanced AI suggestions', included: true },
    { name: 'Unlimited saved recipes', included: true },
    { name: 'Detailed nutritional analysis', included: true },
    { name: 'AI-powered meal planning', included: true },
    { name: 'Smart shopping lists', included: true },
    { name: 'Advanced dietary filters', included: true },
    { name: 'Priority support', included: true },
  ];

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <Link href="/">
            <button className="flex items-center gap-2 text-white/60 hover:text-white text-sm py-2 px-3 rounded-lg hover:bg-white/10 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">The $5 Chef</span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-emerald-500/20 rounded-full px-4 py-2 mb-6">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-sm text-emerald-400 font-medium">7-Day Free Trial</span>
          </div>
          <h1 className="text-4xl font-bold mb-4">Simple, transparent pricing</h1>
          <p className="text-white/60 text-lg">Start free, upgrade when you're ready</p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-10">
          <span className={`text-sm font-medium ${!isYearly ? 'text-white' : 'text-white/50'}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`relative w-14 h-8 rounded-full transition-colors ${
              isYearly ? 'bg-emerald-500' : 'bg-white/20'
            }`}
          >
            <span
              className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-transform ${
                isYearly ? 'translate-x-7' : 'translate-x-1'
              }`}
            />
          </button>
          <span className={`text-sm font-medium ${isYearly ? 'text-white' : 'text-white/50'}`}>
            Yearly
          </span>
          {isYearly && (
            <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">
              Save {yearlySavings}%
            </span>
          )}
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {/* Free Tier */}
          <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border border-white/10">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center mb-6">
              <ChefHat className="w-7 h-7 text-white/60" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Home Cook</h2>
            <p className="text-white/50 mb-6">Perfect for casual cooking</p>

            <div className="mb-8">
              <span className="text-5xl font-bold">$0</span>
              <span className="text-white/50">/month</span>
            </div>

            <ul className="space-y-4 mb-8">
              {freeFeatures.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  {feature.included ? (
                    <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  ) : (
                    <X className="w-5 h-5 text-white/20 flex-shrink-0" />
                  )}
                  <span className={feature.included ? 'text-white/80' : 'text-white/30'}>
                    {feature.name}
                  </span>
                </li>
              ))}
            </ul>

            <Link href="/login">
              <button className="w-full py-4 rounded-xl bg-white/10 hover:bg-white/20 font-semibold transition-colors">
                Get Started Free
              </button>
            </Link>
          </div>

          {/* Premium Tier */}
          <div className="relative bg-gradient-to-b from-emerald-500/20 to-amber-500/10 backdrop-blur-sm rounded-3xl p-8 border-2 border-emerald-500/50">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <span className="bg-gradient-to-r from-emerald-500 to-amber-400 text-black text-sm font-bold px-4 py-2 rounded-full inline-flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-black" />
                Most Popular
              </span>
            </div>

            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-amber-400 flex items-center justify-center mb-6 mt-2">
              <Crown className="w-7 h-7 text-black" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Michelin Star</h2>
            <p className="text-white/50 mb-6">For serious food enthusiasts</p>

            <div className="mb-8">
              <span className="text-5xl font-bold">
                ${isYearly ? (yearlyPrice / 12).toFixed(2) : monthlyPrice.toFixed(2)}
              </span>
              <span className="text-white/50">/month</span>
              {isYearly && (
                <p className="text-sm text-emerald-400 mt-1">
                  Billed ${yearlyPrice}/year
                </p>
              )}
            </div>

            <ul className="space-y-4 mb-8">
              {premiumFeatures.map((feature, i) => (
                <li key={i} className="flex items-center gap-3 text-sm">
                  <Check className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span className="text-white/80">{feature.name}</span>
                </li>
              ))}
            </ul>

            <Link href="/login">
              <button className="w-full py-4 rounded-xl bg-white text-black hover:bg-white/90 font-semibold transition-colors">
                Start 7-Day Free Trial
              </button>
            </Link>
            <p className="text-xs text-center text-white/40 mt-3">
              Cancel anytime during trial
            </p>
          </div>
        </div>

        {/* Trust Signals */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Zap className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="font-semibold mb-2">AI-Powered</h3>
            <p className="text-sm text-white/50">Smart recipe suggestions based on your ingredients</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
            <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-amber-400" />
            </div>
            <h3 className="font-semibold mb-2">Secure & Private</h3>
            <p className="text-sm text-white/50">Your data stays safe with enterprise-grade security</p>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 text-center">
            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="font-semibold mb-2">Regular Updates</h3>
            <p className="text-sm text-white/50">New features and recipes added weekly</p>
          </div>
        </div>

        {/* Money-back Guarantee */}
        <div className="bg-gradient-to-r from-emerald-500/10 to-amber-500/10 rounded-3xl p-8 border border-emerald-500/20 text-center">
          <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-6">
            <Shield className="w-8 h-8 text-emerald-400" />
          </div>
          <h3 className="text-2xl font-bold mb-3">30-Day Money-Back Guarantee</h3>
          <p className="text-white/60 max-w-md mx-auto">
            Not satisfied? Get a full refund within 30 days, no questions asked. We're confident you'll love cooking with us.
          </p>
        </div>
      </div>
    </main>
  );
}
