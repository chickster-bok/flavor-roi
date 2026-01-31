'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
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

  const freeTierFeatures = [
    { name: '5 recipe scans per month', included: true },
    { name: 'Basic recipe suggestions', included: true },
    { name: 'Save up to 10 recipes', included: true },
    { name: 'Basic nutritional info', included: true },
    { name: 'Unlimited scans', included: false },
    { name: 'AI meal planning', included: false },
    { name: 'Smart shopping lists', included: false },
    { name: 'Advanced dietary filters', included: false },
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
    { name: 'Recipe cost breakdown', included: true },
    { name: 'Priority support', included: true },
  ];

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30 pb-12">
      {/* Header */}
      <div className="bg-gradient-to-r from-emerald-500 via-emerald-400 to-amber-400 text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Simple, Transparent Pricing</h1>
          <p className="text-white/90">
            Start cooking smarter today. Cancel anytime.
          </p>
        </div>
      </div>

      {/* Billing Toggle */}
      <div className="max-w-4xl mx-auto px-4 -mt-6">
        <Card className="shadow-lg">
          <CardContent className="p-4 flex items-center justify-center gap-4">
            <span className={`text-sm font-medium ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
            />
            <span className={`text-sm font-medium ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
              Yearly
            </span>
            {isYearly && (
              <span className="bg-gradient-to-r from-emerald-500 to-emerald-600 text-white text-xs font-bold px-2 py-1 rounded-full">
                Save {yearlySavings}%
              </span>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-6">
          {/* Free Tier */}
          <Card className="relative">
            <CardHeader className="pb-2">
              <div className="w-12 h-12 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-2">
                <ChefHat className="w-6 h-6 text-gray-600 dark:text-gray-400" />
              </div>
              <CardTitle className="text-xl">Home Cook</CardTitle>
              <p className="text-sm text-muted-foreground">Perfect for casual cooking</p>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="mb-6">
                <span className="text-4xl font-bold">$0</span>
                <span className="text-muted-foreground">/month</span>
              </div>

              <ul className="space-y-3 mb-6">
                {freeTierFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    {feature.included ? (
                      <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-gray-300 flex-shrink-0" />
                    )}
                    <span className={feature.included ? '' : 'text-muted-foreground'}>
                      {feature.name}
                    </span>
                  </li>
                ))}
              </ul>

              <Button variant="outline" className="w-full" asChild>
                <Link href="/login">Get Started Free</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Premium Tier */}
          <Card className="relative border-2 border-emerald-500 shadow-xl shadow-emerald-500/10">
            {/* Most Popular Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-gradient-to-r from-emerald-500 to-amber-400 text-white text-xs font-bold px-4 py-1 rounded-full inline-flex items-center gap-1">
                <Star className="w-3 h-3 fill-white" />
                Most Popular
              </span>
            </div>

            <CardHeader className="pb-2 pt-8">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-amber-400 flex items-center justify-center mb-2">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <CardTitle className="text-xl">Michelin Star</CardTitle>
              <p className="text-sm text-muted-foreground">For serious food enthusiasts</p>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="mb-6">
                <span className="text-4xl font-bold">
                  ${isYearly ? (yearlyPrice / 12).toFixed(2) : monthlyPrice.toFixed(2)}
                </span>
                <span className="text-muted-foreground">/month</span>
                {isYearly && (
                  <p className="text-sm text-emerald-600 mt-1">
                    Billed ${yearlyPrice}/year
                  </p>
                )}
              </div>

              <ul className="space-y-3 mb-6">
                {premiumFeatures.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <Check className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                    <span>{feature.name}</span>
                  </li>
                ))}
              </ul>

              <Button
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                asChild
              >
                <Link href={`/subscribe?billing=${isYearly ? 'yearly' : 'monthly'}`}>
                  Start Free Trial
                </Link>
              </Button>
              <p className="text-xs text-center text-muted-foreground mt-2">
                7-day free trial, cancel anytime
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Trust Signals */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h2 className="text-xl font-bold text-center mb-6">Why Choose The $5 Chef?</h2>
        <div className="grid md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-3">
                <Zap className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold mb-1">AI-Powered</h3>
              <p className="text-sm text-muted-foreground">
                Smart recipe suggestions based on your ingredients
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-semibold mb-1">Secure & Private</h3>
              <p className="text-sm text-muted-foreground">
                Your data stays safe with enterprise-grade security
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-1">Regular Updates</h3>
              <p className="text-sm text-muted-foreground">
                New features and recipes added weekly
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Money-back Guarantee */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Card className="bg-gradient-to-r from-emerald-50 to-amber-50 dark:from-emerald-950/30 dark:to-amber-950/30 border-emerald-200 dark:border-emerald-800">
          <CardContent className="p-6 text-center">
            <div className="w-16 h-16 rounded-full bg-white dark:bg-gray-800 flex items-center justify-center mx-auto mb-4 shadow-md">
              <Shield className="w-8 h-8 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold mb-2">30-Day Money-Back Guarantee</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              Not satisfied? Get a full refund within 30 days, no questions asked.
              We're confident you'll love cooking with us.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FAQ Teaser */}
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-muted-foreground">
          Have questions? {' '}
          <Link href="/help" className="text-emerald-600 hover:underline font-medium">
            Visit our Help Center
          </Link>
        </p>
      </div>
    </main>
  );
}
