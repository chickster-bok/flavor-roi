'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChefHat, PartyPopper, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function SubscribeSuccessPage() {
  const router = useRouter();
  const { user, checkSubscription } = useAuth();

  useEffect(() => {
    // Refresh subscription status
    checkSubscription();
  }, [checkSubscription]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <Card className="w-full max-w-sm text-center overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-500 to-amber-500 p-6">
          <div className="w-20 h-20 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
            <PartyPopper className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Welcome, Chef!</h1>
        </div>

        <CardContent className="pt-6 pb-8 space-y-4">
          <p className="text-muted-foreground">
            Your subscription is now active. Time to upgrade your meals!
          </p>

          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 rounded-lg">
            <div className="flex items-center justify-center gap-2 text-emerald-700 dark:text-emerald-400">
              <ChefHat className="w-5 h-5" />
              <span className="font-semibold">Unlimited Scans Unlocked</span>
            </div>
          </div>

          <Link href="/">
            <Button className="w-full h-12 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold mt-4">
              Start Cooking
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
