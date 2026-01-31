'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ChefHat,
  Check,
  Loader2,
  Crown,
  Camera,
  Sparkles,
  TrendingUp,
  ShoppingCart,
} from 'lucide-react';
import Link from 'next/link';

const FEATURES = [
  { icon: Camera, text: 'Unlimited ingredient scans' },
  { icon: Sparkles, text: 'AI-powered recipe matching' },
  { icon: TrendingUp, text: 'Flavor ROI calculations' },
  { icon: ShoppingCart, text: 'Direct cart integration' },
];

export default function SubscribePage() {
  const { user, loading: authLoading, subscription } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.uid,
          userEmail: user.email,
        }),
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start checkout');
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </main>
    );
  }

  // Already subscribed
  if (subscription?.status === 'active') {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
        <Card className="w-full max-w-sm text-center">
          <CardContent className="pt-8 pb-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
              <Crown className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-xl font-bold mb-2">You're a Chef!</h2>
            <p className="text-muted-foreground text-sm mb-6">
              Your subscription is active. Enjoy unlimited flavor upgrades!
            </p>
            <Link href="/">
              <Button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600">
                Start Cooking
              </Button>
            </Link>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-amber-500 p-4 text-white text-center">
          <Badge className="bg-white/20 text-white border-0 mb-2">
            Michelin Star
          </Badge>
          <h1 className="text-2xl font-bold">Gap Chef</h1>
          <p className="text-white/80 text-sm">Unlock your kitchen's potential</p>
        </div>

        <CardHeader className="text-center pb-2">
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-4xl font-bold">$4.99</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <p className="text-xs text-muted-foreground">Cancel anytime</p>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Features */}
          <div className="space-y-3">
            {FEATURES.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="text-sm">{feature.text}</span>
              </div>
            ))}
          </div>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg text-center">
              {error}
            </div>
          )}

          {/* Subscribe Button */}
          <Button
            onClick={handleSubscribe}
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold"
            size="lg"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Crown className="mr-2 h-5 w-5" />
                {user ? 'Subscribe Now' : 'Sign In to Subscribe'}
              </>
            )}
          </Button>

          {/* Back Link */}
          <div className="text-center">
            <Link href="/">
              <Button variant="ghost" size="sm">
                Maybe later
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
